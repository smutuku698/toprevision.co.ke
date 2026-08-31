import { randChoice, shuffle } from "@/lib/rng";
import type { RNG } from "@/lib/rng";
import { buildChoicesFromStrings } from "@/skills/mathG8/mathUtils";
import type { Skill } from "@/lib/types";
import { g6Name, g6Place } from "./sharedG6Ag";

// KICD Grade 6 Agriculture H.2 "Identifying Stains" — the design names exactly two stain types
// (blood and grass) as the content pool; other stains appear below only as clearly-labelled
// wrong-answer distractors, never as core content, per the task brief.

type Stain = "blood" | "grass";

const STAIN_LABEL: Record<Stain, string> = { blood: "Blood stain", grass: "Grass stain" };

interface Clue {
  id: string;
  label: string; // short clue
  detail: string; // fuller description of why it points to that stain
  stain: Stain;
}

const CLUES: Clue[] = [
  // --- Blood ---
  { id: "b1", label: "Reddish-brown mark that was dark red when fresh", detail: "Fresh blood is bright to dark red and dries to a reddish-brown colour", stain: "blood" },
  { id: "b2", label: "Mark that appeared after a small cut or scrape", detail: "A cut or scrape is one of the most common everyday causes of a blood stain", stain: "blood" },
  { id: "b3", label: "Mark that appeared after a nosebleed", detail: "A nosebleed often drips onto a shirt collar or handkerchief, leaving a blood stain", stain: "blood" },
  { id: "b4", label: "Mark that occurs naturally during menstruation", detail: "Menstrual blood can stain underwear or clothing and is a normal part of the monthly cycle", stain: "blood" },
  { id: "b5", label: "Patch that feels stiff and slightly crusty once dry", detail: "Blood contains protein, which stiffens fabric as it dries", stain: "blood" },
  { id: "b6", label: "Mark found near a plaster or bandage after an injury", detail: "Small injuries treated with a plaster or bandage often leave a nearby blood stain", stain: "blood" },
  { id: "b7", label: "Stain that darkens and turns browner the longer it is left", detail: "Blood oxidises (reacts with air) over time, turning from red to a deeper brown", stain: "blood" },
  { id: "b8", label: "Small, localised spot rather than a large smeared patch", detail: "Blood stains from a cut or nosebleed are usually small and concentrated in one spot", stain: "blood" },
  { id: "b9", label: "Mark on a sports kit after a fall or knock during a game", detail: "A fall during sport is a common cause of a scrape that bleeds onto clothing", stain: "blood" },
  { id: "b10", label: "Mark on a shirt cuff or collar after a minor injury", detail: "Cuffs and collars often brush against a fresh cut, picking up a blood stain", stain: "blood" },
  { id: "b11", label: "Mark on a bedsheet or pillowcase overnight", detail: "A scratch, nosebleed, or menstrual flow can leave a blood stain on bedding overnight", stain: "blood" },
  { id: "b12", label: "Mark that is a protein-based stain from cells in the fluid", detail: "Blood is rich in protein, which is why heat can set it permanently into fabric", stain: "blood" },
  { id: "b13", label: "Mark that appeared after a scratch while playing outdoors", detail: "Playing outdoors often leads to small scratches that bleed a little", stain: "blood" },
  { id: "b14", label: "Stain that sets more firmly into fabric the longer it is left untreated", detail: "The protein in blood binds to fabric fibres over time, making old stains harder to remove", stain: "blood" },
  { id: "b15", label: "Mark that appeared straight after a minor accident with a sharp tool", detail: "A slip with a sharp tool such as a knife or panga can cause a cut that bleeds onto clothing", stain: "blood" },
  { id: "b16", label: "Dark red mark that has not yet fully dried", detail: "Fresh, still-wet blood is usually bright to dark red before it dries and browns", stain: "blood" },
  // --- Grass ---
  { id: "g1", label: "Green or yellowish-green mark", detail: "Grass contains chlorophyll, a green pigment that stains fabric green", stain: "grass" },
  { id: "g2", label: "Mark that appeared after playing football or running on a field", detail: "Sport played on grass is one of the most common causes of a grass stain", stain: "grass" },
  { id: "g3", label: "Mark that appeared after farm work such as weeding or slashing grass", detail: "Farm work involving grass or weeds regularly leaves green stains on clothing", stain: "grass" },
  { id: "g4", label: "Mark that appeared after kneeling or sitting directly on a lawn", detail: "Kneeling on grass presses the plant's pigment straight into the fabric", stain: "grass" },
  { id: "g5", label: "Mark that appeared after sliding on a grassy pitch during a game", detail: "A sliding tackle or dive on grass rubs the plant's pigment deep into the fabric", stain: "grass" },
  { id: "g6", label: "Mark that is a pigment-based stain, not from a body fluid", detail: "Grass stains come from chlorophyll pigment in the plant, unlike a body-fluid stain such as blood", stain: "grass" },
  { id: "g7", label: "Mark commonly found on trouser knees after outdoor play", detail: "The knees are the part of trousers most likely to touch grass during play", stain: "grass" },
  { id: "g8", label: "Mark commonly found on socks and shoes after walking through wet grass", detail: "Wet grass transfers its green pigment easily onto socks and shoes", stain: "grass" },
  { id: "g9", label: "Mark common on school uniform trousers or skirts during games lessons", detail: "Games lessons often involve sitting, kneeling or falling on grass", stain: "grass" },
  { id: "g10", label: "Mark that appeared after lying on a lawn during a picnic", detail: "Lying directly on grass presses its pigment into the back of a shirt", stain: "grass" },
  { id: "g11", label: "Mark that spreads in a smudged pattern rather than a small dot", detail: "Grass is usually rubbed or pressed across a wider area of fabric, unlike a small blood spot", stain: "grass" },
  { id: "g12", label: "Mark that does not stiffen the fabric the way blood does", detail: "Grass stains do not contain the protein that makes a dried blood stain feel crusty", stain: "grass" },
  { id: "g13", label: "Mark that appeared after helping to slash or clear grass on the shamba", detail: "Clearing grass by hand or panga on a farm often leaves green marks on clothing", stain: "grass" },
  { id: "g14", label: "Mark common on the knees of school shorts after outdoor play", detail: "Shorts expose the knees, which are the part most likely to touch grass during play", stain: "grass" },
  { id: "g15", label: "Mark that appeared after brushing against wet morning grass", detail: "Dew-covered grass in the early morning transfers its pigment easily onto clothing", stain: "grass" },
  { id: "g16", label: "Green mark that looks faded because the item has already been washed once", detail: "A grass stain that survives one wash often looks paler but is still visibly green", stain: "grass" },
];

interface ScenarioMC {
  prompt: string;
  correct: string;
  wrong: string[];
  explanation: string;
}

const IDENTIFY_TEMPLATES: ((rng: RNG) => ScenarioMC)[] = [
  (rng) => { const who = g6Name(rng); return {
    prompt: `${who} comes home from games lesson with a green, smudged mark on the knee of their school shorts. What kind of stain is this most likely to be?`,
    correct: "A grass stain, from kneeling or falling on the field during games",
    wrong: ["A blood stain, because all stains from sport are blood", "An oil stain, since games kits often touch machinery", "It cannot be identified without washing it first"],
    explanation: "A green, smudged mark on the knee after games lesson is a classic sign of a grass stain — the green colour comes from chlorophyll pigment in the grass, not from blood.",
  }; },
  (rng) => { const p = g6Place(rng); return {
    prompt: `A learner in ${p} notices a small, dark reddish-brown mark near the collar of their shirt that appeared after a nosebleed. What kind of stain is this?`,
    correct: "A blood stain, from the nosebleed",
    wrong: ["A grass stain, since collars often touch grass", "A rust stain from a metal button", "It must be old dirt, unrelated to the nosebleed"],
    explanation: "A reddish-brown mark that appeared right after a nosebleed is a blood stain — blood dries from dark red to a reddish-brown colour.",
  }; },
  (rng) => ({
    prompt: `${g6Name(rng)} finds a stiff, crusty patch on a sleeve after a small cut while playing. Which detail most strongly points to this being a blood stain rather than a grass stain?`,
    correct: "The patch feels stiff and crusty, which happens because blood's protein hardens fabric as it dries",
    wrong: ["The mark is on a sleeve, and grass stains never appear on sleeves", "The mark is small, and grass stains are always larger", "Stiffness has nothing to do with what caused the stain"],
    explanation: "Blood contains protein, which stiffens and hardens fabric as it dries — grass stains, being pigment-based, do not cause this crusty stiffness.",
  }),
  (rng) => ({
    prompt: `A green mark appears on the back of ${g6Name(rng)}'s shirt after lying down during a picnic in ${g6Place(rng)}. What caused this stain?`,
    correct: "Grass, from lying directly on the lawn during the picnic",
    wrong: ["Blood, since the mark is on the back of the shirt", "Rust from a metal picnic chair", "It cannot be grass because grass stains are always on the knees"],
    explanation: "Grass stains form wherever fabric presses against grass, not only on the knees — lying on a lawn presses chlorophyll pigment into the back of a shirt.",
  }),
  (rng) => ({
    prompt: `${g6Name(rng)} is helping slash overgrown grass on the family shamba near ${g6Place(rng)} and notices green marks on their trousers afterwards. What is the most likely cause?`,
    correct: "Grass pigment (chlorophyll) transferred onto the trousers while slashing",
    wrong: ["Blood from a cut during the farm work", "Soil, which always looks bright green when wet", "The marks cannot be identified from a farm work context"],
    explanation: "Handling and slashing grass presses its green chlorophyll pigment directly onto fabric, producing a classic grass stain.",
  }),
  (rng) => ({
    prompt: `A dark red mark on ${g6Name(rng)}'s pillowcase is fresh and has not yet dried. What kind of stain is this most likely to be, and what will happen to its colour as it dries?`,
    correct: "A blood stain — it will darken and turn a reddish-brown colour as it dries",
    wrong: ["A grass stain — it will turn a deeper green as it dries", "A blood stain — it will turn bright orange as it dries", "The colour of a stain never changes once it forms"],
    explanation: "Fresh blood is dark red and oxidises (reacts with air) as it dries, turning reddish-brown — grass stains stay green rather than changing colour dramatically.",
  }),
  (rng) => ({
    prompt: `Two stains appear on ${g6Name(rng)}'s uniform after games lesson: one is a small stiff red-brown dot on the knee (from a scrape), the other is a wider green smudge across the same knee. How many different stain types are present?`,
    correct: "Two — a blood stain from the scrape and a separate grass stain from the field",
    wrong: ["Just one stain, since they are in the same area", "Just one stain, because blood always looks green once it dries near grass", "It is impossible for two different stains to be on the same knee"],
    explanation: "A scrape produces a small, stiff blood stain, while contact with the field separately produces a wider green grass stain — both can occur on the same knee from the same fall.",
  }),
  (rng) => ({
    prompt: `${g6Name(rng)} notices that a stain on their socks does not feel stiff at all, and is a smudged yellow-green colour after walking through wet grass. What kind of stain is this?`,
    correct: "A grass stain — pigment-based stains like grass do not stiffen fabric the way blood does",
    wrong: ["A blood stain, since all stains from outdoor activity are blood", "It cannot be determined without a laboratory test", "A rust stain, because wet grass always contains iron"],
    explanation: "Grass stains come from plant pigment, not protein, so they do not stiffen fabric — this is a key difference from blood stains.",
  }),
  (rng) => ({
    prompt: `${g6Name(rng)} is trying to work out whether an old, dark brown mark on a school shirt is a very old blood stain or a very old grass stain. What clue would best help decide?`,
    correct: "Whether the fabric at that spot feels stiff (pointing to blood) or is simply discoloured without stiffness (pointing to grass)",
    wrong: ["The colour alone is always enough, since blood and grass never look similar when old", "Old stains cannot be identified by any method", "The size of the stain always tells you which one it is"],
    explanation: "Over time, both stains can darken and become harder to tell apart by colour alone, so texture (blood's protein stiffens fabric) becomes the more reliable clue." ,
  }),
  (rng) => ({
    prompt: `${g6Name(rng)} is sorting a pile of laundry in ${g6Place(rng)} and needs to identify which marks are grass stains before treating them. Which clue is most reliable for spotting a grass stain?`,
    correct: "A green or yellowish-green colour, often on the knees, socks, or shoes",
    wrong: ["A reddish-brown, stiff patch", "A stain that only appears on bedsheets", "A stain that always smells strongly"],
    explanation: "Grass stains are pigment-based and green or yellowish-green, most often on parts of clothing that touch the ground during play or farm work.",
  }),
  (rng) => ({
    prompt: `A reddish-brown mark on ${g6Name(rng)}'s handkerchief appeared after their nose bled during class. Why is this correctly identified as a blood stain and not a grass stain?`,
    correct: "The colour (reddish-brown from dried blood) and the cause (a nosebleed) both point to blood, not to any contact with grass",
    wrong: ["Handkerchiefs can only ever have grass stains, never blood", "The colour tells you nothing about which stain it is", "Any mark on a handkerchief must be blood by definition"],
    explanation: "Both the colour and the known cause (a nosebleed) confirm this is a blood stain — identifying a stain uses both what it looks like and what caused it.",
  }),
  (rng) => ({
    prompt: `${g6Name(rng)} notices a green mark on a shirt but is not sure if it happened during games lesson or from something else. What context clue would confirm it is a grass stain?`,
    correct: "Whether the shirt was in contact with a grassy field, lawn, or farm during the time the mark appeared",
    wrong: ["The colour of the shirt before it was stained", "Whether the shirt is cotton or polyester", "How old the shirt is"],
    explanation: "Context (where and when the fabric touched grass) is a key part of correctly identifying a grass stain, alongside its green colour.",
  }),
  (rng) => ({
    prompt: `${g6Name(rng)} finds a small dark spot on the collar of a shirt after a minor scratch while playing outdoors near ${g6Place(rng)}. Is this more likely blood or grass, and why?",`,
    correct: "Blood — small, localised spots from a scratch or cut are typical of blood, while grass stains usually spread in a wider smudge",
    wrong: ["Grass — because it happened outdoors, so it must be grass", "It is impossible to tell without a laboratory test", "Blood only ever appears on hands, never on a collar"],
    explanation: "A small, localised spot linked to a scratch fits blood's typical appearance — grass stains usually cover a wider, smudged area from contact with the ground.",
  }),
  (rng) => ({
    prompt: `${g6Name(rng)} sees a stain that has both a green tint and feels slightly stiff. What does this suggest happened?`,
    correct: "The fabric likely picked up both a grass stain and a blood stain in the same area at around the same time",
    wrong: ["This combination is impossible and one observation must be wrong", "Green and stiff always means the stain is very old dirt", "Stiffness always means it is a grass stain"],
    explanation: "Grass stains give colour but not stiffness, while blood gives stiffness as it dries — a stain with both suggests two different causes overlapped in the same spot.",
  }),
  () => ({
    prompt: `Which of these is the best single reason grass produces a green stain on fabric?`,
    correct: "Grass contains chlorophyll, a green pigment that transfers onto fibres on contact",
    wrong: ["Grass contains a form of dried blood", "Grass stains are actually caused by soil, not the grass plant itself", "Green fabric always shows grass marks more than other colours"],
    explanation: "Chlorophyll is the green pigment in grass and other plants, and it is what transfers onto fabric to create a grass stain.",
  }),
  () => ({
    prompt: `Which of these is the best single reason blood produces a reddish-brown stain as it dries?`,
    correct: "Blood reacts with air (oxidises) as it dries, changing its colour from red to reddish-brown",
    wrong: ["Blood always dries to the exact same colour it started as", "The reddish-brown colour comes from the fabric dye reacting with blood", "Blood only changes colour if it is washed with hot water"],
    explanation: "Oxidation — blood's reaction with the air — is what causes a fresh red blood stain to darken to reddish-brown as it dries.",
  }),
  (rng) => ({
    prompt: `${g6Name(rng)} is deciding whether a stain on a school jumper came from a fall on the pitch or from a scraped knee during the same fall. What is the key difference to look for?`,
    correct: "A grass stain will be green and smudged from contact with the field; a blood stain will be reddish-brown and slightly stiff from the scrape",
    wrong: ["There is no way to tell the two apart on the same jumper", "Both stains always look identical", "Only the location on the jumper matters, never the colour or texture"],
    explanation: "Colour (green vs reddish-brown) and texture (smudged vs stiff) together allow both stains to be identified even if they came from the same fall.",
  }),
  (rng) => ({
    prompt: `A stain on ${g6Name(rng)}'s trousers is bright green and appeared while weeding a vegetable bed near ${g6Place(rng)}. Which stain type is this?`,
    correct: "A grass stain, from contact with the weeds and grass being cleared",
    wrong: ["A blood stain, since farm work always causes cuts", "A soil stain, since weeding always touches soil first", "It cannot be a grass stain unless it happened during a sport"],
    explanation: "Grass stains are not limited to sport — any contact with grass, weeds or similar plants, including farm work, can transfer their green pigment onto fabric.",
  }),
  (rng) => ({
    prompt: `${g6Name(rng)} notices a stain that appeared suddenly and is bright red, not yet dried or darkened. What can be concluded about how recently it happened?`,
    correct: "The stain is very fresh, since blood only stays bright red for a short time before it starts to oxidise and darken",
    wrong: ["The colour tells nothing about how recent the stain is", "Bright red always means the stain is a grass stain", "Blood stains stay bright red forever once formed"],
    explanation: "Because blood darkens with time as it reacts with air, a bright red, undried mark points to a very recent stain rather than an old one.",
  }),
  () => ({
    prompt: `Which pair correctly matches each clue to the stain type it points to: (1) stiff and reddish-brown, (2) smudged and green?`,
    correct: "(1) points to a blood stain, (2) points to a grass stain",
    wrong: ["(1) points to a grass stain, (2) points to a blood stain", "Both clues point to the same stain type", "Neither clue is useful for identifying a stain"],
    explanation: "Stiffness and reddish-brown colour are blood's signature clues; a smudged green mark is grass's signature clue.",
  }),
  (rng) => ({
    prompt: `${g6Name(rng)} sees a green stain on a shirt but the shirt has already been washed once. What might this tell them about the stain?`,
    correct: "It suggests the grass stain was not fully removed by the first wash and may need more targeted treatment",
    wrong: ["It means the mark was never actually a grass stain", "One wash always fully removes any grass stain", "A washed stain always turns from green to reddish-brown"],
    explanation: "Grass stains can be stubborn and survive an ordinary wash, appearing paler but still identifiably green, which signals it needs a more targeted removal method." ,
  }),
  (rng) => ({
    prompt: `${g6Name(rng)}'s younger sibling has just started menstruating and finds a small blood mark on their underwear. What is the correct way to think about this stain?`,
    correct: "It is a normal blood stain from a natural body process, not a sign of injury or dirt",
    wrong: ["It must mean the sibling was injured somewhere", "It is a grass stain that appeared by accident", "It is not really a stain and should be ignored"],
    explanation: "Menstrual blood staining is a normal, natural occurrence, correctly identified as a blood stain rather than a sign of injury." ,
  }),
  () => ({
    prompt: `A stain smells faintly of freshly cut vegetation and looks green. What does the smell add to the identification?`,
    correct: "It supports the stain being grass, since grass has a distinct fresh, plant-like smell when freshly cut",
    wrong: ["Smell is never useful for identifying a stain", "The smell means it must be a blood stain", "All green stains smell exactly like paint"],
    explanation: "A fresh, plant-like smell alongside a green colour is a strong extra clue supporting a grass stain, though colour and context remain the main identifiers." ,
  }),
  (rng) => ({
    prompt: `${g6Name(rng)} is comparing two marks: one is on a garden glove after weeding, the other is on a plaster after a cut. Without touching either, which context clue points to the grass stain?`,
    correct: "The mark on the garden glove, because it is linked to weeding, a grass-related activity",
    wrong: ["The mark on the plaster, since plasters always mean grass contact", "Neither context clue is useful for telling the stains apart", "Both marks must be the same stain type since they both involve fabric"],
    explanation: "The activity linked to each mark — weeding versus a cut needing a plaster — is a strong context clue for telling a grass stain from a blood stain apart." ,
  }),
  (rng) => ({
    prompt: `${g6Name(rng)} sees a wide, smudged mark across the front of a games shirt after a sliding tackle during a match in ${g6Place(rng)}. What stain is this most likely to be?`,
    correct: "A grass stain, from sliding across the grassy pitch",
    wrong: ["A blood stain, since all sliding tackles cause bleeding", "An oil stain from the football itself", "It must be a mud stain, which always looks identical to grass"],
    explanation: "A sliding tackle rubs the body across the grass, pressing its pigment into a wide area of fabric — a classic cause of a grass stain." ,
  }),
  (rng) => ({
    prompt: `A stain on ${g6Name(rng)}'s trouser knee is both green and has a small, stiff, reddish-brown dot within it. What is the most complete identification of this mark?`,
    correct: "Two separate stains in the same area: a grass stain from the fall and a small blood stain from a scrape in the same fall",
    wrong: ["A single new stain type that is neither blood nor grass", "It must only be graded as a blood stain, since blood is more serious", "It is impossible to have two stains overlapping in one spot"],
    explanation: "A single fall can cause contact with both grass (a green smudge) and a scrape (a small stiff red-brown dot) at the same time, producing two overlapping stains." ,
  }),
  (rng) => ({
    prompt: `${g6Name(rng)} wants to identify a stain quickly without touching it. Which single visual clue is most useful at a glance?`,
    correct: "Its colour — reddish-brown suggests blood, green or yellowish-green suggests grass",
    wrong: ["Its exact size in centimetres", "The day of the week it appeared", "The brand of the fabric it is on"],
    explanation: "Colour is the fastest and most reliable first clue for telling blood and grass stains apart at a glance, before checking texture or context." ,
  }),
  (rng) => ({
    prompt: `${g6Name(rng)} notices a fresh mark is dark red and slightly wet, on a shirt sleeve right after helping a friend who fell and scraped their arm. What stain is this?`,
    correct: "A blood stain, from the friend's scraped arm",
    wrong: ["A grass stain, since the fall happened outdoors", "It cannot be identified since it is still wet", "It is definitely dirt, since falls always cause dirt stains, not blood"],
    explanation: "The direct cause (helping a friend with a scraped, bleeding arm) together with the dark red colour clearly identifies this as a blood stain." ,
  }),
  (rng) => ({
    prompt: `${g6Name(rng)} is asked to explain, in one sentence, the main difference between how a blood stain and a grass stain form on fabric. Which explanation is most accurate?`,
    correct: "Blood is a body fluid that stiffens fabric as its protein dries, while grass is a plant that stains fabric with green pigment without stiffening it",
    wrong: ["Both stains form in exactly the same way and only differ in colour", "Grass stains always stiffen fabric more than blood does", "Blood stains are always larger in size than grass stains"],
    explanation: "The core difference is the source and mechanism: blood is protein-based and stiffens fabric, while grass is pigment-based and does not." ,
  }),
];

const IDENTIFY_STEPS = [
  { id: "look", label: "Look closely at the colour of the mark (reddish-brown vs green)" },
  { id: "feel", label: "Feel the fabric to check whether the mark is stiff or soft" },
  { id: "recall", label: "Recall what the wearer was doing when the mark appeared" },
  { id: "location", label: "Check where on the garment the mark is (knee, collar, sleeve)" },
  { id: "decide", label: "Decide whether the clues point to a blood stain or a grass stain" },
];

const FILL_BLANK_TEMPLATES = [
  { before: "A stain caused by a plant pigment called ", after: " is usually green or yellowish-green.", correctAnswer: "chlorophyll" },
  { before: "A dried blood stain usually looks reddish-", after: " in colour.", correctAnswer: "brown" },
  { before: "Blood stains feel ", after: " and crusty to the touch once they have dried.", correctAnswer: "stiff" },
  { before: "Grass stains do not stiffen fabric because they are ", after: "-based, not protein-based.", correctAnswer: "pigment" },
  { before: "A common everyday cause of a blood stain on clothing is a small ", after: " or scrape.", correctAnswer: "cut" },
  { before: "A grass stain commonly appears on the ", after: " of trousers after outdoor play.", correctAnswer: "knees" },
  { before: "Fresh blood is bright to dark red, but it darkens as it ", after: " with air over time.", correctAnswer: "reacts" },
  { before: "A nosebleed is a common cause of a ", after: " stain on a collar or handkerchief.", correctAnswer: "blood" },
  { before: "Sliding on a grassy pitch during a football match commonly causes a ", after: " stain.", correctAnswer: "grass" },
  { before: "Menstrual blood staining underwear or clothing is a ", after: " part of the monthly cycle, not a sign of injury.", correctAnswer: "normal" },
  { before: "Weeding or slashing grass on a shamba is a common farm cause of a ", after: " stain.", correctAnswer: "grass" },
  { before: "The stiffness of a dried blood stain comes from ", after: " in the blood hardening as it dries.", correctAnswer: "protein" },
  { before: "A grass stain often appears as a wide, smudged ", after: " rather than a small dot.", correctAnswer: "patch" },
  { before: "A small, stiff, reddish-brown dot on fabric is most likely a stain from ", after: ".", correctAnswer: "blood" },
  { before: "Walking through wet morning grass can leave a green stain on socks and ", after: ".", correctAnswer: "shoes" },
  { before: "The colour clue for a blood stain is reddish-brown; the colour clue for a grass stain is ", after: " or yellowish-green.", correctAnswer: "green" },
  { before: "When identifying a stain, checking what the wearer was doing is called checking the ", after: " of the stain.", correctAnswer: "context" },
  { before: "A blood stain on a plaster or bandage is usually linked to a recent ", after: ".", correctAnswer: "injury" },
  { before: "Lying on a lawn during a picnic can leave a grass stain on the ", after: " of a shirt.", correctAnswer: "back" },
  { before: "A stain that is both green and slightly stiff may mean two separate stains, grass and ", after: ", overlap in the same spot.", correctAnswer: "blood" },
  { before: "Old blood stains and old grass stains can look similar in colour, so checking the fabric's ", after: " helps tell them apart.", correctAnswer: "texture" },
  { before: "A fresh blood stain that has not yet dried is usually bright ", after: " in colour.", correctAnswer: "red" },
  { before: "Games kits often show grass stains on the knees because that part touches the ", after: " most during play.", correctAnswer: "field" },
  { before: "A stain caused by clearing overgrown grass by hand or panga is a ", after: " stain.", correctAnswer: "grass" },
  { before: "Checking whether a stain feels stiff or stays soft is a way to test its ", after: ".", correctAnswer: "texture" },
  { before: "A stain's colour is usually the fastest clue to check ", after: " when identifying it.", correctAnswer: "first" },
  { before: "A grass stain on a school shirt after games lesson does not need to be treated as a sign of ", after: ", just normal outdoor play.", correctAnswer: "injury" },
  { before: "Blood is a body ", after: " and grass is a plant, which is why the two stains behave differently on fabric.", correctAnswer: "fluid" },
  { before: "A stain found near a scraped knee during a fall on the pitch could actually be two stains: grass and ", after: ".", correctAnswer: "blood" },
  { before: "Grass gets its green colour from a pigment found in all green plants, called ", after: ".", correctAnswer: "chlorophyll" },
] as const;

const IDENTIFY_VISUAL_PROMPTS = [
  "Identify this stain on the fabric.",
  "Which type of stain is shown here?",
  "Name this stain.",
  "Look at the picture and identify this stain.",
  "What kind of stain does this picture show?",
  "Study the image and name this stain.",
];

const CATEGORIZE_PROMPTS = [
  "Sort each clue by which stain type it points to: blood or grass.",
  "Group these clues under the stain type they point to.",
  "Decide which stain type each clue below points to, and sort it there.",
  "Sort each clue into the stain type it best fits.",
  "Place each clue into the bucket for the stain type it points to.",
  "Read each clue and sort it under the matching stain type.",
];

const CLICK_MATCH_PROMPT_TEMPLATES = [
  (stain: string) => `Match each ${stain} clue to why it points to that stain.`,
  (stain: string) => `Pair each ${stain} clue with the reason it points to that stain.`,
  (stain: string) => `Connect each ${stain} clue to why it is a reliable sign.`,
  (stain: string) => `Link each ${stain} clue to its correct reason.`,
  (stain: string) => `Match each ${stain} clue below to the explanation of why it fits.`,
  (stain: string) => `Pair each ${stain} clue with the explanation of why it points there.`,
];

const ORDER_PROMPTS = [
  "Arrange the steps for identifying an unknown stain, in the correct order.",
  "Put these stain-identification steps into the right sequence.",
  "Sequence the steps for identifying an unknown stain correctly.",
  "Arrange these steps in the order you would actually carry them out to identify a stain.",
  "Order these identification steps from first to last.",
  "Sort these steps into the correct order for identifying an unknown stain.",
];

const FILL_BLANK_PROMPTS = [
  "Complete the sentence about identifying stains.",
  "Fill in the missing word about identifying stains.",
  "Complete this sentence about blood and grass stains.",
  "Supply the missing word in this sentence about identifying stains.",
  "Fill in the blank to complete the fact about identifying stains.",
  "Complete the missing word in this statement about identifying stains.",
];

export const identifyingStains: Skill = {
  id: "g6-ag-h-identifying-stains",
  code: "H.2",
  subjectId: "agriculture-nutrition",
  strandId: "g6-ag-hygiene",
  grade: 6,
  title: "Identifying Stains",
  description:
    "Identifying common stains on clothing and household articles — blood and grass — by colour, texture, and the context in which they occurred, for personal hygiene.",
  generate(rng) {
    const branch = randChoice(rng, ["identify-visual", "reasoning", "categorize", "click-match", "order", "fill-blank"] as const);
    const hint = "Blood stains dry reddish-brown and feel stiff; grass stains stay green and do not stiffen the fabric. Also think about what the wearer was doing.";

    if (branch === "identify-visual") {
      const stain = randChoice(rng, ["blood", "grass"] as const);
      const other: Stain = stain === "blood" ? "grass" : "blood";
      const { choices, correctIndex } = buildChoicesFromStrings(rng, STAIN_LABEL[stain], [STAIN_LABEL[other], "An oil stain", "A rust stain"], 3);
      return {
        kind: "multiple-choice",
        prompt: randChoice(rng, IDENTIFY_VISUAL_PROMPTS),
        visual: { type: "fabric-stain", stain, treated: false },
        choices,
        correctIndex,
        layout: "list",
        hint,
        explanation:
          stain === "blood"
            ? "This is a blood stain — its reddish-brown colour is a result of blood drying and reacting with air."
            : "This is a grass stain — its green colour comes from chlorophyll, the pigment in grass.",
      };
    }

    if (branch === "reasoning") {
      const q = randChoice(rng, IDENTIFY_TEMPLATES)(rng);
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

    if (branch === "categorize") {
      const chosen = shuffle(rng, CLUES).slice(0, 10);
      const items = chosen.map((c) => ({ id: c.id, label: c.label }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((c) => (correctBucket[c.id] = c.stain));
      return {
        kind: "categorize",
        prompt: randChoice(rng, CATEGORIZE_PROMPTS),
        items,
        buckets: [
          { id: "blood", label: STAIN_LABEL.blood },
          { id: "grass", label: STAIN_LABEL.grass },
        ],
        correctBucket,
        hint,
        explanation: chosen.map((c) => `"${c.label}" — ${STAIN_LABEL[c.stain]}, because ${c.detail}.`).join(" "),
      };
    }

    if (branch === "click-match") {
      const stain = randChoice(rng, ["blood", "grass"] as const);
      const pool = CLUES.filter((c) => c.stain === stain);
      const chosen = shuffle(rng, pool).slice(0, 6);
      const tokens = shuffle(rng, chosen.map((c) => ({ id: c.id, label: c.label })));
      const targets = shuffle(rng, chosen.map((c) => ({ id: c.id, label: c.detail.charAt(0).toUpperCase() + c.detail.slice(1) })));
      const correctMap: Record<string, string> = {};
      chosen.forEach((c) => (correctMap[c.id] = c.id));
      return {
        kind: "click-match",
        prompt: randChoice(rng, CLICK_MATCH_PROMPT_TEMPLATES)(STAIN_LABEL[stain].toLowerCase()),
        tokens,
        targets,
        correctMap,
        hint,
        explanation: chosen.map((c) => `${c.label} — ${c.detail}.`).join(" "),
      };
    }

    if (branch === "order") {
      const items = shuffle(rng, IDENTIFY_STEPS);
      return {
        kind: "ordering",
        prompt: randChoice(rng, ORDER_PROMPTS),
        instruction: "Click them in order.",
        items,
        correctOrder: IDENTIFY_STEPS.map((s) => s.id),
        hint: "Start with what you can see, then check texture and think about what caused it, before deciding.",
        explanation: IDENTIFY_STEPS.map((s) => s.label).join(" → "),
      };
    }

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
  },
};
