import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus } from "lucide-react";
import { AppLayout, Card, Field, Modal, Toolbar, btnPrimary, inputCls } from "@/components/app/AppLayout";
import { clp, compras, proveedores as seed } from "@/lib/mock-data";

export const Route = createFileRoute("/proveedores")({
  head: () => ({
    meta: [
      { title: "Proveedores — Solo Aire SPA" },
      { name: "description", content: "Listado de proveedores con datos de contacto, deuda pendiente y registro de nuevos proveedores." },
      { property: "og:title", content: "Proveedores — Solo Aire SPA" },
      { property: "og:description", content: "Gestión de proveedores y su deuda asociada." },
    ],
  }),
  component: ProveedoresView,
});

const vacio = { nombre: "", ruc: "", correo: "", num_tlf: "", ubicacion: "" };

function ProveedoresView() {
  const [lista, setLista] = useState(seed);
  const [q, setQ] = useState("");
  const [ubicacion, setUbicacion] = useState("");
  const [conDeuda, setConDeuda] = useState(false);
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(vacio);

  const deuda = (id: number) =>
    compras.filter((c) => c.proveedor_id === id).reduce((s, c) => s + c.monto_pendiente, 0);

  const filtrados = lista.filter(
    (p) =>
      `${p.nombre} ${p.ruc} ${p.correo}`.toLowerCase().includes(q.toLowerCase()) &&
      (!ubicacion || p.ubicacion === ubicacion) &&
      (!conDeuda || deuda(p.proveedor_id) > 0),
  );

  const ubicaciones = [...new Set(lista.map((p) => p.ubicacion))];

  return (
    <AppLayout
      title="Proveedores"
      description="Directorio de proveedores registrados, información de contacto y balance de deuda comercial."
      actions={
        <button className={btnPrimary} onClick={() => setOpen(true)}>
          <Plus className="h-4 w-4" /> Registrar proveedor
        </button>
      }
    >
      <Card className="overflow-hidden">
        <Toolbar>
          <Field label="Buscar">
            <input className={`${inputCls} w-64`} value={q} onChange={(e) => setQ(e.target.value)} placeholder="Nombre, RUT o correo…" />
          </Field>
          <Field label="Ubicación">
            <select className={`${inputCls} w-44`} value={ubicacion} onChange={(e) => setUbicacion(e.target.value)}>
              <option value="">Todas</option>
              {ubicaciones.map((u) => (
                <option key={u}>{u}</option>
              ))}
            </select>
          </Field>
          <label className="flex h-9 items-center gap-2 text-xs font-medium text-muted-foreground hover:text-foreground cursor-pointer transition-colors">
            <input type="checkbox" className="rounded-md border-border accent-primary" checked={conDeuda} onChange={(e) => setConDeuda(e.target.checked)} />
            Solo con deuda pendiente
          </label>
        </Toolbar>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-xs text-muted-foreground bg-muted/40 border-b border-border/60">
              <tr>
                <th className="px-4 py-3 text-left font-medium">ID</th>
                <th className="px-4 py-3 text-left font-medium">Proveedor</th>
                <th className="px-4 py-3 text-left font-medium">RUT / RUC</th>
                <th className="px-4 py-3 text-left font-medium">Correo</th>
                <th className="px-4 py-3 text-left font-medium">Teléfono</th>
                <th className="px-4 py-3 text-left font-medium">Ubicación</th>
                <th className="px-4 py-3 text-right font-medium">Deuda acumulada</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {filtrados.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-xs text-muted-foreground">
                    No se encontraron proveedores coincidentes
                  </td>
                </tr>
              ) : (
                filtrados.map((p) => {
                  const mDeuda = deuda(p.proveedor_id);
                  return (
                    <tr key={p.proveedor_id} className="hover:bg-muted/40 transition-colors">
                      <td className="px-4 py-3 text-xs text-muted-foreground/80 font-mono">#{p.proveedor_id}</td>
                      <td className="px-4 py-3 font-medium text-foreground">{p.nombre}</td>
                      <td className="px-4 py-3 tabular-nums text-xs text-muted-foreground">{p.ruc}</td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">{p.correo}</td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">{p.num_tlf}</td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">{p.ubicacion}</td>
                      <td className={`px-4 py-3 text-right font-medium tabular-nums ${mDeuda > 0 ? "text-amber-600 dark:text-amber-400" : "text-muted-foreground"}`}>
                        {clp(mDeuda)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal open={open} onClose={() => setOpen(false)} title="Registrar nuevo proveedor">
        <div className="grid gap-3.5 sm:grid-cols-2">
          <Field label="Nombre comercial">
            <input className={inputCls} placeholder="Ej. ClimaPro Spa" value={draft.nombre} onChange={(e) => setDraft({ ...draft, nombre: e.target.value })} />
          </Field>
          <Field label="RUT / RUC">
            <input className={inputCls} placeholder="Ej. 76.123.456-7" value={draft.ruc} onChange={(e) => setDraft({ ...draft, ruc: e.target.value })} />
          </Field>
          <Field label="Correo electrónico">
            <input className={inputCls} placeholder="contacto@empresa.cl" value={draft.correo} onChange={(e) => setDraft({ ...draft, correo: e.target.value })} />
          </Field>
          <Field label="Teléfono">
            <input className={inputCls} placeholder="+56 9 8765 4321" value={draft.num_tlf} onChange={(e) => setDraft({ ...draft, num_tlf: e.target.value })} />
          </Field>
          <div className="sm:col-span-2">
            <Field label="Ciudad / Ubicación">
              <input className={inputCls} placeholder="Ej. Santiago Centro" value={draft.ubicacion} onChange={(e) => setDraft({ ...draft, ubicacion: e.target.value })} />
            </Field>
          </div>
        </div>
        <div className="mt-5 flex justify-end">
          <button
            className={btnPrimary}
            disabled={!draft.nombre || !draft.ruc}
            onClick={() => {
              setLista([...lista, { proveedor_id: Math.max(...lista.map((p) => p.proveedor_id)) + 1, ...draft }]);
              setDraft(vacio);
              setOpen(false);
            }}
          >
            Guardar proveedor
          </button>
        </div>
      </Modal>
    </AppLayout>
  );
}
