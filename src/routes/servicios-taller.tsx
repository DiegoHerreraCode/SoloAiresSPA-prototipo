import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Wrench, Search } from "lucide-react";
import { AppLayout, Card, Field, Modal, Toolbar, btnPrimary, inputCls } from "@/components/app/AppLayout";
import { StatusPill } from "@/components/app/StatusPill";
import { clp, servicios_taller as seed, type ServicioTaller } from "@/lib/mock-data";

export const Route = createFileRoute("/servicios-taller")({
  head: () => ({
    meta: [
      { title: "Servicios del taller — Solo Aire SPA" },
      { name: "description", content: "Catálogo maestro de servicios y mano de obra del taller con costos y descripciones." },
      { property: "og:title", content: "Servicios del taller — Solo Aire SPA" },
      { property: "og:description", content: "Gestión de servicios del taller y costos asociados." },
    ],
  }),
  component: ServiciosTallerComponent,
});

const tipos = ["diagnostico", "mecanico", "neumatico", "electrico"] as const;

const vacio: ServicioTaller = {
  servicio_taller_id: 0,
  nombre: "",
  tipo: "mecanico",
  descripcion: "",
  costo: 0,
};

function ServiciosTallerComponent() {
  const [lista, setLista] = useState<ServicioTaller[]>(seed);
  const [q, setQ] = useState("");
  const [tipo, setTipo] = useState("");
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<ServicioTaller>(vacio);

  const filtrados = lista.filter((s) => {
    if (q && !`${s.nombre} ${s.descripcion}`.toLowerCase().includes(q.toLowerCase())) return false;
    if (tipo && s.tipo !== tipo) return false;
    return true;
  });

  const guardar = () => {
    const nuevoId = Math.max(0, ...lista.map((x) => x.servicio_taller_id)) + 1;
    setLista([...lista, { ...draft, servicio_taller_id: nuevoId }]);
    setDraft(vacio);
    setOpen(false);
  };

  return (
    <AppLayout
      title="Gestión de servicios del taller"
      description="servicios_taller · Catálogo de mano de obra y operaciones técnicas"
      actions={
        <button className={btnPrimary} onClick={() => setOpen(true)}>
          <Plus className="h-4 w-4" /> Registrar servicio
        </button>
      }
    >
      <Card className="overflow-hidden">
        <Toolbar>
          <Field label="Buscar servicio o descripción">
            <div className="relative">
              <input
                className={`${inputCls} w-72 pl-8.5`}
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Buscar…"
              />
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground/70" />
            </div>
          </Field>
          <Field label="Tipo de operación">
            <select className={`${inputCls} w-44`} value={tipo} onChange={(e) => setTipo(e.target.value)}>
              <option value="">Todos</option>
              {tipos.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </Field>
          <span className="ml-auto text-xs text-muted-foreground/80 font-medium">{filtrados.length} servicios</span>
        </Toolbar>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-[11px] font-medium text-muted-foreground/80 bg-muted/10 border-b border-border/40">
              <tr>
                <th className="px-5 py-3 text-left">ID</th>
                <th className="px-5 py-3 text-left">Servicio de Taller</th>
                <th className="px-5 py-3 text-center">Tipo</th>
                <th className="px-5 py-3 text-left">Descripción técnica</th>
                <th className="px-5 py-3 text-right">Costo base</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {filtrados.map((s) => (
                <tr key={s.servicio_taller_id} className="hover:bg-muted/40 transition-colors">
                  <td className="px-5 py-3.5 font-mono text-xs text-muted-foreground">#{s.servicio_taller_id}</td>
                  <td className="px-5 py-3.5 font-medium text-foreground flex items-center gap-2.5">
                    <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
                      <Wrench className="h-3 w-3" />
                    </div>
                    {s.nombre}
                  </td>
                  <td className="px-5 py-3.5 text-center">
                    <StatusPill value={s.tipo} />
                  </td>
                  <td className="px-5 py-3.5 text-xs text-muted-foreground max-w-md truncate">{s.descripcion || "—"}</td>
                  <td className="px-5 py-3.5 text-right font-medium tabular-nums text-foreground">{clp(s.costo)}</td>
                </tr>
              ))}
              {filtrados.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-xs text-muted-foreground">
                    No se encontraron servicios del taller con los filtros aplicados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal open={open} onClose={() => setOpen(false)} title="Registrar nuevo servicio del taller">
        <div className="grid gap-3">
          <Field label="Nombre del servicio">
            <input
              required
              className={inputCls}
              placeholder="Ej: Rectificado de cigüeñal"
              value={draft.nombre}
              onChange={(e) => setDraft({ ...draft, nombre: e.target.value })}
            />
          </Field>
          <Field label="Tipo de operación">
            <select
              className={inputCls}
              value={draft.tipo}
              onChange={(e) => setDraft({ ...draft, tipo: e.target.value as ServicioTaller["tipo"] })}
            >
              {tipos.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Descripción de la labor">
            <textarea
              className="min-h-20 w-full rounded-md border border-border bg-background p-3 text-sm outline-none focus:border-primary"
              placeholder="Detalles del procedimiento técnico..."
              value={draft.descripcion}
              onChange={(e) => setDraft({ ...draft, descripcion: e.target.value })}
            />
          </Field>
          <Field label="Costo base sugerido (CLP)">
            <input
              type="number"
              min={0}
              step={1000}
              className={inputCls}
              value={draft.costo}
              onChange={(e) => setDraft({ ...draft, costo: Number(e.target.value) })}
            />
          </Field>
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <button className={btnPrimary} disabled={!draft.nombre || draft.costo <= 0} onClick={guardar}>
            Guardar servicio
          </button>
        </div>
      </Modal>
    </AppLayout>
  );
}
