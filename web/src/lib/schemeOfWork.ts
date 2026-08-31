import type { SchemeSubject } from "@/data/schemesOfWork";

export interface SchemeRow {
  week: number;
  lesson: number;
  strand: string;
  subStrand: string;
  specificLearningOutcomes: string[];
  keyInquiryQuestions: string[];
  learningExperiences: string[];
  learningResources: string[];
  assessmentMethods: string[];
  /** true for a slot beyond the last sub-strand's lessons — left as open revision/consolidation time. */
  isOpenSlot?: boolean;
}

export interface GeneratedScheme {
  rows: SchemeRow[];
  totalLessonsNeeded: number;
  totalSlotsAvailable: number;
  /** Sub-strands that didn't fit within the requested weeks, if any. */
  overflow: { strand: string; subStrand: string; lessonsShort: number }[];
}

/** Splits `items` across `slots` buckets, front-loaded and roughly proportional — e.g. 8 outcomes into 20
 * lesson-slots gives the earlier slots more of the finer-grained outcomes. Works whether items.length is
 * smaller or larger than slots. */
function distribute<T>(items: T[], slots: number): T[][] {
  const buckets: T[][] = Array.from({ length: slots }, () => []);
  if (slots === 0) return buckets;
  items.forEach((item, idx) => {
    const bucket = Math.min(slots - 1, Math.floor((idx * slots) / items.length));
    buckets[bucket].push(item);
  });
  return buckets;
}

export function generateScheme(subject: SchemeSubject, weeks: number, lessonsPerWeek: number): GeneratedScheme {
  const totalSlots = Math.max(0, weeks) * Math.max(0, lessonsPerWeek);

  const flatSubStrands = subject.strands.flatMap((strand) =>
    strand.subStrands.map((subStrand) => ({ strand: strand.name, subStrand }))
  );
  const totalLessonsNeeded = flatSubStrands.reduce((sum, s) => sum + s.subStrand.lessonCount, 0);

  const rows: SchemeRow[] = [];
  const overflow: GeneratedScheme["overflow"] = [];
  let slotIndex = 0;

  for (const { strand, subStrand } of flatSubStrands) {
    const remainingSlots = totalSlots - slotIndex;
    if (remainingSlots <= 0) {
      overflow.push({ strand, subStrand: subStrand.name, lessonsShort: subStrand.lessonCount });
      continue;
    }
    const lessonsHere = Math.min(subStrand.lessonCount, remainingSlots);
    if (lessonsHere < subStrand.lessonCount) {
      overflow.push({ strand, subStrand: subStrand.name, lessonsShort: subStrand.lessonCount - lessonsHere });
    }

    const outcomeBuckets = distribute(subStrand.specificLearningOutcomes, lessonsHere);
    const experienceBuckets = distribute(subStrand.learningExperiences, lessonsHere);

    for (let i = 0; i < lessonsHere; i++) {
      const week = Math.floor(slotIndex / lessonsPerWeek) + 1;
      const lesson = (slotIndex % lessonsPerWeek) + 1;
      const assessment = subject.assessmentMethods.length
        ? [subject.assessmentMethods[slotIndex % subject.assessmentMethods.length]]
        : [];

      rows.push({
        week,
        lesson,
        strand,
        subStrand: subStrand.name,
        specificLearningOutcomes: outcomeBuckets[i].length ? outcomeBuckets[i] : subStrand.specificLearningOutcomes.slice(0, 1),
        keyInquiryQuestions: subStrand.keyInquiryQuestions,
        learningExperiences: experienceBuckets[i].length ? experienceBuckets[i] : subStrand.learningExperiences.slice(0, 1),
        learningResources: subStrand.learningResources,
        assessmentMethods: assessment,
      });
      slotIndex++;
    }
  }

  // Leftover weeks beyond what the syllabus needs — mark as open revision/consolidation slots rather than
  // silently truncating the requested weeks.
  while (slotIndex < totalSlots) {
    const week = Math.floor(slotIndex / lessonsPerWeek) + 1;
    const lesson = (slotIndex % lessonsPerWeek) + 1;
    rows.push({
      week,
      lesson,
      strand: "",
      subStrand: "Revision / Consolidation",
      specificLearningOutcomes: [],
      keyInquiryQuestions: [],
      learningExperiences: [],
      learningResources: [],
      assessmentMethods: [],
      isOpenSlot: true,
    });
    slotIndex++;
  }

  return { rows, totalLessonsNeeded, totalSlotsAvailable: totalSlots, overflow };
}
