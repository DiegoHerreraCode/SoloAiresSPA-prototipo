import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Trash2, Wrench, CheckCircle2 } from "lucide-react";
import { AppLayout, Card, Field, btnGhost, btnPrimary, inputCls } from "@/components/app/AppLayout";
import {
  clientes,
  inventario,
  repuestos,
  reparaciones,
  servicios_clientes,
  reparacionesPorServicio,
  marcaDeModelo,
  nombreModelo,
} from "@/lib/mock-data";

export const Route = createFileRoute("/reparacion")({
  head: () => ({
    meta: [
      { title: "Ingreso a reparación — Solo Aire SPA" },
      { name: "description", content: "Recepción de 1 o más repuestos de cliente para reparación: serial, fecha de entrega y creación de registros de taller." },
      { property: "og:title", content: "Ingreso a reparación — Solo Aire SPA" },
      { property: "og:description", content: "Formulario de recepción múltiple de repuestos en taller." },
    ],
  }),
  component: IngresoReparacion,
});

type ItemReparacion = {
  inventario_id: number;
  serial: string;
  nombre: string;
  falla_reportada: string;
  fecha_entrega_estimada: string;
};

function IngresoReparacion() {
  const navigate = useNavigate();
  const [clienteId, setClienteId] = useState(clientes[0]!.cliente_id);
  const [fecha, setFecha] = useState(new Date().toISOString().slice(0, 10));
  const [items, setItems] = useState<ItemReparacion[]>([
    {
      inventario_id: inventario[0]!.inventario_id,
      serial: "",
      nombre: "Compresor cliente",
      falla_reportada: "Pérdida de presión en descarga",
      fecha_entrega_estimada: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10),
    },
  ]);
  const [ok, setOk] = useState(false);
  const [servicioGeneradoId, setServicioGeneradoId] = useState<number | null>(null);

  const agregarRepuesto = () => {
    setItems([
      ...items,
      {
        inventario_id: inventario[0]!.inventario_id,
        serial: "",
        nombre: `Repuesto #${items.length + 1}`,
        falla_reportada: "",
        fecha_entrega_estimada: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10),
      },
    ]);
  };

  const actualizarItem = (index: number, campo: keyof ItemReparacion, valor: any) => {
    setItems(items.map((it, idx) => (idx === index ? { ...it, [campo]: valor } : it)));
  };

  const eliminarItem = (index: number) => {
    if (items.length <= 1) return;
    setItems(items.filter((_, idx) => idx !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const nuevoServicioId = Math.max(0, ...servicios_clientes.map((s) => s.servicio_cliente_id)) + 1;
    const repIdsGenerados: number[] = [];

    // Crear entidades de repuestos del cliente y reparaciones
    items.forEach((it, idx) => {
      const nuevoRepuestoId = Math.max(0, ...repuestos.map((r) => r.repuesto_id)) + 1 + idx;
      const nuevaReparacionId = Math.max(0, ...reparaciones.map((r) => r.reparacion_id)) + 1 + idx;

      repuestos.push({
        repuesto_id: nuevoRepuestoId,
        inventario_id: it.inventario_id,
        detalle_compra_id: null,
        serial: it.serial || `S/N-${nuevoRepuestoId}`,
        nombre: it.nombre,
        estado: "pendiente_reparacion",
        propietario: true,
        existe: true,
        costo_adquisicion: 0,
        costo_reparacion: 0,
        costo_total: 0,
        monto_venta: 0,
        utilidad: 0,
      });

      reparaciones.push({
        reparacion_id: nuevaReparacionId,
        repuesto_id: nuevoRepuestoId,
        servicio_cliente_id: nuevoServicioId,
        estado: "pendiente",
        fecha_inicio: fecha,
        fecha_fin: null,
        costo_servicios: 0,
        costo_insumos: 0,
        costo_total: 0,
      });

      repIdsGenerados.push(nuevaReparacionId);
    });

    reparacionesPorServicio[nuevoServicioId] = repIdsGenerados;

    // Crear el registro maestro del servicio_cliente
    const fechaMayor = items.reduce(
      (max, it) => (it.fecha_entrega_estimada > max ? it.fecha_entrega_estimada : max),
      items[0]?.fecha_entrega_estimada || fecha
    );

    servicios_clientes.unshift({
      servicio_cliente_id: nuevoServicioId,
      tipo_servicio_id: 2, // Reparación
      cliente_id: clienteId,
      admin_id: "ADM-001",
      fecha,
      monto_subtotal: 0,
      porcentaje_iva: 19,
      monto_iva: 0,
      monto_total: 0,
      metodo_pago: null,
      num_referencia: null,
      fecha_entrega_reparacion: fechaMayor,
      estado: "en proceso",
      comprobante: null,
      last_update: fecha,
      reparacion_lista: false,
    });

    setServicioGeneradoId(nuevoServicioId);
    setOk(true);
  };

  return (
    <AppLayout
      title="Ingreso a reparación"
      description="Recepción y registro de 1 o más repuestos pertenecientes al cliente para reparación en taller"
    >
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="p-6 lg:col-span-2">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Cliente propietario">
                <select
                  className={inputCls}
                  value={clienteId}
                  onChange={(e) => setClienteId(Number(e.target.value))}
                >
                  {clientes.map((c) => (
                    <option key={c.cliente_id} value={c.cliente_id}>
                      {c.nombre} · {c.ruc}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Fecha de recepción">
                <input
                  type="date"
                  className={inputCls}
                  value={fecha}
                  onChange={(e) => setFecha(e.target.value)}
                />
              </Field>
            </div>

            {/* Listado de repuestos a ser reparados */}
            <div className="space-y-4 border-t border-border/50 pt-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold tracking-tight text-foreground">Repuestos para reparación ({items.length})</h3>
                  <p className="text-xs text-muted-foreground">
                    Puedes ingresar múltiples piezas asociadas a esta misma orden de servicio
                  </p>
                </div>
                <button type="button" className={btnGhost} onClick={agregarRepuesto}>
                  <Plus className="h-3.5 w-3.5" /> Añadir repuesto
                </button>
              </div>

              {items.map((it, idx) => (
                <div key={idx} className="rounded-2xl border border-border/60 bg-muted/20 p-5 space-y-4">
                  <div className="flex items-center justify-between border-b border-border/40 pb-3">
                    <span className="text-xs font-semibold text-primary">Repuesto N° {idx + 1}</span>
                    {items.length > 1 && (
                      <button
                        type="button"
                        className="text-xs text-muted-foreground hover:text-destructive flex items-center gap-1 transition-colors cursor-pointer"
                        onClick={() => eliminarItem(idx)}
                      >
                        <Trash2 className="h-3.5 w-3.5" /> Quitar
                      </button>
                    )}
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Modelo / Categoría de referencia (Inventario)">
                      <select
                        className={inputCls}
                        value={it.inventario_id}
                        onChange={(e) => actualizarItem(idx, "inventario_id", Number(e.target.value))}
                      >
                        {inventario.map((i) => (
                          <option key={i.inventario_id} value={i.inventario_id}>
                            {i.nombre} ({marcaDeModelo(i.modelo_id)} - {nombreModelo(i.modelo_id)})
                          </option>
                        ))}
                      </select>
                    </Field>

                    <Field label="Serial único del repuesto">
                      <input
                        required
                        className={`${inputCls} font-mono`}
                        placeholder="Ej: SS318-C7781"
                        value={it.serial}
                        onChange={(e) => actualizarItem(idx, "serial", e.target.value)}
                      />
                    </Field>

                    <Field label="Identificación / Nombre del componente">
                      <input
                        required
                        className={inputCls}
                        placeholder="Ej: Compresor cabezal camión 2"
                        value={it.nombre}
                        onChange={(e) => actualizarItem(idx, "nombre", e.target.value)}
                      />
                    </Field>

                    <Field label="Fecha estimada de entrega">
                      <input
                        type="date"
                        required
                        className={inputCls}
                        value={it.fecha_entrega_estimada}
                        onChange={(e) => actualizarItem(idx, "fecha_entrega_estimada", e.target.value)}
                      />
                    </Field>
                  </div>

                  <Field label="Falla o trabajo solicitado por el cliente">
                    <input
                      className={inputCls}
                      placeholder="Ej: Fuga de aceite por empaquetadura, recalienta..."
                      value={it.falla_reportada}
                      onChange={(e) => actualizarItem(idx, "falla_reportada", e.target.value)}
                    />
                  </Field>
                </div>
              ))}
            </div>

            <button className={`${btnPrimary} w-full py-2.5`} type="submit">
              Registrar ingreso de {items.length} {items.length === 1 ? "repuesto" : "repuestos"} a reparación
            </button>

            {ok && servicioGeneradoId && (
              <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-4 text-emerald-800 dark:text-emerald-300 space-y-2">
                <div className="flex items-center gap-2 font-medium">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                  <span>Ingreso registrado con éxito (Servicio #{servicioGeneradoId})</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Se han creado los {items.length} repuestos y sus respectivas reparaciones pendientes. Recuerda que el cliente solo paga una vez finalizada la reparación en taller.
                </p>
                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    className={btnPrimary}
                    onClick={() => navigate({ to: "/taller", search: { servicio_id: servicioGeneradoId } })}
                  >
                    <Wrench className="h-3.5 w-3.5" /> Ir al taller para iniciar labores
                  </button>
                  <button
                    type="button"
                    className={btnGhost}
                    onClick={() => navigate({ to: "/servicios" })}
                  >
                    Ver listado de servicios
                  </button>
                </div>
              </div>
            )}
          </form>
        </Card>

        <Card className="p-4 h-fit">
          <p className="text-sm font-semibold border-b border-border pb-2.5">Reglas del Flujo de Reparación</p>
          <ol className="mt-3 space-y-3.5 text-xs text-muted-foreground">
            <li className="flex gap-2">
              <span className="font-bold text-primary shrink-0">1.</span>
              <span>
                <strong>Ingreso múltiple:</strong> Un cliente puede traer varios repuestos en una misma orden.
              </span>
            </li>
            <li className="flex gap-2">
              <span className="font-bold text-primary shrink-0">2.</span>
              <span>
                <strong>Asignación progresiva:</strong> En el taller se irán cargando día a día los servicios de mano de obra y los insumos utilizados para cada repuesto.
              </span>
            </li>
            <li className="flex gap-2">
              <span className="font-bold text-primary shrink-0">3.</span>
              <span>
                <strong>Técnicos asignados:</strong> Se puede asignar uno o varios mecánicos por servicio.
              </span>
            </li>
            <li className="flex gap-2">
              <span className="font-bold text-emerald-600 shrink-0">4.</span>
              <span>
                <strong>Pago solo al finalizar:</strong> A diferencia de ventas o recambios, aquí el cobro solo se activa cuando todos los repuestos estén marcados como finalizados.
              </span>
            </li>
          </ol>
        </Card>
      </div>
    </AppLayout>
  );
}
