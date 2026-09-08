# Soloaires Operations

Build a clean, minimalist, and serious ERP/POS web application prototype for "SoloairesSPA" using React, Tailwind CSS, and Lucide React icons.

### BRAND ASSETS & DESIGN SYSTEM (Meta Ads Manager Style):

- Company Logo: Incorporate the official "SOLO AIRE SPA" company logo (truck emblem with blue accents) prominently in the top-left header/sidebar branding area across all views and prominently centered above the login form.

- Aesthetic: Ultra-clean, professional, corporate, and minimalist. Avoid visual noise, unnecessary decorative icons, or saturated colors.

- Color Palette: Neutral white (#FFFFFF) and light slate (#F8FAFC) backgrounds, thin subtle borders (#E2E8F0), dark slate typography (#0F172A), and a single primary Meta Blue (#0866FF) matching the brand logo's primary blue for action buttons and active states.

- Tables & Data Density: Compact row height for clear data scanning, subtle line separators, and muted background status pills (e.g., bg-amber-50 text-amber-700 for 'en proceso', bg-emerald-50 text-emerald-700 for 'finalizado').

- Layout: Top header bar + collapsible left sidebar navigation.

---

### DATABASE FIELD REQUIREMENTS (STRICT SCHEMA MAPPING):

Ensure all forms and data tables strictly utilize the following database fields:

- admins: admin_id, nombre, ruc, correo, num_tlf, ubicacion

- personal: personal_id, nombre, ruc, correo, num_tlf, ubicacion, disponible (boolean)

- marcas & modelos: marca_id, modelo_id, nombre, descripcion

- inventario: inventario_id, modelo_id, sku, nombre, tipo ('insumo', 'compresor', 'valvula', 'equipo'), condicion ('nuevo', 'usado', 'NA'), cantidad_total, cantidad_propia, cantidad_cliente, stock_minimo, monto_compra_prom, monto_venta_unitario

- equipos: equipo_id, inventario_id, detalle_compra_id, serial, nombre, existe (boolean)

- repuestos: repuesto_id, inventario_id, detalle_compra_id, serial, nombre, estado ('nuevo', 'reparado', 'pendiente_reparacion'), propietario (boolean), existe (boolean), costo_adquisicion, costo_reparacion, costo_total, monto_venta, utilidad

- compras & detalles_compras: compra_id, proveedor_id, admin_id, num_factura_boleta, fecha_compra, tipo_pago ('contado', 'credito'), dias_credito, fecha_vencimiento, estado ('pagado', 'pagado_parcial'), subtotal, porcentaje_iva, monto_iva, monto_total, monto_pendiente, porc_anticipo

- pagos_compras: pago_compra_id, compra_id, monto_abonado, fecha_pago, metodo_pago ('transferencia', 'efectivo', 'cheque'), num_referencia, comprobante

- proveedores: proveedor_id, nombre, ruc, correo, num_tlf, ubicacion

- servicios_clientes: servicio_cliente_id, tipo_servicio_id, cliente_id, admin_id, fecha, monto_subtotal, porcentaje_iva, monto_iva, monto_total, metodo_pago, num_referencia, fecha_entrega_reparacion, estado ('en proceso', 'finalizado'), comprobante, last_update

- detalles_servicios_cliente: detalle_servicio_id, servicio_cliente_id, inventario_id, repuesto_saliente_id, repuesto_entrante_id, cantidad, precio_unitario, monto_total_linea

- tipos_servicios: tipo_servicio_id (1: Venta, 2: Reparación, 3: Recambio)

- clientes: cliente_id, nombre, ruc, correo, num_tlf, ubicacion

- servicios (Catálogo MO): servicio_id, nombre, descripcion, costo

- reparaciones: reparacion_id, repuesto_id, servicio_cliente_id, estado ('pendiente', 'en proceso', 'finalizada'), fecha_inicio, fecha_fin, costo_servicios, costo_insumos, costo_total

- reparaciones_servicios & personal: reparacion_servicio_id, reparacion_id, servicio_id, admin_id, cantidad, costo_unitario, total_linea, personal_id

- reparaciones_insumos: reparacion_insumo_id, reparacion_id, inventario_id, admin_id, cantidad, costo_unitario, total_linea

- variables: variable_id, nombre, valor, tipo ('porcentaje_iva', 'porcentaje_ganancia', 'calculo_ganancia')

---

### APPLICATION VIEWS TO IMPLEMENT:

1. LOGIN VIEW

- Minimalist card layout prominently displaying the "SOLO AIRE SPA" company logo at the top.

- Clean input fields for email/RUC and password, with a primary blue "Iniciar Sesión" button.

2. EXECUTIVE DASHBOARD & GLOBAL NAVIGATION

- Persistent Header: Top bar featuring the "SOLO AIRE SPA" brand logo on the left, Global Search bar, Dark/Light theme toggle switch, and Admin profile badge ("admin_id: ADM-001").

- Persistent Sidebar: Collapsible navigation menu linking to all module views.

- Metric Cards: Total Revenue, Active Repairs Count, Pending Supplier Debts, Low Stock Alerts.

- Analytical Chart: Service activity breakdown (Venta, Reparación, Recambio).

- Recent Services Table with quick status badges.

3. CLIENT IDENTIFICATION & SERVICE SELECTION

- Client search by RUC or name.

- Modal/Form to register new client if missing.

- Cards to select service type (`tipo_servicio_id`: Venta, Reparación, Recambio).

4. GENERAL SERVICES MANAGEMENT VIEW (TABLA GENERAL DE SERVICIOS DE CLIENTES)

- High-density table listing all records from `servicios_clientes`.

- Contextual action buttons:

  - 'en proceso' + Reparación $\rightarrow$ "Módulo de Reparación" button (redirects to VIEW 9).

  - Completed repair ready for pickup $\rightarrow$ "Finalizar / Registrar Pago" button (redirects to VIEW 8).

  - 'finalizado' $\rightarrow$ "Ver Comprobante" button.

5. RECAMBIO (PARTS EXCHANGE) VIEW

- Form mapping `detalles_servicios_cliente`: select `inventario_id`, link `repuesto_saliente_id` (from stock), register incoming customer part `repuesto_entrante_id` (`serial`), and calculate line total.

6. REPAIR INTAKE VIEW

- Clean intake form: select `cliente_id`, register customer part in `repuestos` (`serial`, `propietario=true`, `estado='pendiente_reparacion'`), assign `fecha_entrega_reparacion`, and create initial `reparaciones` record.

7. DIRECT SALES (POS) VIEW

- Clean list of items in `inventario` with real-time cart sidebar calculating subtotal, IVA (`variables`), and total.

8. CLIENT PAYMENT REGISTRATION VIEW

- Summary panel of `servicios_clientes` with payment method selector (`metodo_pago`), reference input, and payment confirmation button.

9. WORKSHOP REPAIR EXECUTION VIEW

- Dynamic repair execution module for selected `reparacion_id`.

- Add/Edit labor services (`reparaciones_servicios`), assign technicians (`personal`), and record consumed spare parts (`reparaciones_insumos`). Shows pre-populated data if previously registered.

10. FINANCIAL & ECONOMIC DASHBOARD VIEW (INFORMACIÓN ECONÓMICA Y FINANZAS)

- Executive financial summary: Total Revenue, Total Operational Expenses, Net Profit Margin, Accounts Payable Balance.

- Charts: Monthly Cash Flow (Income vs Expenses) and Revenue Breakdown by Service Type.

11. PERSONNEL DIRECTORY VIEW

- Minimalist table of `personal` with contact details and availability (`disponible`) toggle switch.

12. SUPPLIER PURCHASE INTAKE VIEW

- Form for `compras` and `detalles_compras`: select supplier, invoice number, items, and payment terms ('contado' vs 'credito' with down payment `porc_anticipo`).

13. SUPPLIER ACCOUNTS PAYABLE VIEW

- Table of pending credit purchases showing `monto_pendiente` and `fecha_vencimiento`. Modal to register partial or total payments (`pagos_compras`).

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/d9ccef5d-a8fb-4f8c-9ac1-1be7169dee9c).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
