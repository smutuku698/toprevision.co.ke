import type { RNG } from "./rng";

export type SubjectId =
  | "math"
  | "english"
  | "science"
  | "kiswahili"
  | "social-studies"
  | "pre-technical"
  | "agriculture-nutrition"
  | "creative-arts-sports"
  | "cre"
  | "hre"
  | "ire"
  | "french"
  | "german"
  | "mandarin"
  | "indigenous-language"
  | "arabic"
  | "music-and-dance";

export interface Subject {
  id: SubjectId;
  name: string;
  color: string; // tailwind color token, e.g. "sky"
  icon: string; // key into <SubjectIcon/>
  /** Per-grade display-name override — e.g. Grade 6 Science is officially "Science & Technology" in the KICD
   * design, not "Integrated Science" (which is correct only from Grade 7 onward). Falls back to `name` when a
   * grade has no override. Keyed by grade number. */
  namesByGrade?: Partial<Record<number, string>>;
  /** Grades where this subject isn't part of the real KICD curriculum at all — e.g. Pre-Technical Studies only
   * starts at Grade 7 (Junior School); it doesn't exist at Grade 6 (Upper Primary). Hidden from nav/dashboard
   * for these grades rather than shown as "coming soon", since it will never have content there. */
  hiddenForGrades?: number[];
}

export interface Strand {
  id: string;
  subjectId: SubjectId;
  name: string;
  grade: number;
  description?: string;
  /** Extra/bonus content kept from an earlier, less-accurate curriculum pass — hidden by default, revealed by user toggle. */
  isBonus?: boolean;
}

// ---- Question payloads -----------------------------------------------

export type QuestionKind =
  | "multiple-choice"
  | "fill-blank"
  | "click-match"
  | "categorize"
  | "ordering"
  | "hotspot"
  | "number-line"
  | "protractor"
  | "coordinate-plot"
  | "solid-rotate";

export interface BaseQuestion {
  kind: QuestionKind;
  prompt: string;
  speakable?: boolean; // show the little audio icon like IXL
  hint?: string;
  /** A short passage/functional text shown above the prompt, in a readable (non-bold) block. */
  passage?: string;
  /** Shown after the student submits (right or wrong) — the worked-out "why", generated from this question's own numbers. */
  explanation: string;
  visual?: VisualSpec; // optional generated SVG illustration shown above/alongside the prompt
}

export interface MultipleChoiceQuestion extends BaseQuestion {
  kind: "multiple-choice";
  choices: string[];
  correctIndex: number;
  layout?: "row" | "grid" | "list";
}

export interface FillBlankQuestion extends BaseQuestion {
  kind: "fill-blank";
  before: string; // text before the blank
  after: string; // text after the blank
  correctAnswer: string; // normalized comparison happens in validator
  acceptedAnswers?: string[];
  inputMode?: "numeric" | "text";
  unit?: string;
}

export interface ClickMatchQuestion extends BaseQuestion {
  kind: "click-match";
  tokens: { id: string; label: string }[];
  targets: { id: string; label: string; icon?: VisualSpec }[];
  correctMap: Record<string, string>; // targetId -> tokenId
}

export interface CategorizeQuestion extends BaseQuestion {
  kind: "categorize";
  items: { id: string; label: string }[];
  buckets: { id: string; label: string }[];
  correctBucket: Record<string, string>; // itemId -> bucketId
}

export interface OrderingQuestion extends BaseQuestion {
  kind: "ordering";
  items: { id: string; label: string }[];
  correctOrder: string[]; // item ids in correct order
  instruction?: string;
}

export interface HotspotQuestion extends BaseQuestion {
  kind: "hotspot";
  diagram: VisualSpec;
  spots: { id: string; xPercent: number; yPercent: number; label: string }[];
  askId: string; // which spot is being asked about this round
  choices: string[];
  correctLabel: string;
}

export interface NumberLineQuestion extends BaseQuestion {
  kind: "number-line";
  min: number;
  max: number;
  step: number;
  correctValue: number;
  mode: "point" | "inequality-gte" | "inequality-gt" | "inequality-lte" | "inequality-lt";
}

/** A rotatable protractor: drag the needle to measure a fixed second ray ("measure")
 * or to construct an angle of a given size from a single fixed baseline ray ("construct"). */
export interface ProtractorQuestion extends BaseQuestion {
  kind: "protractor";
  mode: "measure" | "construct";
  rayBAngleDeg?: number; // only set in "measure" mode — the fixed second ray to read
  correctAngleDeg: number;
  toleranceDeg: number;
}

/** A draggable point on a Cartesian grid, snapped to the nearest integer coordinate. */
export interface CoordinatePlotQuestion extends BaseQuestion {
  kind: "coordinate-plot";
  range: number; // grid spans -range..range on both axes
  targetPoint: { x: number; y: number };
  contextPoints?: { x: number; y: number; label: string }[];
}

/** A rotatable 3D cube/cuboid — drag to spin it, click the asked-about face. */
export interface SolidRotateQuestion extends BaseQuestion {
  kind: "solid-rotate";
  shape: "cube" | "cuboid";
  length: number;
  width: number;
  height: number;
  faces: { id: string; label: string }[];
  askId: string;
  correctFaceId: string;
}

export type Question =
  | MultipleChoiceQuestion
  | FillBlankQuestion
  | ClickMatchQuestion
  | CategorizeQuestion
  | OrderingQuestion
  | HotspotQuestion
  | NumberLineQuestion
  | ProtractorQuestion
  | CoordinatePlotQuestion
  | SolidRotateQuestion;

// ---- Generated visuals (no photos needed — code draws them) -----------

export type VisualSpec =
  | { type: "right-triangle"; base: number; height: number; showHypotenuse?: boolean; labelBase?: string; labelHeight?: string; labelHypotenuse?: string }
  | { type: "rectangle"; width: number; height: number; labelWidth?: string; labelHeight?: string }
  | { type: "circle-shape"; radius: number; label?: string }
  | { type: "coordinate-line"; slope: number; intercept: number; points?: [number, number][]; showLine?: boolean }
  | { type: "bar-chart"; data: { label: string; value: number }[] }
  | { type: "icon-set"; icon: string; count: number; color?: string }
  | { type: "circuit"; components: ("cell" | "bulb" | "switch" | "resistor")[]; closed: boolean }
  | { type: "flower" }
  | { type: "plant-cell" }
  | { type: "animal-cell" }
  | { type: "particle-diagram"; state: "solid" | "liquid" | "gas" }
  | { type: "solid"; shape: "cuboid"; length: number; width: number; height: number }
  | { type: "solid"; shape: "cube"; side: number }
  | { type: "solid"; shape: "cylinder"; radius: number; height: number }
  | { type: "solid"; shape: "cone"; radius: number; height: number }
  | { type: "solid"; shape: "sphere"; radius: number }
  | { type: "solid"; shape: "pyramid"; baseSide: number; height: number }
  | { type: "solid"; shape: "triangular-prism"; base: number; triHeight: number; length: number }
  | { type: "circle-sector"; radius: number; angleDeg: number; showChord?: boolean }
  | { type: "fraction-bar"; numerator: number; denominator: number; label?: string }
  | { type: "polygon"; sides: number; label?: string }
  | { type: "line-graph"; points: { label: string; value: number }[] }
  | { type: "pie-chart"; slices: { label: string; value: number }[] }
  | { type: "grid-shape"; rows: number; cols: number; filled: [number, number][] }
  | { type: "clock"; hour: number; minute: number }
  | { type: "weather"; days: { label: string; condition: "sunny" | "cloudy" | "rainy" | "stormy" }[] }
  | { type: "hazard-symbol"; hazard: "flammable" | "corrosive" | "toxic" | "carcinogenic" | "radioactive" }
  | {
      type: "lab-apparatus";
      item: "beaker" | "test-tube" | "measuring-cylinder" | "bunsen-burner" | "microscope" | "conical-flask" | "evaporating-dish" | "test-tube-rack";
    }
  | { type: "separation-setup"; method: "filtration" | "simple-distillation" | "evaporation" | "chromatography" | "sublimation" }
  | { type: "litmus-test"; result: "acid" | "base" | "neutral" }
  | { type: "magnet"; orientation: "attract" | "repel" }
  | { type: "reproductive-system"; sex: "male" | "female" }
  | { type: "excretory-system"; view: "urinary" | "skin" }
  | {
      type: "hand-tool";
      item:
        | "tape-measure"
        | "steel-rule"
        | "callipers"
        | "weighing-balance"
        | "divider"
        | "try-square"
        | "marking-gauge"
        | "dot-punch"
        | "scriber"
        // ---- Grade 9 Pre-Technical: holding & driving tools ----
        | "pliers"
        | "clamp"
        | "tongs"
        | "clip"
        | "vice"
        | "hammer"
        | "screwdriver"
        | "spanner"
        | "mallet";
    }
  | { type: "ppe-icon"; item: "goggles" | "gloves" | "boots" | "overalls" | "mask" }
  | { type: "drawing-line"; style: "thick-continuous" | "thin-continuous" | "dashed" | "chain" }
  | { type: "kenyan-currency"; kind: "coin" | "note"; value: 1 | 5 | 10 | 20 | 40 | 50 | 100 | 200 | 500 | 1000 }
  | {
      type: "material-swatch";
      material: "steel" | "aluminium" | "copper" | "wood" | "plastic" | "glass" | "rubber" | "stone" | "ceramic" | "cement" | "paper";
    }
  | { type: "photo-diagram"; image: string; alt: string }
  // ---- Grade 6 Science & Technology visuals ----
  | { type: "fungus"; kind: "mushroom" | "toadstool" | "puffball" | "yeast" | "mould" }
  | {
      type: "invertebrate";
      kind: "insect" | "spider" | "tick" | "mite" | "millipede-centipede" | "snail-slug" | "worm" | "crab" | "starfish" | "octopus";
    }
  | { type: "circulatory-system"; view: "heart" | "vessels" | "blood" }
  | { type: "light-material"; material: "transparent" | "translucent" | "opaque" }
  | { type: "plane-mirror"; objectShape: "arrow" | "triangle" | "letter-f" }
  | { type: "shadow-eclipse"; mode: "shadow" | "solar-eclipse" | "lunar-eclipse" }
  | { type: "rainbow-formation" }
  | { type: "lever-diagram"; leverClass: 1 | 2 | 3 }
  | { type: "inclined-plane"; kind: "ramp" | "staircase" | "wedge" | "winding-road" }
  // ---- Grade 6 Agriculture visuals ----
  | { type: "soil-erosion"; kind: "gulley" | "rill" | "splash" | "sheet" }
  | { type: "garden-bed"; kind: "sunken-seedbed" | "shallow-pit" | "sunken-moist-bed" | "raised-moist-bed" }
  | { type: "crochet-stitch"; kind: "single" | "double" }
  | { type: "fabric-stain"; stain: "blood" | "grass"; treated?: boolean }
  | { type: "wildlife-deterrent"; kind: "mesh-fence" | "thorny-fence" | "trap" | "light" | "sound" | "deflector" }
  // ---- Grade 6 Creative Arts visuals ----
  | { type: "color-wheel"; highlight?: "primary" | "secondary" | "tertiary" }
  | { type: "music-note"; note: "crotchet" | "quaver-pair" | "minim" | "dotted-minim" | "semibreve" | "crotchet-rest" | "minim-rest" | "semibreve-rest" }
  | { type: "sol-fa-ladder"; highlight?: "doh" | "re" | "me" | "fah" | "soh" | "lah" | "te" | "doh1" }
  | { type: "weave-pattern"; kind: "1/1" | "2/2" }
  | { type: "pottery-stage"; stage: "clay-ball" | "slab" | "joined-vase" | "burnished-vase" }
  | { type: "gymnastics-pose"; pose: "cartwheel" | "forward-roll" | "swan-balance" }
  | { type: "jump-technique"; kind: "long-jump-sail" | "high-jump-scissors" }
  | { type: "string-instrument-diagram"; highlight?: "body" | "neck" | "strings" | "bow" | "tuning-pegs" | "bridge" }
  | { type: "recorder-fingering"; note: "C" | "D" | "E" | "F" | "G" | "A" | "B" | "C1" | "D1" }
  | { type: "stipple-texture"; density: "light" | "medium" | "dark" }
  | { type: "block-print-pattern"; motif: "triangle" | "circle" | "diamond" | "square" }
  | { type: "volleyball-skill"; skill: "underarm-serve" | "dig-pass" }
  // ---- Grade 9 Science visuals ----
  | { type: "atom-structure"; shells: number[] }
  | { type: "wave-diagram"; highlight?: "wavelength" | "amplitude" | "crest" | "trough" | "none" }
  | { type: "curved-mirror-diagram"; mirrorType: "concave" | "convex" }
  // ---- Grade 9 Social Studies visuals ----
  | {
      type: "weather-instrument";
      instrument: "thermometer" | "rain-gauge" | "barometer" | "anemometer" | "wind-vane" | "hygrometer" | "sunshine-recorder";
    }
  /** A simple top-down tree: each level is drawn as a row of boxes, connected by a line to every box in the
   * level below. Suits small org-chart/hierarchy content (arms of government, court hierarchy) — not a
   * general-purpose graph layout. */
  | { type: "hierarchy"; levels: string[][] }
  // ---- Grade 5 Science & Technology visuals ----
  | { type: "respiratory-system" }
  | { type: "vertebrate-group"; group: "mammal" | "bird" | "reptile" | "fish" | "amphibian" }
  | { type: "float-sink-object"; object: "wood" | "stone" | "metal" | "plastic" | "cork" | "buoy" | "feather"; floats: boolean }
  | { type: "heat-transfer-mode"; mode: "conduction" | "convection" | "radiation" };

// ---- Skills -------------------------------------------------------------

export interface SkillMeta {
  id: string;
  code: string; // IXL-style short code e.g. "N.4"
  subjectId: SubjectId;
  strandId: string;
  grade: number;
  title: string;
  description: string;
}

export interface Skill extends SkillMeta {
  generate: (rng: RNG) => Question;
}

export interface AnswerResult {
  correct: boolean;
  correctAnswerLabel?: string;
}
