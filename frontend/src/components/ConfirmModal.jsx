const ConfirmModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = "Confirm Action", 
  message = "Are you sure?",
  confirmText = "Confirm",
  cancelText = "Cancel",
  confirmColor = "bg-pastel-blue",
  icon = "warning"
}) => {
  if (!isOpen) return null;

  const icons = {
    warning: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-pastel-yellow" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    ),
    danger: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-[#f44336]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
      </svg>
    ),
    success: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-pastel-green" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    info: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-pastel-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-sm rounded-2xl bg-cream border-4 border-pastel-blue p-6 shadow-soft animate-in fade-in zoom-in duration-200">
        <div className="flex flex-col items-center text-center">
          <div className="mb-4">
            {icons[icon] || icons.warning}
          </div>
          <h3 className="text-lg font-bold text-ink mb-2">{title}</h3>
          <p className="text-sm text-slate mb-6">{message}</p>
          
          <div className="flex gap-3 w-full">
            <button
              type="button"
              className="flex-1 rounded-full bg-gray-200 px-4 py-2.5 text-sm font-semibold text-ink transition hover:bg-gray-300"
              onClick={onClose}
            >
              {cancelText}
            </button>
            <button
              type="button"
              className={`flex-1 rounded-full ${confirmColor} px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90`}
              onClick={() => {
                onConfirm();
                onClose();
              }}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
