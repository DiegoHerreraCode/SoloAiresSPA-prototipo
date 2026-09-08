import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Minus, Plus, Trash2, Search, ShoppingBag } from "lucide-react";
import { AppLayout, Card, Field, btnGhost, btnPrimary, inputCls } from "@/components/app/AppLayout";
import { StatusPill } from "@/components/app/StatusPill";
import {
  IVA,
  clientes,
  clp,
  inventario,
  marcas,
  marcaDeModelo,
  modelos,
  nombreModelo,
  repuestos,
  equipos,
  servicios_clientes,
} from "@/lib/mock-data";

export const Route = createFileRoute("/pos")({
  head: () => ({
    meta: [
      { title: "Venta directa — Solo Aire SPA" },
      { name: "description", content: "Venta directa de inventario con selección de unidad física real por serial y cobro inmediato." },
      { property: "og:title", content: "Venta directa — Solo Aire SPA" },
      { property: "og:description", content: "Punto de venta de repuestos, equipos e insumos." },
    ],
  }),
  component: VentaDirectaComponent,
});

type CartItem = {
  inventario_id: number;
  cantidad: number;
  serial_seleccionado?: string;
  repuesto_o_equipo_id?: number;
};

const tipos = ["insumo", "compresor", "valvula", "equipo"] as const;
const condiciones = ["nuevo", "usado", "NA"] as const;

function VentaDirectaComponent() {
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [tipo, setTipo] = useState("");
  const [condicion, setCondicion] = useState("");
  const [marca, setMarca] = useState("");
  const [modelo, setModelo] = useState("");
  const [clienteId, setClienteId] = useState(clientes[0]!.cliente_id);
  const [cart, setCart] = useState<CartItem[]>([]);

  const modelosFiltrados = marca ? modelos.filter((m) => m.marca_id === Number(marca)) : modelos;

  const items = inventario.filter((i) => {
    // Si ya está seleccionado en el carrito, no volver a mostrar para evitar duplicar la línea
    if (cart.some((c) => c.inventario_id === i.inventario_id)) return false;

    const mo = modelos.find((m) => m.modelo_id === i.modelo_id);
    if (q && !`${i.sku} ${i.nombre}`.toLowerCase().includes(q.toLowerCase())) return false;
    if (tipo && i.tipo !== tipo) return false;
    if (condicion && i.condicion !== condicion) return false;
    if (marca && mo?.marca_id !== Number(marca)) return false;
    if (modelo && i.modelo_id !== Number(modelo)) return false;
    return true;
  });

  // Unidades físicas disponibles para un item de inventario (repuestos o equipos con existe = true)
  const getUnidadesFisicas = (invId: number) => {
    const inv = inventario.find((x) => x.inventario_id === invId);
    if (!inv) return [];
    if (inv.tipo === "equipo") {
      return equipos
        .filter((e) => e.inventario_id === invId && e.existe)
        .map((e) => ({ id: e.equipo_id, serial: e.serial, nombre: e.nombre, tipo: "equipo" }));
    }
    // Compresor o válvula
    return repuestos
      .filter((r) => r.inventario_id === invId && r.existe && !r.propietario)
      .map((r) => ({ id: r.repuesto_id, serial: r.serial, nombre: r.nombre, estado: r.estado, tipo: "repuesto" }));
  };

  const agregarAlCarrito = (invId: number) => {
    const unidades = getUnidadesFisicas(invId);
    const yaEnCarrito = cart.find((c) => c.inventario_id === invId);

    if (unidades.length > 0) {
      // Si requiere serial específico, seleccionar el primer serial disponible no tomado
      const serialesTomados = cart.map((c) => c.serial_seleccionado).filter(Boolean);
      const disponible = unidades.find((u) => !serialesTomados.includes(u.serial));
      if (!disponible) {
        alert("No hay más unidades físicas seriadas disponibles en stock para este modelo.");
        return;
      }
      setCart([
        ...cart,
        {
          inventario_id: invId,
          cantidad: 1,
          serial_seleccionado: disponible.serial,
          repuesto_o_equipo_id: disponible.id,
        },
      ]);
    } else {
      // Insumos u otros items no seriados
      if (yaEnCarrito) {
        setCart(cart.map((c) => (c.inventario_id === invId ? { ...c, cantidad: c.cantidad + 1 } : c)));
      } else {
        setCart([...cart, { inventario_id: invId, cantidad: 1 }]);
      }
    }
  };

  const modificarCantidad = (idx: number, delta: number) => {
    const item = cart[idx];
    if (!item) return;
    if (item.serial_seleccionado) {
      // Item seriado representa exactamente 1 unidad física
      if (delta < 0) {
        setCart(cart.filter((_, i) => i !== idx));
      }
      return;
    }
    const nuevaCant = item.cantidad + delta;
    if (nuevaCant <= 0) {
      setCart(cart.filter((_, i) => i !== idx));
    } else {
      setCart(cart.map((c, i) => (i === idx ? { ...c, cantidad: nuevaCant } : c)));
    }
  };

  const cambiarSerial = (idx: number, nuevoSerial: string) => {
    setCart(cart.map((c, i) => (i === idx ? { ...c, serial_seleccionado: nuevoSerial } : c)));
  };

  const subtotal = cart.reduce((acc, c) => {
    const inv = inventario.find((i) => i.inventario_id === c.inventario_id);
    return acc + c.cantidad * (inv?.monto_venta_unitario || 0);
  }, 0);

  const iva = Math.round((subtotal * IVA) / 100);
  const total = subtotal + iva;

  const procesarVenta = () => {
    const nuevoServicioId = Math.max(0, ...servicios_clientes.map((s) => s.servicio_cliente_id)) + 1;
    const nuevoServicio = {
      servicio_cliente_id: nuevoServicioId,
      tipo_servicio_id: 1, // Venta
      cliente_id: clienteId,
      admin_id: "ADM-001",
      fecha: new Date().toISOString().slice(0, 10),
      monto_subtotal: subtotal,
      porcentaje_iva: IVA,
      monto_iva: iva,
      monto_total: total,
      metodo_pago: null,
      num_referencia: null,
      fecha_entrega_reparacion: null,
      estado: "en proceso" as const,
      comprobante: null,
      last_update: new Date().toISOString().slice(0, 10),
    };

    servicios_clientes.unshift(nuevoServicio);

    // Redirección inmediata a registro de pago obligatorio
    navigate({
      to: "/pagos",
      search: { servicio_id: nuevoServicioId },
    });
  };

  return (
    <AppLayout
      title="Venta directa"
      description="Selecciona cliente, añade artículos y asigna número de serie para cobro inmediato"
    >
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2 overflow-hidden">
          {/* Barra de filtros amigables y relajada */}
          <div className="flex flex-wrap items-end gap-3 border-b border-border/40 p-4 bg-muted/15">
            <Field label="Buscar producto o SKU">
              <div className="relative">
                <input
                  className={`${inputCls} w-52 pl-8.5`}
                  placeholder="Buscar ítem…"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                />
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground/70" />
              </div>
            </Field>

            <Field label="Tipo">
              <select className={`${inputCls} w-32`} value={tipo} onChange={(e) => setTipo(e.target.value)}>
                <option value="">Todos</option>
                {tipos.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Marca">
              <select
                className={`${inputCls} w-36`}
                value={marca}
                onChange={(e) => {
                  setMarca(e.target.value);
                  setModelo("");
                }}
              >
                <option value="">Todas</option>
                {marcas.map((m) => (
                  <option key={m.marca_id} value={m.marca_id}>
                    {m.nombre}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Modelo">
              <select className={`${inputCls} w-36`} value={modelo} onChange={(e) => setModelo(e.target.value)}>
                <option value="">Todos</option>
                {modelosFiltrados.map((m) => (
                  <option key={m.modelo_id} value={m.modelo_id}>
                    {m.nombre}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Condición">
              <select className={`${inputCls} w-32`} value={condicion} onChange={(e) => setCondicion(e.target.value)}>
                <option value="">Todas</option>
                {condiciones.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-[11px] font-medium text-muted-foreground/80 bg-muted/10 border-b border-border/40">
                <tr>
                  <th className="px-5 py-3 text-left">SKU</th>
                  <th className="px-5 py-3 text-left">Producto</th>
                  <th className="px-5 py-3 text-left">Marca / Modelo</th>
                  <th className="px-5 py-3 text-center">Tipo</th>
                  <th className="px-5 py-3 text-right">Disponible</th>
                  <th className="px-5 py-3 text-right">Precio</th>
                  <th className="px-5 py-3 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {items.map((i) => {
                  const unidades = getUnidadesFisicas(i.inventario_id);
                  const esSeriado = unidades.length > 0;

                  return (
                    <tr key={i.inventario_id} className="hover:bg-muted/40 transition-colors">
                      <td className="px-5 py-3.5 tabular-nums font-mono text-xs text-muted-foreground">{i.sku}</td>
                      <td className="px-5 py-3.5 font-medium text-foreground">
                        {i.nombre}
                        {esSeriado && (
                          <span className="ml-2 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
                            Seriado
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-xs text-muted-foreground">
                        {marcaDeModelo(i.modelo_id)} · {nombreModelo(i.modelo_id)}
                      </td>
                      <td className="px-5 py-3.5 text-center">
                        <StatusPill value={i.tipo} />
                      </td>
                      <td className="px-5 py-3.5 text-right tabular-nums">
                        <span className={i.cantidad_propia <= i.stock_minimo ? "font-semibold text-amber-600 dark:text-amber-400" : "text-muted-foreground"}>
                          {i.cantidad_propia} u.
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right font-medium tabular-nums text-foreground">{clp(i.monto_venta_unitario)}</td>
                      <td className="px-5 py-3.5 text-right">
                        <button
                          className={btnPrimary}
                          disabled={i.cantidad_propia <= 0}
                          onClick={() => agregarAlCarrito(i.inventario_id)}
                        >
                          <Plus className="h-3.5 w-3.5" /> Agregar
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Panel del carrito - minimalista y visualmente jerarquizado */}
        <Card className="h-fit p-6 space-y-5">
          <div className="flex items-center gap-2.5 border-b border-border/40 pb-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <ShoppingBag className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-semibold tracking-tight text-foreground">Resumen de Venta</p>
              <p className="text-xs text-muted-foreground">{cart.length} ítems en orden</p>
            </div>
          </div>

          <div>
            <Field label="Cliente que realiza la compra">
              <select
                className={inputCls}
                value={clienteId}
                onChange={(e) => setClienteId(Number(e.target.value))}
              >
                {clientes.map((c) => (
                  <option key={c.cliente_id} value={c.cliente_id}>
                    {c.nombre} ({c.ruc})
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <div>
            <p className="text-xs font-medium text-muted-foreground/80 mb-2">Artículos seleccionados</p>
            <ul className="divide-y divide-border/40 text-sm">
              {cart.map((c, idx) => {
                const inv = inventario.find((i) => i.inventario_id === c.inventario_id)!;
                const unidades = getUnidadesFisicas(c.inventario_id);

                return (
                  <li key={idx} className="py-3 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate font-medium text-foreground text-xs">{inv.nombre}</p>
                        <p className="text-[11px] text-muted-foreground">{clp(inv.monto_venta_unitario)} c/u</p>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {!c.serial_seleccionado && (
                          <>
                            <button className={btnGhost} onClick={() => modificarCantidad(idx, -1)}>
                              <Minus className="h-3 w-3" />
                            </button>
                            <span className="w-6 text-center tabular-nums text-xs font-semibold">{c.cantidad}</span>
                            <button className={btnGhost} onClick={() => modificarCantidad(idx, 1)}>
                              <Plus className="h-3 w-3" />
                            </button>
                          </>
                        )}
                        <button
                          className="rounded-lg p-1.5 text-muted-foreground/70 hover:bg-destructive/10 hover:text-destructive transition-colors ml-1"
                          onClick={() => setCart(cart.filter((_, i) => i !== idx))}
                          title="Quitar ítem"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Selector de unidad física real por serial */}
                    {unidades.length > 0 && (
                      <div className="rounded-xl bg-muted/40 p-2 border border-border/60">
                        <span className="block text-[10px] font-medium text-muted-foreground mb-1">
                          N° de Serie físico asignado:
                        </span>
                        <select
                          className="h-7 w-full rounded-lg border border-border/70 bg-background px-2 text-xs font-mono"
                          value={c.serial_seleccionado}
                          onChange={(e) => cambiarSerial(idx, e.target.value)}
                        >
                          {unidades.map((u) => (
                            <option key={u.id} value={u.serial}>
                              SN: {u.serial} {u.tipo === "repuesto" ? `(${(u as any).estado})` : ""}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </li>
                );
              })}
              {cart.length === 0 && (
                <li className="py-8 text-center text-muted-foreground text-xs">
                  No hay productos en el carrito.
                </li>
              )}
            </ul>
          </div>

          <div className="space-y-2 border-t border-border/50 pt-4 text-xs">
            <div className="flex justify-between text-muted-foreground">
              <span>Subtotal neto</span>
              <span className="tabular-nums font-medium text-foreground">{clp(subtotal)}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>IVA ({IVA}%)</span>
              <span className="tabular-nums font-medium text-foreground">{clp(iva)}</span>
            </div>
            <div className="flex justify-between border-t border-border/40 pt-2 text-base font-bold text-foreground">
              <span>Total a pagar</span>
              <span className="tabular-nums text-primary">{clp(total)}</span>
            </div>
          </div>

          <button
            className={`${btnPrimary} w-full py-2.5 gap-2`}
            disabled={cart.length === 0}
            onClick={procesarVenta}
          >
            Cobrar y pagar al instante
          </button>
        </Card>
      </div>
    </AppLayout>
  );
}
