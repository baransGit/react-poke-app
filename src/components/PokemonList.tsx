import { useState, useMemo, useEffect } from "react";
import { PokeCard } from "./PokeCard";
import { getPokemonItem } from "../services/helper-service/pokemonHelper";
import FilterType from "../types/filterType";
import {
  fetchMultiplePokemonDetails,
  PokemonDetail,
  PokemonListItem,
} from "../services/pokemonService";
import { FilterForm, FilterProps } from "./FilterForm";
import { usePokemonList } from "../hooks/usePokemonList";
import { useAllPokemonNames } from "../hooks/usePokemonListItems";
import "./PokemonList.css";

export const PokemonList: React.FC = () => {
  const [filterType, setFilterType] = useState<FilterType>(FilterType.DEFAULT);
  const [filters, setFilters] = useState<FilterProps>({});
  const [page, setPage] = useState(0);
  const LIMIT = 20;
  const [searchTerm, setSearchTerm] = useState<string>("");

  const { pokemons, setPokemons, loading, error } = usePokemonList(
    LIMIT,
    page,
    filterType,
    filters
  );
  const { list: allPokemonList, loading: namesLoading } = useAllPokemonNames();
  console.log("allPokemonList type:", typeof allPokemonList);
  console.log("allPokemonList value:", allPokemonList);
  const filteredListByName = useMemo(() => {
    if (!searchTerm) return [];
    setFilterType(FilterType.FILTERED);
    return allPokemonList
      .filter((item: PokemonListItem) =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .slice(0, 20);
  }, [allPokemonList, searchTerm]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const filteredPokemonsDetails = await fetchMultiplePokemonDetails(
          filteredListByName
        );
        if (filteredPokemonsDetails && filteredPokemonsDetails.length > 0) {
          const processedPokemons = filteredPokemonsDetails
            .filter((detail): detail is PokemonDetail => detail !== null)
            .map((detail) => getPokemonItem(detail));
          setPokemons(processedPokemons);
        } else {
          setPokemons([]);
        }
      } catch (err) {
        console.log("Cannot fetch data from name");
      }
    };
    fetchData();
  }, [filteredListByName]);
  const handleNextPage = () => {
    setPage((prevpage) => prevpage + 1);
  };
  const handlePrevPage = () => {
    setPage((prevpage) => (prevpage > 0 ? prevpage - 1 : 0));
  };
  const handleApplyFilters = (filters: FilterProps) => {
    setFilterType(() => FilterType.FILTERED);

    if (filters.type || filters.name) {
      setFilters(() => {
        return {
          name: filters.name,
          type: filters.type,
        };
      });
    }
  };

  const handleReset = () => {
    setFilterType(() => FilterType.DEFAULT);
  };

  return (
    <div>
      {loading || namesLoading ? (
        <div className="loading">Loading...</div>
      ) : (
        <>
          <div className="filter-form">
            <FilterForm
              onChange={(value: string) => setSearchTerm(value)}
              onApply={handleApplyFilters}
              onReset={handleReset}
            />
          </div>

          {pokemons.length > 0 ? (
            <div className="pokemon-list">
              {pokemons.map((pokemon) => (
                <PokeCard
                  key={pokemon.id}
                  id={pokemon.id}
                  name={pokemon.name}
                  image={pokemon.image}
                  types={pokemon.types}
                  onClickType={(type) => {
                    console.log("Type clicked:", type);
                    setFilterType(FilterType.FILTERED);
                    setFilters({ type });
                  }}
                />
              ))}
            </div>
          ) : (
            <div className="loading">No pokemons found :(</div>
          )}
        </>
      )}
      {pokemons.length > 0 ? (
        <div className="button-container">
          <button onClick={handlePrevPage} className="button button-prev">
            Prev
          </button>
          <button onClick={handleNextPage} className="button button-next">
            Next
          </button>
        </div>
      ) : null}
    </div>
  );
};
