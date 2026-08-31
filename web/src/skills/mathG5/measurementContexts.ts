// Shared context pools for the Grade 5 Mathematics Measurement, Geometry, and Data Handling strands.
// Kept separate from contexts.ts (which covers the Numbers strand) purely to keep each file a manageable
// size for parallel authoring — both are written centrally, before any skill file, per the same
// "shared.ts written first" precedent used for other grade rollouts.
import { randChoice } from "@/lib/rng";
import type { RNG } from "@/lib/rng";
import { place, name } from "./contexts";

export { place, name, fillPlace, fillTemplate, KENYAN_PLACES, KENYAN_NAMES } from "./contexts";

// ---- 2.1 Length (km/m) --------------------------------------------------
export const LENGTH_JOURNEY_CONTEXTS = [
  { subject: "{name}", verb: "walks", from: "home", to: "school in {place}" },
  { subject: "a matatu", verb: "travels", from: "{place}", to: "the next town" },
  { subject: "a cyclist", verb: "rides", from: "{place}", to: "a neighbouring market" },
  { subject: "a delivery rider", verb: "rides", from: "a depot in {place}", to: "a customer's home" },
  { subject: "a school bus", verb: "drives", from: "{place}", to: "a sports tournament venue" },
  { subject: "a farmer", verb: "walks", from: "the homestead", to: "the grazing field near {place}" },
  { subject: "a long-distance runner", verb: "runs", from: "the {place} stadium", to: "the county boundary" },
  { subject: "a milk vendor", verb: "walks", from: "a dairy farm near {place}", to: "the local market" },
  { subject: "a health worker", verb: "drives", from: "a clinic in {place}", to: "a remote village" },
  { subject: "a fuel tanker", verb: "drives", from: "a depot near {place}", to: "a petrol station" },
  { subject: "a postal rider", verb: "rides", from: "the {place} post office", to: "a distant estate" },
  { subject: "a herder", verb: "walks", from: "a homestead near {place}", to: "a watering point" },
  { subject: "a lorry carrying maize", verb: "drives", from: "a farm near {place}", to: "a milling factory" },
  { subject: "a hiker", verb: "walks", from: "the base of a hill near {place}", to: "the summit" },
  { subject: "a water bowser", verb: "drives", from: "a borehole near {place}", to: "a drought-hit village" },
  { subject: "a school team", verb: "travels", from: "{place}", to: "a regional games venue" },
  { subject: "a trader", verb: "walks", from: "a village near {place}", to: "the weekly market" },
  { subject: "a courier van", verb: "drives", from: "a warehouse in {place}", to: "a rural post office" },
  { subject: "a fisherman", verb: "walks", from: "his home near {place}", to: "the lakeshore" },
  { subject: "an ambulance", verb: "drives", from: "a hospital in {place}", to: "an accident scene" },
] as const;

export function fillLengthContext(entry: (typeof LENGTH_JOURNEY_CONTEXTS)[number], rng: RNG): { subject: string; from: string; to: string } {
  return {
    subject: entry.subject.replace("{name}", name(rng)),
    from: entry.from.replace("{place}", place(rng)),
    to: entry.to.replace("{place}", place(rng)),
  };
}

// ---- 2.2 Area (cm², rectangles/squares) ----------------------------------
export const AREA_SURFACE_CONTEXTS = [
  "a classroom noticeboard in {place}",
  "a school exercise book cover",
  "a kitchen table mat woven near {place}",
  "a garden plot behind a home in {place}",
  "a chalkboard duster's felt patch",
  "a floor tile in a shop in {place}",
  "a rectangular school flag in {place}",
  "a woven sisal placemat sold at a market in {place}",
  "a bathroom mirror frame",
  "a rectangular vegetable bed on a farm near {place}",
  "a photo frame on a wall in {place}",
  "a school ID card",
  "a rectangular poster pinned in a classroom in {place}",
  "a square patch of a quilt sewn in {place}",
  "a rectangular solar panel on a roof near {place}",
  "a square stepping stone in a garden in {place}",
  "a rectangular whiteboard in a classroom in {place}",
  "a square handkerchief",
  "a rectangular paving slab outside a shop in {place}",
  "a square drying rack for maize near {place}",
] as const;

// ---- 2.3 Volume (cm³, cubes/cuboids) -------------------------------------
export const VOLUME_OBJECT_CONTEXTS = [
  "a wooden storage box in a shop in {place}",
  "a chalk box used in a classroom in {place}",
  "a cube-shaped gift box sold at a market in {place}",
  "a cuboid water storage tank on a farm near {place}",
  "a rectangular carton of juice packed near {place}",
  "a cuboid brick moulded at a yard in {place}",
  "a cube-shaped stack of sugar cubes at a shop in {place}",
  "a wooden crate used to carry mangoes near {place}",
  "a cuboid soap box sold in {place}",
  "a cube-shaped ice block sold at a market in {place}",
  "a rectangular grain storage bin on a farm near {place}",
  "a cuboid toolbox used by a carpenter in {place}",
  "a cube-shaped stack of matchboxes at a shop in {place}",
  "a cuboid cardboard carton used by a courier in {place}",
  "a rectangular sandpit built at a school in {place}",
] as const;

// ---- 2.4 Capacity (litres/millilitres) -----------------------------------
export const CAPACITY_CONTAINER_CONTEXTS = [
  { container: "a cooking oil bottle", useCase: "used in a kitchen in {place}" },
  { container: "a milk packet", useCase: "sold at a shop in {place}" },
  { container: "a water jerrican", useCase: "filled at a borehole near {place}" },
  { container: "a medicine bottle", useCase: "dispensed at a clinic in {place}" },
  { container: "a soft-drink bottle", useCase: "sold at a kiosk in {place}" },
  { container: "a fuel tank", useCase: "filled at a petrol station in {place}" },
  { container: "a paint tin", useCase: "used by a painter in {place}" },
  { container: "a school water dispenser", useCase: "refilled at a school in {place}" },
  { container: "a honey jar", useCase: "filled by a beekeeper near {place}" },
  { container: "a watering can", useCase: "used in a garden in {place}" },
  { container: "a yoghurt cup", useCase: "sold at a dairy stall in {place}" },
  { container: "a bucket", useCase: "used to fetch water in {place}" },
  { container: "a rainwater tank", useCase: "collecting water at a home in {place}" },
  { container: "a syrup bottle", useCase: "sold at a shop in {place}" },
  { container: "a chemical spray tank", useCase: "used by a farmer near {place}" },
  { container: "a fish tank", useCase: "kept at a home in {place}" },
  { container: "a soup pot", useCase: "used at a school kitchen in {place}" },
  { container: "a perfume bottle", useCase: "sold at a shop in {place}" },
  { container: "a hand sanitiser bottle", useCase: "used at a school in {place}" },
  { container: "a juice jug", useCase: "used at a party in {place}" },
] as const;

// ---- 2.5 Mass (grammes/kilogrammes) --------------------------------------
export const MASS_OBJECT_CONTEXTS = [
  { object: "a bag of maize flour", useCase: "sold at a shop in {place}" },
  { object: "a sack of potatoes", useCase: "sold at a market in {place}" },
  { object: "a parcel", useCase: "posted from {place}" },
  { object: "a bunch of bananas", useCase: "sold at a stall in {place}" },
  { object: "a packet of rice", useCase: "sold at a shop in {place}" },
  { object: "a school bag", useCase: "carried by a learner in {place}" },
  { object: "a bar of soap", useCase: "sold at a kiosk in {place}" },
  { object: "a crate of tomatoes", useCase: "delivered to a market in {place}" },
  { object: "a bag of cement", useCase: "delivered to a site in {place}" },
  { object: "a chicken", useCase: "sold at a poultry farm near {place}" },
  { object: "a newborn baby goat", useCase: "born on a farm near {place}" },
  { object: "a basket of avocados", useCase: "harvested near {place}" },
  { object: "a bag of sugar", useCase: "sold at a shop in {place}" },
  { object: "a bundle of firewood", useCase: "collected near {place}" },
  { object: "a sack of beans", useCase: "sold at a market in {place}" },
  { object: "a box of nails", useCase: "sold at a hardware shop in {place}" },
  { object: "a bag of onions", useCase: "sold at a market in {place}" },
  { object: "a jerrican of honey", useCase: "sold by a beekeeper near {place}" },
  { object: "a delivery of avocados", useCase: "exported from a farm near {place}" },
  { object: "a bundle of second-hand clothes", useCase: "sold at a market in {place}" },
] as const;

// ---- 2.6 Time (seconds/minutes) ------------------------------------------
export const TIMED_ACTIVITY_CONTEXTS = [
  "a 100-metre race run at a school in {place}",
  "a kettle boiling water in a kitchen in {place}",
  "a learner reciting a poem in a classroom in {place}",
  "a matatu waiting at a stage in {place}",
  "a football penalty kick taken at a match in {place}",
  "a phone call made from a shop in {place}",
  "a cyclist crossing a bridge near {place}",
  "a school bell ringing at a school in {place}",
  "a runner completing one lap of a track in {place}",
  "an egg boiling on a stove in {place}",
  "a queue moving at a bank in {place}",
  "a lift/elevator ride in a building in {place}",
  "a video advertisement played on a screen in {place}",
  "a swimmer completing one length of a pool in {place}",
  "a computer starting up at a cyber cafe in {place}",
  "a bus loading passengers at a stage in {place}",
  "a relay-race baton exchange at a school sports day in {place}",
  "a microwave heating food in a kitchen in {place}",
  "a traffic light staying red at a junction in {place}",
  "a learner solving a mental-maths question in a classroom in {place}",
] as const;

// ---- 2.7 Money (budget items, up to 5) -----------------------------------
export const BUDGET_ITEM_POOL = [
  { item: "an exercise book", priceRange: [15, 60] },
  { item: "a bar of soap", priceRange: [40, 90] },
  { item: "a loaf of bread", priceRange: [55, 75] },
  { item: "a packet of milk", priceRange: [55, 75] },
  { item: "a pencil", priceRange: [10, 25] },
  { item: "a ruler", priceRange: [20, 40] },
  { item: "an eraser", priceRange: [10, 20] },
  { item: "a packet of biscuits", priceRange: [40, 90] },
  { item: "an exercise-book cover", priceRange: [15, 30] },
  { item: "a bus fare ticket", priceRange: [30, 100] },
  { item: "a bunch of bananas", priceRange: [50, 120] },
  { item: "a bar of chocolate", priceRange: [50, 150] },
  { item: "a packet of sugar (500g)", priceRange: [60, 100] },
  { item: "a bottle of drinking water", priceRange: [40, 90] },
  { item: "a school badge", priceRange: [50, 150] },
  { item: "a pair of socks", priceRange: [80, 200] },
  { item: "a notebook", priceRange: [40, 100] },
  { item: "a geometry set", priceRange: [150, 320] },
  { item: "a packet of maize flour (2kg)", priceRange: [140, 220] },
  { item: "a torch battery", priceRange: [20, 50] },
] as const;

export const BANK_SERVICE_FACTS = [
  { term: "Loan", meaning: "money a bank lends a customer, to be repaid later, often with interest" },
  { term: "Safe custody", meaning: "a bank keeping a customer's valuables (like title deeds) securely" },
  { term: "Deposit", meaning: "putting money into a bank account" },
  { term: "Withdrawal", meaning: "taking money out of a bank account" },
  { term: "Savings", meaning: "money set aside in an account to grow over time instead of being spent" },
  { term: "Money transfer", meaning: "sending money electronically from one person's account to another's" },
  { term: "Bank statement", meaning: "a record showing all deposits and withdrawals in an account over time" },
  { term: "Interest", meaning: "extra money a bank pays a saver, or a borrower pays a bank, based on an amount over time" },
  { term: "Account balance", meaning: "the amount of money currently in a bank account" },
  { term: "ATM", meaning: "a machine that lets a customer withdraw or deposit money without a bank teller" },
] as const;

export const SAVING_WISELY_FACTS = [
  { factor: "Setting a savings goal", reason: "so you know exactly how much and by when you are saving" },
  { factor: "Spending on needs before wants", reason: "so essential items are covered before extra treats" },
  { factor: "Saving a portion regularly, not only leftover money", reason: "so savings grow steadily instead of depending on chance" },
  { factor: "Keeping savings in a safe place, like a bank", reason: "so the money is protected from loss or theft" },
  { factor: "Avoiding unnecessary spending", reason: "so more money is available to put toward savings" },
  { factor: "Tracking how much has been saved", reason: "so progress toward the goal can be checked" },
  { factor: "Planning for emergencies", reason: "so unexpected costs do not force spending all the savings at once" },
  { factor: "Comparing prices before buying", reason: "so money is not wasted on items bought at a higher price than needed" },
] as const;

// ---- 3.1 Lines --------------------------------------------------------
export const LINE_ENVIRONMENT_EXAMPLES = [
  { object: "the two side edges of a classroom door", relationship: "parallel" },
  { object: "the top and bottom edges of a chalkboard", relationship: "parallel" },
  { object: "the two rails of a railway track near {place}", relationship: "parallel" },
  { object: "the vertical bars of a school gate in {place}", relationship: "parallel" },
  { object: "a flagpole standing beside a level school field in {place}", relationship: "vertical" },
  { object: "the horizon seen from a hill near {place}", relationship: "horizontal" },
  { object: "the surface of still water in a tank in {place}", relationship: "horizontal" },
  { object: "the edge where a wall meets the floor of a classroom in {place}", relationship: "perpendicular" },
  { object: "the two edges of an open exercise book meeting at its spine", relationship: "perpendicular" },
  { object: "the crossbar and post of a football goal at a field in {place}", relationship: "perpendicular" },
  { object: "the rungs of a ladder leaning against a house in {place}", relationship: "parallel" },
  { object: "a signpost standing beside a road in {place}", relationship: "vertical" },
  { object: "the two long sides of a ruler", relationship: "parallel" },
  { object: "the corner of a square window frame in {place}", relationship: "perpendicular" },
  { object: "a plumb line hanging beside a wall under construction in {place}", relationship: "vertical" },
] as const;

// ---- 3.2 Angles ---------------------------------------------------------
export const ANGLE_ENVIRONMENT_EXAMPLES = [
  "the hands of a clock on a classroom wall in {place}",
  "the opening of a school gate in {place}",
  "the corner where two walls of a house in {place} meet",
  "the blades of a pair of scissors used in a classroom in {place}",
  "a ramp leading up to a shop entrance in {place}",
  "the corner of a set square used in a classroom in {place}",
  "a folding chair opened at a school event in {place}",
  "the roof slope of a house in {place}",
  "a door swung open in a classroom in {place}",
  "the hands of a compass drawing a circle at a school in {place}",
  "the arms of a signboard post at a junction in {place}",
  "the blades of a windmill turning near {place}",
] as const;

// ---- 3.3 Three-Dimension Objects -----------------------------------------
export const OBJECT_3D_EXAMPLES = [
  { object: "a Milo tin sold at a shop in {place}", shape: "cylinder" },
  { object: "a matchbox sold at a kiosk in {place}", shape: "cuboid" },
  { object: "a football used at a school in {place}", shape: "sphere" },
  { object: "a tent pitched at a camp near {place}", shape: "pyramid" },
  { object: "a cardboard carton used by a shop in {place}", shape: "cuboid" },
  { object: "an orange sold at a market in {place}", shape: "sphere" },
  { object: "a sugar cube used in a kitchen in {place}", shape: "cube" },
  { object: "a drum used to store water in {place}", shape: "cylinder" },
  { object: "a dice used in a board game at a school in {place}", shape: "cube" },
  { object: "a tin of beans sold at a shop in {place}", shape: "cylinder" },
  { object: "a chalk box used in a classroom in {place}", shape: "cuboid" },
  { object: "a party hat worn at a birthday in {place}", shape: "pyramid" },
  { object: "a globe used in a classroom in {place}", shape: "sphere" },
  { object: "a rice packet sold at a shop in {place}", shape: "cuboid" },
  { object: "a Rubik's cube played with at a school in {place}", shape: "cube" },
] as const;

// ---- 4.1 Data Representation ---------------------------------------------
export const DATA_COLLECTION_TOPICS = [
  { topic: "shoe sizes of learners in a Grade 5 class in {place}", unit: "shoe size", values: [4, 5, 6, 7, 8] },
  { topic: "ages (in years) of learners in a Grade 5 class in {place}", unit: "years", values: [9, 10, 11, 12] },
  { topic: "number of siblings each learner in a class in {place} has", unit: "siblings", values: [0, 1, 2, 3, 4] },
  { topic: "types of vehicles passing a road near a school in {place} in an hour", unit: "vehicle type", values: ["matatu", "bicycle", "car", "motorbike", "lorry"] },
  { topic: "favourite fruits chosen by learners at a school in {place}", unit: "fruit", values: ["mango", "banana", "orange", "avocado", "pawpaw"] },
  { topic: "spelling test scores (out of 10) in a class in {place}", unit: "marks", values: [5, 6, 7, 8, 9, 10] },
  { topic: "months of birth of learners in a class in {place}", unit: "month", values: ["January", "April", "July", "October", "December"] },
  { topic: "favourite sports among learners at a school in {place}", unit: "sport", values: ["football", "athletics", "netball", "swimming", "volleyball"] },
  { topic: "number of pets kept by families in an estate in {place}", unit: "pets", values: [0, 1, 2, 3] },
  { topic: "types of transport learners use to reach school in {place}", unit: "transport", values: ["walking", "matatu", "bicycle", "school bus", "boda boda"] },
] as const;

export function pickAny<T>(rng: RNG, pool: readonly T[]): T {
  return randChoice(rng, pool);
}
