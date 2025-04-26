import React, { useState, useRef } from "react";
import PokeTypes from "../types/pokeTypes";

import "./PokeCard.css"; // Assuming you have a CSS file for styling
import { capitalizeFirstLetter } from "../services/helper-service/util";
import { getPokemonCry } from "../services/helper-service/pokemonHelper";

export interface PokeCardProps {
  id: number;
  name: string;
  types: PokeTypes[];
  image: string;
  onClickType?: (type: PokeTypes) => void;
  speciesInfo?: {
    flavor_text: string;
    generation: string;
    region: string;
  };
}

export const PokeCard: React.FC<PokeCardProps> = ({
  id,
  name,
  types,
  image,
  onClickType,
}) => {
  const [isPokeballOpen, setIsPokeballOpen] = useState(true);
  const mainType = types[0] || "normal";
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handlePokeBallClick = () => {
    const newState = !isPokeballOpen;
    setIsPokeballOpen(newState);
    if (newState) {
      playPokemonCry();
    }
  };
  const playPokemonCry = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    const audio = new Audio(getPokemonCry(id));
    audioRef.current = audio;
    audio.play().catch((error) => {
      console.error("Audio play encountered an error", error);
    });
  };

  const handleTypeClick = (type: PokeTypes) => {
    if (onClickType) {
      onClickType(type);
    }
  };

  return (
    <div className="poke-card-container">
      <div className={`poke-card-header type-${mainType}`}>
        <h3 className="poke-name">{name}</h3>
        <div className="type-icons">
          {types.map((type) => (
            <div
              style={{ cursor: "pointer" }}
              className={`type-icon ${type}`}
              key={type}
              title={`${capitalizeFirstLetter(type)} type - Click to filter`}
            >
              <img
                onClick={() => handleTypeClick(type)}
                src={`../../icons/type-icons/${type}.png`}
                alt={`${type} type`}
              />
            </div>
          ))}
        </div>
      </div>
      <div className={`poke-card-body type-${mainType}`}>
        <div className="poke-image">
          <img
            src={image}
            alt={name}
            className={`pokemon-sprite ${isPokeballOpen ? "visible" : ""}`}
          />
          <div className="poke-ball" onClick={() => handlePokeBallClick()}>
            <img
              src="../../icons/app-icons/pokeball.svg"
              alt=""
              className={`pokeball-img ${isPokeballOpen ? "open" : ""}`}
            />
          </div>
        </div>
        <div className="test">asfsaf</div>
      </div>
    </div>
  );
};
