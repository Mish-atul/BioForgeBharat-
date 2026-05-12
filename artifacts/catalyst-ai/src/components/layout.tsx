import React, { useState } from "react";
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
  ChevronLeft,
  Atom
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Overview", icon: Activity, color: "text-rose-400", glow: "shadow-rose-500/50" },
  { href: "/reactions", label: "Catalysis", icon: Beaker, color: "text-blue-400", glow: "shadow-blue-500/50" },
  { href: "/pathway", label: "Synthesis", icon: Dna, color: "text-fuchsia-400", glow: "shadow-fuchsia-500/50" },
  { href: "/experiments", label: "Validation", icon: Network, color: "text-orange-400", glow: "shadow-orange-500/50" },
  { href: "/annotations", label: "Knowledge", icon: Database, color: "text-yellow-400", glow: "shadow-yellow-500/50" },
  { href: "/retraining", label: "ML Core", icon: Settings2, color: "text-cyan-400", glow: "shadow-cyan-500/50" },
];

const pageVariants = {
  initial: { opacity: 0, y: 20, scale: 0.98, filter: "blur(5px)" },
  animate: { opacity: 1, y: 0, scale: 1, filter: "blur(0px)", transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const } },
  exit: { opacity: 0, y: -20, scale: 0.98, filter: "blur(5px)", transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] as const } },
};

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [isHovered, setIsHovered] = useState(false);

  if (location === "/") {
    return <div className="min-h-screen bg-[#110F1A] text-[#F8F9FA] font-sans">{children}</div>;
  }

  return (
    <div className="min-h-screen flex bg-[#110F1A] text-[#F8F9FA] font-sans overflow-hidden selection:bg-fuchsia-500/30 selection:text-white">
      {/* Cinematic Aurora Background - Not too dark, not too light */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,#2A2045_0%,#110F1A_100%)] z-10" />
        <div className="absolute inset-0 opacity-[0.06] mix-blend-overlay z-20" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.75%22 numOctaves=%224%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }} />
        
        {/* Slow moving aurora fields */}
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 120, repeat: Infinity, ease: "linear" }} className="absolute -top-[30%] -left-[10%] w-[80vw] h-[80vw] opacity-20 blur-[140px] bg-gradient-to-r from-fuchsia-600 to-indigo-600 rounded-[40%_60%_70%_30%/40%_50%_60%_50%] mix-blend-screen" />
        <motion.div animate={{ rotate: -360 }} transition={{ duration: 150, repeat: Infinity, ease: "linear" }} className="absolute top-[40%] -right-[20%] w-[70vw] h-[70vw] opacity-15 blur-[120px] bg-gradient-to-l from-orange-500 to-rose-600 rounded-[60%_40%_30%_70%/60%_30%_70%_40%] mix-blend-screen" />
      </div>

      {/* Floating Glass Dock (Sidebar Redefined) */}
      <div className="hidden md:block relative z-40 p-6 pr-0">
        <motion.nav 
          initial={false}
          animate={{ width: isHovered ? 280 : 88 }}
          onHoverStart={() => setIsHovered(true)}
          onHoverEnd={() => setIsHovered(false)}
          className="h-full flex flex-col bg-white/[0.03] backdrop-blur-3xl border border-white/10 rounded-[2.5rem] shadow-[0_20px_60px_rgba(0,0,0,0.4),inset_0_1px_1px_rgba(255,255,255,0.1)] overflow-hidden"
          style={{ willChange: "width" }}
        >
          {/* Logo Area */}
          <div className="h-24 flex items-center px-6 flex-shrink-0">
            <Link href="/">
              <div className="flex items-center gap-4 cursor-pointer">
                <motion.div 
                  whileHover={{ rotate: 180 }}
                  transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] as const }}
                  className="w-10 h-10 flex-shrink-0 rounded-2xl bg-gradient-to-br from-fuchsia-500 to-orange-500 p-[1px] shadow-[0_0_20px_rgba(217,70,239,0.3)]"
                >
                  <div className="w-full h-full rounded-[15px] bg-[#161423] flex items-center justify-center">
                    <Atom className="w-5 h-5 text-fuchsia-300" />
                  </div>
                </motion.div>
                <AnimatePresence>
                  {isHovered && (
                    <motion.span 
                      initial={{ opacity: 0, x: -10 }} 
                      animate={{ opacity: 1, x: 0 }} 
                      exit={{ opacity: 0, x: -10 }}
                      className="font-serif font-black text-xl tracking-tight text-white whitespace-nowrap"
                    >
                      BioForge
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>
            </Link>
          </div>
          
          {/* Navigation Links */}
          <div className="flex-1 py-4 flex flex-col gap-3 px-4 overflow-x-hidden">
            {navItems.map((item) => {
              const isActive = location === item.href || (item.href !== "/dashboard" && location.startsWith(item.href));
              return (
                <Link key={item.href} href={item.href}>
                  <div className="relative group cursor-pointer">
                    {/* Active Background Pill */}
                    {isActive && (
                      <motion.div
                        layoutId="activeNav"
                        className="absolute inset-0 bg-white/10 rounded-2xl border border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)]"
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                    
                    <div className={cn(
                      "relative flex items-center gap-4 p-3 rounded-2xl transition-colors duration-300",
                      isActive ? "text-white" : "text-white/50 hover:text-white"
                    )}>
                      <div className="w-10 h-10 flex-shrink-0 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-500 ease-out">
                        <item.icon className={cn("w-5 h-5", isActive ? item.color : "text-white/60 group-hover:text-white")} />
                        {isActive && (
                          <div className={cn("absolute inset-0 rounded-xl opacity-40 blur-md", item.glow)} />
                        )}
                      </div>
                      
                      <AnimatePresence>
                        {isHovered && (
                          <motion.span 
                            initial={{ opacity: 0, x: -10 }} 
                            animate={{ opacity: 1, x: 0 }} 
                            exit={{ opacity: 0, x: -10 }}
                            className="font-sans font-bold text-sm tracking-wide whitespace-nowrap"
                          >
                            {item.label}
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
          
          {/* Back to Home - Bottom */}
          <div className="p-4 flex-shrink-0">
            <Link href="/">
              <div className="flex items-center gap-4 p-3 rounded-2xl text-white/50 hover:text-rose-400 hover:bg-rose-500/10 cursor-pointer transition-all duration-300 group border border-transparent hover:border-rose-500/20">
                <div className="w-10 h-10 flex-shrink-0 rounded-xl flex items-center justify-center group-hover:-translate-x-1 transition-transform duration-300">
                  <ChevronLeft className="w-5 h-5" />
                </div>
                <AnimatePresence>
                  {isHovered && (
                    <motion.span 
                      initial={{ opacity: 0, x: -10 }} 
                      animate={{ opacity: 1, x: 0 }} 
                      exit={{ opacity: 0, x: -10 }}
                      className="font-sans font-bold text-sm tracking-wide whitespace-nowrap uppercase"
                    >
                      Exit Platform
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>
            </Link>
          </div>
        </motion.nav>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden relative z-30">
        <header className="h-20 border-b border-white/5 bg-[#110F1A]/80 backdrop-blur-2xl flex items-center px-6 gap-4 md:hidden shadow-lg z-50">
          <Button variant="ghost" size="icon" className="md:hidden text-white hover:bg-white/10">
            <Menu className="w-6 h-6" />
          </Button>
          <Link href="/">
            <div className="flex items-center gap-3 font-serif font-black text-xl cursor-pointer">
              <Atom className="w-6 h-6 text-fuchsia-400" />
              BioForge
            </div>
          </Link>
        </header>
        
        <main className="flex-1 overflow-x-hidden overflow-y-auto px-4 md:px-12 py-8 scroll-smooth" style={{ scrollBehavior: 'smooth' }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={location}
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="max-w-7xl mx-auto space-y-10"
              style={{ willChange: "opacity, transform, filter" }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}