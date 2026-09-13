export default function AdminLoading({ label = "Loading..." }) {
  return (
    <div className="text-center py-16 text-white/50">
      <div className="w-8 h-8 border-2 border-white/20 border-t-admin-accent rounded-full animate-spin mx-auto mb-3" />
      <p>{label}</p>
    </div>
  );
}
