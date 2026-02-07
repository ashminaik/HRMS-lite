const statusOptions = [
  { label: "Present", activeBg: "bg-[#9AAB63]", activeText: "text-white", inactiveBg: "bg-gray-100" },
  { label: "Absent", activeBg: "bg-[#f44336]", activeText: "text-white", inactiveBg: "bg-gray-100" },
  { label: "On Leave", activeBg: "bg-[#F5D867]", activeText: "text-white", inactiveBg: "bg-gray-100" },
];

const EmployeeList = ({
  employees,
  attendanceMap,
  onStatusChange,
  onEdit,
  onDelete,
  savingAttendanceId,
  loading,
  unmarkedEmployees = [],
  selectedDate,
}) => {
  // Check if selected date is Sunday
  const isSunday = selectedDate && selectedDate.getDay() === 0;

  if (isSunday) {
    return (
      <div className="rounded-2xl bg-white/90 p-8 text-center shadow-soft">
        <p className="text-2xl font-semibold text-ink">Sunday is off Day</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={`skeleton-${index}`}
            className="h-16 rounded-card bg-white/60 shadow-soft animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (!employees.length) {
    return (
      <div className="rounded-card bg-white/90 p-8 text-center text-sm text-slate shadow-soft">
        No employees found yet. Add your first team member to get started.
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-white/90 p-4 shadow-soft">
      <div className="overflow-x-auto">
        <div className="grid grid-cols-[0.8fr_1.4fr_0.8fr_0.8fr_1.8fr_0.8fr] items-center gap-2 border-b border-cream pb-3 text-[11px] font-bold uppercase tracking-wide text-slate">
        <span>ID</span>
        <span>Name</span>
        <span>DEPT.</span>
        <span>Role</span>
        <span>Status</span>
        <span>Actions</span>
        </div>

        <div className="divide-y divide-cream">
          {employees.map((employee) => {
            const isUnmarked = unmarkedEmployees.includes(employee.employeeId);
            return (
            <div
              key={employee._id}
              className={`grid grid-cols-[0.8fr_1.4fr_0.8fr_0.8fr_1.8fr_0.8fr] items-center gap-2 py-3 text-sm text-ink ${isUnmarked ? 'bg-red-100/60 -mx-4 px-4 rounded-lg border-l-4 border-red-400' : ''}`}
            >
            <span className="text-[11px] font-semibold text-slate truncate">
              {employee.employeeId}
            </span>
            <div className="truncate">
              <span className="font-medium text-ink">{employee.fullName}</span>
            </div>
            <span className="text-[11px] text-slate truncate">{employee.department}</span>
            <span className="text-[11px] text-slate truncate">{employee.role}</span>

            <div className="flex items-center gap-1">
              {statusOptions.map((option) => {
                const currentStatus = attendanceMap[employee.employeeId];
                const active = currentStatus === option.label;
                return (
                  <button
                    key={`${employee._id}-${option.label}`}
                    type="button"
                    className={`px-2 py-1 text-[10px] font-medium rounded-full transition-all duration-200 ${
                      active 
                        ? `${option.activeBg} ${option.activeText} shadow-sm` 
                        : `${option.inactiveBg} text-gray-500 hover:bg-gray-200`
                    } ${savingAttendanceId === employee.employeeId ? 'opacity-50' : ''}`}
                    onClick={() => onStatusChange(employee, option.label)}
                    disabled={savingAttendanceId === employee.employeeId}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                className="p-1.5 rounded-lg bg-cream hover:bg-gray-200 transition"
                onClick={() => onEdit(employee)}
                title="Edit"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-ink" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
              <button
                type="button"
                className="p-1.5 rounded-lg bg-pastel-pink/70 hover:bg-pastel-red transition"
                onClick={() => onDelete(employee)}
                title="Delete"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-ink" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
        );
      })}
        </div>
      </div>
    </div>
  );
};

export default EmployeeList;
