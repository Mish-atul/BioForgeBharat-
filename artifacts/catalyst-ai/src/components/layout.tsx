import React from "react";
import { Link, useLocation } from "wouter";
import { 
  Beaker, 
  Dna, 
  Activity, 
  Network, 
  Database, 
  Settings2,
  Menu,
  ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: Activity },
  { href: "/reactions", label: "Reactions Library", icon: Beaker },
  { href: "/pathway", label: "Synthetic Biology", icon: Dna },
  { href: "/experiments", label: "Experiments Log", icon: Network },
  { href: "/annotations", label: "Annotations", icon: Database },
  { href: "/retraining", label: "Model Retraining", icon: Settings2 },
];

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();

  if (location === "/") {
    return <div className="min-h-screen bg-background text-foreground dark">{children}</div>;
  }

  return (
    <div className="min-h-screen flex bg-background text-foreground dark">
      {/* Sidebar */}
      <div className="w-64 border-r border-border bg-sidebar flex-shrink-0 hidden md:flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-border">
          <div className="flex items-center gap-2 text-primary font-bold tracking-wider">
            <Dna className="w-5 h-5" />
            <span>BioForgeBharat</span>
          </div>
        </div>
        <div className="flex-1 py-6 px-3 flex flex-col gap-1">
          {navItems.map((item) => {
            const isActive = location === item.href || (item.href !== "/dashboard" && location.startsWith(item.href));
            return (
              <Link key={item.href} href={item.href}>
                <div 
                  className={`flex items-center gap-3 px-3 py-2 rounded-md cursor-pointer transition-colors ${
                    isActive 
                      ? "bg-primary/10 text-primary border border-primary/20" 
                      : "text-sidebar-foreground hover:bg-sidebar-accent"
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  <span className="text-sm font-medium">{item.label}</span>
                </div>
              </Link>
            );
          })}
        </div>
        <div className="p-4 border-t border-border">
          <div className="text-xs text-muted-foreground">NammaNexus Demo</div>
          <div className="flex items-center gap-2 mt-1">
            <div className="w-2 h-2 rounded-full bg-accent animate-pulse"></div>
            <span className="text-xs text-foreground font-mono">SANDBOX READY</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 border-b border-border bg-background/50 backdrop-blur flex items-center px-6 gap-4 md:hidden">
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-2 text-primary font-bold">
            <Dna className="w-5 h-5" />
            <span>BioForgeBharat</span>
          </div>
        </header>
        <main className="flex-1 overflow-auto p-6 md:p-8">
          <div className="max-w-7xl mx-auto space-y-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
