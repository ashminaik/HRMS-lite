const statusOptions = [
  { label: "Present", color: "bg-pastel-green" },
  { label: "Absent", color: "bg-pastel-pink" },
  { label: "On Leave", color: "bg-pastel-yellow" },
];

const EmployeeCard = ({
  employee,
  selectedStatus,
  onStatusChange,
  onEdit,
  onDelete,
  isSaving,
}) => {
  return (
    <div className="rounded-card bg-white/95 p-6 shadow-soft transition hover:-translate-y-1">
      <div className="flex flex-wrap items-start justify-between gap-6">
        <div>
          <h3 className="text-lg font-semibold text-ink">
            {employee.fullName}
          </h3>
          <p className="text-xs text-slate">{employee.employeeId}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            <span className="rounded-full bg-pastel-lavender px-3 py-1 text-[11px] font-semibold text-ink">
              {employee.department}
            </span>
            <span className="rounded-full bg-pastel-blue px-3 py-1 text-[11px] font-semibold text-ink">
              {employee.role}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-6">
          <div className="flex items-center gap-3">
            {statusOptions.map((option) => {
              const active = selectedStatus === option.label;
              return (
                <button
                  key={option.label}
                  type="button"
                  className={`flex items-center gap-2 rounded-full px-3 py-2 text-xs font-medium transition ${
                    active ? "text-ink" : "text-slate"
                  } ${option.color}`}
                  onClick={() => onStatusChange(option.label)}
                  disabled={isSaving}
                >
                  <span
                    className={`h-3 w-3 rounded-full border ${
                      active ? "border-ink" : "border-transparent"
                    } bg-white/70`}
                  />
                  {option.label}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              className="rounded-full bg-cream px-4 py-2 text-xs font-semibold text-ink transition hover:shadow-soft"
              onClick={onEdit}
            >
              Edit
            </button>
            <button
              type="button"
              className="rounded-full bg-[#fbd5d5] px-4 py-2 text-xs font-semibold text-ink transition hover:shadow-soft"
              onClick={onDelete}
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeCard;
