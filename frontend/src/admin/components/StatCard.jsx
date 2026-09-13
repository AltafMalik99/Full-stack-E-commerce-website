export default function StatCard({ label, value, icon, accent = "from-admin-accent to-admin-accent2" }) {
  return (
    <div className={`admin-card bg-gradient-to-br ${accent} text-white`}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-2xl">{icon}</span>
      </div>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-white/80 text-sm mt-1">{label}</p>
    </div>
  );
}
