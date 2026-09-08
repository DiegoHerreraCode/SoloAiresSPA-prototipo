import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AppLayout, Card, btnGhost } from "@/components/app/AppLayout";
import { StatusPill } from "@/components/app/StatusPill";
import {
  actividadServicios,
  clp,
  inventario,
  nombreCliente,
  nombreTipoServicio,
  reparaciones,
  servicios_clientes,
  compras,
} from "@/lib/mock-data";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard ejecutivo — Solo Aire SPA" },
      { name: "description", content: "Resumen ejecutivo de ingresos, reparaciones activas, deudas con proveedores y alertas de stock." },
      { property: "og:title", content: "Dashboard ejecutivo — Solo Aire SPA" },
      { property: "og:description", content: "Indicadores clave de operación y servicios de Solo Aire SPA." },
    ],
  }),
  component: Dashboard,
});

function Metric({ label, value, hint, badge }: { label: string; value: string; hint?: string; badge?: string }) {
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-muted-foreground/80">{label}</p>
        {badge && (
          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
            {badge}
          </span>
        )}
      </div>
      <p className="mt-2 text-2xl font-semibold tracking-tight text-foreground">{value}</p>
      {hint && <p className="mt-1 text-[11px] text-muted-foreground/70 font-normal">{hint}</p>}
    </Card>
  );
}

function Dashboard() {
  const ahora = new Date();
  const anioMesActual = ahora.toISOString().slice(0, 7); // "YYYY-MM"
  const nombreMesActual = ahora.toLocaleDateString("es-CL", { month: "long" });
  const nombreMesCap = nombreMesActual.charAt(0).toUpperCase() + nombreMesActual.slice(1);

  // Ingresos totales del mes actual
  const ingresosMesActual = servicios_clientes
    .filter((s) => s.fecha.startsWith(anioMesActual))
    .reduce((s, x) => s + x.monto_total, 0);

  const activas = reparaciones.filter((r) => r.estado !== "finalizada").length;
  const deuda = compras.reduce((s, c) => s + c.monto_pendiente, 0);
  const bajoStock = inventario.filter((i) => i.cantidad_total <= i.stock_minimo);

  return (
    <AppLayout
      title="Dashboard ejecutivo"
      description="Resumen operativo y comercial en tiempo real"
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Metric
          label={`Ingresos del mes (${nombreMesCap})`}
          value={clp(ingresosMesActual)}
          hint="Total facturado en el mes en curso"
          badge="Mes actual"
        />
        <Metric label="Reparaciones en taller" value={String(activas)} hint="Trabajos actualmente en proceso" badge="Operaciones" />
        <Metric label="Deuda con proveedores" value={clp(deuda)} hint="Facturas de compra con saldo" badge="Finanzas" />
        <Metric label="Alertas de stock" value={String(bajoStock.length)} hint="Ítems por debajo del mínimo" badge="Inventario" />
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <Card className="p-5 lg:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold tracking-tight">Actividad por tipo de servicio</p>
              <p className="text-xs text-muted-foreground mt-0.5">Distribución de servicios ejecutados</p>
            </div>
            <span className="text-xs font-medium text-primary bg-primary/10 px-2.5 py-1 rounded-full">
              Último período
            </span>
          </div>
          <div className="mt-6 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={actividadServicios}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} opacity={0.4} />
                <XAxis dataKey="tipo" tickLine={false} axisLine={false} fontSize={12} stroke="var(--color-muted-foreground)" />
                <YAxis tickLine={false} axisLine={false} fontSize={12} width={28} stroke="var(--color-muted-foreground)" />
                <Tooltip
                  cursor={{ fill: "var(--color-muted)", opacity: 0.3 }}
                  contentStyle={{
                    fontSize: 12,
                    borderRadius: 12,
                    border: "1px solid var(--border)",
                    backgroundColor: "var(--color-card)",
                    color: "var(--color-foreground)",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
                  }}
                />
                <Bar dataKey="cantidad" name="Servicios" fill="var(--primary)" radius={[6, 6, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold tracking-tight">Stock bajo mínimo</p>
              <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold text-amber-600 dark:text-amber-400">
                {bajoStock.length} requeridos
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">Reponer inventario prioritario</p>
            <ul className="mt-4 divide-y divide-border/50 text-sm">
              {bajoStock.map((i) => (
                <li key={i.inventario_id} className="flex items-center justify-between py-2.5">
                  <div className="pr-2">
                    <p className="font-medium text-xs text-foreground truncate max-w-[180px]">{i.nombre}</p>
                    <p className="text-[11px] font-mono text-muted-foreground">{i.sku}</p>
                  </div>
                  <span className="shrink-0 rounded-md bg-amber-500/10 px-2 py-0.5 text-[11px] font-medium text-amber-600 dark:text-amber-400">
                    {i.cantidad_total} / {i.stock_minimo}
                  </span>
                </li>
              ))}
            </ul>
          </div>
          <Link
            to="/inventario"
            className="mt-4 flex items-center justify-center rounded-xl border border-border/60 py-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
          >
            Ver inventario completo
          </Link>
        </Card>
      </div>

      <Card className="overflow-hidden">
        <div className="flex items-center justify-between border-b border-border/50 px-6 py-4 bg-muted/15">
          <div>
            <p className="text-sm font-semibold tracking-tight">Servicios recientes</p>
            <p className="text-xs text-muted-foreground">Últimas transacciones registradas</p>
          </div>
          <Link to="/servicios" className={btnGhost}>
            Ver todos los servicios
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-[11px] font-medium text-muted-foreground/80 bg-muted/10 border-b border-border/40">
              <tr>
                <th className="px-6 py-3 text-left">N° Orden</th>
                <th className="px-6 py-3 text-left">Cliente</th>
                <th className="px-6 py-3 text-left">Tipo</th>
                <th className="px-6 py-3 text-left">Fecha</th>
                <th className="px-6 py-3 text-right">Total</th>
                <th className="px-6 py-3 text-center">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {servicios_clientes.slice(0, 5).map((s) => (
                <tr key={s.servicio_cliente_id} className="hover:bg-muted/40 transition-colors">
                  <td className="px-6 py-3 font-mono text-xs text-muted-foreground">#{s.servicio_cliente_id}</td>
                  <td className="px-6 py-3 font-medium text-foreground">{nombreCliente(s.cliente_id)}</td>
                  <td className="px-6 py-3 text-xs text-muted-foreground">{nombreTipoServicio(s.tipo_servicio_id)}</td>
                  <td className="px-6 py-3 text-xs text-muted-foreground">{s.fecha}</td>
                  <td className="px-6 py-3 text-right font-medium tabular-nums text-foreground">{clp(s.monto_total)}</td>
                  <td className="px-6 py-3 text-center">
                    <StatusPill value={s.estado} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </AppLayout>
  );
}
