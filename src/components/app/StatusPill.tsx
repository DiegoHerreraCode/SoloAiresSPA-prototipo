const map: Record<string, string> = {
  "en proceso": "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  pendiente: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  pendiente_reparacion: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  pagado_parcial: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  finalizado: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  finalizada: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  pagado: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  nuevo: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  disponible: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  reparado: "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20",
  credito: "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20",
  contado: "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20",
  ocupado: "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20",
  usado: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
  compresor: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20",
  valvula: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20",
  equipo: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
  insumo: "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20",
};

export function StatusPill({ value, label }: { value: string; label?: string }) {
  const cls = map[value] ?? "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20";
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-medium tracking-tight ${cls}`}
    >
      {label ?? value.replace(/_/g, " ")}
    </span>
  );
}
