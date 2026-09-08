import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Repeat, ShoppingCart, Wrench, X } from "lucide-react";
import { AppLayout, Card, Field, btnGhost, btnPrimary, inputCls } from "@/components/app/AppLayout";
import { clientes as seed } from "@/lib/mock-data";

export const Route = createFileRoute("/clientes")({
  head: () => ({
    meta: [
      { title: "Identificación de cliente — Solo Aire SPA" },
      { name: "description", content: "Busca un cliente por RUC o nombre, regístralo si no existe y selecciona el tipo de servicio." },
      { property: "og:title", content: "Identificación de cliente — Solo Aire SPA" },
      { property: "og:description", content: "Búsqueda de clientes y selección de tipo de servicio." },
    ],
  }),
  component: ClientesView,
});

const tipos = [
  { id: 1, nombre: "Venta", desc: "Venta directa de inventario (POS)", icon: ShoppingCart, to: "/pos" as const },
  { id: 2, nombre: "Reparación", desc: "Ingreso de repuesto del cliente al taller", icon: Wrench, to: "/reparacion" as const },
  { id: 3, nombre: "Recambio", desc: "Intercambio de repuesto por uno de stock", icon: Repeat, to: "/recambio" as const },
];

function ClientesView() {
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [lista, setLista] = useState(seed);
  const [sel, setSel] = useState<number | null>(null);
  const [openModal, setOpenModal] = useState(false);
  const [nuevo, setNuevo] = useState({ nombre: "", ruc: "", correo: "", num_tlf: "", ubicacion: "" });

  const filtrados = lista.filter(
    (c) => c.nombre.toLowerCase().includes(q.toLowerCase()) || c.ruc.toLowerCase().includes(q.toLowerCase()),
  );
  const cliente = lista.find((c) => c.cliente_id === sel);

  return (
    <AppLayout
      title="Identificación de cliente"
      description="Paso 1: Identificar o crear cliente · Paso 2: Seleccionar tipo de operación"
      actions={
        <button className={btnPrimary} onClick={() => setOpenModal(true)}>
          Registrar nuevo cliente
        </button>
      }
    >
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2 overflow-hidden">
          <div className="border-b border-border/40 p-4 bg-muted/15">
            <input
              className={inputCls}
              placeholder="Buscar por RUT, RUC o nombre del cliente…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
          <table className="w-full text-sm">
            <thead className="text-[11px] font-medium text-muted-foreground/80 bg-muted/10 border-b border-border/40">
              <tr>
                <th className="px-5 py-3 text-left">ID</th>
                <th className="px-5 py-3 text-left">Cliente</th>
                <th className="px-5 py-3 text-left">RUT / RUC</th>
                <th className="px-5 py-3 text-left">Teléfono</th>
                <th className="px-5 py-3 text-left">Ubicación</th>
                <th className="px-5 py-3 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {filtrados.map((c) => (
                <tr
                  key={c.cliente_id}
                  className={`transition-colors ${sel === c.cliente_id ? "bg-primary/10 font-medium" : "hover:bg-muted/40"}`}
                >
                  <td className="px-5 py-3.5 font-mono text-xs text-muted-foreground">#{c.cliente_id}</td>
                  <td className="px-5 py-3.5 font-medium text-foreground">{c.nombre}</td>
                  <td className="px-5 py-3.5 font-mono text-xs tabular-nums text-muted-foreground">{c.ruc}</td>
                  <td className="px-5 py-3.5 text-xs text-muted-foreground">{c.num_tlf}</td>
                  <td className="px-5 py-3.5 text-xs text-muted-foreground">{c.ubicacion}</td>
                  <td className="px-5 py-3.5 text-right">
                    <button
                      className={sel === c.cliente_id ? btnPrimary : btnGhost}
                      onClick={() => setSel(c.cliente_id)}
                    >
                      {sel === c.cliente_id ? "Seleccionado" : "Seleccionar"}
                    </button>
                  </td>
                </tr>
              ))}
              {filtrados.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-xs text-muted-foreground">
                    No se encontraron clientes. Puedes registrar uno nuevo con el botón superior.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </Card>

        <div className="space-y-4">
          <Card className="p-5">
            <p className="text-sm font-semibold tracking-tight text-foreground">Cliente seleccionado</p>
            {cliente ? (
              <div className="mt-3 space-y-2 rounded-xl bg-muted/30 p-3.5 border border-border/50 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">ID:</span>
                  <span className="font-mono text-foreground">#{cliente.cliente_id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Razón social:</span>
                  <span className="font-semibold text-foreground text-right">{cliente.nombre}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">RUT:</span>
                  <span className="font-mono text-foreground">{cliente.ruc}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Correo:</span>
                  <span className="text-muted-foreground">{cliente.correo}</span>
                </div>
              </div>
            ) : (
              <p className="mt-3 text-xs text-muted-foreground">
                Selecciona un cliente de la tabla para habilitar las opciones de servicio.
              </p>
            )}
          </Card>

          <div className="space-y-2.5">
            <p className="text-xs font-medium text-muted-foreground/80 px-1">Tipos de Servicio</p>
            {tipos.map((t) => (
              <button
                key={t.id}
                disabled={!cliente}
                onClick={() => navigate({ to: t.to })}
                className="flex w-full items-start gap-3.5 rounded-2xl border border-border/60 bg-card p-4 text-left transition-all duration-150 hover:border-primary/80 hover:shadow-xs disabled:opacity-40 disabled:hover:border-border/60 disabled:hover:shadow-none cursor-pointer"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <t.icon className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground tracking-tight">{t.nombre}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{t.desc}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {openModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
          <div className="w-full max-w-md rounded-lg border border-border bg-background">
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <p className="text-sm font-medium">Registrar nuevo cliente</p>
              <button onClick={() => setOpenModal(false)} className="text-muted-foreground hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            </div>
            <form
              className="space-y-3 p-4"
              onSubmit={(e) => {
                e.preventDefault();
                const id = Math.max(...lista.map((c) => c.cliente_id)) + 1;
                setLista([...lista, { cliente_id: id, ...nuevo }]);
                setSel(id);
                setOpenModal(false);
                setNuevo({ nombre: "", ruc: "", correo: "", num_tlf: "", ubicacion: "" });
              }}
            >
              {(["nombre", "ruc", "correo", "num_tlf", "ubicacion"] as const).map((f) => (
                <Field key={f} label={f}>
                  <input
                    required
                    className={inputCls}
                    value={nuevo[f]}
                    onChange={(e) => setNuevo({ ...nuevo, [f]: e.target.value })}
                  />
                </Field>
              ))}
              <button className={`${btnPrimary} w-full`} type="submit">
                Guardar cliente
              </button>
            </form>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
