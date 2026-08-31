import { randChoice, shuffle } from "@/lib/rng";
import { buildChoicesFromStrings } from "@/skills/mathG8/mathUtils";
import type { Skill } from "@/lib/types";

// KICD Grade 6 Agriculture H.1 "Good Grooming — Body cleaning" names exactly four topics in its
// Suggested Learning Experiences parenthetical: managing sweat, acnes and pimples, menstrual
// hygiene, and care of pubic parts. All four are implemented below.
//
// Deliberate design choices for this sub-strand specifically (documented per the "explicitly
// declined with a reason" discipline):
// 1. NO VISUAL. This is personal-hygiene content about the body; a body-part/anatomical diagram
//    would be inappropriate for a Grade 6 quiz app and is not what KICD's own textbook register
//    uses (KICD keeps this content text-based and practice-focused, not diagram-based). This is a
//    text-only skill by design, not a missed visual-coverage check.
// 2. NO NAMED-ACTOR KENYAN SCENARIO POOL. Unlike other skills in this batch, this content is
//    inherently personal/first-person practical advice ("what should a learner do"), not a
//    named-actor story scenario — forcing a "Kevin in Kitale..." frame onto menstrual/pubic
//    hygiene content would read as odd and undermines the dignified, matter-of-fact register this
//    topic needs. Situational framing ("a learner has just finished games lesson...") is used
//    instead of named actors, per the task brief's carve-out for this skill.
// 3. FOUR QuestionKinds, not five. multiple-choice, fill-blank, categorize and click-match all fit
//    this content naturally (recall + topic sorting). There is no genuine sequence (ordering), no
//    spatial diagram (hotspot), and no numeric quantity (number-line) in this content — inventing
//    one would mean fabricating facts KICD does not state, which CURRICULUM-MINING-GUIDE.md and
//    RIGOR-STANDARDS.md both forbid. SKILL-QUALITY-STANDARDS.md explicitly allows capping at 4
//    when a 5th kind genuinely does not fit, and the task brief names this skill as the expected
//    case for that cap.

type Topic = "sweat" | "acne" | "menstrual" | "pubic";

const TOPIC_LABEL: Record<Topic, string> = {
  sweat: "Managing sweat and body odour",
  acne: "Acne and pimple care",
  menstrual: "Menstrual hygiene",
  pubic: "Pubic area hygiene",
};

interface GroomingFact {
  id: string;
  label: string; // the habit/practice
  reason: string; // why it matters
  topic: Topic;
}

const GROOMING_FACTS: GroomingFact[] = [
  // --- Managing sweat and body odour ---
  { id: "sw1", label: "Wash the whole body with soap and water every day", reason: "removes sweat and the bacteria that break sweat down into an unpleasant smell", topic: "sweat" },
  { id: "sw2", label: "Wear clean, freshly washed clothes each day", reason: "sweat-soaked clothes left unwashed let bacteria build up and cause odour", topic: "sweat" },
  { id: "sw3", label: "Dry the body fully after washing, especially the underarms", reason: "bacteria that cause odour thrive on damp, warm skin", topic: "sweat" },
  { id: "sw4", label: "Change out of sweaty games or PE kit soon after exercising", reason: "leaving sweaty kit on the body lets bacteria multiply and odour build up", topic: "sweat" },
  { id: "sw5", label: "Use a mild deodorant after washing, if needed", reason: "it helps control odour through the day once the skin is already clean and dry", topic: "sweat" },
  { id: "sw6", label: "Wash more often during hot weather or after heavy activity", reason: "more sweat means more bacteria unless it is washed off regularly", topic: "sweat" },
  { id: "sw7", label: "Choose breathable cotton clothing where possible", reason: "cotton absorbs sweat and lets skin dry faster than tight synthetic fabric", topic: "sweat" },
  { id: "sw8", label: "Keep fingernails short and clean", reason: "long, dirty nails can trap sweat, dirt and bacteria underneath them", topic: "sweat" },
  { id: "sw9", label: "Wash towels and bedding regularly", reason: "damp towels and bedding can hold onto sweat and bacteria between uses", topic: "sweat" },
  // --- Acne and pimple care ---
  { id: "ac1", label: "Wash the face gently twice a day with a mild soap or cleanser", reason: "it removes the excess oil and dirt that can clog pores and lead to pimples", topic: "acne" },
  { id: "ac2", label: "Avoid touching or picking at the face with dirty hands", reason: "hands carry bacteria and oil that can worsen breakouts and cause scarring", topic: "acne" },
  { id: "ac3", label: "Never pop or squeeze a pimple", reason: "squeezing can push bacteria deeper into the skin and cause scarring or infection", topic: "acne" },
  { id: "ac4", label: "Rinse sweat off the face soon after exercise", reason: "sweat mixed with oil left on the skin can block pores", topic: "acne" },
  { id: "ac5", label: "Use a clean towel or cloth to pat the face dry", reason: "reusing a dirty towel can spread bacteria straight back onto clean skin", topic: "acne" },
  { id: "ac6", label: "Avoid sharing face towels, cloths or cosmetics with others", reason: "sharing spreads oil and bacteria between people's skin", topic: "acne" },
  { id: "ac7", label: "Keep hair clean and away from the forehead", reason: "oily hair resting against the skin can clog nearby pores", topic: "acne" },
  { id: "ac8", label: "Be patient — pimples are a normal part of growing up and usually improve with good hygiene", reason: "hormonal changes during puberty increase oil (sebum) production, which is why acne is common at this age", topic: "acne" },
  { id: "ac9", label: "Change pillowcases regularly", reason: "a pillowcase collects oil and dead skin that can transfer back onto the face overnight", topic: "acne" },
  // --- Menstrual hygiene ---
  { id: "me1", label: "Change a sanitary pad or other menstrual product every four to six hours", reason: "leaving one on for too long increases the risk of odour and infection", topic: "menstrual" },
  { id: "me2", label: "Wash the hands before and after changing a sanitary pad", reason: "it prevents spreading germs between the hands and the body", topic: "menstrual" },
  { id: "me3", label: "Wrap used sanitary pads before placing them in a bin, and never flush them", reason: "flushing them can block toilets and drains, so wrapping and binning is the hygienic way to dispose of them", topic: "menstrual" },
  { id: "me4", label: "Wash the genital area gently with clean water during menstruation", reason: "it keeps the area clean and helps prevent irritation and infection", topic: "menstrual" },
  { id: "me5", label: "Keep a spare sanitary pad or menstrual product in a school bag", reason: "being prepared avoids discomfort or stained clothing if a period starts unexpectedly", topic: "menstrual" },
  { id: "me6", label: "Bathe daily during menstruation, the same as any other day", reason: "regular bathing controls odour and keeps the whole body clean, and periods are not a reason to stop washing", topic: "menstrual" },
  { id: "me7", label: "Avoid using strongly scented soaps or sprays directly on the genital area", reason: "scented products can irritate sensitive skin and disrupt its natural balance", topic: "menstrual" },
  { id: "me8", label: "Talk to a trusted adult, nurse or teacher about period pain or unusual symptoms", reason: "getting guidance early helps manage discomfort and catch problems early", topic: "menstrual" },
  { id: "me9", label: "Keep a simple record of the days of the monthly cycle", reason: "it helps a girl prepare with pads in advance and plan around her period", topic: "menstrual" },
  // --- Pubic area hygiene ---
  { id: "pu1", label: "Wash the pubic area gently with clean water daily", reason: "regular washing removes sweat and bacteria that can cause odour or irritation", topic: "pubic" },
  { id: "pu2", label: "Wear clean, dry cotton underwear and change it daily", reason: "cotton allows air to circulate and reduces the moisture that bacteria need to grow", topic: "pubic" },
  { id: "pu3", label: "Dry the area fully after washing or swimming", reason: "leftover moisture creates a warm, damp environment where bacteria and irritation can develop", topic: "pubic" },
  { id: "pu4", label: "Avoid wearing damp or wet underwear for long periods", reason: "prolonged dampness raises the risk of irritation and infection", topic: "pubic" },
  { id: "pu5", label: "Use plain water or a very mild, unscented soap in this area", reason: "strong scented soaps can disrupt the skin's natural balance and cause irritation", topic: "pubic" },
  { id: "pu6", label: "Wipe from front to back after using the toilet", reason: "it prevents bacteria from being spread to areas where they can cause infection", topic: "pubic" },
  { id: "pu7", label: "Report any unusual itching, odour or discomfort to a trusted adult or nurse", reason: "early attention to unusual symptoms helps catch and treat problems quickly", topic: "pubic" },
  { id: "pu8", label: "Avoid sharing underwear or swimwear with others", reason: "sharing can spread bacteria or infections between people", topic: "pubic" },
];

interface Templ {
  prompt: string;
  correct: string;
  wrong: string[];
  explanation: string;
}

const MC_TEMPLATES: Templ[] = [
  { prompt: "Why does washing the body daily with soap and water help control body odour?", correct: "It removes sweat and the bacteria that break sweat down into a smell", wrong: ["It stops the body from producing sweat completely", "It makes the skin lighter", "It replaces the need to wear clean clothes"], explanation: "Sweat itself is nearly odourless — the smell comes from bacteria on the skin breaking it down. Washing removes both, but it cannot stop the body from sweating, which is a normal body process." },
  { prompt: "A learner has just finished playing football during games lesson and is sweaty. What is most important to do once they get home?", correct: "Wash the body and change into clean, dry clothes as soon as possible", wrong: ["Wait until the next morning, since one day will not matter", "Spray perfume over the sweaty clothes instead of washing", "Only wash the face, since sweat mainly affects the face"], explanation: "Sweat left on the skin or clothes lets odour-causing bacteria multiply. Perfume only masks a smell rather than removing its cause, and sweat affects the whole body, not just the face." },
  { prompt: "Why should sweaty PE kit be washed soon after use rather than left in a bag for days?", correct: "Bacteria multiply quickly on damp, sweaty fabric and cause a stronger smell over time", wrong: ["Sweat stains cannot ever be removed once they dry", "Leaving kit in a bag makes the fabric shrink", "PE kit does not need washing as often as other clothes"], explanation: "The longer damp, sweaty fabric sits unwashed, the more bacteria grow on it, making the odour worse — it has nothing to do with shrinking." },
  { prompt: "Why is drying the underarms fully after a bath part of good body-odour control?", correct: "Bacteria that cause odour grow best in warm, damp conditions, so drying reduces them", wrong: ["Wet underarms attract more sweat than dry ones", "Drying the underarms whitens the skin", "It is not actually necessary if soap was used"], explanation: "Even after washing away most bacteria, leaving skin damp gives any remaining bacteria ideal conditions to multiply again quickly." },
  { prompt: "Why is cotton clothing often recommended for managing sweat and body odour?", correct: "Cotton absorbs sweat and lets air reach the skin, helping it dry faster than tight synthetic fabric", wrong: ["Cotton prevents the body from sweating at all", "Cotton kills the bacteria that cause odour", "Cotton is always cooler in colour than synthetic fabric"], explanation: "Cotton does not stop sweating or kill bacteria — its breathability just helps sweat evaporate faster, giving bacteria less time to multiply." },
  { prompt: "A learner notices a smell from their shoes and socks after a hot day. What is the most likely cause?", correct: "Sweat trapped inside the socks and shoes, where bacteria have multiplied in the damp, warm space", wrong: ["The shoes are simply old and all old shoes smell", "Feet do not sweat, so the smell must come from outside", "Washing the feet cannot help with shoe odour"], explanation: "Feet sweat like the rest of the body, and shoes trap that moisture in a warm space, which is ideal for odour-causing bacteria. Regularly washing feet and airing shoes both help." },
  { prompt: "Why should towels and bedding be washed regularly as part of body-odour hygiene?", correct: "They pick up sweat and bacteria from the body and can pass it back if left unwashed", wrong: ["Towels and bedding do not come into contact with sweat", "Washing bedding has no effect on body odour", "Only clothes worn outside the house need regular washing"], explanation: "Anything that touches the skin regularly, including towels and bedding, collects sweat and bacteria over time and should be washed to stay hygienic." },
  { prompt: "What is a mild deodorant best used for, once the body is already clean?", correct: "Helping control odour through the day after washing, not replacing washing itself", wrong: ["Replacing the need to wash the body", "Stopping the body from sweating completely", "Curing acne on the face"], explanation: "A deodorant works alongside washing, not instead of it — it does not stop sweating and has nothing to do with facial acne." },
  { prompt: "Why does washing the face gently twice a day with a mild cleanser help manage acne?", correct: "It removes excess oil and dirt that can otherwise clog pores and lead to pimples", wrong: ["It permanently stops the skin from producing any oil", "It only helps if done many times in a single hour", "It works by drying out the entire face until it peels"], explanation: "Regular gentle washing keeps pores from clogging without over-drying the skin — the skin naturally produces oil, and washing manages the excess rather than stopping it entirely." },
  { prompt: "Why is it unwise to squeeze or pop a pimple?", correct: "It can push bacteria deeper into the skin and lead to scarring or a worse infection", wrong: ["Squeezing always makes a pimple disappear instantly", "It has no effect on the skin either way", "It only matters for pimples on the nose"], explanation: "Squeezing forces bacteria and oil deeper under the skin rather than removing them, which is why it often makes a breakout worse and can leave a scar." },
  { prompt: "Why should a learner avoid touching their face often with unwashed hands?", correct: "Hands pick up bacteria and oil through the day that can transfer to the face and worsen breakouts", wrong: ["Touching the face has no connection to acne at all", "Only touching with the left hand causes pimples", "Acne is caused only by diet, never by touching the skin"], explanation: "Hands touch many surfaces during the day and carry bacteria that can be transferred to the face, adding to the oil and dirt that clog pores." },
  { prompt: "Why might sharing a face towel with someone else be a bad hygiene habit?", correct: "It can spread oil, bacteria and skin conditions from one person's skin to another's", wrong: ["Shared towels dry faster than personal ones", "It has no hygiene effect since towels are just cloth", "Sharing towels only matters for very dirty hands, not faces"], explanation: "Anything that touches the skin, including a shared towel, can transfer oil and bacteria between people, which is why personal towels are recommended." },
  { prompt: "Why is acne especially common among Grade 6 learners going through puberty?", correct: "Hormonal changes during puberty increase oil (sebum) production in the skin, which can clog pores", wrong: ["Acne only happens to learners who do not wash at all", "Acne is caused entirely by eating sugary foods", "Acne appears only in learners who sweat excessively"], explanation: "Puberty brings hormonal changes that increase how much oil the skin produces, which is the main reason acne becomes more common at this age, even with good hygiene." },
  { prompt: "Why is it recommended to change pillowcases regularly as part of skin hygiene?", correct: "A pillowcase collects oil and dead skin overnight and can transfer it back onto the face", wrong: ["Pillowcases have no contact with the skin during sleep", "Changing pillowcases affects hair but never the skin", "Old pillowcases only cause problems with eyesight"], explanation: "Because the face rests against the pillowcase for hours each night, oil and dead skin build up on it and can be transferred back to the skin if it is not changed regularly." },
  { prompt: "Why is it important to change a sanitary pad or other menstrual product every four to six hours?", correct: "Leaving one on for too long increases the risk of unpleasant odour and infection", wrong: ["Pads only need changing once a full day", "Changing more often has no hygiene benefit at all", "It is only necessary on the heaviest day of the period"], explanation: "Regular changing keeps the area clean and reduces the time bacteria have to grow, which lowers the risk of odour and infection throughout the whole period, not just the heaviest day." },
  { prompt: "Why should the hands be washed both before and after changing a sanitary pad?", correct: "It prevents germs from being spread between the hands and the body", wrong: ["It is only needed after changing, never before", "Handwashing has no connection to menstrual hygiene", "It is only necessary if the hands look visibly dirty"], explanation: "Washing before protects the body from germs on the hands, and washing after protects against germs picked up during the change — both matter, not just one." },
  { prompt: "What is the correct way to dispose of a used sanitary pad?", correct: "Wrap it and place it in a bin — never flush it down a toilet", wrong: ["Flush it down the toilet like any other waste", "Leave it unwrapped in any nearby bin", "Bury it in the school compound"], explanation: "Sanitary pads do not break down in water and can block toilets and drains if flushed, so wrapping and binning is the hygienic and practical method." },
  { prompt: "Why should a girl continue to bathe daily during her period, the same as any other day?", correct: "Regular bathing controls odour and keeps the whole body clean; menstruation is not a reason to stop washing", wrong: ["Bathing during a period is unsafe and should be avoided", "Bathing has no effect on hygiene during menstruation", "Only the face needs washing during a period"], explanation: "Some learners mistakenly believe bathing should stop during menstruation — in fact regular bathing is just as important, and helps manage odour and comfort." },
  { prompt: "Why is it wise for a girl to keep a spare sanitary pad in her school bag?", correct: "Being prepared avoids discomfort or stained clothing if her period starts unexpectedly", wrong: ["Spare pads are only useful at home, never at school", "It is unnecessary since periods always start at predictable times", "A spare pad is only needed once a period has already started"], explanation: "Periods can start without much warning, so keeping a spare pad ready means a girl is prepared no matter when it begins during the school day." },
  { prompt: "Why should strongly scented soaps or sprays be avoided on the genital area during menstruation?", correct: "Scented products can irritate sensitive skin and disrupt its natural balance", wrong: ["Scented products always prevent infection better than plain water", "Scented products have no effect on this part of the body", "Scented products are recommended by nurses for this area"], explanation: "This area's skin is sensitive, and strong fragrances or chemicals in scented products are more likely to cause irritation than to help — plain water or a very mild soap is the safer choice." },
  { prompt: "Why is talking to a trusted adult, nurse or teacher about period pain a good hygiene habit?", correct: "Getting guidance early helps manage discomfort and can catch any unusual problem early", wrong: ["Period pain should always be kept private and never discussed", "Talking about it has no benefit at all", "Only doctors, never teachers or trusted adults, can be told about it"], explanation: "Period pain is common and manageable, and sharing concerns with a trusted adult, nurse, or teacher can lead to helpful advice or early treatment if something is wrong." },
  { prompt: "Why does washing the pubic area gently with clean water daily matter for personal hygiene?", correct: "It removes sweat and bacteria that can otherwise cause odour or irritation in that area", wrong: ["Daily washing there can cause more irritation than it prevents", "This part of the body naturally never needs washing", "Only washing once a week is recommended for this area"], explanation: "Like the rest of the body, this area accumulates sweat and bacteria daily, and gentle regular washing keeps it clean and comfortable." },
  { prompt: "Why is wearing clean, dry cotton underwear and changing it daily recommended?", correct: "Cotton lets air circulate and reduces the moisture that bacteria need to grow", wrong: ["Cotton underwear should only be changed once a week", "Cotton traps more moisture than synthetic fabric does", "Underwear material has no effect on hygiene in this area"], explanation: "Cotton is breathable, so it helps keep the area dry, while tighter synthetic fabric tends to trap moisture, which favours bacterial growth — this is the opposite of the second wrong answer's claim." },
  { prompt: "Why is drying the pubic area fully after washing or swimming important?", correct: "Leftover moisture creates a warm, damp environment where bacteria and irritation can develop", wrong: ["Drying the area has no real hygiene benefit", "It is only necessary after swimming, never after washing", "Moisture in this area always evaporates on its own within seconds"], explanation: "Any moisture left behind, whether from bathing or swimming, creates conditions bacteria thrive in, so drying fully afterwards matters every time, not just after swimming." },
  { prompt: "Why should damp or wet underwear not be worn for long periods?", correct: "Prolonged dampness raises the risk of irritation and infection in that area", wrong: ["Damp underwear dries the skin out too much", "Wearing damp underwear has no health effect at all", "Only wet swimwear, never wet underwear, causes a problem"], explanation: "Damp fabric held against the skin for a long time keeps the area moist, which increases the chance of irritation or infection — swimwear and underwear both carry this same risk." },
  { prompt: "Why is wiping from front to back after using the toilet recommended?", correct: "It prevents bacteria from being spread to areas where they can cause infection", wrong: ["The wiping direction makes no hygienic difference", "Wiping back to front is actually the safer direction", "This rule only applies to adults, not Grade 6 learners"], explanation: "Wiping from front to back moves away from areas more prone to bacteria, reducing the chance of spreading bacteria to areas where it can cause infection — this hygiene habit applies at any age." },
  { prompt: "Why should underwear or swimwear never be shared between people?", correct: "Sharing can spread bacteria or infections from one person's body to another's", wrong: ["Shared underwear is always washed before every use, so it is safe", "Sharing has no hygiene risk since fabric cannot carry bacteria", "This rule only applies to shared towels, not underwear or swimwear"], explanation: "Underwear and swimwear are in close, direct contact with sensitive skin, so sharing them carries a real risk of spreading bacteria or infection between people." },
  { prompt: "Why is it useful for a girl to keep a simple record of the days of her monthly cycle?", correct: "It helps her prepare with pads in advance and plan around her period", wrong: ["Keeping such a record has no practical use", "It is only useful for adult women, never for Grade 6 learners", "The exact days of a cycle never need to be tracked"], explanation: "Knowing roughly when her period is due helps a girl be prepared with menstrual products and plan activities, reducing surprise and discomfort." },
  { prompt: "A learner reports unusual itching and odour in the genital area to a school nurse. Why is reporting this the right response, rather than just ignoring it and hoping it goes away?", correct: "Early attention to unusual symptoms helps catch and treat a possible problem quickly", wrong: ["Unusual symptoms in this area should always be kept completely private and never mentioned", "Itching and odour are always harmless and never worth mentioning", "Only a doctor, never a school nurse, should ever be told about this"], explanation: "Unusual symptoms can be a sign something needs attention, and reporting them early — to a nurse, teacher or trusted adult — leads to faster help than staying silent." },
  { prompt: "Which single habit most directly reduces both body odour and the risk of pimples caused by trapped sweat and oil?", correct: "Washing the body regularly with soap and water and drying fully afterwards", wrong: ["Wearing perfume instead of washing", "Avoiding exercise so the body never sweats", "Washing only the hands several times a day"], explanation: "Regular washing and drying removes the sweat, oil and bacteria that cause both body odour and clogged pores — avoiding exercise or only washing hands does not address either problem." },
];

const FILL_BLANK_TEMPLATES = [
  { before: "The unpleasant smell from unwashed sweat is caused mainly by ", after: " breaking it down on the skin.", correctAnswer: "bacteria" },
  { before: "Washing the body daily with soap and ", after: " helps prevent body odour.", correctAnswer: "water" },
  { before: "Sweaty games or PE kit should be ", after: " soon after exercise to prevent odour building up.", correctAnswer: "washed" },
  { before: "Bacteria that cause body odour grow best on skin that is warm and ", after: ".", correctAnswer: "damp" },
  { before: "Cotton clothing helps manage sweat because it is ", after: " and lets skin dry faster.", correctAnswer: "breathable" },
  { before: "A mild ", after: " can help control odour once the skin is already clean and dry.", correctAnswer: "deodorant" },
  { before: "The face should be washed gently ", after: " a day to help manage acne.", correctAnswer: "twice" },
  { before: "Squeezing a pimple can push bacteria deeper into the skin and cause ", after: ".", correctAnswer: "scarring" },
  { before: "During puberty, hormonal changes increase ", after: " production, which is a common cause of acne.", correctAnswer: "oil" },
  { before: "Touching the face with unwashed ", after: " can transfer bacteria and worsen breakouts.", correctAnswer: "hands" },
  { before: "A ", after: " should be washed regularly since it collects oil and dead skin overnight.", correctAnswer: "pillowcase" },
  { before: "A sanitary pad or menstrual product should be changed roughly every four to ", after: " hours.", correctAnswer: "six" },
  { before: "Hands should be washed before and after ", after: " a sanitary pad.", correctAnswer: "changing" },
  { before: "A used sanitary pad should be wrapped and placed in a ", after: ", never flushed down a toilet.", correctAnswer: "bin" },
  { before: "It is safe and recommended to ", after: " daily even during menstruation.", correctAnswer: "bathe" },
  { before: "Keeping a spare sanitary pad in a school bag helps a girl be ", after: " if her period starts unexpectedly.", correctAnswer: "prepared" },
  { before: "Strongly scented soaps can ", after: " sensitive skin during menstruation and should be avoided.", correctAnswer: "irritate" },
  { before: "A learner with severe period pain should talk to a trusted adult, nurse or ", after: ".", correctAnswer: "teacher" },
  { before: "The pubic area should be washed gently with clean water on a ", after: " basis.", correctAnswer: "daily" },
  { before: "Wearing clean, dry ", after: " underwear helps keep the pubic area dry and reduces bacteria.", correctAnswer: "cotton" },
  { before: "After washing or swimming, the pubic area should be dried ", after: " to avoid trapped moisture.", correctAnswer: "fully" },
  { before: "Wearing damp underwear for long periods raises the risk of ", after: " and infection.", correctAnswer: "irritation" },
  { before: "After using the toilet, wiping from front to ", after: " helps prevent spreading bacteria.", correctAnswer: "back" },
  { before: "Underwear and swimwear should never be ", after: " between people because of the hygiene risk.", correctAnswer: "shared" },
  { before: "Keeping a simple record of the monthly cycle helps a girl plan ahead and stay ", after: ".", correctAnswer: "prepared" },
  { before: "Unusual itching, odour or discomfort in the genital area should be reported to a trusted adult or ", after: ".", correctAnswer: "nurse" },
  { before: "Body cleanliness enhances personal hygiene and also builds a learner's ", after: " and self-confidence.", correctAnswer: "self-esteem" },
  { before: "Dead skin and oil that clog pores are a common cause of ", after: " and pimples.", correctAnswer: "acne" },
  { before: "Sweat itself has little smell — the odour mainly comes from bacteria breaking it down on the ", after: ".", correctAnswer: "skin" },
  { before: "Changing pillowcases regularly helps prevent oil transferring back onto the ", after: " overnight.", correctAnswer: "face" },
  { before: "A very mild, ", after: " soap is gentler on sensitive skin than a strongly perfumed one.", correctAnswer: "unscented" },
] as const;

function factsInTopic(topic: Topic) {
  return GROOMING_FACTS.filter((f) => f.topic === topic);
}

const FILL_BLANK_PROMPTS = [
  "Complete the sentence about body cleanliness.",
  "Fill in the missing word about body cleanliness.",
  "Complete this sentence about good grooming.",
  "Supply the missing word in this sentence about body cleanliness.",
  "Fill in the blank to complete the fact about good grooming.",
  "Complete the missing word in this statement about personal hygiene.",
];

const CATEGORIZE_PROMPTS = [
  "Sort each grooming practice by which body-cleanliness topic it belongs to.",
  "Group these grooming practices under the correct body-cleanliness topic.",
  "Decide which body-cleanliness topic each practice below belongs to, and sort it there.",
  "Sort each practice into the topic it best fits.",
  "Place each grooming practice into the bucket for the topic it relates to.",
  "Read each practice and sort it under the matching body-cleanliness topic.",
];

const CLICK_MATCH_PROMPT_TEMPLATES = [
  (topic: string) => `Match each ${topic} practice to why it matters.`,
  (topic: string) => `Pair each ${topic} habit with the reason it matters.`,
  (topic: string) => `Connect each ${topic} practice to why it is important.`,
  (topic: string) => `Link each ${topic} habit to its correct reason.`,
  (topic: string) => `Match each ${topic} practice below to the reason it is recommended.`,
  (topic: string) => `Pair each ${topic} habit with the explanation of why it helps.`,
];

export const goodGrooming: Skill = {
  id: "g6-ag-h-good-grooming",
  code: "H.1",
  subjectId: "agriculture-nutrition",
  strandId: "g6-ag-hygiene",
  grade: 6,
  title: "Good Grooming — Body Cleaning",
  description:
    "Practices that enhance body cleanliness for personal hygiene: managing sweat and body odour, caring for acne and pimples, menstrual hygiene, and care of the pubic area.",
  generate(rng) {
    const branch = randChoice(rng, ["reasoning", "fill-blank", "categorize", "click-match"] as const);
    const hint = "Think about washing, drying, and changing regularly — most good grooming habits come down to keeping the body clean and dry.";

    if (branch === "reasoning") {
      const q = randChoice(rng, MC_TEMPLATES);
      const { choices, correctIndex } = buildChoicesFromStrings(rng, q.correct, q.wrong, 3);
      return {
        kind: "multiple-choice",
        prompt: q.prompt,
        choices,
        correctIndex,
        layout: "list",
        hint,
        explanation: q.explanation,
      };
    }

    if (branch === "fill-blank") {
      const fb = randChoice(rng, FILL_BLANK_TEMPLATES);
      return {
        kind: "fill-blank",
        prompt: randChoice(rng, FILL_BLANK_PROMPTS),
        before: fb.before,
        after: fb.after,
        correctAnswer: fb.correctAnswer,
        inputMode: "text",
        hint,
        explanation: `The sentence reads: "${fb.before}${fb.correctAnswer}${fb.after}"`,
      };
    }

    if (branch === "categorize") {
      const topics: Topic[] = ["sweat", "acne", "menstrual", "pubic"];
      const chosen = shuffle(rng, GROOMING_FACTS).slice(0, 10);
      const items = chosen.map((f) => ({ id: f.id, label: f.label }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((f) => (correctBucket[f.id] = f.topic));
      return {
        kind: "categorize",
        prompt: randChoice(rng, CATEGORIZE_PROMPTS),
        items,
        buckets: topics.map((t) => ({ id: t, label: TOPIC_LABEL[t] })),
        correctBucket,
        hint,
        explanation: chosen.map((f) => `"${f.label}" — ${TOPIC_LABEL[f.topic]}, because ${f.reason}.`).join(" "),
      };
    }

    // click-match: reuse the same GROOMING_FACTS pool (habit -> reason), a different
    // interaction shape on the same facts, per SKILL-QUALITY-STANDARDS.md's guidance.
    const topic = randChoice(rng, ["sweat", "acne", "menstrual", "pubic"] as const);
    const pool = factsInTopic(topic);
    const chosen = shuffle(rng, pool).slice(0, Math.min(6, pool.length));
    const tokens = shuffle(rng, chosen.map((f) => ({ id: f.id, label: f.label })));
    const targets = shuffle(rng, chosen.map((f) => ({ id: f.id, label: f.reason.charAt(0).toUpperCase() + f.reason.slice(1) })));
    const correctMap: Record<string, string> = {};
    chosen.forEach((f) => (correctMap[f.id] = f.id));
    return {
      kind: "click-match",
      prompt: randChoice(rng, CLICK_MATCH_PROMPT_TEMPLATES)(TOPIC_LABEL[topic].toLowerCase()),
      tokens,
      targets,
      correctMap,
      hint,
      explanation: chosen.map((f) => `${f.label} — ${f.reason}.`).join(" "),
    };
  },
};
