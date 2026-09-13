// Larger modal used for admin add/edit forms (Products, Categories, Coupons...).
// Distinct from ConfirmDialog which is only for yes/no confirmations.
export default function Modal({ open, title, onClose, children, wide = false }) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className={`bg-admin-card text-white rounded-2xl p-6 w-full ${
          wide ? "max-w-2xl" : "max-w-md"
        } max-h-[90vh] overflow-y-auto`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button onClick={onClose} className="text-white/50 hover:text-white text-xl leading-none">
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
