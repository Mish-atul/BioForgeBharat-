import { motion } from "framer-motion";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Dna, ArrowRight, Leaf, Beaker, Network } from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.15, duration: 0.7, ease: "easeOut" as const },
  }),
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.92 },
  visible: (i: number) => ({
    opacity: 1,
    scale: 1,
    transition: { delay: 0.5 + i * 0.12, duration: 0.6, ease: "easeOut" as const },
  }),
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col overflow-hidden">
      {/* Animated background orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <motion.div
          className="absolute top-1/4 -left-32 w-96 h-96 rounded-full bg-primary/5 blur-[100px]"
          animate={{ x: [0, 40, 0], y: [0, -30, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-1/4 -right-32 w-96 h-96 rounded-full bg-accent/5 blur-[100px]"
          animate={{ x: [0, -40, 0], y: [0, 30, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/3 blur-[120px]"
          animate={{ scale: [1, 1.15, 1] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <header className="h-16 border-b border-border bg-background/70 backdrop-blur-lg flex items-center px-6 justify-between fixed top-0 w-full z-50">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="flex items-center gap-2 text-primary font-bold tracking-wider"
        >
          <Dna className="w-6 h-6" />
          <span className="text-xl">BioForgeBharat</span>
        </motion.div>
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.2 }}>
          <Link href="/dashboard">
            <Button variant="outline" className="hidden sm:flex border-primary text-primary hover:bg-primary/10">
              Access Platform
            </Button>
          </Link>
        </motion.div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center pt-24 pb-12 px-6 text-center max-w-5xl mx-auto relative z-10">
        <motion.div initial="hidden" animate="visible" className="space-y-6">
          <motion.div variants={fadeUp} custom={0} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 text-sm font-medium mb-4">
            <Leaf className="w-4 h-4" />
            <span>Sustainable Innovation for India's Low-Carbon Economy</span>
          </motion.div>
          
          <motion.h1 variants={fadeUp} custom={1} className="text-4xl md:text-6xl font-bold tracking-tight text-foreground">
            An Agentic AI-Powered{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-accent to-primary bg-[length:200%_auto] animate-[gradient_4s_ease_infinite]">
              Molecular Discovery
            </span>{" "}
            Platform
          </motion.h1>
          
          <motion.p variants={fadeUp} custom={2} className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed mt-6">
            Accelerating the discovery of sustainable fuels, chemical catalysts, and synthetic biology pathways. 
            Transform CO₂, biomass, and syngas into valuable resources by replacing slow trial-and-error experimentation 
            with intelligent, predictive AI agents.
          </motion.p>

          <motion.div variants={fadeUp} custom={3} className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10">
            <Link href="/dashboard">
              <Button size="lg" className="w-full sm:w-auto text-lg gap-2 bg-primary text-primary-foreground hover:bg-primary/90 h-14 px-8 shadow-[0_0_24px_rgba(34,197,94,0.2)] hover:shadow-[0_0_32px_rgba(34,197,94,0.35)] transition-shadow duration-500">
                Launch Platform
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
          </motion.div>
        </motion.div>

        <motion.div
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-24 w-full"
        >
          {[
            {
              title: "Chemical Catalysis",
              description: "AI-driven discovery and optimization for reactions like CO₂ + green H₂ → methanol and syngas → ethanol.",
              icon: Beaker,
            },
            {
              title: "Synthetic Biology",
              description: "Assist in enzyme engineering, metabolic pathway design, and microbial systems for biofuel conversion.",
              icon: Dna,
            },
            {
              title: "Continuous Learning",
              description: "Data feedback loops where experimental results flow back to retrain models and improve future predictions.",
              icon: Network,
            },
          ].map((feature, i) => (
            <motion.div
              key={i}
              variants={scaleIn}
              custom={i}
              whileHover={{ y: -4, transition: { duration: 0.25 } }}
              className="p-6 rounded-xl border border-border bg-card/50 backdrop-blur text-left hover:border-primary/50 hover:shadow-[0_0_24px_rgba(34,197,94,0.06)] transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <feature.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </main>

      <footer className="border-t border-border py-8 text-center text-sm text-muted-foreground mt-auto relative z-10">
        <p>Built by Team NammaNexus · GPS Renewables OpenEnv Hackathon 2026</p>
      </footer>
    </div>
  );
}
