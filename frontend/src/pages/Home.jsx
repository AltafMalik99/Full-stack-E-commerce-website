import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { fetchProducts } from "../redux/productSlice";
import Hero from "../components/Hero";
import ProductGrid from "../components/ProductGrid";
import CategoryCard from "../components/CategoryCard";
import Loading from "../components/Loading";
import ErrorMessage from "../components/ErrorMessage";

const CATEGORIES = [
  {
    name: "Men",
    slug: "men",
    image: "https://images.unsplash.com/photo-1516257984-b1b4d707412e?w=400&q=80",
  },
  {
    name: "Women",
    slug: "women",
    image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=400&q=80",
  },
  {
    name: "Shoes",
    slug: "shoes",
    image: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=400&q=80",
  },
  {
    name: "Accessories",
    slug: "accessories",
    image: "https://images.unsplash.com/photo-1611652022419-a9419f74343d?w=400&q=80",
  },
];

export default function Home() {
  const dispatch = useDispatch();
  const { items, status, error } = useSelector((state) => state.products);

  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  const newArrivals = items.slice(0, 4);
  const popular = [...items].sort((a, b) => b.rating - a.rating).slice(0, 4);

  return (
    <>
      <Hero />

      <section className="section">
        <h2 className="section-title">Shop by Category</h2>
        <div className="category-grid">
          {CATEGORIES.map((cat) => (
            <CategoryCard key={cat.slug} {...cat} />
          ))}
        </div>
      </section>

      {status === "loading" && <Loading label="Loading products..." />}
      {status === "failed" && (
        <ErrorMessage
          message={error || "Could not load products."}
          onRetry={() => dispatch(fetchProducts())}
        />
      )}

      {status === "succeeded" && (
        <>
          <section className="section">
            <div className="section-header">
              <h2 className="section-title">New Arrivals</h2>
              <Link to="/categories/all" className="section-link">
                View All
              </Link>
            </div>
            <ProductGrid products={newArrivals} />
          </section>

          <section className="section promo-section">
            <h2>Up to 30% Off Selected Styles</h2>
            <p>Refresh your wardrobe with our latest seasonal picks.</p>
            <Link to="/categories/all" className="btn btn-primary btn-large">
              Shop the Sale
            </Link>
          </section>

          <section className="section">
            <div className="section-header">
              <h2 className="section-title">Popular Products</h2>
              <Link to="/categories/all" className="section-link">
                View All
              </Link>
            </div>
            <ProductGrid products={popular} />
          </section>
        </>
      )}
    </>
  );
}
