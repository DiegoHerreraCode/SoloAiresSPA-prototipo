import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Trash2, PackagePlus, Search, Building2, Calendar, FileText } from "lucide-react";
import { AppLayout, Card, Field, Modal, Toolbar, btnGhost, btnPrimary, inputCls } from "@/components/app/AppLayout";
import { StatusPill } from "@/components/app/StatusPill";
import {
  IVA,
  clp,
  compras as seedCompras,
  inventario,
  proveedores,
  nombreProveedor,
  repuestos,
  equipos,
  type Compra,
} from "@/lib/mock-data";

export const Route = createFileRoute("/compras")({
  head: () => ({
    meta: [
      { title: "Compras a Proveedores — Solo Aire SPA" },
      { name: "description", content: "Historial de compras realizadas a proveedores y registro de nuevas compras con captura dinámica de seriales según el tipo de ítem." },
      { property: "og:title", content: "Compras a Proveedores — Solo Aire SPA" },
      { property: "og:description", content: "Control de facturación de proveedores y altas de inventario físico." },
    ],
  }),
  component: ComprasComponent,
});

type ItemCompraDraft = {
  inventario_id: number;
  cantidad: number;
  costo_unitario: number;
  // Campos condicionales para ítems que son repuestos o equipos
  seriales: string[]; // Seriales individuales por cada unidad
};

function ComprasComponent() {
  const [listaCompras, setListaCompras] = useState<Compra[]>(seedCompras);

  // Filtros de la tabla principal
  const [q, setQ] = useState("");
  const [filtroProveedor, setFiltroProveedor] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("todos");
  const [filtroTipoPago, setFiltroTipoPago] = useState("todos");

  // Modal para nueva compra
  const [openModal, setOpenModal] = useState(false);
  const [proveedorId, setProveedorId] = useState(proveedores[0]!.proveedor_id);
  const [numFactura, setNumFactura] = useState("");
  const [fechaCompra, setFechaCompra] = useState(new Date().toISOString().slice(0, 10));
  const [tipoPago, setTipoPago] = useState<"contado" | "credito">("credito");
  const [diasCredito, setDiasCredito] = useState(30);
  const [porcAnticipo, setPorcAnticipo] = useState(20);

  const [itemsCompra, setItemsCompra] = useState<ItemCompraDraft[]>([
    {
      inventario_id: inventario[0]!.inventario_id,
      cantidad: 2,
      costo_unitario: inventario[0]!.monto_compra_prom,
      seriales: ["", ""],
    },
  ]);

  const filtradas = listaCompras.filter((c) => {
    if (q && !`${c.num_factura_boleta} ${nombreProveedor(c.proveedor_id)}`.toLowerCase().includes(q.toLowerCase())) return false;
    if (filtroProveedor && c.proveedor_id !== Number(filtroProveedor)) return false;
    if (filtroEstado !== "todos" && c.estado !== filtroEstado) return false;
    if (filtroTipoPago !== "todos" && c.tipo_pago !== filtroTipoPago) return false;
    return true;
  });

  // Helper para saber si un ítem requiere número de serial individual (compresor, válvula, equipo)
  const esItemSeriado = (invId: number) => {
    const inv = inventario.find((i) => i.inventario_id === invId);
    return inv && inv.tipo !== "insumo";
  };

  const agregarLinea = () => {
    const seleccionadosIds = itemsCompra.map((it) => it.inventario_id);
    const disponible = inventario.find((i) => !seleccionadosIds.includes(i.inventario_id));
    if (!disponible) {
      alert("Ya has agregado todos los ítems de inventario disponibles a esta compra.");
      return;
    }
    setItemsCompra([
      ...itemsCompra,
      {
        inventario_id: disponible.inventario_id,
        cantidad: 1,
        costo_unitario: disponible.monto_compra_prom,
        seriales: [""],
      },
    ]);
  };

  const actualizarLinea = (idx: number, campo: keyof ItemCompraDraft, valor: any) => {
    setItemsCompra(
      itemsCompra.map((item, i) => {
        if (i !== idx) return item;
        if (campo === "cantidad") {
          const nuevaCant = Math.max(1, Number(valor));
          // Ajustar array de seriales al tamaño de la cantidad
          const nuevosSeriales = Array.from({ length: nuevaCant }, (_, sIdx) => item.seriales[sIdx] || "");
          return { ...item, cantidad: nuevaCant, seriales: nuevosSeriales };
        }
        if (campo === "inventario_id") {
          const invObj = inventario.find((x) => x.inventario_id === Number(valor))!;
          return {
            ...item,
            inventario_id: invObj.inventario_id,
            costo_unitario: invObj.monto_compra_prom,
          };
        }
        return { ...item, [campo]: valor };
      })
    );
  };

  const actualizarSerialIndividual = (lineaIdx: number, serialIdx: number, valor: string) => {
    setItemsCompra(
      itemsCompra.map((item, i) => {
        if (i !== lineaIdx) return item;
        const nuevos = [...item.seriales];
        nuevos[serialIdx] = valor;
        return { ...item, seriales: nuevos };
      })
    );
  };

  const subtotal = itemsCompra.reduce((sum, item) => sum + item.cantidad * item.costo_unitario, 0);
  const montoIva = Math.round((subtotal * IVA) / 100);
  const total = subtotal + montoIva;
  const pendiente = tipoPago === "contado" ? 0 : Math.round(total * (1 - porcAnticipo / 100));

  const guardarCompra = (e: React.FormEvent) => {
    e.preventDefault();
    if (!numFactura.trim()) return;

    const nuevaCompraId = Math.max(0, ...listaCompras.map((c) => c.compra_id)) + 1;
    const fechaVenc = tipoPago === "credito"
      ? new Date(Date.now() + diasCredito * 86400000).toISOString().slice(0, 10)
      : null;

    const nuevaCompra: Compra = {
      compra_id: nuevaCompraId,
      proveedor_id: proveedorId,
      admin_id: "ADM-001",
      num_factura_boleta: numFactura,
      fecha_compra: fechaCompra,
      tipo_pago: tipoPago,
      dias_credito: tipoPago === "credito" ? diasCredito : 0,
      fecha_vencimiento: fechaVenc,
      estado: pendiente === 0 ? "pagado" : "pagado_parcial",
      subtotal,
      porcentaje_iva: IVA,
      monto_iva: montoIva,
      monto_total: total,
      monto_pendiente: pendiente,
      porc_anticipo: tipoPago === "contado" ? 100 : porcAnticipo,
    };

    // Crear entidades individuales de repuestos o equipos en base a los seriales
    itemsCompra.forEach((item) => {
      const inv = inventario.find((i) => i.inventario_id === item.inventario_id);
      if (!inv) return;
      inv.cantidad_total += item.cantidad;
      inv.cantidad_propia += item.cantidad;

      if (inv.tipo === "equipo") {
        item.seriales.forEach((srl, sIdx) => {
          const serialFinal = srl || `EQ-${Date.now().toString().slice(-4)}-${sIdx + 1}`;
          equipos.push({
            equipo_id: Math.max(0, ...equipos.map((e) => e.equipo_id)) + 1,
            inventario_id: inv.inventario_id,
            detalle_compra_id: nuevaCompraId,
            serial: serialFinal,
            nombre: inv.nombre,
            existe: true,
          });
        });
      } else if (inv.tipo !== "insumo") {
        item.seriales.forEach((srl, sIdx) => {
          const serialFinal = srl || `SN-${inv.sku}-${Date.now().toString().slice(-4)}-${sIdx + 1}`;
          repuestos.push({
            repuesto_id: Math.max(0, ...repuestos.map((r) => r.repuesto_id)) + 1,
            inventario_id: inv.inventario_id,
            detalle_compra_id: nuevaCompraId,
            serial: serialFinal,
            nombre: inv.nombre,
            estado: inv.condicion === "usado" ? "reparado" : "nuevo",
            propietario: false,
            existe: true,
            costo_adquisicion: item.costo_unitario,
            costo_reparacion: 0,
            costo_total: item.costo_unitario,
            monto_venta: inv.monto_venta_unitario,
            utilidad: inv.monto_venta_unitario - item.costo_unitario,
          });
        });
      }
    });

    setListaCompras([nuevaCompra, ...listaCompras]);
    setOpenModal(false);
    setNumFactura("");
    alert(`¡Compra ${numFactura} guardada e inventario actualizado exitosamente!`);
  };

  return (
    <AppLayout
      title="Compras a Proveedores"
      description="compras · Historial de facturas recibidas y registro de compras con ingreso de seriales individuales"
      actions={
        <button className={btnPrimary} onClick={() => setOpenModal(true)}>
          <PackagePlus className="h-4 w-4" /> Registrar nueva compra
        </button>
      }
    >
      <Card className="overflow-hidden">
        <Toolbar>
          <Field label="Buscar factura o proveedor">
            <div className="relative">
              <input
                className={`${inputCls} w-64 pl-8.5`}
                placeholder="Buscar…"
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground/70" />
            </div>
          </Field>

          <Field label="Proveedor">
            <select
              className={`${inputCls} w-52`}
              value={filtroProveedor}
              onChange={(e) => setFiltroProveedor(e.target.value)}
            >
              <option value="">Todos los proveedores</option>
              {proveedores.map((p) => (
                <option key={p.proveedor_id} value={p.proveedor_id}>
                  {p.nombre}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Estado">
            <select className={`${inputCls} w-40`} value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)}>
              <option value="todos">Todos</option>
              <option value="pagado">Pagado</option>
              <option value="pagado_parcial">Con saldo pendiente</option>
            </select>
          </Field>

          <Field label="Condición">
            <select className={`${inputCls} w-36`} value={filtroTipoPago} onChange={(e) => setFiltroTipoPago(e.target.value)}>
              <option value="todos">Todas</option>
              <option value="contado">Contado</option>
              <option value="credito">Crédito</option>
            </select>
          </Field>

          <span className="ml-auto text-xs text-muted-foreground/80 font-medium">{filtradas.length} compras</span>
        </Toolbar>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-[11px] font-medium text-muted-foreground/80 bg-muted/10 border-b border-border/40">
              <tr>
                <th className="px-5 py-3 text-left">ID</th>
                <th className="px-5 py-3 text-left">Proveedor</th>
                <th className="px-5 py-3 text-left">Factura</th>
                <th className="px-5 py-3 text-left">Fecha</th>
                <th className="px-5 py-3 text-center">Tipo</th>
                <th className="px-5 py-3 text-left">Vence</th>
                <th className="px-5 py-3 text-right">Total</th>
                <th className="px-5 py-3 text-right">Saldo</th>
                <th className="px-5 py-3 text-center">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {filtradas.map((c) => (
                <tr key={c.compra_id} className="hover:bg-muted/40 transition-colors">
                  <td className="px-5 py-3.5 font-mono text-xs text-muted-foreground">#{c.compra_id}</td>
                  <td className="px-5 py-3.5 font-medium text-foreground">{nombreProveedor(c.proveedor_id)}</td>
                  <td className="px-5 py-3.5 font-mono text-xs text-foreground/85">{c.num_factura_boleta}</td>
                  <td className="px-5 py-3.5 text-xs text-muted-foreground">{c.fecha_compra}</td>
                  <td className="px-5 py-3.5 text-center">
                    <StatusPill value={c.tipo_pago} />
                  </td>
                  <td className="px-5 py-3.5 text-xs text-muted-foreground">{c.fecha_vencimiento || "—"}</td>
                  <td className="px-5 py-3.5 text-right font-medium tabular-nums text-foreground">{clp(c.monto_total)}</td>
                  <td className="px-5 py-3.5 text-right font-medium tabular-nums text-amber-600 dark:text-amber-400">
                    {c.monto_pendiente > 0 ? clp(c.monto_pendiente) : "—"}
                  </td>
                  <td className="px-5 py-3.5 text-center">
                    <StatusPill value={c.estado} />
                  </td>
                </tr>
              ))}
              {filtradas.length === 0 && (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-xs text-muted-foreground">
                    No se encontraron compras con los filtros seleccionados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Modal: Registrar nueva compra con captura dinámica de seriales */}
      <Modal open={openModal} onClose={() => setOpenModal(false)} title="Registrar compra a proveedor" wide>
        <form onSubmit={guardarCompra} className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-3">
            <Field label="Proveedor">
              <select
                className={inputCls}
                value={proveedorId}
                onChange={(e) => setProveedorId(Number(e.target.value))}
              >
                {proveedores.map((p) => (
                  <option key={p.proveedor_id} value={p.proveedor_id}>
                    {p.nombre} · {p.ruc}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="N° Factura / Boleta">
              <input
                required
                className={`${inputCls} font-mono`}
                placeholder="F-001294"
                value={numFactura}
                onChange={(e) => setNumFactura(e.target.value)}
              />
            </Field>

            <Field label="Fecha de la compra">
              <input
                type="date"
                required
                className={inputCls}
                value={fechaCompra}
                onChange={(e) => setFechaCompra(e.target.value)}
              />
            </Field>

            <Field label="Condición de pago">
              <select
                className={inputCls}
                value={tipoPago}
                onChange={(e) => setTipoPago(e.target.value as "contado" | "credito")}
              >
                <option value="credito">Crédito</option>
                <option value="contado">Contado</option>
              </select>
            </Field>

            {tipoPago === "credito" && (
              <>
                <Field label="Días de crédito">
                  <input
                    type="number"
                    min={1}
                    className={inputCls}
                    value={diasCredito}
                    onChange={(e) => setDiasCredito(Number(e.target.value))}
                  />
                </Field>
                <Field label="% Anticipo pagado">
                  <input
                    type="number"
                    min={0}
                    max={100}
                    className={inputCls}
                    value={porcAnticipo}
                    onChange={(e) => setPorcAnticipo(Number(e.target.value))}
                  />
                </Field>
              </>
            )}
          </div>

          {/* Detalles de ítems con inputs dinámicos de seriales */}
          <div className="border-t border-border pt-4">
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="text-sm font-semibold">Ítems comprados</p>
                <p className="text-xs text-muted-foreground">
                  Para repuestos y equipos se habilitarán inputs específicos para ingresar el serial de cada unidad física.
                </p>
              </div>
              <button type="button" className={btnGhost} onClick={agregarLinea}>
                <Plus className="h-3.5 w-3.5" /> Agregar producto
              </button>
            </div>

            <div className="space-y-3">
              {itemsCompra.map((it, idx) => {
                const inv = inventario.find((i) => i.inventario_id === it.inventario_id);
                const seriado = esItemSeriado(it.inventario_id);

                return (
                  <div key={idx} className="rounded-lg border border-border bg-muted/20 p-3 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-foreground">Línea #{idx + 1}</span>
                      {itemsCompra.length > 1 && (
                        <button
                          type="button"
                          className="text-xs text-muted-foreground hover:text-destructive flex items-center gap-1"
                          onClick={() => setItemsCompra(itemsCompra.filter((_, i) => i !== idx))}
                        >
                          <Trash2 className="h-3.5 w-3.5" /> Quitar
                        </button>
                      )}
                    </div>

                    <div className="grid gap-3 sm:grid-cols-3">
                      <Field label="Producto / Ítem">
                        <select
                          className={inputCls}
                          value={it.inventario_id}
                          onChange={(e) => actualizarLinea(idx, "inventario_id", e.target.value)}
                        >
                          {inventario
                            .filter((i) => i.inventario_id === it.inventario_id || !itemsCompra.some((other, oIdx) => oIdx !== idx && other.inventario_id === i.inventario_id))
                            .map((i) => (
                              <option key={i.inventario_id} value={i.inventario_id}>
                                {i.sku} · {i.nombre} ({i.tipo})
                              </option>
                            ))}
                        </select>
                      </Field>

                      <Field label="Cantidad comprada">
                        <input
                          type="number"
                          min={1}
                          className={inputCls}
                          value={it.cantidad}
                          onChange={(e) => actualizarLinea(idx, "cantidad", e.target.value)}
                        />
                      </Field>

                      <Field label="Costo unitario de compra (neto)">
                        <input
                          type="number"
                          min={0}
                          className={inputCls}
                          value={it.costo_unitario}
                          onChange={(e) => actualizarLinea(idx, "costo_unitario", Number(e.target.value))}
                        />
                      </Field>
                    </div>

                    {/* Inputs dinámicos para seriales si el item es equipo o repuesto */}
                    {seriado && (
                      <div className="rounded border border-primary/20 bg-primary/5 p-2.5 space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-primary">
                            Registro de unidades físicas ({it.cantidad} {it.cantidad === 1 ? "serial" : "seriales"} requeridos):
                          </span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                          {Array.from({ length: it.cantidad }).map((_, sIdx) => (
                            <div key={sIdx}>
                              <label className="text-[10px] text-muted-foreground block mb-0.5">
                                Serial #{sIdx + 1}:
                              </label>
                              <input
                                required
                                className={`${inputCls} font-mono text-xs`}
                                placeholder={`Ej: ${inv?.sku}-SN00${sIdx + 1}`}
                                value={it.seriales[sIdx] || ""}
                                onChange={(e) => actualizarSerialIndividual(idx, sIdx, e.target.value)}
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Resumen de totales */}
          <div className="rounded-lg border border-border bg-card p-3 flex flex-wrap items-center justify-between gap-4 text-xs">
            <div>
              <span className="text-muted-foreground">Subtotal neto:</span>{" "}
              <strong className="text-foreground text-sm font-semibold">{clp(subtotal)}</strong>
            </div>
            <div>
              <span className="text-muted-foreground">IVA ({IVA}%):</span>{" "}
              <strong className="text-foreground text-sm font-semibold">{clp(montoIva)}</strong>
            </div>
            <div>
              <span className="text-muted-foreground">Total factura:</span>{" "}
              <strong className="text-primary text-base font-bold">{clp(total)}</strong>
            </div>
            {tipoPago === "credito" && (
              <div>
                <span className="text-muted-foreground">Saldo por pagar:</span>{" "}
                <strong className="text-amber-600 text-sm font-semibold">{clp(pendiente)}</strong>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" className={btnGhost} onClick={() => setOpenModal(false)}>
              Cancelar
            </button>
            <button type="submit" className={btnPrimary}>
              Guardar compra e ingresar unidades físicas
            </button>
          </div>
        </form>
      </Modal>
    </AppLayout>
  );
}
