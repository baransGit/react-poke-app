import { REGION_MAPPING } from "./helper-service/util";
import { PokeCardProps } from "../components/PokeCard";
import {
  getPokemonItem,
  getRandomFlavorText,
} from "./helper-service/pokemonHelper";
import FilterType from "../types/filterType";
import { text } from "stream/consumers";
import { get } from "http";
const BASE_URL = "https://pokeapi.co/api/v2/pokemon/";
const TYPE_URL = "https://pokeapi.co/api/v2/type/";
const SPECIES_URL = "https://pokeapi.co/api/v2/pokemon-species/";

interface PokemonListItem {
  name: string;
  url: string;
}
interface PokemonSpeciesData {
  flavor_text: string;
  generation: number;
  region: string;
}

interface PokemonDetail {
  id: number;
  name: string;
  types: {
    slot: number;
    type: {
      name: string;
      url: string;
    };
  }[];
}

const cache: {
  pokemons: Record<string, PokemonDetail[]>;
  species: Record<number, PokemonSpeciesData>;
} = {
  pokemons: {},
  species: {},
};

const getPokemons = async (options: {
  limit?: number;
  offset?: number;
  type?: string;
  name?: string;
}): Promise<PokemonDetail[]> => {
  const { limit = 20, offset = 0, type, name } = options;

  const cacheKey = `${type || "all"}_${limit}_${offset}_${name || ""}`;
  if (cache.pokemons[cacheKey]) {
    return cache.pokemons[cacheKey];
  }

  try {
    let pokemonList: PokemonDetail[] = [];

    // Sadece tip filtresi kontrolü yap
    if (type) {
      const response = await fetch(`${TYPE_URL}${type}`);
      const data = await response.json();
      const typePokemons = data.pokemon
        .slice(offset, offset + limit)
        .map((p: any) => p.pokemon);

      // Eğer name filtresi varsa, tip listesinde ara
      let pokemonsToFetch = typePokemons;
      if (name && name.length > 0) {
        pokemonsToFetch = typePokemons.filter((pokemon: PokemonListItem) =>
          pokemon.name.startsWith(name.toLowerCase())
        );
      }

      const detailPromises = pokemonsToFetch.map(
        async (pokemon: PokemonListItem) => {
          const detailResponse = await fetch(pokemon.url);
          return detailResponse.json();
        }
      );
      pokemonList = await Promise.all(detailPromises);
    }
    // Tip yoksa normal liste getir
    else {
      const response = await fetch(
        `${BASE_URL}?limit=${limit}&offset=${offset}`
      );
      const data = await response.json();
      const detailPromises = data.results.map(
        async (pokemon: PokemonListItem) => {
          const detailResponse = await fetch(pokemon.url);
          return detailResponse.json();
        }
      );
      pokemonList = await Promise.all(detailPromises);
    }

    cache.pokemons[cacheKey] = pokemonList;
    return pokemonList;
  } catch (error) {
    console.error("Error fetching pokemons:", error);
    return [];
  }
};
const getSpecies = async (
  pokemonId: number
): Promise<PokemonSpeciesData | null> => {
  if (cache.species[pokemonId]) {
    return cache.species[pokemonId];
  }
  try {
    const response = await fetch(`${SPECIES_URL}${pokemonId}`);
    const data = await response.json();

    const generationNumber = Number(
      data.generation.url.split("/").filter(Boolean).pop()
    );
    const flavorTextData = data.flavor_text_entries
      .filter((text: any) => text.language.name === "en")
      .map((text: any) => text.flavor_text);

    console.log("flavorTextData:", flavorTextData);

    const speciesData: PokemonSpeciesData = {
      flavor_text: getRandomFlavorText(flavorTextData) || "",
      generation: generationNumber,
      region: REGION_MAPPING[generationNumber] || "Unknown",
    };

    cache.species[pokemonId] = speciesData;
    return speciesData;
  } catch (error) {
    console.error("Error fetching species:", error);
    return null;
  }
};

const getPokemonsWithSpecies = async (options: {
  limit?: number;
  offset?: number;
  type?: string;
  name?: string;
}): Promise<PokeCardProps[]> => {
  const pokemons = await getPokemons(options);

  const pokemonsWithSpecies = await Promise.all(
    pokemons.map(async (pokemon) => {
      const species = await getSpecies(pokemon.id);
      if (!species) return null;
      return getPokemonItem(pokemon, species);
    })
  );
  return pokemonsWithSpecies.filter(
    (pokemon): pokemon is PokeCardProps => pokemon !== null
  );
};

const getAllPokemonListItems = async (): Promise<PokemonListItem[]> => {
  try {
    const response = await fetch(
      "https://pokeapi.co/api/v2/pokemon?limit=1025&offset=0"
    );
    if (!response.ok) {
      console.log("Cannot fetch data");
      return [];
    }
    const data = await response.json();

    return data.results;
  } catch (error) {
    console.error("Error fetching all Pokemon names:", error);
    return [];
  }
};
const getPokemonsByUrls = async (
  pokemonItems: PokemonListItem[]
): Promise<PokemonDetail[]> => {
  const cacheKey = `urls_${pokemonItems.map((p) => p.url).join("_")}`;

  if (cache.pokemons[cacheKey]) {
    return cache.pokemons[cacheKey];
  }

  try {
    const detailPromises = pokemonItems.map(async (pokemon) => {
      const detailResponse = await fetch(pokemon.url);
      return detailResponse.json();
    });

    const pokemonList = await Promise.all(detailPromises);
    cache.pokemons[cacheKey] = pokemonList;
    return pokemonList;
  } catch (error) {
    console.error("Error fetching pokemons by urls:", error);
    return [];
  }
};
export {
  getSpecies,
  getPokemonsWithSpecies,
  getAllPokemonListItems,
  getPokemonsByUrls,
  type PokemonDetail,
  type PokemonSpeciesData,
  type PokemonListItem,
};
