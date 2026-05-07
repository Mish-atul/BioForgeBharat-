const base = import.meta.env.BASE_URL;

export default function Cover() {
  return (
    <div className="relative w-screen h-screen overflow-hidden bg-bg text-text font-body">
      <img
        src={`${base}hero-molecule.png`}
        crossOrigin="anonymous"
        alt="Abstract molecular catalyst lattice"
        className="absolute inset-0 w-full h-full object-cover opacity-70"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-bg via-bg/80 to-bg/10" />
      <div className="absolute inset-0 bg-gradient-to-t from-bg via-transparent to-transparent" />

      <div className="absolute top-[5vh] left-[5vw] right-[5vw] flex items-center justify-between font-mono text-[1.1vw] tracking-widest text-muted uppercase">
        <span>AI for Bharat · Hackathon 2026</span>
        <span className="text-primary">Govt. of Karnataka × Pan IIT</span>
      </div>

      <div className="absolute left-[5vw] bottom-[12vh] max-w-[70vw]">
        <div className="flex items-center gap-[1vw] text-primary font-mono text-[1.1vw] tracking-widest uppercase mb-[3vh]">
          <span className="inline-block w-[3vw] h-px bg-primary" />
          <span>Molecular Discovery Platform</span>
        </div>
        <h1 className="font-display font-bold text-[8vw] leading-[0.95] tracking-tighter text-text">
          Catalyst<span className="text-primary">AI</span>
        </h1>
        <p className="mt-[3vh] font-display font-medium text-[2.4vw] leading-tight text-text/85 max-w-[55vw] text-balance">
          AI-led discovery for chemical catalysts and engineered enzymes —
          collapsing R&amp;D timelines from years to weeks.
        </p>
      </div>

      <div className="absolute bottom-[5vh] left-[5vw] right-[5vw] flex items-end justify-between font-mono text-[1.1vw] text-muted">
        <span>catalystai.in</span>
        <span className="text-text/70">Direction 1 · Direction 2</span>
      </div>
    </div>
  );
}
