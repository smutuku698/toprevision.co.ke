import { randChoice, randInt, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const WAVE_TYPES: { name: string; type: "longitudinal" | "transverse" }[] = [
  { name: "Sound wave", type: "longitudinal" },
  { name: "A push-pull wave along a stretched spring", type: "longitudinal" },
  { name: "Ultrasound wave", type: "longitudinal" },
  { name: "Light wave", type: "transverse" },
  { name: "Radio wave", type: "transverse" },
  { name: "A wave along a shaken rope", type: "transverse" },
  { name: "Water ripple on a pond", type: "transverse" },
];

const APPLICATIONS: { tech: string; use: string }[] = [
  { tech: "Ultrasound", use: "Medical scanning, such as checking on a baby before birth" },
  { tech: "X-rays", use: "Imaging bones and detecting fractures" },
  { tech: "Radar", use: "Detecting the position and speed of aircraft or storms" },
  { tech: "Microwave", use: "Heating and cooking food quickly" },
  { tech: "Wi-Fi signals", use: "Sending data wirelessly to connect devices to the internet" },
  { tech: "Laser", use: "Precision cutting in surgery, such as correcting eyesight" },
  { tech: "CT/MRI scans", use: "Producing detailed internal images of the body for diagnosis" },
];

const CHARACTERISTIC_QUESTIONS: { prompt: string; choices: string[]; correctIndex: number; explanation: string; highlight: "wavelength" | "amplitude" | "crest" | "trough" | "none" }[] = [
  {
    prompt: "What does the 'amplitude' of a wave measure?",
    choices: ["The maximum displacement of the wave from its rest position", "The distance between two identical points on the wave", "The number of waves passing a point each second", "The time taken for one complete wave to pass"],
    correctIndex: 0,
    explanation: "Amplitude is the maximum displacement of a wave from its rest (undisturbed) position — a bigger amplitude means a more energetic wave.",
    highlight: "amplitude",
  },
  {
    prompt: "What is the 'wavelength' of a wave?",
    choices: ["The distance between two consecutive identical points on the wave, such as crest to crest", "The maximum height of the wave above its rest position", "The number of complete waves passing a point per second", "The time it takes for the source to make one wave"],
    correctIndex: 0,
    explanation: "Wavelength is the distance between two consecutive identical points on a wave, such as from one crest to the next.",
    highlight: "wavelength",
  },
  {
    prompt: "What does the 'frequency' of a wave measure?",
    choices: ["The number of complete waves passing a fixed point per second", "The distance between two crests", "How far the wave travels in total", "The wave's maximum displacement"],
    correctIndex: 0,
    explanation: "Frequency is the number of complete waves passing a fixed point every second, measured in hertz (Hz).",
    highlight: "none",
  },
  {
    prompt: "What is the 'period' of a wave?",
    choices: ["The time taken for one complete wave to pass a fixed point", "The total distance the wave has travelled", "The number of waves produced by the source", "The wave's amplitude squared"],
    correctIndex: 0,
    explanation: "The period of a wave is the time taken for one complete wave to pass a fixed point — the inverse of its frequency.",
    highlight: "none",
  },
  {
    prompt: "What happens to a wave during reflection?",
    choices: ["It bounces back after hitting a barrier", "It bends as it enters a new medium", "It spreads out around an obstacle or through a gap", "It disappears completely"],
    correctIndex: 0,
    explanation: "Reflection is when a wave bounces back after striking a barrier, such as sound echoing off a wall.",
    highlight: "none",
  },
  {
    prompt: "What happens to a wave during refraction?",
    choices: ["It bends as it passes from one medium into another", "It bounces straight back the way it came", "It always stops moving entirely", "It only happens to sound waves, never light"],
    correctIndex: 0,
    explanation: "Refraction is when a wave bends as it passes from one medium into another, because its speed changes between the two media.",
    highlight: "none",
  },
  {
    prompt: "What happens to a wave during diffraction?",
    choices: ["It spreads out or bends around an obstacle or through a gap", "It bounces directly back off a barrier", "It changes speed but travels in a perfectly straight line", "It stops being a wave entirely"],
    correctIndex: 0,
    explanation: "Diffraction is when a wave spreads out or bends around an obstacle or through a narrow gap, letting it 'get around' objects in its path.",
    highlight: "none",
  },
  {
    prompt: "What is 'active' remote sensing, such as radar?",
    choices: ["A system that sends out its own signal and measures what reflects back", "A system that only detects naturally occurring radiation, like sunlight", "A system that cannot detect moving objects", "A system used only underwater"],
    correctIndex: 0,
    explanation: "Active remote sensing systems, like radar, send out their own signal (e.g. radio waves) and measure what reflects back to detect objects.",
    highlight: "none",
  },
  {
    prompt: "What is 'passive' remote sensing, such as a satellite photographing Earth in daylight?",
    choices: ["A system that detects naturally occurring radiation, such as sunlight reflected off the surface", "A system that sends out its own energy source to scan an area", "A system that can only work at night", "A system that has no practical use in day-to-day life"],
    correctIndex: 0,
    explanation: "Passive remote sensing detects naturally occurring radiation, such as sunlight reflected off the Earth's surface, rather than sending out its own signal.",
    highlight: "none",
  },
];

const EM_WAVELENGTH_ORDER = [
  { id: "xray", label: "X-rays (used in medical imaging)" },
  { id: "visible", label: "Visible light" },
  { id: "microwave", label: "Microwaves (used for cooking)" },
  { id: "radio", label: "Radio waves (used for Wi-Fi and broadcasting)" },
] as const;

export const waves: Skill = {
  id: "sci-fe-waves",
  code: "FE.2",
  subjectId: "science",
  strandId: "sci-fe",
  grade: 9,
  title: "Waves",
  description: "Longitudinal vs transverse waves, the wave equation, and applications of waves.",
  generate(rng) {
    const branch = randChoice(rng, ["equation", "classify", "applications", "characteristics", "em-order"] as const);

    if (branch === "characteristics") {
      const q = randChoice(rng, CHARACTERISTIC_QUESTIONS);
      const choices = shuffle(rng, q.choices.map((c, i) => ({ c, correct: i === q.correctIndex })));
      return {
        kind: "multiple-choice",
        prompt: q.prompt,
        choices: choices.map((c) => c.c),
        correctIndex: choices.findIndex((c) => c.correct),
        hint: "Think carefully about which part of a wave, or which wave behaviour, each term describes.",
        explanation: q.explanation,
        visual: q.highlight === "none" ? undefined : { type: "wave-diagram", highlight: q.highlight },
      };
    }

    if (branch === "em-order") {
      const items = shuffle(rng, EM_WAVELENGTH_ORDER.map((s) => ({ id: s.id, label: s.label })));
      return {
        kind: "ordering",
        prompt: "Arrange these wave-based technologies from shortest to longest wavelength.",
        instruction: "Drag to reorder from shortest wavelength to longest wavelength.",
        items,
        correctOrder: EM_WAVELENGTH_ORDER.map((s) => s.id),
        hint: "X-rays have the shortest wavelength of these four; radio waves have the longest.",
        explanation: EM_WAVELENGTH_ORDER.map((s, i) => `${i + 1}. ${s.label}.`).join(" "),
      };
    }

    if (branch === "equation") {
      const frequency = randInt(rng, 2, 20);
      const wavelength = randInt(rng, 2, 15);
      const speed = frequency * wavelength;
      const askFor = randChoice(rng, ["speed", "frequency", "wavelength"] as const);

      if (askFor === "speed") {
        return {
          kind: "fill-blank",
          prompt: `A wave has a frequency of ${frequency} Hz and a wavelength of ${wavelength} m.`,
          before: "Using $v = f\\lambda$, its wave speed is",
          after: "m/s.",
          correctAnswer: String(speed),
          inputMode: "numeric",
          hint: "Wave speed = frequency × wavelength.",
          explanation: `v = f\\lambda = ${frequency} \\times ${wavelength} = ${speed}\\text{ m/s}.`,
          visual: { type: "wave-diagram", highlight: "wavelength" },
        };
      }
      if (askFor === "frequency") {
        return {
          kind: "fill-blank",
          prompt: `A wave travels at ${speed} m/s and has a wavelength of ${wavelength} m.`,
          before: "Using $v = f\\lambda$, its frequency is",
          after: "Hz.",
          correctAnswer: String(frequency),
          inputMode: "numeric",
          hint: "Frequency = wave speed ÷ wavelength.",
          explanation: `f = v \\div \\lambda = ${speed} \\div ${wavelength} = ${frequency}\\text{ Hz}.`,
          visual: { type: "wave-diagram", highlight: "wavelength" },
        };
      }
      return {
        kind: "fill-blank",
        prompt: `A wave travels at ${speed} m/s with a frequency of ${frequency} Hz.`,
        before: "Using $v = f\\lambda$, its wavelength is",
        after: "m.",
        correctAnswer: String(wavelength),
        inputMode: "numeric",
        hint: "Wavelength = wave speed ÷ frequency.",
        explanation: `\\lambda = v \\div f = ${speed} \\div ${frequency} = ${wavelength}\\text{ m}.`,
        visual: { type: "wave-diagram", highlight: "wavelength" },
      };
    }

    if (branch === "classify") {
      const chosen = shuffle(rng, WAVE_TYPES).slice(0, 5);
      const items = chosen.map((w) => ({ id: w.name, label: w.name }));
      const correctBucket: Record<string, string> = {};
      for (const w of chosen) correctBucket[w.name] = w.type;

      return {
        kind: "categorize",
        prompt: "Sort each wave as longitudinal or transverse.",
        items,
        buckets: [
          { id: "longitudinal", label: "Longitudinal" },
          { id: "transverse", label: "Transverse" },
        ],
        correctBucket,
        hint: "In a longitudinal wave, the vibration is along the direction of travel; in a transverse wave, it is at right angles to it.",
        explanation: chosen.map((w) => `${w.name} is ${w.type}.`).join(" "),
      };
    }

    const chosen = shuffle(rng, APPLICATIONS).slice(0, 4);
    const tokens = shuffle(rng, chosen.map((a) => ({ id: a.tech, label: a.tech })));
    const targets = shuffle(rng, chosen.map((a) => ({ id: a.tech, label: a.use })));
    const correctMap: Record<string, string> = {};
    for (const a of chosen) correctMap[a.tech] = a.tech;

    return {
      kind: "click-match",
      prompt: "Match each wave-based technology to its everyday application.",
      tokens,
      targets,
      correctMap,
      hint: "Different types of waves are suited to different jobs, from cooking to communication to medicine.",
      explanation: chosen.map((a) => `${a.tech} — ${a.use.toLowerCase()}.`).join(" "),
    };
  },
};
