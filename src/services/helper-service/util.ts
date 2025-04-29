export const capitalizeFirstLetter = (name: string): string => {
  if (!name) return "";
  return name.charAt(0).toUpperCase() + name.slice(1);
};

export const getTypesString = (): string[] => {
  return [
    "normal",
    "fighting",
    "flying",
    "poison",
    "ground",
    "rock",
    "bug",
    "ghost",
    "steel",
    "fairy",
    "fire",
    "water",
    "grass",
    "electric",
    "psychic",
    "ice",
    "dragon",
    "dark",
    "fairy",
  ];
};
export const REGION_MAPPING: { [key: number]: string } = {
  1: "Kanto",
  2: "Johto",
  3: "Hoenn",
  4: "Sinnoh",
  5: "Unova",
  6: "Kalos",
  7: "Alola",
  8: "Galar",
  9: "Paldea",
};
