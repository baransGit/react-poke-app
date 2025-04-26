import { useState, useEffect } from "react";
import FilterType from "../types/filterType";
import { fetchPokemonsWithDetails } from "../services/pokemonService";
import { PokemonDetail } from "../services/pokemonService";
import { getPokemonItem } from "../services/helper-service/pokemonHelper";
import { FilterProps } from "../components/FilterForm";
import { PokeCardProps } from "../components/PokeCard";

export const usePokemonList = (
  limit: number = 20,
  page: number = 0,
  filterType: FilterType = FilterType.DEFAULT,
  filter?: FilterProps
) => {
  const [pokemons, setPokemons] = useState<PokeCardProps[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const offset = page * limit;
        const pokemonDetails = await fetchPokemonsWithDetails(
          limit,
          offset,
          filterType,
          filter
        );
        if (pokemonDetails && pokemonDetails.length > 0) {
          const processedPokemons = pokemonDetails.map(
            (detail: PokemonDetail) => getPokemonItem(detail)
          );
          setPokemons(processedPokemons);
        } else {
          setPokemons([]);
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Unknown error"));
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [limit, page, filterType, JSON.stringify(filter)]);
  return { pokemons, setPokemons, loading, error };
};
