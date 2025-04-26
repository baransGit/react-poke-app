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
