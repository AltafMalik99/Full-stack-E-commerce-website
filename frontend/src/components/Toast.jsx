import { useEffect } from "react";

// Small success popup that auto-dismisses. Used after login/register.
// Pass `open` (boolean) and `onClose` so the parent can clear its state
// once the toast has been shown.
export default function Toast({ open, message, onClose, duration = 2000 }) {
  useEffect(() => {
    if (!open) return;
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [open, duration, onClose]);

  if (!open) return null;

  return (
    <div className="toast-overlay">
      <div className="toast-box">
        <span className="toast-icon">✓</span>
        <p>{message}</p>
      </div>
    </div>
  );
}
