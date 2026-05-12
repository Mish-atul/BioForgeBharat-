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
  { href: "/dashboard", label: "Dashboard", icon: Activity, color: "text-rose-400", glow: "bg-rose-500" },
  { href: "/reactions", label: "Reactions", icon: Beaker, color: "text-blue-400", glow: "bg-blue-500" },
  { href: "/pathway", label: "Synthesis", icon: Dna, color: "text-fuchsia-400", glow: "bg-fuchsia-500" },
  { href: "/experiments", label: "Experiments", icon: Network, color: "text-orange-400", glow: "bg-orange-500" },
  { href: "/annotations", label: "Annotations", icon: Database, color: "text-yellow-400", glow: "bg-yellow-500" },
  { href: "/retraining", label: "Retraining", icon: Settings2, color: "text-cyan-400", glow: "bg-cyan-500" },
];

const pageVariants = {
  initial: { opacity: 0, scale: 0.95, filter: "blur(10px)", y: 20 },
  animate: { opacity: 1, scale: 1, filter: "blur(0px)", y: 0, transition: { duration: 0.5, type: "spring", bounce: 0.4 } },
  exit: { opacity: 0, scale: 0.95, filter: "blur(10px)", y: -20, transition: { duration: 0.3 } },
};

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();

  if (location === "/") {
    return <div className="min-h-screen bg-[#050505] text-white font-sans">{children}</div>;
  }

  return (
    <div className="min-h-screen flex bg-[#030005] text-white font-sans overflow-hidden">
      {/* Abstract Chaotic Background for Dashboard */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(0,0,0,0)_0%,#030005_100%)] z-10" />
        <div className="absolute inset-0 opacity-[0.04] mix-blend-overlay z-20" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.85%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }} />
        
        {/* Vibrant glowing orbs */}
        <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }} transition={{ duration: 5, repeat: Infinity }} className="absolute top-0 right-0 w-[60vw] h-[60vw] bg-fuchsia-600/20 blur-[130px] rounded-full translate-x-1/3 -translate-y-1/3" />
        <motion.div animate={{ scale: [1, 1.3, 1], opacity: [0.1, 0.25, 0.1] }} transition={{ duration: 7, repeat: Infinity, delay: 1 }} className="absolute bottom-0 left-0 w-[50vw] h-[50vw] bg-blue-600/20 blur-[120px] rounded-full -translate-x-1/3 translate-y-1/3" />
        <motion.div animate={{ scale: [1, 1.1, 1], opacity: [0.05, 0.15, 0.05] }} transition={{ duration: 4, repeat: Infinity, delay: 2 }} className="absolute top-1/2 left-1/2 w-[40vw] h-[40vw] bg-orange-500/20 blur-[100px] rounded-full -translate-x-1/2 -translate-y-1/2" />
      </div>

      {/* Sidebar */}
      <div className="w-72 border-r border-white/5 bg-black/40 backdrop-blur-3xl flex-shrink-0 hidden md:flex flex-col z-30 shadow-[4px_0_32px_rgba(0,0,0,0.6)]">
        <div className="h-20 flex items-center px-8 border-b border-white/5">
          <Link href="/">
            <div className="flex items-center gap-3 font-bold tracking-wider cursor-pointer group">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-fuchsia-500 via-rose-500 to-orange-500 p-[1px] group-hover:scale-110 transition-transform duration-500 ease-out">
                <div className="w-full h-full rounded-full bg-[#050505] flex items-center justify-center">
                  <Dna className="w-4 h-4 text-rose-400 group-hover:animate-pulse" />
                </div>
              </div>
              <span className="text-white/90 group-hover:text-white transition-colors">BioForgeBharat</span>
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
                  transition={{ delay: i * 0.08, duration: 0.5, type: "spring", bounce: 0.4 }}
                  className={cn(
                    "group relative flex items-center gap-4 px-4 py-3 rounded-2xl cursor-pointer transition-all duration-300",
                    isActive 
                      ? "bg-white/10 text-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)]" 
                      : "text-white/50 hover:bg-white/5 hover:text-white/90"
                  )}
                >
                  {isActive && (
                    <motion.div
                      layoutId="sidebar-indicator"
                      className={cn("absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 rounded-r-full shadow-[0_0_12px_rgba(255,255,255,0.5)]", item.glow)}
                      transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    />
                  )}
                  <item.icon className={cn("w-5 h-5 transition-transform duration-300", isActive ? item.color : "group-hover:scale-125")} />
                  <span className="text-sm font-medium tracking-wide">{item.label}</span>
                </motion.div>
              </Link>
            );
          })}
        </div>
        
        <div className="p-6 border-t border-white/5 bg-black/20">
          <Link href="/">
            <button className="group relative w-full px-4 py-3 text-xs font-semibold tracking-widest uppercase rounded-full bg-white/[0.03] hover:bg-white/10 text-white/70 hover:text-white overflow-hidden active:scale-[0.95] transition-all duration-300 ease-out border border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]">
              <span className="relative z-10 flex items-center justify-center gap-2 group-hover:text-rose-400 transition-colors">
                <ChevronLeft className="w-4 h-4 group-hover:-translate-x-2 transition-transform duration-300" />
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
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-fuchsia-500 to-orange-500 p-[1px]">
                <div className="w-full h-full rounded-full bg-[#050505] flex items-center justify-center">
                  <Dna className="w-3 h-3 text-rose-400" />
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
              variants={pageVariants as any}
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
