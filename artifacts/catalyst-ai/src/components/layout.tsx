import React from "react";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Beaker, 
  Dna, 
  Activity, 
  Network, 
  Database, 
  Settings2,
  Menu,
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

const pageVariants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" as const } },
  exit: { opacity: 0, y: -6, transition: { duration: 0.2 } },
};

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
          <Link href="/">
            <div className="flex items-center gap-2 text-primary font-bold tracking-wider cursor-pointer hover:opacity-80 transition-opacity">
              <Dna className="w-5 h-5" />
              <span>BioForgeBharat</span>
            </div>
          </Link>
        </div>
        <div className="flex-1 py-6 px-3 flex flex-col gap-1">
          {navItems.map((item, i) => {
            const isActive = location === item.href || (item.href !== "/dashboard" && location.startsWith(item.href));
            return (
              <Link key={item.href} href={item.href}>
                <motion.div
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05, duration: 0.3, ease: "easeOut" }}
                  className={`relative flex items-center gap-3 px-3 py-2 rounded-md cursor-pointer transition-all duration-200 ${
                    isActive 
                      ? "bg-primary/10 text-primary border border-primary/20" 
                      : "text-sidebar-foreground hover:bg-sidebar-accent hover:translate-x-0.5"
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="sidebar-indicator"
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-primary rounded-r-full"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                  <item.icon className="w-4 h-4" />
                  <span className="text-sm font-medium">{item.label}</span>
                </motion.div>
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
          <Link href="/">
            <div className="flex items-center gap-2 text-primary font-bold cursor-pointer">
              <Dna className="w-5 h-5" />
              <span>BioForgeBharat</span>
            </div>
          </Link>
        </header>
        <main className="flex-1 overflow-auto p-6 md:p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={location}
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="max-w-7xl mx-auto space-y-6"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
