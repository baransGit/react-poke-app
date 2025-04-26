import PokeTypes from "../types/pokeTypes";
import { useState } from "react";
import { getTypesString } from "../services/helper-service/util";

import { capitalizeFirstLetter } from "../services/helper-service/util";
import "./FilterForm.css";
export interface FilterProps {
  name?: string;
  type?: PokeTypes;
}
interface FilterFormProps {
  onApply: (filters: FilterProps) => void;
  onReset: () => void;
  onChange: (value: string) => void;
}

export const FilterForm: React.FC<FilterFormProps> = ({
  onApply,
  onReset,
  onChange,
}) => {
  const [typeControl, setTypeControl] = useState<boolean>(true);
  const [nameFilter, setNameFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState<PokeTypes | "">("");
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!typeFilter) {
      setTypeControl(false);
      return;
    }

    const filters: FilterProps = {};
    if (nameFilter) filters.name = nameFilter;
    if (typeFilter) filters.type = typeFilter;
    console.log("Applying filters:", filters);
    onApply(filters);
  };
  const handleReset = () => {
    setNameFilter(() => "");
    setTypeFilter(() => "");
    setTypeControl(true);
    onReset();
  };

  return (
    <form className="form" onSubmit={handleSubmit}>
      <div className="form-group">
        <div className="form-input">
          <label>Name:</label>
          <input
            type="text"
            value={nameFilter}
            onChange={(e) => {
              const newValue = e.target.value;
              setNameFilter(newValue);
              onChange(newValue);
            }}
          />
        </div>
        <div className="form-input">
          <label>Type:</label>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as PokeTypes | "")}
          >
            <option value="">Select</option>
            {getTypesString().map((type, index) => {
              return (
                <option key={index} value={type}>
                  {capitalizeFirstLetter(type)}
                </option>
              );
            })}
          </select>
        </div>
      </div>
      <div className="form-buttons">
        <button type="submit">Filter</button>
        <button type="button" onClick={handleReset}>
          Reset
        </button>
      </div>
      {!typeControl ? <div className="error-message">Type Needed </div> : ""}
    </form>
  );
};
