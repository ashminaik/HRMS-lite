import { useState, useEffect } from "react";
import { fetchAttendanceByEmployee } from "../services/api";

const statusOptions = [
  { label: "Present", activeBg: "bg-[#9AAB63]", activeText: "text-white", inactiveBg: "bg-gray-100" },
  { label: "Absent", activeBg: "bg-[#f44336]", activeText: "text-white", inactiveBg: "bg-gray-100" },
  { label: "On Leave", activeBg: "bg-[#F5D867]", activeText: "text-white", inactiveBg: "bg-gray-100" },
];

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// Attendance Calendar Component
const AttendanceCalendar = ({ employeeId }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [attendance, setAttendance] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchMonthAttendance = async () => {
      setLoading(true);
      try {
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth();
        const startDate = new Date(year, month, 1);
        const endDate = new Date(year, month + 1, 0);
        const res = await fetchAttendanceByEmployee(employeeId, startDate, endDate);
        
        const map = {};
        res.records.forEach((rec) => {
          const day = new Date(rec.date).getDate();
          map[day] = rec.status;
        });
        setAttendance(map);
      } catch (err) {
        console.error("Failed to fetch attendance:", err);
      }
      setLoading(false);
    };
    fetchMonthAttendance();
  }, [employeeId, currentMonth]);

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  // Calendar grid generation
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  
  const calendarDays = [];
  for (let i = 0; i < firstDay; i++) {
    calendarDays.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    calendarDays.push(d);
  }

  const getStatusColor = (day) => {
    if (!day) return "";
    const status = attendance[day];
    if (status === "Present") return "bg-[#9AAB63]";
    if (status === "Absent") return "bg-[#f44336]";
    if (status === "On Leave") return "bg-[#F5D867]";
    return "bg-gray-200";
  };

  return (
    <div className="bg-transparent border-2 border-blue-400 rounded-xl p-4">
      {/* Legend */}
      <div className="flex justify-center gap-4 mb-3">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-[#9AAB63]"></div>
          <span className="text-xs text-slate">Present</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-[#f44336]"></div>
          <span className="text-xs text-slate">Absent</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-[#F5D867]"></div>
          <span className="text-xs text-slate">On Leave</span>
        </div>
      </div>

      {/* Month Navigation */}
      <div className="flex items-center justify-between mb-3">
        <button
          type="button"
          onClick={(e) => { e.preventDefault(); prevMonth(); }}
          className="p-1.5 rounded-lg hover:bg-blue-100 transition"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <span className="font-semibold text-ink">{MONTHS[month]} {year}</span>
        <button
          type="button"
          onClick={(e) => { e.preventDefault(); nextMonth(); }}
          className="p-1.5 rounded-lg hover:bg-blue-100 transition"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Calendar Grid */}
      {loading ? (
        <div className="flex items-center justify-center h-48">
          <span className="text-slate">Loading...</span>
        </div>
      ) : (
        <div>
          {/* Day Headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {DAYS.map((day) => (
              <div key={day} className="text-center text-xs font-semibold text-slate py-1">
                {day}
              </div>
            ))}
          </div>
          
          {/* Date Cells */}
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((day, idx) => (
              <div
                key={idx}
                className={`aspect-square flex flex-col items-center justify-center rounded-lg text-sm ${
                  day ? "bg-cream/50" : ""
                }`}
              >
                {day && (
                  <>
                    <span className="text-ink font-medium">{day}</span>
                    {attendance[day] && (
                      <div className={`w-2 h-2 rounded-full mt-0.5 ${getStatusColor(day)}`}></div>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Employee Info Card with attendance stats
const EmployeeInfoCard = ({ employee, currentStatus }) => {
  const [stats, setStats] = useState({ presentDays: 0, workingDays: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const today = new Date();
        const startOfYear = new Date(today.getFullYear(), 0, 1);
        
        // Calculate working days (exclude Sat & Sun) from start of year till today
        let workingDays = 0;
        const current = new Date(startOfYear);
        while (current <= today) {
          const day = current.getDay();
          if (day !== 0 && day !== 6) { // Not Sunday (0) or Saturday (6)
            workingDays++;
          }
          current.setDate(current.getDate() + 1);
        }

        // Fetch attendance data
        const res = await fetchAttendanceByEmployee(employee.employeeId, startOfYear, today);
        const presentDays = res.records.filter(rec => rec.status === "Present").length;

        setStats({ presentDays, workingDays });
      } catch (err) {
        console.error("Failed to fetch attendance stats:", err);
      }
      setLoading(false);
    };
    fetchStats();
  }, [employee.employeeId]);

  return (
    <div className="lg:w-1/3 bg-transparent border-2 border-blue-400 rounded-xl p-4">
      <h4 className="text-sm font-semibold text-ink mb-3">Employee Details</h4>
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-slate">ID:</span>
          <span className="font-medium text-ink">{employee.employeeId}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate">Name:</span>
          <span className="font-medium text-ink">{employee.fullName}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate">Department:</span>
          <span className="font-medium text-ink">{employee.department}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate">Role:</span>
          <span className="font-medium text-ink">{employee.role}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-slate">Today's Status:</span>
          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
            currentStatus === "Present" ? "bg-[#9AAB63] text-white" :
            currentStatus === "Absent" ? "bg-[#f44336] text-white" :
            currentStatus === "On Leave" ? "bg-[#F5D867] text-white" :
            "bg-gray-200 text-slate"
          }`}>
            {currentStatus || "Not Marked"}
          </span>
        </div>
      </div>
      
      {/* Total Present Days */}
      <div className="mt-4 pt-3 border-t border-blue-200 text-center">
        {loading ? (
          <span className="text-slate text-sm">Loading stats...</span>
        ) : (
          <span className="text-ink font-bold text-sm">
            Total Present Days: {stats.presentDays} / {stats.workingDays}
          </span>
        )}
      </div>
    </div>
  );
};

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
  const [expandedEmployee, setExpandedEmployee] = useState(null);

  const toggleExpand = (employeeId) => {
    setExpandedEmployee(expandedEmployee === employeeId ? null : employeeId);
  };
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
            const isExpanded = expandedEmployee === employee.employeeId;
            const currentStatus = attendanceMap[employee.employeeId];
            return (
            <div key={employee._id}>
              <div
                className={`grid grid-cols-[0.8fr_1.4fr_0.8fr_0.8fr_1.8fr_0.8fr] items-center gap-2 py-3 text-sm text-ink ${isUnmarked ? 'bg-red-100/60 -mx-4 px-4 rounded-lg border-l-4 border-red-400' : ''}`}
              >
              <span className="text-[11px] font-semibold text-slate truncate">
                {employee.employeeId}
              </span>
              <div className="truncate">
                <button
                  type="button"
                  onClick={(e) => { e.preventDefault(); toggleExpand(employee.employeeId); }}
                  className="font-medium text-ink hover:text-blue-600 hover:underline cursor-pointer transition"
                >
                  {employee.fullName}
                </button>
              </div>
              <span className="text-[11px] text-slate truncate">{employee.department}</span>
              <span className="text-[11px] text-slate truncate">{employee.role}</span>

              <div className="flex items-center gap-1">
                {statusOptions.map((option) => {
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

          {/* Expandable Panel */}
          {isExpanded && (
            <div className="py-4 px-2 bg-cream/30 animate-in slide-in-from-top-2 duration-200">
              <div className="flex flex-col lg:flex-row gap-4">
                {/* Info Card */}
                <EmployeeInfoCard employee={employee} currentStatus={currentStatus} />

                {/* Calendar Card */}
                <div className="lg:w-2/3">
                  <AttendanceCalendar employeeId={employee.employeeId} />
                </div>
              </div>
            </div>
          )}
        </div>
        );
      })}
        </div>
      </div>
    </div>
  );
};

export default EmployeeList;
