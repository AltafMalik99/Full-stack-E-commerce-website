export default function Loading({ label = "Loading..." }) {
  return (
    <div className="loading-container">
      <div className="spinner" />
      <p>{label}</p>
    </div>
  );
}
