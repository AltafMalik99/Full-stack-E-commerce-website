const CATEGORIES = ["All", "Men", "Women", "Shoes", "Accessories"];
const SORT_OPTIONS = [
  { value: "", label: "Default" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "rating_desc", label: "Highest Rated" },
  { value: "newest", label: "Newest" },
];

// Controlled filter panel. Parent (Category page) owns the actual
// filter state and passes down values + change handlers as props.
export default function FilterSidebar({
  category,
  onCategoryChange,
  minPrice,
  maxPrice,
  onPriceChange,
  sort,
  onSortChange,
}) {
  return (
    <aside className="filter-sidebar">
      <div className="filter-group">
        <h4>Category</h4>
        {CATEGORIES.map((cat) => (
          <label key={cat} className="filter-radio">
            <input
              type="radio"
              name="category"
              checked={category.toLowerCase() === cat.toLowerCase()}
              onChange={() => onCategoryChange(cat)}
            />
            {cat}
          </label>
        ))}
      </div>

      <div className="filter-group">
        <h4>Price Range</h4>
        <div className="price-inputs">
          <input
            type="number"
            placeholder="Min"
            value={minPrice}
            onChange={(e) => onPriceChange("min", e.target.value)}
            min="0"
          />
          <span>-</span>
          <input
            type="number"
            placeholder="Max"
            value={maxPrice}
            onChange={(e) => onPriceChange("max", e.target.value)}
            min="0"
          />
        </div>
      </div>

      <div className="filter-group">
        <h4>Sort By</h4>
        <select value={sort} onChange={(e) => onSortChange(e.target.value)}>
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    </aside>
  );
}
