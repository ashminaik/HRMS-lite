import { useState } from "react";

const weekdayLabels = ["MO", "TU", "WE", "TH", "FR", "SA", "SU"];

const buildCalendar = (date) => {
  const year = date.getFullYear();
  const month = date.getMonth();
  const firstOfMonth = new Date(year, month, 1);
  // Adjust for Monday start (0 = Monday, 6 = Sunday)
  let startDay = firstOfMonth.getDay() - 1;
  if (startDay < 0) startDay = 6;
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const days = [];
  for (let i = 0; i < 42; i += 1) {
    const dayNumber = i - startDay + 1;
    const dayDate = new Date(year, month, dayNumber);
    const inMonth = dayNumber >= 1 && dayNumber <= daysInMonth;
    days.push({ date: dayDate, inMonth });
  }

  return days;
};

const formatMonth = (date) =>
  date.toLocaleDateString("en-US", { month: "long", year: "numeric" });

const isSameDay = (left, right) =>
  left.toDateString() === right.toDateString();

const ChevronLeft = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
  </svg>
);

const ChevronRight = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
  </svg>
);

const MiniCalendar = ({ selectedDate, setSelectedDate }) => {
  const [viewDate, setViewDate] = useState(new Date(selectedDate));
  const today = new Date();
  const days = buildCalendar(viewDate);

  const goToPrevMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
  };

  const handleDateSelect = (day) => {
    if (day.inMonth) {
      setSelectedDate(day.date);
    }
  };

  // Get week number
  const getWeekNumber = (date) => {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  };

  return (
    <div className="rounded-2xl bg-white p-4 shadow-soft">
      {/* Header with arrows and pink pill */}
      <div className="mb-4 flex items-center justify-between">
        <button
          type="button"
          onClick={goToPrevMonth}
          className="p-1 text-slate hover:text-ink transition"
        >
          <ChevronLeft />
        </button>
        
        <span className="rounded-full bg-pastel-pink px-4 py-1.5 text-sm font-semibold text-ink">
          {formatMonth(viewDate)}
        </span>
        
        <button
          type="button"
          onClick={goToNextMonth}
          className="p-1 text-slate hover:text-ink transition"
        >
          <ChevronRight />
        </button>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-8 gap-1 mb-2">
        <div></div> {/* Empty for week number column */}
        {weekdayLabels.map((label) => (
          <div key={label} className="text-center text-[10px] font-medium text-slate/70">
            {label}
          </div>
        ))}
      </div>

      {/* Calendar grid with week numbers */}
      <div className="space-y-1">
        {[0, 1, 2, 3, 4, 5].map((weekIndex) => {
          const weekDays = days.slice(weekIndex * 7, (weekIndex + 1) * 7);
          const hasVisibleDays = weekDays.some(d => d.inMonth);
          if (!hasVisibleDays && weekIndex > 3) return null;
          
          const firstDayOfWeek = weekDays.find(d => d.inMonth)?.date || weekDays[0].date;
          const weekNum = getWeekNumber(firstDayOfWeek);
          
          return (
            <div key={weekIndex} className="grid grid-cols-8 gap-1">
              <div className="flex items-center justify-center text-[9px] text-slate/50 font-medium">
                W{weekNum}
              </div>
              {weekDays.map((day, dayIndex) => {
                const selected = isSameDay(day.date, selectedDate);
                const isToday = isSameDay(day.date, today);
                return (
                  <button
                    key={dayIndex}
                    type="button"
                    onClick={() => handleDateSelect(day)}
                    disabled={!day.inMonth}
                    className={`h-7 w-7 rounded-full text-[11px] font-medium transition flex items-center justify-center ${
                      day.inMonth ? "text-ink hover:bg-cream" : "text-slate/20"
                    } ${
                      selected
                        ? "bg-[#F5B8DB] text-ink shadow-sm"
                        : isToday && day.inMonth
                        ? "ring-2 ring-[#F5B8DB] ring-inset"
                        : ""
                    }`}
                  >
                    {day.date.getDate()}
                  </button>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MiniCalendar;
