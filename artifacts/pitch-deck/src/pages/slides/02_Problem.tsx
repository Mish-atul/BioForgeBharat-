export default function Problem() {
  return (
    <div className="relative w-screen h-screen overflow-hidden bg-bg text-text font-body">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(0,204,204,0.10),transparent_55%)]" />
      <div className="absolute top-0 left-0 w-full h-px bg-border-line" />

      <div className="relative h-full grid grid-cols-12 gap-[2vw] px-[6vw] py-[8vh]">
        <div className="col-span-5 flex flex-col justify-between">
          <div>
            <div className="font-mono text-[1.1vw] tracking-widest text-primary uppercase mb-[2vh]">
              01 · The Problem
            </div>
            <h2 className="font-display font-bold text-[5vw] leading-[1.0] tracking-tight text-text text-balance">
              India spends decades discovering molecules the world already needs.
            </h2>
          </div>
          <p className="font-body text-[1.5vw] leading-relaxed text-muted max-w-[28vw] text-pretty">
            Catalyst and enzyme R&amp;D in India still runs on paper notebooks,
            scattered Excel files, and trial-and-error wet-lab cycles — while
            climate, fuel, and pharma deadlines compress every quarter.
          </p>
        </div>

        <div className="col-span-7 grid grid-cols-2 grid-rows-2 gap-[1.5vw]">
          <div className="bg-bg-2/70 border border-border-line p-[2.5vw] flex flex-col justify-between">
            <div className="font-mono text-[1vw] tracking-widest text-muted uppercase">
              Crude oil import bill
            </div>
            <div className="font-display font-bold text-[6vw] leading-none text-primary tracking-tight">
              $158B
            </div>
            <div className="font-body text-[1.3vw] text-text/80">
              India imports ~87% of crude — every percent shaved is national leverage.
            </div>
          </div>
          <div className="bg-bg-2/70 border border-border-line p-[2.5vw] flex flex-col justify-between">
            <div className="font-mono text-[1vw] tracking-widest text-muted uppercase">
              Industrial catalyst R&amp;D cycle
            </div>
            <div className="font-display font-bold text-[6vw] leading-none text-accent tracking-tight">
              5–10 yr
            </div>
            <div className="font-body text-[1.3vw] text-text/80">
              From hypothesis to pilot — most candidates die in the lab.
            </div>
          </div>
          <div className="bg-bg-2/70 border border-border-line p-[2.5vw] flex flex-col justify-between">
            <div className="font-mono text-[1vw] tracking-widest text-muted uppercase">
              Lab notebook reality
            </div>
            <div className="font-display font-bold text-[3.4vw] leading-tight text-text tracking-tight">
              Paper, Excel, tribal memory
            </div>
            <div className="font-body text-[1.3vw] text-muted">
              No structured candidate ranking, no learning loop, no shared knowledge.
            </div>
          </div>
          <div className="bg-bg-2/70 border border-border-line p-[2.5vw] flex flex-col justify-between">
            <div className="font-mono text-[1vw] tracking-widest text-muted uppercase">
              Sustainable Aviation Fuel mandate
            </div>
            <div className="font-display font-bold text-[3.4vw] leading-tight text-text tracking-tight">
              1% by 2027 · 5% by 2030
            </div>
            <div className="font-body text-[1.3vw] text-muted">
              MoPNG target — yet domestic SAF catalyst supply is near zero.
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-[3vh] left-[6vw] right-[6vw] flex justify-between font-mono text-[1vw] text-muted/70 uppercase tracking-widest">
        <span>CatalystAI · Hackathon Pitch</span>
        <span>02 / 10</span>
      </div>
    </div>
  );
}
