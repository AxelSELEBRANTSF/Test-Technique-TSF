// src/components/SearchInput.tsx
import React from "react";

type Props = {
  value: string;
  onChange: (v: string) => void;
  suggestions: string[];
  onPick: (v: string) => void;
  placeholder?: string;
  disabled?: boolean;
  width?: number | string;
};

export default function SearchInput({
  value, onChange, suggestions, onPick,
  placeholder = "Rechercher…",
  disabled
}: Props) {
  const [open, setOpen] = React.useState(false);

  return (
    <div style={{ position: "relative" }}>
      <input
        className="form-input w-320"
        placeholder={placeholder}
        value={value}
        onChange={e => onChange(e.target.value)}
        autoComplete="off"
        disabled={disabled}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 120)}
      />
      {open && !!suggestions.length && (
        <ul className="dropdown-menu show suggestions-menu">
          {suggestions.map((s, i) => (
            <li key={i}>
              <button
                type="button"
                className="dropdown-item"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => onPick(s)}
              >
                {s}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
