import React, { useState, useEffect } from "react";
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
  { href: "/dashboard", label: "Overview", icon: Activity, color: "text-rose-400", glow: "shadow-rose-500/50", shape: "rounded-[1rem_2rem_1rem_2rem]" },
  { href: "/reactions", label: "Catalysis", icon: Beaker, color: "text-blue-400", glow: "shadow-blue-500/50", shape: "rounded-[2rem_1rem_2rem_1rem]" },
  { href: "/pathway", label: "Synthesis", icon: Dna, color: "text-fuchsia-400", glow: "shadow-fuchsia-500/50", shape: "rounded-[1.5rem_0.5rem_2rem_1rem]" },
  { href: "/experiments", label: "Validation", icon: Network, color: "text-orange-400", glow: "shadow-orange-500/50", shape: "rounded-[0.5rem_1.5rem_1rem_2rem]" },
  { href: "/annotations", label: "Knowledge", icon: Database, color: "text-yellow-400", glow: "shadow-yellow-500/50", shape: "rounded-[2rem_2rem_0.5rem_0.5rem]" },
  { href: "/retraining", label: "ML Core", icon: Settings2, color: "text-cyan-400", glow: "shadow-cyan-500/50", shape: "rounded-[0.5rem_0.5rem_2rem_2rem]" },
];

const pageVariants = {
  initial: { opacity: 0, y: 30, scale: 0.95, filter: "blur(10px)" },
  animate: { opacity: 1, y: 0, scale: 1, filter: "blur(0px)", transition: { duration: 0.8, type: "spring", bounce: 0.4 } },
  exit: { opacity: 0, y: -30, scale: 0.95, filter: "blur(10px)", transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
};

// --- Live Molecular Background ---
const MolecularBackground = () => {
  const [nodes, setNodes] = useState<{ x: number, y: number, r: number, color: string, duration: number }[]>([]);
  
  useEffect(() => {
    // Generate random nodes once on client mount
    const colors = ["#06b6d4", "#d946ef", "#f97316", "#3b82f6", "#eab308"];
    const newNodes = Array.from({ length: 15 }).map(() => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      r: Math.random() * 3 + 1,
      color: colors[Math.floor(Math.random() * colors.length)],
      duration: Math.random() * 20 + 20
    }));
    setNodes(newNodes);
  }, []);

  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden mix-blend-screen opacity-60">
      {/* Background Gradients */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,#2A2045_0%,#0F0C29_100%)] z-10 opacity-80" />
      <div className="absolute inset-0 opacity-[0.05] mix-blend-overlay z-20" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.85%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }} />
      
      {/* SVG Particles */}
      <svg className="absolute inset-0 w-full h-full z-30 blur-[2px] opacity-40">
        <defs>
          <filter id="mol-glow">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>
        {nodes.map((node, i) => (
          <motion.circle
            key={i}
            r={node.r}
            fill={node.color}
            filter="url(#mol-glow)"
            initial={{ cx: `${node.x}%`, cy: `${node.y}%` }}
            animate={{ 
              cx: [`${node.x}%`, `${(node.x + 30) % 100}%`, `${(node.x - 20 + 100) % 100}%`, `${node.x}%`],
              cy: [`${node.y}%`, `${(node.y - 40 + 100) % 100}%`, `${(node.y + 30) % 100}%`, `${node.y}%`] 
            }}
            transition={{ duration: node.duration, repeat: Infinity, ease: "linear" }}
          />
        ))}
      </svg>
      
      {/* Slow moving aurora fields */}
      <motion.div animate={{ rotate: 360, scale: [1, 1.2, 1] }} transition={{ duration: 60, repeat: Infinity, ease: "linear" }} className="absolute -top-[30%] -left-[10%] w-[80vw] h-[80vw] opacity-20 blur-[150px] bg-gradient-to-r from-fuchsia-600 to-indigo-600 rounded-[40%_60%_70%_30%/40%_50%_60%_50%] z-20" />
      <motion.div animate={{ rotate: -360, scale: [1, 1.5, 1] }} transition={{ duration: 80, repeat: Infinity, ease: "linear" }} className="absolute top-[40%] -right-[20%] w-[70vw] h-[70vw] opacity-15 blur-[130px] bg-gradient-to-l from-orange-500 to-cyan-600 rounded-[60%_40%_30%_70%/60%_30%_70%_40%] z-20" />
      <motion.div animate={{ rotate: 180, scale: [1, 1.1, 1] }} transition={{ duration: 50, repeat: Infinity, ease: "linear" }} className="absolute -bottom-[20%] left-[30%] w-[60vw] h-[60vw] opacity-10 blur-[120px] bg-gradient-to-t from-yellow-500 to-rose-600 rounded-[30%_70%_50%_50%/50%_30%_70%_50%] z-20" />
    </div>
  );
};

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [isHovered, setIsHovered] = useState(false);

  if (location === "/") {
    return <div className="min-h-screen bg-[#0F0C29] text-[#F8F9FA] font-sans">{children}</div>;
  }

  return (
    <div className="min-h-screen flex bg-[#0F0C29] text-[#F8F9FA] font-sans overflow-hidden selection:bg-fuchsia-500/30 selection:text-white">
      <MolecularBackground />

      {/* Floating Glass Dock (Sidebar Redefined) */}
      <div className="hidden md:block relative z-40 p-6 pr-0">
        <motion.nav 
          initial={false}
          animate={{ width: isHovered ? 280 : 88 }}
          onHoverStart={() => setIsHovered(true)}
          onHoverEnd={() => setIsHovered(false)}
          className="h-full flex flex-col bg-white/[0.02] backdrop-blur-3xl border border-white/10 rounded-[3rem] shadow-[0_30px_80px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.1)] overflow-hidden"
          style={{ willChange: "width" }}
        >
          {/* Logo Area */}
          <div className="h-28 flex items-center px-6 flex-shrink-0 border-b border-white/5">
            <Link href="/">
              <div className="flex items-center gap-4 cursor-pointer">
                <motion.div 
                  whileHover={{ rotate: 180, scale: 1.1 }}
                  transition={{ duration: 0.8, type: "spring", bounce: 0.5 }}
                  className="w-10 h-10 flex-shrink-0 rounded-[1rem_0.5rem_1rem_0.5rem] bg-gradient-to-br from-fuchsia-500 to-orange-500 p-[1px] shadow-[0_0_30px_rgba(217,70,239,0.3)]"
                >
                  <div className="w-full h-full rounded-[calc(1rem-1px)_calc(0.5rem-1px)_calc(1rem-1px)_calc(0.5rem-1px)] bg-[#1A1528] flex items-center justify-center">
                    <Atom className="w-5 h-5 text-fuchsia-300" />
                  </div>
                </motion.div>
                <AnimatePresence>
                  {isHovered && (
                    <motion.span 
                      initial={{ opacity: 0, x: -20, filter: "blur(4px)" }} 
                      animate={{ opacity: 1, x: 0, filter: "blur(0px)" }} 
                      exit={{ opacity: 0, x: -20, filter: "blur(4px)" }}
                      transition={{ duration: 0.4 }}
                      className="font-serif font-black text-2xl tracking-tight text-white whitespace-nowrap drop-shadow-md"
                    >
                      BioForge
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>
            </Link>
          </div>
          
          {/* Navigation Links */}
          <div className="flex-1 py-6 flex flex-col gap-4 px-4 overflow-x-hidden">
            {navItems.map((item, i) => {
              const isActive = location === item.href || (item.href !== "/dashboard" && location.startsWith(item.href));
              return (
                <Link key={item.href} href={item.href}>
                  <motion.div 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="relative group cursor-pointer"
                  >
                    {/* Active Background Pill */}
                    {isActive && (
                      <motion.div
                        layoutId="activeNav"
                        className={`absolute inset-0 bg-white/10 ${item.shape} border border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)]`}
                        transition={{ type: "spring", bounce: 0.3, duration: 0.7 }}
                      />
                    )}
                    
                    <div className={cn(
                      "relative flex items-center gap-4 p-3 rounded-2xl transition-colors duration-300",
                      isActive ? "text-white" : "text-white/40 hover:text-white/90"
                    )}>
                      <div className={cn("w-10 h-10 flex-shrink-0 flex items-center justify-center transition-all duration-500 ease-out", item.shape, isActive ? "bg-white/5 border border-white/10" : "bg-transparent")}>
                        <item.icon className={cn("w-5 h-5", isActive ? item.color : "text-white/50 group-hover:text-white transition-colors")} />
                        {isActive && (
                          <div className={cn("absolute inset-0 opacity-40 blur-lg mix-blend-screen", item.glow, item.shape)} />
                        )}
                      </div>
                      
                      <AnimatePresence>
                        {isHovered && (
                          <motion.span 
                            initial={{ opacity: 0, x: -10, filter: "blur(2px)" }} 
                            animate={{ opacity: 1, x: 0, filter: "blur(0px)" }} 
                            exit={{ opacity: 0, x: -10, filter: "blur(2px)" }}
                            transition={{ delay: i * 0.05, duration: 0.3 }}
                            className="font-sans font-bold text-sm tracking-wide whitespace-nowrap"
                          >
                            {item.label}
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                </Link>
              );
            })}
          </div>
          
          {/* Back to Home - Bottom */}
          <div className="p-4 flex-shrink-0 border-t border-white/5 bg-black/20">
            <Link href="/">
              <motion.div 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center gap-4 p-3 rounded-[1.5rem_0.5rem_1.5rem_0.5rem] text-white/50 hover:text-rose-400 hover:bg-rose-500/10 cursor-pointer transition-all duration-300 group border border-transparent hover:border-rose-500/20"
              >
                <div className="w-10 h-10 flex-shrink-0 rounded-[1rem_0.5rem_1rem_0.5rem] flex items-center justify-center bg-white/5 group-hover:bg-rose-500/20 transition-colors duration-300 border border-white/10 group-hover:border-rose-500/30">
                  <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                </div>
                <AnimatePresence>
                  {isHovered && (
                    <motion.span 
                      initial={{ opacity: 0, x: -10 }} 
                      animate={{ opacity: 1, x: 0 }} 
                      exit={{ opacity: 0, x: -10 }}
                      className="font-sans font-black text-xs tracking-widest whitespace-nowrap uppercase"
                    >
                      Disconnect
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.div>
            </Link>
          </div>
        </motion.nav>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden relative z-30">
        <header className="h-20 border-b border-white/5 bg-[#0F0C29]/80 backdrop-blur-2xl flex items-center px-6 gap-4 md:hidden shadow-lg z-50">
          <Button variant="ghost" size="icon" className="md:hidden text-white hover:bg-white/10 rounded-2xl">
            <Menu className="w-6 h-6" />
          </Button>
          <Link href="/">
            <div className="flex items-center gap-3 font-serif font-black text-xl cursor-pointer">
              <Atom className="w-6 h-6 text-fuchsia-400" />
              BioForge
            </div>
          </Link>
        </header>
        
        <main className="flex-1 overflow-x-hidden overflow-y-auto px-4 md:px-12 py-10 scroll-smooth" style={{ scrollBehavior: 'smooth' }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={location}
              variants={pageVariants as any}
              initial="initial"
              animate="animate"
              exit="exit"
              className="max-w-[1600px] mx-auto space-y-10"
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
