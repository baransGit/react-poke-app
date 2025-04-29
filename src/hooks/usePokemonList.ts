import { useState, useEffect } from "react";
import FilterType from "../types/filterType";
import { getPokemonsWithSpecies } from "../services/pokemonService";
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
        const options = {
          limit,
          offset,
          type: filter?.type,
          name: filter?.name,
        };
        const pokemonsWithSpecies = await getPokemonsWithSpecies(options);
        setPokemons(pokemonsWithSpecies);
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
