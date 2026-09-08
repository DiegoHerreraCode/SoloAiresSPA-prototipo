import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus } from "lucide-react";
import { AppLayout, Card, Field, Modal, Toolbar, btnPrimary, inputCls } from "@/components/app/AppLayout";
import { marcas as seed, modelos } from "@/lib/mock-data";

export const Route = createFileRoute("/marcas")({
  head: () => ({
    meta: [
      { title: "Marcas — Solo Aire SPA" },
      { name: "description", content: "Listado de marcas registradas y alta de nuevas marcas para el catálogo de inventario." },
      { property: "og:title", content: "Marcas — Solo Aire SPA" },
      { property: "og:description", content: "Catálogo de marcas de compresores, válvulas y equipos." },
    ],
  }),
  component: MarcasView,
});

function MarcasView() {
  const [lista, setLista] = useState(seed);
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState({ nombre: "", descripcion: "" });

  const filtradas = lista.filter((m) => m.nombre.toLowerCase().includes(q.toLowerCase()));

  return (
    <AppLayout
      title="Marcas"
      description="marcas · marca_id, nombre, descripcion"
      actions={
        <button className={btnPrimary} onClick={() => setOpen(true)}>
          <Plus className="h-4 w-4" /> Registrar marca
        </button>
      }
    >
      <Card className="overflow-hidden">
        <Toolbar>
          <Field label="Buscar marca">
            <input className={`${inputCls} w-64`} value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar…" />
          </Field>
          <span className="ml-auto text-xs text-muted-foreground/80 font-medium">{filtradas.length} marcas</span>
        </Toolbar>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-[11px] font-medium text-muted-foreground/80 bg-muted/10 border-b border-border/40">
              <tr>
                <th className="px-5 py-3 text-left">ID</th>
                <th className="px-5 py-3 text-left">Marca</th>
                <th className="px-5 py-3 text-left">Descripción</th>
                <th className="px-5 py-3 text-right">Modelos asociados</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {filtradas.map((m) => (
                <tr key={m.marca_id} className="hover:bg-muted/40 transition-colors">
                  <td className="px-5 py-3.5 font-mono text-xs text-muted-foreground">#{m.marca_id}</td>
                  <td className="px-5 py-3.5 font-medium text-foreground">{m.nombre}</td>
                  <td className="px-5 py-3.5 text-xs text-muted-foreground">{m.descripcion}</td>
                  <td className="px-5 py-3.5 text-right font-medium tabular-nums text-foreground">
                    {modelos.filter((mo) => mo.marca_id === m.marca_id).length}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal open={open} onClose={() => setOpen(false)} title="Registrar marca">
        <div className="grid gap-3">
          <Field label="nombre">
            <input className={inputCls} value={draft.nombre} onChange={(e) => setDraft({ ...draft, nombre: e.target.value })} />
          </Field>
          <Field label="descripcion">
            <input
              className={inputCls}
              value={draft.descripcion}
              onChange={(e) => setDraft({ ...draft, descripcion: e.target.value })}
            />
          </Field>
        </div>
        <div className="mt-5 flex justify-end">
          <button
            className={btnPrimary}
            disabled={!draft.nombre}
            onClick={() => {
              setLista([...lista, { marca_id: Math.max(...lista.map((m) => m.marca_id)) + 1, ...draft }]);
              setDraft({ nombre: "", descripcion: "" });
              setOpen(false);
            }}
          >
            Guardar marca
          </button>
        </div>
      </Modal>
    </AppLayout>
  );
}
