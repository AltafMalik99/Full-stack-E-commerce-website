import { Link } from "react-router-dom";

export default function CategoryCard({ name, image, slug }) {
  return (
    <Link to={`/categories/${slug}`} className="category-card">
      <img src={image} alt={name} loading="lazy" />
      <span>{name}</span>
    </Link>
  );
}
