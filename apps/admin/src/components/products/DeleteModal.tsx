interface Props {
  name: string;
  onConfirm: () => void;
  onClose: () => void;
}

export function DeleteModal({ name, onConfirm, onClose }: Props) {
  return (
    <div className="modal-overlay show" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">Delete Product</div>
          <button className="modal-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <p style={{ fontSize: '0.85rem', color: 'var(--muted2)', lineHeight: 1.6 }}>
          Delete <strong style={{ color: 'var(--cream)' }}>&quot;{name}&quot;</strong>? This cannot
          be undone.
        </p>

        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onClose}>
            Cancel
          </button>
          <button className="btn btn-danger" onClick={onConfirm}>
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
