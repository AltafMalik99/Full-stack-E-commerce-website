import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function SearchBar({ initialValue = "" }) {
  const [term, setTerm] = useState(initialValue);
  const navigate = useNavigate();

  function handleSubmit(e) {
    e.preventDefault();
    if (term.trim()) {
      navigate(`/categories/all?search=${encodeURIComponent(term.trim())}`);
    }
  }

  return (
    <form className="search-bar" onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Search for products..."
        value={term}
        onChange={(e) => setTerm(e.target.value)}
      />
      <button type="submit" aria-label="Search">
        🔍
      </button>
    </form>
  );
}
