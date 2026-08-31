import type { VisualSpec } from "./types";

/**
 * Shared registry of photo-diagram images (see curriculum-reference/{grade}/IMAGE-PROMPTS-nanobanana.json for how
 * these are produced, and curriculum-reference/CURRICULUM-MINING-GUIDE.md for the standing rule this file
 * exists to satisfy).
 *
 * An image belongs here, not inlined in a single skill file, because the same labelled photo is meant to be
 * reused across multiple skills/strands/sub-strands — and potentially across subjects within the same grade
 * (e.g. a lab-apparatus photo could support both an Integrated Science identification question and a
 * Pre-Technical "tools and equipment" question) — each asking a genuinely different question about the same
 * image (different Bloom's tier, different part, different framing), not just the same recall question
 * copy-pasted into two files. Centralising the image + its part list means every skill that uses an image
 * draws from the same verified letter→part mapping, instead of each skill file re-deriving (and risking
 * re-guessing) it independently.
 *
 * All image files are served as .webp — see web/scripts/convert-images-to-webp.mjs. Never reference a .png
 * here; run `npm run images:webp` on any newly-dropped source image first.
 */

export interface PhotoPart {
  /** The letter/number actually printed on the image next to this part's leader line. Only confidently and
   * unambiguously identified parts are listed here — see each entry's `skippedLabels` note for what was left
   * out and why (duplicate/ambiguous printed letters from generation, not guessed). */
  letter: string;
  name: string;
  /** Function/use, phrased to drop straight into a question's `explanation` field. */
  detail: string;
  /** Curated confusable distractor pool for this specific part (RIGOR-STANDARDS.md's plausible-distractor
   * rule) — items a learner could genuinely mix this part up with, not an arbitrary slice of the other parts. */
  confusedWith: readonly string[];
}

export interface PhotoImageEntry {
  visual: Extract<VisualSpec, { type: "photo-diagram" }>;
  parts: readonly PhotoPart[];
  /** Why any printed letters on the source image were left out of `parts` — keeps the omission auditable. */
  skippedLabels?: string;
}

export const GRADE7_PHOTO_IMAGES = {
  labApparatus: {
    visual: {
      type: "photo-diagram",
      image: "/images/grade7/lab-apparatus.webp",
      alt: "Eight common laboratory apparatus, each labelled with a letter: beaker, test tube, measuring cylinder, bunsen burner, microscope, conical flask, evaporating dish and test tube rack",
    },
    parts: [
      { letter: "A", name: "Beaker", detail: "Mixing, stirring and heating liquids in approximate volumes", confusedWith: ["Conical flask", "Measuring cylinder", "Evaporating dish"] },
      { letter: "B", name: "Test tube", detail: "Holding a small sample of liquid or solid for a reaction or gentle heating", confusedWith: ["Measuring cylinder", "Test tube rack"] },
      { letter: "C", name: "Measuring cylinder", detail: "Measuring the exact volume of a liquid", confusedWith: ["Beaker", "Test tube"] },
      { letter: "D", name: "Bunsen burner", detail: "Providing a controlled flame for heating substances", confusedWith: ["Evaporating dish", "Microscope"] },
      { letter: "E", name: "Microscope", detail: "Magnifying very small specimens so fine details can be seen", confusedWith: ["Bunsen burner", "Beaker"] },
      { letter: "F", name: "Conical flask", detail: "Swirling and mixing liquids without spilling, or collecting a distillate", confusedWith: ["Beaker", "Evaporating dish"] },
      { letter: "G", name: "Evaporating dish", detail: "Heating a solution so the liquid evaporates, leaving the dissolved solid behind", confusedWith: ["Beaker", "Conical flask"] },
      { letter: "H", name: "Test tube rack", detail: "Holding several test tubes upright and safely during an experiment", confusedWith: ["Test tube"] },
    ],
  },
  microscope: {
    visual: {
      type: "photo-diagram",
      image: "/images/grade7/microscope.webp",
      alt: "A light microscope with its parts labelled by letter",
    },
    parts: [
      { letter: "A", name: "Eyepiece (ocular lens)", detail: "the lens you look through — it magnifies the image formed by the objective lens", confusedWith: ["Objective lens", "Diaphragm"] },
      { letter: "B", name: "Body tube", detail: "connects the eyepiece to the objective lenses, keeping them the correct distance apart", confusedWith: ["Arm", "Base"] },
      { letter: "D", name: "Revolving nosepiece", detail: "holds the objective lenses and is rotated to switch between magnifications", confusedWith: ["Adjustment knob", "Stage"] },
      { letter: "H", name: "Stage", detail: "the flat platform where the slide with the specimen is placed", confusedWith: ["Base", "Diaphragm"] },
      { letter: "I", name: "Diaphragm", detail: "controls how much light passes up through the specimen", confusedWith: ["Mirror / light source", "Stage"] },
      { letter: "J", name: "Mirror / light source", detail: "directs light up through the diaphragm and the specimen", confusedWith: ["Diaphragm", "Base"] },
      { letter: "K", name: "Adjustment knob", detail: "turned to bring the image into focus", confusedWith: ["Revolving nosepiece", "Diaphragm"] },
      { letter: "L", name: "Base", detail: "supports the whole microscope and keeps it steady on the bench", confusedWith: ["Stage", "Body tube"] },
    ],
    skippedLabels: "C, E, F, G omitted — generation duplicated the letter C on two nearby points near the arm/nosepiece joint and skipped G entirely; not confident enough in that specific area to assign it a single correct part.",
  },
  bunsenBurner: {
    visual: {
      type: "photo-diagram",
      image: "/images/grade7/bunsen-burner.webp",
      alt: "A bunsen burner with its parts labelled by letter",
    },
    parts: [
      { letter: "A", name: "Chimney (barrel top)", detail: "where the flame burns, at the top of the barrel", confusedWith: ["Barrel", "Gas inlet (jet)"] },
      { letter: "B", name: "Barrel", detail: "the vertical metal tube gas and air travel up through before burning", confusedWith: ["Chimney (barrel top)", "Collar"] },
      { letter: "C", name: "Air hole", detail: "the opening that lets air in to mix with the gas — more air gives a hotter, blue flame", confusedWith: ["Collar", "Gas inlet (jet)"] },
      { letter: "D", name: "Collar", detail: "the sleeve you rotate to open or close the air hole", confusedWith: ["Air hole", "Base"] },
      { letter: "E", name: "Gas inlet (jet)", detail: "where the rubber gas tubing connects and gas enters the burner", confusedWith: ["Base", "Air hole"] },
      { letter: "5", name: "Base", detail: "the heavy flat foot that keeps the burner stable and prevents tipping", confusedWith: ["Collar", "Gas inlet (jet)"] },
    ],
    skippedLabels: "Letter F was printed twice — once as a marker in empty space not touching any part, once redundantly near the gas inlet already covered by E — so F is omitted rather than guessed.",
  },
} as const satisfies Record<string, PhotoImageEntry>;

export type Grade7PhotoImageKey = keyof typeof GRADE7_PHOTO_IMAGES;

export const GRADE6_PHOTO_IMAGES = {
  busTravelTimetable: {
    visual: {
      type: "photo-diagram",
      image: "/images/grade6/math-g6-travel-timetable.webp",
      alt: "A bus travel timetable board listing 5 towns with departure and arrival times, four rows labelled by letter",
    },
    parts: [
      { letter: "A", name: "Naivasha row (departs 06:30, arrives 07:45)", detail: "shows the departure and arrival time for the Naivasha route", confusedWith: ["Nakuru row", "Eldoret row"] },
      { letter: "B", name: "Nakuru row (departs 08:00, arrives 09:15)", detail: "shows the departure and arrival time for the Nakuru route", confusedWith: ["Naivasha row", "Kericho row"] },
      { letter: "C", name: "Eldoret row (departs 10:30, arrives 13:00)", detail: "the longest journey on the board — 2 hours 30 minutes", confusedWith: ["Kericho row", "Nakuru row"] },
      { letter: "D", name: "Kericho row (departs 18:00, arrives 20:30)", detail: "shows the departure and arrival time for the Kericho route", confusedWith: ["Eldoret row", "Naivasha row"] },
    ],
  },
  shoppingBudgetReceipt: {
    visual: {
      type: "photo-diagram",
      image: "/images/grade6/math-g6-shopping-budget-receipt.webp",
      alt: "A hand-written shopping budget beside a printed shop receipt, with a budgeted item, the budget total, a receipt item, the VAT line, and the total paid each labelled by letter",
    },
    parts: [
      { letter: "A", name: "Budgeted item row (Sugar 1kg — KES 150)", detail: "one planned item and its planned cost on the hand-written budget", confusedWith: ["Receipt item row", "Budget total"] },
      { letter: "B", name: "Budget total (KES 795)", detail: "the sum of all 4 planned costs on the budget list", confusedWith: ["Receipt total paid", "Budgeted item row"] },
      { letter: "C", name: "Receipt item row (Sugar — KES 160)", detail: "the actual purchased cost printed on the shop receipt, which can differ from the budgeted cost", confusedWith: ["Budgeted item row", "VAT line"] },
      { letter: "D", name: "VAT line (VAT 16% — KES 110)", detail: "the value added tax charged on the purchase, added on top of the subtotal", confusedWith: ["Receipt total paid", "Receipt item row"] },
      { letter: "E", name: "Total paid (KES 895)", detail: "the final amount paid, including VAT", confusedWith: ["Budget total", "VAT line"] },
    ],
  },
  containersAndCapacities: {
    visual: {
      type: "photo-diagram",
      image: "/images/grade6/math-g6-labelled-containers-capacity.webp",
      alt: "Five containers of increasing size, each printed with its capacity, labelled by letter",
    },
    parts: [
      { letter: "A", name: "Measuring cup — 250 mL", detail: "the smallest container shown, marked with graduated measuring lines", confusedWith: ["Cooking-oil bottle — 750 mL"] },
      { letter: "B", name: "Cooking-oil bottle — 750 mL", detail: "holds three times as much as the measuring cup", confusedWith: ["Measuring cup — 250 mL", "Water bottle — 1.5 L"] },
      { letter: "C", name: "Water bottle — 1.5 L", detail: "holds 1500 mL, twice as much as the cooking-oil bottle", confusedWith: ["Cooking-oil bottle — 750 mL", "Bucket — 10 L"] },
      { letter: "D", name: "Bucket — 10 L", detail: "holds 10,000 mL, far more than any bottle shown", confusedWith: ["Water bottle — 1.5 L", "Jerry can — 20 L"] },
      { letter: "E", name: "Jerry can — 20 L", detail: "the largest container shown, holding twice as much as the bucket", confusedWith: ["Bucket — 10 L"] },
    ],
  },
  estimatingMassInTonnes: {
    visual: {
      type: "photo-diagram",
      image: "/images/grade6/math-g6-heavy-objects-mass-estimate.webp",
      alt: "A car, an elephant, a loaded lorry and a shipping container in increasing order of mass, each labelled with its approximate mass in tonnes",
    },
    parts: [
      { letter: "A", name: "Car — about 1.5 tonnes", detail: "the lightest object shown, equal to about 1500 kg", confusedWith: ["Elephant — about 5 tonnes"] },
      { letter: "B", name: "Elephant — about 5 tonnes", detail: "roughly 3 times heavier than the car", confusedWith: ["Car — about 1.5 tonnes", "Loaded lorry — about 10 tonnes"] },
      { letter: "C", name: "Loaded lorry — about 10 tonnes", detail: "twice as heavy as the elephant", confusedWith: ["Elephant — about 5 tonnes", "Shipping container — about 20 tonnes"] },
      { letter: "D", name: "Shipping container (loaded) — about 20 tonnes", detail: "the heaviest object shown, equal to 20,000 kg", confusedWith: ["Loaded lorry — about 10 tonnes"] },
    ],
  },
  commonFungi: {
    visual: {
      type: "photo-diagram",
      image: "/images/grade6/sci-g6-fungi-types.webp",
      alt: "A mushroom, toadstool, puffball, jar of yeast, and mould-covered bread, labelled by letter",
    },
    parts: [
      { letter: "A", name: "Mushroom", detail: "an edible fungus with a brown cap and visible gills, sometimes used as food", confusedWith: ["Toadstool", "Puffball"] },
      { letter: "B", name: "Toadstool", detail: "a fungus with a bright red, spotted cap — many toadstools are poisonous, unlike common mushrooms", confusedWith: ["Mushroom"] },
      { letter: "C", name: "Puffball", detail: "a round fungus with no visible stem, sitting directly on the ground", confusedWith: ["Mushroom"] },
      { letter: "D", name: "Yeast", detail: "a fungus used in fermentation, for example to make bread dough rise", confusedWith: ["Mould"] },
      { letter: "E", name: "Mould", detail: "a fungus that grows on decaying food and makes it unsafe to eat", confusedWith: ["Yeast"] },
    ],
  },
  landInvertebrates: {
    visual: {
      type: "photo-diagram",
      image: "/images/grade6/sci-g6-land-invertebrates.webp",
      alt: "A beetle, spider, tick, millipede, centipede, snail, slug and earthworm, labelled by letter",
    },
    parts: [
      { letter: "A", name: "Insect (beetle)", detail: "has 6 legs and a body divided into head, thorax and abdomen", confusedWith: ["Spider", "Tick"] },
      { letter: "B", name: "Spider", detail: "has 8 legs and two main body segments", confusedWith: ["Tick", "Insect (beetle)"] },
      { letter: "C", name: "Tick", detail: "a small 8-legged creature that feeds on the blood of animals", confusedWith: ["Spider"] },
      { letter: "D", name: "Millipede", detail: "has two pairs of legs on almost every body segment, giving it many more legs than a centipede", confusedWith: ["Centipede"] },
      { letter: "E", name: "Centipede", detail: "has only one pair of legs per body segment, fewer and longer-looking than a millipede's", confusedWith: ["Millipede"] },
      { letter: "F", name: "Snail", detail: "a soft-bodied creature that carries a spiral shell on its back", confusedWith: ["Slug"] },
      { letter: "G", name: "Slug", detail: "a soft-bodied creature with no shell, otherwise similar to a snail", confusedWith: ["Snail"] },
      { letter: "H", name: "Earthworm", detail: "a simple segmented worm with no legs, which helps aerate the soil", confusedWith: ["Slug"] },
    ],
  },
  seaCreatures: {
    visual: {
      type: "photo-diagram",
      image: "/images/grade6/sci-g6-sea-invertebrates.webp",
      alt: "An octopus, starfish and crab, labelled by letter",
    },
    parts: [
      { letter: "A", name: "Octopus", detail: "has 8 tentacles and a soft, rounded body with no shell", confusedWith: ["Crab"] },
      { letter: "B", name: "Starfish", detail: "has 5 arms arranged around a central body", confusedWith: ["Crab"] },
      { letter: "C", name: "Crab", detail: "has a hard shell, two pincer claws and 8 walking legs", confusedWith: ["Octopus", "Starfish"] },
    ],
  },
  heartAndVessels: {
    visual: {
      type: "photo-diagram",
      image: "/images/grade6/sci-g6-heart-anatomy.webp",
      alt: "A diagram of the human heart with its 4 chambers, an artery and a vein, labelled by letter",
    },
    parts: [
      { letter: "A", name: "Left auricle (atrium)", detail: "an upper chamber that receives blood returning from the lungs", confusedWith: ["Right auricle (atrium)", "Left ventricle"] },
      { letter: "B", name: "Right auricle (atrium)", detail: "an upper chamber that receives blood returning from the body", confusedWith: ["Left auricle (atrium)", "Right ventricle"] },
      { letter: "C", name: "Left ventricle", detail: "the thickest, most muscular chamber — it pumps oxygenated blood out to the whole body", confusedWith: ["Right ventricle", "Left auricle (atrium)"] },
      { letter: "D", name: "Right ventricle", detail: "a lower chamber that pumps blood to the lungs", confusedWith: ["Left ventricle", "Right auricle (atrium)"] },
      { letter: "E", name: "Artery", detail: "a vessel that carries blood away from the heart to the rest of the body", confusedWith: ["Vein"] },
      { letter: "F", name: "Vein", detail: "a vessel that carries blood back toward the heart", confusedWith: ["Artery"] },
    ],
  },
  componentsOfBlood: {
    visual: {
      type: "photo-diagram",
      image: "/images/grade6/sci-g6-blood-components.webp",
      alt: "A magnified view of blood showing red blood cells, a white blood cell and platelets, labelled by letter",
    },
    parts: [
      { letter: "A", name: "White blood cell (nucleus)", detail: "fights off germs that enter the body — this is the single larger cell with a visible lobed nucleus, distinct from the many small red discs surrounding it", confusedWith: ["Platelets"] },
      { letter: "C", name: "Platelets", detail: "tiny cell fragments that clump together to stop bleeding by clotting", confusedWith: ["White blood cell (nucleus)"] },
    ],
    skippedLabels: "Letter B is a second point on the same white blood cell's nucleus (redundant with A, not a separate part). Red blood cells — the numerous small discs filling the rest of the image — were never given their own dedicated hotspot letter despite several regeneration attempts explicitly requesting one; question text should reference them descriptively (e.g. 'the most numerous cells in this picture') rather than by letter.",
  },
  changesOfStateInEverydayLife: {
    visual: {
      type: "photo-diagram",
      image: "/images/grade6/sci-g6-state-of-matter-real-world.webp",
      alt: "Six everyday scenes showing melting, evaporation, sublimation, deposition, condensation and freezing, labelled by letter",
    },
    parts: [
      { letter: "A", name: "Melting (ice cube turning to water)", detail: "a solid changing to a liquid as it gains heat energy", confusedWith: ["Freezing (water turning to ice)"] },
      { letter: "B", name: "Evaporation (wet clothes drying on a line)", detail: "a liquid changing to a gas as water leaves the fabric into the air", confusedWith: ["Condensation (droplets on a cold glass)"] },
      { letter: "C", name: "Sublimation (smoking dry ice block)", detail: "a solid changing directly to a gas, skipping the liquid state", confusedWith: ["Deposition (frost forming inside a freezer)"] },
      { letter: "D", name: "Deposition (frost forming inside a freezer)", detail: "a gas changing directly to a solid, skipping the liquid state", confusedWith: ["Sublimation (smoking dry ice block)"] },
      { letter: "E", name: "Condensation (droplets on a cold glass)", detail: "a gas changing to a liquid as water vapour cools on a cold surface", confusedWith: ["Evaporation (wet clothes drying on a line)"] },
      { letter: "F", name: "Freezing (water turning to ice in a tray)", detail: "a liquid changing to a solid as it loses heat energy", confusedWith: ["Melting (ice cube turning to water)"] },
    ],
  },
  lightThroughMaterials: {
    visual: {
      type: "photo-diagram",
      image: "/images/grade6/sci-g6-transparent-translucent-opaque.webp",
      alt: "Three panels showing a torch shining through clear glass, frosted glass, and a wooden board, labelled by letter",
    },
    parts: [
      { letter: "A", name: "Transparent material (clear glass)", detail: "lets light pass straight through, so the shape behind it is perfectly sharp", confusedWith: ["Translucent material (frosted glass)"] },
      { letter: "B", name: "Translucent material (frosted glass)", detail: "lets some light through but scatters it, so the shape behind it looks blurry", confusedWith: ["Transparent material (clear glass)", "Opaque material (wooden board)"] },
      { letter: "C", name: "Opaque material (wooden board)", detail: "blocks light completely, so nothing behind it is visible and a dark shadow forms", confusedWith: ["Translucent material (frosted glass)"] },
    ],
  },
  leverAnatomyThreeClasses: {
    visual: {
      type: "photo-diagram",
      image: "/images/grade6/sci-g6-lever-anatomy-three-classes.webp",
      alt: "Scissors, a wheelbarrow and tweezers, each with their fulcrum, effort and load points labelled by letter, one tool per class of lever",
    },
    parts: [
      { letter: "A", name: "Scissors — pivot (fulcrum)", detail: "the fixed point the blades turn around — in a first-class lever the fulcrum sits between the effort and the load", confusedWith: ["Scissors — handle (effort)", "Wheelbarrow — wheel (fulcrum)"] },
      { letter: "B", name: "Scissors — handle (effort)", detail: "where you apply force to close the blades", confusedWith: ["Scissors — blade tip (load)"] },
      { letter: "C", name: "Scissors — blade tip (load)", detail: "where the cutting force acts on the material being cut", confusedWith: ["Scissors — handle (effort)"] },
      { letter: "D", name: "Wheelbarrow — wheel (fulcrum)", detail: "the fixed pivot point — in a second-class lever the load sits between the fulcrum and the effort", confusedWith: ["Wheelbarrow — tray (load)", "Scissors — pivot (fulcrum)"] },
      { letter: "E", name: "Wheelbarrow — tray (load)", detail: "holds the weight being carried, positioned between the wheel and the handles", confusedWith: ["Wheelbarrow — handle (effort)"] },
      { letter: "F", name: "Wheelbarrow — handle (effort)", detail: "where you lift and push to move the load", confusedWith: ["Wheelbarrow — tray (load)"] },
      { letter: "G", name: "Tweezers — joint (fulcrum)", detail: "the bent fixed point — in a third-class lever the effort sits between the fulcrum and the load", confusedWith: ["Tweezers — pinch point (effort)"] },
      { letter: "H", name: "Tweezers — pinch point (effort)", detail: "where your fingers squeeze, positioned between the joint and the tip", confusedWith: ["Tweezers — joint (fulcrum)", "Tweezers — tip (load)"] },
      { letter: "I", name: "Tweezers — tip (load)", detail: "where the tweezers grip the object being held", confusedWith: ["Tweezers — pinch point (effort)"] },
    ],
  },
  leversInDayToDayLife: {
    visual: {
      type: "photo-diagram",
      image: "/images/grade6/sci-g6-levers-gallery.webp",
      alt: "A hole punch, pliers, see-saw, bottle opener, nail clippers, nutcracker, shovel, fishing rod and kitchen tongs, labelled by letter",
    },
    parts: [
      { letter: "A", name: "Hole punch", detail: "a second-class lever used to punch holes in paper", confusedWith: ["Bottle opener", "Nutcracker"] },
      { letter: "B", name: "Pliers", detail: "a first-class lever used to grip or bend objects", confusedWith: ["Nail clippers", "Kitchen tongs"] },
      { letter: "C", name: "See-saw", detail: "a first-class lever balanced on a central pivot", confusedWith: ["Pliers"] },
      { letter: "D", name: "Bottle opener", detail: "a second-class lever used to pry off a bottle cap", confusedWith: ["Hole punch", "Nutcracker"] },
      { letter: "E", name: "Nail clippers", detail: "a compact lever tool used to trim nails", confusedWith: ["Pliers"] },
      { letter: "F", name: "Nutcracker", detail: "a second-class lever used to crack open a nut's shell", confusedWith: ["Bottle opener", "Hole punch"] },
      { letter: "G", name: "Shovel", detail: "a third-class lever used to dig and lift soil", confusedWith: ["Fishing rod"] },
      { letter: "H", name: "Fishing rod", detail: "a third-class lever used to cast and reel in a line", confusedWith: ["Shovel", "Kitchen tongs"] },
      { letter: "I", name: "Kitchen tongs", detail: "a third-class lever used to grip and lift food", confusedWith: ["Fishing rod", "Pliers"] },
    ],
  },
  reflectionInPlaneMirror: {
    visual: {
      type: "photo-diagram",
      image: "/images/grade6/sci-g6-plane-mirror-reflection.webp",
      alt: "A ray diagram showing an object, a plane mirror, its virtual image, the incident ray and the reflected ray, labelled by letter",
    },
    parts: [
      { letter: "A", name: "Object", detail: "the real arrow standing in front of the mirror", confusedWith: ["Virtual image (behind mirror)"] },
      { letter: "B", name: "Plane mirror", detail: "the flat reflecting surface", confusedWith: ["Object"] },
      { letter: "C", name: "Virtual image (behind mirror)", detail: "appears the same distance behind the mirror as the object is in front of it", confusedWith: ["Object"] },
      { letter: "D", name: "Incident ray", detail: "the ray of light travelling from the object toward the mirror", confusedWith: ["Reflected ray"] },
      { letter: "E", name: "Reflected ray", detail: "the ray of light bouncing off the mirror toward the eye", confusedWith: ["Incident ray"] },
    ],
    skippedLabels: "This ray diagram proved the hardest image in the batch to get perfectly clean across repeated regenerations — the rendered image may show a couple of stray extra marks near the ray-mirror intersection beyond the 5 intended circles. Treat A/B/C/D/E as defined here (matching the design intent) rather than trying to reconcile every mark visible in the image; if reused elsewhere, a visual QA pass to confirm the rendered circles still read unambiguously is recommended before shipping this specific asset.",
  },
  howEclipsesForm: {
    visual: {
      type: "photo-diagram",
      image: "/images/grade6/sci-g6-eclipse-formation.webp",
      alt: "Two panels showing how a solar eclipse and a lunar eclipse form, with the Sun, Moon, Earth and shadow labelled by letter in each panel",
    },
    parts: [
      { letter: "A", name: "Sun (solar eclipse panel)", detail: "the light source in the solar eclipse arrangement", confusedWith: ["Sun (lunar eclipse panel)"] },
      { letter: "B", name: "Moon (solar eclipse position)", detail: "sits directly between the Sun and Earth during a solar eclipse", confusedWith: ["Earth (lunar eclipse position)"] },
      { letter: "C", name: "Shadow touching Earth (umbra)", detail: "the Moon's shadow falling on Earth's surface during a solar eclipse", confusedWith: ["Shadow on the Moon (umbra)"] },
      { letter: "D", name: "Earth (lunar eclipse position)", detail: "sits directly between the Sun and the Moon during a lunar eclipse", confusedWith: ["Moon (solar eclipse position)"] },
      { letter: "E", name: "Sun (lunar eclipse panel)", detail: "the light source in the lunar eclipse arrangement", confusedWith: ["Sun (solar eclipse panel)"] },
      { letter: "F", name: "Shadow on the Moon (umbra)", detail: "Earth's shadow falling on the Moon during a lunar eclipse", confusedWith: ["Shadow touching Earth (umbra)"] },
    ],
  },
  slopesMakingWorkEasier: {
    visual: {
      type: "photo-diagram",
      image: "/images/grade6/sci-g6-slope-types-gallery.webp",
      alt: "A ramp, staircase, ladder, wedge, sloped roof, winding road, lorry loading plank, escalator, cableway and elevator, labelled by letter",
    },
    parts: [
      { letter: "A", name: "Ramp", detail: "a fixed inclined plane used to move between two levels without steps", confusedWith: ["Staircase"] },
      { letter: "B", name: "Staircase", detail: "a series of small fixed steps used to move between levels", confusedWith: ["Ramp", "Ladder"] },
      { letter: "C", name: "Ladder", detail: "a portable inclined structure used to reach a high point", confusedWith: ["Staircase"] },
      { letter: "D", name: "Wedge (axe head)", detail: "a slope brought to a sharp point, used to split material apart", confusedWith: ["Sloped roof"] },
      { letter: "E", name: "Sloped roof", detail: "an inclined surface that lets rain run off a building", confusedWith: ["Wedge (axe head)"] },
      { letter: "F", name: "Road winding uphill", detail: "a road built in bends to make a steep climb gentler", confusedWith: ["Ramp"] },
      { letter: "G", name: "Loading a lorry (loading plank)", detail: "a slope used to roll heavy loads up into a vehicle", confusedWith: ["Ramp"] },
      { letter: "H", name: "Escalator", detail: "a motor-powered moving staircase, not a plain fixed slope", confusedWith: ["Elevator/lift", "Cableway"] },
      { letter: "I", name: "Cableway", detail: "a motor-powered cabin that travels along a sloped cable", confusedWith: ["Escalator"] },
      { letter: "J", name: "Elevator/lift", detail: "a motor-powered cabin that travels straight up and down a shaft", confusedWith: ["Escalator", "Cableway"] },
    ],
  },
  mainPhysicalFeatures: {
    visual: {
      type: "photo-diagram",
      image: "/images/grade6/ss-g6-physical-features.webp",
      alt: "A volcanic mountain, block mountain, rift valley, lake and plain, labelled by letter",
    },
    parts: [
      { letter: "A", name: "Volcanic mountain", detail: "a cone-shaped mountain built up from erupted material", confusedWith: ["Block mountain"] },
      { letter: "B", name: "Block mountain", detail: "formed by faulting, with a flat top and steep straight sides, not by volcanic eruption", confusedWith: ["Volcanic mountain"] },
      { letter: "C", name: "Rift valley", detail: "a broad valley floor between two steep parallel escarpment walls", confusedWith: ["Block mountain"] },
      { letter: "D", name: "Lake", detail: "a body of freshwater surrounded by land", confusedWith: ["Plain"] },
      { letter: "E", name: "Plain", detail: "a wide, flat, grassy area stretching to the horizon", confusedWith: ["Lake"] },
    ],
  },
  vegetationZonesEasternAfrica: {
    visual: {
      type: "photo-diagram",
      image: "/images/grade6/ss-g6-vegetation-zones.webp",
      alt: "Tropical rainforest, savanna grassland, desert scrub and mountain vegetation, labelled by letter",
    },
    parts: [
      { letter: "A", name: "Tropical rainforest", detail: "dense tall trees and thick canopy, found where rainfall is highest", confusedWith: ["Savanna grassland"] },
      { letter: "B", name: "Savanna grassland", detail: "open grassland with scattered acacia trees", confusedWith: ["Desert/semi-desert scrub", "Tropical rainforest"] },
      { letter: "C", name: "Desert/semi-desert scrub", detail: "sparse thorny bushes on dry, barren soil, found where rainfall is lowest", confusedWith: ["Savanna grassland"] },
      { letter: "D", name: "Mountain vegetation", detail: "vegetation that changes with altitude, from forest at the base to shrubby moorland higher up", confusedWith: ["Tropical rainforest"] },
    ],
  },
  historicBuiltEnvironments: {
    visual: {
      type: "photo-diagram",
      image: "/images/grade6/ss-g6-historic-built-environments.webp",
      alt: "A museum, a monument and a historical building, labelled by letter",
    },
    parts: [
      { letter: "A", name: "Museum", detail: "a building that houses and displays collections of historical objects and artefacts", confusedWith: ["Historical building"] },
      { letter: "B", name: "Monument", detail: "a freestanding structure that commemorates a person or event, rather than housing a collection", confusedWith: ["Museum"] },
      { letter: "C", name: "Historical building", detail: "an old traditional building preserved as heritage, such as a stone house or fort", confusedWith: ["Museum"] },
    ],
  },
  mainTransportNetworks: {
    visual: {
      type: "photo-diagram",
      image: "/images/grade6/ss-g6-transport-modes.webp",
      alt: "A truck on a road, a train, an aeroplane and a ship, labelled by letter",
    },
    parts: [
      { letter: "A", name: "Road transport", detail: "moves goods and people along paved roads by vehicle", confusedWith: ["Railway transport"] },
      { letter: "B", name: "Railway transport", detail: "moves goods and people along fixed tracks by train", confusedWith: ["Road transport"] },
      { letter: "C", name: "Air transport", detail: "the fastest mode for long-distance passenger or urgent cargo trips", confusedWith: ["Water transport"] },
      { letter: "D", name: "Water transport", detail: "best suited for moving large, heavy cargo between coastal ports", confusedWith: ["Air transport"] },
    ],
  },
  miningEasternAfrica: {
    visual: {
      type: "photo-diagram",
      image: "/images/grade6/ss-g6-mining-eastern-africa.webp",
      alt: "Soda ash extraction, gold mining and limestone quarrying, labelled by letter",
    },
    parts: [
      { letter: "A", name: "Soda ash extraction (Kenya)", detail: "extracted from an alkaline lake shoreline, not dug out of rock", confusedWith: ["Gold mining (Tanzania)"] },
      { letter: "B", name: "Gold mining (Tanzania)", detail: "extracted from an open-pit excavation dug into rock", confusedWith: ["Limestone quarrying (Uganda)"] },
      { letter: "C", name: "Limestone quarrying (Uganda)", detail: "extracted by cutting pale rock in stepped terraces", confusedWith: ["Gold mining (Tanzania)"] },
    ],
  },
  typesOfSoilErosion: {
    visual: {
      type: "photo-diagram",
      image: "/images/grade6/ag-g6-soil-erosion-types.webp",
      alt: "Gulley, rill, splash and sheet erosion, labelled by letter",
    },
    parts: [
      { letter: "A", name: "Gulley erosion", detail: "the most severe form — a deep, wide channel cut into the land, needing structures like check dams to control", confusedWith: ["Rill erosion"] },
      { letter: "B", name: "Rill erosion", detail: "several narrow, shallow channels running down a slope, smaller than a gulley", confusedWith: ["Gulley erosion", "Sheet erosion"] },
      { letter: "C", name: "Splash erosion", detail: "caused directly by the impact of falling raindrops, not by flowing water", confusedWith: ["Sheet erosion"] },
      { letter: "D", name: "Sheet erosion", detail: "a thin, uniform layer of topsoil washed away with no visible channels", confusedWith: ["Rill erosion", "Splash erosion"] },
    ],
  },
  waterConservingSeedbeds: {
    visual: {
      type: "photo-diagram",
      image: "/images/grade6/ag-g6-water-conserving-seedbeds.webp",
      alt: "A sunken seedbed and shallow pits, labelled by letter",
    },
    parts: [
      { letter: "A", name: "Sunken seedbed", detail: "one continuous bed dug below ground level, conserving moisture across the whole bed", confusedWith: ["Shallow pits"] },
      { letter: "B", name: "Shallow pits", detail: "several separate small planting holes rather than one continuous sunken bed", confusedWith: ["Sunken seedbed"] },
    ],
  },
  wildlifeDeterrents: {
    visual: {
      type: "photo-diagram",
      image: "/images/grade6/ag-g6-wildlife-deterrents.webp",
      alt: "A mesh fence, thorny fence, safe trap, innovative light, sound device and deflector, labelled by letter",
    },
    parts: [
      { letter: "A", name: "Mesh fence", detail: "a physical wire barrier that keeps animals out of a field", confusedWith: ["Thorny fence"] },
      { letter: "B", name: "Thorny fence", detail: "a barrier made of dense thorny branches", confusedWith: ["Mesh fence"] },
      { letter: "C", name: "Safe trap", detail: "a humane cage that captures an animal without killing it", confusedWith: ["Mesh fence"] },
      { letter: "D", name: "Innovative light", detail: "a motion-sensor light used to scare animals away at night without a physical barrier", confusedWith: ["Innovative sound device"] },
      { letter: "E", name: "Innovative sound device", detail: "a noise-maker used to scare animals away without a physical barrier", confusedWith: ["Innovative light"] },
      { letter: "F", name: "Deflector", detail: "spinning reflective strips that catch light to startle animals away", confusedWith: ["Innovative light"] },
    ],
  },
  routinePracticesRearingSmallAnimals: {
    visual: {
      type: "photo-diagram",
      image: "/images/grade6/ag-g6-small-animal-rearing-routine.webp",
      alt: "A rabbit hutch with its housing, feeding trough, water dispenser, sanitation tools and parasite-control tools, labelled by letter",
    },
    parts: [
      { letter: "A", name: "Housing (hutch)", detail: "shelters the animal and protects it from weather and predators", confusedWith: ["Sanitation (cleaning tools)"] },
      { letter: "B", name: "Feeding (feed trough)", detail: "holds food such as pellets and hay for the animal", confusedWith: ["Watering (water dispenser)"] },
      { letter: "C", name: "Watering (water dispenser)", detail: "provides a constant supply of clean drinking water", confusedWith: ["Feeding (feed trough)"] },
      { letter: "D", name: "Sanitation (cleaning tools)", detail: "used to remove waste and refresh bedding to keep the hutch clean", confusedWith: ["Parasite control", "Housing (hutch)"] },
      { letter: "E", name: "Parasite control", detail: "grooming and treatment tools used when an animal is scratching or losing fur", confusedWith: ["Sanitation (cleaning tools)"] },
    ],
  },
  preservingFruitsVegetablesSunDrying: {
    visual: {
      type: "photo-diagram",
      image: "/images/grade6/ag-g6-crop-preservation-sun-drying.webp",
      alt: "Dried fruit and vegetable pieces on a raised sun-drying rack, with a rack leg, labelled by letter",
    },
    parts: [
      { letter: "A", name: "Dried fruit pieces", detail: "fruit slices spread thinly on the rack to dry in the sun", confusedWith: ["Dried vegetable pieces"] },
      { letter: "B", name: "Dried vegetable pieces", detail: "vegetable pieces spread thinly on the rack to dry in the sun", confusedWith: ["Dried fruit pieces"] },
      { letter: "C", name: "Sun-drying rack (leg)", detail: "raises the drying surface off the ground, allowing air to circulate underneath", confusedWith: ["Dried fruit pieces"] },
    ],
  },
  cookingMethodsStewingBaking: {
    visual: {
      type: "photo-diagram",
      image: "/images/grade6/ag-g6-cooking-methods-stewing-baking.webp",
      alt: "A simmering stew pot, hands rubbing flour and fat, and a baked result in an oven, labelled by letter",
    },
    parts: [
      { letter: "A", name: "Stewing (simmering pot)", detail: "cooking food slowly in liquid over gentle heat", confusedWith: ["Baked result (oven)"] },
      { letter: "B", name: "Rubbing-in (flour and fat by hand)", detail: "rubbing fat into flour with the fingertips until it looks like fine breadcrumbs, the first step of baking", confusedWith: ["Baked result (oven)"] },
      { letter: "C", name: "Baked result (oven)", detail: "the finished food after baking in a hot oven", confusedWith: ["Rubbing-in (flour and fat by hand)"] },
    ],
  },
  identifyingRemovingCommonStains: {
    visual: {
      type: "photo-diagram",
      image: "/images/grade6/ag-g6-stain-identification-and-removal.webp",
      alt: "A blood stain, a grass stain and stain-removal tools on a white garment, labelled by letter",
    },
    parts: [
      { letter: "A", name: "Blood stain", detail: "best treated with cold water — hot water sets the protein in blood, making it harder to remove", confusedWith: ["Grass stain"] },
      { letter: "B", name: "Grass stain", detail: "a green plant-based stain, treated differently from a protein-based blood stain", confusedWith: ["Blood stain"] },
      { letter: "C", name: "Stain-removal tools", detail: "soap, a scrub brush and water used to remove stains", confusedWith: ["Blood stain"] },
    ],
  },
  crochetStitchesHouseholdArticles: {
    visual: {
      type: "photo-diagram",
      image: "/images/grade6/ag-g6-crochet-stitches-and-articles.webp",
      alt: "Single crochet and double crochet stitch swatches, a floor mat, a cleaning rug and a surface wiper, labelled by letter",
    },
    parts: [
      { letter: "A", name: "Single crochet stitch swatch", detail: "a dense, tight, short-looped stitch texture", confusedWith: ["Double crochet stitch swatch"] },
      { letter: "B", name: "Double crochet stitch swatch", detail: "a taller, more open weave with larger loops than single crochet", confusedWith: ["Single crochet stitch swatch"] },
      { letter: "C", name: "Crocheted mat", detail: "a round household article made using crochet stitches", confusedWith: ["Crocheted cleaning rug"] },
      { letter: "D", name: "Crocheted cleaning rug", detail: "a folded household article used for cleaning", confusedWith: ["Crocheted surface wiper", "Crocheted mat"] },
      { letter: "E", name: "Crocheted surface wiper", detail: "a small household article used to wipe surfaces", confusedWith: ["Crocheted cleaning rug"] },
    ],
  },
  typesOfMoistBedGardens: {
    visual: {
      type: "photo-diagram",
      image: "/images/grade6/ag-g6-moist-bed-garden-types.webp",
      alt: "A sunken moist bed and a raised moist bed, labelled by letter",
    },
    parts: [
      { letter: "A", name: "Sunken moist bed", detail: "dug below ground level, which can waterlog in heavy rainfall", confusedWith: ["Raised moist bed"] },
      { letter: "B", name: "Raised moist bed", detail: "built above ground level, which drains excess water better in heavy rainfall", confusedWith: ["Sunken moist bed"] },
    ],
  },
  partsOfStringInstrument: {
    visual: {
      type: "photo-diagram",
      image: "/images/grade6/ca-g6-string-instrument-parts.webp",
      alt: "A generic fiddle-type string instrument with its body, string, tuning peg, bridge and bow labelled by letter",
    },
    parts: [
      { letter: "A", name: "Resonator/body", detail: "the hollow wooden body that amplifies the string's vibration into sound", confusedWith: ["Bridge"] },
      { letter: "B", name: "String", detail: "vibrates when plucked or bowed to produce a musical note", confusedWith: ["Tuning peg"] },
      { letter: "C", name: "Tuning peg", detail: "tightened or loosened to change the string's pitch", confusedWith: ["Bridge"] },
    ],
    skippedLabels: "Letters D and E were intended for the bridge and the bow, but repeated regenerations placed them ambiguously (sometimes on the fingerboard, sometimes split between the tailpiece and the separate bow object) rather than cleanly on one distinct part each. Only A, B and C (body, string, tuning peg) are confidently single-referent and safe to quiz on; bridge and bow should be covered in question explanation text rather than as their own hotspot letters until this image gets a cleaner regeneration.",
  },
  stipplingVsShading: {
    visual: {
      type: "photo-diagram",
      image: "/images/grade6/ca-g6-stippling-vs-shading.webp",
      alt: "Two identical drawings, one shaded with stippling dots and one with hatching lines, labelled by letter",
    },
    parts: [
      { letter: "A", name: "Stippling technique (dots)", detail: "builds up tone using many small dots, denser in darker areas", confusedWith: ["Shading/hatching technique (lines)"] },
      { letter: "B", name: "Shading/hatching technique (lines)", detail: "builds up tone using continuous pencil lines rather than dots", confusedWith: ["Stippling technique (dots)"] },
    ],
  },
  theColourWheel: {
    visual: {
      type: "photo-diagram",
      image: "/images/grade6/ca-g6-colour-wheel-classification.webp",
      alt: "A 12-segment colour wheel with a primary, a secondary and a tertiary colour segment labelled by letter",
    },
    parts: [
      { letter: "A", name: "Primary colours (red, yellow, blue)", detail: "the 3 base colours that cannot be made by mixing other colours", confusedWith: ["Secondary colours (green, orange, purple)"] },
      { letter: "B", name: "Secondary colours (green, orange, purple)", detail: "made by mixing two primary colours together", confusedWith: ["Primary colours (red, yellow, blue)", "Tertiary colours (in-between mixes)"] },
      { letter: "C", name: "Tertiary colours (in-between mixes)", detail: "made by mixing a primary colour with a neighbouring secondary colour", confusedWith: ["Secondary colours (green, orange, purple)"] },
    ],
  },
  musicalNoteValues: {
    visual: {
      type: "photo-diagram",
      image: "/images/grade6/ca-g6-note-values-rhythm.webp",
      alt: "A semibreve, dotted minim, minim, crotchet, quaver and rest on a musical staff, labelled by letter",
    },
    parts: [
      { letter: "A", name: "Semibreve", detail: "a hollow note-head with no stem — the longest-lasting note value shown", confusedWith: ["Minim"] },
      { letter: "B", name: "Dotted minim", detail: "a hollow note-head with a stem and a dot, lasting one and a half times as long as a plain minim", confusedWith: ["Minim"] },
      { letter: "C", name: "Minim", detail: "a hollow note-head with a stem and no dot", confusedWith: ["Semibreve", "Dotted minim"] },
      { letter: "D", name: "Crotchet", detail: "a solid filled note-head with a stem and no flag", confusedWith: ["Quaver"] },
      { letter: "E", name: "Quaver", detail: "a solid filled note-head with a stem and one flag", confusedWith: ["Crotchet"] },
      { letter: "F", name: "Rest", detail: "a silence in the music — not a note at all, shown as a zigzag symbol", confusedWith: ["Crotchet"] },
    ],
  },
  blockPrintingRepeatPattern: {
    visual: {
      type: "photo-diagram",
      image: "/images/grade6/ca-g6-block-print-pattern.webp",
      alt: "A carved printing block, its geometric motif, and a printed repeat pattern on fabric, labelled by letter",
    },
    parts: [
      { letter: "A", name: "Printing block", detail: "the carved block used to stamp a design onto fabric", confusedWith: ["Geometric motif (carved into block face)"] },
      { letter: "B", name: "Geometric motif (carved into block face)", detail: "the single raised shape carved into the block, which prints one repeat unit", confusedWith: ["Printing block"] },
      { letter: "C", name: "Printed repeat pattern (on fabric)", detail: "the single motif printed many times, evenly spaced across the fabric", confusedWith: ["Geometric motif (carved into block face)"] },
    ],
  },
  partsOfSerratedCardLoom: {
    visual: {
      type: "photo-diagram",
      image: "/images/grade6/ca-g6-serrated-card-loom-weaving.webp",
      alt: "A serrated card loom mid-weaving, with its frame, notches, warp threads, shuttle and woven section labelled by letter",
    },
    parts: [
      { letter: "A", name: "Cardboard frame", detail: "the stiff board that the whole loom is built on", confusedWith: ["Serrated notches"] },
      { letter: "B", name: "Serrated notches", detail: "hold the warp threads evenly spaced and under tension while weaving", confusedWith: ["Cardboard frame"] },
      { letter: "C", name: "Warp threads", detail: "the fixed vertical threads strung between the notches, which the weft is woven through", confusedWith: ["Woven fabric section"] },
      { letter: "D", name: "Shuttle with weft yarn", detail: "carries the weft yarn over and under the warp threads to build the weave", confusedWith: ["Warp threads"] },
      { letter: "E", name: "Woven fabric section", detail: "the completed rows of plain weave, made by passing the shuttle back and forth", confusedWith: ["Warp threads"] },
    ],
  },
  kodalyHandSigns: {
    visual: {
      type: "photo-diagram",
      image: "/images/grade6/ca-g6-kodaly-hand-signs.webp",
      alt: "8 Kodaly hand signs for the sol-fa scale from doh to the upper doh, labelled by letter",
    },
    parts: [
      { letter: "A", name: "Doh", detail: "shown as a closed fist, the lowest hand sign in the scale", confusedWith: ["Doh (upper octave)"] },
      { letter: "B", name: "Re", detail: "shown as a flat hand angled diagonally upward", confusedWith: ["Mi"] },
      { letter: "C", name: "Mi", detail: "shown as a flat, level, horizontal hand", confusedWith: ["Re"] },
      { letter: "D", name: "Fa", detail: "shown as a fist with the thumb pointing downward", confusedWith: ["Doh"] },
      { letter: "E", name: "Sol", detail: "shown as an open flat hand held upright", confusedWith: ["La"] },
      { letter: "F", name: "La", detail: "shown as a relaxed, gently drooping hand", confusedWith: ["Sol"] },
      { letter: "G", name: "Ti", detail: "shown as a hand with the index finger pointing upward", confusedWith: ["Doh (upper octave)"] },
      { letter: "H", name: "Doh (upper octave)", detail: "the highest hand sign in the scale, held above all the others", confusedWith: ["Doh", "Ti"] },
    ],
  },
  recorderFingerPositions: {
    visual: {
      type: "photo-diagram",
      image: "/images/grade6/ca-g6-descant-recorder-fingering.webp",
      alt: "Three descant recorders showing the fingering for a low, middle and high note, labelled X, Y and Z",
    },
    parts: [
      { letter: "X", name: "Fingering for a low note (most holes covered)", detail: "almost every finger hole is covered to produce a low-pitched note", confusedWith: ["Fingering for a middle note (half covered)"] },
      { letter: "Y", name: "Fingering for a middle note (half covered)", detail: "roughly half the finger holes are covered", confusedWith: ["Fingering for a low note (most holes covered)", "Fingering for a high note (few holes covered)"] },
      { letter: "Z", name: "Fingering for a high note (few holes covered)", detail: "only the top one or two holes are covered to produce a high-pitched note", confusedWith: ["Fingering for a middle note (half covered)"] },
    ],
  },
  categoriesInstrumentalEnsembles: {
    visual: {
      type: "photo-diagram",
      image: "/images/grade6/ca-g6-instrumental-ensemble-categories.webp",
      alt: "A drum, a wind pipe and a string fiddle, one representing each category of instrumental ensemble, labelled by letter",
    },
    parts: [
      { letter: "A", name: "Percussion instrument", detail: "produces sound by being struck", confusedWith: ["Wind instrument"] },
      { letter: "B", name: "Wind instrument", detail: "produces sound by being blown", confusedWith: ["Percussion instrument"] },
      { letter: "C", name: "String instrument", detail: "produces sound from a vibrating string, played with a bow", confusedWith: ["Wind instrument"] },
    ],
  },
  slabTechniqueClayVase: {
    visual: {
      type: "photo-diagram",
      image: "/images/grade6/ca-g6-pottery-slab-technique-vase.webp",
      alt: "A slab-built clay vase with its joint seam, burnished section and stamped section labelled by letter",
    },
    parts: [
      { letter: "A", name: "Slab-joint seam", detail: "the visible line where two clay slabs were joined to build the vase", confusedWith: ["Burnished (smooth polished) section"] },
      { letter: "B", name: "Burnished (smooth polished) section", detail: "made smooth and slightly shiny by rubbing the clay", confusedWith: ["Stamped (textured) section"] },
      { letter: "C", name: "Stamped (textured) section", detail: "made by pressing a tool into the clay to leave a repeated pattern", confusedWith: ["Burnished (smooth polished) section"] },
    ],
  },
  viungoVyaMwiliVyaNdani: {
    visual: {
      type: "photo-diagram",
      image: "/images/grade6/ki-g6-viungo-vya-mwili-vya-ndani.webp",
      alt: "Picha tisa zenye ubongo, moyo, mapafu, ini, wengu, figo, kibofu, mfupa na mshipa, kila mmoja ukiwa na herufi",
    },
    parts: [
      { letter: "A", name: "Ubongo (Brain)", detail: "hudhibiti mwili na fikra", confusedWith: ["Moyo (Heart)"] },
      { letter: "B", name: "Moyo (Heart)", detail: "husukuma damu mwilini mzima", confusedWith: ["Mapafu (Lungs)"] },
      { letter: "C", name: "Mapafu (Lungs)", detail: "hutumika kupumua, kubadilishana hewa", confusedWith: ["Moyo (Heart)"] },
      { letter: "D", name: "Ini (Liver)", detail: "husafisha sumu mwilini", confusedWith: ["Wengu (Spleen)"] },
      { letter: "E", name: "Wengu (Spleen)", detail: "husaidia kuchuja damu na kupambana na maambukizi", confusedWith: ["Ini (Liver)"] },
      { letter: "F", name: "Figo (Kidneys)", detail: "huchuja taka kutoka kwenye damu na kutengeneza mkojo", confusedWith: ["Kibofu (Bladder)"] },
      { letter: "G", name: "Kibofu (Bladder)", detail: "huhifadhi mkojo kabla ya kutolewa mwilini", confusedWith: ["Figo (Kidneys)"] },
      { letter: "H", name: "Mfupa (a bone)", detail: "hutoa muundo na nguvu kwa mwili", confusedWith: ["Mshipa (a blood vessel)"] },
      { letter: "I", name: "Mshipa (a blood vessel)", detail: "hubeba damu kwenda na kutoka sehemu mbalimbali za mwili", confusedWith: ["Mfupa (a bone)"] },
    ],
  },
  wanyamaWaMajini: {
    visual: {
      type: "photo-diagram",
      image: "/images/grade6/ki-g6-wanyama-wa-majini-mchezo-wa-kuigiza.webp",
      alt: "Kiboko, samaki, mamba, chura na kasa, kila mmoja akiwa na herufi",
    },
    parts: [
      { letter: "A", name: "Kiboko (Hippopotamus)", detail: "mnyama mkubwa wa majini mwenye mwili mnene", confusedWith: ["Mamba (Crocodile)"] },
      { letter: "B", name: "Samaki (Fish)", detail: "huishi majini na huvua kwa mapezi", confusedWith: ["Chura (Frog)"] },
      { letter: "C", name: "Mamba (Crocodile)", detail: "ana meno makali na huwinda karibu na maji", confusedWith: ["Kiboko (Hippopotamus)"] },
      { letter: "D", name: "Chura (Frog)", detail: "huishi nchi kavu na majini, huruka kwa miguu yake ya nyuma", confusedWith: ["Samaki (Fish)"] },
      { letter: "E", name: "Kasa (Turtle)", detail: "ana ganda gumu mgongoni linalomlinda", confusedWith: ["Kiboko (Hippopotamus)"] },
    ],
  },
  foodsAndDrinks: {
    visual: {
      type: "photo-diagram",
      image: "/images/grade6/fl-g6-food-items-gallery.webp",
      alt: "Roast chicken, grilled meat, a bowl of fruit, a plate of vegetables and a fizzy drink, labelled by letter",
    },
    parts: [
      { letter: "A", name: "Roast chicken", detail: "a cooked meat dish", confusedWith: ["Grilled meat (pork chop)"] },
      { letter: "B", name: "Grilled meat (pork chop)", detail: "another cooked meat dish", confusedWith: ["Roast chicken"] },
      { letter: "C", name: "Bowl of mixed fruit", detail: "a healthy food item", confusedWith: ["Plate of vegetables"] },
      { letter: "D", name: "Plate of vegetables", detail: "a healthy food item", confusedWith: ["Bowl of mixed fruit"] },
      { letter: "E", name: "Glass of fizzy soft drink", detail: "a sugary drink, not a healthy food choice", confusedWith: ["Bowl of mixed fruit"] },
    ],
  },
  weatherConditions: {
    visual: {
      type: "photo-diagram",
      image: "/images/grade6/fl-g6-weather-symbols.webp",
      alt: "Icons for sunny, rainy, windy, cloudy and stormy weather, labelled by letter",
    },
    parts: [
      { letter: "A", name: "Sunny (fine weather)", detail: "friendly weather, good for a school outing", confusedWith: ["Stormy (bad/harsh weather)"] },
      { letter: "B", name: "Rainy", detail: "weather with falling rain", confusedWith: ["Cloudy"] },
      { letter: "C", name: "Windy", detail: "weather with strong moving air", confusedWith: ["Rainy"] },
      { letter: "D", name: "Cloudy", detail: "weather with the sky covered by clouds", confusedWith: ["Rainy"] },
      { letter: "E", name: "Stormy (bad/harsh weather)", detail: "unfriendly weather, not suitable for a school outing", confusedWith: ["Sunny (fine weather)"] },
    ],
  },
  schoolFacilities: {
    visual: {
      type: "photo-diagram",
      image: "/images/grade6/fl-g6-school-facilities-cutaway.webp",
      alt: "A school building cutaway showing the library, canteen, toilets, staff room, infirmary and classroom, labelled by letter",
    },
    parts: [
      { letter: "A", name: "Library", detail: "identified by its bookshelves and reading table", confusedWith: ["Classroom"] },
      { letter: "B", name: "Canteen/dining hall", detail: "identified by its dining tables, benches and serving counter", confusedWith: ["Staff/teachers' room"] },
      { letter: "C", name: "Toilets", detail: "identified by its wash basin, mirror and cubicle doors", confusedWith: ["Infirmary/sick bay"] },
      { letter: "D", name: "Staff/teachers' room", detail: "identified by its desks, office chairs and filing cabinet", confusedWith: ["Canteen/dining hall"] },
      { letter: "E", name: "Infirmary/sick bay", detail: "identified by its bed and medical cabinet with a red cross", confusedWith: ["Toilets"] },
      { letter: "F", name: "Classroom", detail: "identified by its rows of desks and chalkboard", confusedWith: ["Library"] },
    ],
  },
  farmTools: {
    visual: {
      type: "photo-diagram",
      image: "/images/grade6/il-g6-farm-tools-gallery.webp",
      alt: "A jembe, slasher, rake, tractor and ox-drawn plough, labelled by letter",
    },
    parts: [
      { letter: "A", name: "Jembe (hoe)", detail: "a hand tool with a broad blade, used for digging soil", confusedWith: ["Slasher"] },
      { letter: "B", name: "Slasher", detail: "a curved hand tool used for cutting weeds and grass", confusedWith: ["Jembe (hoe)"] },
      { letter: "C", name: "Rake", detail: "a long-handled tool with tines, used to gather or level soil", confusedWith: ["Slasher"] },
      { letter: "D", name: "Tractor (modern tool)", detail: "a modern powered machine used for heavy farm work", confusedWith: ["Ox-drawn plough (traditional tool)"] },
      { letter: "E", name: "Ox-drawn plough (traditional tool)", detail: "a traditional implement pulled by oxen to turn soil", confusedWith: ["Tractor (modern tool)"] },
    ],
  },
  healthAndMedicalItems: {
    visual: {
      type: "photo-diagram",
      image: "/images/grade6/il-g6-health-medical-items-gallery.webp",
      alt: "An ambulance, a syringe, a bottle of medicine, a bandage roll and a stethoscope, labelled by letter",
    },
    parts: [
      { letter: "A", name: "Ambulance", detail: "a vehicle used to rush a sick or injured person to hospital", confusedWith: ["Stethoscope (doctor/nurse)"] },
      { letter: "B", name: "Syringe", detail: "used to give an injection", confusedWith: ["Medicine (bottle of pills)"] },
      { letter: "C", name: "Medicine (bottle of pills)", detail: "used to treat an illness", confusedWith: ["Syringe"] },
      { letter: "D", name: "Bandage roll", detail: "used to dress and protect a wound", confusedWith: ["Medicine (bottle of pills)"] },
      { letter: "E", name: "Stethoscope (doctor/nurse)", detail: "used by a doctor or nurse to listen to a patient's heartbeat", confusedWith: ["Ambulance"] },
    ],
  },
  careersAndProfessions: {
    visual: {
      type: "photo-diagram",
      image: "/images/grade6/il-g6-careers-professions-gallery.webp",
      alt: "Objects representing a teacher, pilot, doctor, farmer, artist, driver and lawyer, labelled by letter",
    },
    parts: [
      { letter: "A", name: "Teacher (chalkboard and pointer)", detail: "identified by a chalkboard and pointer stick", confusedWith: ["Artist (paintbrush and palette)"] },
      { letter: "B", name: "Pilot (cap and wings badge)", detail: "identified by a pilot's cap with a wings badge", confusedWith: ["Driver (steering wheel and cap)"] },
      { letter: "C", name: "Doctor (stethoscope and white coat)", detail: "identified by a stethoscope and white coat", confusedWith: ["Farmer (hoe and sunhat)"] },
      { letter: "D", name: "Farmer (hoe and sunhat)", detail: "identified by a hoe and sunhat — the same tool taught in the Farm Tools theme", confusedWith: ["Doctor (stethoscope and white coat)"] },
      { letter: "E", name: "Artist (paintbrush and palette)", detail: "identified by a paintbrush and paint palette", confusedWith: ["Teacher (chalkboard and pointer)"] },
      { letter: "F", name: "Driver (steering wheel and cap)", detail: "identified by a steering wheel and driver's cap", confusedWith: ["Pilot (cap and wings badge)"] },
      { letter: "G", name: "Lawyer (gavel and legal robe)", detail: "identified by a gavel and legal robe, used in court", confusedWith: ["Doctor (stethoscope and white coat)"] },
    ],
  },
  giftsOfNature: {
    visual: {
      type: "photo-diagram",
      image: "/images/grade6/hre-g6-gifts-of-nature.webp",
      alt: "A cow, peacock, horse, elephant, hawk, Garur and lion, labelled by letter",
    },
    parts: [
      { letter: "A", name: "Cow", detail: "an animal of religious importance across the four faiths", confusedWith: ["Horse"] },
      { letter: "B", name: "Peacock", detail: "a bird of religious importance across the four faiths", confusedWith: ["Hawk"] },
      { letter: "C", name: "Horse", detail: "an animal of religious importance across the four faiths", confusedWith: ["Cow"] },
      { letter: "D", name: "Elephant", detail: "an animal of religious importance across the four faiths", confusedWith: ["Cow"] },
      { letter: "E", name: "Hawk", detail: "a bird of religious importance across the four faiths", confusedWith: ["Garur (mythical eagle-like bird)"] },
      { letter: "F", name: "Garur (mythical eagle-like bird)", detail: "a divine bird from Hindu tradition, Vishnu's mount, distinct from the real hawk shown alongside it", confusedWith: ["Hawk"] },
      { letter: "G", name: "Lion", detail: "an animal of religious importance across the four faiths", confusedWith: ["Horse"] },
    ],
  },
} as const satisfies Record<string, PhotoImageEntry>;

export type Grade6PhotoImageKey = keyof typeof GRADE6_PHOTO_IMAGES;

export const GRADE9_PHOTO_IMAGES = {
  topoMapSymbols: {
    visual: {
      type: "photo-diagram",
      image: "/images/grade9/ss-g9-topographical-map-symbols.webp",
      alt: "Six topographical map symbols in labelled panels: settlement, forest, marsh, quarry, spot height and scale bar",
    },
    parts: [
      { letter: "A", name: "Settlement symbol", detail: "a cluster of small rectangular blocks marking a built-up area on a topographical map", confusedWith: ["Quarry symbol"] },
      { letter: "C", name: "Marsh/swamp symbol", detail: "a hatched patch marking wet, low-lying ground on a topographical map", confusedWith: ["Forest symbol"] },
      { letter: "D", name: "Quarry symbol", detail: "a pick-and-shovel icon marking a site where rock or minerals are excavated", confusedWith: ["Settlement symbol"] },
      { letter: "E", name: "Spot height", detail: "a dot with a number beside it giving the exact elevation of that point above sea level", confusedWith: ["Scale bar"] },
      { letter: "F", name: "Scale bar", detail: "a ruled bar used to convert a measured map distance into a real-world distance", confusedWith: ["Spot height"] },
    ],
    skippedLabels: "Letter B (forest symbol) omitted — across 4 generation attempts the forest panel never received its own circled letter/leader line even after every other panel was corrected, so it is left unassigned rather than guessed.",
  },
  riftValleyFormation: {
    visual: {
      type: "photo-diagram",
      image: "/images/grade9/ss-g9-land-forming-cross-section.webp",
      alt: "A geological cross-section showing the formation of a rift valley and block mountains, with fault line, tension arrows, rift valley floor, block mountain and escarpment labelled",
    },
    parts: [
      { letter: "A", name: "Fault line", detail: "a crack in the earth's crust along which rock blocks have moved relative to each other", confusedWith: ["Escarpment"] },
      { letter: "B", name: "Tension force", detail: "the pulling-apart force in the crust that creates faults and, eventually, a rift valley", confusedWith: ["Escarpment"] },
      { letter: "C", name: "Rift valley (sunken block)", detail: "the middle block of crust that sank down between two parallel faults", confusedWith: ["Block mountain (raised block)"] },
      { letter: "D", name: "Block mountain (raised block)", detail: "a block of crust left standing higher than its sunken neighbour after faulting", confusedWith: ["Rift valley (sunken block)"] },
      { letter: "E", name: "Escarpment", detail: "the steep cliff face marking the edge where the rift valley floor drops away from the raised block", confusedWith: ["Fault line"] },
    ],
  },
  riverProjectsAfrica: {
    visual: {
      type: "photo-diagram",
      image: "/images/grade9/ss-g9-river-projects-map.webp",
      alt: "A map of Africa marking two multi-purpose river projects: the River Tana projects in Kenya and the Aswan High Dam in Egypt",
    },
    parts: [
      { letter: "A", name: "River Tana projects (Kenya)", detail: "a multi-purpose river project in East Africa providing hydroelectric power and irrigation", confusedWith: ["Aswan High Dam (Egypt)"] },
      { letter: "B", name: "Aswan High Dam (Egypt)", detail: "a multi-purpose dam on the Nile in north-east Africa providing hydroelectric power, irrigation and flood control", confusedWith: ["River Tana projects (Kenya)"] },
    ],
  },
  africanHeritageSites: {
    visual: {
      type: "photo-diagram",
      image: "/images/grade9/ss-g9-heritage-sites-map.webp",
      alt: "Three African world heritage sites shown as illustrated scenes: the rock-hewn churches of Lalibela, Robben Island, and Victoria Falls",
    },
    parts: [
      { letter: "A", name: "Rock-Hewn Churches, Lalibela (Ethiopia)", detail: "churches carved directly downward into volcanic rock rather than built upward", confusedWith: ["Robben Island"] },
      { letter: "B", name: "Robben Island (South Africa)", detail: "a small island off Cape Town used as a prison, notably holding Nelson Mandela", confusedWith: ["Victoria Falls"] },
      { letter: "C", name: "Victoria Falls (Zambia/Zimbabwe border)", detail: "one of the world's largest waterfalls, on the Zambezi River on the Zambia/Zimbabwe border", confusedWith: ["Rock-Hewn Churches, Lalibela"] },
    ],
    skippedLabels: "Letter C's circle was rendered twice (once above and once below the third panel) after the map-position version of this image failed repeatedly and was redesigned as an iconic-imagery gallery — both instances correctly point at the same (correct) panel, so this is a harmless cosmetic duplicate rather than a mislabelling, and is not expected to confuse a click-hotspot question.",
  },
  mapScaleComparison: {
    visual: {
      type: "photo-diagram",
      image: "/images/grade9/ss-g9-map-scale-comparison.webp",
      alt: "Two map panels comparing a large-scale map (1:25,000) with fine detail against a small-scale map (1:500,000) covering a much wider area with less detail",
    },
    parts: [
      { letter: "A", name: "Large-scale map (1:25,000)", detail: "a small denominator scale showing a small area in lots of detail, e.g. individual buildings", confusedWith: ["Small-scale map (1:500,000)"] },
      { letter: "B", name: "Small-scale map (1:500,000)", detail: "a large denominator scale showing a large area with much less detail", confusedWith: ["Large-scale map (1:25,000)"] },
    ],
  },
  hardwoodSoftwoodGrain: {
    visual: {
      type: "photo-diagram",
      image: "/images/grade9/pretech-g9-wood-samples.webp",
      alt: "Six wood plank samples in labelled panels, three hardwood samples with dense tight grain and three softwood samples with lighter coarser grain",
    },
    parts: [
      { letter: "A", name: "Hardwood sample (dense, fine, tight grain)", detail: "denser, tighter, finer grain typical of slow-growing broadleaf hardwood trees", confusedWith: ["Softwood sample (lighter, coarser, more open grain)"] },
      { letter: "B", name: "Hardwood sample (dense, fine, tight grain)", detail: "denser, tighter, finer grain typical of slow-growing broadleaf hardwood trees", confusedWith: ["Softwood sample (lighter, coarser, more open grain)"] },
      { letter: "C", name: "Hardwood sample (dense, fine, tight grain)", detail: "denser, tighter, finer grain typical of slow-growing broadleaf hardwood trees", confusedWith: ["Softwood sample (lighter, coarser, more open grain)"] },
      { letter: "D", name: "Softwood sample (lighter, coarser, more open grain)", detail: "lighter, coarser, more open grain typical of faster-growing coniferous softwood trees", confusedWith: ["Hardwood sample (dense, fine, tight grain)"] },
      { letter: "E", name: "Softwood sample (lighter, coarser, more open grain)", detail: "lighter, coarser, more open grain typical of faster-growing coniferous softwood trees", confusedWith: ["Hardwood sample (dense, fine, tight grain)"] },
      { letter: "F", name: "Softwood sample (lighter, coarser, more open grain)", detail: "lighter, coarser, more open grain typical of faster-growing coniferous softwood trees", confusedWith: ["Hardwood sample (dense, fine, tight grain)"] },
    ],
  },
  raisedPlatformsGallery: {
    visual: {
      type: "photo-diagram",
      image: "/images/grade9/pretech-g9-raised-platforms-gallery.webp",
      alt: "Seven types of raised platforms and access equipment in labelled panels: ladder, trestle, steps, stand, mobile raised platform, work bench and ramp",
    },
    parts: [
      { letter: "A", name: "Ladder", detail: "a straight leaning structure of rungs used to reach a raised height", confusedWith: ["Steps"] },
      { letter: "B", name: "Trestle", detail: "a pair of angled supports with a plank laid across them to form a temporary working platform", confusedWith: ["Work bench"] },
      { letter: "C", name: "Steps", detail: "a short free-standing set of steps with a handrail for a fixed raised height", confusedWith: ["Ladder"] },
      { letter: "D", name: "Stand", detail: "a simple fixed platform raising a small working surface to about waist height", confusedWith: ["Work bench"] },
      { letter: "E", name: "Mobile raised platform", detail: "a wheeled scaffold-style platform with guard rails, used to move working height between jobs", confusedWith: ["Stand"] },
      { letter: "F", name: "Work bench", detail: "a sturdy bench with a vice attached, used to hold work steady at a comfortable height", confusedWith: ["Trestle"] },
      { letter: "G", name: "Ramp", detail: "a sloped surface connecting a lower level to a higher platform", confusedWith: ["Steps"] },
    ],
  },
} as const satisfies Record<string, PhotoImageEntry>;

export type Grade9PhotoImageKey = keyof typeof GRADE9_PHOTO_IMAGES;

export const GRADE8_PHOTO_IMAGES = {
  fireSafetyEquipment: {
    visual: {
      type: "photo-diagram",
      image: "/images/grade8/g8-sci-fire-extinguisher-types.webp",
      alt: "Five fire extinguisher types in labelled panels, distinguished by their colour-coded bands: water, foam, dry powder, CO2 and wet chemical",
    },
    parts: [
      { letter: "P", name: "Water extinguisher (red band)", detail: "an all-red cylinder with no extra colour band, used on Class A fires (wood, paper, cloth) — never on electrical or oil fires", confusedWith: ["Foam extinguisher (cream band)"] },
      { letter: "Q", name: "Foam extinguisher (cream band)", detail: "used on Class A and some Class B (flammable liquid) fires", confusedWith: ["Water extinguisher (red band)"] },
      { letter: "R", name: "Dry powder extinguisher (blue band)", detail: "used on Class C (gas) fires and general-purpose use", confusedWith: ["Carbon dioxide (CO2) extinguisher (black band)"] },
      { letter: "S", name: "Carbon dioxide (CO2) extinguisher (black band)", detail: "has a distinctive wide horn-shaped nozzle; safe on electrical fires because it leaves no residue", confusedWith: ["Dry powder extinguisher (blue band)"] },
      { letter: "T", name: "Wet chemical extinguisher (canary yellow band)", detail: "used on Class F fires (cooking oil/fat) — water would make a cooking-oil fire explosively worse", confusedWith: ["Water extinguisher (red band)"] },
    ],
  },
  energySourcesGallery: {
    visual: {
      type: "photo-diagram",
      image: "/images/grade8/g8-sci-energy-sources-gallery.webp",
      alt: "Energy sources in nature, shown in panels: solar panels, a geothermal steam field, firewood and crop waste, an oil pump-jack, and a natural gas flare stack",
    },
    parts: [
      { letter: "A", name: "Sunlight (solar panels)", detail: "a renewable energy source that never runs out", confusedWith: ["Wind (wind turbines)"] },
      { letter: "D", name: "Geothermal steam vents", detail: "a renewable energy source using heat from inside the earth", confusedWith: ["Biomass (firewood/crop waste)"] },
      { letter: "E", name: "Biomass (firewood/crop waste)", detail: "a renewable energy source burned directly or converted into fuel", confusedWith: ["Geothermal steam vents"] },
      { letter: "G", name: "Petroleum (an oil pump/barrels)", detail: "a non-renewable fossil fuel pumped from underground", confusedWith: ["Natural gas (a gas pipeline/flare stack)"] },
      { letter: "H", name: "Natural gas (a gas pipeline/flare stack)", detail: "a non-renewable fossil fuel, often piped and burned at a flare stack", confusedWith: ["Petroleum (an oil pump/barrels)"] },
    ],
    skippedLabels: "Wind (wind turbines), flowing water (hydroelectric dam) and coal (a coal pile) are drawn in this image but are not reliably letter-hotspottable — across repeated generation attempts, the letters intended for these three sources either landed on the wrong panel, on a blank panel, or failed to render at all. Only the 5 sources above (solar, geothermal, biomass, petroleum, natural gas) have a confirmed, uniquely-correct letter. The shipped skill's own text-based 'classify' branch remains the reliable way to test wind/hydro/coal.",
  },
  readingAPackagingLabel: {
    visual: {
      type: "photo-diagram",
      image: "/images/grade8/g8-sci-packaging-label.webp",
      alt: "A generic fictional food package labelled with its ingredients list, nutrition table, net weight, batch code and barcode",
    },
    parts: [
      { letter: "A", name: "Ingredients list", detail: "lists what the product is made of, in descending order by amount", confusedWith: ["Nutrition information table"] },
      { letter: "B", name: "Nutrition information table", detail: "shows the energy (calories) and nutrient content per serving", confusedWith: ["Ingredients list"] },
      { letter: "C", name: "Net weight", detail: "the actual quantity of product inside the package", confusedWith: ["Batch/production code"] },
      { letter: "E", name: "Batch/production code", detail: "identifies the specific production run, used to trace a product if there's a recall or fault", confusedWith: ["Expiry/best-before date"] },
      { letter: "F", name: "Barcode", detail: "scanned at a till to identify the product and its price", confusedWith: ["Net weight"] },
    ],
    skippedLabels: "Letter D (intended for the 'BEST BEFORE 2027' expiry date box) is omitted — across repeated attempts it kept attaching to an unrequested decorative graphic on the package's side edge instead of the actual date box. The expiry date is still visible on the package; it just isn't reliably hotspottable by its own letter in this generated image.",
  },
  topoMapMargins: {
    visual: {
      type: "photo-diagram",
      image: "/images/grade8/g8-ss-topographical-map-marginal-info.webp",
      alt: "Eight elements of a topographical map's marginal information in labelled panels: title, north arrow, scale bar, legend, grid lines, contour lines, a river line and a settlement symbol",
    },
    parts: [
      { letter: "A", name: "Title", detail: "names the mapped area and states the map's scale", confusedWith: ["Legend/key box"] },
      { letter: "B", name: "North arrow", detail: "shows which direction is north on the map", confusedWith: ["Grid reference lines"] },
      { letter: "C", name: "Scale bar", detail: "used to convert a measured map distance into a real-world distance", confusedWith: ["Grid reference lines"] },
      { letter: "D", name: "Legend/key box", detail: "explains what each symbol on the map represents", confusedWith: ["Title"] },
      { letter: "E", name: "Grid reference lines", detail: "used to pinpoint an exact location on the map using coordinates", confusedWith: ["Scale bar"] },
      { letter: "F", name: "Closely-spaced contour lines (steep slope)", detail: "lines drawn close together show the ground rising or falling steeply", confusedWith: ["Black hatched settlement symbol"] },
      { letter: "G", name: "Blue river line", detail: "shows the course of a river or stream across the map", confusedWith: ["Closely-spaced contour lines (steep slope)"] },
      { letter: "H", name: "Black hatched settlement symbol", detail: "represents a cluster of buildings/a built-up area", confusedWith: ["Closely-spaced contour lines (steep slope)"] },
    ],
  },
  poultryFoldFeatures: {
    visual: {
      type: "photo-diagram",
      image: "/images/grade8/g8-ag-poultry-fold-diagram.webp",
      alt: "A poultry fold structure with its movable base, raised slatted floor, wire mesh, ventilation gap and feeder/waterer space labelled",
    },
    parts: [
      { letter: "A", name: "Predator-proof wire mesh enclosure", detail: "fine wire mesh on the sides keeps out predators while still allowing airflow and light", confusedWith: ["Ventilation gaps/mesh sides"] },
      { letter: "B", name: "Movable/portable design (wheels or carrying handles)", detail: "lets the fold be moved to fresh ground regularly", confusedWith: ["Raised slatted floor"] },
      { letter: "C", name: "Raised slatted floor", detail: "keeps birds off the damp ground and lets droppings fall through, reducing disease and ammonia smell", confusedWith: ["Predator-proof wire mesh enclosure"] },
      { letter: "D", name: "Ventilation gaps/mesh sides", detail: "louvred or mesh gaps along the upper wall let stale air out and fresh air in", confusedWith: ["Predator-proof wire mesh enclosure"] },
      { letter: "E", name: "Built-in feeder and waterer space", detail: "a fixed trough and water container inside the fold, kept away from the floor slats", confusedWith: ["Movable/portable design (wheels or carrying handles)"] },
    ],
    skippedLabels: "Letter D's circle appears twice on the generated image — once correctly on the upper-wall ventilation gap, once spuriously on a diagonal structural brace that isn't one of the 5 named features. Only the ventilation-gap instance should be treated as the real D.",
  },
  innovativeAnimalWatererGallery: {
    visual: {
      type: "photo-diagram",
      image: "/images/grade8/g8-ag-innovative-waterer-gallery.webp",
      alt: "Four innovative animal waterer designs in labelled panels: a float-valve trough, a covered container with a narrow drinking hole, a raised drum reservoir, and a recycled-materials waterer",
    },
    parts: [
      { letter: "A", name: "Float valve (automatic self-filling mechanism)", detail: "a floating ball shuts off the water inlet once the trough is full, so it never needs manual refilling", confusedWith: ["Covered reservoir (closed main water store, e.g. a drum)"] },
      { letter: "B", name: "Narrow drinking opening (covered container, small access hole)", detail: "a small cut opening lets animals drink while keeping out dirt and reducing evaporation", confusedWith: ["Covered reservoir (closed main water store, e.g. a drum)"] },
      { letter: "C", name: "Covered reservoir (closed main water store, e.g. a drum)", detail: "a large closed drum feeding a small open trough, keeping most of the water supply protected", confusedWith: ["Narrow drinking opening (covered container, small access hole)"] },
      { letter: "D", name: "Recycled-materials waterer (built from PVC pipe/plastic bottles)", detail: "built from reused plastic bottles and pipe, a low-cost water-conservation solution", confusedWith: ["Float valve (automatic self-filling mechanism)"] },
    ],
  },
  soilConservationGallery: {
    visual: {
      type: "photo-diagram",
      image: "/images/grade8/g8-ag-soil-conservation-gallery.webp",
      alt: "Eight soil conservation methods in labelled panels: terracing, cover cropping, crop rotation, agroforestry, mulching and gabions",
    },
    parts: [
      { letter: "A", name: "Terracing (stepped hillside)", detail: "cutting a steep hillside into flat steps slows water runoff and reduces soil loss", confusedWith: ["Strip cropping (alternating crop strips across a slope)"] },
      { letter: "C", name: "Cover cropping (green low crop covering bare soil)", detail: "a dense low crop protects bare soil from being washed or blown away", confusedWith: ["Mulching (straw/residue covering soil around plants)"] },
      { letter: "D", name: "Crop rotation (different crop strips across seasons)", detail: "growing different crops in sequence helps maintain soil fertility and structure", confusedWith: ["Strip cropping (alternating crop strips across a slope)"] },
      { letter: "E", name: "Agroforestry (trees planted among crop rows)", detail: "tree roots bind the soil and reduce erosion between crop rows", confusedWith: ["Terracing (stepped hillside)"] },
      { letter: "F", name: "Mulching (straw/residue covering soil around plants)", detail: "a layer of straw/residue around plants reduces evaporation and protects the soil surface", confusedWith: ["Cover cropping (green low crop covering bare soil)"] },
      { letter: "H", name: "Gabions (wire cages filled with stones across a gully)", detail: "wire-mesh cages filled with stones slow water flow and stop a gully from widening", confusedWith: ["Terracing (stepped hillside)"] },
    ],
    skippedLabels: "Contour ploughing and strip cropping are both drawn in this image as their own distinct panels but are not reliably letter-hotspottable — across repeated attempts their intended letters (B and G) kept drifting onto neighbouring panels instead of staying on their own. Only the 6 methods above have a confirmed, uniquely-correct letter; the shipped skill's own text-based 'method-match' branch remains the reliable way to test contour ploughing and strip cropping.",
  },
  cuttingToolsGallery: {
    visual: {
      type: "photo-diagram",
      image: "/images/grade8/g8-pt-cutting-tools-gallery.webp",
      alt: "Eight cutting tools in labelled panels: pliers, a chisel, a handsaw, a wood plane, a hacksaw, a gouge, a utility knife and a second pliers",
    },
    parts: [
      { letter: "A", name: "Pliers", detail: "grips and cuts wire or small material using a scissor-like action", confusedWith: ["Utility knife"] },
      { letter: "B", name: "Chisel", detail: "a flat-bladed hand tool for cutting or shaping wood along the grain", confusedWith: ["Gouge"] },
      { letter: "C", name: "Handsaw", detail: "a long-bladed saw for straight cuts through wood by hand", confusedWith: ["Hacksaw"] },
      { letter: "D", name: "Wood plane", detail: "shaves thin layers off a wood surface to smooth or flatten it", confusedWith: ["Chisel"] },
      { letter: "E", name: "Hacksaw", detail: "a fine-toothed saw in a frame, used mainly for cutting metal", confusedWith: ["Handsaw"] },
      { letter: "F", name: "Gouge", detail: "a curved-blade chisel for cutting rounded grooves in wood", confusedWith: ["Chisel"] },
      { letter: "G", name: "Utility knife", detail: "a retractable-blade knife for cutting card, plastic and thin material", confusedWith: ["Pliers"] },
      { letter: "H", name: "Combination pliers", detail: "a second pliers-family tool for gripping, twisting and cutting wire", confusedWith: ["Pliers"] },
    ],
  },
  compositeMaterialsGallery: {
    visual: {
      type: "photo-diagram",
      image: "/images/grade8/g8-pt-composite-materials-gallery.webp",
      alt: "Six composite materials in labelled panels: terrazzo, reinforced brick, plywood, dressed stone, papier-mâché, and laminated card",
    },
    parts: [
      { letter: "A", name: "Terrazzo", detail: "a composite of stone chips set in a cement/resin binder, visible as speckled fragments", confusedWith: ["Dressed stone"] },
      { letter: "B", name: "Reinforced brick", detail: "fired clay bricks combined with a mortar binding layer", confusedWith: ["Terrazzo"] },
      { letter: "C", name: "Plywood", detail: "thin layers of wood glued together with grain running in alternating directions, visible as a layered cross-section", confusedWith: ["Laminated card"] },
      { letter: "D", name: "Dressed stone", detail: "natural stone cut and shaped for building, combined with a binding mortar in use", confusedWith: ["Terrazzo"] },
      { letter: "E", name: "Papier-mâché", detail: "paper fibres combined with a paste/glue binder to form a rigid shape once dry", confusedWith: ["Plywood"] },
      { letter: "F", name: "Laminated card", detail: "layers of card or paper bonded with a plastic film for strength and water-resistance", confusedWith: ["Plywood"] },
    ],
  },
  ceramicMaterialsGallery: {
    visual: {
      type: "photo-diagram",
      image: "/images/grade8/g8-pt-ceramic-materials-gallery.webp",
      alt: "Four ceramic materials in everyday use: an unglazed clay pot, glazed plates and cookware, glass, and seashells",
    },
    parts: [
      { letter: "A", name: "Unglazed clay pottery", detail: "porous fired clay, left without a glossy glaze coating", confusedWith: ["Glazed ceramic ware"] },
      { letter: "B", name: "Glazed ceramic ware", detail: "fired clay coated with a glassy glaze for a smooth, non-porous surface", confusedWith: ["Unglazed clay pottery"] },
      { letter: "C", name: "Glass", detail: "a hard, transparent ceramic material made by melting and cooling silica", confusedWith: ["Glazed ceramic ware"] },
      { letter: "D", name: "Natural shell", detail: "a natural ceramic-like material made mostly of calcium carbonate", confusedWith: ["Glass"] },
    ],
  },
  evidenceOfChemicalChangeGallery: {
    visual: {
      type: "photo-diagram",
      image: "/images/grade8/g8-sci-evidence-of-chemical-change-gallery.webp",
      alt: "Six signs of chemical change in labelled panels: rust, fizzing gas bubbles, fire, curdled milk, a colour-change test tube, and a fried egg",
    },
    parts: [
      { letter: "A", name: "Rust formation", detail: "a colour change (iron turning reddish-brown) showing a new substance has formed", confusedWith: ["Colour change"] },
      { letter: "B", name: "Fizzing/gas bubbles", detail: "bubbles forming show a gas is being produced by a chemical reaction", confusedWith: ["Temperature change (fire)"] },
      { letter: "C", name: "Temperature change (fire)", detail: "burning releases heat and light, a sign energy is being released by a chemical reaction", confusedWith: ["Fizzing/gas bubbles"] },
      { letter: "D", name: "Curdling (souring)", detail: "milk turning from liquid to curdled/lumpy is a sign a chemical change has occurred", confusedWith: ["Colour change"] },
      { letter: "E", name: "Colour change", detail: "a substance changing colour is one of the clearest signs a new substance has formed", confusedWith: ["Rust formation"] },
      { letter: "F", name: "Irreversible change (cooking)", detail: "cooking an egg changes it permanently — it cannot be changed back, unlike a physical change", confusedWith: ["Curdling (souring)"] },
    ],
  },
  preservationMethodsGallery: {
    visual: {
      type: "photo-diagram",
      image: "/images/grade8/g8-ag-preservation-methods-gallery.webp",
      alt: "Eight methods of preserving milk and meat in labelled panels: boiling, refrigeration, fermenting in a gourd, pasteurising, salting, sun-drying, smoking, and freezing",
    },
    parts: [
      { letter: "A", name: "Boiling", detail: "heating milk to a high temperature kills bacteria and extends how long it stays safe to drink", confusedWith: ["Pasteurising/heat-treating"] },
      { letter: "B", name: "Refrigeration", detail: "cold temperatures slow bacterial growth, keeping milk fresh for longer", confusedWith: ["Freezing"] },
      { letter: "C", name: "Fermenting (traditional gourd)", detail: "naturally souring milk in a gourd is a traditional preservation method (e.g. mursik)", confusedWith: ["Boiling"] },
      { letter: "D", name: "Pasteurising/heat-treating", detail: "controlled heat-treatment equipment kills harmful bacteria in milk", confusedWith: ["Boiling"] },
      { letter: "E", name: "Salting", detail: "salt draws moisture out of meat, preventing bacteria from growing", confusedWith: ["Sun-drying"] },
      { letter: "F", name: "Sun-drying", detail: "removing moisture from meat strips in the sun prevents bacterial growth", confusedWith: ["Salting"] },
      { letter: "G", name: "Smoking", detail: "smoke and heat dry meat and add compounds that resist bacterial growth", confusedWith: ["Sun-drying"] },
      { letter: "H", name: "Freezing", detail: "very cold temperatures stop bacterial growth almost completely, preserving meat for a long time", confusedWith: ["Refrigeration"] },
    ],
  },
  elementsUsesGallery: {
    visual: {
      type: "photo-diagram",
      image: "/images/grade8/g8-sci-elements-uses-gallery.webp",
      alt: "Everyday uses of common elements in labelled panels: gold jewellery, iron construction beams, copper wire, aluminium cookware, silver jewellery, and a carbohydrate-rich food",
    },
    parts: [
      { letter: "A", name: "Gold (jewellery/medals)", detail: "prized for jewellery and medals because it doesn't tarnish", confusedWith: ["Silver (jewellery/coins)"] },
      { letter: "B", name: "Iron (construction beams)", detail: "strong and cheap, widely used in construction", confusedWith: ["Aluminium (cooking utensils/aircraft panel)"] },
      { letter: "D", name: "Copper (electrical wire)", detail: "an excellent electrical conductor, used in household wiring", confusedWith: ["Iron (construction beams)"] },
      { letter: "E", name: "Aluminium (cooking utensils/aircraft panel)", detail: "lightweight and corrosion-resistant, used in cookware and aircraft", confusedWith: ["Iron (construction beams)"] },
      { letter: "F", name: "Silver (jewellery/coins)", detail: "used in jewellery and coins for its shine and value", confusedWith: ["Gold (jewellery/medals)"] },
      { letter: "G", name: "Carbon (a carbohydrate-rich food, e.g. bread/rice)", detail: "carbon is the key element in carbohydrates, a major food energy source", confusedWith: ["Iron (construction beams)"] },
    ],
    skippedLabels: "Letter C is deliberately never used — Carbon's own chemical symbol is 'C', and Carbon is one of the 6 pictured uses, so using 'C' as its hotspot letter would be a confusing coincidence.",
  },
  historicalSitesGallery: {
    visual: {
      type: "photo-diagram",
      image: "/images/grade8/g8-ss-historical-sites-gallery.webp",
      alt: "Seven African historical sites and monuments in labelled panels: a fort, ruins, a stone tower, the pyramids of Giza, smaller pyramids, a fortified building, and an island fortification",
    },
    parts: [
      { letter: "A", name: "Fort Jesus (Mombasa)", detail: "a coastal fort built by the Portuguese, now a UNESCO World Heritage Site", confusedWith: ["Great Zimbabwe ruins"] },
      { letter: "B", name: "Great Zimbabwe ruins", detail: "the stone ruins of a medieval African kingdom's capital", confusedWith: ["Fort Jesus (Mombasa)"] },
      { letter: "C", name: "Great Mosque of Djenné (stone tower)", detail: "a large mud-brick mosque, one of the world's largest mud-brick structures", confusedWith: ["Fortified building"] },
      { letter: "D", name: "Great Pyramids of Giza", detail: "ancient Egyptian pyramids built as royal tombs", confusedWith: ["Smaller pyramid cluster"] },
      { letter: "E", name: "Nubian pyramids", detail: "smaller, steeper pyramids built by ancient Nubian rulers", confusedWith: ["Great Pyramids of Giza"] },
      { letter: "F", name: "Fortified building (with projecting wooden beams)", detail: "a fortified structure with characteristic projecting wooden beams for support/decoration", confusedWith: ["Great Mosque of Djenné (stone tower)"] },
      { letter: "G", name: "Island fortification", detail: "a fortified structure built on a small island for defence", confusedWith: ["Fort Jesus (Mombasa)"] },
    ],
  },
  climateRegionsGallery: {
    visual: {
      type: "photo-diagram",
      image: "/images/grade8/g8-ss-climate-regions-gallery.webp",
      alt: "Five major climatic regions of Africa in labelled panels: desert, semi-arid savanna, tropical rainy, temperate highland, and mountain/alpine",
    },
    parts: [
      { letter: "A", name: "Desert climate", detail: "very low rainfall, sparse vegetation, large sand dunes", confusedWith: ["Semi-arid climate"] },
      { letter: "B", name: "Semi-arid climate", detail: "low rainfall supporting scattered acacia trees and grass", confusedWith: ["Desert climate"] },
      { letter: "C", name: "Tropical/equatorial climate", detail: "high rainfall year-round supporting dense green vegetation", confusedWith: ["Temperate highland climate"] },
      { letter: "D", name: "Temperate highland climate", detail: "moderate rainfall and temperatures at higher elevation, supporting scattered trees and grassland", confusedWith: ["Tropical/equatorial climate"] },
      { letter: "E", name: "Mountain/alpine climate", detail: "cold temperatures at very high elevation, with snow-capped peaks", confusedWith: ["Temperate highland climate"] },
    ],
  },
  vegetationRegionsGallery: {
    visual: {
      type: "photo-diagram",
      image: "/images/grade8/g8-ss-vegetation-regions-gallery.webp",
      alt: "Five major vegetation regions of Africa in labelled panels: tropical rainforest, savanna woodland, desert vegetation, semi-desert scrub, and montane forest",
    },
    parts: [
      { letter: "A", name: "Tropical rainforest", detail: "dense, tall, dark-green forest with a closed canopy", confusedWith: ["Montane forest"] },
      { letter: "B", name: "Savanna woodland", detail: "scattered acacia trees over open grassland", confusedWith: ["Desert vegetation"] },
      { letter: "C", name: "Desert vegetation", detail: "sparse, drought-resistant plants like cacti/succulents on bare sandy ground", confusedWith: ["Savanna woodland"] },
      { letter: "D", name: "Semi-desert scrub", detail: "sparse low shrubs on rocky, semi-arid ground", confusedWith: ["Desert vegetation"] },
      { letter: "E", name: "Montane forest", detail: "dense forest at higher elevation, often near rocky mountain terrain", confusedWith: ["Tropical rainforest"] },
    ],
  },
  humanEvolutionGallery: {
    visual: {
      type: "photo-diagram",
      image: "/images/grade8/g8-ss-human-evolution-gallery.webp",
      alt: "Four stages of human evolution shown as silhouettes: an early crouched hominid, a tool-using early human, an upright fire-using early human, and modern humans",
    },
    parts: [
      { letter: "A", name: "Early hominid (crouched posture)", detail: "an early ancestor with a crouched, ape-like posture", confusedWith: ["Tool-using early human"] },
      { letter: "B", name: "Tool-using early human", detail: "an early human species shown using a simple stone tool", confusedWith: ["Early hominid (crouched posture)"] },
      { letter: "C", name: "Fire-using upright early human", detail: "an upright early human species shown with control of fire", confusedWith: ["Modern human"] },
      { letter: "D", name: "Modern human (Homo sapiens)", detail: "fully upright posture with a larger braincase, the modern human form", confusedWith: ["Fire-using upright early human"] },
    ],
  },
  fabricDecorationGallery: {
    visual: {
      type: "photo-diagram",
      image: "/images/grade8/g8-cas-fabric-decoration-gallery.webp",
      alt: "Four fabric decoration techniques in labelled swatches: tie-dye, batik/shibori stripes, stencilling, and block-print patterning",
    },
    parts: [
      { letter: "A", name: "Tie-dye", detail: "fabric tied/twisted before dyeing, producing bold radiating colour patterns", confusedWith: ["Batik/shibori"] },
      { letter: "B", name: "Batik/shibori", detail: "fabric folded and resist-dyed, producing striped/banded colour patterns", confusedWith: ["Tie-dye"] },
      { letter: "C", name: "Stencilling", detail: "paint applied through a cut-out shape to produce a clean, repeatable motif", confusedWith: ["Block-print patterning"] },
      { letter: "D", name: "Block-print patterning", detail: "a carved block repeatedly stamped to build up a regular grid pattern", confusedWith: ["Stencilling"] },
    ],
  },
  basketryGallery: {
    visual: {
      type: "photo-diagram",
      image: "/images/grade8/g8-cas-basketry-gallery.webp",
      alt: "Basketry raw materials and coiled items in labelled panels: sisal fibre, dried grass, palm strips, coloured plastic strips, a coiled mat, a coiled tray, a coiled basket, and a coiled hat",
    },
    parts: [
      { letter: "A", name: "Sisal fibre", detail: "a natural plant fibre, one of the raw materials used in coiled basketry", confusedWith: ["Dried grass/reeds"] },
      { letter: "B", name: "Dried grass/reeds", detail: "a natural raw material bundled for coiled basketry", confusedWith: ["Sisal fibre"] },
      { letter: "C", name: "Palm leaf strips", detail: "strips cut from palm leaves, a traditional basketry raw material", confusedWith: ["Sisal fibre"] },
      { letter: "D", name: "Coloured plastic strips", detail: "a modern recycled-material alternative to natural basketry fibres", confusedWith: ["Palm leaf strips"] },
      { letter: "E", name: "Coiled mat", detail: "a flat coiled item made by wrapping and stitching fibre into a spiral", confusedWith: ["Coiled tray"] },
      { letter: "F", name: "Coiled tray", detail: "a shallow coiled item used for winnowing or serving", confusedWith: ["Coiled mat"] },
      { letter: "G", name: "Coiled basket", detail: "a deep coiled container item, built up in a continuous spiral", confusedWith: ["Coiled hat"] },
      { letter: "H", name: "Coiled hat", detail: "a wearable coiled item, shaped into a wide-brimmed form", confusedWith: ["Coiled basket"] },
    ],
  },
  folkDanceGallery: {
    visual: {
      type: "photo-diagram",
      image: "/images/grade8/g8-cas-folk-dance-gallery.webp",
      alt: "Five Kenyan folk dances shown as generic figures in labelled panels: a group dance with a drum, an elders' dance, an ensemble dance, a coastal dance, and a women's dance",
    },
    parts: [
      { letter: "A", name: "Drum-led group dance", detail: "a community dance performed to live drumming", confusedWith: ["Ensemble dance"] },
      { letter: "B", name: "Elders' ceremonial dance", detail: "a dance performed by elders, often at ceremonies", confusedWith: ["Drum-led group dance"] },
      { letter: "C", name: "Ensemble dance", detail: "a dance performed by a mixed group with instrumental accompaniment", confusedWith: ["Drum-led group dance"] },
      { letter: "D", name: "Coastal dance (Mijikenda-style)", detail: "a dance style associated with Kenya's coastal communities", confusedWith: ["Women's dance"] },
      { letter: "E", name: "Women's traditional dance", detail: "a dance performed by a group of women", confusedWith: ["Coastal dance (Mijikenda-style)"] },
    ],
  },
  montageComposition: {
    visual: {
      type: "photo-diagram",
      image: "/images/grade8/g8-cas-montage-composition.webp",
      alt: "A montage composition of a sprinting athlete, with its subject, corners, and finishing labelled",
    },
    parts: [
      { letter: "A", name: "Subject", detail: "the main figure or focus the montage is built around", confusedWith: ["Centre of interest"] },
      { letter: "B", name: "Posture/pose", detail: "the subject's captured pose or movement gives the composition energy and direction", confusedWith: ["Subject"] },
      { letter: "C", name: "Finishing (edges/mounting)", detail: "how the finished edges of the composition are treated and presented", confusedWith: ["Centre of interest"] },
      { letter: "D", name: "Centre of interest", detail: "the point in the composition the eye is drawn to first", confusedWith: ["Finishing (edges/mounting)"] },
    ],
  },
  taggingGamesGallery: {
    visual: {
      type: "photo-diagram",
      image: "/images/grade8/g8-cas-tagging-games-gallery.webp",
      alt: "Four types of Kenyan tagging games in labelled panels: chase-and-tag, circle tag, tug/pull tag, and a rhythmic group tag",
    },
    parts: [
      { letter: "A", name: "Chase-and-tag", detail: "one player chases and tags another to pass on being 'it'", confusedWith: ["Circle tag"] },
      { letter: "B", name: "Circle tag", detail: "players run around a marked circle, tagging within its boundary", confusedWith: ["Chase-and-tag"] },
      { letter: "C", name: "Tug/pull tag", detail: "a tagging game involving pulling or blocking another player near a boundary", confusedWith: ["Rhythmic group tag"] },
      { letter: "D", name: "Rhythmic group tag", detail: "a tagging game played with a rhythmic chant or song accompanying the movement", confusedWith: ["Tug/pull tag"] },
    ],
  },
  seamTypesGallery: {
    visual: {
      type: "photo-diagram",
      image: "/images/grade8/g8-ag-seam-types-gallery.webp",
      alt: "Four sewing seam types in labelled panels: plain seam, French seam, flat-felled seam, and overlocked seam",
    },
    parts: [
      { letter: "A", name: "Plain seam", detail: "two fabric pieces joined with a single straight line of stitching, raw edges left open", confusedWith: ["Flat-felled seam"] },
      { letter: "B", name: "French seam", detail: "a seam enclosed inside a folded second seam, hiding the raw edges completely", confusedWith: ["Overlocked seam"] },
      { letter: "C", name: "Flat-felled seam", detail: "a seam folded flat and stitched twice, visible as two parallel stitch lines — strong and durable", confusedWith: ["Plain seam"] },
      { letter: "D", name: "Overlocked seam", detail: "a seam edge bound with overlocking stitches to prevent fraying", confusedWith: ["French seam"] },
    ],
  },
  marketHonestyScene: {
    visual: {
      type: "photo-diagram",
      image: "/images/grade8/g8-eng-market-honesty-scene.webp",
      alt: "An illustrated market scene with vendors weighing produce, a shopper checking a receipt, and a boy holding a bag of goods",
    },
    parts: [],
    skippedLabels: "Deliberately an unlabelled picture-composition scene, not a lettered hotspot image — per the source prompt file's howToUse step 6, this scene is meant to power a 'describe what is happening in this picture' / character-inference comprehension question, not a hotspot-identification question. No parts are listed because there are no letters on the image.",
  },
  radioArrivalScene: {
    visual: {
      type: "photo-diagram",
      image: "/images/grade8/g8-eng-radio-arrival-scene.webp",
      alt: "An illustrated 1962 village scene at sunset, with a man demonstrating a new radio to a gathered group of villagers and children",
    },
    parts: [],
    skippedLabels: "Deliberately an unlabelled picture-composition scene, not a lettered hotspot image — meant to power a 'describe the setting' comprehension question, matching the shipped shortStorySetting.ts passage. No parts are listed because there are no letters on the image.",
  },
  mighaniHeroScene: {
    visual: {
      type: "photo-diagram",
      image: "/images/grade8/g8-ksw-mighani-hero-scene.webp",
      alt: "An illustrated dramatic scene of a small hero confronting a towering exaggerated giant against a dramatic sky",
    },
    parts: [],
    skippedLabels: "Deliberately an unlabelled picture-composition scene, not a lettered hotspot image — illustrates the mighani genre's defining exaggeration (mubalagha) for a descriptive-writing question, matching hadithiMighani.ts. No parts are listed because there are no letters on the image.",
  },
} as const satisfies Record<string, PhotoImageEntry>;

export type Grade8PhotoImageKey = keyof typeof GRADE8_PHOTO_IMAGES;

export const GRADE5_PHOTO_IMAGES = {
  animalGroupsGallery: {
    visual: {
      type: "photo-diagram",
      image: "/images/grade5/sci-g5-vertebrate-animal-gallery.webp",
      alt: "Eight animals representing the five vertebrate groups in labelled panels: cow, elephant, chicken, ostrich, crocodile, chameleon, fish and frog",
    },
    parts: [
      { letter: "A", name: "Cow (mammal)", detail: "a mammal — has fur/hair and feeds its young on milk", confusedWith: ["Elephant (mammal)"] },
      { letter: "B", name: "Elephant (mammal)", detail: "a mammal — has fur/hair and feeds its young on milk", confusedWith: ["Cow (mammal)"] },
      { letter: "C", name: "Chicken (bird)", detail: "a bird — has feathers and a beak", confusedWith: ["Ostrich (bird)"] },
      { letter: "D", name: "Ostrich (bird)", detail: "a bird — has feathers and a beak, though it cannot fly", confusedWith: ["Chicken (bird)"] },
      { letter: "E", name: "Crocodile (reptile)", detail: "a reptile — has dry scaly skin", confusedWith: ["Chameleon (reptile)"] },
      { letter: "H", name: "Frog (amphibian)", detail: "an amphibian — has smooth moist skin and lives both in water and on land", confusedWith: ["Crocodile (reptile)"] },
    ],
    skippedLabels: "Chameleon (reptile) and Tilapia (fish) are both drawn in this image but their letters (F and G) repeatedly shared/collided across 3 correction attempts — a fish panel and the chameleon panel kept ending up with the same letter. Only the 6 animals above have a confirmed, uniquely-correct letter; the shipped skill's own text-based branches remain the reliable way to test chameleon and tilapia.",
  },
  plantsWithAndWithoutFlowers: {
    visual: {
      type: "photo-diagram",
      image: "/images/grade5/sci-g5-flowering-nonflowering-gallery.webp",
      alt: "Eight plants in labelled panels showing flowering plants (hibiscus, sunflower, maize, bougainvillea) and non-flowering plants (fern, moss, pine tree, cypress tree)",
    },
    parts: [
      { letter: "A", name: "Hibiscus (flowering)", detail: "produces large, bright trumpet-shaped flowers", confusedWith: ["Bougainvillea (flowering)"] },
      { letter: "B", name: "Sunflower (flowering)", detail: "produces one large yellow-petalled flower head", confusedWith: ["Hibiscus (flowering)"] },
      { letter: "C", name: "Maize (flowering)", detail: "a flowering plant, though its flower (tassel) is small and easy to miss", confusedWith: ["Fern (non-flowering)"] },
      { letter: "D", name: "Bougainvillea (flowering)", detail: "produces clusters of small papery bright bracts around its true flowers", confusedWith: ["Hibiscus (flowering)"] },
      { letter: "E", name: "Fern (non-flowering)", detail: "reproduces using spores, never produces a flower", confusedWith: ["Moss (non-flowering)"] },
      { letter: "F", name: "Moss (non-flowering)", detail: "a low, dense, flowerless plant that reproduces using spores", confusedWith: ["Fern (non-flowering)"] },
      { letter: "G", name: "Pine tree (non-flowering)", detail: "produces cones instead of flowers", confusedWith: ["Cypress tree (non-flowering)"] },
      { letter: "H", name: "Cypress tree (non-flowering)", detail: "produces small round cones instead of flowers", confusedWith: ["Pine tree (non-flowering)"] },
    ],
  },
  partsOfAFlowerPhoto: {
    visual: {
      type: "photo-diagram",
      image: "/images/grade5/sci-g5-flower-parts-photo.webp",
      alt: "A realistic hibiscus flower with its petal, pistil, stem and root labelled",
    },
    parts: [
      { letter: "A", name: "Petal", detail: "the often brightly-coloured part that attracts insects for pollination", confusedWith: ["Sepal"] },
      { letter: "C", name: "Pistil", detail: "the female part at the centre of the flower that receives pollen", confusedWith: ["Stamen"] },
      { letter: "E", name: "Stem", detail: "supports the flower and carries water and nutrients up from the roots", confusedWith: ["Root"] },
      { letter: "G", name: "Root", detail: "anchors the plant and absorbs water and nutrients from the soil", confusedWith: ["Stem"] },
    ],
    skippedLabels: "Sepal (B), stamen (C's neighbour), and leaf (F) are drawn in this image but are not reliably letter-hotspottable — across 3 correction attempts, letters B and D kept duplicating onto two different points near the flower's crowded centre (where petal/sepal/stamen/pistil are all genuinely close together on a real hibiscus), and letter F never appeared. Only petal (A), pistil (C), stem (E) and root (G) have a confirmed, uniquely-correct letter. The existing SVG 'flower' hotspot diagram already wired into the skill's 'part-hotspot' branch remains the reliable way to test sepal, stamen and leaf.",
  },
  methodsOfSeparatingMixtures: {
    visual: {
      type: "photo-diagram",
      image: "/images/grade5/sci-g5-mixture-separation-methods-gallery.webp",
      alt: "Seven methods of separating mixtures in labelled panels, each with a visible caption: winnowing, picking, sieving, using a magnet, filtering, decanting and using a separating funnel",
    },
    parts: [
      { letter: "A", name: "Winnowing", detail: "tossing grain into the air so wind blows away the lighter husks, leaving the heavier grain", confusedWith: ["Sieving"] },
      { letter: "B", name: "Picking", detail: "removing unwanted pieces by hand, one at a time", confusedWith: ["Sieving"] },
      { letter: "C", name: "Sieving", detail: "shaking a mixture through a mesh so fine particles pass through and coarse ones stay on top", confusedWith: ["Winnowing"] },
      { letter: "E", name: "Filtering", detail: "pouring a mixture through filter paper so the liquid passes through and solid particles are caught", confusedWith: ["Decanting"] },
      { letter: "F", name: "Decanting", detail: "carefully pouring off the clear liquid from the top, once solids have settled at the bottom", confusedWith: ["Filtering"] },
      { letter: "G", name: "Using a separating funnel", detail: "draining the lower liquid layer out through a tap while the upper layer stays behind", confusedWith: ["Decanting"] },
    ],
    skippedLabels: "This image is unusual: despite 5 correction attempts explicitly forbidding it, every panel's method name renders as a visible caption underneath it (e.g. 'Winnowing', 'Picking') — this specific real-world-technique content triggered an unusually strong, apparently unbreakable captioning tendency in the image model. Because the answer is visible as text, do NOT use this image for a blind 'which letter shows X' hotspot-identification question — use it only for Apply-tier reasoning questions where the technique names being visible doesn't spoil the question (e.g. 'a workshop spills iron nails into sawdust — which lettered method should they use?'), matching the skill's own REASONING_TEMPLATES framing. Letter D is also omitted here — its caption reads 'Sieving' (duplicating C) but its picture actually shows the 'using a magnet' technique, a genuine content/caption mismatch in the generated image, so D should not be relied upon at all.",
  },
  mixedEvenlyOrUnevenly: {
    visual: {
      type: "photo-diagram",
      image: "/images/grade5/sci-g5-mixture-type-comparison-gallery.webp",
      alt: "Six mixtures in labelled panels comparing homogeneous (uniform) and heterogeneous (non-uniform) examples: maize and chaff, muddy water, oil and water, dissolved salt water, juice concentrate, and air",
    },
    parts: [
      { letter: "A", name: "Maize grains and chaff (heterogeneous, solid-solid)", detail: "two visibly distinct solids mixed but not blended together", confusedWith: ["Muddy water (heterogeneous, solid-liquid)"] },
      { letter: "B", name: "Muddy water (heterogeneous, solid-liquid)", detail: "soil particles suspended in water, visibly cloudy and non-uniform", confusedWith: ["Salt dissolved in water (homogeneous, solid-liquid)"] },
      { letter: "C", name: "Oil and water layered (heterogeneous, liquid-liquid)", detail: "two liquids that don't mix, forming visibly separate layers", confusedWith: ["Juice concentrate mixed with water (homogeneous, liquid-liquid)"] },
      { letter: "D", name: "Salt dissolved in water (homogeneous, solid-liquid)", detail: "salt fully dissolved, leaving the water perfectly clear and uniform throughout", confusedWith: ["Muddy water (heterogeneous, solid-liquid)"] },
      { letter: "E", name: "Juice concentrate mixed with water (homogeneous, liquid-liquid)", detail: "evenly mixed, with no separate layers or particles visible", confusedWith: ["Oil and water layered (heterogeneous, liquid-liquid)"] },
      { letter: "F", name: "Air, a mixture of gases (homogeneous, other)", detail: "a uniform mixture of gases, invisible/near-invisible in a container", confusedWith: ["Salt dissolved in water (homogeneous, solid-liquid)"] },
    ],
  },
  sourcesOfWaterPollution: {
    visual: {
      type: "photo-diagram",
      image: "/images/grade5/sci-g5-water-pollution-sources-gallery.webp",
      alt: "Six sources of water pollution in labelled panels: sewage, factory chemical waste, agricultural runoff, an oil spill, plastic litter, and soil erosion",
    },
    parts: [
      { letter: "A", name: "Sewage/human waste entering the river", detail: "untreated waste released directly into a water source", confusedWith: ["Factory chemical waste being released"] },
      { letter: "B", name: "Factory chemical waste being released", detail: "industrial chemical waste discharged into a water source, visibly discolouring it", confusedWith: ["Sewage/human waste entering the river"] },
      { letter: "C", name: "Agricultural fertiliser/pesticide runoff", detail: "rainwater carrying fertiliser/pesticide from farmland into a water source", confusedWith: ["Soil erosion/silt runoff"] },
      { letter: "D", name: "Oil spill", detail: "oil spreading in a visible sheen across the water's surface", confusedWith: ["Plastic litter"] },
      { letter: "E", name: "Plastic litter", detail: "plastic waste floating and collecting in a water source", confusedWith: ["Oil spill"] },
      { letter: "F", name: "Soil erosion/silt runoff", detail: "bare eroded soil washing into a water source, clouding it with silt", confusedWith: ["Agricultural fertiliser/pesticide runoff"] },
    ],
  },
  methodsOfWaterTreatment: {
    visual: {
      type: "photo-diagram",
      image: "/images/grade5/sci-g5-water-treatment-methods-gallery.webp",
      alt: "Four methods of water treatment in labelled panels: boiling, filtration, chemical treatment, and solar treatment",
    },
    parts: [
      { letter: "A", name: "Boiling", detail: "heating water to a high temperature kills harmful microorganisms", confusedWith: ["Chemical treatment"] },
      { letter: "B", name: "Filtration", detail: "passing water through layers of sand, gravel and charcoal removes solid impurities", confusedWith: ["Boiling"] },
      { letter: "C", name: "Chemical treatment", detail: "adding a water-treatment chemical kills harmful microorganisms without needing heat", confusedWith: ["Solar treatment"] },
      { letter: "D", name: "Solar treatment", detail: "leaving water in a clear bottle in strong sunlight uses UV light and heat to kill microorganisms", confusedWith: ["Chemical treatment"] },
    ],
  },
  objectsThatFloatAndSink: {
    visual: {
      type: "photo-diagram",
      image: "/images/grade5/sci-g5-floating-sinking-objects-gallery.webp",
      alt: "Seven objects in water in labelled panels, showing which float and which sink: wood, stone, a screw, a bottle cap, cork, a buoy, and a feather",
    },
    parts: [
      { letter: "A", name: "Dry wood (floats)", detail: "less dense than water, so it floats", confusedWith: ["Plastic (floats)"] },
      { letter: "B", name: "Stone (sinks)", detail: "denser than water, so it sinks", confusedWith: ["A piece of metal (sinks)"] },
      { letter: "C", name: "A piece of metal (sinks)", detail: "denser than water, so it sinks — unless shaped into a wide hollow hull, like a boat", confusedWith: ["Stone (sinks)"] },
      { letter: "D", name: "Plastic (floats)", detail: "less dense than water, so it floats", confusedWith: ["Dry wood (floats)"] },
      { letter: "E", name: "Cork (floats)", detail: "very light for its size, so it floats easily", confusedWith: ["A buoy (floats)"] },
      { letter: "F", name: "A buoy (floats)", detail: "hollow and full of air, so it floats even though it's large", confusedWith: ["Cork (floats)"] },
      { letter: "G", name: "A feather (floats)", detail: "very light for its size, so it rests on the water's surface", confusedWith: ["Cork (floats)"] },
    ],
  },
  goodAndPoorHeatConductors: {
    visual: {
      type: "photo-diagram",
      image: "/images/grade5/sci-g5-heat-conductors-gallery.webp",
      alt: "Six kitchen objects in labelled panels comparing good conductors of heat (metal spoon, aluminium pot, copper pot) and poor conductors (wooden spoon, plastic-handled spoon, glass)",
    },
    parts: [
      { letter: "A", name: "Metal spoon (good conductor)", detail: "metal conducts heat well, so a metal spoon quickly gets hot in hot food", confusedWith: ["Wooden spoon (poor conductor)"] },
      { letter: "B", name: "Aluminium pot (good conductor)", detail: "metal conducts heat well, letting the pot heat food quickly", confusedWith: ["Copper pot (good conductor)"] },
      { letter: "C", name: "Copper pot (good conductor)", detail: "copper is an excellent conductor, heating food quickly and evenly", confusedWith: ["Aluminium pot (good conductor)"] },
      { letter: "D", name: "Wooden spoon (poor conductor)", detail: "wood conducts heat poorly, so it stays cool to hold even in hot food", confusedWith: ["Metal spoon (good conductor)"] },
      { letter: "E", name: "Plastic-handled spoon (poor conductor)", detail: "plastic conducts heat poorly, keeping the handle safe to hold", confusedWith: ["Glass (poor conductor)"] },
      { letter: "F", name: "Glass (poor conductor)", detail: "glass conducts heat poorly compared to metals", confusedWith: ["Plastic-handled spoon (poor conductor)"] },
    ],
  },
  sourcesOfSound: {
    visual: {
      type: "photo-diagram",
      image: "/images/grade5/sci-g5-sound-sources-gallery.webp",
      alt: "Six sound sources in labelled panels: a whistle, a flute, a guitar, a clapper, a drum, and a djembe",
    },
    parts: [
      { letter: "A", name: "Whistle (blowing)", detail: "sound is produced by blowing air through it", confusedWith: ["Flute (blowing)"] },
      { letter: "B", name: "Flute (blowing)", detail: "sound is produced by blowing air across it", confusedWith: ["Whistle (blowing)"] },
      { letter: "C", name: "Guitar (plucking/strumming strings)", detail: "sound is produced by vibrating strings", confusedWith: ["Clapper (striking)"] },
      { letter: "D", name: "Clapper (striking)", detail: "sound is produced by striking two parts together", confusedWith: ["Drum (striking)"] },
      { letter: "E", name: "Drum (striking)", detail: "sound is produced by striking a stretched skin", confusedWith: ["Djembe (striking)"] },
      { letter: "F", name: "Djembe (striking)", detail: "sound is produced by striking a stretched skin with the hand", confusedWith: ["Drum (striking)"] },
    ],
  },
} as const satisfies Record<string, PhotoImageEntry>;

export type Grade5PhotoImageKey = keyof typeof GRADE5_PHOTO_IMAGES;

export const GRADE10_PHOTO_IMAGES = {
  kenyanIndigenousInstrumentCategories: {
    visual: {
      type: "photo-diagram",
      image: "/images/grade10/mad-g10-kenyan-indigenous-instruments-gallery.webp",
      alt: "Seven Kenyan indigenous musical instruments in labelled panels, each shown with hands demonstrating how sound is produced: a bowed fiddle, a plucked lyre, a plucked harp, a blown flute, a struck drum, a struck xylophone, and a plucked thumb piano",
    },
    parts: [
      { letter: "P", name: "Bowed single-string fiddle-type instrument (orutu-style)", detail: "sound is produced by drawing a bow across a tensioned string", confusedWith: ["Plucked lyre-type instrument (nyatiti/litungu-style)"] },
      { letter: "Q", name: "Plucked lyre-type instrument (nyatiti/litungu-style)", detail: "sound is produced by plucking strings that run from a yoke over a bowl resonator", confusedWith: ["Plucked open-frame harp-type instrument"] },
      { letter: "R", name: "Plucked open-frame harp-type instrument", detail: "sound is produced by plucking strings of different lengths on an open triangular frame", confusedWith: ["Plucked lyre-type instrument (nyatiti/litungu-style)"] },
      { letter: "S", name: "Blown bamboo flute (chivoti-style)", detail: "sound is produced by blowing air across the instrument while covering finger holes", confusedWith: ["Struck skin hand drum (isukuti-style)"] },
    ],
    skippedLabels: "The struck skin drum (isukuti), the barred wooden xylophone (silimba), and the plucked thumb piano (a spoked instrument) are all drawn in this image but their letters (T, U, V) are not reliably distinguishable — across 3 correction attempts, T and U each ended up duplicated across two different panels among these three items. Only the 4 instruments above (fiddle, lyre, harp, flute) have a confirmed, uniquely-correct letter. The shipped skill's own text-based branches remain the reliable way to test the drum, xylophone, and thumb piano.",
  },
  westernInstrumentFamilies: {
    visual: {
      type: "photo-diagram",
      image: "/images/grade10/mad-g10-western-instrument-families-gallery.webp",
      alt: "Six Western instruments in labelled panels representing the 5 instrument families: violin, guitar, trumpet, clarinet, drum set, and piano",
    },
    parts: [
      { letter: "P", name: "Violin (strings family, bowing technique)", detail: "played by drawing a bow across its strings", confusedWith: ["Acoustic guitar (strings family, picking/strumming/plucking technique)"] },
      { letter: "Q", name: "Acoustic guitar (strings family, picking/strumming/plucking technique)", detail: "played by picking, strumming, or plucking its strings", confusedWith: ["Violin (strings family, bowing technique)"] },
      { letter: "R", name: "Trumpet (brass family)", detail: "a brass instrument with valves and a flared bell", confusedWith: ["Clarinet (woodwind family)"] },
      { letter: "S", name: "Clarinet (woodwind family)", detail: "a woodwind instrument with a single-reed mouthpiece", confusedWith: ["Trumpet (brass family)"] },
      { letter: "T", name: "Drum set (percussion family)", detail: "a set of drums and a cymbal, played by striking", confusedWith: ["Upright piano (piano/organ family)"] },
      { letter: "U", name: "Upright piano (piano/organ family)", detail: "played by pressing keys that strike strings inside", confusedWith: ["Drum set (percussion family)"] },
    ],
  },
  danceProductionRoadSafetyScene: {
    visual: {
      type: "photo-diagram",
      image: "/images/grade10/mad-g10-dance-production-scene.webp",
      alt: "A themed road-safety dance performance stage scene with the backdrop, prop, spotlight, multimedia screen and dancer's costume labelled",
    },
    parts: [
      { letter: "A", name: "Set design (the painted backdrop establishing the scene)", detail: "the backdrop establishes the scene's setting without obstructing the dancers' movement or the audience's view", confusedWith: ["Multimedia (the projected screen/graphic)"] },
      { letter: "B", name: "Prop (a lightweight object supporting the story)", detail: "a lightweight object (here, a stylised road barrier) that supports the story being told", confusedWith: ["Set design (the painted backdrop establishing the scene)"] },
      { letter: "C", name: "Stage lighting (the visible spotlight beam)", detail: "the depictable part of the combined 'music, lighting and sound' production area — lighting draws focus to the performer", confusedWith: ["Multimedia (the projected screen/graphic)"] },
      { letter: "D", name: "Multimedia (the projected screen/graphic)", detail: "projected visuals used to enhance or add context to the performance", confusedWith: ["Stage lighting (the visible spotlight beam)"] },
      { letter: "E", name: "Costume (the dancer's themed outfit)", detail: "signals the dance's theme to the audience at a glance, before any movement begins", confusedWith: ["Prop (a lightweight object supporting the story)"] },
    ],
  },
  fiveElementsOfDance: {
    visual: {
      type: "photo-diagram",
      image: "/images/grade10/mad-g10-elements-of-dance-gallery.webp",
      alt: "The five elements of dance in labelled panels using dancer silhouettes: Body, Action, Space, Time, and Energy",
    },
    parts: [
      { letter: "A", name: "Body", detail: "the physical instrument of dance — what part of the body is moving", confusedWith: ["Action"] },
      { letter: "B", name: "Action", detail: "what the body is doing — the specific movement being performed", confusedWith: ["Energy"] },
      { letter: "C", name: "Space", detail: "where the body moves — the pathway and use of the performance area", confusedWith: ["Time"] },
      { letter: "D", name: "Time", detail: "when the movement happens — its rhythm, speed, and duration", confusedWith: ["Space"] },
      { letter: "E", name: "Energy", detail: "how the movement is performed — its dynamic quality, sharp or flowing", confusedWith: ["Action"] },
    ],
  },
  basicDancePerformingSkills: {
    visual: {
      type: "photo-diagram",
      image: "/images/grade10/mad-g10-contemporary-dance-basic-skills-gallery.webp",
      alt: "Five basic performing skills in labelled panels using dancer silhouettes: Posture, Alignment, Balance, Coordination, and Control",
    },
    parts: [
      { letter: "A", name: "Posture", detail: "holding the body in a controlled, well-aligned upright position", confusedWith: ["Alignment"] },
      { letter: "B", name: "Alignment", detail: "hips, knees, and ankles correctly positioned relative to each other", confusedWith: ["Posture"] },
      { letter: "C", name: "Balance", detail: "a stable position held on one point of support", confusedWith: ["Control"] },
      { letter: "D", name: "Coordination", detail: "arms and legs moving together smoothly in the same timing", confusedWith: ["Balance"] },
      { letter: "E", name: "Control", detail: "a slow, deliberately governed extended movement", confusedWith: ["Balance"] },
    ],
  },
  kenyanFolkSongCostumesAndProps: {
    visual: {
      type: "photo-diagram",
      image: "/images/grade10/mad-g10-kenyan-folk-song-costumes-props-gallery.webp",
      alt: "Six costumes, props and artefacts for a Kenyan folk song performance in labelled panels: a beaded garment, a beaded necklace, a gourd, a woven basket, a beaded headband, and a wooden stool",
    },
    parts: [
      { letter: "A", name: "Beaded garment/wrap", detail: "a traditional costume item worn during performance", confusedWith: ["Beaded necklace"] },
      { letter: "B", name: "Beaded necklace", detail: "a traditional beaded costume accessory", confusedWith: ["Beaded headband"] },
      { letter: "C", name: "Gourd", detail: "a traditional artefact/prop, often used as a container", confusedWith: ["Woven basket"] },
      { letter: "D", name: "Woven basket", detail: "a traditional artefact/prop woven from natural fibre", confusedWith: ["Gourd"] },
      { letter: "E", name: "Beaded headband", detail: "a traditional beaded costume accessory worn on the head", confusedWith: ["Beaded necklace"] },
      { letter: "F", name: "Wooden stool", detail: "a traditional carved artefact/prop", confusedWith: ["Woven basket"] },
    ],
  },
} as const satisfies Record<string, PhotoImageEntry>;

export type Grade10PhotoImageKey = keyof typeof GRADE10_PHOTO_IMAGES;
