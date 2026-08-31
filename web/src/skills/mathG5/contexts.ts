// Shared Kenyan-localization pools for the Grade 5 Mathematics strand (Numbers / Measurement / Geometry /
// Data Handling). Written centrally, before any skill file, so the same wide name/place/scenario variety
// threads through every skill without each file re-inventing (and re-typing) its own pool — same principle
// as mathG6/contexts.ts, which this file mirrors and extends with Grade-5-only pools (Simple Equations,
// Volume, HCF/LCM real-life framing, seconds-based Time, Upper-Primary Money vocabulary, Data Handling).
import { randChoice } from "@/lib/rng";
import type { RNG } from "@/lib/rng";

export const KENYAN_PLACES = [
  "Nairobi", "Mombasa", "Kisumu", "Nakuru", "Eldoret", "Thika", "Nyeri", "Kitale", "Machakos",
  "Kakamega", "Kericho", "Meru", "Embu", "Garissa", "Malindi", "Naivasha", "Kitengela", "Kiambu",
  "Voi", "Kilifi", "Bungoma", "Busia", "Homa Bay", "Kisii", "Migori", "Narok", "Nanyuki", "Isiolo",
  "Wajir", "Marsabit", "Lodwar", "Kapenguria", "Kerugoya", "Muranga", "Ruiru",
] as const;

export const KENYAN_NAMES = [
  "Amina", "Baraka", "Chebet", "Denis", "Fatuma", "Juma", "Kevin", "Lilian", "Mwangi", "Naliaka",
  "Otieno", "Wanjiru", "Achieng", "Bahati", "Cheruiyot", "Diana", "Esther", "Farida", "Gathoni",
  "Hassan", "Imani", "Joseph", "Kamau", "Lena", "Mumbi", "Njeri", "Omondi", "Peris", "Rehema",
  "Salim", "Tabitha", "Wafula", "Yusuf", "Zawadi",
] as const;

export function place(rng: RNG): string {
  return randChoice(rng, KENYAN_PLACES);
}
export function name(rng: RNG): string {
  return randChoice(rng, KENYAN_NAMES);
}

// "Count of X" real-world subjects for whole-number place-value/ordering/rounding scenarios.
// Each entry may contain a {place} token, substituted by the caller with place(rng).
export const COUNT_SCENARIO_SUBJECTS = [
  "learners enrolled in Grade 5 across primary schools in {place}",
  "mangoes harvested from a farm near {place} this season",
  "matatus that passed through the {place} bus stage yesterday",
  "chickens kept on a poultry farm near {place}",
  "tree seedlings planted during a school tree-planting day in {place}",
  "bags of maize sold at the {place} market on market day",
  "spectators who attended a county football match in {place}",
  "storybooks donated to the community library in {place}",
  "litres of milk collected at a dairy cooperative near {place}",
  "fish caught by fishermen near {place} last week",
  "patients seen at the {place} health centre last month",
  "votes cast during the school prefects' election in {place}",
  "bicycles parked outside the market in {place}",
  "seedlings sold at an agricultural show in {place}",
  "exercise books distributed to schools in {place} sub-county",
  "goats registered for sale at the {place} livestock market",
  "water tanks installed in homes around {place}",
  "parcels delivered by a courier company in {place} this week",
  "solar lamps distributed to households near {place}",
  "coffee bags exported from a factory near {place}",
  "people who attended a harambee fundraiser in {place}",
  "beehives kept by farmers near {place}",
  "avocados exported from farms around {place}",
  "sim cards sold at a shopping centre in {place}",
  "handwashing stations set up at schools in {place}",
  "national exam candidates registered at a centre in {place}",
  "kilograms of tea plucked on a farm near {place}",
  "bus tickets sold at the {place} stage in one day",
  "trees cut for timber near {place} last year",
  "cattle vaccinated during a livestock campaign near {place}",
  "school desks delivered to a school in {place}",
  "litres of fuel sold at a petrol station in {place} in a day",
  "road users (pedestrians, cyclists and motorists) counted crossing near a school in {place} in a morning",
  "passengers who boarded a train near {place} in a week",
] as const;

export function fillPlace(template: string, rng: RNG): string {
  return template.replace("{place}", place(rng));
}

// Item + typical unit-price (KES) contexts for multiplication and addition/subtraction word problems.
export const ITEM_PRICE_CONTEXTS = [
  { item: "exercise books", unit: "book", priceRange: [15, 60] },
  { item: "bars of soap", unit: "bar", priceRange: [40, 90] },
  { item: "bags of cement", unit: "bag", priceRange: [650, 950] },
  { item: "sacks of maize", unit: "sack", priceRange: [2500, 4200] },
  { item: "litres of milk", unit: "litre", priceRange: [55, 75] },
  { item: "school uniforms", unit: "uniform", priceRange: [850, 1600] },
  { item: "bicycles", unit: "bicycle", priceRange: [6500, 9800] },
  { item: "plastic chairs", unit: "chair", priceRange: [350, 600] },
  { item: "mattresses", unit: "mattress", priceRange: [2200, 4800] },
  { item: "bags of charcoal", unit: "bag", priceRange: [450, 800] },
  { item: "crates of soda", unit: "crate", priceRange: [700, 1100] },
  { item: "packets of maize flour", unit: "packet", priceRange: [140, 220] },
  { item: "roofing sheets", unit: "sheet", priceRange: [750, 1300] },
  { item: "textbooks", unit: "textbook", priceRange: [280, 550] },
  { item: "packets of sugar", unit: "packet", priceRange: [180, 260] },
  { item: "pairs of shoes", unit: "pair", priceRange: [900, 2400] },
  { item: "solar lamps", unit: "lamp", priceRange: [450, 950] },
  { item: "jerricans of cooking oil", unit: "jerrican", priceRange: [1800, 3200] },
  { item: "bags of rice", unit: "bag", priceRange: [3200, 5800] },
  { item: "packets of tea leaves", unit: "packet", priceRange: [120, 260] },
  { item: "umbrellas", unit: "umbrella", priceRange: [250, 550] },
  { item: "reams of printing paper", unit: "ream", priceRange: [420, 680] },
  { item: "hoes", unit: "hoe", priceRange: [380, 620] },
  { item: "bed sheets", unit: "sheet", priceRange: [500, 950] },
  { item: "boxes of chalk", unit: "box", priceRange: [90, 160] },
  { item: "water bottles (1 litre)", unit: "bottle", priceRange: [50, 90] },
  { item: "packets of candles", unit: "packet", priceRange: [70, 140] },
  { item: "geometry sets", unit: "set", priceRange: [150, 320] },
  { item: "footballs", unit: "football", priceRange: [900, 1800] },
  { item: "wall clocks", unit: "clock", priceRange: [450, 900] },
  { item: "packets of seeds", unit: "packet", priceRange: [60, 180] },
  { item: "torch batteries (packets)", unit: "packet", priceRange: [80, 150] },
] as const;

// Total-quantity + number-of-groups contexts for division/sharing scenarios.
export const SHARING_CONTEXTS = [
  { totalLabel: "school fees collected (KES)", groupLabel: "families contributing equally" },
  { totalLabel: "exercise books", groupLabel: "classes sharing them equally" },
  { totalLabel: "mangoes harvested", groupLabel: "crates packed equally" },
  { totalLabel: "litres of water", groupLabel: "storage tanks filled equally" },
  { totalLabel: "seedlings", groupLabel: "school gardens planted equally" },
  { totalLabel: "chairs", groupLabel: "rows arranged equally" },
  { totalLabel: "oranges", groupLabel: "traders sharing the harvest equally" },
  { totalLabel: "harambee contributions (KES)", groupLabel: "equal instalments" },
  { totalLabel: "bricks", groupLabel: "trips a lorry makes to carry them equally" },
  { totalLabel: "textbooks", groupLabel: "learners sharing them equally in groups" },
  { totalLabel: "eggs", groupLabel: "trays packed equally" },
  { totalLabel: "bananas", groupLabel: "bunches sold equally" },
  { totalLabel: "metres of fencing wire", groupLabel: "equal-length pieces cut" },
  { totalLabel: "cattle", groupLabel: "herders sharing them equally" },
  { totalLabel: "kilograms of tea", groupLabel: "sacks packed equally" },
  { totalLabel: "footballs", groupLabel: "teams sharing them equally" },
  { totalLabel: "bags of relief maize", groupLabel: "villages sharing them equally" },
  { totalLabel: "litres of fuel", groupLabel: "matatus filled equally" },
  { totalLabel: "beehive frames", groupLabel: "hives fitted equally" },
  { totalLabel: "packets of seeds", groupLabel: "farmers sharing them equally" },
  { totalLabel: "desks", groupLabel: "classrooms furnished equally" },
  { totalLabel: "metres of cloth", groupLabel: "equal-sized uniforms cut" },
  { totalLabel: "cups of rice", groupLabel: "households sharing a relief bag equally" },
  { totalLabel: "solar lamps", groupLabel: "villages supplied equally" },
  { totalLabel: "avocados", groupLabel: "export boxes packed equally" },
  { totalLabel: "goats", groupLabel: "herders sharing them equally" },
  { totalLabel: "bicycles", groupLabel: "delivery riders sharing them equally" },
  { totalLabel: "water bottles", groupLabel: "boxes packed equally" },
  { totalLabel: "sacks of charcoal", groupLabel: "lorry trips carrying them equally" },
  { totalLabel: "notebooks", groupLabel: "classes sharing them equally" },
  { totalLabel: "roofing sheets", groupLabel: "houses roofed equally" },
] as const;

// Fraction real-life "used {a}... then {b}..." scenario contexts (item + two activities), for
// same-denominator / one-renaming addition and subtraction.
export const FRACTION_SCENARIO_CONTEXTS = [
  { subject: "a tailor", item: "a roll of fabric", act1: "made a dress using", act2: "made a shirt using" },
  { subject: "a farmer", item: "a field", act1: "planted maize on", act2: "planted beans on" },
  { subject: "a painter", item: "a tin of paint", act1: "used on the walls", act2: "used on the ceiling" },
  { subject: "a driver", item: "a tank of fuel", act1: "used on the trip to town", act2: "used on the return trip" },
  { subject: "a baker", item: "a bag of flour", act1: "used for bread", act2: "used for cakes" },
  { subject: "a shopkeeper", item: "a sack of sugar", act1: "sold in the morning", act2: "sold in the afternoon" },
  { subject: "a farmer", item: "a water tank", act1: "used to water crops", act2: "used to water the animals" },
  { subject: "a builder", item: "a bag of cement", act1: "used for the foundation", act2: "used for the pillars" },
  { subject: "a student", item: "a homework assignment", act1: "completed before supper", act2: "completed after supper" },
  { subject: "a tailor", item: "a spool of thread", act1: "used stitching shirts", act2: "used stitching trousers" },
  { subject: "a nurse", item: "a bottle of medicine", act1: "used on Monday's patients", act2: "used on Tuesday's patients" },
  { subject: "a mechanic", item: "a can of engine oil", act1: "used on the first car", act2: "used on the second car" },
  { subject: "a farmer", item: "a bag of fertiliser", act1: "used on the maize plot", act2: "used on the vegetable plot" },
  { subject: "a caterer", item: "a sack of rice", act1: "cooked for the wedding lunch", act2: "cooked for the wedding supper" },
  { subject: "a librarian", item: "the library's storybooks", act1: "were borrowed by Grade 5", act2: "were borrowed by Grade 6" },
  { subject: "a fisherman", item: "the day's catch", act1: "sold at the lakeside market", act2: "sold to a passing trader" },
  { subject: "a milkman", item: "a can of milk", act1: "delivered to the first estate", act2: "delivered to the second estate" },
  { subject: "a carpenter", item: "a plank of timber", act1: "used for the table legs", act2: "used for the tabletop" },
  { subject: "a farmer", item: "a basket of harvested coffee", act1: "sold to the cooperative", act2: "kept for home use" },
  { subject: "a tailor", item: "a bolt of ankara cloth", act1: "used for a dress", act2: "used for a headwrap" },
  { subject: "a driver", item: "a delivery van's cargo space", act1: "loaded with maize sacks", act2: "loaded with bean sacks" },
  { subject: "a teacher", item: "a term's syllabus", act1: "covered before the midterm", act2: "covered after the midterm" },
  { subject: "a beekeeper", item: "a jar of honey", act1: "sold at the local market", act2: "kept for the family" },
  { subject: "a farmer", item: "a granary of stored maize", act1: "sold before the rains", act2: "kept for planting seed" },
  { subject: "a plumber", item: "a coil of piping", act1: "used for the kitchen line", act2: "used for the bathroom line" },
  { subject: "a shopkeeper", item: "a crate of eggs", act1: "sold before midday", act2: "sold after midday" },
  { subject: "a farmer", item: "a hectare of land", act1: "used for grazing", act2: "used for growing napier grass" },
  { subject: "a tailor", item: "a box of buttons", act1: "used on school uniforms", act2: "used on shirts" },
  { subject: "a driver", item: "a day's working hours", act1: "spent on the Nairobi route", act2: "spent on the Thika route" },
  { subject: "a farmer", item: "a poultry farm's feed store", act1: "fed to the layers", act2: "fed to the broilers" },
  { subject: "a caterer", item: "a crate of soft drinks", act1: "served at lunch", act2: "served at the evening party" },
] as const;

// Measurement/decimal real-world contexts (subject + unit) for decimal addition/subtraction work.
export const MEASUREMENT_DECIMAL_CONTEXTS = [
  { subject: "rainfall recorded in {place} on Monday", unit: "mm" },
  { subject: "rainfall recorded in {place} on Tuesday", unit: "mm" },
  { subject: "the mass of a sack of maize weighed at a store in {place}", unit: "kg" },
  { subject: "the mass of a parcel sent from {place}", unit: "kg" },
  { subject: "fuel bought for a matatu in {place}", unit: "litres" },
  { subject: "milk collected at a dairy near {place} in the morning", unit: "litres" },
  { subject: "milk collected at the same dairy in the evening", unit: "litres" },
  { subject: "money saved by a trader in {place} in one week", unit: "KES" },
  { subject: "money spent on transport by a learner from {place}", unit: "KES" },
  { subject: "the height of a maize plant measured on a farm near {place}", unit: "m" },
  { subject: "the length of a school field in {place}", unit: "m" },
  { subject: "the time a runner took to finish a race in {place}", unit: "hours" },
  { subject: "the mass of tea plucked by a picker near {place} in a morning", unit: "kg" },
  { subject: "the distance a cyclist rode between two villages near {place}", unit: "km" },
  { subject: "the volume of water drawn from a borehole in {place}", unit: "litres" },
  { subject: "the mass of fish landed at a beach near {place}", unit: "kg" },
  { subject: "the length of cloth bought by a tailor in {place}", unit: "m" },
  { subject: "the temperature change recorded on a farm near {place}", unit: "°C" },
  { subject: "the mass of a baby chick batch delivered to a farm near {place}", unit: "kg" },
  { subject: "the amount of sugar used at a bakery in {place}", unit: "kg" },
  { subject: "petrol bought at a station in {place}", unit: "litres" },
  { subject: "the mass of avocados packed for export near {place}", unit: "kg" },
  { subject: "the distance between two market centres near {place}", unit: "km" },
  { subject: "the mass of maize flour used at a school in {place}", unit: "kg" },
  { subject: "money collected from bus fares on a route through {place}", unit: "KES" },
  { subject: "the height a tree seedling grew on a farm near {place}", unit: "m" },
  { subject: "the mass of firewood collected near {place}", unit: "kg" },
  { subject: "the volume of milk sold by a vendor in {place}", unit: "litres" },
  { subject: "the mass of beans harvested on a farm near {place}", unit: "kg" },
  { subject: "the length of a river crossing measured near {place}", unit: "m" },
  { subject: "the mass of a delivery of oranges to a shop in {place}", unit: "kg" },
] as const;

// One-unknown, real-life scenarios for Simple Equations (1.8) — brand-new sub-strand at Grade 5. Each entry
// is a self-contained "start + change -> result" story; the skill file supplies which quantity to hide as x.
export const EQUATION_SCENARIO_CONTEXTS = [
  { subject: "{name}", item: "mangoes", verbGain: "picked", verbLose: "sold" },
  { subject: "{name}", item: "exercise books", verbGain: "bought", verbLose: "gave away" },
  { subject: "a shopkeeper in {place}", item: "loaves of bread", verbGain: "received in a delivery", verbLose: "sold" },
  { subject: "{name}", item: "goats", verbGain: "added to the herd", verbLose: "sold at the market" },
  { subject: "a farmer near {place}", item: "sacks of maize", verbGain: "harvested", verbLose: "sold" },
  { subject: "{name}", item: "storybooks", verbGain: "borrowed from the library", verbLose: "returned" },
  { subject: "a matatu conductor in {place}", item: "passengers", verbGain: "picked up", verbLose: "dropped off" },
  { subject: "{name}", item: "stickers", verbGain: "won in a game", verbLose: "traded away" },
  { subject: "a poultry farmer near {place}", item: "chicks", verbGain: "hatched", verbLose: "lost to disease" },
  { subject: "{name}", item: "sweets", verbGain: "was given by an aunt", verbLose: "shared with friends" },
  { subject: "a trader in {place}", item: "bags of charcoal", verbGain: "restocked", verbLose: "sold" },
  { subject: "{name}", item: "footballs", verbGain: "collected for the school team", verbLose: "lent to another class" },
  { subject: "a fisherman near {place}", item: "fish", verbGain: "caught", verbLose: "sold at the beach market" },
  { subject: "{name}", item: "pencils", verbGain: "bought at the shop", verbLose: "lent to classmates" },
  { subject: "a beekeeper near {place}", item: "jars of honey", verbGain: "harvested", verbLose: "sold" },
  { subject: "{name}", item: "seedlings", verbGain: "planted", verbLose: "gave to a neighbour" },
  { subject: "a school cook in {place}", item: "loaves of bread", verbGain: "baked", verbLose: "served at breakfast" },
  { subject: "{name}", item: "beads", verbGain: "collected for a bracelet", verbLose: "used up on gifts" },
  { subject: "a bus driver on the {place} route", item: "trips", verbGain: "added to the day's schedule", verbLose: "cancelled" },
  { subject: "{name}", item: "eggs", verbGain: "collected from the coop", verbLose: "sold to a neighbour" },
  { subject: "a tailor in {place}", item: "shirts", verbGain: "sewed this week", verbLose: "delivered to customers" },
  { subject: "{name}", item: "marbles", verbGain: "won at break time", verbLose: "lost in a game" },
  { subject: "a dairy farmer near {place}", item: "litres of milk", verbGain: "collected in the morning", verbLose: "sold to the cooperative" },
  { subject: "{name}", item: "oranges", verbGain: "picked from the tree", verbLose: "gave to the neighbours" },
  { subject: "a carpenter in {place}", item: "stools", verbGain: "made this month", verbLose: "sold at the market" },
  { subject: "{name}", item: "bottle tops", verbGain: "collected for a school project", verbLose: "used in the craft" },
  { subject: "a librarian in {place}", item: "novels", verbGain: "added to the shelf", verbLose: "lent out this week" },
  { subject: "{name}", item: "avocados", verbGain: "harvested from the tree", verbLose: "packed for sale" },
  { subject: "a nurse at a clinic in {place}", item: "vaccine doses", verbGain: "received in a shipment", verbLose: "administered" },
  { subject: "{name}", item: "greeting cards", verbGain: "made for a school fair", verbLose: "sold at the fair" },
] as const;

// Real-life pairs of quantities for HCF/GCD (largest equal group) scenarios.
export const HCF_GROUPING_CONTEXTS = [
  { itemA: "mangoes", itemB: "oranges", action: "packed into the largest possible identical fruit baskets, with none left over" },
  { itemA: "exercise books", itemB: "pencils", action: "shared into the largest possible identical learner kits, with none left over" },
  { itemA: "roses", itemB: "sunflowers", action: "arranged into the largest possible identical flower bunches, with none left over" },
  { itemA: "blue beads", itemB: "red beads", action: "strung into the largest possible identical bracelets, with none left over" },
  { itemA: "sweets", itemB: "biscuits", action: "packed into the largest possible identical party bags, with none left over" },
  { itemA: "tomatoes", itemB: "onions", action: "packed into the largest possible identical market crates, with none left over" },
  { itemA: "footballs", itemB: "netballs", action: "stored in the largest possible identical equipment boxes, with none left over" },
  { itemA: "T-shirts", itemB: "caps", action: "bundled into the largest possible identical prize sets, with none left over" },
  { itemA: "bananas", itemB: "passion fruits", action: "arranged into the largest possible identical fruit trays, with none left over" },
  { itemA: "notebooks", itemB: "rulers", action: "packed into the largest possible identical stationery boxes, with none left over" },
  { itemA: "eggs", itemB: "avocados", action: "packed into the largest possible identical delivery crates, with none left over" },
  { itemA: "chairs", itemB: "tables", action: "arranged into the largest possible identical seating groups, with none left over" },
  { itemA: "green beans", itemB: "carrots", action: "bundled into the largest possible identical vegetable packs, with none left over" },
  { itemA: "textbooks", itemB: "workbooks", action: "distributed into the largest possible identical classroom sets, with none left over" },
  { itemA: "candles", itemB: "matchboxes", action: "packed into the largest possible identical relief kits, with none left over" },
] as const;

// Real-life pairs of repeating intervals for LCM (next time together) scenarios.
export const LCM_REPEATING_EVENT_CONTEXTS = [
  { eventA: "a bus that leaves the {place} stage", eventB: "a matatu that leaves the same stage" },
  { eventA: "a bell that rings at school in {place}", eventB: "a second bell that rings at the same school" },
  { eventA: "a water pump that switches on near {place}", eventB: "a second water pump that switches on nearby" },
  { eventA: "a delivery van that visits a shop in {place}", eventB: "a second delivery van that visits the same shop" },
  { eventA: "a street light that blinks in {place}", eventB: "a second street light that blinks nearby" },
  { eventA: "a ferry that departs near {place}", eventB: "a second ferry that departs from the same jetty" },
  { eventA: "a radio programme that airs in {place}", eventB: "a second radio programme on the same station" },
  { eventA: "a farmer near {place} who waters the crops", eventB: "a second farmer nearby who waters the same way" },
  { eventA: "a clinic in {place} that runs a vaccination drive", eventB: "a second clinic that runs its own drive" },
  { eventA: "a school in {place} that holds a games day", eventB: "a neighbouring school that holds its own games day" },
] as const;

export function fillTemplate(template: string, rng: RNG): string {
  return template.replace("{place}", place(rng)).replace("{name}", name(rng));
}
