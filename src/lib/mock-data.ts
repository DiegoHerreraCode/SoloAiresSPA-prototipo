export const admin = {
  admin_id: "ADM-001",
  nombre: "Diego Herrera",
  ruc: "80012345-6",
  correo: "diego@soloaire.cl",
  num_tlf: "+56 9 8123 4455",
  ubicacion: "Santiago, Chile",
};

export type VariableConfig = {
  variable_id: number;
  nombre: string;
  valor: number | string;
  tipo: "porcentaje_ganancia" | "calculo_ganancia";
};

export const variables: VariableConfig[] = [
  { variable_id: 1, nombre: "porcentaje_ganancia", valor: 40, tipo: "porcentaje_ganancia" },
  { variable_id: 2, nombre: "calculo_ganancia", valor: "sobre_costo", tipo: "calculo_ganancia" },
];

export const IVA = 19;

export const clientes = [
  { cliente_id: 1, nombre: "Transportes Andes Ltda.", ruc: "76.412.900-1", correo: "contacto@andes.cl", num_tlf: "+56 2 2456 7788", ubicacion: "Maipú, Santiago" },
  { cliente_id: 2, nombre: "Frío Sur SPA", ruc: "77.201.334-K", correo: "compras@friosur.cl", num_tlf: "+56 9 6677 2211", ubicacion: "Puerto Montt" },
  { cliente_id: 3, nombre: "Minera Alta Cordillera", ruc: "78.900.112-5", correo: "mantencion@altacord.cl", num_tlf: "+56 55 244 8899", ubicacion: "Calama" },
  { cliente_id: 4, nombre: "Logística Bío Bío", ruc: "79.550.108-3", correo: "flota@logbiobio.cl", num_tlf: "+56 41 233 1100", ubicacion: "Concepción" },
];

export const proveedores = [
  { proveedor_id: 1, nombre: "Compresores Import S.A.", ruc: "96.111.222-3", correo: "ventas@compimport.cl", num_tlf: "+56 2 2900 1122", ubicacion: "Quilicura" },
  { proveedor_id: 2, nombre: "Válvulas del Pacífico", ruc: "96.554.001-8", correo: "pedidos@valpacifico.cl", num_tlf: "+56 32 245 7788", ubicacion: "Valparaíso" },
  { proveedor_id: 3, nombre: "Insumos Neumáticos Ltda.", ruc: "77.888.234-9", correo: "info@insuneu.cl", num_tlf: "+56 2 2777 0099", ubicacion: "San Bernardo" },
];

export const personal = [
  { personal_id: 1, nombre: "Marco Salinas", ruc: "15.223.998-4", correo: "m.salinas@soloaire.cl", num_tlf: "+56 9 5566 1122", ubicacion: "Santiago", disponible: true },
  { personal_id: 2, nombre: "Jorge Peña", ruc: "16.881.334-2", correo: "j.pena@soloaire.cl", num_tlf: "+56 9 7788 4433", ubicacion: "Santiago", disponible: false },
  { personal_id: 3, nombre: "Ana Reyes", ruc: "17.442.771-9", correo: "a.reyes@soloaire.cl", num_tlf: "+56 9 3344 9911", ubicacion: "Rancagua", disponible: true },
  { personal_id: 4, nombre: "Luis Cárcamo", ruc: "14.009.556-1", correo: "l.carcamo@soloaire.cl", num_tlf: "+56 9 2211 5566", ubicacion: "Santiago", disponible: true },
];

export const marcas = [
  { marca_id: 1, nombre: "Wabco", descripcion: "Sistemas de aire y frenos" },
  { marca_id: 2, nombre: "Knorr-Bremse", descripcion: "Componentes neumáticos" },
  { marca_id: 3, nombre: "Bendix", descripcion: "Compresores y válvulas" },
];

export const modelos = [
  { modelo_id: 1, marca_id: 1, nombre: "SS318", descripcion: "Compresor bicilíndrico" },
  { modelo_id: 2, marca_id: 2, nombre: "LP-4805", descripcion: "Válvula de descarga" },
  { modelo_id: 3, marca_id: 3, nombre: "BX-2200", descripcion: "Secador de aire" },
  { modelo_id: 4, marca_id: 1, nombre: "KIT-STD", descripcion: "Kit de sellos" },
];

export type Inventario = {
  inventario_id: number;
  modelo_id: number;
  sku: string;
  nombre: string;
  tipo: "insumo" | "compresor" | "valvula" | "equipo";
  condicion: "nuevo" | "usado" | "NA";
  cantidad_total: number;
  cantidad_propia: number;
  cantidad_cliente: number;
  stock_minimo: number;
  monto_compra_prom: number;
  monto_venta_unitario: number;
  porcentaje_iva?: number;
  porcentaje_ganancia?: number;
};

export const inventario: Inventario[] = [
  { inventario_id: 1, modelo_id: 1, sku: "CMP-SS318", nombre: "Compresor Wabco SS318", tipo: "compresor", condicion: "nuevo", cantidad_total: 12, cantidad_propia: 10, cantidad_cliente: 2, stock_minimo: 4, monto_compra_prom: 480000, monto_venta_unitario: 690000, porcentaje_iva: 19, porcentaje_ganancia: 43.75 },
  { inventario_id: 2, modelo_id: 2, sku: "VLV-LP4805", nombre: "Válvula descarga LP-4805", tipo: "valvula", condicion: "nuevo", cantidad_total: 3, cantidad_propia: 3, cantidad_cliente: 0, stock_minimo: 6, monto_compra_prom: 95000, monto_venta_unitario: 149000, porcentaje_iva: 19, porcentaje_ganancia: 56.84 },
  { inventario_id: 3, modelo_id: 3, sku: "EQP-BX2200", nombre: "Secador de aire BX-2200", tipo: "equipo", condicion: "nuevo", cantidad_total: 7, cantidad_propia: 7, cantidad_cliente: 0, stock_minimo: 3, monto_compra_prom: 310000, monto_venta_unitario: 455000, porcentaje_iva: 19, porcentaje_ganancia: 46.77 },
  { inventario_id: 4, modelo_id: 4, sku: "INS-KITSTD", nombre: "Kit de sellos estándar", tipo: "insumo", condicion: "NA", cantidad_total: 48, cantidad_propia: 48, cantidad_cliente: 0, stock_minimo: 20, monto_compra_prom: 12500, monto_venta_unitario: 21900, porcentaje_iva: 19, porcentaje_ganancia: 75.2 },
  { inventario_id: 5, modelo_id: 1, sku: "CMP-SS318-U", nombre: "Compresor Wabco SS318 reacond.", tipo: "compresor", condicion: "usado", cantidad_total: 2, cantidad_propia: 2, cantidad_cliente: 0, stock_minimo: 3, monto_compra_prom: 260000, monto_venta_unitario: 410000, porcentaje_iva: 19, porcentaje_ganancia: 57.69 },
  { inventario_id: 6, modelo_id: 4, sku: "INS-ACEITE", nombre: "Aceite lubricante 1L", tipo: "insumo", condicion: "NA", cantidad_total: 64, cantidad_propia: 64, cantidad_cliente: 0, stock_minimo: 25, monto_compra_prom: 4800, monto_venta_unitario: 8900, porcentaje_iva: 19, porcentaje_ganancia: 85.42 },
];

export type Equipo = {
  equipo_id: number;
  inventario_id: number;
  detalle_compra_id: number | null;
  serial: string;
  nombre: string;
  existe: boolean;
};

export const equipos: Equipo[] = [
  { equipo_id: 1, inventario_id: 3, detalle_compra_id: 4, serial: "BX2200-99110", nombre: "Secador de aire BX-2200", existe: true },
  { equipo_id: 2, inventario_id: 3, detalle_compra_id: 4, serial: "BX2200-99111", nombre: "Secador de aire BX-2200", existe: true },
];

export type Repuesto = {
  repuesto_id: number;
  inventario_id: number;
  detalle_compra_id: number | null;
  serial: string;
  nombre: string;
  estado: "nuevo" | "reparado" | "pendiente_reparacion";
  propietario: boolean;
  existe: boolean;
  costo_adquisicion: number;
  costo_reparacion: number;
  costo_total: number;
  monto_venta: number;
  utilidad: number;
};

export const repuestos: Repuesto[] = [
  { repuesto_id: 1, inventario_id: 1, detalle_compra_id: 1, serial: "SS318-A4410", nombre: "Compresor Wabco SS318", estado: "nuevo", propietario: false, existe: true, costo_adquisicion: 480000, costo_reparacion: 0, costo_total: 480000, monto_venta: 690000, utilidad: 210000 },
  { repuesto_id: 2, inventario_id: 1, detalle_compra_id: null, serial: "SS318-C7781", nombre: "Compresor cliente Andes", estado: "pendiente_reparacion", propietario: true, existe: true, costo_adquisicion: 0, costo_reparacion: 0, costo_total: 0, monto_venta: 0, utilidad: 0 },
  { repuesto_id: 3, inventario_id: 5, detalle_compra_id: 2, serial: "SS318-R2210", nombre: "Compresor reacondicionado", estado: "reparado", propietario: false, existe: true, costo_adquisicion: 260000, costo_reparacion: 74000, costo_total: 334000, monto_venta: 410000, utilidad: 76000 },
  { repuesto_id: 5, inventario_id: 2, detalle_compra_id: null, serial: "LP4805-C3312", nombre: "Válvula cliente Andes", estado: "pendiente_reparacion", propietario: true, existe: true, costo_adquisicion: 0, costo_reparacion: 0, costo_total: 0, monto_venta: 0, utilidad: 0 },
  { repuesto_id: 4, inventario_id: 2, detalle_compra_id: 3, serial: "LP4805-8890", nombre: "Válvula LP-4805", estado: "nuevo", propietario: false, existe: true, costo_adquisicion: 95000, costo_reparacion: 0, costo_total: 95000, monto_venta: 149000, utilidad: 54000 },
  { repuesto_id: 6, inventario_id: 1, detalle_compra_id: 1, serial: "SS318-B9921", nombre: "Compresor Wabco SS318 stock", estado: "nuevo", propietario: false, existe: true, costo_adquisicion: 480000, costo_reparacion: 0, costo_total: 480000, monto_venta: 690000, utilidad: 210000 },
  { repuesto_id: 7, inventario_id: 5, detalle_compra_id: 2, serial: "SS318-U3311", nombre: "Compresor Wabco SS318 Reacond. listo", estado: "reparado", propietario: false, existe: true, costo_adquisicion: 260000, costo_reparacion: 65000, costo_total: 325000, monto_venta: 410000, utilidad: 85000 },
];

export const tipos_servicios = [
  { tipo_servicio_id: 1, nombre: "Venta" },
  { tipo_servicio_id: 2, nombre: "Reparación" },
  { tipo_servicio_id: 3, nombre: "Recambio" },
];

export type ServicioCliente = {
  servicio_cliente_id: number;
  tipo_servicio_id: number;
  cliente_id: number;
  admin_id: string;
  fecha: string;
  monto_total_gravado?: number;
  monto_total_exento?: number;
  monto_subtotal: number;
  porcentaje_iva: number;
  monto_iva: number;
  monto_total: number;
  metodo_pago: string | null;
  num_referencia: string | null;
  fecha_entrega_reparacion: string | null;
  estado: "en proceso" | "finalizado";
  comprobante: string | null;
  last_update: string;
  reparacion_lista?: boolean;
};

export const servicios_clientes: ServicioCliente[] = [
  { servicio_cliente_id: 1041, tipo_servicio_id: 2, cliente_id: 1, admin_id: "ADM-001", fecha: "2026-09-01", monto_subtotal: 320000, porcentaje_iva: 19, monto_iva: 60800, monto_total: 380800, metodo_pago: null, num_referencia: null, fecha_entrega_reparacion: "2026-09-09", estado: "en proceso", comprobante: null, last_update: "2026-09-04", reparacion_lista: false },
  { servicio_cliente_id: 1042, tipo_servicio_id: 1, cliente_id: 2, admin_id: "ADM-001", fecha: "2026-09-02", monto_subtotal: 690000, porcentaje_iva: 19, monto_iva: 131100, monto_total: 821100, metodo_pago: "transferencia", num_referencia: "TRF-99120", fecha_entrega_reparacion: null, estado: "finalizado", comprobante: "BOL-000412", last_update: "2026-09-02" },
  { servicio_cliente_id: 1043, tipo_servicio_id: 3, cliente_id: 3, admin_id: "ADM-001", fecha: "2026-09-03", monto_subtotal: 410000, porcentaje_iva: 19, monto_iva: 77900, monto_total: 487900, metodo_pago: "efectivo", num_referencia: "EFE-0091", fecha_entrega_reparacion: null, estado: "finalizado", comprobante: "BOL-000415", last_update: "2026-09-03" },
  { servicio_cliente_id: 1044, tipo_servicio_id: 2, cliente_id: 4, admin_id: "ADM-001", fecha: "2026-08-28", monto_subtotal: 255000, porcentaje_iva: 19, monto_iva: 48450, monto_total: 303450, metodo_pago: null, num_referencia: null, fecha_entrega_reparacion: "2026-09-05", estado: "en proceso", comprobante: null, last_update: "2026-09-05", reparacion_lista: true },
  { servicio_cliente_id: 1045, tipo_servicio_id: 1, cliente_id: 1, admin_id: "ADM-001", fecha: "2026-08-25", monto_subtotal: 131400, porcentaje_iva: 19, monto_iva: 24966, monto_total: 156366, metodo_pago: "efectivo", num_referencia: "EFE-00231", fecha_entrega_reparacion: null, estado: "finalizado", comprobante: "BOL-000398", last_update: "2026-08-25" },
  { servicio_cliente_id: 1046, tipo_servicio_id: 3, cliente_id: 2, admin_id: "ADM-001", fecha: "2026-08-22", monto_subtotal: 149000, porcentaje_iva: 19, monto_iva: 28310, monto_total: 177310, metodo_pago: "cheque", num_referencia: "CHQ-7781", fecha_entrega_reparacion: null, estado: "finalizado", comprobante: "BOL-000371", last_update: "2026-08-22" },
];

export type ServicioTaller = {
  servicio_taller_id: number;
  nombre: string;
  tipo: "mecanico" | "electrico" | "neumatico" | "diagnostico";
  descripcion: string;
  costo: number;
};

export const servicios_taller: ServicioTaller[] = [
  { servicio_taller_id: 1, nombre: "Desarme y diagnóstico", tipo: "diagnostico", descripcion: "Inspección completa del compresor o válvula", costo: 45000 },
  { servicio_taller_id: 2, nombre: "Rectificado de cilindro", tipo: "mecanico", descripcion: "Mecanizado y rectificado de precisión", costo: 85000 },
  { servicio_taller_id: 3, nombre: "Cambio de kit de sellos", tipo: "neumatico", descripcion: "Reemplazo integral de sellos y empaquetaduras", costo: 38000 },
  { servicio_taller_id: 4, nombre: "Prueba de estanqueidad y presión", tipo: "diagnostico", descripcion: "Test riguroso en banco de pruebas neumáticas", costo: 27000 },
  { servicio_taller_id: 5, nombre: "Calibración de descarga", tipo: "neumatico", descripcion: "Ajuste fino de presión de corte", costo: 32000 },
  { servicio_taller_id: 6, nombre: "Limpieza por ultrasonido", tipo: "mecanico", descripcion: "Desengrase profundo de componentes", costo: 25000 },
];

export const servicios_catalogo = servicios_taller;

export type Reparacion = {
  reparacion_id: number;
  repuesto_id: number;
  servicio_cliente_id: number;
  estado: "pendiente" | "en proceso" | "finalizada";
  fecha_inicio: string;
  fecha_fin: string | null;
  admin_id_fecha_inicio?: string;
  admin_id_fecha_fin?: string | null;
  costo_servicios: number;
  costo_insumos: number;
  costo_total: number;
};

export const reparaciones: Reparacion[] = [
  { reparacion_id: 501, repuesto_id: 2, servicio_cliente_id: 1041, estado: "en proceso", fecha_inicio: "2026-09-01", fecha_fin: null, costo_servicios: 130000, costo_insumos: 34400, costo_total: 164400 },
  { reparacion_id: 503, repuesto_id: 5, servicio_cliente_id: 1041, estado: "en proceso", fecha_inicio: "2026-09-02", fecha_fin: null, costo_servicios: 27000, costo_insumos: 8900, costo_total: 35900 },
  { reparacion_id: 502, repuesto_id: 3, servicio_cliente_id: 1044, estado: "finalizada", fecha_inicio: "2026-08-28", fecha_fin: "2026-09-04", costo_servicios: 112000, costo_insumos: 21900, costo_total: 133900 },
];

export type ReparacionServicioTaller = {
  reparacion_servicio_taller_id: number;
  reparacion_id: number;
  servicio_taller_id: number;
  admin_id: string;
  cantidad: number;
  costo_unitario: number;
  total_linea: number;
  fecha_registro?: string;
  personal_ids: number[]; // reparaciones_servicios_taller_personal
};

export const reparaciones_servicios: ReparacionServicioTaller[] = [
  { reparacion_servicio_taller_id: 1, reparacion_id: 501, servicio_taller_id: 1, admin_id: "ADM-001", cantidad: 1, costo_unitario: 45000, total_linea: 45000, fecha_registro: "2026-09-01", personal_ids: [1, 3] },
  { reparacion_servicio_taller_id: 2, reparacion_id: 501, servicio_taller_id: 2, admin_id: "ADM-001", cantidad: 1, costo_unitario: 85000, total_linea: 85000, fecha_registro: "2026-09-02", personal_ids: [1] },
  { reparacion_servicio_taller_id: 3, reparacion_id: 503, servicio_taller_id: 4, admin_id: "ADM-001", cantidad: 1, costo_unitario: 27000, total_linea: 27000, fecha_registro: "2026-09-03", personal_ids: [4] },
];

export type ReparacionInsumo = {
  reparacion_insumo_id: number;
  reparacion_id: number;
  inventario_id: number;
  admin_id: string;
  cantidad: number;
  costo_unitario: number;
  total_linea: number;
  fecha_registro?: string;
};

export const reparaciones_insumos: ReparacionInsumo[] = [
  { reparacion_insumo_id: 1, reparacion_id: 501, inventario_id: 4, admin_id: "ADM-001", cantidad: 1, costo_unitario: 21900, total_linea: 21900, fecha_registro: "2026-09-01" },
  { reparacion_insumo_id: 2, reparacion_id: 501, inventario_id: 6, admin_id: "ADM-001", cantidad: 2, costo_unitario: 6250, total_linea: 12500, fecha_registro: "2026-09-03" },
  { reparacion_insumo_id: 3, reparacion_id: 503, inventario_id: 6, admin_id: "ADM-001", cantidad: 1, costo_unitario: 8900, total_linea: 8900, fecha_registro: "2026-09-04" },
];

export type Compra = {
  compra_id: number;
  proveedor_id: number;
  admin_id: string;
  num_factura_boleta: string;
  fecha_compra: string;
  tipo_pago: "contado" | "credito";
  dias_credito: number;
  fecha_vencimiento: string | null;
  estado: "pagado" | "pagado_parcial";
  monto_total_gravado?: number;
  monto_total_exento?: number;
  subtotal: number;
  porcentaje_iva: number;
  monto_iva: number;
  monto_total: number;
  monto_pendiente: number;
  porc_anticipo: number;
};

export const compras: Compra[] = [
  { compra_id: 301, proveedor_id: 1, admin_id: "ADM-001", num_factura_boleta: "F-114520", fecha_compra: "2026-08-12", tipo_pago: "credito", dias_credito: 30, fecha_vencimiento: "2026-09-11", estado: "pagado_parcial", subtotal: 2400000, porcentaje_iva: 19, monto_iva: 456000, monto_total: 2856000, monto_pendiente: 1428000, porc_anticipo: 50 },
  { compra_id: 302, proveedor_id: 2, admin_id: "ADM-001", num_factura_boleta: "F-778901", fecha_compra: "2026-08-20", tipo_pago: "credito", dias_credito: 45, fecha_vencimiento: "2026-10-04", estado: "pagado_parcial", subtotal: 950000, porcentaje_iva: 19, monto_iva: 180500, monto_total: 1130500, monto_pendiente: 904400, porc_anticipo: 20 },
  { compra_id: 303, proveedor_id: 3, admin_id: "ADM-001", num_factura_boleta: "B-002214", fecha_compra: "2026-08-30", tipo_pago: "contado", dias_credito: 0, fecha_vencimiento: null, estado: "pagado", subtotal: 480000, porcentaje_iva: 19, monto_iva: 91200, monto_total: 571200, monto_pendiente: 0, porc_anticipo: 100 },
];

export const pagos_compras = [
  { pago_compra_id: 1, compra_id: 301, monto_abonado: 1428000, fecha_pago: "2026-08-12", metodo_pago: "transferencia" as const, num_referencia: "TRF-55120", comprobante: "CMP-001" },
  { pago_compra_id: 2, compra_id: 302, monto_abonado: 226100, fecha_pago: "2026-08-20", metodo_pago: "cheque" as const, num_referencia: "CHQ-9921", comprobante: "CMP-002" },
];

export const flujoMensual = [
  { mes: "Abr", ingresos: 4200000, egresos: 2650000 },
  { mes: "May", ingresos: 5100000, egresos: 3120000 },
  { mes: "Jun", ingresos: 4750000, egresos: 2980000 },
  { mes: "Jul", ingresos: 6100000, egresos: 3450000 },
  { mes: "Ago", ingresos: 5850000, egresos: 3980000 },
  { mes: "Sep", ingresos: 3120000, egresos: 1740000 },
];

export const actividadServicios = [
  { tipo: "Venta", cantidad: 42, monto: 12400000 },
  { tipo: "Reparación", cantidad: 28, monto: 7850000 },
  { tipo: "Recambio", cantidad: 17, monto: 4310000 },
];

export const clp = (n: number) =>
  new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP", maximumFractionDigits: 0 }).format(n || 0);

export const nombreCliente = (id: number) => clientes.find((c) => c.cliente_id === id)?.nombre ?? "—";
export const nombreTipoServicio = (id: number) => tipos_servicios.find((t) => t.tipo_servicio_id === id)?.nombre ?? "—";
export const nombreProveedor = (id: number) => proveedores.find((p) => p.proveedor_id === id)?.nombre ?? "—";

// ---- Helpers adicionales ----
export const modeloById = (id: number) => modelos.find((m) => m.modelo_id === id);
export const marcaById = (id: number) => marcas.find((m) => m.marca_id === id);
export const nombreModelo = (id: number) => modeloById(id)?.nombre ?? "—";
export const nombreMarca = (id: number) => marcaById(id)?.nombre ?? "—";
export const marcaDeModelo = (modelo_id: number) => {
  const mo = modeloById(modelo_id);
  return mo ? nombreMarca(mo.marca_id) : "—";
};
export const invById = (id: number) => inventario.find((i) => i.inventario_id === id);
export const nombrePersonal = (id: number) => personal.find((p) => p.personal_id === id)?.nombre ?? "—";
export const nombreServicioCat = (id: number) =>
  servicios_taller.find((s) => s.servicio_taller_id === id)?.nombre ?? "—";

export const detalles_compras = [
  { detalle_compra_id: 1, compra_id: 301, inventario_id: 1, cantidad: 4, costo_unitario: 480000, total_linea: 1920000 },
  { detalle_compra_id: 2, compra_id: 301, inventario_id: 5, cantidad: 2, costo_unitario: 240000, total_linea: 480000 },
  { detalle_compra_id: 3, compra_id: 302, inventario_id: 2, cantidad: 10, costo_unitario: 95000, total_linea: 950000 },
  { detalle_compra_id: 4, compra_id: 303, inventario_id: 3, cantidad: 2, costo_unitario: 240000, total_linea: 480000 },
];

/** Repuestos asociados a cada servicio de reparación (un servicio puede traer varios). */
export const reparacionesPorServicio: Record<number, number[]> = {
  1041: [501, 503],
  1044: [502],
};

export const ingresosPorTipo = {
  venta: { ingresos: 12400000, egresos: 7900000 },
  recambio: { ingresos: 4310000, egresos: 2480000 },
  reparacion: { ingresos: 7850000, egresos: 3960000 },
};

export const rankingVentas = [
  { nombre: "Compresor Wabco SS318", tipo: "compresor", unidades: 18, ingresos: 12420000, margen: 3780000 },
  { nombre: "Kit de sellos estándar", tipo: "insumo", unidades: 96, ingresos: 2102400, margen: 902400 },
  { nombre: "Aceite lubricante 1L", tipo: "insumo", unidades: 140, ingresos: 1246000, margen: 574000 },
  { nombre: "Válvula descarga LP-4805", tipo: "valvula", unidades: 22, ingresos: 3278000, margen: 1188000 },
  { nombre: "Secador de aire BX-2200", tipo: "equipo", unidades: 9, ingresos: 4095000, margen: 1305000 },
];
