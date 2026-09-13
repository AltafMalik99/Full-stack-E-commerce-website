import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchProducts } from "../redux/productSlice";
import ProductGrid from "../components/ProductGrid";
import FilterSidebar from "../components/FilterSidebar";
import Loading from "../components/Loading";
import ErrorMessage from "../components/ErrorMessage";

export default function Category() {
  const { categoryName } = useParams();
  const [searchParams] = useSearchParams();
  const dispatch = useDispatch();
  const { items, status, error, count } = useSelector((state) => state.products);

  const [category, setCategory] = useState(categoryName || "all");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sort, setSort] = useState("");
  const searchTerm = searchParams.get("search") || "";

  // Re-sync local category state whenever the URL param changes
  // (e.g. clicking a different category link in the navbar)
  useEffect(() => {
    setCategory(categoryName || "all");
  }, [categoryName]);

  // Fetch whenever any filter changes
  useEffect(() => {
    dispatch(
      fetchProducts({
        category: category === "all" ? undefined : category,
        search: searchTerm || undefined,
        minPrice: minPrice || undefined,
        maxPrice: maxPrice || undefined,
        sort: sort || undefined,
      })
    );
  }, [dispatch, category, searchTerm, minPrice, maxPrice, sort]);

  function handlePriceChange(which, value) {
    if (which === "min") setMinPrice(value);
    else setMaxPrice(value);
  }

  const pageTitle =
    searchTerm && category === "all"
      ? `Search results for "${searchTerm}"`
      : category.charAt(0).toUpperCase() + category.slice(1);

  return (
    <div className="category-page">
      <div className="category-header">
        <h1>{pageTitle}</h1>
        {status === "succeeded" && <p>{count} products found</p>}
      </div>

      <div className="category-layout">
        <FilterSidebar
          category={category}
          onCategoryChange={(cat) => setCategory(cat.toLowerCase())}
          minPrice={minPrice}
          maxPrice={maxPrice}
          onPriceChange={handlePriceChange}
          sort={sort}
          onSortChange={setSort}
        />

        <div className="category-content">
          {status === "loading" && <Loading label="Loading products..." />}
          {status === "failed" && (
            <ErrorMessage
              message={error || "Could not load products."}
              onRetry={() =>
                dispatch(fetchProducts({ category: category === "all" ? undefined : category }))
              }
            />
          )}
          {status === "succeeded" && <ProductGrid products={items} />}
        </div>
      </div>
    </div>
  );
}
