import { Link, useLocation } from "wouter";
import { Layers, Server, Shield, FileText, Activity } from "lucide-react";
import { ReactNode } from "react";

const navItems = [
  { href: "/", label: "Groups", icon: Layers },
  { href: "/gateways", label: "Gateways", icon: Server },
  { href: "/secrets", label: "Secrets", icon: Shield },
  { href: "/logs", label: "Logs", icon: FileText },
  { href: "/health-check", label: "Health", icon: Activity },
];

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [location] = useLocation();

  return (
    <div className="flex h-screen w-full bg-background text-foreground overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-16 border-r border-border bg-sidebar shrink-0">
        <div className="flex-1 flex flex-col items-center gap-4 py-4">
          {navItems.map((item) => {
            const isActive = location === item.href || (item.href !== "/" && location.startsWith(item.href));
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`p-3 rounded-lg flex items-center justify-center transition-colors ${
                  isActive ? "bg-sidebar-accent text-sidebar-accent-foreground" : "text-muted-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                }`}
                title={item.label}
                data-testid={`link-sidebar-${item.label.toLowerCase()}`}
              >
                <Icon size={20} />
              </Link>
            );
          })}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-y-auto pb-16 md:pb-0 relative">
        <div className="flex-1 p-4 md:p-8 max-w-4xl mx-auto w-full">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Tab Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 border-t border-border bg-background z-50 flex">
        {navItems.map((item) => {
          const isActive = location === item.href || (item.href !== "/" && location.startsWith(item.href));
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex-1 flex flex-col items-center justify-center gap-1 transition-colors ${
                isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
              }`}
              data-testid={`link-tab-${item.label.toLowerCase()}`}
            >
              <Icon size={20} />
              <span className="text-[10px]">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}