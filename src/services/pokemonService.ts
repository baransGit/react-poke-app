import FilterType from "../types/filterType";
import { FilterProps } from "../components/FilterForm";
const BASE_URL = "https://pokeapi.co/api/v2/pokemon/";
const TYPE_URL = "https://pokeapi.co/api/v2/type/";
interface PokemonListItem {
  name: string;
  url: string;
}
export interface PokemonSpeciesData {
  flavor_text: string;
  generation: string;
  region: string;
}
interface PokemonListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: PokemonListItem[];
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
  pokemonDetails: Record<string, PokemonDetail>;
  pokemonsWithDetails: Record<string, PokemonDetail[]>;
  pokemonTypeDetails: Record<string, PokemonDetail[]>;
} = {
  pokemonDetails: {},
  pokemonsWithDetails: {},
  pokemonTypeDetails: {},
};

// Tek Pokemon'ın detayını getiren fonksiyon
const fetchPokemonDetails = async (
  url: string
): Promise<PokemonDetail | null> => {
  // URL'i cache anahtarı olarak kullanma
  if (cache.pokemonDetails[url]) {
    console.log("Pokemon details fetched from cache");
    return cache.pokemonDetails[url];
  }
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(
        "Network response was not ok while fetching pokemon details"
      );
    }
    const data = await response.json();
    // URL'i cache anahtarı olarak kullanma
    cache.pokemonDetails[url] = data;
    return data;
  } catch (error) {
    console.error("Error fetching pokemon details:", error);
    return null;
  }
};

// Birden çok Pokemon'ın detayını getiren fonksiyon
const fetchMultiplePokemonDetails = async (
  pokemons: PokemonListItem[]
): Promise<(PokemonDetail | null)[]> => {
  const promises = pokemons.map((pokemon) => {
    return fetchPokemonDetails(pokemon.url);
  });
  return Promise.all(promises);
};

const fetchPokemonsWithDetails = async (
  limit: number = 20,
  offset: number = 0,
  filterType: FilterType = FilterType.DEFAULT,
  filter?: FilterProps
): Promise<PokemonDetail[]> => {
  if (filterType === FilterType.DEFAULT) {
    const cacheKey = `${limit}_${offset}`;

    // Önbellek kontrolü
    if (cache.pokemonsWithDetails[cacheKey]) {
      console.log("Pokemons with details fetched from cache");
      return cache.pokemonsWithDetails[cacheKey];
    }

    try {
      // Pokemon listesini getir
      const response = await fetch(
        `${BASE_URL}?limit=${limit}&offset=${offset}`
      );
      if (!response.ok) {
        console.error("Cannot fetch Pokemon List");
        return [];
      }
      const listData: PokemonListResponse = await response.json();
      if (!listData || !listData.results || listData.results.length === 0) {
        console.error("No Pokemon data or empty results");
        return [];
      }

      // Detayları getir
      const detailsArray = await fetchMultiplePokemonDetails(listData.results);

      // null olmayan detayları filtrele
      const filteredDetails = detailsArray.filter(
        (detail): detail is NonNullable<typeof detail> => detail !== null
      );

      // Önbelleğe kaydet
      cache.pokemonsWithDetails[cacheKey] = filteredDetails;

      return filteredDetails;
    } catch (error) {
      console.error("Error fetching pokemons with details:", error);
      return [];
    }
  } else if (filter) {
    // Filtreleme tipine göre Pokemon'ları getir
    const typePokemons = await fetchPokemonByFilterType(filter, limit, offset);
    return typePokemons;
  }

  // Hiçbir koşul eşleşmezse boş dizi döndür
  return [];
};

const fetchPokemonByFilterType = async (
  filter: FilterProps,
  limit: number = 20,
  offset: number = 0
): Promise<PokemonDetail[]> => {
  if (filter.type) {
    // Önbellek anahtarı oluştur: 'type_limit_offset'
    const cacheKey = `${filter.type}_${limit}_${offset}`;
    console.log("Filter type:", filter.type, "Cache key:", cacheKey);

    // Önbellek kontrolü
    if (cache.pokemonTypeDetails[cacheKey]) {
      console.log(`Pokemon details for type ${filter.type} fetched from cache`);
      return cache.pokemonTypeDetails[cacheKey];
    }

    try {
      const response = await fetch(`${TYPE_URL}${filter.type}`);
      if (!response.ok) {
        console.error(
          `Failed to fetch type ${filter.type}, status: ${response.status}`
        );
        return [];
      }

      const pokeTypeData = await response.json();

      const pokemonList = pokeTypeData.pokemon || [];

      // İlk offset kadar elamanı atla, sonraki limit kadar elamanı al
      const slicedList = pokemonList.slice(offset, offset + limit);

      let pokemonData = slicedList.map((entry: any) => entry.pokemon);
      if (filter.name && filter.name?.length > 0) {
        const pokemonNames = pokemonData.filter((pokemon: PokemonListItem) =>
          pokemon.name.startsWith(filter.name!)
        );
        pokemonData = pokemonNames;
      }

      const detailsArray = await fetchMultiplePokemonDetails(pokemonData);

      const filteredDetails = detailsArray.filter(
        (detail): detail is PokemonDetail => detail !== null
      );

      cache.pokemonTypeDetails[cacheKey] = filteredDetails;

      return filteredDetails;
    } catch (error) {
      console.error(`Error fetching pokemons of type ${filter.type}:`, error);
      return [];
    }
  }

  return [];
};
const fetchAllPokemonList = async (): Promise<PokemonListItem[]> => {
  try {
    const response = await fetch(
      "https://pokeapi.co/api/v2/pokemon?limit=1302&offset=0"
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

export {
  fetchAllPokemonList,
  fetchPokemonDetails,
  fetchMultiplePokemonDetails,
  fetchPokemonsWithDetails,
  fetchPokemonByFilterType,
  type PokemonListResponse,
  type PokemonDetail,
  type PokemonListItem,
};
