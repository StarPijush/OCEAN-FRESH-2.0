interface SessionExpiredDialogProps {
  isOpen: boolean;
  onLogin: () => void;
  message?: string;
}

export function SessionExpiredDialog({
  isOpen,
  onLogin,
  message = 'Your session has expired. Please sign in again.',
}: SessionExpiredDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" role="dialog" aria-modal="true">
      <div className="bg-white rounded-lg shadow-xl p-6 max-w-sm w-full mx-4">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 rounded-full bg-yellow-100 flex items-center justify-center mb-4">
            <span className="text-yellow-600 text-xl">!</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Session Expired</h3>
          <p className="text-sm text-gray-600 mb-6">{message}</p>
          <button
            onClick={onLogin}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Sign In Again
          </button>
        </div>
      </div>
    </div>
  );
}
