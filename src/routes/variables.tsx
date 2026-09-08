import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppLayout, Card, Field, btnPrimary, inputCls } from "@/components/app/AppLayout";
import { variables } from "@/lib/mock-data";
import { Sliders, Save, CheckCircle2, DollarSign, Calculator } from "lucide-react";

export const Route = createFileRoute("/variables")({
  head: () => ({
    meta: [
      { title: "Variables del sistema — Solo Aire SPA" },
      { name: "description", content: "Configuración de variables maestras del negocio: margen de ganancia global y método de cálculo de utilidad." },
    ],
  }),
  component: VariablesPage,
});

function VariablesPage() {
  const gananciaVar = variables.find((v) => v.tipo === "porcentaje_ganancia");
  const calcVar = variables.find((v) => v.tipo === "calculo_ganancia");

  const [porcentajeGanancia, setPorcentajeGanancia] = useState<number>(
    Number(gananciaVar?.valor ?? 40)
  );
  const [calculoGanancia, setCalculoGanancia] = useState<"sobre_costo" | "sobre_venta">(
    (calcVar?.valor as "sobre_costo" | "sobre_venta") || "sobre_costo"
  );
  const [saved, setSaved] = useState(false);

  // Simulador
  const [costoSimulado, setCostoSimulado] = useState<number>(100000);
  const [ivaItemSimulado, setIvaItemSimulado] = useState<number>(19);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (gananciaVar) gananciaVar.valor = porcentajeGanancia;
    if (calcVar) calcVar.valor = calculoGanancia;

    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  // Cálculo de simulación con ganancia global y método seleccionado
  let utilidadSimulada = 0;
  let precioNetoSimulado = 0;
  if (calculoGanancia === "sobre_costo") {
    utilidadSimulada = costoSimulado * (porcentajeGanancia / 100);
    precioNetoSimulado = costoSimulado + utilidadSimulada;
  } else {
    const ratio = porcentajeGanancia / 100;
    precioNetoSimulado = ratio < 1 ? costoSimulado / (1 - ratio) : costoSimulado;
    utilidadSimulada = precioNetoSimulado - costoSimulado;
  }
  const ivaSimulado = precioNetoSimulado * (ivaItemSimulado / 100);
  const totalSimulado = precioNetoSimulado + ivaSimulado;

  return (
    <AppLayout
      title="Variables del sistema"
      description="variables · Parámetros globales del negocio (tabla variables). El margen de ganancia rige globalmente; el IVA se especifica por cada registro en la tabla de inventario."
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-6xl">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <div className="p-6">
              <h2 className="text-base font-semibold flex items-center gap-2 mb-1">
                <Sliders className="h-5 w-5 text-primary" />
                Parámetros Globales de Ganancia y Precios
              </h2>
              <p className="text-sm text-muted-foreground mb-6">
                Configure el porcentaje de ganancia general y el método matemático aplicado en el cálculo de precios.
              </p>

              <form onSubmit={handleSave} className="space-y-5">
                <Field label="Porcentaje de Ganancia Global (%)">
                  <div className="relative max-w-xs">
                    <input
                      type="number"
                      min="0"
                      max="1000"
                      step="0.5"
                      className={`${inputCls} pr-8`}
                      value={porcentajeGanancia}
                      onChange={(e) => setPorcentajeGanancia(parseFloat(e.target.value) || 0)}
                      required
                    />
                    <DollarSign className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Margen global deseado aplicado sobre el costo de adquisición de repuestos e insumos.
                  </p>
                </Field>

                <Field label="Método de cálculo de ganancia">
                  <div className="max-w-md">
                    <select
                      className={inputCls}
                      value={calculoGanancia}
                      onChange={(e) => setCalculoGanancia(e.target.value as "sobre_costo" | "sobre_venta")}
                    >
                      <option value="sobre_costo">Sobre el Costo (Markup: Costo + Costo × %)</option>
                      <option value="sobre_venta">Sobre el Precio de Venta (Margen: Costo / (1 - %))</option>
                    </select>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Define la fórmula matemática que determina la utilidad unitaria y precio de venta base.
                  </p>
                </Field>

                <div className="rounded-md border border-border/70 bg-muted/30 p-4 text-xs space-y-1">
                  <p className="font-semibold text-foreground">💡 IVA individualizado por ítem de inventario:</p>
                  <p className="text-muted-foreground">
                    El porcentaje de IVA ya no es un parámetro rígido global. Cada registro en la tabla de inventario posee su propio campo{" "}
                    <code className="bg-muted px-1 py-0.5 rounded font-mono text-foreground font-semibold">porcentaje_iva</code> según el diagrama DER de base de datos, lo que permite manejar ítems exentos (0%) o gravados (19%).
                  </p>
                </div>

                <div className="pt-2">
                  <button type="submit" className={btnPrimary}>
                    {saved ? <CheckCircle2 className="h-4 w-4 text-green-300" /> : <Save className="h-4 w-4" />}
                    {saved ? "Guardado exitosamente" : "Guardar variables"}
                  </button>
                </div>
              </form>
            </div>
          </Card>
        </div>

        <div>
          <Card>
            <div className="p-6 space-y-4">
              <h3 className="text-sm font-semibold flex items-center gap-1.5 border-b pb-2">
                <Calculator className="h-4 w-4 text-primary" />
                Simulador con Ganancia Global
              </h3>
              <p className="text-xs text-muted-foreground">
                Comportamiento de precios aplicando el margen global del {porcentajeGanancia}%:
              </p>

              <Field label="Costo de compra simulado ($)">
                <input
                  type="number"
                  className={inputCls}
                  value={costoSimulado}
                  onChange={(e) => setCostoSimulado(parseFloat(e.target.value) || 0)}
                />
              </Field>

              <Field label="IVA del ítem a simular (%)">
                <input
                  type="number"
                  className={inputCls}
                  value={ivaItemSimulado}
                  onChange={(e) => setIvaItemSimulado(parseFloat(e.target.value) || 0)}
                />
              </Field>

              <div className="space-y-2 pt-2 text-xs border-t">
                <div className="flex justify-between py-1 border-b border-border/50">
                  <span className="text-muted-foreground">Costo base:</span>
                  <span className="font-mono font-medium">${Math.round(costoSimulado).toLocaleString("es-CL")}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-border/50">
                  <span className="text-muted-foreground">
                    Ganancia global ({porcentajeGanancia}% {calculoGanancia === "sobre_costo" ? "markup" : "margen"}):
                  </span>
                  <span className="font-mono font-medium text-emerald-600 dark:text-emerald-400">
                    +${Math.round(utilidadSimulada).toLocaleString("es-CL")}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-border/50">
                  <span className="text-muted-foreground">Precio Neto:</span>
                  <span className="font-mono font-medium">${Math.round(precioNetoSimulado).toLocaleString("es-CL")}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-border/50">
                  <span className="text-muted-foreground">IVA del ítem ({ivaItemSimulado}%):</span>
                  <span className="font-mono font-medium text-amber-600 dark:text-amber-400">
                    +${Math.round(ivaSimulado).toLocaleString("es-CL")}
                  </span>
                </div>
                <div className="flex justify-between pt-2 text-sm font-bold">
                  <span>Precio Venta Final:</span>
                  <span className="font-mono text-primary">${Math.round(totalSimulado).toLocaleString("es-CL")}</span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
