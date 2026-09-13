// Simple, reusable confirmation modal. Renders nothing when `open` is false.
// Usage:
//   <ConfirmDialog
//     open={showConfirm}
//     title="Log out?"
//     message="Are you sure you want to log out?"
//     confirmLabel="Log out"
//     onConfirm={handleConfirmedLogout}
//     onCancel={() => setShowConfirm(false)}
//   />
export default function ConfirmDialog({
  open,
  title = "Are you sure?",
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  danger = false,
  onConfirm,
  onCancel,
}) {
  if (!open) return null;

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <h3>{title}</h3>
        {message && <p>{message}</p>}
        <div className="modal-actions">
          <button className="btn btn-secondary" onClick={onCancel}>
            {cancelLabel}
          </button>
          <button
            className={`btn ${danger ? "btn-danger" : "btn-primary"}`}
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
