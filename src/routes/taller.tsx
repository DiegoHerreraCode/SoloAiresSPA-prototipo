import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Trash2, CheckCircle2, Wrench, Package, Calendar, Users, ArrowLeft, Save } from "lucide-react";
import { AppLayout, Card, Field, btnGhost, btnPrimary, inputCls } from "@/components/app/AppLayout";
import { StatusPill } from "@/components/app/StatusPill";
import {
  clp,
  inventario,
  personal,
  reparaciones,
  reparaciones_insumos,
  reparaciones_servicios,
  repuestos,
  servicios_taller,
  servicios_clientes,
  nombreCliente,
  reparacionesPorServicio,
  type ReparacionServicioTaller,
  type ReparacionInsumo,
} from "@/lib/mock-data";

export const Route = createFileRoute("/taller")({
  validateSearch: (search: Record<string, unknown>) => ({
    servicio_id: search.servicio_id ? Number(search.servicio_id) : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Control de Reparaciones en Taller — Solo Aire SPA" },
      { name: "description", content: "Módulo de ejecución de taller: registro progresivo día a día de insumos y mano de obra con múltiples técnicos." },
      { property: "og:title", content: "Control de Reparaciones en Taller — Solo Aire SPA" },
      { property: "og:description", content: "Asignación de recursos día a día por repuesto de cliente." },
    ],
  }),
  component: TallerComponent,
});

function TallerComponent() {
  const navigate = useNavigate();
  const search = Route.useSearch();

  // Si viene con servicio_id predeterminado, filtramos los repuestos de ese servicio
  const [servicioSeleccionadoId, setServicioSeleccionadoId] = useState<number>(
    search.servicio_id || servicios_clientes.find((s) => s.tipo_servicio_id === 2)?.servicio_cliente_id || 1041
  );

  // Repuestos asociados a este servicio cliente
  const repIdsDelServicio = reparacionesPorServicio[servicioSeleccionadoId] || [reparaciones[0]!.reparacion_id];
  const [reparacionActivaId, setReparacionActivaId] = useState<number>(repIdsDelServicio[0] || 501);

  const rep = reparaciones.find((r) => r.reparacion_id === reparacionActivaId) || reparaciones[0]!;
  const repuesto = repuestos.find((r) => r.repuesto_id === rep.repuesto_id);
  const servicioCliente = servicios_clientes.find((s) => s.servicio_cliente_id === servicioSeleccionadoId);

  // Lista viva de servicios e insumos de esta reparación
  const [serviciosAsignados, setServiciosAsignados] = useState<ReparacionServicioTaller[]>(
    reparaciones_servicios.filter((r) => r.reparacion_id === reparacionActivaId)
  );
  const [insumosConsumidos, setInsumosConsumidos] = useState<ReparacionInsumo[]>(
    reparaciones_insumos.filter((r) => r.reparacion_id === reparacionActivaId)
  );

  // Cambiar de repuesto activo
  const cambiarRepuestoActivo = (nuevaRepId: number) => {
    setReparacionActivaId(nuevaRepId);
    setServiciosAsignados(reparaciones_servicios.filter((r) => r.reparacion_id === nuevaRepId));
    setInsumosConsumidos(reparaciones_insumos.filter((r) => r.reparacion_id === nuevaRepId));
  };

  // Cambiar de servicio cliente
  const cambiarServicioCliente = (sId: number) => {
    setServicioSeleccionadoId(sId);
    const primerRep = reparacionesPorServicio[sId]?.[0] || 501;
    cambiarRepuestoActivo(primerRep);
  };

  const costoServicios = serviciosAsignados.reduce((acc, s) => acc + s.total_linea, 0);
  const costoInsumos = insumosConsumidos.reduce((acc, i) => acc + i.total_linea, 0);
  const costoTotal = costoServicios + costoInsumos;

  // Agregar nuevo servicio de taller
  const agregarServicioLabor = () => {
    const sCat = servicios_taller[0]!;
    const nuevoItem: ReparacionServicioTaller = {
      reparacion_servicio_taller_id: Math.max(0, ...serviciosAsignados.map((s) => s.reparacion_servicio_taller_id)) + 1,
      reparacion_id: reparacionActivaId,
      servicio_taller_id: sCat.servicio_taller_id,
      admin_id: "ADM-001",
      cantidad: 1,
      costo_unitario: sCat.costo,
      total_linea: sCat.costo,
      fecha_registro: new Date().toISOString().slice(0, 10),
      personal_ids: [personal[0]!.personal_id],
    };
    setServiciosAsignados([...serviciosAsignados, nuevoItem]);
  };

  // Agregar nuevo insumo
  const agregarInsumoConsumo = () => {
    const invInsumo = inventario.find((i) => i.tipo === "insumo") || inventario[3]!;
    const nuevoItem: ReparacionInsumo = {
      reparacion_insumo_id: Math.max(0, ...insumosConsumidos.map((i) => i.reparacion_insumo_id)) + 1,
      reparacion_id: reparacionActivaId,
      inventario_id: invInsumo.inventario_id,
      admin_id: "ADM-001",
      cantidad: 1,
      costo_unitario: invInsumo.monto_compra_prom,
      total_linea: invInsumo.monto_compra_prom,
      fecha_registro: new Date().toISOString().slice(0, 10),
    };
    setInsumosConsumidos([...insumosConsumidos, nuevoItem]);
  };

  // Asignar o remover personal de una labor
  const toggleTecnicoEnLabor = (laborIdx: number, pId: number) => {
    setServiciosAsignados(
      serviciosAsignados.map((s, idx) => {
        if (idx !== laborIdx) return s;
        const exists = s.personal_ids.includes(pId);
        const next = exists ? s.personal_ids.filter((id) => id !== pId) : [...s.personal_ids, pId];
        return { ...s, personal_ids: next.length > 0 ? next : [pId] };
      })
    );
  };

  // Guardar avance progresivo de servicios e insumos sin finalizar la reparación
  const guardarAvanceReparacion = () => {
    // 1. Persistir servicios asignados
    // Remover los anteriores de esta reparación y agregar los actuales
    for (let i = reparaciones_servicios.length - 1; i >= 0; i--) {
      if (reparaciones_servicios[i]!.reparacion_id === reparacionActivaId) {
        reparaciones_servicios.splice(i, 1);
      }
    }
    reparaciones_servicios.push(...serviciosAsignados);

    // 2. Persistir insumos consumidos
    for (let i = reparaciones_insumos.length - 1; i >= 0; i--) {
      if (reparaciones_insumos[i]!.reparacion_id === reparacionActivaId) {
        reparaciones_insumos.splice(i, 1);
      }
    }
    reparaciones_insumos.push(...insumosConsumidos);

    // 3. Actualizar costos acumulados en el registro de reparación manteniéndola en proceso/pendiente
    rep.costo_servicios = costoServicios;
    rep.costo_insumos = costoInsumos;
    rep.costo_total = costoTotal;
    if (rep.estado === "pendiente") {
      rep.estado = "en proceso";
    }

    if (repuesto) {
      repuesto.costo_reparacion = costoTotal;
      repuesto.costo_total = costoTotal;
    }

    alert(`¡Avance guardado con éxito para el repuesto #${repuesto?.serial || rep.repuesto_id}! La reparación sigue en curso.`);
  };

  // Finalizar la reparación de este repuesto
  const finalizarReparacionRepuesto = () => {
    guardarAvanceReparacion();

    rep.estado = "finalizada";
    rep.fecha_fin = new Date().toISOString().slice(0, 10);
    rep.costo_servicios = costoServicios;
    rep.costo_insumos = costoInsumos;
    rep.costo_total = costoTotal;

    if (repuesto) {
      repuesto.estado = "reparado";
      repuesto.costo_reparacion = costoTotal;
      repuesto.costo_total = costoTotal;
    }

    // Verificar si todos los repuestos del servicio están listos
    const todosListos = repIdsDelServicio.every((id) => {
      const r = reparaciones.find((x) => x.reparacion_id === id);
      return r?.estado === "finalizada";
    });

    if (todosListos && servicioCliente) {
      servicioCliente.reparacion_lista = true;
      // Actualizar monto del servicio para el cobro
      const sumaTotalReps = repIdsDelServicio.reduce((sum, id) => {
        const r = reparaciones.find((x) => x.reparacion_id === id);
        return sum + (r?.costo_total || 0);
      }, 0);
      servicioCliente.monto_subtotal = sumaTotalReps;
      servicioCliente.monto_iva = Math.round((sumaTotalReps * 19) / 100);
      servicioCliente.monto_total = servicioCliente.monto_subtotal + servicioCliente.monto_iva;
    }

    alert(`¡Repuesto #${repuesto?.serial || rep.repuesto_id} marcado como FINALIZADO y listo para entrega!`);
    cambiarRepuestoActivo(reparacionActivaId);
  };

  return (
    <AppLayout
      title="Gestión de Reparación en Taller"
      description="Asigna día a día mano de obra con múltiples técnicos e insumos consumidos por cada repuesto del cliente."
      actions={
        <div className="flex items-center gap-2">
          <button
            className={btnGhost}
            onClick={() => navigate({ to: "/servicios" })}
          >
            <ArrowLeft className="h-4 w-4" /> Volver a Servicios
          </button>

          {/* Selector de servicio cliente */}
          <select
            className={`${inputCls} w-64`}
            value={servicioSeleccionadoId}
            onChange={(e) => cambiarServicioCliente(Number(e.target.value))}
          >
            {servicios_clientes
              .filter((s) => s.tipo_servicio_id === 2)
              .map((s) => (
                <option key={s.servicio_cliente_id} value={s.servicio_cliente_id}>
                  Servicio #{s.servicio_cliente_id} — {nombreCliente(s.cliente_id)}
                </option>
              ))}
          </select>
        </div>
      }
    >
      {/* Selector de repuestos si el servicio tiene más de uno */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border/50 bg-card p-4 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Wrench className="h-4 w-4" />
          </div>
          <div>
            <p className="text-[11px] font-medium text-muted-foreground/80">Orden de trabajo activa</p>
            <p className="text-sm font-semibold text-foreground">Cliente: {nombreCliente(servicioCliente?.cliente_id || 1)}</p>
          </div>
        </div>

        {/* Pestañas para alternar entre repuestos */}
        <div className="flex items-center gap-2 overflow-x-auto">
          {repIdsDelServicio.map((rId, idx) => {
            const rObj = reparaciones.find((x) => x.reparacion_id === rId);
            const repObj = repuestos.find((x) => x.repuesto_id === rObj?.repuesto_id);
            const activo = rId === reparacionActivaId;
            const esFinalizado = rObj?.estado === "finalizada";

            return (
              <button
                key={rId}
                onClick={() => cambiarRepuestoActivo(rId)}
                className={`flex items-center gap-2 rounded-xl px-3.5 py-1.5 text-xs font-medium transition-all duration-150 border cursor-pointer ${
                  activo
                    ? "bg-primary text-primary-foreground border-primary shadow-xs"
                    : "bg-muted/40 hover:bg-muted text-foreground border-border/60"
                }`}
              >
                <span>Repuesto {idx + 1}: {repObj?.serial || `ID ${rId}`}</span>
                {esFinalizado ? (
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                ) : (
                  <span className="h-2 w-2 rounded-full bg-amber-400" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Contenido principal: Mano de obra e insumos día a día */}
        <div className="space-y-4 lg:col-span-2">
          {/* Card: Mano de Obra con asignación de 1 o más técnicos */}
          <Card>
            <div className="flex items-center justify-between border-b border-border px-4 py-3 bg-muted/20">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                <div>
                  <p className="text-sm font-semibold">Mano de Obra y Servicios de Taller</p>
                  <p className="text-[11px] text-muted-foreground">Asigna 1 o más técnicos por operación</p>
                </div>
              </div>
              <button
                className={btnGhost}
                disabled={rep.estado === "finalizada"}
                onClick={agregarServicioLabor}
              >
                <Plus className="h-3.5 w-3.5" /> Agregar labor técnica
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-xs text-muted-foreground">
                  <tr className="border-b border-border">
                    <th className="px-3 py-2 text-left font-medium">Fecha</th>
                    <th className="px-3 py-2 text-left font-medium">Servicio de taller</th>
                    <th className="px-3 py-2 text-left font-medium">Técnicos asignados (1 o más)</th>
                    <th className="px-3 py-2 text-right font-medium">Cant.</th>
                    <th className="px-3 py-2 text-right font-medium">Costo unitario</th>
                    <th className="px-3 py-2 text-right font-medium">Total</th>
                    <th className="px-3 py-2"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {serviciosAsignados.map((s, idx) => (
                    <tr key={idx} className="hover:bg-muted/40">
                      <td className="px-3 py-2 text-xs font-mono text-muted-foreground whitespace-nowrap">
                        <input
                          type="date"
                          className="h-7 rounded border border-border bg-background px-1.5 text-xs"
                          value={s.fecha_registro || new Date().toISOString().slice(0, 10)}
                          onChange={(e) =>
                            setServiciosAsignados(
                              serviciosAsignados.map((x, i) => (i === idx ? { ...x, fecha_registro: e.target.value } : x))
                            )
                          }
                          disabled={rep.estado === "finalizada"}
                        />
                      </td>
                      <td className="px-3 py-2 min-w-[180px]">
                        <select
                          className="h-8 w-full rounded-md border border-border bg-background px-2 text-xs"
                          value={s.servicio_taller_id}
                          disabled={rep.estado === "finalizada"}
                          onChange={(e) => {
                            const sc = servicios_taller.find((x) => x.servicio_taller_id === Number(e.target.value))!;
                            setServiciosAsignados(
                              serviciosAsignados.map((x, i) =>
                                i === idx
                                  ? {
                                      ...x,
                                      servicio_taller_id: sc.servicio_taller_id,
                                      costo_unitario: sc.costo,
                                      total_linea: x.cantidad * sc.costo,
                                    }
                                  : x
                              )
                            );
                          }}
                        >
                          {servicios_taller.map((st) => (
                            <option key={st.servicio_taller_id} value={st.servicio_taller_id}>
                              {st.nombre} ({clp(st.costo)})
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-3 py-2 min-w-[200px]">
                        {/* Selector multiselección de técnicos */}
                        <div className="flex flex-wrap gap-1">
                          {personal.map((p) => {
                            const seleccionado = s.personal_ids.includes(p.personal_id);
                            return (
                              <button
                                key={p.personal_id}
                                type="button"
                                disabled={rep.estado === "finalizada"}
                                onClick={() => toggleTecnicoEnLabor(idx, p.personal_id)}
                                className={`rounded px-1.5 py-0.5 text-[10px] font-medium transition-colors border ${
                                  seleccionado
                                    ? "bg-primary text-primary-foreground border-primary"
                                    : "bg-background text-muted-foreground border-border hover:bg-accent"
                                }`}
                              >
                                {p.nombre.split(" ")[0]}
                              </button>
                            );
                          })}
                        </div>
                      </td>
                      <td className="px-3 py-2 text-right">
                        <input
                          type="number"
                          min={1}
                          disabled={rep.estado === "finalizada"}
                          className="h-7 w-14 rounded border border-border bg-background px-1 text-right text-xs"
                          value={s.cantidad}
                          onChange={(e) => {
                            const cant = Number(e.target.value);
                            setServiciosAsignados(
                              serviciosAsignados.map((x, i) =>
                                i === idx ? { ...x, cantidad: cant, total_linea: cant * x.costo_unitario } : x
                              )
                            );
                          }}
                        />
                      </td>
                      <td className="px-3 py-2 text-right tabular-nums text-xs text-muted-foreground">
                        {clp(s.costo_unitario)}
                      </td>
                      <td className="px-3 py-2 text-right font-semibold tabular-nums text-xs">
                        {clp(s.total_linea)}
                      </td>
                      <td className="px-3 py-2 text-right">
                        {rep.estado !== "finalizada" && (
                          <button
                            className="text-muted-foreground hover:text-destructive p-1"
                            onClick={() => setServiciosAsignados(serviciosAsignados.filter((_, i) => i !== idx))}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {serviciosAsignados.length === 0 && (
                    <tr>
                      <td colSpan={7} className="py-6 text-center text-xs text-muted-foreground">
                        No hay servicios o mano de obra asignada a este repuesto aún.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Card: Insumos Consumidos Día a Día (Solo Insumos, NO repuestos) */}
          <Card>
            <div className="flex items-center justify-between border-b border-border px-4 py-3 bg-muted/20">
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-amber-600" />
                <div>
                  <p className="text-sm font-semibold">Insumos Consumidos</p>
                  <p className="text-[11px] text-muted-foreground">Materiales e insumos de inventario cargados progresivamente (no repuestos)</p>
                </div>
              </div>
              <button
                className={btnGhost}
                disabled={rep.estado === "finalizada"}
                onClick={agregarInsumoConsumo}
              >
                <Plus className="h-3.5 w-3.5" /> Agregar insumo
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-xs text-muted-foreground">
                  <tr className="border-b border-border">
                    <th className="px-3 py-2 text-left font-medium">Fecha</th>
                    <th className="px-3 py-2 text-left font-medium">Insumo del inventario</th>
                    <th className="px-3 py-2 text-right font-medium">Cant.</th>
                    <th className="px-3 py-2 text-right font-medium">Costo unitario</th>
                    <th className="px-3 py-2 text-right font-medium">Total</th>
                    <th className="px-3 py-2"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {insumosConsumidos.map((insItem, idx) => (
                    <tr key={idx} className="hover:bg-muted/40">
                      <td className="px-3 py-2 text-xs font-mono text-muted-foreground whitespace-nowrap">
                        <input
                          type="date"
                          className="h-7 rounded border border-border bg-background px-1.5 text-xs"
                          value={insItem.fecha_registro || new Date().toISOString().slice(0, 10)}
                          disabled={rep.estado === "finalizada"}
                          onChange={(e) =>
                            setInsumosConsumidos(
                              insumosConsumidos.map((x, i) => (i === idx ? { ...x, fecha_registro: e.target.value } : x))
                            )
                          }
                        />
                      </td>
                      <td className="px-3 py-2 min-w-[220px]">
                        <select
                          className="h-8 w-full rounded-md border border-border bg-background px-2 text-xs"
                          value={insItem.inventario_id}
                          disabled={rep.estado === "finalizada"}
                          onChange={(e) => {
                            const invObj = inventario.find((x) => x.inventario_id === Number(e.target.value))!;
                            setInsumosConsumidos(
                              insumosConsumidos.map((x, i) =>
                                i === idx
                                  ? {
                                      ...x,
                                      inventario_id: invObj.inventario_id,
                                      costo_unitario: invObj.monto_compra_prom,
                                      total_linea: x.cantidad * invObj.monto_compra_prom,
                                    }
                                  : x
                              )
                            );
                          }}
                        >
                          {inventario
                            .filter((inv) => inv.tipo === "insumo")
                            .map((inv) => (
                              <option key={inv.inventario_id} value={inv.inventario_id}>
                                {inv.sku} · {inv.nombre} ({clp(inv.monto_compra_prom)})
                              </option>
                            ))}
                        </select>
                      </td>
                      <td className="px-3 py-2 text-right">
                        <input
                          type="number"
                          min={1}
                          disabled={rep.estado === "finalizada"}
                          className="h-7 w-14 rounded border border-border bg-background px-1 text-right text-xs"
                          value={insItem.cantidad}
                          onChange={(e) => {
                            const cant = Number(e.target.value);
                            setInsumosConsumidos(
                              insumosConsumidos.map((x, i) =>
                                i === idx ? { ...x, cantidad: cant, total_linea: cant * x.costo_unitario } : x
                              )
                            );
                          }}
                        />
                      </td>
                      <td className="px-3 py-2 text-right tabular-nums text-xs text-muted-foreground">
                        {clp(insItem.costo_unitario)}
                      </td>
                      <td className="px-3 py-2 text-right font-semibold tabular-nums text-xs">
                        {clp(insItem.total_linea)}
                      </td>
                      <td className="px-3 py-2 text-right">
                        {rep.estado !== "finalizada" && (
                          <button
                            className="text-muted-foreground hover:text-destructive p-1"
                            onClick={() => setInsumosConsumidos(insumosConsumidos.filter((_, i) => i !== idx))}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {insumosConsumidos.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-6 text-center text-xs text-muted-foreground">
                        No se han registrado insumos para este repuesto.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* Panel lateral: Estado y Finalización */}
        <Card className="h-fit p-4 space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div>
              <p className="text-xs text-muted-foreground font-mono">Reparación #{rep.reparacion_id}</p>
              <p className="text-sm font-bold">{repuesto?.nombre || "Repuesto de cliente"}</p>
            </div>
            <StatusPill value={rep.estado} />
          </div>

          <dl className="space-y-2 text-xs">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Serial único:</dt>
              <dd className="font-mono font-semibold">{repuesto?.serial || "—"}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Servicio cliente:</dt>
              <dd className="font-semibold">#{rep.servicio_cliente_id}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Fecha ingreso:</dt>
              <dd className="tabular-nums">{rep.fecha_inicio}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Fecha finalización:</dt>
              <dd className="tabular-nums">{rep.fecha_fin || "En curso"}</dd>
            </div>
          </dl>

          <dl className="space-y-2 border-t border-border pt-3 text-xs">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Mano de obra acumulada:</dt>
              <dd className="tabular-nums font-medium">{clp(costoServicios)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Insumos consumidos:</dt>
              <dd className="tabular-nums font-medium">{clp(costoInsumos)}</dd>
            </div>
            <div className="flex justify-between border-t border-border pt-2 text-sm font-bold">
              <dt>Costo total acumulado:</dt>
              <dd className="tabular-nums text-primary">{clp(costoTotal)}</dd>
            </div>
          </dl>

          {rep.estado !== "finalizada" ? (
            <div className="space-y-2.5">
              <button
                className={`${btnPrimary} w-full py-2.5 bg-primary hover:bg-primary/90 font-semibold gap-2 justify-center`}
                onClick={guardarAvanceReparacion}
              >
                <Save className="h-4 w-4" /> Guardar avance de este repuesto
              </button>
              <button
                className={`${btnPrimary} w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 font-semibold gap-2 justify-center`}
                onClick={finalizarReparacionRepuesto}
              >
                <CheckCircle2 className="h-4 w-4" /> Finalizar reparación de este repuesto
              </button>
            </div>
          ) : (
            <div className="rounded-md bg-emerald-50 border border-emerald-200 p-2.5 text-center text-xs font-semibold text-emerald-800 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-300">
              ✓ Repuesto reparado y finalizado
            </div>
          )}

          <div className="border-t border-border pt-3">
            <p className="text-[11px] text-muted-foreground text-center leading-relaxed">
              Puedes guardar avances progresivos las veces que sea necesario. Una vez finalizados todos los repuestos, se habilitará el cobro general.
            </p>
          </div>
        </Card>
      </div>
    </AppLayout>
  );
}
