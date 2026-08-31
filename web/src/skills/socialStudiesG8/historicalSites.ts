import { randChoice, randInt, shuffle } from "@/lib/rng";
import { buildChoicesFromStrings } from "@/skills/mathG8/mathUtils";
import type { Skill } from "@/lib/types";

const SITES = [
  {
    name: "Fort Jesus",
    region: "East Africa",
    description: "A coral-stone fort built in 1593 by the Portuguese to guard the trade route along the East African coast, located in Mombasa, Kenya",
    significance: "Guarded control of the Indian Ocean trade route along the East African coast",
    ageYears: 430,
  },
  {
    name: "Kilwa",
    region: "East Africa",
    description: "A Swahili trading sultanate on the Tanzanian coast, famous for its coral-built Great Mosque and control of the gold trade from Great Zimbabwe",
    significance: "A wealthy Swahili trading city that controlled gold exports reaching as far as Great Zimbabwe",
    ageYears: 1100,
  },
  {
    name: "Great Zimbabwe",
    region: "Southern Africa",
    description: "A stone-walled city built without mortar, capital of a powerful trading kingdom, and the largest ancient stone structure south of the Sahara",
    significance: "Capital of a kingdom that grew wealthy trading gold and ivory with Swahili coast cities",
    ageYears: 900,
  },
  {
    name: "Giza pyramids",
    region: "North Africa",
    description: "Massive stone tombs built for Egyptian pharaohs, including the Great Pyramid built for Pharaoh Khufu, one of the Seven Wonders of the Ancient World",
    significance: "Royal tombs demonstrating ancient Egypt's engineering skill and belief in the afterlife",
    ageYears: 4500,
  },
  {
    name: "Meroe",
    region: "North Africa",
    description: "Capital of the Kingdom of Kush in present-day Sudan, known for its own smaller pyramids and an early iron-smelting industry",
    significance: "Centre of an early African iron-working industry and a kingdom that rivalled ancient Egypt",
    ageYears: 2600,
  },
  {
    name: "Timbuktu",
    region: "West Africa",
    description: "A centre of Islamic scholarship and trans-Saharan trade in Mali, famous for its ancient manuscripts and mud-brick mosques",
    significance: "A centre of learning where scholars collected and copied manuscripts on science, law, and religion",
    ageYears: 850,
  },
  {
    name: "Robben Island",
    region: "Southern Africa",
    description: "An island prison off Cape Town, South Africa, where Nelson Mandela was held for 18 years during the struggle against apartheid",
    significance: "A symbol of the long struggle against apartheid and for human rights in South Africa",
    ageYears: 370,
  },
] as const;

const CONSERVATION_ACTIONS = [
  { text: "Restoring damaged walls of a historical site using traditional building materials", bucket: "helps" },
  { text: "Registering a site with UNESCO or a national heritage body for legal protection", bucket: "helps" },
  { text: "Training local guides to educate visitors about a site's history", bucket: "helps" },
  { text: "Controlling the number of visitors allowed to enter a fragile site each day", bucket: "helps" },
  { text: "Quarrying stone from the walls of an ancient site for use in new buildings", bucket: "harms" },
  { text: "Allowing unregulated construction of buildings right up against a heritage site", bucket: "harms" },
  { text: "Leaving graffiti or carving names into ancient monument walls", bucket: "harms" },
] as const;

const BUCKET_LABEL: Record<string, string> = { helps: "Helps conserve the site", harms: "Harms the site" };

export const historicalSites: Skill = {
  id: "g8-ss-nhbe-historical-sites",
  code: "NHBE.4",
  subjectId: "social-studies",
  strandId: "g8-ss-nhbe",
  grade: 8,
  title: "Historical sites and monuments in Africa",
  description: "Locating and identifying selected historical sites and monuments in Africa, their importance for preserving cultural heritage, and ways of conserving them.",
  generate(rng) {
    const branch = randChoice(rng, ["identify", "match", "region-classify", "chronology", "age-chart", "conserve-classify"] as const);

    if (branch === "identify") {
      const s = randChoice(rng, SITES);
      const others = SITES.filter((x) => x.name !== s.name).map((x) => x.name);
      const { choices, correctIndex } = buildChoicesFromStrings(rng, s.name, others, 3);
      return {
        kind: "multiple-choice",
        prompt: `Which historical site or monument is described as: "${s.description}"?`,
        choices,
        correctIndex,
        hint: `This site is located in ${s.region}.`,
        explanation: `${s.name}: ${s.description}.`,
      };
    }

    if (branch === "match") {
      const chosen = shuffle(rng, [...SITES]).slice(0, 4);
      const tokens = shuffle(rng, chosen.map((s) => ({ id: s.name, label: s.name })));
      const targets = shuffle(rng, chosen.map((s) => ({ id: s.name, label: s.significance })));
      const correctMap: Record<string, string> = {};
      for (const s of chosen) correctMap[s.name] = s.name;
      return {
        kind: "click-match",
        prompt: "Match each historical site or monument to why it is significant.",
        tokens,
        targets,
        correctMap,
        hint: "Think about what each site tells us about trade, power, or history in that part of Africa.",
        explanation: chosen.map((s) => `${s.name}: ${s.significance}.`).join(" "),
      };
    }

    if (branch === "region-classify") {
      const chosen = shuffle(rng, [...SITES]).slice(0, 6);
      const buckets = Array.from(new Set(chosen.map((s) => s.region))).map((r) => ({ id: r, label: r }));
      const items = chosen.map((s) => ({ id: s.name, label: s.name }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((s) => (correctBucket[s.name] = s.region));
      return {
        kind: "categorize",
        prompt: "Sort each historical site or monument into the region of Africa where it is located.",
        items,
        buckets,
        correctBucket,
        hint: "Recall which present-day country or coastline each site is found in.",
        explanation: chosen.map((s) => `${s.name} is in ${s.region}.`).join(" "),
      };
    }

    if (branch === "chronology") {
      const chosen = [...SITES].sort((a, b) => b.ageYears - a.ageYears).slice(0, 5);
      const items = shuffle(rng, chosen.map((s) => ({ id: s.name, label: s.name })));
      return {
        kind: "ordering",
        prompt: "Arrange these historical sites and monuments from oldest to most recently built.",
        instruction: "Drag to reorder from oldest to newest.",
        items,
        correctOrder: chosen.map((s) => s.name),
        hint: "The Giza pyramids are by far the oldest; Fort Jesus, built in 1593, is the most recent of this group.",
        explanation: chosen.map((s, i) => `${i + 1}. ${s.name} (built roughly ${s.ageYears.toLocaleString()} years ago).`).join(" "),
      };
    }

    if (branch === "age-chart") {
      const chosen = shuffle(rng, [...SITES]).slice(0, 4);
      const data = chosen.map((s) => ({ label: s.name, value: s.ageYears }));
      const oldest = chosen.reduce((a, b) => (a.ageYears > b.ageYears ? a : b));
      const others = chosen.filter((s) => s.name !== oldest.name).map((s) => s.name);
      const { choices, correctIndex } = buildChoicesFromStrings(rng, oldest.name, others, chosen.length - 1);
      return {
        kind: "multiple-choice",
        prompt: "This chart shows roughly how many years ago each historical site was built. Which site is the oldest?",
        visual: { type: "bar-chart", data },
        choices,
        correctIndex,
        hint: "Look for the tallest bar on the chart.",
        explanation: `${oldest.name} has the tallest bar, at roughly ${oldest.ageYears.toLocaleString()} years old — the oldest of this group.`,
      };
    }

    // conserve-classify
    const chosen = shuffle(rng, CONSERVATION_ACTIONS).slice(0, randInt(rng, 4, 6));
    const buckets = Array.from(new Set(chosen.map((a) => a.bucket))).map((b) => ({ id: b, label: BUCKET_LABEL[b] }));
    const items = chosen.map((a, i) => ({ id: `a${i}`, label: a.text }));
    const correctBucket: Record<string, string> = {};
    chosen.forEach((a, i) => (correctBucket[`a${i}`] = a.bucket));
    return {
      kind: "categorize",
      prompt: "Sort each action into whether it helps conserve, or harms, historical sites and monuments.",
      items,
      buckets,
      correctBucket,
      hint: "Conservation protects and restores a site; harm damages or destroys it.",
      explanation: chosen.map((a) => `"${a.text}" — ${BUCKET_LABEL[a.bucket].toLowerCase()}.`).join(" "),
    };
  },
};
