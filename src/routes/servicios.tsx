import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, CheckCircle2, Wrench, Receipt } from "lucide-react";
import { AppLayout, Card, btnGhost, btnPrimary, inputCls } from "@/components/app/AppLayout";
import { StatusPill } from "@/components/app/StatusPill";
import { clp, nombreCliente, nombreTipoServicio, servicios_clientes, reparaciones, reparacionesPorServicio } from "@/lib/mock-data";

export const Route = createFileRoute("/servicios")({
  head: () => ({
    meta: [
      { title: "Servicios de clientes — Solo Aire SPA" },
      { name: "description", content: "Tabla general de servicios de clientes con estados, montos y acciones contextuales por tipo de servicio." },
      { property: "og:title", content: "Servicios de clientes — Solo Aire SPA" },
      { property: "og:description", content: "Gestión general de servicios: venta, reparación y recambio." },
    ],
  }),
  component: ServiciosView,
});

function ServiciosView() {
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [estado, setEstado] = useState("todos");
  const [lista, setLista] = useState(servicios_clientes);

  const filas = lista.filter(
    (s) =>
      (estado === "todos" || s.estado === estado) &&
      (nombreCliente(s.cliente_id).toLowerCase().includes(q.toLowerCase()) ||
        String(s.servicio_cliente_id).includes(q)),
  );

  // Helper para verificar si todas las reparaciones asociadas al servicio están finalizadas
  const estaReparacionCompletada = (servicioClienteId: number) => {
    const repIds = reparacionesPorServicio[servicioClienteId] || [];
    if (repIds.length === 0) return true;
    const reps = reparaciones.filter((r) => repIds.includes(r.reparacion_id));
    return reps.length > 0 && reps.every((r) => r.estado === "finalizada");
  };

  return (
    <AppLayout
      title="Tabla general de servicios de clientes"
      description="servicios_clientes · Acciones contextuales según tipo de servicio y avance"
      actions={
        <Link to="/clientes" className={btnPrimary}>
          <Plus className="h-4 w-4" /> Registrar nuevo servicio
        </Link>
      }
    >
      <Card className="overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/40 p-4 bg-muted/15">
          <div className="flex flex-wrap items-center gap-3">
            <input
              className={`${inputCls} w-64`}
              placeholder="Buscar por cliente o ID…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
            <select className={`${inputCls} w-44`} value={estado} onChange={(e) => setEstado(e.target.value)}>
              <option value="todos">Todos los estados</option>
              <option value="en proceso">En proceso</option>
              <option value="finalizado">Finalizado</option>
            </select>
          </div>
          <span className="text-xs text-muted-foreground/80 font-medium">{filas.length} servicios</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[950px] text-sm">
            <thead className="text-[11px] font-medium text-muted-foreground/80 bg-muted/10 border-b border-border/40">
              <tr>
                <th className="px-5 py-3 text-left">ID</th>
                <th className="px-5 py-3 text-left">Cliente</th>
                <th className="px-5 py-3 text-left">Tipo</th>
                <th className="px-5 py-3 text-left">Fecha</th>
                <th className="px-5 py-3 text-left">Entrega</th>
                <th className="px-5 py-3 text-right">Total</th>
                <th className="px-5 py-3 text-center">Estado</th>
                <th className="px-5 py-3 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {filas.map((s) => {
                const esReparacion = s.tipo_servicio_id === 2;
                const reparacionTerminada = s.reparacion_lista || estaReparacionCompletada(s.servicio_cliente_id);

                return (
                  <tr key={s.servicio_cliente_id} className="hover:bg-muted/40 transition-colors">
                    <td className="px-5 py-3.5 font-mono text-xs text-muted-foreground">#{s.servicio_cliente_id}</td>
                    <td className="px-5 py-3.5 font-medium text-foreground">{nombreCliente(s.cliente_id)}</td>
                    <td className="px-5 py-3.5 text-xs text-muted-foreground">{nombreTipoServicio(s.tipo_servicio_id)}</td>
                    <td className="px-5 py-3.5 text-xs text-muted-foreground">{s.fecha}</td>
                    <td className="px-5 py-3.5 text-xs text-muted-foreground">{s.fecha_entrega_reparacion ?? "—"}</td>
                    <td className="px-5 py-3.5 text-right font-medium tabular-nums text-foreground">{clp(s.monto_total)}</td>
                    <td className="px-5 py-3.5 text-center">
                      <StatusPill value={s.estado} />
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      {s.estado === "finalizado" ? (
                        <span className="inline-flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                          <CheckCircle2 className="h-3.5 w-3.5" /> Pagado
                        </span>
                      ) : esReparacion ? (
                        !reparacionTerminada ? (
                          <Link to="/taller" search={{ servicio_id: s.servicio_cliente_id }} className={`${btnGhost} text-amber-600 dark:text-amber-400`}>
                            <Wrench className="h-3.5 w-3.5" /> Taller
                          </Link>
                        ) : (
                          <button
                            className="inline-flex h-8 items-center justify-center gap-1.5 rounded-xl bg-emerald-600 px-3 text-xs font-medium text-white shadow-2xs hover:bg-emerald-700 transition-all cursor-pointer"
                            onClick={() => {
                              navigate({ to: "/pagos", search: { servicio_id: s.servicio_cliente_id } });
                            }}
                          >
                            <Receipt className="h-3.5 w-3.5" /> Finalizar y cobrar
                          </button>
                        )
                      ) : (
                        <button
                          className={btnGhost}
                          onClick={() => {
                            navigate({ to: "/pagos", search: { servicio_id: s.servicio_cliente_id } });
                          }}
                        >
                          <Receipt className="h-3.5 w-3.5" /> Cobrar
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </AppLayout>
  );
}
