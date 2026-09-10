import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Trash2, Repeat, ArrowRightLeft } from "lucide-react";
import { AppLayout, Card, Field, btnGhost, btnPrimary, inputCls } from "@/components/app/AppLayout";
import {
  IVA,
  clientes,
  clp,
  inventario,
  marcas,
  marcaDeModelo,
  modelos,
  nombreModelo,
  repuestos,
  servicios_clientes,
  variables,
} from "@/lib/mock-data";

export const Route = createFileRoute("/recambio")({
  head: () => ({
    meta: [
      { title: "Recambio de repuestos — Solo Aire SPA" },
      { name: "description", content: "Registro de recambio con lógica de tasación de repuesto entrante, monto económico extra y costo de adquisición." },
      { property: "og:title", content: "Recambio de repuestos — Solo Aire SPA" },
      { property: "og:description", content: "Intercambio de repuestos con control de seriales y montos." },
    ],
  }),
  component: RecambioView,
});

type LineaRecambio = {
  // Repuesto saliente (en buen estado / stock propio)
  inventario_saliente_id: number;
  repuesto_saliente_id: number;
  costo_saliente: number;
  monto_venta_saliente: number; // Monto de venta (automático por costo y margen, o tasación + extra)
  // Repuesto entrante (en mal estado / entregado por cliente)
  inventario_entrante_id: number;
  modelo_entrante_id: number;
  serial_entrante: string;
  monto_tasacion_entrante: number; // Tasación del repuesto entrante
  monto_extra: number; // Monto económico extra a cobrar en dinero
  costo_adquisicion_entrante: number; // = monto_venta_saliente
  cantidad: number;
};

function RecambioView() {
  const navigate = useNavigate();
  const [clienteId, setClienteId] = useState(clientes[0]!.cliente_id);
  const [lineas, setLineas] = useState<LineaRecambio[]>([]);

  // Filtros para selección del repuesto saliente
  const [filtroMarca, setFiltroMarca] = useState("");
  const [filtroModelo, setFiltroModelo] = useState("");
  const [filtroCondicion, setFiltroCondicion] = useState("");

  // Obtener margen y método global de variables
  const gananciaVar = variables.find((v) => v.tipo === "porcentaje_ganancia");
  const calcVar = variables.find((v) => v.tipo === "calculo_ganancia");
  const margenGlobal = Number(gananciaVar?.valor ?? 40);
  const metodoCalculo = (calcVar?.valor as "sobre_costo" | "sobre_venta") || "sobre_costo";

  // Función helper para calcular precio de venta en base a costo y margen
  const calcularPrecioVentaSugerido = (costo: number, invMargen?: number) => {
    const margen = invMargen ?? margenGlobal;
    if (metodoCalculo === "sobre_costo") {
      return Math.round(costo * (1 + margen / 100));
    } else {
      const ratio = margen / 100;
      return Math.round(ratio < 1 ? costo / (1 - ratio) : costo);
    }
  };

  const modelosFiltrados = filtroMarca
    ? modelos.filter((m) => m.marca_id === Number(filtroMarca))
    : modelos;

  // Repuestos salientes disponibles filtrados (excluyendo los ya añadidos a alguna línea)
  const repuestosDisponibles = repuestos.filter((r) => {
    if (r.propietario || !r.existe) return false;
    // No permitir volver a seleccionar un repuesto ya agregado a una línea de este recambio
    if (lineas.some((l) => l.repuesto_saliente_id === r.repuesto_id)) return false;

    const inv = inventario.find((i) => i.inventario_id === r.inventario_id);
    if (!inv) return false;
    const mo = modelos.find((m) => m.modelo_id === inv.modelo_id);
    if (filtroMarca && mo?.marca_id !== Number(filtroMarca)) return false;
    if (filtroModelo && inv.modelo_id !== Number(filtroModelo)) return false;
    if (filtroCondicion && inv.condicion !== filtroCondicion) return false;
    return true;
  });

  const primerRepuesto = repuestosDisponibles[0] || repuestos.find((r) => !r.propietario && r.existe);
  const primerInv = inventario.find((i) => i.inventario_id === primerRepuesto?.inventario_id) || inventario[0]!;

  const costoSalienteInicial = primerRepuesto?.costo_adquisicion || primerInv.monto_compra_prom;
  const precioVentaSugeridoInicial =
    primerRepuesto?.monto_venta ||
    primerInv.monto_venta_unitario ||
    calcularPrecioVentaSugerido(costoSalienteInicial, primerInv.porcentaje_ganancia);

  // Por defecto, tasación = 50% de la venta y monto extra = 50% restante
  const tasacionInicial = Math.round(precioVentaSugeridoInicial * 0.5);
  const montoExtraInicial = precioVentaSugeridoInicial - tasacionInicial;

  const [draft, setDraft] = useState<LineaRecambio>({
    inventario_saliente_id: primerInv.inventario_id,
    repuesto_saliente_id: primerRepuesto?.repuesto_id || 1,
    costo_saliente: costoSalienteInicial,
    monto_venta_saliente: precioVentaSugeridoInicial,
    inventario_entrante_id: primerInv.inventario_id,
    modelo_entrante_id: primerInv.modelo_id,
    serial_entrante: "",
    monto_tasacion_entrante: tasacionInicial,
    monto_extra: montoExtraInicial,
    costo_adquisicion_entrante: tasacionInicial,
    cantidad: 1,
  });

  // Al seleccionar repuesto saliente
  const seleccionarRepuestoSaliente = (repId: number) => {
    const rep = repuestos.find((r) => r.repuesto_id === repId);
    if (!rep) return;
    const inv = inventario.find((i) => i.inventario_id === rep.inventario_id) || primerInv;
    const costo = rep.costo_adquisicion || inv.monto_compra_prom;
    const precioVenta =
      rep.monto_venta ||
      inv.monto_venta_unitario ||
      calcularPrecioVentaSugerido(costo, inv.porcentaje_ganancia);

    // Mantener la tasación previa si cabe, o ajustar el monto extra
    const nuevaTasacion = draft.monto_tasacion_entrante <= precioVenta ? draft.monto_tasacion_entrante : Math.round(precioVenta * 0.5);
    const nuevoExtra = Math.max(0, precioVenta - nuevaTasacion);

    setDraft({
      ...draft,
      repuesto_saliente_id: rep.repuesto_id,
      inventario_saliente_id: inv.inventario_id,
      costo_saliente: costo,
      monto_venta_saliente: precioVenta,
      monto_tasacion_entrante: nuevaTasacion,
      monto_extra: nuevoExtra,
      costo_adquisicion_entrante: nuevaTasacion,
    });
  };

  // Al cambiar el Monto de Venta del repuesto saliente:
  // monto_venta_saliente = tasacion + monto_extra
  // => ajustamos monto_extra = monto_venta_saliente - tasacion
  const handleCambioMontoVenta = (nuevoPrecioVenta: number) => {
    const pVenta = Math.max(0, nuevoPrecioVenta);
    const nuevoExtra = Math.max(0, pVenta - draft.monto_tasacion_entrante);
    setDraft({
      ...draft,
      monto_venta_saliente: pVenta,
      monto_extra: nuevoExtra,
      costo_adquisicion_entrante: draft.monto_tasacion_entrante,
    });
  };

  // Al cambiar la Tasación del repuesto entrante:
  // "El campo costo_adquisicion del repuesto entrante debe tomar automáticamente el valor asignado en el campo monto_tasacion"
  // Además: monto_venta_saliente = tasacion + monto_extra
  const handleCambioTasacion = (nuevaTasacion: number) => {
    const tas = Math.max(0, nuevaTasacion);
    const nuevoPrecioVenta = tas + draft.monto_extra;
    setDraft({
      ...draft,
      monto_tasacion_entrante: tas,
      monto_venta_saliente: nuevoPrecioVenta,
      costo_adquisicion_entrante: tas,
    });
  };

  // Al cambiar el Monto Económico Extra:
  // monto_venta_saliente = tasacion + monto_extra
  const handleCambioMontoExtra = (nuevoExtra: number) => {
    const ext = Math.max(0, nuevoExtra);
    const nuevoPrecioVenta = draft.monto_tasacion_entrante + ext;
    setDraft({
      ...draft,
      monto_extra: ext,
      monto_venta_saliente: nuevoPrecioVenta,
      costo_adquisicion_entrante: draft.monto_tasacion_entrante,
    });
  };

  const seleccionarInventarioEntrante = (invId: number) => {
    const inv = inventario.find((i) => i.inventario_id === invId);
    if (!inv) return;
    setDraft({
      ...draft,
      inventario_entrante_id: inv.inventario_id,
      modelo_entrante_id: inv.modelo_id,
    });
  };

  // En un recambio, lo que se le cobra en dinero efectivo/tarjeta al cliente es el Monto Económico Extra
  const subtotal = lineas.reduce((s, l) => s + l.cantidad * l.monto_extra, 0);
  const iva = Math.round((subtotal * IVA) / 100);
  const total = subtotal + iva;

  const registrarRecambio = () => {
    const nuevoServicioId = Math.max(0, ...servicios_clientes.map((s) => s.servicio_cliente_id)) + 1;
    const nuevoServicio = {
      servicio_cliente_id: nuevoServicioId,
      tipo_servicio_id: 3, // Recambio
      cliente_id: clienteId,
      admin_id: "ADM-001",
      fecha: new Date().toISOString().slice(0, 10),
      monto_subtotal: subtotal,
      porcentaje_iva: IVA,
      monto_iva: iva,
      monto_total: total,
      metodo_pago: null,
      num_referencia: null,
      fecha_entrega_reparacion: null,
      estado: "en proceso" as const,
      comprobante: null,
      last_update: new Date().toISOString().slice(0, 10),
    };

    // Marcar repuestos salientes como no existentes o transferidos
    // e ingresar repuestos entrantes con costo_adquisicion = monto_venta_saliente y estado pendiente_reparacion
    lineas.forEach((l, idx) => {
      const repSal = repuestos.find((r) => r.repuesto_id === l.repuesto_saliente_id);
      if (repSal) {
        repSal.existe = false;
      }

      // Ingresar el nuevo repuesto físico recibido del cliente (en mal estado)
      const nuevoRepId = Math.max(0, ...repuestos.map((r) => r.repuesto_id)) + 1 + idx;
      const invEnt = inventario.find((i) => i.inventario_id === l.inventario_entrante_id);
      repuestos.push({
        repuesto_id: nuevoRepId,
        inventario_id: l.inventario_entrante_id,
        detalle_compra_id: null,
        serial: l.serial_entrante || `RC-IN-${nuevoRepId}`,
        nombre: invEnt ? `${invEnt.nombre} (Recambio cliente)` : "Repuesto entrante",
        estado: "pendiente_reparacion", // Entra en mal estado
        propietario: false, // Pasa a ser propiedad de Solo Aire SPA
        existe: true,
        costo_adquisicion: l.costo_adquisicion_entrante, // = monto_venta_saliente
        costo_reparacion: 0,
        costo_total: l.costo_adquisicion_entrante,
        monto_venta: 0,
        utilidad: 0,
      });
    });

    servicios_clientes.unshift(nuevoServicio);

    // Redirección inmediata al registro de pago
    navigate({
      to: "/pagos",
      search: { servicio_id: nuevoServicioId },
    });
  };

  return (
    <AppLayout
      title="Recambio de repuestos"
      description="Intercambio de piezas: egreso de repuesto de stock e ingreso de repuesto físico usado del cliente"
    >
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="p-6 lg:col-span-2 space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Cliente que solicita el recambio">
              <select
                className={inputCls}
                value={clienteId}
                onChange={(e) => setClienteId(Number(e.target.value))}
              >
                {clientes.map((c) => (
                  <option key={c.cliente_id} value={c.cliente_id}>
                    {c.nombre} ({c.ruc})
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Fecha de la operación">
              <input type="date" className={inputCls} defaultValue={new Date().toISOString().slice(0, 10)} />
            </Field>
          </div>

          {/* Diagrama visual interactivo de la lógica del proceso de recambio */}
          <div className="rounded-2xl border border-border/60 bg-muted/20 p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-border/50 pb-3">
              <div>
                <p className="text-sm font-semibold text-foreground">Lógica del Proceso de Recambio</p>
                <p className="text-xs text-muted-foreground">
                  Monto de Venta Saliente = Tasación Entrante + Monto Económico Extra
                </p>
              </div>
              <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-medium text-primary w-fit">
                Margen global activo: {margenGlobal}% ({metodoCalculo.replace("_", " ")})
              </span>
            </div>

            {/* Cuadros comparativos Repuesto Saliente vs Repuesto Entrante */}
            <div className="grid gap-4 md:grid-cols-2">
              {/* Bloque Repuesto Saliente (En buen estado) */}
              <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4 space-y-3.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-xs font-bold">
                      S
                    </span>
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-200">
                      Repuesto Saliente
                    </span>
                  </div>
                  <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 dark:text-emerald-300">
                    En buen estado
                  </span>
                </div>

                {/* Filtros rápidos */}
                <div className="grid grid-cols-2 gap-2">
                  <Field label="Marca">
                    <select
                      className={`${inputCls} text-xs`}
                      value={filtroMarca}
                      onChange={(e) => {
                        setFiltroMarca(e.target.value);
                        setFiltroModelo("");
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
                    <select
                      className={`${inputCls} text-xs`}
                      value={filtroModelo}
                      onChange={(e) => setFiltroModelo(e.target.value)}
                    >
                      <option value="">Todos</option>
                      {modelosFiltrados.map((m) => (
                        <option key={m.modelo_id} value={m.modelo_id}>
                          {m.nombre}
                        </option>
                      ))}
                    </select>
                  </Field>
                </div>

                <Field label="Unidad física en stock (Serial)">
                  <select
                    className={`${inputCls} font-mono text-xs`}
                    value={draft.repuesto_saliente_id}
                    onChange={(e) => seleccionarRepuestoSaliente(Number(e.target.value))}
                  >
                    {repuestosDisponibles.map((r) => {
                      const inv = inventario.find((i) => i.inventario_id === r.inventario_id);
                      return (
                        <option key={r.repuesto_id} value={r.repuesto_id}>
                          #{r.repuesto_id} · {r.serial} — {r.nombre} ({r.estado} - {marcaDeModelo(inv?.modelo_id || 1)})
                        </option>
                      );
                    })}
                  </select>
                </Field>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <Field label="Costo de adquisición de stock">
                    <div className="rounded-lg border border-border/70 bg-background/50 px-3 py-2 text-xs font-mono text-muted-foreground">
                      {clp(draft.costo_saliente)}
                    </div>
                  </Field>

                  <Field label="Monto de Venta">
                    <input
                      type="number"
                      min={0}
                      className={`${inputCls} font-semibold text-emerald-700 dark:text-emerald-300`}
                      value={draft.monto_venta_saliente}
                      onChange={(e) => handleCambioMontoVenta(Number(e.target.value))}
                    />
                  </Field>
                </div>
                <p className="text-[11px] text-muted-foreground leading-tight">
                  Se carga automáticamente el precio sugerido en función de su costo y el margen definido. Al modificarlo, se recalcula el monto extra.
                </p>
              </div>

              {/* Bloque Repuesto Entrante (En mal estado) */}
              <div className="rounded-xl border border-rose-500/30 bg-rose-500/5 p-4 space-y-3.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-rose-500/20 text-rose-700 dark:text-rose-300 text-xs font-bold">
                      E
                    </span>
                    <span className="text-xs font-bold uppercase tracking-wider text-rose-800 dark:text-rose-200">
                      Repuesto Entrante
                    </span>
                  </div>
                  <span className="rounded-full bg-rose-500/15 px-2 py-0.5 text-[10px] font-semibold text-rose-700 dark:text-rose-300">
                    En mal estado
                  </span>
                </div>

                <Field label="Categoría / Modelo físico entrante">
                  <select
                    className={`${inputCls} text-xs`}
                    value={draft.inventario_entrante_id}
                    onChange={(e) => seleccionarInventarioEntrante(Number(e.target.value))}
                  >
                    {inventario.map((i) => (
                      <option key={i.inventario_id} value={i.inventario_id}>
                        {i.nombre} ({marcaDeModelo(i.modelo_id)} - {nombreModelo(i.modelo_id)})
                      </option>
                    ))}
                  </select>
                </Field>

                <Field label="Serial único del repuesto entrante">
                  <input
                    required
                    className={`${inputCls} font-mono text-xs`}
                    placeholder="Ej: CMP-CLI-9948"
                    value={draft.serial_entrante}
                    onChange={(e) => setDraft({ ...draft, serial_entrante: e.target.value })}
                  />
                </Field>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <Field label="Monto de Tasación">
                    <input
                      type="number"
                      min={0}
                      className={inputCls}
                      value={draft.monto_tasacion_entrante}
                      onChange={(e) => handleCambioTasacion(Number(e.target.value))}
                    />
                  </Field>

                  <Field label="Costo de adquisición entrante">
                    <div className="rounded-lg border border-border/70 bg-background/50 px-3 py-2 text-xs font-mono font-bold text-foreground">
                      {clp(draft.costo_adquisicion_entrante)}
                    </div>
                  </Field>
                </div>
                <p className="text-[11px] text-muted-foreground leading-tight">
                  El monto de adquisición del repuesto entrante toma automáticamente el valor asignado en el monto de tasación ({clp(draft.costo_adquisicion_entrante)}).
                </p>
              </div>
            </div>

            {/* Bloque central: Monto Económico Extra */}
            <div className="rounded-xl border border-primary/30 bg-primary/5 p-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <Repeat className="h-4 w-4 text-primary" />
                    <span className="text-xs font-bold uppercase tracking-wider text-primary">
                      Monto Económico Extra (Diferencial a Cobrar)
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Monto en dinero que el cliente paga para cubrir la diferencia:{" "}
                    <span className="font-semibold text-foreground">
                      {clp(draft.monto_venta_saliente)} (Venta) − {clp(draft.monto_tasacion_entrante)} (Tasación) = {clp(draft.monto_extra)}
                    </span>
                  </p>
                </div>

                <div className="w-full sm:w-56">
                  <Field label="Monto extra">
                    <input
                      type="number"
                      min={0}
                      className={`${inputCls} font-bold text-base text-primary`}
                      value={draft.monto_extra}
                      onChange={(e) => handleCambioMontoExtra(Number(e.target.value))}
                    />
                  </Field>
                </div>
              </div>
            </div>

            {/* Fila de cantidad y botón Agregar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-border/40">
              <div className="flex items-center gap-4">
                <div className="w-28">
                  <Field label="Cantidad">
                    <input
                      type="number"
                      min={1}
                      className={inputCls}
                      value={draft.cantidad}
                      onChange={(e) => setDraft({ ...draft, cantidad: Math.max(1, Number(e.target.value)) })}
                    />
                  </Field>
                </div>
                <div className="text-xs">
                  <p className="text-muted-foreground">Cobro total de la línea (neto):</p>
                  <p className="text-base font-bold text-foreground">{clp(draft.cantidad * draft.monto_extra)}</p>
                </div>
              </div>

              <button
                className={btnPrimary}
                disabled={!draft.serial_entrante.trim() || repuestosDisponibles.length === 0}
                onClick={() => {
                  const nuevasLineas = [...lineas, draft];
                  setLineas(nuevasLineas);

                  // Encontrar el siguiente repuesto disponible
                  const siguiente = repuestos.find(
                    (r) => !r.propietario && r.existe && !nuevasLineas.some((l) => l.repuesto_saliente_id === r.repuesto_id)
                  );
                  if (siguiente) {
                    const invSig = inventario.find((i) => i.inventario_id === siguiente.inventario_id) || primerInv;
                    const cSal = siguiente.costo_adquisicion || invSig.monto_compra_prom;
                    const pVenta =
                      siguiente.monto_venta ||
                      invSig.monto_venta_unitario ||
                      calcularPrecioVentaSugerido(cSal, invSig.porcentaje_ganancia);
                    const tas = Math.round(pVenta * 0.5);
                    const ext = pVenta - tas;

                    setDraft({
                      ...draft,
                      repuesto_saliente_id: siguiente.repuesto_id,
                      inventario_saliente_id: invSig.inventario_id,
                      costo_saliente: cSal,
                      monto_venta_saliente: pVenta,
                      monto_tasacion_entrante: tas,
                      monto_extra: ext,
                      costo_adquisicion_entrante: tas,
                      serial_entrante: "",
                    });
                  } else {
                    setDraft({ ...draft, serial_entrante: "" });
                  }
                }}
              >
                Agregar al recambio
              </button>
            </div>
          </div>
        </Card>

        {/* Resumen lateral */}
        <Card className="p-5 h-fit space-y-4">
          <div className="border-b border-border/50 pb-3">
            <p className="text-sm font-semibold text-foreground">Detalle del Recambio</p>
            <p className="text-xs text-muted-foreground">Resumen de intercambio y cobro diferencial</p>
          </div>

          <ul className="divide-y divide-border/60 text-sm">
            {lineas.map((l, idx) => {
              const invSaliente = inventario.find((i) => i.inventario_id === l.inventario_saliente_id);
              const invEntrante = inventario.find((i) => i.inventario_id === l.inventario_entrante_id);

              return (
                <li key={idx} className="space-y-2 py-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs font-semibold text-foreground">
                        Saliente: <span className="text-emerald-600 dark:text-emerald-400">{invSaliente?.nombre}</span>
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        Venta: {clp(l.monto_venta_saliente)}
                      </p>
                    </div>
                    <button
                      className="text-muted-foreground hover:text-destructive p-1 rounded transition-colors cursor-pointer"
                      onClick={() => setLineas(lineas.filter((_, i) => i !== idx))}
                      title="Eliminar"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="rounded-lg bg-muted/40 p-2.5 space-y-1 text-[11px]">
                    <p className="text-muted-foreground font-mono">
                      Entrante: <span className="text-foreground font-medium">{invEntrante?.nombre}</span> (S/N: {l.serial_entrante || "s/n"})
                    </p>
                    <div className="flex justify-between text-muted-foreground">
                      <span>Tasación: {clp(l.monto_tasacion_entrante)}</span>
                      <span>Monto extra: {clp(l.monto_extra)}</span>
                    </div>
                    <p className="text-[10px] text-muted-foreground pt-0.5 border-t border-border/40">
                      Costo adquisición entrante: <span className="font-semibold text-foreground">{clp(l.costo_adquisicion_entrante)}</span>
                    </p>
                  </div>

                  <div className="flex justify-between items-center text-xs font-semibold pt-1">
                    <span className="text-muted-foreground">{l.cantidad} × Monto extra {clp(l.monto_extra)}</span>
                    <span className="text-primary tabular-nums font-bold">{clp(l.cantidad * l.monto_extra)}</span>
                  </div>
                </li>
              );
            })}
            {lineas.length === 0 && (
              <li className="py-8 text-center text-muted-foreground text-xs">
                No hay líneas añadidas al recambio aún.
              </li>
            )}
          </ul>

          <dl className="space-y-2 border-t border-border/60 pt-3 text-xs">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Subtotal diferencial (neto):</dt>
              <dd className="tabular-nums font-medium text-foreground">{clp(subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">IVA ({IVA}%):</dt>
              <dd className="tabular-nums font-medium text-foreground">{clp(iva)}</dd>
            </div>
            <div className="flex justify-between border-t border-border/60 pt-2 text-sm font-bold">
              <dt className="text-foreground">Total a pagar al instante:</dt>
              <dd className="tabular-nums text-primary text-base">{clp(total)}</dd>
            </div>
          </dl>

          <button
            className={`${btnPrimary} w-full justify-center py-2.5 shadow-xs`}
            disabled={lineas.length === 0}
            onClick={registrarRecambio}
          >
            Registrar recambio y pagar al instante
          </button>
          <p className="text-center text-[11px] text-muted-foreground">
            El recambio requiere pago inmediato del monto extra. Se abrirá la pasarela de pago.
          </p>
        </Card>
      </div>
    </AppLayout>
  );
}
