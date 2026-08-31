import { shuffle } from "@/lib/rng";
import type { RNG } from "@/lib/rng";

export const KENYAN_NAMES = [
  "Wanjiru", "Otieno", "Amina", "Kiptoo", "Nasimiyu", "Mwangi", "Chebet", "Njeri",
  "Kamau", "Akinyi", "Wafula", "Naliaka", "Mutiso", "Cherono", "Odhiambo", "Wangari",
  "Kilonzo", "Nyambura", "Barasa", "Auma", "Rotich", "Achieng", "Kiplagat", "Mumbi",
] as const;

export const KENYAN_PLACES = [
  "Nakuru", "Kisumu", "Eldoret", "Nyeri", "Machakos", "Kitale", "Malindi", "Kericho",
  "Garissa", "Kakamega", "Bungoma", "Meru", "Nanyuki", "Voi", "Naivasha", "Isiolo",
] as const;

export function pickName(rng: RNG): string {
  return shuffle(rng, [...KENYAN_NAMES])[0];
}

export function pickPlace(rng: RNG): string {
  return shuffle(rng, [...KENYAN_PLACES])[0];
}

export function cap(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
