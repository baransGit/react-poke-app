import { PokeCardProps } from "../../components/PokeCard";
import { SortOption } from "../../types/pokeSortTypes";

export const sortPokemons = (
  pokemons: PokeCardProps[],
  sortBy: SortOption
): PokeCardProps[] => {
  return [...pokemons].sort((a, b) => {
    switch (sortBy) {
      case "id":
        return a.id - b.id;
      case "name":
        return a.name.localeCompare(b.name);
      case "type":
        return a.types[0]?.localeCompare(b.types[0] || "") || 0;
      default:
        return 0;
    }
  });
};
