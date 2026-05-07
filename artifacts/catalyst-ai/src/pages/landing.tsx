import { motion } from "framer-motion";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Dna, ArrowRight, Leaf, Beaker, Network } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <header className="h-16 border-b border-border bg-background/50 backdrop-blur flex items-center px-6 justify-between fixed top-0 w-full z-50">
        <div className="flex items-center gap-2 text-primary font-bold tracking-wider">
          <Dna className="w-6 h-6" />
          <span className="text-xl">BioForgeBharat</span>
        </div>
        <Link href="/dashboard">
          <Button variant="outline" className="hidden sm:flex border-primary text-primary hover:bg-primary/10">
            Access Platform
          </Button>
        </Link>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center pt-24 pb-12 px-6 text-center max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="space-y-6"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 text-sm font-medium mb-4">
            <Leaf className="w-4 h-4" />
            <span>Sustainable Innovation for India's Low-Carbon Economy</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-foreground">
            An Agentic AI-Powered <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">Molecular Discovery</span> Platform
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed mt-6">
            Accelerating the discovery of sustainable fuels, chemical catalysts, and synthetic biology pathways. 
            Transform CO₂, biomass, and syngas into valuable resources by replacing slow trial-and-error experimentation 
            with intelligent, predictive AI agents.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10">
            <Link href="/dashboard">
              <Button size="lg" className="w-full sm:w-auto text-lg gap-2 bg-primary text-primary-foreground hover:bg-primary/90 h-14 px-8">
                Launch Platform
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-24 w-full"
        >
          {[
            {
              title: "Chemical Catalysis",
              description: "AI-driven discovery and optimization for reactions like CO₂ + green H₂ → methanol and syngas → ethanol.",
              icon: Beaker
            },
            {
              title: "Synthetic Biology",
              description: "Assist in enzyme engineering, metabolic pathway design, and microbial systems for biofuel conversion.",
              icon: Dna
            },
            {
              title: "Continuous Learning",
              description: "Data feedback loops where experimental results flow back to retrain models and improve future predictions.",
              icon: Network
            }
          ].map((feature, i) => (
            <div key={i} className="p-6 rounded-xl border border-border bg-card/50 backdrop-blur text-left hover:border-primary/50 transition-colors">
              <feature.icon className="w-10 h-10 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </motion.div>
      </main>

      <footer className="border-t border-border py-8 text-center text-sm text-muted-foreground mt-auto">
        <p>Built for the GPS Renewables OpenEnv Hackathon 2026</p>
      </footer>
    </div>
  );
}
