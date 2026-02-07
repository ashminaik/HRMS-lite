import { useState, useRef, useEffect } from "react";

const toISODate = (date) => date.toISOString().split("T")[0];

const QuickAttendance = ({ employees, onMarkAttendance, selectedDate: mainSelectedDate, setSelectedDate: setMainSelectedDate }) => {
  const [searchValue, setSearchValue] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  // Initialize quickDate from mainSelectedDate
  const [quickDate, setQuickDate] = useState(toISODate(mainSelectedDate));
  const [showDropdown, setShowDropdown] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(new Date());
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const dropdownRef = useRef(null);

  // Keep quickDate synced with main calendar
  useEffect(() => {
    setQuickDate(toISODate(mainSelectedDate));
  }, [mainSelectedDate]);

  const filteredEmployees = employees.filter((emp) => {
    const term = searchValue.toLowerCase();
    return (
      emp.fullName.toLowerCase().includes(term) ||
      emp.employeeId.toLowerCase().includes(term)
    );
  }).slice(0, 5);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
        setShowStatusDropdown(false);
        setShowCalendar(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectEmployee = (emp) => {
    setSelectedEmployee(emp);
    setSearchValue(emp.fullName);
    setShowDropdown(false);
    setShowStatusDropdown(true);
    setError(""); // Clear error when employee selected
  };

  const handleStatusSelect = async (status) => {
    if (!selectedEmployee) {
      setError("Please select an employee first.");
      return;
    }
    if (!quickDate) {
      setError("Please select a date.");
      return;
    }

    // Check for future date
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    const targetDate = new Date(quickDate);
    if (targetDate > today) {
      setError("Cannot mark attendance for future dates.");
      return;
    }

    // Check for Sunday
    if (targetDate.getDay() === 0) {
      setError("Sunday is off day.");
      return;
    }

    try {
      // First make the API call to save the attendance
      const result = await onMarkAttendance(selectedEmployee, quickDate, status);
      
      if (result?.error) {
        setError(result.error);
        setSuccess("");
      } else {
        setError("");
        setSuccess(`Marked ${selectedEmployee.fullName.split(' ')[0]} as ${status}`);
        setSearchValue("");
        setSelectedEmployee(null);
        setShowStatusDropdown(false);
        // Clear success message after 3 seconds
        setTimeout(() => setSuccess(""), 3000);
      }
    } catch (err) {
      setError(err.message || "Failed to mark attendance.");
      setSuccess("");
    }
  };

  const handleDateSelect = (date) => {
    setQuickDate(date.toISOString().split("T")[0]);
    setShowCalendar(false);
  };

  // Calendar helpers
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days = [];
    
    // Add empty slots for days before the first day
    for (let i = 0; i < firstDay.getDay(); i++) {
      days.push(null);
    }
    
    // Add the actual days
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i));
    }
    
    return days;
  };

  const formatDisplayDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const statusOptions = [
    { label: "Present", bg: "bg-[#9AAB63]", text: "text-white" },
    { label: "Absent", bg: "bg-[#f44336]", text: "text-white" },
    { label: "On Leave", bg: "bg-[#F5D867]", text: "text-white" },
  ];

  const weekDays = ["S", "M", "T", "W", "T", "F", "S"];

  return (
    <div className="relative" ref={dropdownRef}>
      <div className="rounded-2xl bg-pastel-pink/40 p-3 shadow-soft">
        <p className="text-[10px] font-semibold text-ink uppercase tracking-wide mb-2">Quick Mark Attendance</p>
        
        {/* Name/ID Input */}
        <div className="relative mb-2">
          <div className="flex items-center gap-2 rounded-xl bg-white px-3 py-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-slate" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <input
              type="text"
              className="flex-1 bg-transparent text-xs text-ink placeholder:text-slate outline-none"
              placeholder="Search name or ID..."
              value={searchValue}
              onChange={(e) => {
                setSearchValue(e.target.value);
                setShowDropdown(true);
                setSelectedEmployee(null);
                setShowStatusDropdown(false);
              }}
              onFocus={() => setShowDropdown(true)}
            />
          </div>
        </div>

        {/* No match message */}
        {searchValue && filteredEmployees.length === 0 && !selectedEmployee && (
          <p className="text-[10px] text-red-500 font-medium mt-1 px-1">Employee not found</p>
        )}

        {/* Date Input with Calendar Toggle */}
        <div className="relative">
          <div className="w-full flex items-center gap-2 rounded-xl bg-white px-3 py-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-slate" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <input
              type="date"
              className="flex-1 bg-transparent text-xs text-ink outline-none"
              value={quickDate}
              onChange={(e) => setQuickDate(e.target.value)}
            />
            <button
              type="button"
              className="p-1 hover:bg-gray-100 rounded transition"
              onClick={() => setShowCalendar(!showCalendar)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className={`h-3 w-3 text-slate transition ${showCalendar ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Employee Dropdown */}
      {showDropdown && searchValue && filteredEmployees.length > 0 && !selectedEmployee && (
        <div className="absolute left-0 right-0 top-full mt-2 z-30 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="px-3 py-2 text-[10px] font-semibold text-slate uppercase bg-gray-50">
            Select Employee
          </div>
          {filteredEmployees.map((emp) => (
            <button
              key={emp._id}
              type="button"
              className="w-full text-left px-3 py-2 text-xs hover:bg-pastel-pink/30 transition flex items-center justify-between"
              onClick={() => handleSelectEmployee(emp)}
            >
              <span className="font-medium text-ink">{emp.fullName}</span>
              <span className="text-[10px] text-slate">{emp.employeeId}</span>
            </button>
          ))}
        </div>
      )}

      {/* Status Dropdown */}
      {showStatusDropdown && selectedEmployee && (
        <div className="absolute left-0 right-0 top-full mt-2 z-30 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="px-3 py-2 text-[10px] font-semibold text-slate uppercase bg-gray-50">
            Mark {selectedEmployee.fullName.split(' ')[0]}
          </div>
          <div className="p-2 flex flex-col gap-1">
            {statusOptions.map((opt) => (
              <button
                key={opt.label}
                type="button"
                className={`w-full px-3 py-2 text-xs font-semibold rounded-lg ${opt.bg} ${opt.text} transition hover:opacity-90`}
                onClick={() => handleStatusSelect(opt.label)}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Calendar Dropdown */}
      {showCalendar && (
        <div className="absolute left-0 right-0 top-full mt-1 z-30 bg-white rounded-xl shadow-md border border-pastel-pink/50 overflow-hidden">
          <div className="p-2">
            {/* Month Navigation */}
            <div className="flex items-center justify-between mb-1.5">
              <button
                type="button"
                className="p-0.5 hover:bg-pastel-pink/30 rounded-full transition"
                onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1))}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-ink" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <span className="text-[9px] font-semibold text-ink">
                {calendarMonth.toLocaleDateString("en-US", { month: "short", year: "numeric" })}
              </span>
              <button
                type="button"
                className="p-0.5 hover:bg-pastel-pink/30 rounded-full transition"
                onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1))}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-ink" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            {/* Weekday Headers */}
            <div className="grid grid-cols-7 gap-px mb-0.5">
              {weekDays.map((day, i) => (
                <div key={i} className="text-center text-[8px] font-medium text-slate/70 py-0.5">
                  {day}
                </div>
              ))}
            </div>

            {/* Days Grid */}
            <div className="grid grid-cols-7 gap-px">
              {getDaysInMonth(calendarMonth).map((day, i) => {
                if (!day) {
                  return <div key={`empty-${i}`} className="w-5 h-5" />;
                }
                const dateStr = day.toISOString().split("T")[0];
                const isSelected = dateStr === quickDate;
                const isToday = dateStr === new Date().toISOString().split("T")[0];
                const isSunday = day.getDay() === 0;
                
                return (
                  <button
                    key={dateStr}
                    type="button"
                    className={`w-5 h-5 text-[8px] rounded-full transition flex items-center justify-center ${
                      isSelected
                        ? "bg-pastel-pink text-ink font-bold"
                        : isToday
                        ? "ring-1 ring-pastel-pink text-ink"
                        : isSunday
                        ? "text-gray-300"
                        : "hover:bg-pastel-pink/30 text-ink"
                    }`}
                    onClick={() => !isSunday && handleDateSelect(day)}
                    disabled={isSunday}
                  >
                    {day.getDate()}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <p className="text-[10px] text-red-500 font-medium mt-2 px-1">{error}</p>
      )}

      {/* Success Message */}
      {success && (
        <p className="text-[10px] text-[#9AAB63] font-medium mt-2 px-1">{success}</p>
      )}
    </div>
  );
};

export default QuickAttendance;
