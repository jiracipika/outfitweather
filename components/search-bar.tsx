"use client";
import { useState, type FormEvent } from "react";
import { ArrowRight, LoaderCircle, Search } from "lucide-react";

export default function SearchBar({
  onSearch,
  isLoading,
}: {
  onSearch: (city: string) => void;
  isLoading: boolean;
}) {
  const [city, setCity] = useState("");
  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (city.trim()) onSearch(city.trim());
  };
  return (
    <form onSubmit={handleSubmit} role="search" className="diary-search">
      <Search size={18} aria-hidden="true" />
      <label className="sr-only" htmlFor="city-search">
        City name
      </label>
      <input
        id="city-search"
        type="search"
        autoComplete="address-level2"
        placeholder="Where are you headed?"
        value={city}
        onChange={(event) => setCity(event.target.value)}
        disabled={isLoading}
        maxLength={100}
      />
      <button
        type="submit"
        disabled={isLoading || !city.trim()}
        aria-label="Get weather forecast"
      >
        {isLoading ? (
          <LoaderCircle size={18} className="animate-spin" />
        ) : (
          <ArrowRight size={18} />
        )}
      </button>
    </form>
  );
}
