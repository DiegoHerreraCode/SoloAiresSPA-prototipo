import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, UserCheck, UserX, Search } from "lucide-react";
import { AppLayout, Card, Field, Modal, Toolbar, btnGhost, btnPrimary, inputCls } from "@/components/app/AppLayout";
import { StatusPill } from "@/components/app/StatusPill";
import { personal as seed } from "@/lib/mock-data";

export const Route = createFileRoute("/personal")({
  head: () => ({
    meta: [
      { title: "Directorio de personal — Solo Aire SPA" },
      { name: "description", content: "Listado de técnicos con datos de contacto, filtros y registro de nuevo personal para taller." },
      { property: "og:title", content: "Directorio de personal — Solo Aire SPA" },
      { property: "og:description", content: "Gestión del equipo técnico y su disponibilidad." },
    ],
  }),
  component: PersonalView,
});

const vacioEmpleado = {
  nombre: "",
  ruc: "",
  correo: "",
  num_tlf: "",
  ubicacion: "Santiago",
  disponible: true,
};

function PersonalView() {
  const [lista, setLista] = useState(seed);
  const [q, setQ] = useState("");
  const [ubicacion, setUbicacion] = useState("");
  const [filtroDisp, setFiltroDisp] = useState("todos");
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(vacioEmpleado);

  const ubicaciones = [...new Set(lista.map((p) => p.ubicacion))];

  const filtrados = lista.filter((p) => {
    if (q && !`${p.nombre} ${p.ruc} ${p.correo}`.toLowerCase().includes(q.toLowerCase())) return false;
    if (ubicacion && p.ubicacion !== ubicacion) return false;
    if (filtroDisp === "disponible" && !p.disponible) return false;
    if (filtroDisp === "ocupado" && p.disponible) return false;
    return true;
  });

  const guardarEmpleado = (e: React.FormEvent) => {
    e.preventDefault();
    const nuevoId = Math.max(0, ...lista.map((p) => p.personal_id)) + 1;
    setLista([...lista, { personal_id: nuevoId, ...draft }]);
    setDraft(vacioEmpleado);
    setOpen(false);
  };

  return (
    <AppLayout
      title="Directorio de personal del taller"
      description="personal · Administración de técnicos, especialistas y disponibilidad de trabajo"
      actions={
        <button className={btnPrimary} onClick={() => setOpen(true)}>
          <Plus className="h-4 w-4" /> Registrar nuevo empleado
        </button>
      }
    >
      <Card>
        <Toolbar>
          <Field label="Buscar técnico (Nombre, RUC o correo)">
            <div className="relative">
              <input
                className={`${inputCls} w-72 pl-8`}
                placeholder="Buscar por nombre, RUC..."
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            </div>
          </Field>

          <Field label="Ubicación / Ciudad">
            <select className={`${inputCls} w-44`} value={ubicacion} onChange={(e) => setUbicacion(e.target.value)}>
              <option value="">Todas las ubicaciones</option>
              {ubicaciones.map((u) => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Disponibilidad">
            <select className={`${inputCls} w-44`} value={filtroDisp} onChange={(e) => setFiltroDisp(e.target.value)}>
              <option value="todos">Todos los estados</option>
              <option value="disponible">Solo disponibles</option>
              <option value="ocupado">Ocupados en taller</option>
            </select>
          </Field>

          <div className="ml-auto text-xs text-muted-foreground">
            <span className="font-semibold text-emerald-600">{lista.filter((p) => p.disponible).length}</span> disponibles de{" "}
            <span className="font-semibold">{lista.length}</span> técnicos
          </div>
        </Toolbar>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-[11px] font-medium text-muted-foreground/80 bg-muted/10 border-b border-border/40">
              <tr>
                <th className="px-5 py-3 text-left">ID</th>
                <th className="px-5 py-3 text-left">Técnico / Especialista</th>
                <th className="px-5 py-3 text-left">RUT</th>
                <th className="px-5 py-3 text-left">Contacto</th>
                <th className="px-5 py-3 text-left">Ubicación</th>
                <th className="px-5 py-3 text-center">Estado</th>
                <th className="px-5 py-3 text-right">Disponibilidad</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {filtrados.map((p) => (
                <tr key={p.personal_id} className="hover:bg-muted/40 transition-colors">
                  <td className="px-5 py-3.5 font-mono text-xs text-muted-foreground">#{p.personal_id}</td>
                  <td className="px-5 py-3.5 font-medium text-foreground">{p.nombre}</td>
                  <td className="px-5 py-3.5 tabular-nums font-mono text-xs text-muted-foreground">{p.ruc}</td>
                  <td className="px-5 py-3.5 text-xs text-muted-foreground">
                    <p>{p.correo}</p>
                    <p className="text-[11px] text-muted-foreground/70">{p.num_tlf}</p>
                  </td>
                  <td className="px-5 py-3.5 text-xs text-muted-foreground">{p.ubicacion}</td>
                  <td className="px-5 py-3.5 text-center">
                    <StatusPill value={p.disponible ? "disponible" : "ocupado"} label={p.disponible ? "Disponible" : "En taller"} />
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <button
                      role="switch"
                      aria-checked={p.disponible}
                      title={p.disponible ? "Marcar como ocupado" : "Marcar como disponible"}
                      onClick={() =>
                        setLista(
                          lista.map((x) => (x.personal_id === p.personal_id ? { ...x, disponible: !x.disponible } : x))
                        )
                      }
                      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors cursor-pointer ${
                        p.disponible ? "bg-emerald-600 dark:bg-emerald-500" : "bg-muted-foreground/30"
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-xs transition-transform ${
                          p.disponible ? "translate-x-4" : "translate-x-0.5"
                        }`}
                      />
                    </button>
                  </td>
                </tr>
              ))}
              {filtrados.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-xs text-muted-foreground">
                    No se encontraron miembros del personal con los filtros seleccionados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Modal para registrar nuevo empleado */}
      <Modal open={open} onClose={() => setOpen(false)} title="Registrar nuevo empleado">
        <form onSubmit={guardarEmpleado} className="space-y-3">
          <Field label="Nombre completo">
            <input
              required
              className={inputCls}
              placeholder="Ej: Sebastián Muñoz"
              value={draft.nombre}
              onChange={(e) => setDraft({ ...draft, nombre: e.target.value })}
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="RUT / RUC">
              <input
                required
                className={inputCls}
                placeholder="Ej: 18.234.567-8"
                value={draft.ruc}
                onChange={(e) => setDraft({ ...draft, ruc: e.target.value })}
              />
            </Field>
            <Field label="Teléfono móvil">
              <input
                required
                className={inputCls}
                placeholder="+56 9 1234 5678"
                value={draft.num_tlf}
                onChange={(e) => setDraft({ ...draft, num_tlf: e.target.value })}
              />
            </Field>
          </div>
          <Field label="Correo electrónico">
            <input
              type="email"
              required
              className={inputCls}
              placeholder="s.munoz@soloaire.cl"
              value={draft.correo}
              onChange={(e) => setDraft({ ...draft, correo: e.target.value })}
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Ubicación / Taller base">
              <input
                required
                className={inputCls}
                placeholder="Santiago"
                value={draft.ubicacion}
                onChange={(e) => setDraft({ ...draft, ubicacion: e.target.value })}
              />
            </Field>
            <Field label="Disponibilidad inicial">
              <select
                className={inputCls}
                value={draft.disponible ? "true" : "false"}
                onChange={(e) => setDraft({ ...draft, disponible: e.target.value === "true" })}
              >
                <option value="true">Disponible</option>
                <option value="false">Ocupado / En labor</option>
              </select>
            </Field>
          </div>

          <div className="mt-5 flex justify-end gap-2 pt-2">
            <button type="button" className={btnGhost} onClick={() => setOpen(false)}>
              Cancelar
            </button>
            <button type="submit" className={btnPrimary}>
              Guardar empleado
            </button>
          </div>
        </form>
      </Modal>
    </AppLayout>
  );
}
