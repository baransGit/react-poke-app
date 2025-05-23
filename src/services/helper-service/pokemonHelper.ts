import { PokemonDetail, PokemonSpeciesData } from "../pokemonService";
import PokeTypes from "../../types/pokeTypes";
import { PokeCardProps } from "../../components/PokeCard";
import { capitalizeFirstLetter } from "./util";
const IMAGE_URL =
  "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/";
const CRY_URL =
  "https://raw.githubusercontent.com/PokeAPI/cries/main/cries/pokemon/latest/";
export const getPokemonTypes = (
  pokemonDetailData: PokemonDetail | null
): PokeTypes[] => {
  if (pokemonDetailData) {
    return pokemonDetailData.types.map((type) => type.type.name as PokeTypes);
  }
  return [];
};

export const getPokemonIdFromUrl = (url: string) => {
  return Number(url.split("/").filter(Boolean).pop());
};
export const getPokemonImage = (id: number) => {
  return `${IMAGE_URL}${id}.png`;
};
export const getPokemonCry = (id: number) => {
  return `${CRY_URL}${id}.ogg`;
};

export const getPokemonItem = (
  detail: PokemonDetail,
  species: PokemonSpeciesData
): PokeCardProps => {
  const types = getPokemonTypes(detail);
  const { flavor_text, generation, region } = species;
  return {
    id: detail.id,
    name: capitalizeFirstLetter(detail.name),
    image: getPokemonImage(detail.id),
    types,
    speciesInfo: {
      flavor_text: flavor_text,
      generation: generation,
      region: region,
    },
  };
};
export const getRandomFlavorText = (flavorTextArray: string[]): string => {
  const randomIndex = Math.floor(Math.random() * flavorTextArray.length);
  return flavorTextArray[randomIndex];
};
