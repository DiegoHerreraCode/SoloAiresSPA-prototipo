import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { ArrowLeft, CheckCircle2, Receipt, CreditCard, DollarSign } from "lucide-react";
import { AppLayout, Card, Field, btnGhost, btnPrimary, inputCls } from "@/components/app/AppLayout";
import { StatusPill } from "@/components/app/StatusPill";
import { clp, nombreCliente, nombreTipoServicio, servicios_clientes } from "@/lib/mock-data";

export const Route = createFileRoute("/pagos")({
  validateSearch: (search: Record<string, unknown>) => ({
    servicio_id: search.servicio_id ? Number(search.servicio_id) : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Registro de pago de cliente — Solo Aire SPA" },
      { name: "description", content: "Confirmación de pago de servicios: método de pago, número de referencia y emisión de comprobante." },
      { property: "og:title", content: "Registro de pago de cliente — Solo Aire SPA" },
      { property: "og:description", content: "Cierre de servicios y registro de pagos." },
    ],
  }),
  component: Pagos,
});

function Pagos() {
  const navigate = useNavigate();
  const search = Route.useSearch();
  const pendientes = servicios_clientes.filter((s) => s.estado === "en proceso");

  const [id, setId] = useState<number>(() => {
    if (search.servicio_id) return search.servicio_id;
    return pendientes[0]?.servicio_cliente_id ?? 0;
  });

  const [metodo, setMetodo] = useState("transferencia");
  const [ref, setRef] = useState("");
  const [comprobante, setComprobante] = useState(`BOL-000${Math.floor(400 + Math.random() * 50)}`);
  const [ok, setOk] = useState(false);

  useEffect(() => {
    if (search.servicio_id) {
      setId(search.servicio_id);
    }
  }, [search.servicio_id]);

  const s = servicios_clientes.find((x) => x.servicio_cliente_id === id);

  const confirmarPago = () => {
    if (!s) return;
    s.estado = "finalizado";
    s.metodo_pago = metodo;
    s.num_referencia = ref || (metodo === "efectivo" ? "EFE-PAGO" : "TRF-RECIBIDA");
    s.comprobante = comprobante;
    s.last_update = new Date().toISOString().slice(0, 10);
    setOk(true);
  };

  return (
    <AppLayout
      title="Registro de pago del cliente"
      description="Cierre de transacción comercial y emisión de comprobante fiscal"
      actions={
        <button
          className={btnGhost}
          onClick={() => navigate({ to: "/servicios" })}
        >
          <ArrowLeft className="h-4 w-4" /> Volver a Servicios
        </button>
      }
    >
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2 overflow-hidden">
          <div className="flex items-center justify-between border-b border-border/40 px-6 py-4 bg-muted/15">
            <div>
              <p className="text-sm font-semibold tracking-tight text-foreground">Servicios pendientes de pago</p>
              <p className="text-xs text-muted-foreground">Selecciona una orden para liquidar</p>
            </div>
            <span className="rounded-full bg-amber-500/10 px-2.5 py-0.5 text-xs font-medium text-amber-600 dark:text-amber-400">
              {pendientes.length} pendientes
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-[11px] font-medium text-muted-foreground/80 bg-muted/10 border-b border-border/40">
                <tr>
                  <th className="px-6 py-3 text-left">N° Orden</th>
                  <th className="px-6 py-3 text-left">Cliente</th>
                  <th className="px-6 py-3 text-left">Operación</th>
                  <th className="px-6 py-3 text-right">Monto Total</th>
                  <th className="px-6 py-3 text-center">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {pendientes.map((p) => (
                  <tr
                    key={p.servicio_cliente_id}
                    onClick={() => {
                      setId(p.servicio_cliente_id);
                      setOk(false);
                    }}
                    className={`cursor-pointer transition-colors ${
                      id === p.servicio_cliente_id
                        ? "bg-primary/10 font-medium"
                        : "hover:bg-muted/40"
                    }`}
                  >
                    <td className="px-6 py-3.5 font-mono text-xs text-muted-foreground">#{p.servicio_cliente_id}</td>
                    <td className="px-6 py-3.5 font-medium text-foreground">{nombreCliente(p.cliente_id)}</td>
                    <td className="px-6 py-3.5 text-xs text-muted-foreground">{nombreTipoServicio(p.tipo_servicio_id)}</td>
                    <td className="px-6 py-3.5 text-right font-semibold tabular-nums text-primary">{clp(p.monto_total)}</td>
                    <td className="px-6 py-3.5 text-center">
                      <StatusPill value={p.estado} />
                    </td>
                  </tr>
                ))}
                {pendientes.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-xs text-muted-foreground">
                      No hay servicios pendientes de pago en este momento.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Panel de registro de pago */}
        <Card className="h-fit p-6 space-y-5">
          <div className="flex items-center gap-2.5 border-b border-border/40 pb-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <CreditCard className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-semibold tracking-tight text-foreground">Confirmar Pago</p>
              <p className="text-xs text-muted-foreground">Emisión de comprobante legal</p>
            </div>
          </div>

          {s ? (
            <>
              <div className="rounded-xl border border-border/50 bg-muted/25 p-3.5 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Servicio:</span>
                  <span className="font-mono font-semibold text-foreground">#{s.servicio_cliente_id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Cliente:</span>
                  <span className="font-medium text-foreground text-right">{nombreCliente(s.cliente_id)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tipo de servicio:</span>
                  <span className="font-medium text-foreground">{nombreTipoServicio(s.tipo_servicio_id)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal neto:</span>
                  <span className="tabular-nums">{clp(s.monto_subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">IVA ({s.porcentaje_iva}%):</span>
                  <span className="tabular-nums">{clp(s.monto_iva)}</span>
                </div>
                <div className="flex justify-between border-t border-border/60 pt-2 text-sm font-semibold text-foreground">
                  <span>Monto total a cobrar:</span>
                  <span className="tabular-nums text-primary">{clp(s.monto_total)}</span>
                </div>
              </div>

              {!ok ? (
                <div className="space-y-3 border-t border-border pt-4">
                  <Field label="Método de pago utilizado">
                    <select className={inputCls} value={metodo} onChange={(e) => setMetodo(e.target.value)}>
                      <option value="transferencia">Transferencia electrónica</option>
                      <option value="efectivo">Efectivo / Caja</option>
                      <option value="cheque">Cheque al día</option>
                      <option value="tarjeta_debito">Tarjeta de Débito</option>
                      <option value="tarjeta_credito">Tarjeta de Crédito</option>
                    </select>
                  </Field>

                  <Field label="N° de referencia / comprobante de transacción">
                    <input
                      className={inputCls}
                      value={ref}
                      onChange={(e) => setRef(e.target.value)}
                      placeholder="Ej: TRF-991823 o N° operación"
                    />
                  </Field>

                  <Field label="N° Boleta / Factura asignada">
                    <input
                      className={inputCls}
                      value={comprobante}
                      onChange={(e) => setComprobante(e.target.value)}
                      placeholder="BOL-0001"
                    />
                  </Field>

                  <button className={`${btnPrimary} w-full py-2.5 font-semibold gap-2`} onClick={confirmarPago}>
                    <CheckCircle2 className="h-4 w-4" /> Confirmar pago y finalizar
                  </button>
                </div>
              ) : (
                <div className="space-y-3 border-t border-border pt-4">
                  <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-center text-emerald-800 dark:text-emerald-300">
                    <CheckCircle2 className="h-6 w-6 mx-auto mb-1 text-emerald-600" />
                    <p className="text-sm font-semibold">¡Pago registrado exitosamente!</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Servicio #{s.servicio_cliente_id} marcado como FINALIZADO.
                    </p>
                    <p className="text-xs font-mono font-semibold mt-1">Comprobante: {s.comprobante}</p>
                  </div>

                  <button
                    className={`${btnGhost} w-full`}
                    onClick={() => navigate({ to: "/servicios" })}
                  >
                    Volver a lista de servicios
                  </button>
                </div>
              )}
            </>
          ) : (
            <p className="py-6 text-center text-xs text-muted-foreground">Selecciona un servicio para registrar el cobro.</p>
          )}
        </Card>
      </div>
    </AppLayout>
  );
}
