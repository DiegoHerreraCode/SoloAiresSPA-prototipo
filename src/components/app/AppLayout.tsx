import { Link, useRouterState } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import {
  LayoutDashboard,
  Users,
  ClipboardList,
  Repeat,
  Wrench,
  ShoppingCart,
  LineChart,
  Boxes,
  Tags,
  Layers,
  Truck,
  ListChecks,
  IdCard,
  PackagePlus,
  Receipt,
  Sliders,
  Moon,
  Sun,
  PanelLeftClose,
  PanelLeft,
  X,
} from "lucide-react";
import { Logo } from "./Logo";
import { admin } from "@/lib/mock-data";

const nav = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/clientes", label: "Clientes y servicio", icon: Users },
  { to: "/servicios", label: "Servicios de clientes", icon: ClipboardList },
  { to: "/pos", label: "Venta directa", icon: ShoppingCart },
  { to: "/recambio", label: "Recambio", icon: Repeat },
  { to: "/reparacion", label: "Ingreso a reparación", icon: Wrench },
  { to: "/inventario", label: "Inventario", icon: Boxes },
  { to: "/servicios-taller", label: "Servicios del taller", icon: ListChecks },
  { to: "/personal", label: "Personal", icon: IdCard },
  { to: "/compras", label: "Compras a proveedor", icon: PackagePlus },
  { to: "/cuentas-por-pagar", label: "Cuentas por pagar", icon: Receipt },
  { to: "/proveedores", label: "Proveedores", icon: Truck },
  { to: "/marcas", label: "Marcas", icon: Tags },
  { to: "/modelos", label: "Modelos", icon: Layers },
  { to: "/variables", label: "Variables", icon: Sliders },
  { to: "/finanzas", label: "Finanzas", icon: LineChart },
] as const;

export function AppLayout({
  title,
  description,
  children,
  actions,
}: {
  title: string;
  description?: string;
  children: ReactNode;
  actions?: ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [dark, setDark] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  return (
    <div className="min-h-screen bg-muted/40 text-foreground antialiased selection:bg-primary/15 selection:text-primary">
      {/* Header minimalista y suave */}
      <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border/60 bg-background/90 px-4 backdrop-blur-md">
        <button
          onClick={() => setCollapsed((c) => !c)}
          className="rounded-lg p-2 text-muted-foreground transition-all hover:bg-muted/70 hover:text-foreground"
          aria-label="Alternar menú"
        >
          {collapsed ? <PanelLeft className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
        </button>

        <Link to="/dashboard" className="flex items-center gap-2 pl-1 transition-opacity hover:opacity-85">
          <Logo className="h-8" />
        </Link>

        <div className="ml-auto flex items-center gap-3">
          <button
            onClick={() => setDark((d) => !d)}
            className="rounded-lg p-2 text-muted-foreground transition-all hover:bg-muted/70 hover:text-foreground"
            aria-label="Cambiar tema"
          >
            {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>

          <div className="flex items-center gap-2.5 rounded-full border border-border/60 bg-card/60 px-3 py-1 shadow-xs">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/15 text-[11px] font-semibold text-primary">
              DH
            </div>
            <div className="hidden leading-none sm:block">
              <p className="text-xs font-medium text-foreground">{admin.nombre}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">{admin.admin_id}</p>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar minimalista con bordes redondeados y navegación espaciada */}
        <aside
          className={`sticky top-14 hidden h-[calc(100vh-3.5rem)] shrink-0 border-r border-border/50 bg-sidebar/50 backdrop-blur-xs transition-all duration-200 md:block ${
            collapsed ? "w-16" : "w-60"
          }`}
        >
          <nav className="flex flex-col gap-1 p-3">
            {nav.map((item) => {
              const active = pathname === item.to;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  title={item.label}
                  className={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-normal transition-all duration-150 ${
                    active
                      ? "bg-primary/10 font-medium text-primary shadow-xs"
                      : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                  }`}
                >
                  <item.icon className={`h-4 w-4 shrink-0 transition-transform ${active ? "text-primary scale-105" : "text-muted-foreground/80"}`} />
                  {!collapsed && <span className="truncate">{item.label}</span>}
                </Link>
              );
            })}
          </nav>
        </aside>

        <main className="min-w-0 flex-1">
          {/* Header de página más limpio y con tipografía relajada */}
          <div className="border-b border-border/40 bg-background/50 px-6 py-5 backdrop-blur-xs">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h1 className="text-xl font-semibold tracking-tight text-foreground">{title}</h1>
                {description && <p className="text-xs text-muted-foreground mt-0.5 font-normal">{description}</p>}
              </div>
              {actions && <div className="flex items-center gap-2">{actions}</div>}
            </div>
          </div>
          <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl border border-border/60 bg-card text-card-foreground shadow-xs transition-shadow duration-200 ${className}`}>
      {children}
    </div>
  );
}

export function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-muted-foreground/90">{label}</span>
      {children}
    </label>
  );
}

export const inputCls =
  "h-9 w-full rounded-xl border border-border/70 bg-background/80 px-3.5 text-sm text-foreground placeholder:text-muted-foreground/60 shadow-2xs outline-none transition-all duration-150 focus:border-primary/80 focus:ring-2 focus:ring-primary/15";

export const btnPrimary =
  "inline-flex h-9 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-medium text-primary-foreground shadow-xs transition-all duration-150 hover:bg-primary/90 hover:shadow-sm active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 cursor-pointer";

export const btnGhost =
  "inline-flex h-8 items-center justify-center gap-1.5 rounded-xl border border-border/70 bg-background/80 px-3 text-xs font-medium text-foreground/80 shadow-2xs transition-all duration-150 hover:bg-muted/70 hover:text-foreground active:scale-[0.98] cursor-pointer";

export function Modal({
  open,
  onClose,
  title,
  children,
  wide,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  wide?: boolean;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 sm:p-6 backdrop-blur-xs">
      <div
        className={`flex max-h-[90vh] w-full flex-col ${
          wide ? "max-w-3xl" : "max-w-lg"
        } rounded-2xl border border-border/70 bg-background shadow-2xl duration-200 animate-in fade-in zoom-in-95`}
      >
        {/* Modal Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-border/50 px-6 py-4">
          <p className="text-base font-semibold tracking-tight text-foreground">{title}</p>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-muted-foreground/70 transition-colors hover:bg-muted/80 hover:text-foreground cursor-pointer"
            aria-label="Cerrar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="overflow-y-auto overscroll-contain p-6">{children}</div>
      </div>
    </div>
  );
}

export function Toolbar({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-wrap items-end gap-3.5 border-b border-border/40 p-4.5 bg-muted/15">{children}</div>
  );
}

export const selectCls = inputCls;
