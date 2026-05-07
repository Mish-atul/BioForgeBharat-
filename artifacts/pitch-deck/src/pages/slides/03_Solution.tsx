export default function Solution() {
  return (
    <div className="relative w-screen h-screen overflow-hidden bg-bg text-text font-body">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(0,230,115,0.10),transparent_60%)]" />

      <div className="absolute top-[7vh] left-[6vw] right-[6vw]">
        <div className="font-mono text-[1.1vw] tracking-widest text-primary uppercase mb-[2vh]">
          02 · Our Solution
        </div>
        <h2 className="font-display font-bold text-[5vw] leading-[1.0] tracking-tight text-text max-w-[70vw] text-balance">
          A closed-loop discovery platform — propose, validate, learn.
        </h2>
      </div>

      <div className="absolute left-[6vw] right-[6vw] bottom-[10vh] grid grid-cols-3 gap-[2vw]">
        <div className="bg-bg-2/60 border-t-2 border-primary p-[2.5vw] flex flex-col gap-[2vh]">
          <div className="font-mono text-[1vw] tracking-widest text-primary uppercase">
            Step 01 · Propose
          </div>
          <div className="font-display font-bold text-[2.6vw] leading-tight text-text tracking-tight">
            Claude proposes candidates
          </div>
          <div className="font-body text-[1.4vw] leading-relaxed text-muted text-pretty">
            For any reaction, generate ranked catalyst or enzyme candidates with
            predicted activity, selectivity, stability, and confidence — augmented
            with real PubChem and ChEMBL evidence.
          </div>
        </div>

        <div className="bg-bg-2/60 border-t-2 border-accent p-[2.5vw] flex flex-col gap-[2vh]">
          <div className="font-mono text-[1vw] tracking-widest text-accent uppercase">
            Step 02 · Validate
          </div>
          <div className="font-display font-bold text-[2.6vw] leading-tight text-text tracking-tight">
            Researchers log experiments
          </div>
          <div className="font-body text-[1.4vw] leading-relaxed text-muted text-pretty">
            Wet-lab teams record measured yield, selectivity, and conditions.
            Discrepancy analysis surfaces why a prediction failed — chemistry,
            handling, or model error.
          </div>
        </div>

        <div className="bg-bg-2/60 border-t-2 border-text p-[2.5vw] flex flex-col gap-[2vh]">
          <div className="font-mono text-[1vw] tracking-widest text-text uppercase">
            Step 03 · Learn
          </div>
          <div className="font-display font-bold text-[2.6vw] leading-tight text-text tracking-tight">
            Model retrains on results
          </div>
          <div className="font-body text-[1.4vw] leading-relaxed text-muted text-pretty">
            Every annotated experiment feeds back into the next discovery cycle.
            Retraining runs track accuracy before vs. after — institutional memory
            you can audit.
          </div>
        </div>
      </div>

      <div className="absolute bottom-[3vh] left-[6vw] right-[6vw] flex justify-between font-mono text-[1vw] text-muted/70 uppercase tracking-widest">
        <span>CatalystAI · Hackathon Pitch</span>
        <span>03 / 10</span>
      </div>
    </div>
  );
}
