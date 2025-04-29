import { useState, useMemo, useEffect } from "react";
import { PokeCard } from "./PokeCard";

import FilterType from "../types/filterType";
import { PokemonListItem } from "../services/pokemonService";
import { getPokemonsByUrls, getSpecies } from "../services/pokemonService";
import { FilterForm, FilterProps } from "./FilterForm";
import { usePokemonList } from "../hooks/usePokemonList";
import { useAllListItems } from "../hooks/usePokemonListItems";
import "./PokemonList.css";
import { getPokemonItem } from "../services/helper-service/pokemonHelper";

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
  const { list: allPokemonList, loading: namesLoading } = useAllListItems();
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
      if (filteredListByName.length === 0) return;
      console.log("filteredListByName:", filteredListByName);
      try {
        const pokemonDetails = await getPokemonsByUrls(filteredListByName);
        const speciesPromises = pokemonDetails.map((pokemon) =>
          getSpecies(pokemon.id)
        );
        const speciesList = await Promise.all(speciesPromises);

        const processedPokemons = pokemonDetails.map((pokemon, index) =>
          getPokemonItem(pokemon, speciesList[index]!)
        );

        setPokemons(processedPokemons);
      } catch (err) {
        console.log("Cannot fetch data from urls");
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
    setSearchTerm("");
    setFilters({});
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
                  speciesInfo={pokemon.speciesInfo}
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
