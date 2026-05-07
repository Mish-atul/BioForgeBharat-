export default function Architecture() {
  return (
    <div className="relative w-screen h-screen overflow-hidden bg-bg text-text font-body">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,204,204,0.08),transparent_60%)]" />

      <div className="absolute top-[7vh] left-[6vw] right-[6vw]">
        <div className="font-mono text-[1.1vw] tracking-widest text-primary uppercase mb-[2vh]">
          03 · AI Architecture
        </div>
        <h2 className="font-display font-bold text-[4.4vw] leading-[1.0] tracking-tight text-text text-balance max-w-[65vw]">
          Claude Sonnet 4 augmented with real cheminformatics evidence.
        </h2>
      </div>

      <div className="absolute left-[6vw] right-[6vw] top-[36vh] grid grid-cols-5 gap-[1.5vw] items-stretch">
        <div className="bg-bg-2/70 border border-border-line p-[1.5vw] flex flex-col gap-[1.5vh]">
          <div className="font-mono text-[0.9vw] tracking-widest text-muted uppercase">Input</div>
          <div className="font-display font-bold text-[1.7vw] text-text leading-tight tracking-tight">
            Reaction spec
          </div>
          <div className="font-body text-[1.05vw] text-muted leading-snug text-pretty">
            Equation, conditions, domain — chemical or biological.
          </div>
        </div>

        <div className="bg-bg-2/70 border border-primary p-[1.5vw] flex flex-col gap-[1.5vh]">
          <div className="font-mono text-[0.9vw] tracking-widest text-primary uppercase">Augment</div>
          <div className="font-display font-bold text-[1.7vw] text-text leading-tight tracking-tight">
            PubChem · ChEMBL
          </div>
          <div className="font-body text-[1.05vw] text-muted leading-snug text-pretty">
            Live lookups for SMILES, logP, TPSA, molecular weight, IUPAC.
          </div>
        </div>

        <div className="bg-bg-2/70 border border-accent p-[1.5vw] flex flex-col gap-[1.5vh]">
          <div className="font-mono text-[0.9vw] tracking-widest text-accent uppercase">Generate</div>
          <div className="font-display font-bold text-[1.7vw] text-text leading-tight tracking-tight">
            Claude Sonnet 4
          </div>
          <div className="font-body text-[1.05vw] text-muted leading-snug text-pretty">
            Ranked candidates with activity, selectivity, stability, confidence.
          </div>
        </div>

        <div className="bg-bg-2/70 border border-border-line p-[1.5vw] flex flex-col gap-[1.5vh]">
          <div className="font-mono text-[0.9vw] tracking-widest text-muted uppercase">Validate</div>
          <div className="font-display font-bold text-[1.7vw] text-text leading-tight tracking-tight">
            Wet-lab logs
          </div>
          <div className="font-body text-[1.05vw] text-muted leading-snug text-pretty">
            Measured vs. predicted, with discrepancy analysis on every miss.
          </div>
        </div>

        <div className="bg-bg-2/70 border border-border-line p-[1.5vw] flex flex-col gap-[1.5vh]">
          <div className="font-mono text-[0.9vw] tracking-widest text-muted uppercase">Learn</div>
          <div className="font-display font-bold text-[1.7vw] text-text leading-tight tracking-tight">
            Retraining run
          </div>
          <div className="font-body text-[1.05vw] text-muted leading-snug text-pretty">
            Annotated experiments raise the next cycle's accuracy.
          </div>
        </div>
      </div>

      <div className="absolute left-[6vw] right-[6vw] top-[64vh] flex items-center gap-[1.5vw]">
        <div className="flex-1 h-px bg-gradient-to-r from-primary via-accent to-primary" />
        <div className="font-mono text-[1.1vw] text-text uppercase tracking-widest">
          Closed-loop · auditable · institutional memory
        </div>
        <div className="flex-1 h-px bg-gradient-to-r from-primary via-accent to-primary" />
      </div>

      <div className="absolute left-[6vw] right-[6vw] bottom-[10vh] grid grid-cols-3 gap-[2vw]">
        <div>
          <div className="font-display font-bold text-[3.2vw] text-text leading-none tracking-tight">
            PostgreSQL
          </div>
          <div className="font-mono text-[1vw] text-muted uppercase tracking-widest mt-[1vh]">
            Reactions · candidates · experiments
          </div>
        </div>
        <div>
          <div className="font-display font-bold text-[3.2vw] text-text leading-none tracking-tight">
            Drizzle ORM
          </div>
          <div className="font-mono text-[1vw] text-muted uppercase tracking-widest mt-[1vh]">
            Type-safe schema, zero-magic queries
          </div>
        </div>
        <div>
          <div className="font-display font-bold text-[3.2vw] text-text leading-none tracking-tight">
            React + Vite
          </div>
          <div className="font-mono text-[1vw] text-muted uppercase tracking-widest mt-[1vh]">
            Researcher dashboard with live charts
          </div>
        </div>
      </div>

      <div className="absolute bottom-[3vh] left-[6vw] right-[6vw] flex justify-between font-mono text-[1vw] text-muted/70 uppercase tracking-widest">
        <span>CatalystAI · Hackathon Pitch</span>
        <span>07 / 10</span>
      </div>
    </div>
  );
}
