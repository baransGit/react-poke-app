import { useState, useEffect } from "react";
import {
  getAllPokemonListItems,
  PokemonListItem,
} from "../services/pokemonService";

export function useAllListItems() {
  const [list, setList] = useState<PokemonListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchNames = async () => {
      setLoading(true);
      try {
        // Önce localStorage'a bak
        const cachedList = localStorage.getItem("allPokemonList");
        if (cachedList) {
          setList(JSON.parse(cachedList));
        } else {
          const fetchedList = await getAllPokemonListItems();
          setList(fetchedList);
          // Önbelleğe kaydet
          localStorage.setItem("allPokemonNames", JSON.stringify(fetchedList));
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Bilinmeyen hata"));
      } finally {
        setLoading(false);
      }
    };

    fetchNames();
  }, []);

  return { list, loading, error };
}
