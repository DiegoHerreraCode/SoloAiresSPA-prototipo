import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus } from "lucide-react";
import { AppLayout, Card, Field, Modal, Toolbar, btnPrimary, inputCls } from "@/components/app/AppLayout";
import { inventario, marcas, modelos as seed, nombreMarca } from "@/lib/mock-data";

export const Route = createFileRoute("/modelos")({
  head: () => ({
    meta: [
      { title: "Modelos — Solo Aire SPA" },
      { name: "description", content: "Listado de modelos asociados a cada marca y registro de nuevos modelos del catálogo." },
      { property: "og:title", content: "Modelos — Solo Aire SPA" },
      { property: "og:description", content: "Modelos de compresores, válvulas, equipos e insumos." },
    ],
  }),
  component: ModelosView,
});

function ModelosView() {
  const [lista, setLista] = useState(seed);
  const [q, setQ] = useState("");
  const [marca, setMarca] = useState("");
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState({ marca_id: marcas[0]!.marca_id, nombre: "", descripcion: "" });

  const filtrados = lista.filter(
    (m) => m.nombre.toLowerCase().includes(q.toLowerCase()) && (!marca || m.marca_id === Number(marca)),
  );

  return (
    <AppLayout
      title="Modelos"
      description="modelos · modelo_id, marca_id, nombre, descripcion"
      actions={
        <button className={btnPrimary} onClick={() => setOpen(true)}>
          <Plus className="h-4 w-4" /> Registrar modelo
        </button>
      }
    >
      <Card className="overflow-hidden">
        <Toolbar>
          <Field label="Buscar modelo">
            <input className={`${inputCls} w-56`} value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar…" />
          </Field>
          <Field label="Marca">
            <select className={`${inputCls} w-48`} value={marca} onChange={(e) => setMarca(e.target.value)}>
              <option value="">Todas las marcas</option>
              {marcas.map((m) => (
                <option key={m.marca_id} value={m.marca_id}>
                  {m.nombre}
                </option>
              ))}
            </select>
          </Field>
          <span className="ml-auto text-xs text-muted-foreground/80 font-medium">{filtrados.length} modelos</span>
        </Toolbar>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-[11px] font-medium text-muted-foreground/80 bg-muted/10 border-b border-border/40">
              <tr>
                <th className="px-5 py-3 text-left">ID</th>
                <th className="px-5 py-3 text-left">Marca</th>
                <th className="px-5 py-3 text-left">Modelo</th>
                <th className="px-5 py-3 text-left">Descripción</th>
                <th className="px-5 py-3 text-right">Ítems en inventario</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {filtrados.map((m) => (
                <tr key={m.modelo_id} className="hover:bg-muted/40 transition-colors">
                  <td className="px-5 py-3.5 font-mono text-xs text-muted-foreground">#{m.modelo_id}</td>
                  <td className="px-5 py-3.5 text-xs font-medium text-foreground">{nombreMarca(m.marca_id)}</td>
                  <td className="px-5 py-3.5 font-medium text-foreground">{m.nombre}</td>
                  <td className="px-5 py-3.5 text-xs text-muted-foreground">{m.descripcion}</td>
                  <td className="px-5 py-3.5 text-right font-medium tabular-nums text-foreground">
                    {inventario.filter((i) => i.modelo_id === m.modelo_id).length}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal open={open} onClose={() => setOpen(false)} title="Registrar modelo">
        <div className="grid gap-3">
          <Field label="marca_id">
            <select
              className={inputCls}
              value={draft.marca_id}
              onChange={(e) => setDraft({ ...draft, marca_id: Number(e.target.value) })}
            >
              {marcas.map((m) => (
                <option key={m.marca_id} value={m.marca_id}>
                  {m.nombre}
                </option>
              ))}
            </select>
          </Field>
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
              setLista([...lista, { modelo_id: Math.max(...lista.map((m) => m.modelo_id)) + 1, ...draft }]);
              setDraft({ marca_id: marcas[0]!.marca_id, nombre: "", descripcion: "" });
              setOpen(false);
            }}
          >
            Guardar modelo
          </button>
        </div>
      </Modal>
    </AppLayout>
  );
}
