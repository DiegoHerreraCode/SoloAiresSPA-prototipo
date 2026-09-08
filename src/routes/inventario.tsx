import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { AppLayout, Card, Field, Modal, Toolbar, btnPrimary, inputCls } from "@/components/app/AppLayout";
import { StatusPill } from "@/components/app/StatusPill";
import {
  clp,
  inventario as seed,
  marcas,
  marcaDeModelo,
  modelos,
  nombreModelo,
  type Inventario,
} from "@/lib/mock-data";

export const Route = createFileRoute("/inventario")({
  head: () => ({
    meta: [
      { title: "Gestión de inventario — Solo Aire SPA" },
      { name: "description", content: "Listado completo de la tabla inventario con filtros por tipo, condición, marca y modelo, y registro de nuevos ítems." },
      { property: "og:title", content: "Gestión de inventario — Solo Aire SPA" },
      { property: "og:description", content: "Control de stock, costos y precios de venta por ítem." },
    ],
  }),
  component: InventarioView,
});

const tipos = ["insumo", "compresor", "valvula", "equipo"] as const;
const condiciones = ["nuevo", "usado", "NA"] as const;

const vacio: Inventario = {
  inventario_id: 0,
  modelo_id: 1,
  sku: "",
  nombre: "",
  tipo: "insumo",
  condicion: "NA",
  cantidad_total: 0,
  cantidad_propia: 0,
  cantidad_cliente: 0,
  stock_minimo: 0,
  monto_compra_prom: 0,
  monto_venta_unitario: 0,
  porcentaje_iva: 19,
  porcentaje_ganancia: 40,
};

function InventarioView() {
  const [lista, setLista] = useState<Inventario[]>(seed);
  const [q, setQ] = useState("");
  const [tipo, setTipo] = useState("");
  const [condicion, setCondicion] = useState("");
  const [marca, setMarca] = useState("");
  const [modelo, setModelo] = useState("");
  const [soloBajo, setSoloBajo] = useState(false);
  const [precioMin, setPrecioMin] = useState("");
  const [precioMax, setPrecioMax] = useState("");
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<Inventario>(vacio);

  const modelosFiltrados = marca ? modelos.filter((m) => m.marca_id === Number(marca)) : modelos;

  const filtrados = useMemo(
    () =>
      lista.filter((i) => {
        const mo = modelos.find((m) => m.modelo_id === i.modelo_id);
        if (q && !`${i.sku} ${i.nombre}`.toLowerCase().includes(q.toLowerCase())) return false;
        if (tipo && i.tipo !== tipo) return false;
        if (condicion && i.condicion !== condicion) return false;
        if (marca && mo?.marca_id !== Number(marca)) return false;
        if (modelo && i.modelo_id !== Number(modelo)) return false;
        if (soloBajo && i.cantidad_total > i.stock_minimo) return false;
        if (precioMin && i.monto_venta_unitario < Number(precioMin)) return false;
        if (precioMax && i.monto_venta_unitario > Number(precioMax)) return false;
        return true;
      }),
    [lista, q, tipo, condicion, marca, modelo, soloBajo, precioMin, precioMax],
  );

  const valorTotal = filtrados.reduce((s, i) => s + i.cantidad_total * i.monto_compra_prom, 0);

  const guardar = () => {
    setLista([...lista, { ...draft, inventario_id: Math.max(...lista.map((i) => i.inventario_id)) + 1 }]);
    setDraft(vacio);
    setOpen(false);
  };

  const num = (k: keyof Inventario, label: string) => (
    <Field label={label}>
      <input
        type="number"
        className={inputCls}
        value={draft[k] as number}
        onChange={(e) => setDraft({ ...draft, [k]: Number(e.target.value) })}
      />
    </Field>
  );

  return (
    <AppLayout
      title="Gestión de inventario"
      description={`inventario · ${filtrados.length} registros · valor en stock ${clp(valorTotal)}`}
      actions={
        <button className={btnPrimary} onClick={() => setOpen(true)}>
          <Plus className="h-4 w-4" /> Registrar item
        </button>
      }
    >
      <Card className="overflow-hidden">
        <Toolbar>
          <Field label="Buscar SKU o nombre">
            <input className={`${inputCls} w-56`} value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar…" />
          </Field>
          <Field label="Tipo de ítem">
            <select className={`${inputCls} w-36`} value={tipo} onChange={(e) => setTipo(e.target.value)}>
              <option value="">Todos</option>
              {tipos.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </Field>
          <Field label="Condición">
            <select className={`${inputCls} w-32`} value={condicion} onChange={(e) => setCondicion(e.target.value)}>
              <option value="">Todas</option>
              {condiciones.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </Field>
          <Field label="Marca">
            <select
              className={`${inputCls} w-40`}
              value={marca}
              onChange={(e) => {
                setMarca(e.target.value);
                setModelo("");
              }}
            >
              <option value="">Todas</option>
              {marcas.map((m) => (
                <option key={m.marca_id} value={m.marca_id}>
                  {m.nombre}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Modelo">
            <select className={`${inputCls} w-40`} value={modelo} onChange={(e) => setModelo(e.target.value)}>
              <option value="">Todos</option>
              {modelosFiltrados.map((m) => (
                <option key={m.modelo_id} value={m.modelo_id}>
                  {m.nombre}
                </option>
              ))}
            </select>
          </Field>
          <label className="flex h-9 items-center gap-2 text-xs text-muted-foreground/90 font-medium cursor-pointer">
            <input type="checkbox" checked={soloBajo} onChange={(e) => setSoloBajo(e.target.checked)} className="rounded" />
            Solo stock bajo
          </label>
        </Toolbar>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1350px] text-sm">
            <thead className="text-[11px] font-medium text-muted-foreground/80 bg-muted/10 border-b border-border/40">
              <tr>
                {[
                  "ID",
                  "SKU",
                  "Producto",
                  "Marca",
                  "Modelo",
                  "Tipo",
                  "Condición",
                  "Total",
                  "Propio",
                  "Cliente",
                  "Mínimo",
                  "Costo Compra",
                  "Margen",
                  "Precio Venta",
                  "IVA",
                ].map((h) => (
                  <th key={h} className="whitespace-nowrap px-4 py-3 text-left">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {filtrados.map((i) => (
                <tr key={i.inventario_id} className="hover:bg-muted/40 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">#{i.inventario_id}</td>
                  <td className="whitespace-nowrap px-4 py-3 tabular-nums font-mono text-xs text-foreground/80">{i.sku}</td>
                  <td className="whitespace-nowrap px-4 py-3 font-medium text-foreground">{i.nombre}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-xs text-muted-foreground">{marcaDeModelo(i.modelo_id)}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-xs text-muted-foreground">
                    {nombreModelo(i.modelo_id)}
                  </td>
                  <td className="px-4 py-3">
                    <StatusPill value={i.tipo} />
                  </td>
                  <td className="px-4 py-3">
                    <StatusPill value={i.condicion} />
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums">
                    <span className={i.cantidad_total <= i.stock_minimo ? "font-semibold text-amber-600 dark:text-amber-400" : "text-foreground"}>
                      {i.cantidad_total}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums text-muted-foreground">{i.cantidad_propia}</td>
                  <td className="px-4 py-3 text-right tabular-nums text-muted-foreground">{i.cantidad_cliente}</td>
                  <td className="px-4 py-3 text-right tabular-nums text-muted-foreground">{i.stock_minimo}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-right tabular-nums text-muted-foreground">{clp(i.monto_compra_prom)}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-right tabular-nums font-mono text-emerald-600 dark:text-emerald-400">
                    {i.porcentaje_ganancia != null ? `${i.porcentaje_ganancia}%` : "—"}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-right tabular-nums font-medium text-foreground">{clp(i.monto_venta_unitario)}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-right tabular-nums text-muted-foreground">{i.porcentaje_iva ?? 19}%</td>
                </tr>
              ))}
              {filtrados.length === 0 && (
                <tr>
                  <td colSpan={15} className="py-12 text-center text-xs text-muted-foreground">
                    Sin resultados con los filtros aplicados
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal open={open} onClose={() => setOpen(false)} title="Registrar item de inventario" wide>
        <div className="grid gap-3 sm:grid-cols-3">
          <Field label="sku">
            <input className={inputCls} value={draft.sku} onChange={(e) => setDraft({ ...draft, sku: e.target.value })} />
          </Field>
          <Field label="nombre">
            <input className={inputCls} value={draft.nombre} onChange={(e) => setDraft({ ...draft, nombre: e.target.value })} />
          </Field>
          <Field label="modelo_id">
            <select
              className={inputCls}
              value={draft.modelo_id}
              onChange={(e) => setDraft({ ...draft, modelo_id: Number(e.target.value) })}
            >
              {modelos.map((m) => (
                <option key={m.modelo_id} value={m.modelo_id}>
                  {marcaDeModelo(m.modelo_id)} · {m.nombre}
                </option>
              ))}
            </select>
          </Field>
          <Field label="tipo">
            <select
              className={inputCls}
              value={draft.tipo}
              onChange={(e) => setDraft({ ...draft, tipo: e.target.value as Inventario["tipo"] })}
            >
              {tipos.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </Field>
          <Field label="condicion">
            <select
              className={inputCls}
              value={draft.condicion}
              onChange={(e) => setDraft({ ...draft, condicion: e.target.value as Inventario["condicion"] })}
            >
              {condiciones.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </Field>
          {num("cantidad_total", "cantidad_total")}
          {num("cantidad_propia", "cantidad_propia")}
          {num("cantidad_cliente", "cantidad_cliente")}
          {num("stock_minimo", "stock_minimo")}
          {num("monto_compra_prom", "monto_compra_prom")}
          {num("porcentaje_ganancia", "porcentaje_ganancia (%)")}
          {num("monto_venta_unitario", "monto_venta_unitario")}
          {num("porcentaje_iva", "porcentaje_iva (%)")}
        </div>
        <div className="mt-5 flex justify-end">
          <button className={btnPrimary} onClick={guardar} disabled={!draft.sku || !draft.nombre}>
            Guardar item
          </button>
        </div>
      </Modal>
    </AppLayout>
  );
}
