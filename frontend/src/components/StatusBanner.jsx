const WarningIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5 shrink-0"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
    />
  </svg>
);

const ErrorIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5 shrink-0"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);

const InfoIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5 shrink-0"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);

const StatusBanner = ({ message, tone = "info" }) => {
  if (!message) {
    return null;
  }

  const toneClasses = {
    info: "bg-pastel-blue/60",
    error: "bg-pastel-pink/70",
    success: "bg-pastel-green/70",
    warning: "bg-pastel-yellow/80",
  };

  const icons = {
    info: <InfoIcon />,
    error: <ErrorIcon />,
    success: <InfoIcon />,
    warning: <WarningIcon />,
  };

  return (
    <div
      className={`flex items-center gap-3 rounded-card px-4 py-3 text-sm text-ink shadow-soft ${
        toneClasses[tone] || toneClasses.info
      }`}
    >
      {icons[tone] || icons.info}
      <span>{message}</span>
    </div>
  );
};

export default StatusBanner;
