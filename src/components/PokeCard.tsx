import React, { useState, useRef } from "react";
import PokeTypes from "../types/pokeTypes";
import { PokemonSpeciesData } from "../services/pokemonService";
import "./PokeCard.css"; // Assuming you have a CSS file for styling
import { capitalizeFirstLetter } from "../services/helper-service/util";
import { getPokemonCry } from "../services/helper-service/pokemonHelper";

export interface PokeCardProps {
  id: number;
  name: string;
  types: PokeTypes[];
  image: string;
  onClickType?: (type: PokeTypes) => void;
  speciesInfo?: PokemonSpeciesData;
}

export const PokeCard: React.FC<PokeCardProps> = ({
  id,
  name,
  types,
  image,
  onClickType,
  speciesInfo,
}) => {
  console.log("speciesInfo-flavor:", speciesInfo?.flavor_text);
  const [isPokeballOpen, setIsPokeballOpen] = useState(true);
  const [isTextExpanded, setIsTextExpanded] = useState(false);
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
        <div className="species-info">
          <p className={`flavor-text ${isTextExpanded ? "expanded" : ""}`}>
            {speciesInfo?.flavor_text}
          </p>

          {speciesInfo?.flavor_text &&
            speciesInfo.flavor_text.length > 70 &&
            !isTextExpanded && (
              <span
                className={`load-more-text type-${mainType}`}
                onClick={() => setIsTextExpanded(true)}
              >
                Load More
              </span>
            )}

          {isTextExpanded && (
            <span
              className={`load-more-text type-${mainType}`}
              onClick={() => setIsTextExpanded(false)}
            >
              Show Less
            </span>
          )}
        </div>
        <div className="reg-gen-infos">
          <span className="generation-info">Gen-{speciesInfo?.generation}</span>
          <span className="region-info">{speciesInfo?.region}</span>
        </div>
      </div>
    </div>
  );
};
