export function Logo({ className = "h-9" }: { className?: string }) {
  return <img src="/solo-aire-logo.png" alt="Solo Aire SPA" className={`${className} w-auto object-contain`} />;
}
