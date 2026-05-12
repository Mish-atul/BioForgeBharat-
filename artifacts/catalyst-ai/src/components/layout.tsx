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
  ChevronLeft
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: Activity },
  { href: "/reactions", label: "Reactions Library", icon: Beaker },
  { href: "/pathway", label: "Synthetic Biology", icon: Dna },
  { href: "/experiments", label: "Experiments Log", icon: Network },
  { href: "/annotations", label: "Annotations", icon: Database },
  { href: "/retraining", label: "Model Retraining", icon: Settings2 },
];

const pageVariants = {
  initial: { opacity: 0, scale: 0.98, filter: "blur(8px)" },
  animate: { opacity: 1, scale: 1, filter: "blur(0px)", transition: { duration: 0.5, ease: [0.32, 0.72, 0, 1] as const } },
  exit: { opacity: 0, scale: 0.98, filter: "blur(8px)", transition: { duration: 0.3 } },
};

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();

  if (location === "/") {
    return <div className="min-h-screen bg-[#050505] text-white font-sans">{children}</div>;
  }

  return (
    <div className="min-h-screen flex bg-[#050505] text-white font-sans overflow-hidden">
      {/* Abstract Background for Dashboard */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(0,0,0,0)_0%,#050505_100%)] z-10" />
        <div className="absolute inset-0 opacity-[0.02] mix-blend-overlay z-20" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }} />
        <div className="absolute top-0 right-0 w-[50vw] h-[50vw] bg-emerald-500/10 blur-[120px] rounded-full translate-x-1/3 -translate-y-1/3" />
        <div className="absolute bottom-0 left-0 w-[40vw] h-[40vw] bg-cyan-600/10 blur-[100px] rounded-full -translate-x-1/3 translate-y-1/3" />
      </div>

      {/* Sidebar */}
      <div className="w-72 border-r border-white/5 bg-black/40 backdrop-blur-3xl flex-shrink-0 hidden md:flex flex-col z-30 shadow-[4px_0_24px_rgba(0,0,0,0.5)]">
        <div className="h-20 flex items-center px-8 border-b border-white/5">
          <Link href="/">
            <div className="flex items-center gap-3 font-bold tracking-wider cursor-pointer group">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-600 p-[1px] group-hover:scale-105 transition-transform duration-500">
                <div className="w-full h-full rounded-full bg-[#050505] flex items-center justify-center">
                  <Dna className="w-4 h-4 text-emerald-400" />
                </div>
              </div>
              <span className="text-white/90">BioForgeBharat</span>
            </div>
          </Link>
        </div>
        
        <div className="flex-1 py-8 px-4 flex flex-col gap-2 overflow-y-auto">
          {navItems.map((item, i) => {
            const isActive = location === item.href || (item.href !== "/dashboard" && location.startsWith(item.href));
            return (
              <Link key={item.href} href={item.href}>
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08, duration: 0.5, ease: [0.32, 0.72, 0, 1] as const }}
                  className={cn(
                    "group relative flex items-center gap-4 px-4 py-3 rounded-2xl cursor-pointer transition-all duration-300",
                    isActive 
                      ? "bg-white/10 text-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]" 
                      : "text-white/50 hover:bg-white/5 hover:text-white/90"
                  )}
                >
                  {isActive && (
                    <motion.div
                      layoutId="sidebar-indicator"
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-emerald-400 rounded-r-full shadow-[0_0_12px_rgba(52,211,153,0.8)]"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                  <item.icon className={cn("w-5 h-5 transition-transform duration-300", isActive ? "text-emerald-400" : "group-hover:scale-110")} />
                  <span className="text-sm font-medium tracking-wide">{item.label}</span>
                </motion.div>
              </Link>
            );
          })}
        </div>
        
        <div className="p-6 border-t border-white/5 bg-black/20">
          <Link href="/">
            <button className="group relative w-full px-4 py-3 text-xs font-semibold tracking-widest uppercase rounded-full bg-white/[0.03] hover:bg-white/10 text-white/70 hover:text-white overflow-hidden active:scale-[0.98] transition-all duration-300 ease-out border border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]">
              <span className="relative z-10 flex items-center justify-center gap-2">
                <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-300" />
                Back to Home
              </span>
            </button>
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden relative z-20">
        <header className="h-16 border-b border-white/5 bg-black/40 backdrop-blur-xl flex items-center px-6 gap-4 md:hidden shadow-lg z-50">
          <Button variant="ghost" size="icon" className="md:hidden text-white hover:bg-white/10">
            <Menu className="w-5 h-5" />
          </Button>
          <Link href="/">
            <div className="flex items-center gap-2 font-bold cursor-pointer">
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-600 p-[1px]">
                <div className="w-full h-full rounded-full bg-[#050505] flex items-center justify-center">
                  <Dna className="w-3 h-3 text-emerald-400" />
                </div>
              </div>
              <span className="text-white">BioForgeBharat</span>
            </div>
          </Link>
        </header>
        
        <main className="flex-1 overflow-auto p-6 md:p-10 relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={location}
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="max-w-7xl mx-auto space-y-8"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
