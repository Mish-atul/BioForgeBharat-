export default function ChemicalCatalysis() {
  return (
    <div className="relative w-screen h-screen overflow-hidden bg-bg text-text font-body">
      <div className="absolute inset-0 bg-[linear-gradient(110deg,rgba(0,204,204,0.08),transparent_45%)]" />
      <div className="absolute top-0 bottom-0 left-[40vw] w-px bg-border-line" />

      <div className="absolute top-[7vh] left-[6vw] w-[30vw]">
        <div className="font-mono text-[1.1vw] tracking-widest text-primary uppercase mb-[3vh]">
          Direction 01
        </div>
        <h2 className="font-display font-bold text-[4.6vw] leading-[1.0] tracking-tight text-text text-balance">
          Chemical Catalysis
        </h2>
        <p className="mt-[3vh] font-body text-[1.45vw] leading-relaxed text-muted text-pretty">
          Heterogeneous catalysts that turn waste streams and bio-feedstocks
          into refinery-grade fuels and platform chemicals.
        </p>
      </div>

      <div className="absolute left-[6vw] bottom-[10vh] w-[30vw] flex flex-col gap-[2vh]">
        <div className="font-mono text-[1vw] tracking-widest text-muted uppercase">
          Target reactions
        </div>
        <div className="font-display font-medium text-[1.6vw] text-text leading-tight">
          Ethanol-to-Jet · CO₂ hydrogenation · Methanol synthesis
        </div>
      </div>

      <div className="absolute top-[7vh] right-[6vw] w-[48vw] h-[78vh] flex flex-col gap-[2vh]">
        <div className="grid grid-cols-2 gap-[1.5vw] h-full">
          <div className="bg-bg-2/70 border border-border-line p-[2vw] flex flex-col justify-between">
            <div className="font-mono text-[0.95vw] tracking-widest text-primary uppercase">
              Candidate · Zeolite
            </div>
            <div className="font-display font-bold text-[2.6vw] leading-none text-text tracking-tight">
              HZSM-5
            </div>
            <div className="font-body text-[1.2vw] text-muted text-pretty">
              Shape-selective acidic framework — workhorse for ethanol oligomerization.
            </div>
            <div className="flex items-end gap-[1vw] font-mono text-[1vw]">
              <span className="text-accent text-[2vw] font-display font-bold">0.91</span>
              <span className="text-muted">predicted activity</span>
            </div>
          </div>

          <div className="bg-bg-2/70 border border-border-line p-[2vw] flex flex-col justify-between">
            <div className="font-mono text-[0.95vw] tracking-widest text-primary uppercase">
              Candidate · Bimetallic
            </div>
            <div className="font-display font-bold text-[2.6vw] leading-none text-text tracking-tight">
              Ni / HZSM-5
            </div>
            <div className="font-body text-[1.2vw] text-muted text-pretty">
              Nickel promoter on zeolite — boosts mid-distillate selectivity at
              moderate pressure.
            </div>
            <div className="flex items-end gap-[1vw] font-mono text-[1vw]">
              <span className="text-accent text-[2vw] font-display font-bold">0.87</span>
              <span className="text-muted">predicted activity</span>
            </div>
          </div>

          <div className="bg-bg-2/70 border border-border-line p-[2vw] flex flex-col justify-between">
            <div className="font-mono text-[0.95vw] tracking-widest text-primary uppercase">
              Candidate · Hybrid SAPO
            </div>
            <div className="font-display font-bold text-[2.6vw] leading-none text-text tracking-tight">
              Cu-ZnO / SAPO-34
            </div>
            <div className="font-body text-[1.2vw] text-muted text-pretty">
              Tandem CO₂-to-olefins — couples methanol synthesis with hydrocarbon
              chain growth.
            </div>
            <div className="flex items-end gap-[1vw] font-mono text-[1vw]">
              <span className="text-accent text-[2vw] font-display font-bold">0.78</span>
              <span className="text-muted">predicted activity</span>
            </div>
          </div>

          <div className="bg-bg-2/70 border border-border-line p-[2vw] flex flex-col justify-between">
            <div className="font-mono text-[0.95vw] tracking-widest text-primary uppercase">
              Candidate · Tungsten oxide
            </div>
            <div className="font-display font-bold text-[2.6vw] leading-none text-text tracking-tight">
              WO₃ / Al₂O₃
            </div>
            <div className="font-body text-[1.2vw] text-muted text-pretty">
              Acidic oxide for olefin metathesis — extends carbon range into jet.
            </div>
            <div className="flex items-end gap-[1vw] font-mono text-[1vw]">
              <span className="text-accent text-[2vw] font-display font-bold">0.72</span>
              <span className="text-muted">predicted activity</span>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-[3vh] left-[6vw] right-[6vw] flex justify-between font-mono text-[1vw] text-muted/70 uppercase tracking-widest">
        <span>CatalystAI · Hackathon Pitch</span>
        <span>04 / 10</span>
      </div>
    </div>
  );
}
