import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Trash2, Repeat, ArrowRightLeft } from "lucide-react";
import { AppLayout, Card, Field, btnGhost, btnPrimary, inputCls } from "@/components/app/AppLayout";
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
  servicios_clientes,
} from "@/lib/mock-data";

export const Route = createFileRoute("/recambio")({
  head: () => ({
    meta: [
      { title: "Recambio de repuestos — Solo Aire SPA" },
      { name: "description", content: "Registro de recambio con filtros por marca, modelo y condición, costos entrante y saliente, y cobro inmediato." },
      { property: "og:title", content: "Recambio de repuestos — Solo Aire SPA" },
      { property: "og:description", content: "Intercambio de repuestos con control de seriales y montos." },
    ],
  }),
  component: RecambioView,
});

type LineaRecambio = {
  // Repuesto saliente (de stock físico)
  inventario_saliente_id: number;
  repuesto_saliente_id: number;
  costo_saliente: number;
  precio_saliente: number;
  // Repuesto entrante (del cliente que ingresa físicamente a la categoría)
  inventario_entrante_id: number;
  modelo_entrante_id: number;
  serial_entrante: string;
  costo_entrante: number;
  cantidad: number;
};

function RecambioView() {
  const navigate = useNavigate();
  const [clienteId, setClienteId] = useState(clientes[0]!.cliente_id);
  const [lineas, setLineas] = useState<LineaRecambio[]>([]);

  // Filtros para selección del repuesto saliente
  const [filtroMarca, setFiltroMarca] = useState("");
  const [filtroModelo, setFiltroModelo] = useState("");
  const [filtroCondicion, setFiltroCondicion] = useState("");

  const modelosFiltrados = filtroMarca
    ? modelos.filter((m) => m.marca_id === Number(filtroMarca))
    : modelos;

  // Repuestos salientes disponibles filtrados
  const repuestosDisponibles = repuestos.filter((r) => {
    if (r.propietario || !r.existe) return false;
    const inv = inventario.find((i) => i.inventario_id === r.inventario_id);
    if (!inv) return false;
    const mo = modelos.find((m) => m.modelo_id === inv.modelo_id);
    if (filtroMarca && mo?.marca_id !== Number(filtroMarca)) return false;
    if (filtroModelo && inv.modelo_id !== Number(filtroModelo)) return false;
    if (filtroCondicion && inv.condicion !== filtroCondicion) return false;
    return true;
  });

  const primerRepuesto = repuestosDisponibles[0] || repuestos.find((r) => !r.propietario && r.existe);
  const primerInv = inventario.find((i) => i.inventario_id === primerRepuesto?.inventario_id) || inventario[0]!;

  const [draft, setDraft] = useState<LineaRecambio>({
    inventario_saliente_id: primerInv.inventario_id,
    repuesto_saliente_id: primerRepuesto?.repuesto_id || 1,
    costo_saliente: primerRepuesto?.costo_adquisicion || primerInv.monto_compra_prom,
    precio_saliente: primerRepuesto?.monto_venta || primerInv.monto_venta_unitario,
    inventario_entrante_id: primerInv.inventario_id,
    modelo_entrante_id: primerInv.modelo_id,
    serial_entrante: "",
    costo_entrante: 0,
    cantidad: 1,
  });

  const seleccionarRepuestoSaliente = (repId: number) => {
    const rep = repuestos.find((r) => r.repuesto_id === repId);
    if (!rep) return;
    const inv = inventario.find((i) => i.inventario_id === rep.inventario_id) || primerInv;
    setDraft({
      ...draft,
      repuesto_saliente_id: rep.repuesto_id,
      inventario_saliente_id: inv.inventario_id,
      costo_saliente: rep.costo_adquisicion || inv.monto_compra_prom,
      precio_saliente: rep.monto_venta || inv.monto_venta_unitario,
    });
  };

  const seleccionarInventarioEntrante = (invId: number) => {
    const inv = inventario.find((i) => i.inventario_id === invId);
    if (!inv) return;
    setDraft({
      ...draft,
      inventario_entrante_id: inv.inventario_id,
      modelo_entrante_id: inv.modelo_id,
    });
  };

  const subtotal = lineas.reduce((s, l) => s + l.cantidad * l.precio_saliente, 0);
  const iva = Math.round((subtotal * IVA) / 100);
  const total = subtotal + iva;

  const registrarRecambio = () => {
    const nuevoServicioId = Math.max(0, ...servicios_clientes.map((s) => s.servicio_cliente_id)) + 1;
    const nuevoServicio = {
      servicio_cliente_id: nuevoServicioId,
      tipo_servicio_id: 3, // Recambio
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

    // Redirección inmediata al registro de pago
    navigate({
      to: "/pagos",
      search: { servicio_id: nuevoServicioId },
    });
  };

  return (
    <AppLayout
      title="Recambio de repuestos"
      description="Intercambio de piezas: egreso de repuesto de stock e ingreso de repuesto físico usado del cliente"
    >
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="p-6 lg:col-span-2 space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Cliente que solicita el recambio">
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
            <Field label="Fecha de la operación">
              <input type="date" className={inputCls} defaultValue={new Date().toISOString().slice(0, 10)} />
            </Field>
          </div>

          {/* Sección 1: Filtros y selección de repuesto saliente */}
          <div className="rounded-2xl border border-border/50 bg-muted/20 p-5 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
                <ArrowRightLeft className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">1. Repuesto Saliente (Stock de Solo Aire SPA)</p>
                <p className="text-xs text-muted-foreground">Pieza entregada al cliente</p>
              </div>
            </div>

            {/* Filtros rápidos */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-3">
              <Field label="Filtrar por Marca">
                <select
                  className={inputCls}
                  value={filtroMarca}
                  onChange={(e) => {
                    setFiltroMarca(e.target.value);
                    setFiltroModelo("");
                  }}
                >
                  <option value="">Todas las marcas</option>
                  {marcas.map((m) => (
                    <option key={m.marca_id} value={m.marca_id}>
                      {m.nombre}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Filtrar por Modelo">
                <select
                  className={inputCls}
                  value={filtroModelo}
                  onChange={(e) => setFiltroModelo(e.target.value)}
                >
                  <option value="">Todos los modelos</option>
                  {modelosFiltrados.map((m) => (
                    <option key={m.modelo_id} value={m.modelo_id}>
                      {m.nombre}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Filtrar por Condición">
                <select
                  className={inputCls}
                  value={filtroCondicion}
                  onChange={(e) => setFiltroCondicion(e.target.value)}
                >
                  <option value="">Todas</option>
                  <option value="nuevo">Nuevo</option>
                  <option value="usado">Usado / Reacondicionado</option>
                </select>
              </Field>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="sm:col-span-3">
                <Field label="Seleccionar unidad física saliente (Serial en Stock)">
                  <select
                    className={`${inputCls} font-mono`}
                    value={draft.repuesto_saliente_id}
                    onChange={(e) => seleccionarRepuestoSaliente(Number(e.target.value))}
                  >
                    {repuestosDisponibles.map((r) => {
                      const inv = inventario.find((i) => i.inventario_id === r.inventario_id);
                      return (
                        <option key={r.repuesto_id} value={r.repuesto_id}>
                          #{r.repuesto_id} · {r.serial} — {r.nombre} ({r.estado} - {marcaDeModelo(inv?.modelo_id || 1)})
                        </option>
                      );
                    })}
                  </select>
                </Field>
              </div>

              <Field label="Costo del repuesto saliente (editable)">
                <input
                  type="number"
                  className={inputCls}
                  value={draft.costo_saliente}
                  onChange={(e) => setDraft({ ...draft, costo_saliente: Number(e.target.value) })}
                />
              </Field>

              <Field label="Precio a cobrar al cliente">
                <input
                  type="number"
                  className={inputCls}
                  value={draft.precio_saliente}
                  onChange={(e) => setDraft({ ...draft, precio_saliente: Number(e.target.value) })}
                />
              </Field>

              <Field label="Cantidad">
                <input
                  type="number"
                  min={1}
                  className={inputCls}
                  value={draft.cantidad}
                  onChange={(e) => setDraft({ ...draft, cantidad: Number(e.target.value) })}
                />
              </Field>
            </div>
          </div>

          {/* Sección 2: Repuesto entrante del cliente */}
          <div className="rounded-lg border border-border bg-muted/20 p-4">
            <div className="flex items-center gap-2 mb-3">
              <Repeat className="h-4 w-4 text-emerald-600" />
              <p className="text-sm font-semibold">2. Repuesto Entrante (Entregado por el Cliente)</p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <Field label="Categoría en inventario (Modelo físico)">
                <select
                  className={inputCls}
                  value={draft.inventario_entrante_id}
                  onChange={(e) => seleccionarInventarioEntrante(Number(e.target.value))}
                >
                  {inventario.map((i) => (
                    <option key={i.inventario_id} value={i.inventario_id}>
                      {i.nombre} ({marcaDeModelo(i.modelo_id)} - {nombreModelo(i.modelo_id)})
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Serial único del repuesto entrante">
                <input
                  required
                  className={`${inputCls} font-mono`}
                  placeholder="Ej: CMP-CLI-9948"
                  value={draft.serial_entrante}
                  onChange={(e) => setDraft({ ...draft, serial_entrante: e.target.value })}
                />
              </Field>

              <Field label="Costo de tasación / ingreso entrante">
                <input
                  type="number"
                  min={0}
                  className={inputCls}
                  value={draft.costo_entrante}
                  onChange={(e) => setDraft({ ...draft, costo_entrante: Number(e.target.value) })}
                />
              </Field>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <p className="text-sm text-muted-foreground">
              Total de la línea:{" "}
              <span className="font-bold text-foreground">{clp(draft.cantidad * draft.precio_saliente)}</span>
            </p>
            <button
              className={btnPrimary}
              disabled={!draft.serial_entrante.trim()}
              onClick={() => {
                setLineas([...lineas, draft]);
                setDraft({ ...draft, serial_entrante: "" });
              }}
            >
              Agregar al recambio
            </button>
          </div>
        </Card>

        {/* Resumen lateral */}
        <Card className="p-4 h-fit">
          <p className="text-sm font-semibold border-b border-border pb-2.5">Detalle del Recambio</p>
          <ul className="mt-3 divide-y divide-border text-sm">
            {lineas.map((l, idx) => {
              const invSaliente = inventario.find((i) => i.inventario_id === l.inventario_saliente_id);
              const invEntrante = inventario.find((i) => i.inventario_id === l.inventario_entrante_id);

              return (
                <li key={idx} className="space-y-1 py-2.5">
                  <div className="flex items-start justify-between">
                    <p className="font-medium text-xs">
                      Entrega: <span className="text-blue-600 font-semibold">{invSaliente?.nombre}</span>
                    </p>
                    <button
                      className="text-muted-foreground hover:text-destructive p-0.5"
                      onClick={() => setLineas(lineas.filter((_, i) => i !== idx))}
                      title="Eliminar"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <p className="text-[11px] text-muted-foreground font-mono">
                    Entra: {invEntrante?.nombre} (Serial: {l.serial_entrante || "s/n"})
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    Costo saliente: {clp(l.costo_saliente)} | Costo entrante: {clp(l.costo_entrante)}
                  </p>
                  <div className="flex justify-between items-center text-xs font-semibold pt-1">
                    <span>{l.cantidad} × {clp(l.precio_saliente)}</span>
                    <span className="text-foreground tabular-nums">{clp(l.cantidad * l.precio_saliente)}</span>
                  </div>
                </li>
              );
            })}
            {lineas.length === 0 && (
              <li className="py-6 text-center text-muted-foreground text-xs">
                Agrega al menos una línea de recambio.
              </li>
            )}
          </ul>

          <dl className="mt-4 space-y-1.5 border-t border-border pt-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Subtotal</dt>
              <dd className="tabular-nums font-medium">{clp(subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">IVA ({IVA}%)</dt>
              <dd className="tabular-nums font-medium">{clp(iva)}</dd>
            </div>
            <div className="flex justify-between border-t border-border pt-1.5 text-base font-bold">
              <dt>Total a pagar</dt>
              <dd className="tabular-nums text-primary">{clp(total)}</dd>
            </div>
          </dl>

          <button
            className={`${btnPrimary} mt-4 w-full`}
            disabled={lineas.length === 0}
            onClick={registrarRecambio}
          >
            Registrar recambio y pagar al instante
          </button>
          <p className="mt-2 text-center text-[11px] text-muted-foreground">
            Los recambios deben ser pagados al instante. Se abrirá la vista de pago.
          </p>
        </Card>
      </div>
    </AppLayout>
  );
}
