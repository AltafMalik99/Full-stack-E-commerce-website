export default function EmptyState({ message = "Nothing here yet." }) {
  return (
    <div className="text-center py-16 text-white/40">
      <p>{message}</p>
    </div>
  );
}
