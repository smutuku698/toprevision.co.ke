import type { VisualSpec } from "@/lib/types";
import { ACCENT, ACCENT_LIGHT, GRID, INK } from "./visualTokens";

// Almost every question illustration is drawn in code (SVG) instead of shipped as an image asset — this is
// what lets a solo dev generate infinite CBC content without a media budget. The one deliberate exception is
// "photo-diagram" (see below), used sparingly for a handful of high-value labelled-photo skills.

export function Visual({ spec, className }: { spec: VisualSpec; className?: string }) {
  switch (spec.type) {
    case "right-triangle":
      return <RightTriangle {...spec} className={className} />;
    case "rectangle":
      return <RectangleShape {...spec} className={className} />;
    case "circle-shape":
      return <CircleShape {...spec} className={className} />;
    case "coordinate-line":
      return <CoordinateLine {...spec} className={className} />;
    case "bar-chart":
      return <BarChart {...spec} className={className} />;
    case "icon-set":
      return <IconSet {...spec} className={className} />;
    case "circuit":
      return <Circuit {...spec} className={className} />;
    case "flower":
      return <FlowerDiagram className={className} />;
    case "plant-cell":
      return <PlantCell className={className} />;
    case "animal-cell":
      return <AnimalCell className={className} />;
    case "particle-diagram":
      return <ParticleDiagram {...spec} className={className} />;
    case "solid":
      return <Solid spec={spec} className={className} />;
    case "circle-sector":
      return <CircleSector {...spec} className={className} />;
    case "fraction-bar":
      return <FractionBar {...spec} className={className} />;
    case "polygon":
      return <Polygon {...spec} className={className} />;
    case "line-graph":
      return <LineGraph {...spec} className={className} />;
    case "pie-chart":
      return <PieChart {...spec} className={className} />;
    case "grid-shape":
      return <GridShape {...spec} className={className} />;
    case "clock":
      return <Clock {...spec} className={className} />;
    case "weather":
      return <WeatherStrip {...spec} className={className} />;
    case "hazard-symbol":
      return <HazardSymbol {...spec} className={className} />;
    case "lab-apparatus":
      return <LabApparatus {...spec} className={className} />;
    case "separation-setup":
      return <SeparationSetup {...spec} className={className} />;
    case "litmus-test":
      return <LitmusTest {...spec} className={className} />;
    case "magnet":
      return <MagnetPair {...spec} className={className} />;
    case "reproductive-system":
      return <ReproductiveSystem {...spec} className={className} />;
    case "excretory-system":
      return <ExcretorySystem {...spec} className={className} />;
    case "hand-tool":
      return <HandTool {...spec} className={className} />;
    case "ppe-icon":
      return <PpeIcon {...spec} className={className} />;
    case "drawing-line":
      return <DrawingLine {...spec} className={className} />;
    case "kenyan-currency":
      return <KenyanCurrency {...spec} className={className} />;
    case "material-swatch":
      return <MaterialSwatch {...spec} className={className} />;
    case "photo-diagram":
      return <PhotoDiagram {...spec} className={className} />;
    case "fungus":
      return <FungusDiagram {...spec} className={className} />;
    case "invertebrate":
      return <InvertebrateDiagram {...spec} className={className} />;
    case "circulatory-system":
      return <CirculatorySystem {...spec} className={className} />;
    case "light-material":
      return <LightMaterial {...spec} className={className} />;
    case "plane-mirror":
      return <PlaneMirror {...spec} className={className} />;
    case "shadow-eclipse":
      return <ShadowEclipse {...spec} className={className} />;
    case "rainbow-formation":
      return <RainbowFormation className={className} />;
    case "lever-diagram":
      return <LeverDiagram {...spec} className={className} />;
    case "inclined-plane":
      return <InclinedPlane {...spec} className={className} />;
    case "soil-erosion":
      return <SoilErosion {...spec} className={className} />;
    case "garden-bed":
      return <GardenBed {...spec} className={className} />;
    case "crochet-stitch":
      return <CrochetStitch {...spec} className={className} />;
    case "fabric-stain":
      return <FabricStain {...spec} className={className} />;
    case "wildlife-deterrent":
      return <WildlifeDeterrent {...spec} className={className} />;
    case "color-wheel":
      return <ColorWheel {...spec} className={className} />;
    case "music-note":
      return <MusicNote {...spec} className={className} />;
    case "sol-fa-ladder":
      return <SolFaLadder {...spec} className={className} />;
    case "weave-pattern":
      return <WeavePattern {...spec} className={className} />;
    case "pottery-stage":
      return <PotteryStage {...spec} className={className} />;
    case "gymnastics-pose":
      return <GymnasticsPose {...spec} className={className} />;
    case "jump-technique":
      return <JumpTechnique {...spec} className={className} />;
    case "string-instrument-diagram":
      return <StringInstrumentDiagram {...spec} className={className} />;
    case "recorder-fingering":
      return <RecorderFingering {...spec} className={className} />;
    case "stipple-texture":
      return <StippleTexture {...spec} className={className} />;
    case "block-print-pattern":
      return <BlockPrintPattern {...spec} className={className} />;
    case "volleyball-skill":
      return <VolleyballSkill {...spec} className={className} />;
    case "atom-structure":
      return <AtomStructureDiagram {...spec} className={className} />;
    case "wave-diagram":
      return <WaveDiagram {...spec} className={className} />;
    case "curved-mirror-diagram":
      return <CurvedMirrorDiagram {...spec} className={className} />;
    case "weather-instrument":
      return <WeatherInstrument {...spec} className={className} />;
    case "hierarchy":
      return <Hierarchy {...spec} className={className} />;
    case "respiratory-system":
      return <RespiratorySystem className={className} />;
    case "vertebrate-group":
      return <VertebrateGroup {...spec} className={className} />;
    case "float-sink-object":
      return <FloatSinkObject {...spec} className={className} />;
    case "heat-transfer-mode":
      return <HeatTransferMode {...spec} className={className} />;
    default:
      return null;
  }
}

// A photographic/AI-generated labelled diagram (see curriculum-reference/grade-7/IMAGE-PROMPTS-nanobanana.json
// for how these are produced) — the only VisualSpec case that isn't drawn in code. Used sparingly, only where a
// real image genuinely adds value over a procedural SVG (see the conversation this was introduced in).
function PhotoDiagram({ image, alt, className }: Extract<VisualSpec, { type: "photo-diagram" }> & { className?: string }) {
  // max-h caps portrait/square images so they can't dominate page height just because they're narrow —
  // width alone (max-w-2xl) doesn't bound a tall image's rendered height.
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={image} alt={alt} className={className ?? "mx-auto h-auto max-h-[420px] w-full max-w-2xl object-contain"} />;
}

function HazardSymbol({ hazard, className }: Extract<VisualSpec, { type: "hazard-symbol" }> & { className?: string }) {
  const w = 120;
  const h = 120;
  const cx = 60;
  const cy = 60;
  const half = 46;
  const diamond = `${cx},${cy - half} ${cx + half},${cy} ${cx},${cy + half} ${cx - half},${cy}`;

  let icon: React.ReactNode;
  if (hazard === "flammable") {
    icon = (
      <path
        d="M60 32 C 50 46 42 54 44 66 C 46 78 54 84 60 84 C 66 84 76 78 76 66 C 76 56 68 52 66 44 C 65 50 60 52 60 46 C 60 40 64 38 60 32 Z"
        fill="#f97316"
        stroke="#7c2d12"
        strokeWidth={2}
      />
    );
  } else if (hazard === "corrosive") {
    icon = (
      <g>
        <path d="M44 32 L60 32 L54 56 L46 56 Z" fill="#94a3b8" stroke="#334155" strokeWidth={1.8} />
        <path d="M49 56 L45 70 M55 56 L59 70" stroke="#334155" strokeWidth={2} strokeLinecap="round" />
        <rect x={33} y={70} width={26} height={7} rx={2} fill="#334155" />
        <path d="M40 70 Q 43 77 38 82" stroke="#334155" strokeWidth={1.8} fill="none" />
        <ellipse cx={80} cy={62} rx={13} ry={8} fill="none" stroke="#334155" strokeWidth={1.8} />
        <path d="M72 66 Q 70 75 74 80" stroke="#334155" strokeWidth={1.8} fill="none" />
      </g>
    );
  } else if (hazard === "toxic") {
    icon = (
      <g>
        <circle cx={60} cy={54} r={14} fill="#1e293b" />
        <circle cx={54} cy={52} r={3} fill="white" />
        <circle cx={66} cy={52} r={3} fill="white" />
        <path d="M53 60 Q 60 65 67 60" stroke="white" strokeWidth={1.8} fill="none" />
        <path d="M44 76 L52 68 M76 76 L68 68 M60 68 L60 78" stroke="#1e293b" strokeWidth={3.5} strokeLinecap="round" />
      </g>
    );
  } else if (hazard === "carcinogenic") {
    icon = (
      <g fill="#7c2d12">
        <path d="M60 30 L64 48 L60 46 L56 48 Z" />
        <circle cx={60} cy={62} r={16} fill="none" stroke="#7c2d12" strokeWidth={2} />
        <path d="M60 50 L63 58 L71 58 L64 63 L67 71 L60 66 L53 71 L56 63 L49 58 L57 58 Z" />
      </g>
    );
  } else {
    icon = (
      <g fill="#1e293b">
        <circle cx={60} cy={58} r={5} />
        {[0, 120, 240].map((deg) => (
          <path key={deg} d="M60 58 L60 40 A 18 18 0 0 1 75.5 49 Z" transform={`rotate(${deg} 60 58)`} />
        ))}
      </g>
    );
  }

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className={className} width={w} height={h}>
      <polygon points={diamond} fill="#fef9c3" stroke="#dc2626" strokeWidth={5} />
      {icon}
    </svg>
  );
}

function LabApparatus({ item, className }: Extract<VisualSpec, { type: "lab-apparatus" }> & { className?: string }) {
  const w = 140;
  const h = 160;
  let body: React.ReactNode;

  if (item === "beaker") {
    body = (
      <g>
        <path d="M40 40 L100 40 L92 130 Q 70 138 48 130 Z" fill="#e0f2fe" stroke="#0369a1" strokeWidth={2.5} />
        <path d="M46 100 L94 100" stroke="#0369a1" strokeWidth={1.2} strokeDasharray="3 3" />
        <path d="M48 108 Q 70 118 92 108 L 90 128 Q 70 136 50 128 Z" fill="#38bdf8" opacity={0.75} />
        <path d="M96 42 L108 36" stroke="#0369a1" strokeWidth={2.5} strokeLinecap="round" />
      </g>
    );
  } else if (item === "test-tube") {
    body = (
      <g>
        <path d="M55 20 L85 20 L85 110 A 15 15 0 0 1 55 110 Z" fill="#e0f2fe" stroke="#0369a1" strokeWidth={2.5} />
        <path d="M55 70 L85 70 L85 110 A 15 15 0 0 1 55 110 Z" fill="#34d399" opacity={0.85} />
        <line x1={50} y1={20} x2={90} y2={20} stroke="#0369a1" strokeWidth={2.5} strokeLinecap="round" />
      </g>
    );
  } else if (item === "measuring-cylinder") {
    body = (
      <g>
        <rect x={55} y={20} width={30} height={110} rx={3} fill="#e0f2fe" stroke="#0369a1" strokeWidth={2.5} />
        <rect x={55} y={70} width={30} height={60} fill="#7dd3fc" />
        <rect x={45} y={126} width={50} height={10} rx={2} fill="#0369a1" />
        {[35, 55, 75, 95, 115].map((y) => (
          <line key={y} x1={55} y1={y} x2={62} y2={y} stroke="#0369a1" strokeWidth={1.2} />
        ))}
      </g>
    );
  } else if (item === "bunsen-burner") {
    body = (
      <g>
        <ellipse cx={70} cy={140} rx={26} ry={7} fill="#334155" />
        <rect x={64} y={60} width={12} height={80} fill="#94a3b8" stroke="#334155" strokeWidth={1.8} />
        <circle cx={70} cy={58} r={9} fill="#cbd5e1" stroke="#334155" strokeWidth={1.8} />
        <path d="M70 60 C 62 78 60 96 70 112 C 80 96 78 78 70 60 Z" fill="#38bdf8" />
        <path d="M70 74 C 66 86 65 98 70 108 C 75 98 74 86 70 74 Z" fill="#fde047" />
      </g>
    );
  } else if (item === "microscope") {
    body = (
      <g fill="none" stroke="#334155" strokeWidth={2.5}>
        <rect x={30} y={130} width={80} height={10} rx={2} fill="#475569" stroke="none" />
        <path d="M55 130 L55 100 Q 55 80 78 74" />
        <rect x={40} y={92} width={30} height={10} rx={2} fill="#94a3b8" stroke="#334155" />
        <circle cx={78} cy={68} r={7} fill="#38bdf8" stroke="#334155" />
        <line x1={78} y1={74} x2={78} y2={95} strokeWidth={5} />
        <path d="M78 40 L78 62" strokeWidth={6} strokeLinecap="round" />
        <circle cx={78} cy={36} r={6} fill="#cbd5e1" stroke="#334155" />
      </g>
    );
  } else if (item === "conical-flask") {
    body = (
      <g>
        <path d="M62 20 L78 20 L78 55 L104 128 Q 70 140 36 128 L62 55 Z" fill="#e0f2fe" stroke="#0369a1" strokeWidth={2.5} />
        <path d="M46 100 L94 100 L104 128 Q 70 140 36 128 Z" fill="#a78bfa" opacity={0.85} />
        <line x1={58} y1={20} x2={82} y2={20} stroke="#0369a1" strokeWidth={2.5} strokeLinecap="round" />
      </g>
    );
  } else if (item === "evaporating-dish") {
    body = (
      <g>
        <path d="M30 70 Q 70 60 110 70 L 100 100 Q 70 108 40 100 Z" fill="#fde68a" stroke="#b45309" strokeWidth={2.5} />
        <ellipse cx={70} cy={70} rx={40} ry={10} fill="#fef3c7" stroke="#b45309" strokeWidth={2} />
        <path d="M55 50 Q 58 40 52 32 M70 48 Q 73 36 68 28 M85 50 Q 88 40 82 32" stroke="#cbd5e1" strokeWidth={2} fill="none" strokeLinecap="round" />
      </g>
    );
  } else {
    body = (
      <g>
        <rect x={20} y={110} width={100} height={22} rx={4} fill="#a16207" stroke="#713f12" strokeWidth={2} />
        <rect x={20} y={95} width={100} height={16} rx={3} fill="#ca8a04" stroke="#713f12" strokeWidth={2} />
        {[38, 70, 102].map((x, i) => (
          <g key={x}>
            <circle cx={x} cy={103} r={7} fill="#451a03" />
            <path d={`M${x - 7} 40 L${x + 7} 40 L${x + 7} 100 A 7 7 0 0 1 ${x - 7} 100 Z`} fill="#e0f2fe" stroke="#0369a1" strokeWidth={1.8} />
            <path
              d={`M${x - 7} 70 L${x + 7} 70 L${x + 7} 100 A 7 7 0 0 1 ${x - 7} 100 Z`}
              fill={["#f87171", "#4ade80", "#60a5fa"][i]}
              opacity={0.85}
            />
          </g>
        ))}
      </g>
    );
  }

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className={className} width={w} height={h}>
      {body}
    </svg>
  );
}

function SeparationSetup({ method, className }: Extract<VisualSpec, { type: "separation-setup" }> & { className?: string }) {
  const w = 200;
  const h = 170;
  let scene: React.ReactNode;

  if (method === "filtration") {
    scene = (
      <g>
        <path d="M70 20 L130 20 L110 70 L90 70 Z" fill="#fde68a" opacity={0.5} stroke="#b45309" strokeWidth={1.8} />
        <path d="M78 24 L122 24 L106 62 L94 62 Z" fill="none" stroke="#92400e" strokeWidth={1.4} strokeDasharray="2 2" />
        <ellipse cx={100} cy={20} rx={30} ry={6} fill="none" stroke="#b45309" strokeWidth={1.8} />
        <circle cx={90} cy={16} r={3} fill="#78350f" />
        <circle cx={105} cy={14} r={3} fill="#78350f" />
        <circle cx={98} cy={18} r={2.5} fill="#78350f" />
        <path d="M100 70 L100 92" stroke="#475569" strokeWidth={2} />
        <path d="M60 92 L140 92 L130 140 Q 100 150 70 140 Z" fill="#e0f2fe" stroke="#0369a1" strokeWidth={2.5} />
        <path d="M72 118 L128 118 L130 140 Q 100 150 70 140 Z" fill="#7dd3fc" opacity={0.85} />
      </g>
    );
  } else if (method === "simple-distillation") {
    scene = (
      <g>
        <path
          d="M40 130 Q 40 100 60 90 L60 60 L48 40 L92 40 L80 60 L80 90 Q 100 100 100 130 Q 70 142 40 130 Z"
          fill="#e0f2fe"
          stroke="#0369a1"
          strokeWidth={2.5}
        />
        <path d="M46 112 Q 70 122 94 112 L100 130 Q 70 142 40 130 Z" fill="#38bdf8" opacity={0.75} />
        <line x1={70} y1={40} x2={70} y2={20} stroke="#334155" strokeWidth={2} />
        <rect x={100} y={44} width={70} height={12} rx={6} fill="#bae6fd" stroke="#0369a1" strokeWidth={2} />
        <path d="M172 52 Q 186 52 186 66 L186 96" stroke="#0369a1" strokeWidth={5} fill="none" strokeLinecap="round" />
        <path d="M156 96 L196 96 L188 130 Q 176 138 164 130 Z" fill="#e0f2fe" stroke="#0369a1" strokeWidth={2.2} />
      </g>
    );
  } else if (method === "evaporation") {
    scene = (
      <g>
        <path d="M40 80 Q 100 68 160 80 L 148 110 Q 100 120 52 110 Z" fill="#fde68a" stroke="#b45309" strokeWidth={2.5} />
        <path d="M55 65 Q 58 50 50 38 M100 62 Q 103 46 95 34 M145 65 Q 148 50 140 38" stroke="#94a3b8" strokeWidth={2.5} fill="none" strokeLinecap="round" />
        <path d="M60 120 L60 140 L140 140 L140 120" stroke="#475569" strokeWidth={3} fill="none" />
        <path d="M50 145 C 70 138 130 138 150 145" stroke="#f97316" strokeWidth={4} strokeLinecap="round" />
      </g>
    );
  } else if (method === "chromatography") {
    scene = (
      <g>
        <rect x={70} y={16} width={40} height={20} fill="#e2e8f0" stroke="#475569" strokeWidth={1.8} />
        <rect x={85} y={30} width={10} height={110} fill="#fefce8" stroke="#a16207" strokeWidth={1.8} />
        <circle cx={90} cy={128} r={3} fill="#7c2d12" />
        <path d="M85 122 Q 90 100 87 90 Q 92 78 88 65 Q 93 55 89 45" fill="none" stroke="#dc2626" strokeWidth={2} opacity={0.75} />
        <path d="M87 100 Q 92 80 89 65" fill="none" stroke="#2563eb" strokeWidth={2} opacity={0.75} />
        <path d="M60 132 L120 132 L120 150 L60 150 Z" fill="#dbeafe" stroke="#0369a1" strokeWidth={2} />
      </g>
    );
  } else {
    scene = (
      <g>
        <path d="M50 100 L130 100 L118 140 Q 90 150 62 140 Z" fill="#e0f2fe" stroke="#0369a1" strokeWidth={2.5} />
        <path d="M60 118 L120 118 L118 140 Q 90 150 62 140 Z" fill="#7c3aed" opacity={0.5} />
        <ellipse cx={90} cy={100} rx={40} ry={8} fill="none" stroke="#0369a1" strokeWidth={2} />
        <circle cx={78} cy={80} r={2.5} fill="#a855f7" />
        <circle cx={95} cy={70} r={2.5} fill="#a855f7" />
        <circle cx={106} cy={85} r={2.5} fill="#a855f7" />
        <circle cx={88} cy={58} r={2.5} fill="#a855f7" />
        <ellipse cx={90} cy={45} rx={34} ry={7} fill="none" stroke="#334155" strokeWidth={2} />
        <path d="M60 45 L60 30 Q 90 22 120 30 L120 45" fill="#f3f4f6" stroke="#334155" strokeWidth={2} />
        <rect x={70} y={20} width={12} height={10} fill="#a855f7" opacity={0.85} />
        <rect x={90} y={22} width={10} height={8} fill="#a855f7" opacity={0.85} />
      </g>
    );
  }

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className={className} width={w} height={h}>
      {scene}
    </svg>
  );
}

function LitmusTest({ result, className }: Extract<VisualSpec, { type: "litmus-test" }> & { className?: string }) {
  const w = 120;
  const h = 150;
  const liquidColor = result === "acid" ? "#fca5a5" : result === "base" ? "#93c5fd" : "#d8b4fe";
  const paperColor = result === "acid" ? "#dc2626" : result === "base" ? "#2563eb" : "#7c3aed";
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className={className} width={w} height={h}>
      <path d="M35 20 L85 20 L85 110 A 25 25 0 0 1 35 110 Z" fill="#f0f9ff" stroke="#334155" strokeWidth={2.5} />
      <path d="M35 65 L85 65 L85 110 A 25 25 0 0 1 35 110 Z" fill={liquidColor} />
      <line x1={30} y1={20} x2={90} y2={20} stroke="#334155" strokeWidth={2.5} strokeLinecap="round" />
      <rect x={54} y={4} width={10} height={70} rx={2} fill={paperColor} stroke="#1e293b" strokeWidth={1.2} transform="rotate(-6 60 40)" />
      <text x={60} y={135} textAnchor="middle" fontSize={13} fontWeight={700} fill="#1e293b">
        {result === "acid" ? "Acid" : result === "base" ? "Base" : "Neutral"}
      </text>
    </svg>
  );
}

function MagnetPair({ orientation, className }: Extract<VisualSpec, { type: "magnet" }> & { className?: string }) {
  const w = 220;
  const h = 120;
  const barW = 70;
  const barH = 40;
  const gap = orientation === "attract" ? 20 : 46;
  const leftX = 110 - gap / 2 - barW;
  const rightX = 110 + gap / 2;
  // The left bar's right-hand cell faces the gap; the right bar's left-hand cell faces the gap.
  const leftFacing = orientation === "attract" ? "S" : "N";
  const rightFacing = "N";

  const cell = (x: number, pole: "N" | "S") => (fill: string) => (
    <>
      <rect x={x} y={35} width={barW / 2} height={barH} fill={pole === "N" ? "#dc2626" : "#2563eb"} stroke="#1e293b" strokeWidth={2} />
      <text x={x + barW / 4} y={60} textAnchor="middle" fontSize={16} fontWeight={800} fill="white">
        {pole}
      </text>
    </>
  );

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className={className} width={w} height={h}>
      {cell(leftX, leftFacing === "N" ? "S" : "N")("")}
      {cell(leftX + barW / 2, leftFacing)("")}
      {cell(rightX, rightFacing)("")}
      {cell(rightX + barW / 2, rightFacing === "N" ? "S" : "N")("")}
      {orientation === "attract" ? (
        <path d={`M${leftX + barW + 6} 55 L${rightX - 6} 55`} stroke="#16a34a" strokeWidth={3} strokeLinecap="round" />
      ) : (
        <g stroke="#dc2626" strokeWidth={3} strokeLinecap="round">
          <path d={`M${(leftX + barW + rightX) / 2} 55 L${leftX + barW + 4} 55`} />
          <path d={`M${(leftX + barW + rightX) / 2} 55 L${rightX - 4} 55`} />
        </g>
      )}
      <text x={w / 2} y={100} textAnchor="middle" fontSize={12} fill="#1e293b" fontWeight={600}>
        {orientation === "attract" ? "Unlike poles attract" : "Like poles repel"}
      </text>
    </svg>
  );
}

function ReproductiveSystem({ sex, className }: Extract<VisualSpec, { type: "reproductive-system" }> & { className?: string }) {
  const w = 180;
  const h = 170;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className={className} width={w} height={h}>
      {sex === "male" ? (
        <g>
          <path d="M20 108 Q30 143 61 146 Q92 143 102 108 Q90 93 61 93 Q32 93 20 108 Z" fill="none" stroke="#9f1239" strokeWidth={2.5} />
          <ellipse cx={46} cy={120} rx={15} ry={19} fill="#fb7185" stroke="#9f1239" strokeWidth={2} />
          <ellipse cx={76} cy={120} rx={15} ry={19} fill="#fb7185" stroke="#9f1239" strokeWidth={2} />
          <rect x={95} y={93} width={70} height={26} rx={13} fill="#fecaca" stroke="#9f1239" strokeWidth={2.5} />
          <line x1={100} y1={106} x2={158} y2={106} stroke="#9f1239" strokeWidth={1.5} strokeDasharray="3 3" />
        </g>
      ) : (
        <g>
          <path d="M60 35 Q90 20 120 35 L118 70 Q90 90 62 70 Z" fill="#fda4af" stroke="#9f1239" strokeWidth={2.5} />
          <path d="M62 45 Q30 40 22 60" fill="none" stroke="#9f1239" strokeWidth={2.5} />
          <path d="M118 45 Q150 40 158 60" fill="none" stroke="#9f1239" strokeWidth={2.5} />
          <ellipse cx={18} cy={64} rx={11} ry={14} fill="#fb7185" stroke="#9f1239" strokeWidth={2} />
          <ellipse cx={162} cy={64} rx={11} ry={14} fill="#fb7185" stroke="#9f1239" strokeWidth={2} />
          <path d="M75 70 L105 70 L100 92 L80 92 Z" fill="#fda4af" stroke="#9f1239" strokeWidth={2.5} />
          <rect x={76} y={92} width={28} height={54} rx={6} fill="#fecaca" stroke="#9f1239" strokeWidth={2.5} />
        </g>
      )}
    </svg>
  );
}

function ExcretorySystem({ view, className }: Extract<VisualSpec, { type: "excretory-system" }> & { className?: string }) {
  const w = 200;
  const h = 300;

  if (view === "skin") {
    return (
      <svg viewBox={`0 0 200 150`} className={className} width={200} height={150}>
        <rect x={10} y={10} width={180} height={20} fill="#fde68a" stroke="#b45309" strokeWidth={2} />
        <rect x={10} y={30} width={180} height={90} fill="#fca5a5" stroke="#9f1239" strokeWidth={2} />
        <path d="M70 10 L58 -6" stroke="#78350f" strokeWidth={3} strokeLinecap="round" transform="translate(0,10)" />
        <ellipse cx={70} cy={45} rx={6} ry={9} fill="#78350f" opacity={0.7} />
        <path d="M120 115 C 108 110, 106 98, 116 92 C 106 88, 108 76, 120 72" fill="none" stroke="#dc2626" strokeWidth={3} strokeLinecap="round" />
        <path d="M120 72 L120 30" stroke="#dc2626" strokeWidth={3} strokeLinecap="round" />
        <circle cx={120} cy={26} r={4} fill="#dc2626" />
      </svg>
    );
  }

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className={className} width={w} height={h}>
      <g opacity={0.85}>
        <path d="M85 20 L85 130" stroke="#60a5fa" strokeWidth={10} strokeLinecap="round" />
        <path d="M102 20 L102 130" stroke="#f87171" strokeWidth={8} strokeLinecap="round" />
        <path d="M85 55 L55 60" stroke="#60a5fa" strokeWidth={5} />
        <path d="M97 65 L55 70" stroke="#f87171" strokeWidth={4} />
        <path d="M102 45 L145 50" stroke="#f87171" strokeWidth={4} />
        <path d="M85 40 L145 42" stroke="#60a5fa" strokeWidth={5} />
      </g>
      <path
        d="M45 55 C15 55 10 90 12 115 C15 140 30 150 45 150 C55 150 50 130 45 115 C40 100 50 70 45 55 Z"
        fill="#9f1239"
        stroke="#4c0519"
        strokeWidth={2}
      />
      <path
        d="M155 40 C185 40 190 75 188 100 C185 125 170 135 155 135 C145 135 150 115 155 100 C160 85 150 55 155 40 Z"
        fill="#9f1239"
        stroke="#4c0519"
        strokeWidth={2}
      />
      <path d="M44 145 C44 170 65 190 74 205" fill="none" stroke="#e2e8f0" strokeWidth={5} strokeLinecap="round" />
      <path d="M156 130 C156 165 135 190 116 205" fill="none" stroke="#e2e8f0" strokeWidth={5} strokeLinecap="round" />
      <path
        d="M100 200 C125 200 135 215 130 235 C125 257 115 262 100 262 C85 262 75 257 70 235 C65 215 75 200 100 200 Z"
        fill="#fbbf24"
        stroke="#92400e"
        strokeWidth={2.5}
      />
      <path d="M97 261 L97 285 C97 288 98 290 100 290 C102 290 103 288 103 285 L103 261 Z" fill="#e2e8f0" stroke="#64748b" strokeWidth={1.8} />
    </svg>
  );
}

function WeatherIcon({ condition, cx, cy }: { condition: "sunny" | "cloudy" | "rainy" | "stormy"; cx: number; cy: number }) {
  const cloud = (fill: string) => (
    <path
      d={`M ${cx - 16} ${cy + 6} a 9 9 0 0 1 3 -17.5 a 12 12 0 0 1 22.5 3.5 a 8 8 0 0 1 -1.5 15.9 h -24 z`}
      fill={fill}
      stroke="#475569"
      strokeWidth={1.5}
    />
  );
  if (condition === "sunny") {
    return (
      <g>
        <circle cx={cx} cy={cy} r={12} fill="#fbbf24" stroke="#d97706" strokeWidth={1.5} />
        {Array.from({ length: 8 }, (_, i) => {
          const deg = (i * 360) / 8;
          const rad = (deg * Math.PI) / 180;
          const x1 = cx + 15 * Math.cos(rad);
          const y1 = cy + 15 * Math.sin(rad);
          const x2 = cx + 21 * Math.cos(rad);
          const y2 = cy + 21 * Math.sin(rad);
          return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#d97706" strokeWidth={2} strokeLinecap="round" />;
        })}
      </g>
    );
  }
  if (condition === "cloudy") return cloud("#e2e8f0");
  if (condition === "rainy") {
    return (
      <g>
        {cloud("#cbd5e1")}
        {[-8, 2, 12].map((dx, i) => (
          <line key={i} x1={cx + dx} y1={cy + 14} x2={cx + dx - 3} y2={cy + 22} stroke="#0ea5e9" strokeWidth={2} strokeLinecap="round" />
        ))}
      </g>
    );
  }
  return (
    <g>
      {cloud("#94a3b8")}
      <path d={`M ${cx - 2} ${cy + 10} l -7 12 h 8 l -4 10 l 12 -14 h -8 z`} fill="#facc15" stroke="#ca8a04" strokeWidth={1} />
    </g>
  );
}

function WeatherStrip({ days, className }: Extract<VisualSpec, { type: "weather" }> & { className?: string }) {
  const cell = 60;
  const w = days.length * cell;
  const h = 90;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className={className} width={w} height={h}>
      {days.map((d, i) => (
        <g key={i}>
          <rect x={i * cell + 3} y={3} width={cell - 6} height={h - 6} rx={8} fill="#f8fafc" stroke={GRID} strokeWidth={1.5} />
          <WeatherIcon condition={d.condition} cx={i * cell + cell / 2} cy={38} />
          <text x={i * cell + cell / 2} y={h - 14} textAnchor="middle" fontSize={11} fill={INK}>
            {d.label}
          </text>
        </g>
      ))}
    </svg>
  );
}

function Clock({ hour, minute, className }: Extract<VisualSpec, { type: "clock" }> & { className?: string }) {
  const w = 200;
  const h = 200;
  const cx = 100;
  const cy = 100;
  const r = 80;
  const hour12 = hour % 12;
  const hourAngle = ((hour12 + minute / 60) / 12) * 360 - 90;
  const minuteAngle = (minute / 60) * 360 - 90;
  const toPoint = (deg: number, len: number) => {
    const rad = (deg * Math.PI) / 180;
    return { x: cx + len * Math.cos(rad), y: cy + len * Math.sin(rad) };
  };
  const hourTip = toPoint(hourAngle, r * 0.5);
  const minuteTip = toPoint(minuteAngle, r * 0.72);
  const ticks = Array.from({ length: 12 }, (_, i) => {
    const deg = (i / 12) * 360 - 90;
    const outer = toPoint(deg, r - 4);
    const inner = toPoint(deg, r - (i % 3 === 0 ? 16 : 10));
    return <line key={i} x1={outer.x} y1={outer.y} x2={inner.x} y2={inner.y} stroke={INK} strokeWidth={i % 3 === 0 ? 2.5 : 1.5} />;
  });
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className={className} width={w} height={h}>
      <circle cx={cx} cy={cy} r={r} fill="#e0f2fe" stroke={ACCENT} strokeWidth={3} />
      {ticks}
      <line x1={cx} y1={cy} x2={hourTip.x} y2={hourTip.y} stroke={INK} strokeWidth={4} strokeLinecap="round" />
      <line x1={cx} y1={cy} x2={minuteTip.x} y2={minuteTip.y} stroke={INK} strokeWidth={2.5} strokeLinecap="round" />
      <circle cx={cx} cy={cy} r={4} fill={INK} />
    </svg>
  );
}

function CircleSector({
  radius,
  angleDeg,
  showChord,
  className,
}: Extract<VisualSpec, { type: "circle-sector" }> & { className?: string }) {
  const W = 200;
  const H = 200;
  const cx = 100;
  const cy = 100;
  const r = 70;
  const startDeg = -90;
  const endDeg = startDeg + angleDeg;
  const toPoint = (deg: number) => {
    const rad = (deg * Math.PI) / 180;
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
  };
  const p1 = toPoint(startDeg);
  const p2 = toPoint(endDeg);
  const largeArc = angleDeg > 180 ? 1 : 0;
  const sectorPath = `M ${cx} ${cy} L ${p1.x} ${p1.y} A ${r} ${r} 0 ${largeArc} 1 ${p2.x} ${p2.y} Z`;
  const midDeg = startDeg + angleDeg / 2;
  const labelPoint = toPoint(midDeg - (angleDeg > 180 ? 180 : 0));

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className={className} width={W} height={H}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={GRID} strokeWidth={1.5} strokeDasharray="3 3" />
      <path d={sectorPath} fill="#bae6fd" stroke={ACCENT} strokeWidth={2.5} />
      {showChord && <line x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke="#dc2626" strokeWidth={2} strokeDasharray="4 2" />}
      <line x1={cx} y1={cy} x2={p1.x} y2={p1.y} stroke={INK} strokeWidth={1.5} />
      <text x={(cx + p1.x) / 2 - 10} y={(cy + p1.y) / 2} fontSize={12} fill={INK}>
        {radius}
      </text>
      <text x={(labelPoint.x + cx) / 2} y={(labelPoint.y + cy) / 2} textAnchor="middle" fontSize={12} fill={INK}>
        {angleDeg}°
      </text>
    </svg>
  );
}

function Solid({ spec, className }: { spec: Extract<VisualSpec, { type: "solid" }>; className?: string }) {
  switch (spec.shape) {
    case "cuboid":
      return <Cuboid length={spec.length} width={spec.width} height={spec.height} className={className} />;
    case "cube":
      return <Cuboid length={spec.side} width={spec.side} height={spec.side} className={className} />;
    case "cylinder":
      return <Cylinder radius={spec.radius} height={spec.height} className={className} />;
    case "cone":
      return <Cone radius={spec.radius} height={spec.height} className={className} />;
    case "sphere":
      return <Sphere radius={spec.radius} className={className} />;
    case "pyramid":
      return <Pyramid baseSide={spec.baseSide} height={spec.height} className={className} />;
    case "triangular-prism":
      return <TriangularPrism base={spec.base} triHeight={spec.triHeight} length={spec.length} className={className} />;
  }
}

function TriangularPrism({
  base,
  triHeight,
  length,
  className,
}: {
  base: number;
  triHeight: number;
  length: number;
  className?: string;
}) {
  const W = 220;
  const H = 180;
  const skx = 60;
  const sky = -30;
  const fx0 = 40, fy0 = 150; // front bottom-left
  const fx1 = 140, fy1 = 150; // front bottom-right
  const apexF = { x: 90, y: 60 }; // front apex

  const bx0 = fx0 + skx, by0 = fy0 + sky;
  const bx1 = fx1 + skx, by1 = fy1 + sky;
  const apexB = { x: apexF.x + skx, y: apexF.y + sky };

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className={className} width={W} height={H}>
      <polygon points={`${bx0},${by0} ${bx1},${by1} ${apexB.x},${apexB.y}`} fill="#bae6fd" stroke={ACCENT} strokeWidth={1.5} opacity={0.7} />
      <polygon points={`${fx0},${fy0} ${bx0},${by0} ${apexB.x},${apexB.y} ${apexF.x},${apexF.y}`} fill="#7dd3fc" stroke={ACCENT} strokeWidth={2} />
      <polygon points={`${fx1},${fy1} ${bx1},${by1} ${apexB.x},${apexB.y} ${apexF.x},${apexF.y}`} fill="#93c5fd" stroke={ACCENT} strokeWidth={2} />
      <polygon points={`${fx0},${fy0} ${fx1},${fy1} ${apexF.x},${apexF.y}`} fill="#e0f2fe" stroke={ACCENT} strokeWidth={2.5} />
      <text x={(fx0 + fx1) / 2} y={fy0 + 18} textAnchor="middle" fontSize={12} fill={INK}>
        {base}
      </text>
      <text x={fx0 - 24} y={(fy0 + apexF.y) / 2} textAnchor="end" fontSize={12} fill={INK}>
        {triHeight}
      </text>
      <text x={(fx1 + bx1) / 2 + 6} y={(fy1 + by1) / 2 + 14} textAnchor="middle" fontSize={12} fill={INK}>
        {length}
      </text>
    </svg>
  );
}

function FractionBar({
  numerator,
  denominator,
  label,
  className,
}: Extract<VisualSpec, { type: "fraction-bar" }> & { className?: string }) {
  const w = 240;
  const h = 70;
  const pad = 10;
  const barW = w - pad * 2;
  const segW = barW / denominator;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className={className} width={w} height={h}>
      {Array.from({ length: denominator }).map((_, i) => (
        <rect
          key={i}
          x={pad + i * segW}
          y={10}
          width={segW}
          height={32}
          fill={i < numerator ? "#38bdf8" : "#e0f2fe"}
          stroke={ACCENT}
          strokeWidth={1.5}
        />
      ))}
      <text x={w / 2} y={58} textAnchor="middle" fontSize={13} fill={INK}>
        {label ?? `${numerator}/${denominator}`}
      </text>
    </svg>
  );
}

function Polygon({ sides, label, className }: Extract<VisualSpec, { type: "polygon" }> & { className?: string }) {
  const w = 200;
  const h = 200;
  const cx = 100;
  const cy = 105;
  const r = 75;
  const points = Array.from({ length: sides }, (_, i) => {
    const angle = -Math.PI / 2 + (i * 2 * Math.PI) / sides;
    return `${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`;
  }).join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className={className} width={w} height={h}>
      <polygon points={points} fill="#e0f2fe" stroke={ACCENT} strokeWidth={2.5} />
      <text x={cx} y={h - 8} textAnchor="middle" fontSize={12} fill={INK}>
        {label ?? `${sides} sides`}
      </text>
    </svg>
  );
}

function LineGraph({ points, className }: Extract<VisualSpec, { type: "line-graph" }> & { className?: string }) {
  const w = 280;
  const h = 200;
  const pad = 32;
  const maxVal = Math.max(...points.map((p) => p.value), 1);
  const minVal = Math.min(...points.map((p) => p.value), 0);
  const span = maxVal - minVal || 1;
  const stepX = (w - pad * 2) / Math.max(points.length - 1, 1);
  const toXY = (i: number, v: number) => ({
    x: pad + i * stepX,
    y: h - pad - ((v - minVal) / span) * (h - pad * 2),
  });
  const linePoints = points.map((p, i) => toXY(i, p.value));
  const pathD = linePoints.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className={className} width={w} height={h}>
      <line x1={pad} y1={h - pad} x2={w - 10} y2={h - pad} stroke={INK} strokeWidth={1.5} />
      <line x1={pad} y1={10} x2={pad} y2={h - pad} stroke={INK} strokeWidth={1.5} />
      <path d={pathD} fill="none" stroke={ACCENT} strokeWidth={2.5} />
      {points.map((p, i) => {
        const { x, y } = toXY(i, p.value);
        return (
          <g key={p.label}>
            <circle cx={x} cy={y} r={4} fill="#dc2626" />
            <text x={x} y={h - pad + 16} textAnchor="middle" fontSize={10} fill={INK}>
              {p.label}
            </text>
            <text x={x} y={y - 8} textAnchor="middle" fontSize={10} fill={INK}>
              {p.value}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function GridShape({ rows, cols, filled, className }: Extract<VisualSpec, { type: "grid-shape" }> & { className?: string }) {
  const cell = 26;
  const w = cols * cell;
  const h = rows * cell;
  const filledSet = new Set(filled.map(([r, c]) => `${r},${c}`));
  const cells = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      cells.push(
        <rect
          key={`${r},${c}`}
          x={c * cell}
          y={r * cell}
          width={cell}
          height={cell}
          fill={filledSet.has(`${r},${c}`) ? "#7dd3fc" : "#f8fafc"}
          stroke={GRID}
          strokeWidth={1}
        />
      );
    }
  }
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className={className} width={w} height={h}>
      {cells}
    </svg>
  );
}

function Cuboid({ length, width, height, className }: { length: number; width: number; height: number; className?: string }) {
  const W = 220;
  const H = 180;
  const skx = 40;
  const sky = -26;
  const fx0 = 50, fy0 = 150; // front bottom-left
  const fx1 = 150, fy1 = 150; // front bottom-right
  const fx2 = 150, fy2 = 60; // front top-right
  const fx3 = 50, fy3 = 60; // front top-left
  const bx2 = fx2 + skx, by2 = fy2 + sky; // back top-right
  const bx3 = fx3 + skx, by3 = fy3 + sky; // back top-left
  const bx1 = fx1 + skx, by1 = fy1 + sky; // back bottom-right (for the right face)

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className={className} width={W} height={H}>
      <polygon points={`${fx3},${fy3} ${bx3},${by3} ${bx2},${by2} ${fx2},${fy2}`} fill="#bae6fd" stroke={ACCENT} strokeWidth={2} />
      <polygon points={`${fx1},${fy1} ${bx1},${by1} ${bx2},${by2} ${fx2},${fy2}`} fill="#7dd3fc" stroke={ACCENT} strokeWidth={2} />
      <rect x={fx0} y={fy2} width={fx1 - fx0} height={fy0 - fy2} fill="#e0f2fe" stroke={ACCENT} strokeWidth={2.5} />
      <text x={(fx0 + fx1) / 2} y={fy0 + 18} textAnchor="middle" fontSize={13} fill={INK}>
        {width}
      </text>
      <text x={fx0 - 8} y={(fy0 + fy2) / 2} textAnchor="end" fontSize={13} fill={INK}>
        {height}
      </text>
      <text x={(fx2 + bx2) / 2 + 6} y={(fy2 + by2) / 2 - 6} textAnchor="middle" fontSize={13} fill={INK}>
        {length}
      </text>
    </svg>
  );
}

function Cylinder({ radius, height, className }: { radius: number; height: number; className?: string }) {
  const W = 200;
  const H = 200;
  const cx = 100;
  const rx = 60;
  const ry = 18;
  const topY = 50;
  const botY = 150;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className={className} width={W} height={H}>
      <path
        d={`M ${cx - rx} ${topY} A ${rx} ${ry} 0 0 0 ${cx + rx} ${topY} L ${cx + rx} ${botY} A ${rx} ${ry} 0 0 1 ${cx - rx} ${botY} Z`}
        fill="#e0f2fe"
        stroke={ACCENT}
        strokeWidth={2.5}
      />
      <ellipse cx={cx} cy={topY} rx={rx} ry={ry} fill="#bae6fd" stroke={ACCENT} strokeWidth={2.5} />
      <line x1={cx} y1={topY} x2={cx + rx} y2={topY} stroke={INK} strokeWidth={1.5} />
      <text x={cx + rx / 2} y={topY - 6} textAnchor="middle" fontSize={12} fill={INK}>
        {radius}
      </text>
      <line x1={cx - rx - 16} y1={topY} x2={cx - rx - 16} y2={botY} stroke={INK} strokeWidth={1} />
      <text x={cx - rx - 22} y={(topY + botY) / 2} textAnchor="end" fontSize={12} fill={INK}>
        {height}
      </text>
    </svg>
  );
}

function Cone({ radius, height, className }: { radius: number; height: number; className?: string }) {
  const W = 200;
  const H = 200;
  const cx = 100;
  const rx = 55;
  const ry = 16;
  const baseY = 160;
  const apexY = 40;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className={className} width={W} height={H}>
      <polygon points={`${cx - rx},${baseY} ${cx},${apexY} ${cx + rx},${baseY}`} fill="#e0f2fe" stroke={ACCENT} strokeWidth={2.5} />
      <ellipse cx={cx} cy={baseY} rx={rx} ry={ry} fill="#bae6fd" stroke={ACCENT} strokeWidth={2.5} />
      <line x1={cx} y1={apexY} x2={cx} y2={baseY} stroke={INK} strokeWidth={1} strokeDasharray="3 3" />
      <text x={cx + 8} y={(apexY + baseY) / 2} fontSize={12} fill={INK}>
        {height}
      </text>
      <line x1={cx} y1={baseY} x2={cx + rx} y2={baseY} stroke={INK} strokeWidth={1.5} />
      <text x={cx + rx / 2} y={baseY + 16} textAnchor="middle" fontSize={12} fill={INK}>
        {radius}
      </text>
    </svg>
  );
}

function Sphere({ radius, className }: { radius: number; className?: string }) {
  const W = 200;
  const H = 200;
  const cx = 100;
  const cy = 100;
  const r = 70;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className={className} width={W} height={H}>
      <circle cx={cx} cy={cy} r={r} fill="#e0f2fe" stroke={ACCENT} strokeWidth={2.5} />
      <ellipse cx={cx} cy={cy} rx={r} ry={r * 0.35} fill="none" stroke={ACCENT} strokeWidth={1.5} strokeDasharray="4 3" opacity={0.7} />
      <line x1={cx} y1={cy} x2={cx + r} y2={cy} stroke={INK} strokeWidth={1.5} />
      <text x={cx + r / 2} y={cy - 8} textAnchor="middle" fontSize={13} fill={INK}>
        {radius}
      </text>
    </svg>
  );
}

function Pyramid({ baseSide, height, className }: { baseSide: number; height: number; className?: string }) {
  const W = 200;
  const H = 200;
  const cx = 100;
  const apexY = 30;
  const baseY = 160;
  const halfW = 55;
  const skx = 30;
  const sky = 14;
  const p1 = { x: cx - halfW, y: baseY };
  const p2 = { x: cx + halfW, y: baseY };
  const p3 = { x: cx + halfW + skx, y: baseY - sky };
  const p4 = { x: cx - halfW + skx, y: baseY - sky };
  const apex = { x: cx + skx / 2, y: apexY };

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className={className} width={W} height={H}>
      <polygon points={`${p1.x},${p1.y} ${p2.x},${p2.y} ${p3.x},${p3.y} ${p4.x},${p4.y}`} fill="#bae6fd" stroke={ACCENT} strokeWidth={2} />
      <polygon points={`${p2.x},${p2.y} ${p3.x},${p3.y} ${apex.x},${apex.y}`} fill="#7dd3fc" stroke={ACCENT} strokeWidth={2} />
      <polygon points={`${p1.x},${p1.y} ${p2.x},${p2.y} ${apex.x},${apex.y}`} fill="#e0f2fe" stroke={ACCENT} strokeWidth={2.5} />
      <line x1={p1.x} y1={p1.y} x2={apex.x} y2={apex.y} stroke={ACCENT} strokeWidth={1} strokeDasharray="3 3" opacity={0.6} />
      <text x={(p1.x + p2.x) / 2} y={p1.y + 18} textAnchor="middle" fontSize={12} fill={INK}>
        {baseSide}
      </text>
      <line x1={cx + skx / 2} y1={apexY} x2={cx + skx / 2} y2={baseY - sky / 2} stroke={INK} strokeWidth={1} strokeDasharray="3 3" />
      <text x={cx + skx / 2 + 8} y={(apexY + baseY) / 2} fontSize={12} fill={INK}>
        {height}
      </text>
    </svg>
  );
}

function RightTriangle({
  base,
  height,
  showHypotenuse = true,
  labelBase,
  labelHeight,
  labelHypotenuse,
  className,
}: Extract<VisualSpec, { type: "right-triangle" }> & { className?: string }) {
  const w = 220;
  const h = 180;
  const pad = 30;
  const x0 = pad;
  const y0 = h - pad;
  const x1 = w - pad;
  const y1 = h - pad;
  const x2 = pad;
  const y2 = pad;
  const hyp = Math.sqrt(base * base + height * height);
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className={className} width={220} height={180}>
      <polygon points={`${x0},${y0} ${x1},${y1} ${x2},${y2}`} fill="#e0f2fe" stroke={ACCENT} strokeWidth={3} />
      <rect x={x0} y={y0 - 12} width={12} height={12} fill="none" stroke={ACCENT} strokeWidth={1.5} />
      <text x={(x0 + x1) / 2} y={y0 + 20} textAnchor="middle" fontSize={13} fill={INK}>
        {labelBase ?? `${base}`}
      </text>
      <text x={x0 - 10} y={(y0 + y2) / 2} textAnchor="end" fontSize={13} fill={INK}>
        {labelHeight ?? `${height}`}
      </text>
      {showHypotenuse && (
        <text x={(x1 + x2) / 2 + 14} y={(y1 + y2) / 2 - 6} textAnchor="middle" fontSize={13} fill={INK}>
          {labelHypotenuse ?? roundLabel(hyp)}
        </text>
      )}
    </svg>
  );
}

function RectangleShape({
  width,
  height,
  labelWidth,
  labelHeight,
  className,
}: Extract<VisualSpec, { type: "rectangle" }> & { className?: string }) {
  const w = 220;
  const h = 160;
  const pad = 30;
  const rw = w - pad * 2;
  const rh = h - pad * 2;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className={className} width={220} height={160}>
      <rect x={pad} y={pad} width={rw} height={rh} fill="#e0f2fe" stroke={ACCENT} strokeWidth={3} />
      <text x={w / 2} y={h - 8} textAnchor="middle" fontSize={13} fill={INK}>
        {labelWidth ?? `${width}`}
      </text>
      <text x={pad - 8} y={h / 2} textAnchor="end" fontSize={13} fill={INK}>
        {labelHeight ?? `${height}`}
      </text>
    </svg>
  );
}

function CircleShape({ radius, label, className }: Extract<VisualSpec, { type: "circle-shape" }> & { className?: string }) {
  const w = 200;
  const h = 200;
  const cx = w / 2;
  const cy = h / 2;
  const r = 70;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className={className} width={200} height={200}>
      <circle cx={cx} cy={cy} r={r} fill="#e0f2fe" stroke={ACCENT} strokeWidth={3} />
      <line x1={cx} y1={cy} x2={cx + r} y2={cy} stroke={INK} strokeWidth={2} />
      <text x={cx + r / 2} y={cy - 8} textAnchor="middle" fontSize={13} fill={INK}>
        {label ?? `${radius}`}
      </text>
    </svg>
  );
}

function CoordinateLine({
  slope,
  intercept,
  points,
  showLine = true,
  className,
}: Extract<VisualSpec, { type: "coordinate-line" }> & { className?: string }) {
  const w = 260;
  const h = 260;
  const range = 10;
  const scale = (w - 40) / (range * 2);
  const cx = w / 2;
  const cy = h / 2;
  const toX = (x: number) => cx + x * scale;
  const toY = (y: number) => cy - y * scale;

  const x1 = -range;
  const x2 = range;
  const y1 = slope * x1 + intercept;
  const y2 = slope * x2 + intercept;

  // A gridline at every integer unit is essential — points are plotted at
  // exact integer coordinates, and if the grid only marks every 2nd unit,
  // an odd-coordinate point lands with no line under it, making a mathematically
  // exact point look like it's "between" intersections. Every unit must be marked.
  const gridLines = [];
  const labels = [];
  for (let i = -range; i <= range; i++) {
    const isAxis = i === 0;
    gridLines.push(
      <line key={`v${i}`} x1={toX(i)} y1={20} x2={toX(i)} y2={h - 20} stroke={GRID} strokeWidth={isAxis ? 0 : 0.75} />,
      <line key={`h${i}`} x1={20} y1={toY(i)} x2={w - 20} y2={toY(i)} stroke={GRID} strokeWidth={isAxis ? 0 : 0.75} />
    );
    if (i !== 0 && i % 2 === 0) {
      labels.push(
        <text key={`lx${i}`} x={toX(i)} y={cy + 12} textAnchor="middle" fontSize={8} fill={INK}>
          {i}
        </text>,
        <text key={`ly${i}`} x={cx - 5} y={toY(i) + 3} textAnchor="end" fontSize={8} fill={INK}>
          {i}
        </text>
      );
    }
  }

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className={className} width={260} height={260}>
      {gridLines}
      <line x1={20} y1={cy} x2={w - 20} y2={cy} stroke={INK} strokeWidth={1.5} />
      <line x1={cx} y1={20} x2={cx} y2={h - 20} stroke={INK} strokeWidth={1.5} />
      {labels}
      {showLine && (
        <line
          x1={toX(x1)}
          y1={clamp(toY(y1), 20, h - 20)}
          x2={toX(x2)}
          y2={clamp(toY(y2), 20, h - 20)}
          stroke={ACCENT}
          strokeWidth={3}
        />
      )}
      {points?.map(([px, py], i) => (
        <circle key={i} cx={toX(px)} cy={toY(py)} r={4} fill="#dc2626" stroke="white" strokeWidth={1.5} />
      ))}
    </svg>
  );
}

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}

function roundLabel(n: number) {
  return Number.isInteger(n) ? `${n}` : n.toFixed(1);
}

function BarChart({ data, className }: Extract<VisualSpec, { type: "bar-chart" }> & { className?: string }) {
  const w = 280;
  const h = 200;
  const pad = 30;
  const hasNegative = data.some((d) => d.value < 0);
  // SVG rects can't have a negative height, so when the data set can dip below
  // zero, put the baseline in the middle and let bars grow up or down from it.
  const baselineY = hasNegative ? pad + (h - pad * 2) / 2 : h - pad;
  const halfSpan = hasNegative ? (h - pad * 2) / 2 : h - pad * 2;
  const maxAbs = Math.max(...data.map((d) => Math.abs(d.value)), 1);
  const barW = (w - pad * 2) / data.length - 10;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className={className} width={280} height={200}>
      <line x1={pad} y1={baselineY} x2={w - 10} y2={baselineY} stroke={INK} strokeWidth={1.5} />
      {data.map((d, i) => {
        const barH = (halfSpan * Math.abs(d.value)) / maxAbs;
        const x = pad + i * ((w - pad * 2) / data.length) + 5;
        const isPositive = d.value >= 0;
        const y = isPositive ? baselineY - barH : baselineY;
        const colors = ["#0ea5e9", "#8b5cf6", "#22c55e", "#f59e0b", "#ec4899", "#14b8a6"];
        return (
          <g key={d.label}>
            <rect x={x} y={y} width={barW} height={barH} fill={colors[i % colors.length]} rx={3} />
            <text x={x + barW / 2} y={h - 8} textAnchor="middle" fontSize={11} fill={INK}>
              {d.label}
            </text>
            <text
              x={x + barW / 2}
              y={isPositive ? y - 4 : y + barH + 12}
              textAnchor="middle"
              fontSize={11}
              fill={INK}
            >
              {d.value}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

const PIE_COLORS = ["#0ea5e9", "#8b5cf6", "#22c55e", "#f59e0b", "#ec4899", "#14b8a6"];

function PieChart({ slices, className }: Extract<VisualSpec, { type: "pie-chart" }> & { className?: string }) {
  const size = 240;
  const cx = size / 2;
  const cy = size / 2;
  const r = 65;
  const total = slices.reduce((s, d) => s + d.value, 0) || 1;
  const point = (angle: number) => [cx + r * Math.cos(angle), cy + r * Math.sin(angle)];
  const arcs: { label: string; start: number; end: number }[] = [];
  {
    let cursor = -Math.PI / 2;
    for (const d of slices) {
      const sweep = (d.value / total) * Math.PI * 2;
      arcs.push({ label: d.label, start: cursor, end: cursor + sweep });
      cursor += sweep;
    }
  }
  return (
    <svg viewBox={`0 0 ${size} ${size}`} className={className} width={size} height={size}>
      {arcs.map(({ label, start, end }, i) => {
        const sweep = end - start;
        const [x1, y1] = point(start);
        const [x2, y2] = point(end);
        const largeArc = sweep > Math.PI ? 1 : 0;
        const midAngle = (start + end) / 2;
        const [lx, ly] = [cx + (r + 16) * Math.cos(midAngle), cy + (r + 16) * Math.sin(midAngle)];
        return (
          <g key={label}>
            <path
              d={`M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`}
              fill={PIE_COLORS[i % PIE_COLORS.length]}
              stroke="white"
              strokeWidth={1.5}
            />
            <text x={lx} y={ly} textAnchor="middle" fontSize={10} fill={INK}>
              {label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

const ICON_PATHS: Record<string, (color: string) => React.ReactNode> = {
  apple: (c) => (
    <g>
      <circle cx={12} cy={14} r={8} fill={c} />
      <path d="M12 6 C12 3, 15 3, 15 5" stroke="#166534" strokeWidth={1.5} fill="none" />
    </g>
  ),
  ball: (c) => <circle cx={12} cy={12} r={9} fill={c} />,
  coin: (c) => <circle cx={12} cy={12} r={9} fill={c} stroke="#92400e" strokeWidth={1.5} />,
  cube: (c) => <rect x={4} y={4} width={16} height={16} fill={c} stroke="#1e293b" strokeWidth={1.2} rx={2} />,
  book: (c) => <rect x={4} y={5} width={16} height={14} fill={c} stroke="#1e293b" strokeWidth={1.2} rx={1.5} />,
  pencil: (c) => <rect x={9} y={3} width={6} height={18} fill={c} rx={1.5} transform="rotate(20 12 12)" />,
};

function IconSet({ icon, count, color, className }: Extract<VisualSpec, { type: "icon-set" }> & { className?: string }) {
  const c = color ?? "#f59e0b";
  const cols = Math.min(count, 6);
  const rows = Math.ceil(count / cols);
  const cell = 32;
  const w = cols * cell;
  const h = rows * cell;
  const draw = ICON_PATHS[icon] ?? ICON_PATHS.ball;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className={className} width={w} height={h}>
      {Array.from({ length: count }).map((_, i) => {
        const col = i % cols;
        const row = Math.floor(i / cols);
        return (
          <g key={i} transform={`translate(${col * cell + 4}, ${row * cell + 4})`}>
            {draw(c)}
          </g>
        );
      })}
    </svg>
  );
}

function Circuit({ components, closed, className }: Extract<VisualSpec, { type: "circuit" }> & { className?: string }) {
  const w = 260;
  const h = 140;
  const glow = closed && components.includes("bulb");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className={className} width={260} height={140}>
      <rect x={20} y={20} width={w - 40} height={h - 40} fill="none" stroke={INK} strokeWidth={3} rx={6} />
      {components.includes("cell") && (
        <g transform={`translate(${w / 2 - 20}, ${h - 40})`}>
          <line x1={0} y1={0} x2={0} y2={20} stroke={INK} strokeWidth={4} />
          <line x1={16} y1={-4} x2={16} y2={24} stroke={INK} strokeWidth={2} />
        </g>
      )}
      {components.includes("bulb") && (
        <circle
          cx={w / 2}
          cy={20}
          r={16}
          fill={glow ? "#fde047" : "#f8fafc"}
          stroke={INK}
          strokeWidth={2.5}
        />
      )}
      {components.includes("switch") && (
        <g transform={`translate(30, ${h / 2 - 10})`}>
          <circle cx={0} cy={10} r={2.5} fill={INK} />
          <line x1={0} y1={10} x2={closed ? 22 : 14} y2={closed ? 10 : -2} stroke={INK} strokeWidth={2.5} />
          <circle cx={22} cy={10} r={2.5} fill={INK} />
        </g>
      )}
      {components.includes("resistor") && (
        <rect x={w - 60} y={h / 2 - 8} width={24} height={16} fill="#fbbf24" stroke={INK} strokeWidth={1.5} />
      )}
    </svg>
  );
}

function FlowerDiagram({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 220" className={className} width={200} height={220}>
      {[0, 72, 144, 216, 288].map((deg) => (
        <ellipse
          key={deg}
          cx={100}
          cy={70}
          rx={18}
          ry={34}
          fill="#f9a8d4"
          stroke="#db2777"
          strokeWidth={1.5}
          transform={`rotate(${deg} 100 100)`}
        />
      ))}
      <circle cx={100} cy={100} r={16} fill="#facc15" stroke="#ca8a04" strokeWidth={1.5} />
      <line x1={100} y1={140} x2={100} y2={210} stroke="#16a34a" strokeWidth={5} />
      <path d="M100 170 C 130 165, 140 150, 145 140 C 120 145, 105 155, 100 170" fill="#22c55e" />
      <g stroke="#166534" strokeWidth={2.5} fill="none" strokeLinecap="round">
        <path d="M100 210 Q 88 213 78 219" />
        <path d="M100 210 Q 100 212 100 213" />
        <path d="M100 210 Q 112 213 122 219" />
      </g>
    </svg>
  );
}

function PlantCell({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 220 160" className={className} width={220} height={160}>
      <rect x={10} y={10} width={200} height={140} rx={18} fill="#dcfce7" stroke="#166534" strokeWidth={3} />
      <rect x={20} y={20} width={180} height={120} rx={14} fill="#f0fdf4" stroke="#4ade80" strokeWidth={1.5} />
      <ellipse cx={90} cy={80} rx={26} ry={20} fill="#a78bfa" stroke="#6d28d9" strokeWidth={1.5} />
      <circle cx={150} cy={50} r={10} fill="#4ade80" />
      <circle cx={165} cy={100} r={8} fill="#4ade80" />
      <circle cx={60} cy={110} r={7} fill="#4ade80" />
    </svg>
  );
}

function AnimalCell({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 220 160" className={className} width={220} height={160}>
      <ellipse cx={110} cy={80} rx={100} ry={70} fill="#fee2e2" stroke="#b91c1c" strokeWidth={3} />
      <ellipse cx={95} cy={80} rx={24} ry={19} fill="#a78bfa" stroke="#6d28d9" strokeWidth={1.5} />
      <ellipse cx={150} cy={55} rx={9} ry={6} fill="#fb923c" />
      <ellipse cx={160} cy={100} rx={9} ry={6} fill="#fb923c" />
      <ellipse cx={65} cy={110} rx={9} ry={6} fill="#fb923c" />
    </svg>
  );
}

const PARTICLE_LAYOUTS: Record<"solid" | "liquid" | "gas", { cx: number; cy: number }[]> = {
  solid: [0, 1, 2, 3].flatMap((row) =>
    [0, 1, 2, 3].map((col) => ({ cx: 30 + col * 24, cy: 24 + row * 24 }))
  ),
  liquid: [
    { cx: 28, cy: 100 }, { cx: 50, cy: 92 }, { cx: 74, cy: 104 }, { cx: 98, cy: 90 },
    { cx: 30, cy: 122 }, { cx: 56, cy: 118 }, { cx: 82, cy: 124 }, { cx: 100, cy: 112 },
    { cx: 42, cy: 78 }, { cx: 68, cy: 84 },
  ],
  gas: [
    { cx: 20, cy: 20 }, { cx: 88, cy: 32 }, { cx: 45, cy: 60 }, { cx: 100, cy: 90 },
    { cx: 18, cy: 100 }, { cx: 60, cy: 110 }, { cx: 30, cy: 55 }, { cx: 95, cy: 18 },
  ],
};

function ParticleDiagram({ state, className }: Extract<VisualSpec, { type: "particle-diagram" }> & { className?: string }) {
  const w = 130;
  const h = 140;
  const dots = PARTICLE_LAYOUTS[state];
  const r = state === "gas" ? 5 : 6;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className={className} width={w} height={h}>
      <rect x={2} y={2} width={w - 4} height={h - 4} fill="#f0f9ff" stroke={INK} strokeWidth={2.5} rx={4} />
      {dots.map((d, i) => (
        <circle key={i} cx={d.cx} cy={d.cy} r={r} fill={ACCENT} stroke="#0369a1" strokeWidth={1} />
      ))}
    </svg>
  );
}

function HandTool({ item, className }: Extract<VisualSpec, { type: "hand-tool" }> & { className?: string }) {
  const w = 150;
  const h = 150;
  let body: React.ReactNode;

  if (item === "tape-measure") {
    body = (
      <g>
        <rect x={30} y={30} width={70} height={70} rx={10} fill="#facc15" stroke="#a16207" strokeWidth={2.5} />
        <circle cx={65} cy={65} r={22} fill="#fef9c3" stroke="#a16207" strokeWidth={2} />
        <path d="M65 65 L95 100" stroke="#374151" strokeWidth={5} strokeLinecap="round" />
        <rect x={92} y={98} width={22} height={8} rx={2} fill="#e2e8f0" stroke="#374151" strokeWidth={1.5} />
        {[0, 1, 2, 3, 4].map((i) => (
          <line key={i} x1={98 + i * 3.5} y1={98} x2={98 + i * 3.5} y2={106} stroke="#374151" strokeWidth={1} />
        ))}
      </g>
    );
  } else if (item === "steel-rule") {
    body = (
      <g>
        <rect x={20} y={65} width={110} height={20} fill="#e2e8f0" stroke="#334155" strokeWidth={2.2} />
        {Array.from({ length: 12 }).map((_, i) => (
          <line key={i} x1={26 + i * 9} y1={65} x2={26 + i * 9} y2={i % 2 === 0 ? 75 : 71} stroke="#334155" strokeWidth={1.2} />
        ))}
        <text x={75} y={98} textAnchor="middle" fontSize={11} fill="#334155" fontWeight={700}>
          cm
        </text>
      </g>
    );
  } else if (item === "callipers") {
    body = (
      <g fill="none" stroke="#475569" strokeWidth={4} strokeLinecap="round">
        <path d="M40 30 L40 100 L55 115" />
        <path d="M110 30 L110 100 L95 115" />
        <path d="M40 45 L110 45" strokeWidth={3} strokeDasharray="4 3" stroke="#94a3b8" />
        <circle cx={75} cy={45} r={9} fill="#cbd5e1" stroke="#475569" strokeWidth={2.5} />
        <path d="M62 92 L88 92" stroke="#0ea5e9" strokeWidth={4} />
      </g>
    );
  } else if (item === "weighing-balance") {
    body = (
      <g>
        <rect x={70} y={30} width={10} height={70} fill="#475569" />
        <line x1={30} y1={45} x2={120} y2={45} stroke="#334155" strokeWidth={4} strokeLinecap="round" />
        <path d="M30 45 L20 70 L40 70 Z" fill="none" stroke="#334155" strokeWidth={2} />
        <path d="M120 45 L110 70 L130 70 Z" fill="none" stroke="#334155" strokeWidth={2} />
        <ellipse cx={30} cy={73} rx={13} ry={5} fill="#94a3b8" stroke="#334155" strokeWidth={1.8} />
        <ellipse cx={120} cy={73} rx={13} ry={5} fill="#94a3b8" stroke="#334155" strokeWidth={1.8} />
        <rect x={55} y={106} width={40} height={16} rx={3} fill="#94a3b8" stroke="#334155" strokeWidth={2} />
        <circle cx={75} cy={35} r={5} fill="#0ea5e9" stroke="#334155" strokeWidth={1.5} />
      </g>
    );
  } else if (item === "divider") {
    body = (
      <g fill="none" stroke="#475569" strokeWidth={4} strokeLinecap="round">
        <circle cx={75} cy={32} r={7} fill="#cbd5e1" stroke="#475569" strokeWidth={2.5} />
        <path d="M75 38 L40 118" />
        <path d="M75 38 L110 118" />
        <circle cx={40} cy={120} r={2.5} fill="#334155" stroke="none" />
        <circle cx={110} cy={120} r={2.5} fill="#334155" stroke="none" />
      </g>
    );
  } else if (item === "try-square") {
    body = (
      <g>
        <rect x={30} y={30} width={20} height={90} rx={2} fill="#a16207" stroke="#713f12" strokeWidth={2.5} />
        <rect x={30} y={100} width={90} height={16} rx={2} fill="#94a3b8" stroke="#334155" strokeWidth={2.5} />
        {[45, 60, 75, 90, 105].map((x) => (
          <line key={x} x1={x} y1={100} x2={x} y2={107} stroke="#334155" strokeWidth={1.2} />
        ))}
      </g>
    );
  } else if (item === "marking-gauge") {
    body = (
      <g>
        <rect x={50} y={25} width={12} height={100} rx={3} fill="#a16207" stroke="#713f12" strokeWidth={2.2} />
        <rect x={30} y={95} width={60} height={22} rx={3} fill="#c2864a" stroke="#713f12" strokeWidth={2.2} />
        <circle cx={60} cy={106} r={3.5} fill="#475569" />
        <path d="M56 25 L66 25 L61 15 Z" fill="#94a3b8" stroke="#334155" strokeWidth={1.5} />
      </g>
    );
  } else if (item === "dot-punch") {
    body = (
      <g>
        <rect x={65} y={30} width={20} height={65} rx={4} fill="#94a3b8" stroke="#334155" strokeWidth={2.2} />
        <path d="M65 95 L85 95 L75 125 Z" fill="#cbd5e1" stroke="#334155" strokeWidth={2} />
        <circle cx={75} cy={128} r={2.5} fill="#0ea5e9" />
        {[42, 52, 62, 72, 82, 92].map((y) => (
          <line key={y} x1={65} y1={y} x2={85} y2={y} stroke="#475569" strokeWidth={1} opacity={0.4} />
        ))}
      </g>
    );
  } else if (item === "scriber") {
    body = (
      <g strokeLinecap="round">
        <rect x={35} y={68} width={70} height={12} rx={5} fill="#94a3b8" stroke="#334155" strokeWidth={2} transform="rotate(-8 70 74)" />
        <path d="M100 66 L124 60" stroke="#334155" strokeWidth={3} transform="rotate(-8 70 74)" />
        <circle cx={124} cy={60} r={2.5} fill="#0ea5e9" transform="rotate(-8 70 74)" />
      </g>
    );
  } else if (item === "pliers") {
    body = (
      <g fill="none" stroke="#475569" strokeWidth={5} strokeLinecap="round">
        <path d="M55 20 L40 60 L45 100 L35 130" />
        <path d="M95 20 L110 60 L105 100 L115 130" />
        <circle cx={75} cy={62} r={7} fill="#94a3b8" stroke="#334155" strokeWidth={2.5} />
      </g>
    );
  } else if (item === "clamp") {
    body = (
      <g fill="none" stroke="#475569" strokeWidth={5} strokeLinecap="round">
        <path d="M40 30 L40 120" strokeWidth={8} stroke="#94a3b8" />
        <path d="M40 35 L100 35" />
        <path d="M40 115 L90 115" />
        <rect x={85} y={100} width={12} height={30} fill="#cbd5e1" stroke="#334155" strokeWidth={2} />
        <circle cx={91} cy={95} r={6} fill="#0ea5e9" stroke="none" />
      </g>
    );
  } else if (item === "tongs") {
    body = (
      <g fill="none" stroke="#475569" strokeWidth={5} strokeLinecap="round">
        <path d="M50 25 Q40 70 55 120" />
        <path d="M100 25 Q110 70 95 120" />
        <path d="M60 120 Q75 130 90 120" strokeWidth={4} />
      </g>
    );
  } else if (item === "clip") {
    body = (
      <g fill="none" stroke="#475569" strokeWidth={5} strokeLinecap="round">
        <polygon points="45,40 105,40 90,100 60,100" fill="#334155" stroke="#1e293b" strokeWidth={2} />
        <path d="M60 40 L45 20" strokeWidth={3.5} />
        <path d="M90 40 L105 20" strokeWidth={3.5} />
      </g>
    );
  } else if (item === "vice") {
    body = (
      <g>
        <rect x={30} y={90} width={90} height={16} rx={3} fill="#94a3b8" stroke="#334155" strokeWidth={2.5} />
        <rect x={35} y={55} width={16} height={40} fill="#64748b" stroke="#334155" strokeWidth={2} />
        <rect x={95} y={55} width={16} height={40} fill="#64748b" stroke="#334155" strokeWidth={2} />
        <rect x={60} y={30} width={12} height={30} fill="#475569" />
        <circle cx={66} cy={25} r={8} fill="#0ea5e9" stroke="#334155" strokeWidth={2} />
      </g>
    );
  } else if (item === "hammer") {
    body = (
      <g>
        <rect x={68} y={55} width={12} height={75} rx={4} fill="#a16207" stroke="#713f12" strokeWidth={2.2} />
        <rect x={45} y={25} width={60} height={30} rx={5} fill="#64748b" stroke="#334155" strokeWidth={2.5} />
      </g>
    );
  } else if (item === "screwdriver") {
    body = (
      <g strokeLinecap="round">
        <rect x={60} y={20} width={16} height={55} rx={5} fill="#facc15" stroke="#a16207" strokeWidth={2.2} />
        <rect x={65} y={75} width={6} height={55} fill="#94a3b8" stroke="#334155" strokeWidth={1.8} />
      </g>
    );
  } else if (item === "spanner") {
    body = (
      <g fill="#94a3b8" stroke="#334155" strokeWidth={2.5}>
        <rect x={60} y={40} width={14} height={70} rx={4} />
        <circle cx={67} cy={30} r={18} fill="none" strokeWidth={8} />
        <circle cx={67} cy={120} r={16} fill="none" strokeWidth={7} />
      </g>
    );
  } else {
    // mallet
    body = (
      <g>
        <rect x={68} y={60} width={12} height={70} rx={4} fill="#a16207" stroke="#713f12" strokeWidth={2.2} />
        <rect x={40} y={30} width={70} height={34} rx={12} fill="#c2864a" stroke="#713f12" strokeWidth={2.5} />
      </g>
    );
  }

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className={className} width={w} height={h}>
      {body}
    </svg>
  );
}

function PpeIcon({ item, className }: Extract<VisualSpec, { type: "ppe-icon" }> & { className?: string }) {
  const w = 130;
  const h = 130;
  let body: React.ReactNode;

  if (item === "goggles") {
    body = (
      <g>
        <path d="M30 60 Q 65 40 100 60" fill="none" stroke="#334155" strokeWidth={3} />
        <ellipse cx={38} cy={68} rx={20} ry={16} fill="#bae6fd" stroke="#334155" strokeWidth={3} />
        <ellipse cx={92} cy={68} rx={20} ry={16} fill="#bae6fd" stroke="#334155" strokeWidth={3} />
        <line x1={30} y1={62} x2={10} y2={54} stroke="#334155" strokeWidth={3} strokeLinecap="round" />
        <line x1={100} y1={62} x2={120} y2={54} stroke="#334155" strokeWidth={3} strokeLinecap="round" />
      </g>
    );
  } else if (item === "gloves") {
    body = (
      <g fill="#f59e0b" stroke="#92400e" strokeWidth={2.5}>
        <path d="M45 100 L45 55 C45 45 55 45 55 55 L55 75 L58 40 C58 32 68 32 68 40 L68 75 L71 38 C71 30 81 30 81 38 L81 75 L84 45 C84 37 93 37 93 45 L93 90 C93 108 78 118 63 118 C52 118 45 110 45 100 Z" />
        <path d="M45 90 Q 30 88 30 100 Q 30 112 45 108" />
      </g>
    );
  } else if (item === "boots") {
    body = (
      <g fill="#78350f" stroke="#451a03" strokeWidth={2.5}>
        <path d="M40 30 L70 30 L70 75 L100 90 Q 110 96 108 106 L38 106 Q 32 106 32 98 L32 40 Q 32 30 40 30 Z" />
        <rect x={40} y={30} width={30} height={14} fill="#a16207" stroke="#451a03" strokeWidth={2} />
        <path d="M32 98 L108 98" stroke="#1e293b" strokeWidth={6} />
      </g>
    );
  } else if (item === "mask") {
    body = (
      <g>
        <path d="M32 55 Q 65 35 98 55 Q 100 78 65 85 Q 30 78 32 55 Z" fill="#e2e8f0" stroke="#334155" strokeWidth={2.5} />
        <path d="M40 58 Q 65 48 90 58" fill="none" stroke="#94a3b8" strokeWidth={1.5} />
        <path d="M45 68 Q 65 76 85 68" fill="none" stroke="#94a3b8" strokeWidth={1.5} />
        <line x1={32} y1={58} x2={10} y2={44} stroke="#334155" strokeWidth={2.5} strokeLinecap="round" />
        <line x1={98} y1={58} x2={120} y2={44} stroke="#334155" strokeWidth={2.5} strokeLinecap="round" />
      </g>
    );
  } else {
    // overalls
    body = (
      <g fill="#0ea5e9" stroke="#075985" strokeWidth={2.5}>
        <path d="M40 25 L55 25 L58 45 L72 45 L75 25 L90 25 L90 60 L100 60 L100 115 L75 115 L75 85 L55 85 L55 115 L30 115 L30 60 L40 60 Z" />
        <circle cx={50} cy={40} r={3} fill="#facc15" stroke="none" />
        <circle cx={80} cy={40} r={3} fill="#facc15" stroke="none" />
      </g>
    );
  }

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className={className} width={w} height={h}>
      {body}
    </svg>
  );
}

function DrawingLine({ style, className }: Extract<VisualSpec, { type: "drawing-line" }> & { className?: string }) {
  const w = 220;
  const h = 70;
  const strokeWidth = style === "thick-continuous" ? 5 : 2;
  const dash = style === "dashed" ? "10 6" : style === "chain" ? "16 5 3 5" : undefined;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className={className} width={w} height={h}>
      <rect x={1} y={1} width={w - 2} height={h - 2} rx={6} fill="#f8fafc" stroke={GRID} strokeWidth={1.5} />
      <line x1={20} y1={h / 2} x2={w - 20} y2={h / 2} stroke={INK} strokeWidth={strokeWidth} strokeDasharray={dash} strokeLinecap="round" />
    </svg>
  );
}

const CURRENCY_COLORS: Record<number, { outer: string; inner: string }> = {
  1: { outer: "#cbd5e1", inner: "#eab308" },
  5: { outer: "#eab308", inner: "#cbd5e1" },
  10: { outer: "#cbd5e1", inner: "#eab308" },
  20: { outer: "#eab308", inner: "#cbd5e1" },
};

const NOTE_COLORS: Record<number, string> = {
  40: "#c084fc",
  50: "#4ade80",
  100: "#60a5fa",
  200: "#fb923c",
  500: "#f87171",
  1000: "#facc15",
};

function KenyanCurrency({ kind, value, className }: Extract<VisualSpec, { type: "kenyan-currency" }> & { className?: string }) {
  if (kind === "coin") {
    const w = 130;
    const h = 130;
    const c = CURRENCY_COLORS[value] ?? { outer: "#cbd5e1", inner: "#eab308" };
    return (
      <svg viewBox={`0 0 ${w} ${h}`} className={className} width={w} height={h}>
        <circle cx={65} cy={65} r={58} fill={c.outer} stroke="#334155" strokeWidth={2.5} />
        <circle cx={65} cy={65} r={40} fill={c.inner} stroke="#334155" strokeWidth={2} />
        <text x={65} y={58} textAnchor="middle" fontSize={9} fontWeight={700} fill="#1e293b">
          SHILLINGS
        </text>
        <text x={65} y={85} textAnchor="middle" fontSize={24} fontWeight={800} fill="#1e293b">
          {value}
        </text>
      </svg>
    );
  }
  const w = 200;
  const h = 100;
  const color = NOTE_COLORS[value] ?? "#60a5fa";
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className={className} width={w} height={h}>
      <rect x={4} y={4} width={w - 8} height={h - 8} rx={6} fill={color} opacity={0.35} stroke="#334155" strokeWidth={2.5} />
      <rect x={16} y={16} width={w - 32} height={h - 32} rx={4} fill="none" stroke="#334155" strokeWidth={1.5} strokeDasharray="3 3" />
      <circle cx={45} cy={50} r={22} fill="none" stroke="#334155" strokeWidth={2} />
      <text x={45} y={56} textAnchor="middle" fontSize={16} fontWeight={800} fill="#1e293b">
        {value}
      </text>
      <text x={130} y={45} textAnchor="middle" fontSize={11} fontWeight={700} fill="#1e293b">
        KENYA
      </text>
      <text x={130} y={62} textAnchor="middle" fontSize={13} fontWeight={800} fill="#1e293b">
        {value} SHILLINGS
      </text>
    </svg>
  );
}

const MATERIAL_STYLE: Record<string, { fill: string; stroke: string }> = {
  steel: { fill: "#cbd5e1", stroke: "#475569" },
  aluminium: { fill: "#e2e8f0", stroke: "#64748b" },
  copper: { fill: "#dd6b20", stroke: "#7c2d12" },
  wood: { fill: "#c2864a", stroke: "#713f12" },
  plastic: { fill: "#38bdf8", stroke: "#075985" },
  glass: { fill: "#dbeafe", stroke: "#1e40af" },
  rubber: { fill: "#334155", stroke: "#0f172a" },
  stone: { fill: "#94a3b8", stroke: "#334155" },
  ceramic: { fill: "#fef3c7", stroke: "#a16207" },
  cement: { fill: "#a8a29e", stroke: "#44403c" },
  paper: { fill: "#fefce8", stroke: "#a16207" },
};

function MaterialSwatch({ material, className }: Extract<VisualSpec, { type: "material-swatch" }> & { className?: string }) {
  const w = 130;
  const h = 110;
  const { fill, stroke } = MATERIAL_STYLE[material];
  let texture: React.ReactNode = null;

  if (material === "steel" || material === "aluminium") {
    texture = (
      <>
        <line x1={15} y1={30} x2={115} y2={30} stroke="white" strokeWidth={2} opacity={0.5} />
        <line x1={15} y1={45} x2={115} y2={45} stroke="white" strokeWidth={1.2} opacity={0.35} />
      </>
    );
  } else if (material === "wood") {
    texture = (
      <>
        <path d="M10 25 Q 65 35 120 25" stroke="#713f12" strokeWidth={2} fill="none" opacity={0.5} />
        <path d="M10 50 Q 65 60 120 50" stroke="#713f12" strokeWidth={2} fill="none" opacity={0.5} />
        <path d="M10 75 Q 65 85 120 75" stroke="#713f12" strokeWidth={2} fill="none" opacity={0.5} />
      </>
    );
  } else if (material === "stone" || material === "cement") {
    texture = (
      <>
        <circle cx={35} cy={35} r={4} fill="white" opacity={0.3} />
        <circle cx={80} cy={55} r={6} fill="white" opacity={0.25} />
        <circle cx={55} cy={80} r={3} fill="white" opacity={0.3} />
        <circle cx={100} cy={30} r={3} fill="white" opacity={0.3} />
      </>
    );
  } else if (material === "glass") {
    texture = <path d="M25 20 L45 90" stroke="white" strokeWidth={6} opacity={0.5} strokeLinecap="round" />;
  } else if (material === "paper") {
    texture = (
      <>
        <line x1={20} y1={35} x2={110} y2={35} stroke="#cbd5e1" strokeWidth={2} />
        <line x1={20} y1={55} x2={110} y2={55} stroke="#cbd5e1" strokeWidth={2} />
        <line x1={20} y1={75} x2={90} y2={75} stroke="#cbd5e1" strokeWidth={2} />
      </>
    );
  } else if (material === "rubber") {
    texture = <circle cx={65} cy={55} r={18} fill="none" stroke="#64748b" strokeWidth={2} opacity={0.5} />;
  }

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className={className} width={w} height={h}>
      <rect x={5} y={5} width={w - 10} height={h - 10} rx={10} fill={fill} stroke={stroke} strokeWidth={3} />
      {texture}
    </svg>
  );
}

// ---- Grade 6 Science & Technology --------------------------------------

function FungusDiagram({ kind, className }: Extract<VisualSpec, { type: "fungus" }> & { className?: string }) {
  const w = 140;
  const h = 150;
  let body: React.ReactNode;

  if (kind === "mushroom") {
    body = (
      <g>
        <rect x={62} y={80} width={16} height={55} rx={5} fill="#fef3c7" stroke="#a16207" strokeWidth={2} />
        <path d="M20 82 Q 70 22 120 82 Q 70 100 20 82 Z" fill="#c2874a" stroke="#78350f" strokeWidth={2.5} />
        <path d="M28 80 Q 70 32 112 80" fill="none" stroke="#78350f" strokeWidth={1.2} opacity={0.4} />
      </g>
    );
  } else if (kind === "toadstool") {
    body = (
      <g>
        <rect x={62} y={82} width={16} height={53} rx={5} fill="#fef9c3" stroke="#a16207" strokeWidth={2} />
        <path d="M16 84 Q 70 18 124 84 Q 70 108 16 84 Z" fill="#dc2626" stroke="#7f1d1d" strokeWidth={2.5} />
        {[[45, 58], [70, 48], [95, 60], [58, 72], [84, 74]].map(([cx, cy], i) => (
          <circle key={i} cx={cx} cy={cy} r={5.5} fill="#fef3c7" stroke="#7f1d1d" strokeWidth={1} />
        ))}
      </g>
    );
  } else if (kind === "puffball") {
    body = (
      <g>
        <rect x={64} y={112} width={12} height={22} rx={4} fill="#e7e5cc" stroke="#a3a35c" strokeWidth={1.8} />
        <circle cx={70} cy={80} r={40} fill="#f5f3dc" stroke="#a3a35c" strokeWidth={2.5} />
        <circle cx={70} cy={44} r={4} fill="#78716c" />
        {[[70, 30], [58, 22], [82, 20], [50, 12], [90, 10]].map(([cx, cy], i) => (
          <circle key={i} cx={cx} cy={cy} r={2 - i * 0.2} fill="#a8a29e" opacity={0.7} />
        ))}
      </g>
    );
  } else if (kind === "yeast") {
    const cells = [
      { cx: 45, cy: 70, r: 16, bud: { cx: 66, cy: 58, r: 8 } },
      { cx: 95, cy: 90, r: 14, bud: { cx: 112, cy: 78, r: 7 } },
      { cx: 70, cy: 115, r: 12, bud: null },
    ];
    body = (
      <g>
        {cells.map((c, i) => (
          <g key={i}>
            <circle cx={c.cx} cy={c.cy} r={c.r} fill="#fde68a" stroke="#a16207" strokeWidth={2} />
            <circle cx={c.cx - c.r * 0.2} cy={c.cy - c.r * 0.2} r={c.r * 0.3} fill="#a16207" opacity={0.35} />
            {c.bud && (
              <>
                <circle cx={c.bud.cx} cy={c.bud.cy} r={c.bud.r} fill="#fde68a" stroke="#a16207" strokeWidth={1.8} />
                <line x1={c.cx + c.r * 0.6} y1={c.cy - c.r * 0.5} x2={c.bud.cx - c.bud.r * 0.5} y2={c.bud.cy + c.bud.r * 0.5} stroke="#a16207" strokeWidth={1.5} />
              </>
            )}
          </g>
        ))}
        <text x={70} y={144} textAnchor="middle" fontSize={10} fill={INK}>
          budding yeast cells (microscopic)
        </text>
      </g>
    );
  } else {
    // mould — fuzzy patches on a slice of bread
    body = (
      <g>
        <path d="M15 60 Q15 20 70 20 Q125 20 125 60 L125 120 L15 120 Z" fill="#fde68a" stroke="#b45309" strokeWidth={2.5} />
        <rect x={15} y={112} width={110} height={12} fill="#d97706" opacity={0.5} />
        {[[40, 45, 12], [75, 38, 15], [95, 70, 11], [55, 80, 9], [30, 90, 8]].map(([cx, cy, r], i) => (
          <g key={i}>
            <circle cx={cx} cy={cy} r={r} fill={i % 2 === 0 ? "#166534" : "#0f766e"} opacity={0.8} />
            {Array.from({ length: 6 }).map((_, j) => {
              const ang = (j / 6) * Math.PI * 2;
              return <circle key={j} cx={cx + Math.cos(ang) * (r - 2)} cy={cy + Math.sin(ang) * (r - 2)} r={1.6} fill="#052e16" />;
            })}
          </g>
        ))}
      </g>
    );
  }

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className={className} width={w} height={h}>
      {body}
    </svg>
  );
}

function InvertebrateDiagram({ kind, className }: Extract<VisualSpec, { type: "invertebrate" }> & { className?: string }) {
  const w = 170;
  const h = 130;
  let body: React.ReactNode;

  if (kind === "insect") {
    body = (
      <g fill="#78350f" stroke="#451a03" strokeWidth={1.8}>
        <circle cx={35} cy={65} r={13} />
        <ellipse cx={70} cy={65} rx={16} ry={14} />
        <ellipse cx={115} cy={65} rx={26} ry={18} />
        <path d="M25 55 L10 42 M25 58 L8 55" stroke="#451a03" strokeWidth={2} fill="none" strokeLinecap="round" />
        {[0, 1, 2].map((i) => (
          <g key={i}>
            <line x1={65 + i * 15} y1={78} x2={55 + i * 15} y2={100} stroke="#451a03" strokeWidth={3} strokeLinecap="round" />
            <line x1={65 + i * 15} y1={70} x2={40 + i * 15} y2={85} stroke="#451a03" strokeWidth={3} strokeLinecap="round" />
          </g>
        ))}
      </g>
    );
  } else if (kind === "spider") {
    body = (
      <g fill="#1e293b" stroke="#0f172a" strokeWidth={1.5}>
        <circle cx={55} cy={62} r={12} />
        <ellipse cx={95} cy={65} rx={26} ry={20} />
        {[[-1, -1], [-1, 1], [1, -1], [1, 1]].map(([dx, dy], i) => (
          <g key={i}>
            {[0, 1].map((j) => (
              <line
                key={j}
                x1={dx > 0 ? 105 : 45}
                y1={dy > 0 ? 75 : 55}
                x2={dx > 0 ? 140 + j * 8 : 20 - j * 8}
                y2={dy > 0 ? 100 + j * 12 : 20 - j * 12}
                stroke="#0f172a"
                strokeWidth={2.5}
                strokeLinecap="round"
              />
            ))}
          </g>
        ))}
      </g>
    );
  } else if (kind === "millipede-centipede") {
    const segs = Array.from({ length: 9 }, (_, i) => 15 + i * 16);
    body = (
      <g>
        <path d={`M15 65 Q ${w / 2} 55 155 65`} fill="none" stroke="#57534e" strokeWidth={16} strokeLinecap="round" />
        {segs.map((x, i) => (
          <g key={i}>
            <line x1={x} y1={73} x2={x - 6} y2={90} stroke="#292524" strokeWidth={2} strokeLinecap="round" />
            <line x1={x} y1={73} x2={x + 6} y2={90} stroke="#292524" strokeWidth={2} strokeLinecap="round" />
            <line x1={x} y1={57} x2={x - 6} y2={40} stroke="#292524" strokeWidth={2} strokeLinecap="round" />
            <line x1={x} y1={57} x2={x + 6} y2={40} stroke="#292524" strokeWidth={2} strokeLinecap="round" />
          </g>
        ))}
        <circle cx={12} cy={65} r={9} fill="#292524" />
      </g>
    );
  } else if (kind === "snail-slug") {
    body = (
      <g>
        <path d="M50 100 Q10 100 15 75 Q20 55 45 60 Q40 40 60 38 Q45 45 50 60 Q75 55 78 78 Q80 95 60 100 Z" fill="#a3e635" stroke="#365314" strokeWidth={2} />
        <circle cx={62} cy={55} r={26} fill="#d6d3d1" stroke="#57534e" strokeWidth={2.5} />
        <path d="M62 55 m0 -20 a20 20 0 0 1 14 34" fill="none" stroke="#78716c" strokeWidth={1.5} opacity={0.6} />
        <line x1={22} y1={72} x2={14} y2={55} stroke="#365314" strokeWidth={2.5} strokeLinecap="round" />
        <line x1={30} y1={70} x2={26} y2={52} stroke="#365314" strokeWidth={2.5} strokeLinecap="round" />
        <circle cx={14} cy={55} r={2.5} fill="#1a2e05" />
        <circle cx={26} cy={52} r={2.5} fill="#1a2e05" />
      </g>
    );
  } else if (kind === "worm") {
    body = (
      <g fill="none" stroke="#be185d" strokeWidth={14} strokeLinecap="round">
        <path d="M15 40 Q 45 90 75 40 Q 105 90 135 40 Q 150 70 155 90" />
        {Array.from({ length: 12 }).map((_, i) => (
          <line key={i} x1={15 + i * 12} y1={20} x2={15 + i * 12} y2={110} stroke="#9f1239" strokeWidth={1.5} opacity={0.35} />
        ))}
      </g>
    );
  } else if (kind === "crab") {
    body = (
      <g fill="#f97316" stroke="#9a3412" strokeWidth={2}>
        <ellipse cx={85} cy={65} rx={45} ry={28} />
        <path d="M40 55 Q10 40 5 20 Q30 30 45 48" />
        <path d="M130 55 Q160 40 165 20 Q140 30 125 48" />
        {[0, 1, 2].map((i) => (
          <g key={i} stroke="#9a3412" strokeWidth={2.5} fill="none">
            <path d={`M${50 - i * 6} ${85 + i * 6} L${30 - i * 10} ${105 + i * 8}`} />
            <path d={`M${120 + i * 6} ${85 + i * 6} L${140 + i * 10} ${105 + i * 8}`} />
          </g>
        ))}
        <circle cx={70} cy={45} r={4} fill="#1e293b" />
        <circle cx={100} cy={45} r={4} fill="#1e293b" />
      </g>
    );
  } else if (kind === "starfish") {
    const points = Array.from({ length: 10 }, (_, i) => {
      const ang = (i / 10) * Math.PI * 2 - Math.PI / 2;
      const r = i % 2 === 0 ? 55 : 22;
      return `${85 + r * Math.cos(ang)},${65 + r * Math.sin(ang)}`;
    }).join(" ");
    body = (
      <g>
        <polygon points={points} fill="#fb923c" stroke="#9a3412" strokeWidth={2.5} strokeLinejoin="round" />
        <circle cx={85} cy={65} r={10} fill="#fdba74" stroke="#9a3412" strokeWidth={1.5} />
      </g>
    );
  } else if (kind === "tick") {
    // A tick's body is fused into a single oval (unlike a spider's two clear segments), with short stubby
    // legs — the shape difference is what makes it visually distinguishable from the spider glyph above.
    body = (
      <g fill="#7c2d12" stroke="#431407" strokeWidth={1.5}>
        <ellipse cx={85} cy={68} rx={24} ry={28} />
        <circle cx={85} cy={44} r={6} fill="#431407" />
        {[[-1, -1], [-1, 1], [1, -1], [1, 1]].map(([dx, dy], i) => (
          <g key={i}>
            {[0, 1].map((j) => (
              <line
                key={j}
                x1={dx > 0 ? 102 : 68}
                y1={dy > 0 ? 82 : 54}
                x2={dx > 0 ? 128 + j * 6 : 42 - j * 6}
                y2={dy > 0 ? 100 + j * 7 : 36 - j * 7}
                stroke="#431407"
                strokeWidth={2.5}
                strokeLinecap="round"
              />
            ))}
          </g>
        ))}
      </g>
    );
  } else if (kind === "mite") {
    // Mites are drawn tiny inside a dashed "magnified view" circle, since the design explicitly describes
    // them as often too small to see clearly without magnification.
    body = (
      <g>
        <circle cx={85} cy={60} r={40} fill="none" stroke="#94a3b8" strokeWidth={2} strokeDasharray="4 3" />
        <g fill="#57534e" stroke="#292524" strokeWidth={1}>
          <ellipse cx={85} cy={60} rx={9} ry={11} />
          {[[-1, -1], [-1, 1], [1, -1], [1, 1]].map(([dx, dy], i) => (
            <g key={i}>
              {[0, 1].map((j) => (
                <line
                  key={j}
                  x1={dx > 0 ? 91 : 79}
                  y1={dy > 0 ? 65 : 55}
                  x2={dx > 0 ? 101 + j * 3 : 69 - j * 3}
                  y2={dy > 0 ? 71 + j * 4 : 49 - j * 4}
                  stroke="#292524"
                  strokeWidth={1.2}
                  strokeLinecap="round"
                />
              ))}
            </g>
          ))}
        </g>
        <text x={85} y={112} textAnchor="middle" fontSize={9} fill={INK}>
          Too small to see clearly
        </text>
      </g>
    );
  } else {
    // octopus
    body = (
      <g>
        <ellipse cx={85} cy={45} rx={38} ry={30} fill="#9333ea" stroke="#581c87" strokeWidth={2.5} />
        <circle cx={72} cy={40} r={4} fill="white" />
        <circle cx={98} cy={40} r={4} fill="white" />
        <circle cx={72} cy={40} r={2} fill="#1e293b" />
        <circle cx={98} cy={40} r={2} fill="#1e293b" />
        {Array.from({ length: 8 }).map((_, i) => {
          const x0 = 50 + i * 10;
          return (
            <path
              key={i}
              d={`M${x0} 65 Q ${x0 - 6} 90 ${x0 + (i % 2 === 0 ? -10 : 10)} 115`}
              fill="none"
              stroke="#9333ea"
              strokeWidth={7}
              strokeLinecap="round"
            />
          );
        })}
      </g>
    );
  }

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className={className} width={w} height={h}>
      {body}
    </svg>
  );
}

function CirculatorySystem({ view, className }: Extract<VisualSpec, { type: "circulatory-system" }> & { className?: string }) {
  const w = 220;
  const h = 220;

  if (view === "vessels") {
    return (
      <svg viewBox="0 0 240 130" className={className} width={240} height={130}>
        {[
          { cx: 40, label: "Artery", wall: 20, lumen: 10, wallFill: "#f87171" },
          { cx: 120, label: "Vein", wall: 10, lumen: 16, wallFill: "#60a5fa" },
          { cx: 195, label: "Capillary", wall: 3, lumen: 6, wallFill: "#fca5a5" },
        ].map((v) => (
          <g key={v.label}>
            <circle cx={v.cx} cy={55} r={v.wall + v.lumen} fill={v.wallFill} stroke="#1e293b" strokeWidth={1.5} />
            <circle cx={v.cx} cy={55} r={v.lumen} fill="#7f1d1d" opacity={0.55} />
            <text x={v.cx} y={110} textAnchor="middle" fontSize={11} fill={INK} fontWeight={600}>
              {v.label}
            </text>
          </g>
        ))}
      </svg>
    );
  }

  if (view === "blood") {
    return (
      <svg viewBox="0 0 120 160" className={className} width={120} height={160}>
        <path d="M35 15 L85 15 L85 140 A25 25 0 0 1 35 140 Z" fill="#fef9c3" stroke="#334155" strokeWidth={2.5} />
        <path d="M35 128 L85 128 L85 140 A25 25 0 0 1 35 140 Z" fill="#f87171" />
        <path d="M35 118 L85 118 L85 128 L35 128 Z" fill="#e2e8f0" />
        <text x={60} y={78} textAnchor="middle" fontSize={9.5} fill="#713f12" fontWeight={700}>
          Plasma
        </text>
        <text x={60} y={112} textAnchor="middle" fontSize={8} fill="#334155" fontWeight={700}>
          White cells / platelets
        </text>
        <text x={60} y={135} textAnchor="middle" fontSize={9.5} fill="#7f1d1d" fontWeight={700}>
          Red cells
        </text>
        <line x1={30} y1={15} x2={90} y2={15} stroke="#334155" strokeWidth={2.5} strokeLinecap="round" />
      </svg>
    );
  }

  // heart — 4 chambers + major vessel stubs; positions here are the geometric source of truth for any
  // hotspot xPercent/yPercent spots a skill defines over this same 220x220 viewBox.
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className={className} width={w} height={h}>
      <path
        d="M110 205 C60 175 30 140 30 100 C30 65 60 45 88 55 C98 59 106 68 110 78 C114 68 122 59 132 55 C160 45 190 65 190 100 C190 140 160 175 110 205 Z"
        fill="#fecaca"
        stroke="#7f1d1d"
        strokeWidth={3}
      />
      <line x1={110} y1={62} x2={110} y2={198} stroke="#7f1d1d" strokeWidth={2.5} strokeDasharray="4 3" />
      <line x1={45} y1={110} x2={175} y2={110} stroke="#7f1d1d" strokeWidth={2.5} strokeDasharray="4 3" />
      <rect x={52} y={68} width={52} height={40} rx={6} fill="#93c5fd" stroke="#1e3a8a" strokeWidth={2} />
      <rect x={116} y={68} width={52} height={40} rx={6} fill="#fca5a5" stroke="#7f1d1d" strokeWidth={2} />
      <rect x={45} y={112} width={60} height={78} rx={8} fill="#60a5fa" stroke="#1e3a8a" strokeWidth={2} />
      <rect x={115} y={112} width={60} height={78} rx={8} fill="#ef4444" stroke="#7f1d1d" strokeWidth={2} />
      <path d="M110 55 C110 30 95 18 78 18 M110 55 C110 25 130 10 155 15" fill="none" stroke="#ef4444" strokeWidth={7} strokeLinecap="round" />
      <path d="M55 68 C48 50 48 35 55 22" fill="none" stroke="#60a5fa" strokeWidth={7} strokeLinecap="round" />
    </svg>
  );
}

function LightMaterial({ material, className }: Extract<VisualSpec, { type: "light-material" }> & { className?: string }) {
  const w = 240;
  const h = 130;
  const rayY = [30, 55, 80, 105];
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className={className} width={w} height={h}>
      <circle cx={18} cy={65} r={12} fill="#fbbf24" stroke="#b45309" strokeWidth={2} />
      <rect
        x={95}
        y={10}
        width={40}
        height={110}
        fill={material === "transparent" ? "#e0f2fe" : material === "translucent" ? "#bae6fd" : "#1e293b"}
        opacity={material === "transparent" ? 0.45 : material === "translucent" ? 0.85 : 1}
        stroke={INK}
        strokeWidth={2.5}
      />
      {rayY.map((y, i) => {
        if (material === "opaque") {
          return <line key={i} x1={30} y1={y} x2={94} y2={y} stroke="#f59e0b" strokeWidth={2.5} />;
        }
        if (material === "translucent") {
          return (
            <path
              key={i}
              d={`M30 ${y} L94 ${y} M136 ${y} L${170 + (i % 2 === 0 ? 8 : -4)} ${y + (i % 2 === 0 ? 10 : -8)}`}
              stroke="#f59e0b"
              strokeWidth={2}
              fill="none"
              opacity={0.75}
            />
          );
        }
        return <line key={i} x1={30} y1={y} x2={225} y2={y} stroke="#f59e0b" strokeWidth={2.5} />;
      })}
      {material === "opaque" && <rect x={140} y={20} width={70} height={90} fill="#0f172a" opacity={0.18} />}
      <rect x={155} y={30} width={26} height={60} rx={4} fill={material === "opaque" ? "#334155" : "#a3e635"} opacity={0.85} />
      <text x={115} y={128} textAnchor="middle" fontSize={11} fill={INK} fontWeight={600}>
        {material === "transparent" ? "Transparent" : material === "translucent" ? "Translucent" : "Opaque"}
      </text>
    </svg>
  );
}

function PlaneMirror({ objectShape, className }: Extract<VisualSpec, { type: "plane-mirror" }> & { className?: string }) {
  const w = 220;
  const h = 140;
  const shape = (x: number, flip: boolean) => {
    if (objectShape === "arrow") {
      return (
        <g transform={flip ? `translate(${2 * x},0) scale(-1,1)` : undefined}>
          <line x1={x} y1={110} x2={x} y2={30} stroke="#0ea5e9" strokeWidth={4} strokeLinecap="round" />
          <path d={`M${x - 10} 42 L${x} 26 L${x + 10} 42`} fill="none" stroke="#0ea5e9" strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" />
        </g>
      );
    }
    if (objectShape === "triangle") {
      return <polygon points={`${x},30 ${x - 16},110 ${x + 16},110`} fill="#a78bfa" stroke="#5b21b6" strokeWidth={2} transform={flip ? `translate(${2 * x},0) scale(-1,1)` : undefined} />;
    }
    return (
      <g transform={flip ? `translate(${2 * x},0) scale(-1,1)` : undefined} stroke="#16a34a" strokeWidth={6} strokeLinecap="round">
        <line x1={x - 10} y1={30} x2={x - 10} y2={110} />
        <line x1={x - 10} y1={30} x2={x + 12} y2={30} />
        <line x1={x - 10} y1={66} x2={x + 6} y2={66} />
      </g>
    );
  };
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className={className} width={w} height={h}>
      <line x1={110} y1={15} x2={110} y2={125} stroke="#334155" strokeWidth={5} />
      <rect x={106} y={15} width={4} height={110} fill="#bae6fd" opacity={0.6} />
      {shape(60, false)}
      <g opacity={0.55}>{shape(160, true)}</g>
      <line x1={60} y1={95} x2={110} y2={70} stroke="#f59e0b" strokeWidth={1.5} strokeDasharray="3 2" />
      <line x1={110} y1={70} x2={160} y2={95} stroke="#f59e0b" strokeWidth={1.5} strokeDasharray="3 2" />
      <text x={55} y={132} textAnchor="middle" fontSize={10} fill={INK} fontWeight={600}>
        Object
      </text>
      <text x={165} y={132} textAnchor="middle" fontSize={10} fill={INK} fontWeight={600}>
        Image
      </text>
    </svg>
  );
}

function ShadowEclipse({ mode, className }: Extract<VisualSpec, { type: "shadow-eclipse" }> & { className?: string }) {
  const w = 260;
  const h = 140;

  if (mode === "shadow") {
    return (
      <svg viewBox={`0 0 ${w} ${h}`} className={className} width={w} height={h}>
        <circle cx={30} cy={40} r={16} fill="#fbbf24" stroke="#b45309" strokeWidth={2} />
        <rect x={110} y={22} width={16} height={60} fill="#334155" />
        <polygon points="126,26 220,110 126,78" fill="#0f172a" opacity={0.28} />
        <line x1={40} y1={110} x2={230} y2={110} stroke={GRID} strokeWidth={3} />
        <text x={175} y={126} textAnchor="middle" fontSize={10} fill={INK}>
          Shadow
        </text>
      </svg>
    );
  }

  const earthOnLeft = mode === "lunar-eclipse";
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className={className} width={w} height={h}>
      <circle cx={20} cy={70} r={20} fill="#fbbf24" stroke="#b45309" strokeWidth={2} />
      <polygon points={`40,55 260,70 40,85`} fill="#fde68a" opacity={0.3} />
      {earthOnLeft ? (
        <>
          <circle cx={130} cy={70} r={22} fill="#3b82f6" stroke="#1e3a8a" strokeWidth={2} />
          <polygon points="152,58 220,70 152,82" fill="#0f172a" opacity={0.55} />
          <circle cx={225} cy={70} r={12} fill="#cbd5e1" stroke="#64748b" strokeWidth={2} />
          <text x={130} y={110} textAnchor="middle" fontSize={10} fill={INK}>Earth</text>
          <text x={225} y={95} textAnchor="middle" fontSize={10} fill={INK}>Moon (in shadow)</text>
        </>
      ) : (
        <>
          <circle cx={150} cy={70} r={11} fill="#cbd5e1" stroke="#64748b" strokeWidth={2} />
          <polygon points="161,64 220,70 161,76" fill="#0f172a" opacity={0.55} />
          <circle cx={225} cy={70} r={22} fill="#3b82f6" stroke="#1e3a8a" strokeWidth={2} />
          <text x={150} y={95} textAnchor="middle" fontSize={10} fill={INK}>Moon</text>
          <text x={225} y={110} textAnchor="middle" fontSize={10} fill={INK}>Earth (shadow falls here)</text>
        </>
      )}
      <text x={20} y={100} textAnchor="middle" fontSize={10} fill={INK}>Sun</text>
    </svg>
  );
}

function RainbowFormation({ className }: { className?: string }) {
  const w = 220;
  const h = 140;
  const colors = ["#dc2626", "#f97316", "#facc15", "#16a34a", "#0ea5e9", "#4338ca", "#7e22ce"];
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className={className} width={w} height={h}>
      <circle cx={195} cy={25} r={14} fill="#fde047" stroke="#b45309" strokeWidth={2} />
      {colors.map((c, i) => (
        <path
          key={c}
          d={`M 15 130 A ${95 - i * 8} ${95 - i * 8} 0 0 1 205 130`}
          fill="none"
          stroke={c}
          strokeWidth={7}
        />
      ))}
      <path d="M40 95 L55 108 L40 108 Z" fill="#38bdf8" opacity={0.85} />
      <line x1={180} y1={45} x2={48} y2={98} stroke="#fde047" strokeWidth={1.5} strokeDasharray="3 2" opacity={0.8} />
    </svg>
  );
}

function LeverDiagram({ leverClass, className }: Extract<VisualSpec, { type: "lever-diagram" }> & { className?: string }) {
  const w = 220;
  const h = 130;
  const barY = 80;
  // Fulcrum, effort and load x-positions along the bar depend on the class being illustrated.
  const positions =
    leverClass === 1
      ? { fulcrum: 110, effort: 190, load: 30 }
      : leverClass === 2
        ? { fulcrum: 25, load: 110, effort: 195 }
        : { fulcrum: 25, effort: 110, load: 195 };

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className={className} width={w} height={h}>
      <rect x={20} y={barY - 6} width={180} height={12} rx={4} fill="#a16207" stroke="#713f12" strokeWidth={2} />
      <polygon points={`${positions.fulcrum},${barY + 6} ${positions.fulcrum - 14},${barY + 32} ${positions.fulcrum + 14},${barY + 32}`} fill="#64748b" stroke="#1e293b" strokeWidth={2} />
      <text x={positions.fulcrum} y={barY + 46} textAnchor="middle" fontSize={10} fill={INK} fontWeight={700}>F</text>
      <line x1={positions.effort} y1={barY - 6} x2={positions.effort} y2={barY - 34} stroke="#0ea5e9" strokeWidth={3.5} />
      <polygon points={`${positions.effort - 5},${barY - 34} ${positions.effort + 5},${barY - 34} ${positions.effort},${barY - 44}`} fill="#0ea5e9" />
      <text x={positions.effort} y={barY - 50} textAnchor="middle" fontSize={10} fill="#0ea5e9" fontWeight={700}>E</text>
      <line x1={positions.load} y1={barY - 6} x2={positions.load} y2={barY - 34} stroke="#dc2626" strokeWidth={3.5} />
      <polygon points={`${positions.load - 5},${barY - 34} ${positions.load + 5},${barY - 34} ${positions.load},${barY - 24}`} fill="#dc2626" />
      <text x={positions.load} y={barY - 40} textAnchor="middle" fontSize={10} fill="#dc2626" fontWeight={700}>L</text>
      <text x={w / 2} y={h - 6} textAnchor="middle" fontSize={11} fill={INK} fontWeight={600}>
        Class {leverClass} lever
      </text>
    </svg>
  );
}

function InclinedPlane({ kind, className }: Extract<VisualSpec, { type: "inclined-plane" }> & { className?: string }) {
  const w = 220;
  const h = 140;
  let scene: React.ReactNode;

  if (kind === "staircase") {
    const steps = [0, 1, 2, 3, 4];
    scene = (
      <g>
        {steps.map((i) => (
          <rect key={i} x={20 + i * 34} y={120 - i * 20} width={34} height={20} fill="#94a3b8" stroke="#334155" strokeWidth={1.8} />
        ))}
        <rect x={190} y={16} width={16} height={16} rx={3} fill="#f97316" />
      </g>
    );
  } else if (kind === "wedge") {
    scene = (
      <g>
        <polygon points="30,120 190,120 190,60" fill="#94a3b8" stroke="#334155" strokeWidth={2} />
        <polygon points="30,120 190,60 190,120" fill="none" />
        <line x1={70} y1={40} x2={70} y2={86} stroke="#dc2626" strokeWidth={4} />
        <polygon points="63,86 77,86 70,98" fill="#dc2626" />
        <text x={70} y={30} textAnchor="middle" fontSize={10} fill={INK}>force in</text>
      </g>
    );
  } else if (kind === "winding-road") {
    scene = (
      <g>
        <polygon points="20,130 200,130 130,20" fill="#dcfce7" stroke="#16a34a" strokeWidth={2} />
        <path d="M40 125 Q 90 110 70 90 Q 50 72 95 60 Q 130 50 110 30" fill="none" stroke="#78716c" strokeWidth={6} strokeLinecap="round" />
        <path d="M40 125 Q 90 110 70 90 Q 50 72 95 60 Q 130 50 110 30" fill="none" stroke="#facc15" strokeWidth={1.2} strokeDasharray="4 4" />
      </g>
    );
  } else {
    // ramp
    scene = (
      <g>
        <polygon points="20,130 200,130 200,50" fill="#bae6fd" stroke="#0369a1" strokeWidth={2} />
        <rect x={168} y={20} width={22} height={22} rx={3} fill="#f97316" stroke="#9a3412" strokeWidth={1.8} transform="rotate(0 179 31)" />
        <line x1={40} y1={122} x2={158} y2={53} stroke="#dc2626" strokeWidth={3} strokeDasharray="5 4" />
        <polygon points="152,48 168,50 156,62" fill="#dc2626" />
        <line x1={200} y1={130} x2={200} y2={55} stroke="#64748b" strokeWidth={2} strokeDasharray="3 3" />
        <text x={210} y={95} fontSize={9} fill={INK}>lift straight up</text>
      </g>
    );
  }

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className={className} width={w} height={h}>
      {scene}
    </svg>
  );
}

// ---- Grade 6 Agriculture visuals ----

function SoilErosion({ kind, className }: Extract<VisualSpec, { type: "soil-erosion" }> & { className?: string }) {
  const w = 220;
  const h = 140;
  const hillside = "M10 40 L140 15 L210 30 L210 130 L10 130 Z";
  let scene: React.ReactNode;

  if (kind === "sheet") {
    scene = (
      <g>
        <path d={hillside} fill="#a3752f" stroke="#5c3a21" strokeWidth={2} />
        <path d="M10 40 L140 15 L210 30" fill="none" stroke="#7c4a1e" strokeWidth={4} strokeDasharray="2 3" opacity={0.7} />
        {[0, 1, 2, 3, 4].map((i) => (
          <line key={i} x1={30 + i * 38} y1={28 + i * 3} x2={20 + i * 38} y2={55 + i * 5} stroke="#38bdf8" strokeWidth={2} markerEnd="url(#erosionArrow)" />
        ))}
        <text x={110} y={12} textAnchor="middle" fontSize={9} fill={INK} fontWeight={700}>thin layer washed off whole slope</text>
      </g>
    );
  } else if (kind === "rill") {
    scene = (
      <g>
        <path d={hillside} fill="#a3752f" stroke="#5c3a21" strokeWidth={2} />
        {[45, 90, 135, 175].map((x, i) => (
          <path key={i} d={`M${x} 20 Q ${x - 6} 70 ${x - 10} 128`} fill="none" stroke="#5c3a21" strokeWidth={5} strokeLinecap="round" />
        ))}
        <text x={110} y={12} textAnchor="middle" fontSize={9} fill={INK} fontWeight={700}>several small narrow channels</text>
      </g>
    );
  } else if (kind === "gulley") {
    scene = (
      <g>
        <path d={hillside} fill="#a3752f" stroke="#5c3a21" strokeWidth={2} />
        <path d="M95 18 Q 75 70 60 128 L110 128 Q 120 70 125 20 Z" fill="#78350f" stroke="#451a03" strokeWidth={2.5} />
        <text x={110} y={12} textAnchor="middle" fontSize={9} fill={INK} fontWeight={700}>one large deep channel cut into the slope</text>
      </g>
    );
  } else {
    // splash
    scene = (
      <g>
        <rect x={10} y={80} width={200} height={50} fill="#a3752f" stroke="#5c3a21" strokeWidth={2} />
        <circle cx={110} cy={30} r={5} fill="#38bdf8" />
        <line x1={110} y1={36} x2={110} y2={62} stroke="#38bdf8" strokeWidth={2} />
        {[-30, -12, 12, 30].map((dx, i) => (
          <circle key={i} cx={110 + dx} cy={68 - Math.abs(dx) / 3} r={2.5} fill="#78350f" />
        ))}
        <path d="M95 82 Q 110 68 125 82" fill="none" stroke="#5c3a21" strokeWidth={1.5} />
        <text x={110} y={16} textAnchor="middle" fontSize={9} fill={INK} fontWeight={700}>raindrop knocks soil particles loose</text>
      </g>
    );
  }

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className={className} width={w} height={h}>
      <defs>
        <marker id="erosionArrow" markerWidth={6} markerHeight={6} refX={3} refY={3} orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill="#38bdf8" />
        </marker>
      </defs>
      {scene}
    </svg>
  );
}

function GardenBed({ kind, className }: Extract<VisualSpec, { type: "garden-bed" }> & { className?: string }) {
  const w = 220;
  const h = 140;
  const groundY = 70;
  const isSunken = kind === "sunken-seedbed" || kind === "sunken-moist-bed" || kind === "shallow-pit";
  const label =
    kind === "sunken-seedbed"
      ? "sunken seedbed — dug below ground level to trap moisture"
      : kind === "shallow-pit"
        ? "shallow pit — small planting pockets below ground level"
        : kind === "sunken-moist-bed"
          ? "sunken moist bed — dug below ground to hold water near roots"
          : "raised moist bed — built above ground, edged to hold soil";

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className={className} width={w} height={h}>
      <rect x={0} y={0} width={w} height={groundY} fill="#e0f2fe" />
      <rect x={0} y={groundY} width={w} height={h - groundY} fill="#c4956c" />
      <line x1={0} y1={groundY} x2={w} y2={groundY} stroke="#5c3a21" strokeWidth={2} strokeDasharray="6 3" />
      <text x={6} y={groundY - 6} fontSize={8} fill={INK}>ground level</text>

      {isSunken ? (
        kind === "shallow-pit" ? (
          <g>
            {[55, 110, 165].map((x, i) => (
              <g key={i}>
                <path d={`M${x - 18} ${groundY} Q ${x} ${groundY + 26} ${x + 18} ${groundY}`} fill="#78350f" stroke="#451a03" strokeWidth={2} />
                <circle cx={x} cy={groundY + 10} r={4} fill="#16a34a" />
                <line x1={x} y1={groundY + 10} x2={x} y2={groundY - 6} stroke="#16a34a" strokeWidth={2.5} strokeLinecap="round" />
              </g>
            ))}
          </g>
        ) : (
          <g>
            <path d="M30 70 Q 110 118 190 70 L190 70 Q 110 100 30 70 Z" fill="#78350f" stroke="#451a03" strokeWidth={2} />
            {[60, 90, 120, 150].map((x, i) => (
              <line key={i} x1={x} y1={groundY + 15} x2={x} y2={groundY - 4} stroke="#16a34a" strokeWidth={2.5} strokeLinecap="round" />
            ))}
          </g>
        )
      ) : (
        <g>
          <rect x={35} y={groundY - 22} width={150} height={22} rx={3} fill="#a16207" stroke="#713f12" strokeWidth={2.5} />
          <rect x={40} y={groundY - 18} width={140} height={16} fill="#78350f" />
          {[60, 90, 120, 150].map((x, i) => (
            <line key={i} x1={x} y1={groundY - 18} x2={x} y2={groundY - 36} stroke="#16a34a" strokeWidth={2.5} strokeLinecap="round" />
          ))}
        </g>
      )}
      <text x={110} y={h - 6} textAnchor="middle" fontSize={8.5} fill={INK} fontWeight={600}>{label}</text>
    </svg>
  );
}

function CrochetStitch({ kind, className }: Extract<VisualSpec, { type: "crochet-stitch" }> & { className?: string }) {
  const w = 220;
  const h = 110;
  const rows = kind === "single" ? [30, 55, 80] : [30, 65];
  const loopR = kind === "single" ? 8 : 14;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className={className} width={w} height={h}>
      {rows.map((y, ri) => (
        <g key={ri}>
          {[0, 1, 2, 3, 4, 5, 6].map((ci) => {
            const x = 20 + ci * 28;
            return kind === "single" ? (
              <circle key={ci} cx={x} cy={y} r={loopR} fill="none" stroke="#c084fc" strokeWidth={4} />
            ) : (
              <path key={ci} d={`M${x - 10} ${y + 14} Q ${x - 12} ${y - 6} ${x} ${y - 14} Q ${x + 12} ${y - 6} ${x + 10} ${y + 14}`} fill="none" stroke="#c084fc" strokeWidth={4} strokeLinecap="round" />
            );
          })}
        </g>
      ))}
      <text x={w / 2} y={h - 4} textAnchor="middle" fontSize={9} fill={INK} fontWeight={700}>
        {kind === "single" ? "single crochet — short, tight loops" : "double crochet — taller, open loops (fewer rows, same height)"}
      </text>
    </svg>
  );
}

function FabricStain({ stain, treated, className }: Extract<VisualSpec, { type: "fabric-stain" }> & { className?: string }) {
  const w = 180;
  const h = 130;
  const stainColor = stain === "blood" ? "#7f1d1d" : "#3f6212";
  const opacity = treated ? 0.18 : 0.85;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className={className} width={w} height={h}>
      <rect x={10} y={10} width={w - 20} height={h - 40} rx={4} fill="#f8fafc" stroke="#94a3b8" strokeWidth={2} />
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <line key={`v${i}`} x1={10 + i * 28} y1={10} x2={10 + i * 28} y2={h - 30} stroke="#e2e8f0" strokeWidth={1} />
      ))}
      {[0, 1, 2, 3].map((i) => (
        <line key={`h${i}`} x1={10} y1={10 + i * 24} x2={w - 10} y2={10 + i * 24} stroke="#e2e8f0" strokeWidth={1} />
      ))}
      <path
        d={
          stain === "blood"
            ? "M75 40 Q 90 30 105 42 Q 120 50 110 65 Q 118 80 100 82 Q 85 90 75 78 Q 60 75 65 60 Q 58 48 75 40 Z"
            : "M60 35 Q 90 25 115 45 Q 105 55 95 50 Q 100 65 85 70 Q 90 80 75 82 Q 65 70 70 60 Q 55 55 60 35 Z"
        }
        fill={stainColor}
        opacity={opacity}
      />
      {treated && (
        <g>
          <circle cx={w - 28} cy={h - 20} r={12} fill="#16a34a" />
          <path d={`M${w - 34} ${h - 20} L${w - 30} ${h - 15} L${w - 22} ${h - 26}`} fill="none" stroke="#fff" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
        </g>
      )}
      <text x={w / 2} y={h - 6} textAnchor="middle" fontSize={9} fill={INK} fontWeight={600}>
        {stain === "blood" ? "blood stain" : "grass stain"}{treated ? " — after treatment" : " — before treatment"}
      </text>
    </svg>
  );
}

function WildlifeDeterrent({ kind, className }: Extract<VisualSpec, { type: "wildlife-deterrent" }> & { className?: string }) {
  const w = 160;
  const h = 130;
  let scene: React.ReactNode;

  if (kind === "mesh-fence") {
    scene = (
      <g>
        {[20, 70, 120, 140].map((x, i) => (
          <rect key={i} x={x} y={30} width={6} height={80} fill="#78350f" />
        ))}
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <line key={`h${i}`} x1={20} y1={35 + i * 13} x2={140} y2={35 + i * 13} stroke="#64748b" strokeWidth={1.5} />
        ))}
        {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <line key={`v${i}`} x1={20 + i * 15} y1={30} x2={20 + i * 15} y2={110} stroke="#64748b" strokeWidth={1.5} />
        ))}
      </g>
    );
  } else if (kind === "thorny-fence") {
    scene = (
      <g>
        <path d="M15 100 Q 80 85 145 100" fill="none" stroke="#4d7c0f" strokeWidth={6} strokeLinecap="round" />
        {[25, 45, 65, 85, 105, 125].map((x, i) => (
          <g key={i}>
            <line x1={x} y1={98} x2={x - 6} y2={80} stroke="#365314" strokeWidth={2} />
            <line x1={x} y1={98} x2={x + 6} y2={80} stroke="#365314" strokeWidth={2} />
            <line x1={x} y1={98} x2={x} y2={70} stroke="#365314" strokeWidth={2} />
          </g>
        ))}
      </g>
    );
  } else if (kind === "trap") {
    scene = (
      <g>
        <rect x={30} y={40} width={100} height={60} fill="none" stroke="#475569" strokeWidth={3} rx={4} />
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <line key={i} x1={40 + i * 16} y1={40} x2={40 + i * 16} y2={100} stroke="#475569" strokeWidth={2} />
        ))}
        <rect x={30} y={38} width={100} height={6} fill="#334155" />
        <path d="M60 40 L60 20 L100 20 L100 40" fill="none" stroke="#334155" strokeWidth={2} strokeDasharray="4 3" />
      </g>
    );
  } else if (kind === "light") {
    scene = (
      <g>
        <circle cx={80} cy={65} r={18} fill="#fde047" stroke="#b45309" strokeWidth={2} />
        {[0, 45, 90, 135, 180, 225, 270, 315].map((deg, i) => {
          const rad = (deg * Math.PI) / 180;
          const x1 = 80 + 22 * Math.cos(rad);
          const y1 = 65 + 22 * Math.sin(rad);
          const x2 = 80 + 40 * Math.cos(rad);
          const y2 = 65 + 40 * Math.sin(rad);
          return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#facc15" strokeWidth={2.5} strokeLinecap="round" />;
        })}
      </g>
    );
  } else if (kind === "sound") {
    scene = (
      <g>
        <rect x={60} y={45} width={20} height={40} rx={4} fill="#334155" />
        <circle cx={70} cy={65} r={7} fill="#94a3b8" />
        <path d="M90 40 Q 105 65 90 90" fill="none" stroke="#38bdf8" strokeWidth={3} strokeLinecap="round" />
        <path d="M100 30 Q 122 65 100 100" fill="none" stroke="#38bdf8" strokeWidth={3} strokeLinecap="round" opacity={0.6} />
      </g>
    );
  } else {
    // deflector
    scene = (
      <g>
        <line x1={80} y1={20} x2={80} y2={110} stroke="#78350f" strokeWidth={4} />
        {[35, 55, 75, 95].map((y, i) => (
          <polygon key={i} points={`60,${y} 100,${y} 90,${y + 12} 70,${y + 12}`} fill={i % 2 === 0 ? "#e2e8f0" : "#94a3b8"} stroke="#475569" strokeWidth={1} />
        ))}
      </g>
    );
  }

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className={className} width={w} height={h}>
      {scene}
    </svg>
  );
}

// ---- Grade 6 Creative Arts visuals ----

const WHEEL_SEGMENTS: { color: string; name: string; kind: "primary" | "secondary" | "tertiary" }[] = [
  { color: "#dc2626", name: "red", kind: "primary" },
  { color: "#f97316", name: "orange", kind: "secondary" },
  { color: "#eab308", name: "yellow", kind: "primary" },
  { color: "#65a30d", name: "yellow-green", kind: "tertiary" },
  { color: "#16a34a", name: "green", kind: "secondary" },
  { color: "#0d9488", name: "blue-green", kind: "tertiary" },
  { color: "#2563eb", name: "blue", kind: "primary" },
  { color: "#7c3aed", name: "violet", kind: "secondary" },
  { color: "#c026d3", name: "red-violet", kind: "tertiary" },
  { color: "#e11d48", name: "red-orange", kind: "tertiary" },
  { color: "#facc15", name: "yellow-orange", kind: "tertiary" },
  { color: "#15803d", name: "blue-violet", kind: "tertiary" },
];

function ColorWheel({ highlight, className }: Extract<VisualSpec, { type: "color-wheel" }> & { className?: string }) {
  const w = 180;
  const h = 180;
  const cx = 90;
  const cy = 90;
  const r = 78;
  const n = WHEEL_SEGMENTS.length;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className={className} width={w} height={h}>
      {WHEEL_SEGMENTS.map((seg, i) => {
        const a0 = (i / n) * 2 * Math.PI - Math.PI / 2;
        const a1 = ((i + 1) / n) * 2 * Math.PI - Math.PI / 2;
        const x0 = cx + r * Math.cos(a0);
        const y0 = cy + r * Math.sin(a0);
        const x1 = cx + r * Math.cos(a1);
        const y1 = cy + r * Math.sin(a1);
        const dimmed = highlight ? seg.kind !== highlight : false;
        return (
          <path
            key={seg.name}
            d={`M${cx} ${cy} L${x0} ${y0} A${r} ${r} 0 0 1 ${x1} ${y1} Z`}
            fill={seg.color}
            opacity={dimmed ? 0.25 : 1}
            stroke="#1f2937"
            strokeWidth={1}
          />
        );
      })}
      <circle cx={cx} cy={cy} r={8} fill="#f8fafc" stroke="#1f2937" strokeWidth={1.5} />
      {highlight && (
        <text x={cx} y={h - 4} textAnchor="middle" fontSize={9} fill={INK} fontWeight={700}>
          {highlight} colours highlighted
        </text>
      )}
    </svg>
  );
}

function MusicNote({ note, className }: Extract<VisualSpec, { type: "music-note" }> & { className?: string }) {
  const w = 140;
  const h = 90;
  const staffYs = [20, 32, 44, 56, 68];

  const noteHead = (x: number, y: number, filled: boolean) => (
    <ellipse cx={x} cy={y} rx={6} ry={4.5} fill={filled ? "#1f2937" : "none"} stroke="#1f2937" strokeWidth={2} transform={`rotate(-18 ${x} ${y})`} />
  );
  const stem = (x: number, y: number) => <line x1={x + 5.5} y1={y} x2={x + 5.5} y2={y - 32} stroke="#1f2937" strokeWidth={2} />;

  let content: React.ReactNode;
  let label: string;
  const midY = 44;

  switch (note) {
    case "crotchet":
      content = (<g>{noteHead(70, midY, true)}{stem(70, midY)}</g>);
      label = "crotchet — 1 beat";
      break;
    case "quaver-pair":
      content = (
        <g>
          {noteHead(52, midY, true)}{stem(52, midY)}
          {noteHead(88, midY, true)}{stem(88, midY)}
          <line x1={57.5} y1={midY - 32} x2={93.5} y2={midY - 32} stroke="#1f2937" strokeWidth={3} />
        </g>
      );
      label = "pair of quavers — 1 beat total (½ beat each)";
      break;
    case "minim":
      content = (<g>{noteHead(70, midY, false)}{stem(70, midY)}</g>);
      label = "minim — 2 beats";
      break;
    case "dotted-minim":
      content = (<g>{noteHead(66, midY, false)}{stem(66, midY)}<circle cx={80} cy={midY} r={2} fill="#1f2937" /></g>);
      label = "dotted minim — 3 beats";
      break;
    case "semibreve":
      content = <ellipse cx={70} cy={midY} rx={7} ry={5} fill="none" stroke="#1f2937" strokeWidth={2} />;
      label = "semibreve — 4 beats";
      break;
    case "crotchet-rest":
      content = <path d="M68 28 Q 76 36 68 44 Q 76 48 68 60" fill="none" stroke="#1f2937" strokeWidth={2.5} strokeLinecap="round" />;
      label = "crotchet rest — 1 beat of silence";
      break;
    case "minim-rest":
      content = <rect x={64} y={midY - 4} width={12} height={5} fill="#1f2937" />;
      label = "minim rest — 2 beats of silence";
      break;
    default:
      content = <rect x={64} y={midY} width={12} height={5} fill="#1f2937" />;
      label = "semibreve rest — 4 beats of silence";
  }

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className={className} width={w} height={h}>
      {staffYs.map((y, i) => (
        <line key={i} x1={10} y1={y} x2={w - 10} y2={y} stroke="#94a3b8" strokeWidth={1} />
      ))}
      {content}
      <text x={w / 2} y={h - 4} textAnchor="middle" fontSize={8.5} fill={INK} fontWeight={700}>{label}</text>
    </svg>
  );
}

const SOL_FA_STEPS = ["doh", "re", "me", "fah", "soh", "lah", "te", "doh1"] as const;

function SolFaLadder({ highlight, className }: Extract<VisualSpec, { type: "sol-fa-ladder" }> & { className?: string }) {
  const w = 110;
  const h = 200;
  const stepH = (h - 20) / SOL_FA_STEPS.length;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className={className} width={w} height={h}>
      {SOL_FA_STEPS.map((s, i) => {
        const y = h - 12 - i * stepH;
        const active = highlight === s;
        return (
          <g key={s}>
            <rect x={20} y={y - stepH + 4} width={12 + i * 7} height={stepH - 6} rx={3} fill={active ? "#2563eb" : "#93c5fd"} stroke="#1e3a8a" strokeWidth={1} />
            <text x={40 + i * 7} y={y - stepH / 2 + 3} fontSize={8.5} fill="#1e3a8a" fontWeight={700}>
              {s === "doh1" ? "doh¹" : s}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function WeavePattern({ kind, className }: Extract<VisualSpec, { type: "weave-pattern" }> & { className?: string }) {
  const w = 160;
  const h = 160;
  const cells = 8;
  const cellSize = (w - 20) / cells;
  const period = kind === "1/1" ? 1 : 2;
  const squares: React.ReactNode[] = [];

  for (let row = 0; row < cells; row++) {
    for (let col = 0; col < cells; col++) {
      const over = Math.floor(col / period) % 2 === Math.floor(row / period) % 2;
      squares.push(
        <rect
          key={`${row}-${col}`}
          x={10 + col * cellSize}
          y={10 + row * cellSize}
          width={cellSize}
          height={cellSize}
          fill={over ? "#b45309" : "#fde68a"}
          stroke="#78350f"
          strokeWidth={0.75}
        />,
      );
    }
  }

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className={className} width={w} height={h}>
      {squares}
      <text x={w / 2} y={h - 2} textAnchor="middle" fontSize={9} fill={INK} fontWeight={700}>
        {kind} plain weave
      </text>
    </svg>
  );
}

function PotteryStage({ stage, className }: Extract<VisualSpec, { type: "pottery-stage" }> & { className?: string }) {
  const w = 150;
  const h = 140;
  let scene: React.ReactNode;

  if (stage === "clay-ball") {
    scene = <circle cx={75} cy={80} r={38} fill="#c2703d" stroke="#7c3a0e" strokeWidth={2.5} />;
  } else if (stage === "slab") {
    scene = <rect x={25} y={55} width={100} height={40} rx={4} fill="#c2703d" stroke="#7c3a0e" strokeWidth={2.5} />;
  } else if (stage === "joined-vase") {
    scene = (
      <path
        d="M55 30 L95 30 L100 45 L108 90 Q 108 120 75 125 Q 42 120 42 90 L50 45 Z"
        fill="#c2703d"
        stroke="#7c3a0e"
        strokeWidth={2.5}
      />
    );
  } else {
    scene = (
      <g>
        <path
          d="M55 30 L95 30 L100 45 L108 90 Q 108 120 75 125 Q 42 120 42 90 L50 45 Z"
          fill="#9a4a1f"
          stroke="#5c2c0e"
          strokeWidth={2.5}
        />
        <path d="M50 60 Q 75 68 100 60" fill="none" stroke="#fde68a" strokeWidth={2} strokeDasharray="3 3" opacity={0.8} />
        <path d="M46 85 Q 75 95 104 85" fill="none" stroke="#fde68a" strokeWidth={2} strokeDasharray="3 3" opacity={0.8} />
      </g>
    );
  }

  const label =
    stage === "clay-ball"
      ? "kneaded clay ball"
      : stage === "slab"
        ? "rolled slab — even thickness"
        : stage === "joined-vase"
          ? "slabs cut and joined into a vase"
          : "vase finished by burnishing and stamping";

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className={className} width={w} height={h}>
      {scene}
      <text x={w / 2} y={h - 4} textAnchor="middle" fontSize={8.5} fill={INK} fontWeight={700}>{label}</text>
    </svg>
  );
}

function GymnasticsPose({ pose, className }: Extract<VisualSpec, { type: "gymnastics-pose" }> & { className?: string }) {
  const w = 160;
  const h = 140;
  let scene: React.ReactNode;

  if (pose === "cartwheel") {
    scene = (
      <g stroke="#1f2937" strokeWidth={4} strokeLinecap="round" fill="none">
        <circle cx={80} cy={30} r={10} fill="#1f2937" />
        <line x1={80} y1={40} x2={55} y2={75} />
        <line x1={80} y1={40} x2={105} y2={75} />
        <line x1={55} y1={75} x2={30} y2={110} />
        <line x1={105} y1={75} x2={130} y2={110} />
        <line x1={55} y1={75} x2={40} y2={35} />
        <line x1={105} y1={75} x2={120} y2={35} />
      </g>
    );
  } else if (pose === "forward-roll") {
    scene = (
      <g stroke="#1f2937" strokeWidth={4} strokeLinecap="round" fill="none">
        <circle cx={50} cy={95} r={10} fill="#1f2937" />
        <path d="M50 105 Q 80 120 110 95" />
        <path d="M50 105 Q 60 70 100 60" />
        <line x1={100} y1={60} x2={125} y2={40} />
        <line x1={100} y1={60} x2={120} y2={75} />
      </g>
    );
  } else {
    scene = (
      <g stroke="#1f2937" strokeWidth={4} strokeLinecap="round" fill="none">
        <circle cx={80} cy={35} r={10} fill="#1f2937" />
        <line x1={80} y1={45} x2={80} y2={85} />
        <line x1={80} y1={85} x2={65} y2={120} />
        <line x1={80} y1={85} x2={130} y2={95} />
        <line x1={80} y1={55} x2={40} y2={45} />
        <line x1={80} y1={55} x2={110} y2={30} />
      </g>
    );
  }

  const label = pose === "cartwheel" ? "cartwheel — sideways rotation, hands and feet in a line" : pose === "forward-roll" ? "forward roll — tucked, rolling forward" : "swan balance — one leg raised, arms extended";

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className={className} width={w} height={h}>
      {scene}
      <text x={w / 2} y={h - 4} textAnchor="middle" fontSize={8.5} fill={INK} fontWeight={700}>{label}</text>
    </svg>
  );
}

function JumpTechnique({ kind, className }: Extract<VisualSpec, { type: "jump-technique" }> & { className?: string }) {
  const w = 180;
  const h = 120;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className={className} width={w} height={h}>
      <line x1={5} y1={100} x2={175} y2={100} stroke="#78350f" strokeWidth={3} />
      {kind === "long-jump-sail" ? (
        <g stroke="#1f2937" strokeWidth={3.5} strokeLinecap="round" fill="none">
          <path d="M20 95 Q 70 20 150 90" strokeDasharray="4 4" opacity={0.5} />
          <circle cx={90} cy={45} r={9} fill="#1f2937" />
          <line x1={90} y1={54} x2={70} y2={70} />
          <line x1={90} y1={54} x2={112} y2={62} />
          <line x1={90} y1={54} x2={75} y2={40} />
          <line x1={90} y1={54} x2={108} y2={38} />
        </g>
      ) : (
        <g stroke="#1f2937" strokeWidth={3.5} strokeLinecap="round" fill="none">
          <line x1={30} y1={70} x2={150} y2={70} stroke="#dc2626" strokeWidth={2} strokeDasharray="2 3" />
          <circle cx={90} cy={35} r={9} fill="#1f2937" />
          <line x1={90} y1={44} x2={75} y2={60} />
          <line x1={90} y1={44} x2={115} y2={75} />
          <line x1={90} y1={44} x2={70} y2={35} />
          <line x1={90} y1={44} x2={108} y2={30} />
        </g>
      )}
      <text x={w / 2} y={h - 4} textAnchor="middle" fontSize={8.5} fill={INK} fontWeight={700}>
        {kind === "long-jump-sail" ? "long jump — sail technique" : "high jump — scissors technique (bar shown dashed)"}
      </text>
    </svg>
  );
}

function StringInstrumentDiagram({ highlight, className }: Extract<VisualSpec, { type: "string-instrument-diagram" }> & { className?: string }) {
  const w = 120;
  const h = 200;
  const dim = (part: string) => (highlight && highlight !== part ? 0.3 : 1);

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className={className} width={w} height={h}>
      <g opacity={dim("tuning-pegs")}>
        <rect x={50} y={8} width={20} height={14} rx={2} fill="#78350f" stroke="#451a03" strokeWidth={1.5} />
        <circle cx={46} cy={11} r={3} fill="#a16207" />
        <circle cx={74} cy={11} r={3} fill="#a16207" />
      </g>
      <g opacity={dim("neck")}>
        <rect x={55} y={22} width={10} height={70} fill="#a16207" stroke="#78350f" strokeWidth={1.5} />
      </g>
      <g opacity={dim("strings")}>
        <line x1={58} y1={12} x2={58} y2={150} stroke="#e2e8f0" strokeWidth={1.2} />
        <line x1={62} y1={12} x2={62} y2={150} stroke="#e2e8f0" strokeWidth={1.2} />
      </g>
      <g opacity={dim("body")}>
        <path d="M40 92 Q 20 110 30 140 Q 35 175 60 178 Q 85 175 90 140 Q 100 110 80 92 Z" fill="#c2703d" stroke="#7c3a0e" strokeWidth={2.5} />
      </g>
      <g opacity={dim("bridge")}>
        <rect x={53} y={148} width={14} height={10} fill="#451a03" />
      </g>
      <g opacity={dim("bow")}>
        <line x1={95} y1={40} x2={20} y2={165} stroke="#78350f" strokeWidth={2.5} strokeLinecap="round" />
        <line x1={95} y1={40} x2={20} y2={165} stroke="#f8fafc" strokeWidth={0.75} strokeDasharray="1 2" />
      </g>
      {highlight && (
        <text x={w / 2} y={h - 2} textAnchor="middle" fontSize={8} fill={INK} fontWeight={700}>{highlight.replace("-", " ")}</text>
      )}
    </svg>
  );
}

// Simplified Baroque-style fingering: hole covered = true. Roughly descending open-hole count as pitch rises,
// with the octave-vent thumb hole (index -1) pinched (half-covered, shown hatched) for C1/D1.
const RECORDER_FINGERING: Record<Extract<VisualSpec, { type: "recorder-fingering" }>["note"], boolean[]> = {
  C: [true, true, true, true, true, true, true],
  D: [true, true, true, true, true, true, false],
  E: [true, true, true, true, true, false, false],
  F: [true, true, true, true, false, true, false],
  G: [true, true, true, false, false, false, false],
  A: [true, true, false, false, false, false, false],
  B: [true, false, false, false, false, false, false],
  C1: [false, false, false, false, false, false, false],
  D1: [true, false, false, false, false, false, false],
};

function RecorderFingering({ note, className }: Extract<VisualSpec, { type: "recorder-fingering" }> & { className?: string }) {
  const w = 60;
  const h = 200;
  const holes = RECORDER_FINGERING[note];
  const isOctave = note === "C1" || note === "D1";

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className={className} width={w} height={h}>
      <rect x={20} y={10} width={20} height={175} rx={8} fill="#e2d4b8" stroke="#78350f" strokeWidth={2} />
      <circle cx={30} cy={25} r={4} fill={isOctave ? "url(#recPinch)" : "#78350f"} stroke="#451a03" strokeWidth={1} />
      <defs>
        <pattern id="recPinch" width={4} height={4} patternUnits="userSpaceOnUse">
          <rect width={4} height={4} fill="#f8fafc" />
          <line x1={0} y1={0} x2={4} y2={4} stroke="#78350f" strokeWidth={1} />
        </pattern>
      </defs>
      {holes.map((covered, i) => (
        <circle key={i} cx={30} cy={45 + i * 20} r={5} fill={covered ? "#451a03" : "#f8fafc"} stroke="#78350f" strokeWidth={1.5} />
      ))}
      <text x={w / 2} y={h - 4} textAnchor="middle" fontSize={11} fill={INK} fontWeight={700}>
        {note === "C1" ? "C¹" : note === "D1" ? "D¹" : note}
      </text>
    </svg>
  );
}

function StippleTexture({ density, className }: Extract<VisualSpec, { type: "stipple-texture" }> & { className?: string }) {
  const w = 140;
  const h = 100;
  const count = density === "light" ? 60 : density === "medium" ? 160 : 320;
  const dots: React.ReactNode[] = [];
  // Deterministic pseudo-random placement so the same density always renders the same dot field.
  let seed = density === "light" ? 11 : density === "medium" ? 23 : 41;
  const next = () => {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    return (seed % 1000) / 1000;
  };
  for (let i = 0; i < count; i++) {
    dots.push(<circle key={i} cx={10 + next() * (w - 20)} cy={10 + next() * (h - 20)} r={1.1} fill="#1f2937" />);
  }

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className={className} width={w} height={h}>
      <rect x={0} y={0} width={w} height={h} fill="#f8fafc" stroke="#cbd5e1" strokeWidth={1.5} />
      {dots}
      <text x={w / 2} y={h - 3} textAnchor="middle" fontSize={8} fill={INK} fontWeight={700}>{density} stippling — {density === "light" ? "sparse dots, lighter tone" : density === "medium" ? "moderate dot density" : "dense dots, darker tone"}</text>
    </svg>
  );
}

function BlockPrintPattern({ motif, className }: Extract<VisualSpec, { type: "block-print-pattern" }> & { className?: string }) {
  const w = 160;
  const h = 100;
  const cellSize = 26;
  const cols = Math.floor((w - 10) / cellSize);
  const rows = Math.floor((h - 24) / cellSize);
  const shapes: React.ReactNode[] = [];

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const cx = 15 + c * cellSize + cellSize / 2;
      const cy = 12 + r * cellSize + cellSize / 2;
      const color = (r + c) % 2 === 0 ? "#be123c" : "#0f766e";
      if (motif === "triangle") shapes.push(<polygon key={`${r}-${c}`} points={`${cx},${cy - 8} ${cx + 8},${cy + 6} ${cx - 8},${cy + 6}`} fill={color} />);
      else if (motif === "circle") shapes.push(<circle key={`${r}-${c}`} cx={cx} cy={cy} r={7} fill={color} />);
      else if (motif === "diamond") shapes.push(<polygon key={`${r}-${c}`} points={`${cx},${cy - 9} ${cx + 9},${cy} ${cx},${cy + 9} ${cx - 9},${cy}`} fill={color} />);
      else shapes.push(<rect key={`${r}-${c}`} x={cx - 7} y={cy - 7} width={14} height={14} fill={color} />);
    }
  }

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className={className} width={w} height={h}>
      <rect x={0} y={0} width={w} height={h} fill="#fefce8" />
      {shapes}
      <text x={w / 2} y={h - 3} textAnchor="middle" fontSize={8} fill={INK} fontWeight={700}>{motif} motif — full repeat pattern</text>
    </svg>
  );
}

function VolleyballSkill({ skill, className }: Extract<VisualSpec, { type: "volleyball-skill" }> & { className?: string }) {
  const w = 160;
  const h = 130;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className={className} width={w} height={h}>
      <line x1={5} y1={110} x2={155} y2={110} stroke="#78350f" strokeWidth={3} />
      {skill === "underarm-serve" ? (
        <g stroke="#1f2937" strokeWidth={3.5} strokeLinecap="round" fill="none">
          <circle cx={40} cy={40} r={9} fill="#1f2937" />
          <line x1={40} y1={49} x2={40} y2={85} />
          <line x1={40} y1={85} x2={25} y2={108} />
          <line x1={40} y1={85} x2={55} y2={108} />
          <line x1={40} y1={60} x2={60} y2={80} />
          <line x1={40} y1={60} x2={25} y2={50} />
          <circle cx={65} cy={85} r={7} fill="#f97316" stroke="#c2410c" strokeWidth={1.5} />
          <path d="M65 78 Q 90 55 115 40" strokeDasharray="3 3" opacity={0.6} />
        </g>
      ) : (
        <g stroke="#1f2937" strokeWidth={3.5} strokeLinecap="round" fill="none">
          <circle cx={70} cy={55} r={9} fill="#1f2937" />
          <line x1={70} y1={64} x2={70} y2={90} />
          <line x1={70} y1={90} x2={55} y2={110} />
          <line x1={70} y1={90} x2={85} y2={110} />
          <line x1={70} y1={72} x2={50} y2={100} />
          <line x1={70} y1={72} x2={90} y2={100} />
          <circle cx={50} cy={102} r={7} fill="#f97316" stroke="#c2410c" strokeWidth={1.5} />
          <path d="M50 95 Q 30 60 15 30" strokeDasharray="3 3" opacity={0.6} />
        </g>
      )}
      <text x={w / 2} y={h - 4} textAnchor="middle" fontSize={8.5} fill={INK} fontWeight={700}>
        {skill === "underarm-serve" ? "under-arm service" : "single-hand dig pass"}
      </text>
    </svg>
  );
}

function AtomStructureDiagram({ shells, className }: Extract<VisualSpec, { type: "atom-structure" }> & { className?: string }) {
  const w = 220;
  const h = 220;
  const cx = w / 2;
  const cy = 100;
  const shellGap = 24;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className={className} width={w} height={h}>
      {shells.map((count, i) => {
        const r = 26 + i * shellGap;
        return (
          <g key={i}>
            <circle cx={cx} cy={cy} r={r} fill="none" stroke={GRID} strokeWidth={1.5} strokeDasharray="3 3" />
            {Array.from({ length: count }).map((_, j) => {
              const angle = (2 * Math.PI * j) / count - Math.PI / 2;
              const ex = cx + r * Math.cos(angle);
              const ey = cy + r * Math.sin(angle);
              return <circle key={j} cx={ex} cy={ey} r={4} fill={ACCENT} stroke="#0369a1" strokeWidth={1} />;
            })}
          </g>
        );
      })}
      <circle cx={cx} cy={cy} r={14} fill="#f97316" stroke="#9a3412" strokeWidth={2} />
      <text x={cx} y={cy + 4} textAnchor="middle" fontSize={9} fill="#fff" fontWeight={700}>
        N
      </text>
      <text x={cx} y={h - 8} textAnchor="middle" fontSize={10} fill={INK} fontWeight={600}>
        Electron shells: {shells.join(", ")}
      </text>
    </svg>
  );
}

function WaveDiagram({ highlight = "none", className }: Extract<VisualSpec, { type: "wave-diagram" }> & { className?: string }) {
  const w = 240;
  const h = 130;
  const midY = 65;
  const amp = 35;
  const wavelengthPx = 80;
  const points: string[] = [];
  for (let x = 0; x <= w; x += 4) {
    const y = midY - amp * Math.sin((2 * Math.PI * x) / wavelengthPx);
    points.push(`${x === 0 ? "M" : "L"}${x} ${y.toFixed(1)}`);
  }

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className={className} width={w} height={h}>
      <line x1={0} y1={midY} x2={w} y2={midY} stroke={GRID} strokeWidth={1.5} strokeDasharray="3 3" />
      <path d={points.join(" ")} fill="none" stroke={ACCENT} strokeWidth={3} />
      {highlight === "amplitude" && (
        <>
          <line x1={20} y1={midY} x2={20} y2={midY - amp} stroke="#dc2626" strokeWidth={2} />
          <text x={28} y={midY - amp / 2} fontSize={10} fill="#dc2626" fontWeight={700}>
            Amplitude
          </text>
        </>
      )}
      {highlight === "wavelength" && (
        <>
          <line x1={20} y1={20} x2={20 + wavelengthPx} y2={20} stroke="#16a34a" strokeWidth={2} />
          <line x1={20} y1={16} x2={20} y2={24} stroke="#16a34a" strokeWidth={2} />
          <line x1={20 + wavelengthPx} y1={16} x2={20 + wavelengthPx} y2={24} stroke="#16a34a" strokeWidth={2} />
          <text x={20 + wavelengthPx / 2} y={14} textAnchor="middle" fontSize={10} fill="#16a34a" fontWeight={700}>
            Wavelength
          </text>
        </>
      )}
      {highlight === "crest" && (
        <>
          <circle cx={20} cy={midY - amp} r={4} fill="#dc2626" />
          <text x={20} y={midY - amp - 8} textAnchor="middle" fontSize={10} fill="#dc2626" fontWeight={700}>
            Crest
          </text>
        </>
      )}
      {highlight === "trough" && (
        <>
          <circle cx={60} cy={midY + amp} r={4} fill="#7c3aed" />
          <text x={60} y={midY + amp + 16} textAnchor="middle" fontSize={10} fill="#7c3aed" fontWeight={700}>
            Trough
          </text>
        </>
      )}
    </svg>
  );
}

function CurvedMirrorDiagram({ mirrorType, className }: Extract<VisualSpec, { type: "curved-mirror-diagram" }> & { className?: string }) {
  const w = 240;
  const h = 140;
  const axisY = 70;
  const poleX = 170;
  const cX = 60;
  const fX = 115;
  const concave = mirrorType === "concave";
  const arcPath = concave ? `M ${poleX} 20 Q ${poleX - 30} ${axisY} ${poleX} 120` : `M ${poleX} 20 Q ${poleX + 30} ${axisY} ${poleX} 120`;
  const hatchSide = concave ? 1 : -1;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className={className} width={w} height={h}>
      <line x1={10} y1={axisY} x2={w - 10} y2={axisY} stroke={GRID} strokeWidth={1.5} strokeDasharray="3 3" />
      {[30, 50, 70, 90, 110].map((y) => (
        <line key={y} x1={poleX + hatchSide * 6} y1={y} x2={poleX + hatchSide * 14} y2={y + 6} stroke="#94a3b8" strokeWidth={1.5} />
      ))}
      <path d={arcPath} fill="none" stroke="#334155" strokeWidth={4} />
      <circle cx={cX} cy={axisY} r={3} fill="#dc2626" />
      <text x={cX} y={axisY - 10} textAnchor="middle" fontSize={10} fill="#dc2626" fontWeight={700}>
        C
      </text>
      <circle cx={fX} cy={axisY} r={3} fill="#16a34a" />
      <text x={fX} y={axisY - 10} textAnchor="middle" fontSize={10} fill="#16a34a" fontWeight={700}>
        F
      </text>
      <circle cx={poleX} cy={axisY} r={3} fill={INK} />
      <text x={poleX} y={axisY + 20} textAnchor="middle" fontSize={10} fill={INK} fontWeight={700}>
        P
      </text>
      <text x={w / 2} y={h - 6} textAnchor="middle" fontSize={11} fill={INK} fontWeight={600}>
        {concave ? "Concave mirror" : "Convex mirror"}
      </text>
    </svg>
  );
}

function WeatherInstrument({ instrument, className }: Extract<VisualSpec, { type: "weather-instrument" }> & { className?: string }) {
  const w = 130;
  const h = 150;
  let body: React.ReactNode;

  if (instrument === "thermometer") {
    body = (
      <g>
        <rect x={58} y={20} width={14} height={90} rx={7} fill="#f1f5f9" stroke="#334155" strokeWidth={2.5} />
        <rect x={61} y={50} width={8} height={60} fill="#dc2626" />
        <circle cx={65} cy={115} r={16} fill="#dc2626" stroke="#334155" strokeWidth={2.5} />
        {[30, 45, 60, 75, 90].map((y) => (
          <line key={y} x1={72} y1={y} x2={80} y2={y} stroke="#334155" strokeWidth={1.5} />
        ))}
      </g>
    );
  } else if (instrument === "rain-gauge") {
    body = (
      <g>
        <rect x={45} y={50} width={40} height={70} fill="#e0f2fe" stroke="#334155" strokeWidth={2.5} />
        <path d="M35 30 L95 30 L80 50 L50 50 Z" fill="#94a3b8" stroke="#334155" strokeWidth={2.2} />
        <rect x={45} y={90} width={40} height={30} fill="#38bdf8" opacity={0.6} />
        {[60, 75, 90, 105].map((y) => (
          <line key={y} x1={85} y1={y} x2={92} y2={y} stroke="#334155" strokeWidth={1.5} />
        ))}
      </g>
    );
  } else if (instrument === "barometer") {
    body = (
      <g>
        <circle cx={65} cy={70} r={45} fill="#f1f5f9" stroke="#334155" strokeWidth={3} />
        <line x1={65} y1={70} x2={90} y2={50} stroke="#dc2626" strokeWidth={3} strokeLinecap="round" />
        <circle cx={65} cy={70} r={4} fill="#334155" />
        {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => {
          const rad = (deg * Math.PI) / 180;
          const x1 = 65 + 38 * Math.cos(rad);
          const y1 = 70 + 38 * Math.sin(rad);
          const x2 = 65 + 44 * Math.cos(rad);
          const y2 = 70 + 44 * Math.sin(rad);
          return <line key={deg} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#334155" strokeWidth={1.5} />;
        })}
      </g>
    );
  } else if (instrument === "anemometer") {
    body = (
      <g>
        <line x1={65} y1={40} x2={65} y2={130} stroke="#475569" strokeWidth={4} />
        {[0, 120, 240].map((deg) => {
          const rad = (deg * Math.PI) / 180;
          const x = 65 + 35 * Math.cos(rad);
          const y = 40 + 35 * Math.sin(rad);
          return (
            <g key={deg}>
              <line x1={65} y1={40} x2={x} y2={y} stroke="#475569" strokeWidth={2.5} />
              <circle cx={x} cy={y} r={10} fill="#0ea5e9" stroke="#334155" strokeWidth={2} />
            </g>
          );
        })}
      </g>
    );
  } else if (instrument === "wind-vane") {
    body = (
      <g>
        <line x1={65} y1={30} x2={65} y2={130} stroke="#475569" strokeWidth={4} />
        <path d="M30 65 L90 65 L75 50 M90 65 L75 80" fill="none" stroke="#f59e0b" strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" />
        <text x={65} y={20} textAnchor="middle" fontSize={10} fontWeight={700} fill={INK}>
          N
        </text>
      </g>
    );
  } else if (instrument === "hygrometer") {
    body = (
      <g>
        <circle cx={65} cy={70} r={40} fill="#f1f5f9" stroke="#334155" strokeWidth={3} />
        <path d="M65 45 C 50 70, 50 85, 65 95 C 80 85, 80 70, 65 45 Z" fill="#38bdf8" stroke="#0369a1" strokeWidth={2} />
        <line x1={65} y1={70} x2={90} y2={80} stroke="#dc2626" strokeWidth={3} strokeLinecap="round" />
      </g>
    );
  } else {
    // sunshine-recorder
    body = (
      <g>
        <circle cx={65} cy={55} r={26} fill="#bae6fd" stroke="#0369a1" strokeWidth={2.5} opacity={0.85} />
        <path d="M35 95 Q 65 70 95 95" fill="none" stroke="#a16207" strokeWidth={4} />
        <path d="M40 95 L90 95" stroke="#713f12" strokeWidth={5} />
        {[-40, -20, 0, 20, 40].map((dx) => (
          <line key={dx} x1={65} y1={20} x2={65 + dx * 0.3} y2={10} stroke="#facc15" strokeWidth={2.5} />
        ))}
      </g>
    );
  }

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className={className} width={w} height={h}>
      {body}
      <text x={w / 2} y={h - 4} textAnchor="middle" fontSize={9.5} fill={INK} fontWeight={600}>
        {instrument.replace("-", " ")}
      </text>
    </svg>
  );
}

function Hierarchy({ levels, className }: Extract<VisualSpec, { type: "hierarchy" }> & { className?: string }) {
  const w = 260;
  const levelH = 56;
  const h = levels.length * levelH + 20;
  const boxH = 34;
  const boxW = Math.min(90, 240 / Math.max(...levels.map((l) => l.length)));

  const positions: { x: number; y: number; label: string }[][] = levels.map((level, li) => {
    const y = 16 + li * levelH;
    const step = w / (level.length + 1);
    return level.map((label, i) => ({ x: step * (i + 1), y, label }));
  });

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className={className} width={w} height={h}>
      {positions.slice(0, -1).map((level, li) =>
        level.flatMap((parent, pi) =>
          positions[li + 1].map((child, ci) => (
            <line key={`${pi}-${ci}`} x1={parent.x} y1={parent.y + boxH / 2} x2={child.x} y2={child.y - boxH / 2} stroke={GRID} strokeWidth={1.5} />
          )),
        ),
      )}
      {positions.flat().map((node, i) => (
        <g key={i}>
          <rect x={node.x - boxW / 2} y={node.y - boxH / 2} width={boxW} height={boxH} rx={6} fill={ACCENT_LIGHT} stroke={ACCENT} strokeWidth={1.8} />
          <text x={node.x} y={node.y + 4} textAnchor="middle" fontSize={8.5} fill={INK} fontWeight={600}>
            {node.label.length > 16 ? node.label.slice(0, 15) + "…" : node.label}
          </text>
        </g>
      ))}
    </svg>
  );
}

// ---- Grade 5 Science & Technology visuals --------------------------------

// Isolated respiratory system silhouette (no body outline) per the SVG design guide's "Human Anatomy Strand"
// call-out for Upper Primary: nose, trachea, lungs, diaphragm. Used with hotspot spots layered on top.
function RespiratorySystem({ className }: { className?: string }) {
  const w = 160;
  const h = 220;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className={className} width={w} height={h}>
      {/* nose */}
      <path d="M74 8 Q80 2 86 8 L88 26 Q80 32 72 26 Z" fill="#fda4af" stroke="#9f1239" strokeWidth={2} />
      {/* trachea */}
      <rect x={74} y={26} width={12} height={56} rx={5} fill="#f1f5f9" stroke="#475569" strokeWidth={2} />
      {[34, 44, 54, 64, 74].map((y) => (
        <line key={y} x1={75} y1={y} x2={85} y2={y} stroke="#475569" strokeWidth={1} />
      ))}
      {/* bronchi */}
      <path d="M80 82 L50 100" stroke="#475569" strokeWidth={5} strokeLinecap="round" />
      <path d="M80 82 L110 100" stroke="#475569" strokeWidth={5} strokeLinecap="round" />
      {/* lungs */}
      <path
        d="M50 100 C20 100 12 135 15 162 C18 188 34 200 50 200 C60 200 56 178 50 160 C44 142 56 112 50 100 Z"
        fill="#fb7185"
        stroke="#9f1239"
        strokeWidth={2.2}
      />
      <path
        d="M110 100 C140 100 148 135 145 162 C142 188 126 200 110 200 C100 200 104 178 110 160 C116 142 104 112 110 100 Z"
        fill="#fb7185"
        stroke="#9f1239"
        strokeWidth={2.2}
      />
      {/* diaphragm */}
      <path d="M15 205 Q80 222 145 205" fill="none" stroke="#166534" strokeWidth={5} strokeLinecap="round" />
    </svg>
  );
}

const VERTEBRATE_GROUP_ART: Record<Extract<VisualSpec, { type: "vertebrate-group" }>["group"], { body: React.ReactNode; label: string }> = {
  mammal: {
    label: "Mammal",
    body: (
      <g>
        <ellipse cx={80} cy={70} rx={42} ry={26} fill="#d6b48a" stroke="#7c4a1e" strokeWidth={2.5} />
        <circle cx={126} cy={54} r={16} fill="#d6b48a" stroke="#7c4a1e" strokeWidth={2.5} />
        <path d="M116 42 L110 30 L120 36 Z" fill="#d6b48a" stroke="#7c4a1e" strokeWidth={2} />
        <path d="M136 42 L142 30 L132 36 Z" fill="#d6b48a" stroke="#7c4a1e" strokeWidth={2} />
        {[50, 65, 95, 110].map((x, i) => (
          <line key={i} x1={x} y1={92} x2={x} y2={112} stroke="#7c4a1e" strokeWidth={5} strokeLinecap="round" />
        ))}
        <path d="M40 60 Q20 55 15 40" fill="none" stroke="#7c4a1e" strokeWidth={4} strokeLinecap="round" />
      </g>
    ),
  },
  bird: {
    label: "Bird",
    body: (
      <g>
        <ellipse cx={80} cy={80} rx={34} ry={28} fill="#93c5fd" stroke="#1d4ed8" strokeWidth={2.5} />
        <circle cx={122} cy={54} r={14} fill="#93c5fd" stroke="#1d4ed8" strokeWidth={2.5} />
        <path d="M136 54 L150 50 L136 46 Z" fill="#f59e0b" stroke="#92400e" strokeWidth={1.5} />
        <path d="M60 60 Q30 50 20 65 Q40 68 55 72 Z" fill="#60a5fa" stroke="#1d4ed8" strokeWidth={2} />
        <line x1={68} y1={106} x2={64} y2={124} stroke="#92400e" strokeWidth={3} strokeLinecap="round" />
        <line x1={92} y1={106} x2={96} y2={124} stroke="#92400e" strokeWidth={3} strokeLinecap="round" />
      </g>
    ),
  },
  reptile: {
    label: "Reptile",
    body: (
      <g>
        <path d="M20 90 Q40 70 80 78 Q120 70 140 90 Q120 100 80 96 Q40 100 20 90 Z" fill="#86efac" stroke="#166534" strokeWidth={2.5} />
        <circle cx={135} cy={82} r={11} fill="#86efac" stroke="#166534" strokeWidth={2.5} />
        <line x1={40} y1={94} x2={34} y2={108} stroke="#166534" strokeWidth={3} strokeLinecap="round" />
        <line x1={60} y1={98} x2={56} y2={112} stroke="#166534" strokeWidth={3} strokeLinecap="round" />
        <line x1={100} y1={98} x2={104} y2={112} stroke="#166534" strokeWidth={3} strokeLinecap="round" />
        <path d="M20 90 Q6 92 4 100" fill="none" stroke="#166534" strokeWidth={4} strokeLinecap="round" />
      </g>
    ),
  },
  fish: {
    label: "Fish",
    body: (
      <g>
        <ellipse cx={82} cy={80} rx={44} ry={26} fill="#7dd3fc" stroke="#0369a1" strokeWidth={2.5} />
        <path d="M126 80 L152 60 L152 100 Z" fill="#7dd3fc" stroke="#0369a1" strokeWidth={2.5} />
        <path d="M70 56 L82 42 L94 56 Z" fill="#38bdf8" stroke="#0369a1" strokeWidth={2} />
        <circle cx={54} cy={74} r={4} fill="#0f172a" />
        {[60, 72, 84, 96].map((x, i) => (
          <path key={i} d={`M${x} 88 Q${x + 4} 96 ${x + 8} 88`} fill="none" stroke="#0369a1" strokeWidth={1.5} />
        ))}
      </g>
    ),
  },
  amphibian: {
    label: "Amphibian",
    body: (
      <g>
        <ellipse cx={80} cy={80} rx={30} ry={26} fill="#a3e635" stroke="#3f6212" strokeWidth={2.5} />
        <circle cx={64} cy={56} r={10} fill="#a3e635" stroke="#3f6212" strokeWidth={2.5} />
        <circle cx={94} cy={56} r={10} fill="#a3e635" stroke="#3f6212" strokeWidth={2.5} />
        <circle cx={62} cy={52} r={3.5} fill="#1a2e05" />
        <circle cx={92} cy={52} r={3.5} fill="#1a2e05" />
        <path d="M52 96 Q38 100 32 114 Q46 112 56 106" fill="#a3e635" stroke="#3f6212" strokeWidth={2} />
        <path d="M108 96 Q122 100 128 114 Q114 112 104 106" fill="#a3e635" stroke="#3f6212" strokeWidth={2} />
      </g>
    ),
  },
};

function VertebrateGroup({ group, className }: Extract<VisualSpec, { type: "vertebrate-group" }> & { className?: string }) {
  const w = 160;
  const h = 140;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className={className} width={w} height={h}>
      {VERTEBRATE_GROUP_ART[group].body}
    </svg>
  );
}

const FLOAT_SINK_OBJECT_ART: Record<Extract<VisualSpec, { type: "float-sink-object" }>["object"], React.ReactNode> = {
  wood: <rect x={40} y={40} width={80} height={22} rx={3} fill="#b45309" stroke="#78350f" strokeWidth={2} />,
  stone: <ellipse cx={80} cy={51} rx={34} ry={22} fill="#94a3b8" stroke="#334155" strokeWidth={2} />,
  metal: <rect x={50} y={38} width={60} height={26} rx={2} fill="#cbd5e1" stroke="#475569" strokeWidth={2} />,
  plastic: <rect x={45} y={36} width={70} height={30} rx={10} fill="#93c5fd" stroke="#1d4ed8" strokeWidth={2} />,
  cork: <ellipse cx={80} cy={51} rx={26} ry={18} fill="#d6b48a" stroke="#92400e" strokeWidth={2} />,
  buoy: (
    <g>
      <circle cx={80} cy={50} r={26} fill="none" stroke="#dc2626" strokeWidth={10} />
      <circle cx={80} cy={50} r={26} fill="none" stroke="white" strokeWidth={4} strokeDasharray="8 8" />
    </g>
  ),
  feather: <path d="M80 30 Q95 45 80 72 Q65 45 80 30 Z" fill="#f8fafc" stroke="#94a3b8" strokeWidth={2} />,
};

// Shows a test object either resting on a wavy water surface (floats) or below it (sinks) — the water line is
// always drawn at the same y so the two states read as visually distinct at a glance.
function FloatSinkObject({ object, floats, className }: Extract<VisualSpec, { type: "float-sink-object" }> & { className?: string }) {
  const w = 160;
  const h = 130;
  const waterY = 70;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className={className} width={w} height={h}>
      <g transform={floats ? "translate(0,0)" : "translate(0,42)"}>{FLOAT_SINK_OBJECT_ART[object]}</g>
      <path d={`M0 ${waterY} Q20 ${waterY - 6} 40 ${waterY} T80 ${waterY} T120 ${waterY} T160 ${waterY}`} fill="none" stroke="#0284c7" strokeWidth={2.5} />
      <rect x={0} y={waterY} width={w} height={h - waterY} fill="#7dd3fc" opacity={0.55} />
    </svg>
  );
}

function HeatTransferMode({ mode, className }: Extract<VisualSpec, { type: "heat-transfer-mode" }> & { className?: string }) {
  const w = 180;
  const h = 130;
  if (mode === "conduction") {
    return (
      <svg viewBox={`0 0 ${w} ${h}`} className={className} width={w} height={h}>
        <rect x={20} y={55} width={140} height={16} rx={4} fill="#cbd5e1" stroke="#475569" strokeWidth={2} />
        <path d="M10 100 L30 55 L60 55 L45 100 Z" fill="#f97316" opacity={0.85} />
        {[70, 95, 120, 145].map((x, i) => (
          <path key={i} d={`M${x} 63 h14`} stroke="#dc2626" strokeWidth={2.5} markerEnd="url(#arrow)" />
        ))}
        <defs>
          <marker id="arrow" markerWidth={6} markerHeight={6} refX={5} refY={3} orient="auto">
            <path d="M0 0 L6 3 L0 6 Z" fill="#dc2626" />
          </marker>
        </defs>
      </svg>
    );
  }
  if (mode === "convection") {
    return (
      <svg viewBox={`0 0 ${w} ${h}`} className={className} width={w} height={h}>
        <rect x={20} y={95} width={140} height={20} fill="#7dd3fc" opacity={0.6} />
        <path d="M10 115 L170 115 L160 125 L20 125 Z" fill="#f97316" />
        <path d="M60 95 C 50 75, 70 65, 60 45 C 80 55, 75 75, 90 90" fill="none" stroke="#dc2626" strokeWidth={2.5} />
        <path d="M110 95 C 100 75, 120 65, 110 45 C 130 55, 125 75, 140 90" fill="none" stroke="#dc2626" strokeWidth={2.5} />
      </svg>
    );
  }
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className={className} width={w} height={h}>
      <circle cx={40} cy={100} r={22} fill="#f97316" stroke="#9a3412" strokeWidth={2.5} />
      {[0, 30, -30, 60, -60].map((deg, i) => (
        <line
          key={i}
          x1={62}
          y1={100}
          x2={150}
          y2={100}
          stroke="#dc2626"
          strokeWidth={2}
          strokeDasharray="6 5"
          transform={`rotate(${deg} 40 100)`}
        />
      ))}
      <rect x={140} y={70} width={20} height={60} rx={3} fill="#fde68a" stroke="#92400e" strokeWidth={2} />
    </svg>
  );
}
