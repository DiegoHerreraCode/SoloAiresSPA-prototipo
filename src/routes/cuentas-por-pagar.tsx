import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { X, Search, Filter, Receipt, Calendar } from "lucide-react";
import { AppLayout, Card, Field, Modal, Toolbar, btnGhost, btnPrimary, inputCls } from "@/components/app/AppLayout";
import { StatusPill } from "@/components/app/StatusPill";
import { clp, compras as seedCompras, nombreProveedor, proveedores, pagos_compras, type Compra } from "@/lib/mock-data";

export const Route = createFileRoute("/cuentas-por-pagar")({
  head: () => ({
    meta: [
      { title: "Cuentas por pagar a proveedores — Solo Aire SPA" },
      { name: "description", content: "Compras a crédito pendientes con montos por pagar, filtros avanzados por proveedor, fechas de vencimiento y registro de abonos." },
      { property: "og:title", content: "Cuentas por pagar a proveedores — Solo Aire SPA" },
      { property: "og:description", content: "Control de deudas y abonos a proveedores." },
    ],
  }),
  component: CuentasPorPagar,
});

function CuentasPorPagar() {
  const [compras, setCompras] = useState<Compra[]>(seedCompras);
  const [modal, setModal] = useState<number | null>(null);
  const [montoAbono, setMontoAbono] = useState(0);
  const [metodoAbono, setMetodoAbono] = useState("transferencia");
  const [refAbono, setRefAbono] = useState("");
  const [compAbono, setCompAbono] = useState("");

  // Opciones de filtrado avanzado
  const [q, setQ] = useState("");
  const [filtroProveedor, setFiltroProveedor] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("todos");
  const [filtroVencimiento, setFiltroVencimiento] = useState("todos"); // 'todos', 'vencidos', 'proximos'
  const [filtroTipoPago, setFiltroTipoPago] = useState("todos");

  const hoy = new Date().toISOString().slice(0, 10);

  const filtradas = compras.filter((c) => {
    if (q && !`${c.num_factura_boleta} ${nombreProveedor(c.proveedor_id)}`.toLowerCase().includes(q.toLowerCase())) return false;
    if (filtroProveedor && c.proveedor_id !== Number(filtroProveedor)) return false;
    if (filtroEstado === "con_saldo" && c.monto_pendiente <= 0) return false;
    if (filtroEstado === "pagado" && c.monto_pendiente > 0) return false;
    if (filtroTipoPago !== "todos" && c.tipo_pago !== filtroTipoPago) return false;

    if (filtroVencimiento === "vencidos") {
      if (!c.fecha_vencimiento || c.fecha_vencimiento >= hoy || c.monto_pendiente <= 0) return false;
    } else if (filtroVencimiento === "proximos") {
      if (!c.fecha_vencimiento || c.fecha_vencimiento < hoy || c.monto_pendiente <= 0) return false;
    }

    return true;
  });

  const compraActiva = compras.find((c) => c.compra_id === modal);
  const deudaTotal = compras.reduce((s, c) => s + c.monto_pendiente, 0);

  const registrarAbono = () => {
    if (!compraActiva || montoAbono <= 0) return;

    const montoEfectivo = Math.min(montoAbono, compraActiva.monto_pendiente);
    compraActiva.monto_pendiente -= montoEfectivo;
    if (compraActiva.monto_pendiente === 0) {
      compraActiva.estado = "pagado";
    }

    pagos_compras.unshift({
      pago_compra_id: Math.max(0, ...pagos_compras.map((p) => p.pago_compra_id)) + 1,
      compra_id: compraActiva.compra_id,
      monto_abonado: montoEfectivo,
      fecha_pago: new Date().toISOString().slice(0, 10),
      metodo_pago: metodoAbono as any,
      num_referencia: refAbono || "TRF-ABONO",
      comprobante: compAbono || `REC-${Math.floor(100 + Math.random() * 900)}`,
    });

    setModal(null);
    alert(`¡Abono de ${clp(montoEfectivo)} registrado correctamente para la compra #${compraActiva.compra_id}!`);
  };

  return (
    <AppLayout
      title="Cuentas por pagar a proveedores"
      description="compras a crédito · Control de vencimientos, deudas activas y registro de abonos"
      actions={
        <div className="rounded-lg border border-border bg-card px-3.5 py-1.5 text-xs shadow-sm">
          Total de deuda pendiente:{" "}
          <span className="font-bold text-base text-amber-600 ml-1">{clp(deudaTotal)}</span>
        </div>
      }
    >
      <Card>
        {/* Barra con múltiples filtros */}
        <Toolbar>
          <Field label="Buscar (Factura o Proveedor)">
            <div className="relative">
              <input
                className={`${inputCls} w-56 pl-8`}
                placeholder="Buscar…"
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            </div>
          </Field>

          <Field label="Filtrar por Proveedor">
            <select
              className={`${inputCls} w-48`}
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

          <Field label="Estado de deuda">
            <select className={`${inputCls} w-40`} value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)}>
              <option value="todos">Todos</option>
              <option value="con_saldo">Solo con deuda pendiente</option>
              <option value="pagado">Completamente pagados</option>
            </select>
          </Field>

          <Field label="Criterio de Vencimiento">
            <select
              className={`${inputCls} w-44`}
              value={filtroVencimiento}
              onChange={(e) => setFiltroVencimiento(e.target.value)}
            >
              <option value="todos">Cualquier fecha</option>
              <option value="vencidos">Deudas vencidas (urgentes)</option>
              <option value="proximos">Por vencer próximamente</option>
            </select>
          </Field>

          <Field label="Condición de compra">
            <select className={`${inputCls} w-36`} value={filtroTipoPago} onChange={(e) => setFiltroTipoPago(e.target.value)}>
              <option value="todos">Todas</option>
              <option value="credito">Crédito</option>
              <option value="contado">Contado</option>
            </select>
          </Field>

          <span className="ml-auto text-xs text-muted-foreground">{filtradas.length} compras encontradas</span>
        </Toolbar>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[950px] text-sm">
            <thead className="text-[11px] font-medium text-muted-foreground/80 bg-muted/10 border-b border-border/40">
              <tr>
                <th className="px-5 py-3 text-left">ID</th>
                <th className="px-5 py-3 text-left">Proveedor</th>
                <th className="px-5 py-3 text-left">N° Factura</th>
                <th className="px-5 py-3 text-center">Tipo</th>
                <th className="px-5 py-3 text-left">Vencimiento</th>
                <th className="px-5 py-3 text-right">Total</th>
                <th className="px-5 py-3 text-right">Saldo pendiente</th>
                <th className="px-5 py-3 text-center">Estado</th>
                <th className="px-5 py-3 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {filtradas.map((c) => {
                const esVencido = c.fecha_vencimiento && c.fecha_vencimiento < hoy && c.monto_pendiente > 0;

                return (
                  <tr key={c.compra_id} className="hover:bg-muted/40 transition-colors">
                    <td className="px-5 py-3.5 font-mono text-xs text-muted-foreground">#{c.compra_id}</td>
                    <td className="px-5 py-3.5 font-medium text-foreground">{nombreProveedor(c.proveedor_id)}</td>
                    <td className="px-5 py-3.5 font-mono text-xs text-foreground/85">{c.num_factura_boleta}</td>
                    <td className="px-5 py-3.5 text-center">
                      <StatusPill value={c.tipo_pago} />
                    </td>
                    <td className="px-5 py-3.5 text-xs">
                      {c.fecha_vencimiento ? (
                        <span className={esVencido ? "font-semibold text-rose-600 dark:text-rose-400" : "text-muted-foreground"}>
                          {c.fecha_vencimiento} {esVencido && "· Vencida"}
                        </span>
                      ) : (
                        <span className="text-muted-foreground/60">—</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-right font-medium tabular-nums text-foreground">{clp(c.monto_total)}</td>
                    <td className="px-5 py-3.5 text-right font-semibold tabular-nums text-amber-600 dark:text-amber-400">
                      {clp(c.monto_pendiente)}
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <StatusPill value={c.estado} />
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      {c.monto_pendiente > 0 ? (
                        <button
                          className={btnPrimary}
                          onClick={() => {
                            setModal(c.compra_id);
                            setMontoAbono(c.monto_pendiente);
                          }}
                        >
                          Abonar
                        </button>
                      ) : (
                        <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">Pagada</span>
                      )}
                    </td>
                  </tr>
                );
              })}
              {filtradas.length === 0 && (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-xs text-muted-foreground">
                    No se encontraron compras o deudas con los filtros seleccionados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Historial de abonos */}
      <Card className="mt-4">
        <div className="border-b border-border px-4 py-3 bg-muted/20">
          <p className="text-sm font-semibold">Historial de abonos realizados (pagos_compras)</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-xs text-muted-foreground">
              <tr className="border-b border-border">
                <th className="px-4 py-2 text-left font-medium">pago_compra_id</th>
                <th className="px-4 py-2 text-left font-medium">Compra asociada</th>
                <th className="px-4 py-2 text-right font-medium">Monto abonado</th>
                <th className="px-4 py-2 text-left font-medium">Fecha de pago</th>
                <th className="px-4 py-2 text-left font-medium">Método de pago</th>
                <th className="px-4 py-2 text-left font-medium">N° Referencia</th>
                <th className="px-4 py-2 text-left font-medium">Comprobante</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {pagos_compras.map((p) => (
                <tr key={p.pago_compra_id} className="hover:bg-muted/60">
                  <td className="px-4 py-2 font-mono text-xs text-muted-foreground">#{p.pago_compra_id}</td>
                  <td className="px-4 py-2 font-mono text-xs">Compra #{p.compra_id}</td>
                  <td className="px-4 py-2 text-right font-semibold tabular-nums text-emerald-600">
                    {clp(p.monto_abonado)}
                  </td>
                  <td className="px-4 py-2 text-muted-foreground">{p.fecha_pago}</td>
                  <td className="px-4 py-2 text-muted-foreground capitalize">{p.metodo_pago}</td>
                  <td className="px-4 py-2 font-mono text-xs text-muted-foreground">{p.num_referencia}</td>
                  <td className="px-4 py-2 font-mono text-xs text-muted-foreground">{p.comprobante}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Modal de abono */}
      {compraActiva && (
        <Modal open={modal !== null} onClose={() => setModal(null)} title={`Abono a compra #${compraActiva.compra_id}`}>
          <div className="space-y-3">
            <div className="rounded-lg bg-muted/40 p-3 border border-border">
              <p className="text-xs text-muted-foreground">Proveedor: <strong className="text-foreground">{nombreProveedor(compraActiva.proveedor_id)}</strong></p>
              <p className="text-xs text-muted-foreground">Factura: <strong className="text-foreground">{compraActiva.num_factura_boleta}</strong></p>
              <p className="text-xs text-muted-foreground mt-1">Saldo adeudado: <strong className="text-amber-600 text-sm font-bold">{clp(compraActiva.monto_pendiente)}</strong></p>
            </div>

            <Field label="Monto a abonar (CLP)">
              <input
                type="number"
                min={1}
                max={compraActiva.monto_pendiente}
                className={inputCls}
                value={montoAbono}
                onChange={(e) => setMontoAbono(Number(e.target.value))}
              />
            </Field>

            <Field label="Método de pago">
              <select className={inputCls} value={metodoAbono} onChange={(e) => setMetodoAbono(e.target.value)}>
                <option value="transferencia">Transferencia bancaria</option>
                <option value="cheque">Cheque</option>
                <option value="efectivo">Efectivo</option>
              </select>
            </Field>

            <Field label="N° de referencia / transferencia">
              <input
                className={inputCls}
                placeholder="Ej: TRF-889012"
                value={refAbono}
                onChange={(e) => setRefAbono(e.target.value)}
              />
            </Field>

            <Field label="N° de comprobante / recibo">
              <input
                className={inputCls}
                placeholder="Ej: REC-9921"
                value={compAbono}
                onChange={(e) => setCompAbono(e.target.value)}
              />
            </Field>

            <div className="flex justify-end gap-2 pt-3">
              <button className={btnGhost} onClick={() => setModal(null)}>
                Cancelar
              </button>
              <button className={btnPrimary} onClick={registrarAbono}>
                Confirmar abono de {clp(montoAbono)}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </AppLayout>
  );
}
