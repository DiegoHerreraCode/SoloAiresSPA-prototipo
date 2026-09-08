import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Logo } from "@/components/app/Logo";
import { btnPrimary, inputCls } from "@/components/app/AppLayout";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Iniciar sesión — Solo Aire SPA ERP" },
      { name: "description", content: "Acceso al sistema ERP/POS de Solo Aire SPA: servicios, taller, inventario y finanzas." },
      { property: "og:title", content: "Iniciar sesión — Solo Aire SPA ERP" },
      { property: "og:description", content: "Acceso al sistema ERP/POS de Solo Aire SPA." },
    ],
  }),
  component: Login,
});

function Login() {
  const navigate = useNavigate();
  const [correo, setCorreo] = useState("diego@soloaire.cl");
  const [pass, setPass] = useState("••••••••");

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex justify-center">
          <Logo className="h-20 drop-shadow-xs" />
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            navigate({ to: "/dashboard" });
          }}
          className="rounded-2xl border border-border/70 bg-card p-7 shadow-xs backdrop-blur-xs"
        >
          <h1 className="text-lg font-semibold tracking-tight text-foreground">Iniciar sesión</h1>
          <p className="mt-1 text-xs text-muted-foreground">Sistema de gestión integral Solo Aire SPA</p>

          <div className="mt-6 space-y-4">
            <label className="block">
              <span className="mb-1.5 block text-xs font-medium text-muted-foreground">
                Correo corporativo
              </span>
              <input
                suppressHydrationWarning
                className={inputCls}
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs font-medium text-muted-foreground">Contraseña</span>
              <input
                suppressHydrationWarning
                type="password"
                className={inputCls}
                value={pass}
                onChange={(e) => setPass(e.target.value)}
              />
            </label>
          </div>

          <button
            suppressHydrationWarning
            type="submit"
            className={`${btnPrimary} mt-6 w-full justify-center shadow-xs`}
          >
            Iniciar Sesión
          </button>
          <p className="mt-5 text-center text-xs text-muted-foreground/80">
            ¿Olvidaste tus credenciales? Contacta a soporte técnico.
          </p>
        </form>
      </div>
    </div>
  );
}
