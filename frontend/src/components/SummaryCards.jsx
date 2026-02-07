const cardColors = [
  "border-pastel-pink",
  "border-pastel-green",
  "border-[#E06666]",
  "border-pastel-yellow",
];

const SummaryCards = ({ summary, className = "" }) => {
  const items = [
    { label: "Total Employees", value: summary.totalEmployees },
    { label: "Present", value: summary.presentToday },
    { label: "Absent", value: summary.absentToday },
    { label: "On Leave", value: summary.onLeaveToday },
  ];

  return (
    <div className={`flex flex-wrap gap-6 ${className}`.trim()}>
      {items.map((item, index) => (
        <div
          key={item.label}
          className={`rounded-xl bg-transparent border-2 ${cardColors[index % cardColors.length]} px-5 py-1 shadow-soft transition hover:-translate-y-0.5 flex items-center gap-4`}
        >
          <p className="text-xs font-semibold uppercase tracking-wide text-slate whitespace-nowrap">
            {item.label}
          </p>
          <p className="text-lg font-bold text-ink">
            {item.value ?? 0}
          </p>
        </div>
      ))}
    </div>
  );
};

export default SummaryCards;
