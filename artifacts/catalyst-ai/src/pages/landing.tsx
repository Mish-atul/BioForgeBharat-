import React, { useRef } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { Link } from "wouter";
import { Dna, ArrowRight, Beaker, Leaf, Network, TestTube2, FlaskConical } from "lucide-react";
import { cn } from "@/lib/utils";

// --- Framer Motion variants ---
const fadeUp = {
  hidden: { opacity: 0, y: 40, filter: "blur(10px)" },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { delay: i * 0.15, duration: 1, ease: [0.32, 0.72, 0, 1] as const },
  }),
};

// --- Components ---
const GlassOrb = ({
  className,
  delay = 0,
  duration = 10,
  color = "bg-primary/20",
  size = "w-64 h-64",
}: {
  className?: string;
  delay?: number;
  duration?: number;
  color?: string;
  size?: string;
}) => (
  <motion.div
    className={cn(
      "absolute rounded-full blur-[100px] pointer-events-none mix-blend-screen",
      color,
      size,
      className
    )}
    animate={{
      x: [0, 40, -20, 0],
      y: [0, -40, 20, 0],
      scale: [1, 1.2, 0.9, 1],
    }}
    transition={{
      duration,
      repeat: Infinity,
      repeatType: "mirror",
      ease: "easeInOut",
      delay,
    }}
  />
);

export default function LandingPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const smoothProgress = useSpring(scrollYProgress, { stiffness: 50, damping: 20 });
  const yHero = useTransform(smoothProgress, [0, 1], ["0%", "50%"]);
  const opacityHero = useTransform(smoothProgress, [0, 0.5], [1, 0]);
  const scaleHero = useTransform(smoothProgress, [0, 0.5], [1, 0.9]);

  return (
    <div
      ref={containerRef}
      className="min-h-[100dvh] bg-[#050505] text-white selection:bg-primary/30 selection:text-primary-foreground overflow-hidden font-sans"
    >
      {/* 3D Z-Axis Ambient Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(0,0,0,0)_0%,#050505_100%)] z-10" />
        <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay z-20" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }} />
        
        {/* Chemical/Molecular glowing orbs */}
        <GlassOrb color="bg-emerald-500/20" size="w-[50vw] h-[50vw]" className="-top-[10%] -left-[10%]" duration={15} />
        <GlassOrb color="bg-cyan-500/20" size="w-[40vw] h-[40vw]" className="top-[30%] -right-[10%]" delay={2} duration={12} />
        <GlassOrb color="bg-blue-600/15" size="w-[60vw] h-[60vw]" className="-bottom-[20%] left-[20%]" delay={4} duration={18} />
      </div>

      {/* Fluid Island Navigation */}
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 1, ease: [0.32, 0.72, 0, 1] as const }}
        className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] md:w-max"
      >
        <div className="flex items-center justify-between gap-12 px-6 py-3 rounded-full bg-white/5 backdrop-blur-2xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-600 p-[1px]">
              <div className="w-full h-full rounded-full bg-[#050505] flex items-center justify-center">
                <Dna className="w-4 h-4 text-emerald-400" />
              </div>
            </div>
            <span className="text-sm font-semibold tracking-wide text-white/90">BioForgeBharat</span>
          </div>
          <Link href="/dashboard">
            <button className="group relative px-5 py-2 text-xs font-semibold tracking-widest uppercase rounded-full bg-white text-black overflow-hidden active:scale-[0.98] transition-transform duration-300 ease-out">
              <span className="relative z-10 flex items-center gap-2">
                Access Platform
                <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform duration-300" />
              </span>
              <div className="absolute inset-0 bg-emerald-400 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]" />
            </button>
          </Link>
        </div>
      </motion.header>

      {/* Hero Section */}
      <motion.main
        style={{ y: yHero, opacity: opacityHero, scale: scaleHero }}
        className="relative z-10 pt-40 pb-32 px-6 flex flex-col items-center justify-center min-h-screen text-center"
      >
        <motion.div
          custom={0}
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="mb-8 rounded-full px-4 py-1.5 text-[11px] uppercase tracking-[0.2em] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 backdrop-blur-md flex items-center gap-2 shadow-[0_0_24px_rgba(16,185,129,0.1)]"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Autonomous Molecular Discovery
        </motion.div>

        <motion.h1
          custom={1}
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="text-5xl md:text-7xl lg:text-[7rem] font-bold tracking-tighter leading-[1.05] max-w-5xl mx-auto"
        >
          Synthesize the <br className="hidden md:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-br from-white via-emerald-200 to-cyan-500">
            Molecules of Tomorrow.
          </span>
        </motion.h1>

        <motion.p
          custom={2}
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="mt-8 text-lg md:text-xl text-white/50 max-w-2xl mx-auto font-light leading-relaxed"
        >
          BioForgeBharat uses intelligent AI agents to accelerate sustainable fuels,
          catalyst engineering, and synthetic biology. Replacing trial-and-error with predictive intelligence.
        </motion.p>

        <motion.div
          custom={3}
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="mt-12 flex flex-col sm:flex-row items-center gap-6"
        >
          <Link href="/dashboard">
            <button className="group flex items-center gap-4 bg-emerald-500 text-black px-2 pl-6 py-2 rounded-full font-medium text-lg active:scale-[0.98] transition-transform duration-300">
              Initialize Agent
              <div className="w-10 h-10 rounded-full bg-black/10 flex items-center justify-center group-hover:translate-x-1 group-hover:-translate-y-[1px] transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]">
                <ArrowRight className="w-5 h-5" />
              </div>
            </button>
          </Link>
        </motion.div>
      </motion.main>

      {/* Feature Bento Grid (Double Bezel Architecture) */}
      <section className="relative z-20 px-4 md:px-8 py-24 md:py-40 bg-[#050505] border-t border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="mb-20">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight">
              Architecting the <br /> <span className="text-white/40">post-carbon economy.</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Main Feature - Large Col */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 1, ease: [0.32, 0.72, 0, 1] as const }}
              className="col-span-1 md:col-span-8 p-2 rounded-[2rem] bg-white/[0.02] border border-white/5 shadow-2xl group"
            >
              <div className="h-full w-full rounded-[calc(2rem-0.5rem)] bg-[#0a0a0a] border border-white/10 p-8 md:p-12 relative overflow-hidden flex flex-col justify-end min-h-[400px]">
                <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                <div className="relative z-10">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mb-6">
                    <FlaskConical className="w-6 h-6 text-emerald-400" />
                  </div>
                  <h3 className="text-2xl md:text-4xl font-semibold mb-4 text-white">Chemical Catalysis</h3>
                  <p className="text-white/50 text-lg max-w-md">
                    AI-driven discovery for sustainable reactions. Turn CO₂ and green H₂ into viable methanol with unprecedented accuracy.
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Side Feature 1 */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 1, delay: 0.1, ease: [0.32, 0.72, 0, 1] as const }}
              className="col-span-1 md:col-span-4 p-2 rounded-[2rem] bg-white/[0.02] border border-white/5 shadow-2xl group"
            >
              <div className="h-full w-full rounded-[calc(2rem-0.5rem)] bg-[#0a0a0a] border border-white/10 p-8 relative overflow-hidden flex flex-col justify-end min-h-[400px]">
                <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-bl from-cyan-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                <div className="relative z-10">
                  <div className="w-12 h-12 rounded-full bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center mb-6">
                    <Dna className="w-6 h-6 text-cyan-400" />
                  </div>
                  <h3 className="text-xl md:text-2xl font-semibold mb-4 text-white">Synthetic Biology</h3>
                  <p className="text-white/50">
                    Enzyme engineering and metabolic pathway design for next-gen biofuel conversion.
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Side Feature 2 */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 1, delay: 0.2, ease: [0.32, 0.72, 0, 1] as const }}
              className="col-span-1 md:col-span-4 p-2 rounded-[2rem] bg-white/[0.02] border border-white/5 shadow-2xl group"
            >
              <div className="h-full w-full rounded-[calc(2rem-0.5rem)] bg-[#0a0a0a] border border-white/10 p-8 relative overflow-hidden flex flex-col justify-end min-h-[300px]">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.1),transparent_70%)] opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                <div className="relative z-10">
                  <div className="w-12 h-12 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center mb-6">
                    <Network className="w-6 h-6 text-blue-400" />
                  </div>
                  <h3 className="text-xl md:text-2xl font-semibold mb-4 text-white">Continuous Feedback</h3>
                  <p className="text-white/50">
                    Models retrain dynamically from experimental pipeline flows.
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Bottom Wide Feature */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 1, delay: 0.3, ease: [0.32, 0.72, 0, 1] as const }}
              className="col-span-1 md:col-span-8 p-2 rounded-[2rem] bg-white/[0.02] border border-white/5 shadow-2xl group"
            >
              <div className="h-full w-full rounded-[calc(2rem-0.5rem)] bg-[#0a0a0a] border border-white/10 p-8 md:p-12 relative overflow-hidden flex items-center min-h-[300px]">
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-64 h-64 bg-emerald-500/10 blur-[80px] rounded-full" />
                <div className="relative z-10 max-w-lg">
                  <h3 className="text-2xl md:text-4xl font-semibold mb-4 text-white">Predictive Intelligence</h3>
                  <p className="text-white/50 text-lg">
                    Minimize lab time by simulating molecular interactions in a robust, agentic sandbox environment.
                  </p>
                  <div className="mt-8 flex items-center gap-4 text-sm font-medium text-emerald-400 cursor-pointer group-hover:text-emerald-300 transition-colors">
                    Explore algorithms <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform duration-500 ease-out" />
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 text-center text-white/30 text-sm border-t border-white/5 bg-[#050505]">
        <p className="flex items-center justify-center gap-2">
          Engineered for <span className="text-emerald-500/80 font-medium">GPS Renewables OpenEnv Hackathon 2026</span>
        </p>
      </footer>
    </div>
  );
}
