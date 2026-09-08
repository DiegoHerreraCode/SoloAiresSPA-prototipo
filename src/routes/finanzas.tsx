import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Package,
  Boxes,
  Percent,
  Calendar,
  Award,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AppLayout, Card, Field, inputCls } from "@/components/app/AppLayout";
import {
  actividadServicios,
  clp,
  compras,
  flujoMensual,
  inventario,
  rankingVentas,
  servicios_clientes,
} from "@/lib/mock-data";

export const Route = createFileRoute("/finanzas")({
  head: () => ({
    meta: [
      { title: "Módulo Financiero y Rentabilidad — Solo Aire SPA" },
      { name: "description", content: "Análisis segmentado de ingresos y egresos, margen neto, IVA acumulado de ventas vs compras y caballos ganadores." },
      { property: "og:title", content: "Módulo Financiero y Rentabilidad — Solo Aire SPA" },
      { property: "og:description", content: "Control de rentabilidad, flujo de caja e IVA." },
    ],
  }),
  component: Finanzas,
});

const colores = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)"];

function Finanzas() {
  // Filtro de rango de fechas
  const [fechaDesde, setFechaDesde] = useState("2026-08-01");
  const [fechaHasta, setFechaHasta] = useState("2026-09-30");

  // Filtrado de servicios de clientes según rango de fecha
  const serviciosFiltrados = useMemo(() => {
    return servicios_clientes.filter((s) => {
      if (fechaDesde && s.fecha < fechaDesde) return false;
      if (fechaHasta && s.fecha > fechaHasta) return false;
      return true;
    });
  }, [fechaDesde, fechaHasta]);

  // Filtrado de compras a proveedores según rango de fecha
  const comprasFiltradas = useMemo(() => {
    return compras.filter((c) => {
      if (fechaDesde && c.fecha_compra < fechaDesde) return false;
      if (fechaHasta && c.fecha_compra > fechaHasta) return false;
      return true;
    });
  }, [fechaDesde, fechaHasta]);

  // 1. Ingresos segmentados por tipo
  const ingresosVentas = serviciosFiltrados
    .filter((s) => s.tipo_servicio_id === 1)
    .reduce((sum, s) => sum + s.monto_total, 0);

  const ingresosReparaciones = serviciosFiltrados
    .filter((s) => s.tipo_servicio_id === 2)
    .reduce((sum, s) => sum + s.monto_total, 0);

  const ingresosRecambios = serviciosFiltrados
    .filter((s) => s.tipo_servicio_id === 3)
    .reduce((sum, s) => sum + s.monto_total, 0);

  const ingresosTotales = ingresosVentas + ingresosReparaciones + ingresosRecambios;

  // 2. Egresos segmentados
  const egresosComprasProveedores = comprasFiltradas.reduce((sum, c) => sum + c.monto_total, 0);
  // Estimación de costos operacionales directos en recambios y reparaciones
  const egresosReparaciones = Math.round(ingresosReparaciones * 0.48);
  const egresosRecambios = Math.round(ingresosRecambios * 0.58);
  const egresosTotales = egresosComprasProveedores + egresosReparaciones + egresosRecambios;

  // Rentabilidad neta en el período
  const utilidadNeta = ingresosTotales - egresosTotales;
  const margenNeto = ingresosTotales > 0 ? ((utilidadNeta / ingresosTotales) * 100).toFixed(1) : "0.0";

  // 3. IVA Acumulado en el rango de fechas (IVA ventas - IVA compras)
  const ivaTotalVentas = serviciosFiltrados.reduce((sum, s) => sum + s.monto_iva, 0);
  const ivaTotalCompras = comprasFiltradas.reduce((sum, c) => sum + c.monto_iva, 0);
  const ivaAcumuladoDiferencial = ivaTotalVentas - ivaTotalCompras;

  // 4. Valor total del inventario actual
  const valorTotalInventario = inventario.reduce(
    (sum, i) => sum + i.cantidad_total * i.monto_compra_prom,
    0
  );

  // 5. Caballos ganadores (Insumo más vendido y Repuesto más vendido)
  const insumoMasVendido = rankingVentas.find((r) => r.tipo === "insumo") || rankingVentas[1];
  const repuestoMasVendido = rankingVentas.find((r) => r.tipo !== "insumo") || rankingVentas[0];

  return (
    <AppLayout
      title="Análisis Financiero y Rentabilidad del Negocio"
      description="Supervisión integral de rentabilidad, desglose por línea de negocio, cálculo de IVA diferencial y productos más exitosos."
      actions={
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 rounded-md border border-border bg-card px-3 py-1.5 text-xs shadow-sm">
            <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-muted-foreground">Desde:</span>
            <input
              type="date"
              className="bg-transparent font-medium text-foreground outline-none"
              value={fechaDesde}
              onChange={(e) => setFechaDesde(e.target.value)}
            />
            <span className="text-muted-foreground ml-1">Hasta:</span>
            <input
              type="date"
              className="bg-transparent font-medium text-foreground outline-none"
              value={fechaHasta}
              onChange={(e) => setFechaHasta(e.target.value)}
            />
          </div>
        </div>
      }
    >
      {/* Tarjetas Principales de Alto Nivel */}
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <Card className="p-5">
          <div className="flex items-center justify-between text-muted-foreground/80">
            <p className="text-xs font-medium tracking-tight">Ingresos Totales</p>
            <div className="rounded-xl bg-emerald-500/10 p-2 text-emerald-600 dark:text-emerald-400">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-2.5 text-2xl font-semibold tracking-tight text-foreground">{clp(ingresosTotales)}</p>
          <p className="mt-1 text-[11px] text-muted-foreground/80">
            {serviciosFiltrados.length} operaciones en el período
          </p>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between text-muted-foreground/80">
            <p className="text-xs font-medium tracking-tight">Egresos Totales</p>
            <div className="rounded-xl bg-rose-500/10 p-2 text-rose-600 dark:text-rose-400">
              <TrendingDown className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-2.5 text-2xl font-semibold tracking-tight text-foreground">{clp(egresosTotales)}</p>
          <p className="mt-1 text-[11px] text-muted-foreground/80">Compras a proveedores y costos taller</p>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between text-muted-foreground/80">
            <p className="text-xs font-medium tracking-tight">Margen Operativo</p>
            <div className="rounded-xl bg-primary/10 p-2 text-primary">
              <Percent className="h-4 w-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2 mt-2.5">
            <p className="text-2xl font-semibold tracking-tight text-foreground">{margenNeto}%</p>
            <span className={`text-xs font-medium ${utilidadNeta >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
              {clp(utilidadNeta)} utilidad
            </span>
          </div>
          <p className="mt-1 text-[11px] text-muted-foreground/80">
            {utilidadNeta >= 0 ? "Rendimiento neto positivo" : "Balance en pérdida"}
          </p>
        </Card>

        <Card className="p-5 border-blue-500/20 bg-blue-500/5">
          <div className="flex items-center justify-between text-muted-foreground/80">
            <p className="text-xs font-medium tracking-tight text-blue-700 dark:text-blue-300">
              IVA Acumulado (Período)
            </p>
            <div className="rounded-xl bg-blue-500/10 p-2 text-blue-600 dark:text-blue-400">
              <DollarSign className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-2.5 text-2xl font-semibold tracking-tight text-blue-900 dark:text-blue-100">
            {clp(ivaAcumuladoDiferencial)}
          </p>
          <p className="mt-1 text-[11px] text-muted-foreground/80">
            IVA Ventas ({clp(ivaTotalVentas)}) − Compras ({clp(ivaTotalCompras)})
          </p>
        </Card>
      </div>

      {/* Segmentación detallada de ingresos y egresos */}
      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Card className="p-4 lg:col-span-2">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div>
              <p className="text-sm font-semibold">Desglose Segmentado por Línea de Operación</p>
              <p className="text-xs text-muted-foreground">Ingresos y egresos generados en el rango de fechas</p>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="flex items-center gap-1 font-semibold text-emerald-600">
                <ArrowUpRight className="h-3.5 w-3.5" /> Ingresos
              </span>
              <span className="flex items-center gap-1 font-semibold text-rose-600">
                <ArrowDownRight className="h-3.5 w-3.5" /> Egresos
              </span>
            </div>
          </div>

          <div className="mt-4 space-y-4">
            {/* Ventas directas */}
            <div className="rounded-lg border border-border bg-muted/20 p-3.5">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-sm font-semibold">1. Ventas Directas</span>
                <span className="text-xs font-mono font-bold text-emerald-600">+{clp(ingresosVentas)}</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className="bg-emerald-500 h-2 rounded-full"
                  style={{ width: `${ingresosTotales > 0 ? (ingresosVentas / ingresosTotales) * 100 : 0}%` }}
                />
              </div>
              <p className="mt-1 text-[11px] text-muted-foreground">Facturación directa de repuestos e insumos</p>
            </div>

            {/* Reparaciones */}
            <div className="rounded-lg border border-border bg-muted/20 p-3.5">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-sm font-semibold">2. Reparaciones de Taller</span>
                <div className="text-right">
                  <span className="text-xs font-mono font-bold text-emerald-600">+{clp(ingresosReparaciones)}</span>
                  <span className="text-xs font-mono text-rose-600 ml-3">−{clp(egresosReparaciones)}</span>
                </div>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Mano de obra técnica facturada vs insumos y horas de mecánicos
              </p>
            </div>

            {/* Recambios */}
            <div className="rounded-lg border border-border bg-muted/20 p-3.5">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-sm font-semibold">3. Recambios de Repuestos</span>
                <div className="text-right">
                  <span className="text-xs font-mono font-bold text-emerald-600">+{clp(ingresosRecambios)}</span>
                  <span className="text-xs font-mono text-rose-600 ml-3">−{clp(egresosRecambios)}</span>
                </div>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Cobro diferencial al cliente vs costo del repuesto reacondicionado entregado
              </p>
            </div>

            {/* Compras a Proveedores */}
            <div className="rounded-lg border border-border bg-muted/20 p-3.5">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-sm font-semibold">4. Compras a Proveedores (Abastecimiento)</span>
                <span className="text-xs font-mono font-bold text-rose-600">−{clp(egresosComprasProveedores)}</span>
              </div>
              <p className="text-[11px] text-muted-foreground">
                {comprasFiltradas.length} compras cargadas en el período seleccionado
              </p>
            </div>
          </div>
        </Card>

        {/* Panel lateral: Inventario y "Productos Top" */}
        <div className="space-y-4">
          {/* Valor del Inventario */}
          <Card className="p-4 shadow-sm">
            <div className="flex items-center gap-2 border-b border-border pb-2.5">
              <Boxes className="h-4 w-4 text-primary" />
              <p className="text-sm font-semibold">Valor Total del Inventario</p>
            </div>
            <p className="mt-3 text-2xl font-bold text-foreground tabular-nums">{clp(valorTotalInventario)}</p>
            <p className="text-xs text-muted-foreground mt-1">
              Valorizado a costo promedio de compra ({inventario.reduce((s, i) => s + i.cantidad_total, 0)} unidades en stock)
            </p>
          </Card>

          {/* Productos Top */}
          <Card className="p-4 shadow-sm border-amber-500/30 bg-amber-500/5">
            <div className="flex items-center gap-2 border-b border-border pb-2.5">
              <Award className="h-4 w-4 text-amber-600" />
              <p className="text-sm font-bold text-amber-900 dark:text-amber-200">Productos Top del Negocio</p>
            </div>

            <div className="mt-3 space-y-3">
              <div className="rounded-md border border-border bg-card p-2.5">
                <span className="text-[10px] uppercase font-bold text-muted-foreground">Insumo más vendido:</span>
                <p className="text-xs font-bold text-foreground mt-0.5">{insumoMasVendido.nombre}</p>
                <div className="flex justify-between items-center text-[11px] text-muted-foreground mt-1">
                  <span>{insumoMasVendido.unidades} unid. vendidas</span>
                  <span className="font-semibold text-emerald-600">{clp(insumoMasVendido.ingresos)}</span>
                </div>
              </div>

              <div className="rounded-md border border-border bg-card p-2.5">
                <span className="text-[10px] uppercase font-bold text-muted-foreground">Repuesto líder (mayor margen):</span>
                <p className="text-xs font-bold text-foreground mt-0.5">{repuestoMasVendido.nombre}</p>
                <div className="flex justify-between items-center text-[11px] text-muted-foreground mt-1">
                  <span>{repuestoMasVendido.unidades} unid. vendidas</span>
                  <span className="font-semibold text-emerald-600">{clp(repuestoMasVendido.ingresos)}</span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Gráfico comparativo de flujo histórico */}
      <Card className="mt-4 p-4">
        <p className="text-sm font-semibold">Historial de Flujo Mensual (Ingresos vs Egresos)</p>
        <p className="text-xs text-muted-foreground mb-4">Comportamiento operativo general</p>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={flujoMensual}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="mes" tickLine={false} axisLine={false} fontSize={12} />
              <YAxis
                tickLine={false}
                axisLine={false}
                fontSize={12}
                width={50}
                tickFormatter={(v) => `${v / 1000000}M`}
              />
              <Tooltip
                formatter={(v: number) => clp(v)}
                contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid var(--border)" }}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="ingresos" name="Ingresos" fill="var(--chart-1)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="egresos" name="Egresos" fill="var(--chart-3)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </AppLayout>
  );
}
