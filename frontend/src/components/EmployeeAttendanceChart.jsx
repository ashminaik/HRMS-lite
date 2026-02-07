import React, { useState, useEffect } from "react";
import ReactApexChart from "react-apexcharts";
import { fetchAttendanceByEmployee } from "../services/api";

const FILTERS = [
  { label: "1Y", value: "year" },
  { label: "1M", value: "month" },
  { label: "1W", value: "week" },
];

const MONTHS = [
  { label: "Jan", value: 0 },
  { label: "Feb", value: 1 },
  { label: "Mar", value: 2 },
  { label: "Apr", value: 3 },
  { label: "May", value: 4 },
  { label: "Jun", value: 5 },
  { label: "Jul", value: 6 },
  { label: "Aug", value: 7 },
  { label: "Sep", value: 8 },
  { label: "Oct", value: 9 },
  { label: "Nov", value: 10 },
  { label: "Dec", value: 11 },
];

const EmployeeAttendanceChart = ({ employeeId }) => {
  const [filter, setFilter] = useState("month");
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [attendance, setAttendance] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const monthToUse = selectedMonth;

  useEffect(() => {
    if (!employeeId) return;

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const now = new Date();
        let startDate, endDate, cats = [];

        if (filter === "year") {
          startDate = new Date(now.getFullYear(), 0, 1);
          endDate = new Date(now.getFullYear(), 11, 31);
          cats = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        } else if (filter === "month") {
          startDate = new Date(now.getFullYear(), monthToUse, 1);
          endDate = new Date(now.getFullYear(), monthToUse + 1, 0);
          cats = Array.from({ length: endDate.getDate() }, (_, i) => `${i + 1}`);
        } else {
          // week
          const day = now.getDay();
          startDate = new Date(now);
          startDate.setDate(now.getDate() - day);
          endDate = new Date(now);
          endDate.setDate(now.getDate() + (6 - day));
          cats = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        }

        setCategories(cats);

        const res = await fetchAttendanceByEmployee(employeeId, startDate, endDate);
        let data = [];

        if (filter === "year") {
          // Count working days per month (exclude weekends)
          const workingDaysPerMonth = cats.map((_, idx) => {
            let count = 0;
            const daysInMonth = new Date(now.getFullYear(), idx + 1, 0).getDate();
            for (let d = 1; d <= daysInMonth; d++) {
              const dayOfWeek = new Date(now.getFullYear(), idx, d).getDay();
              if (dayOfWeek !== 0 && dayOfWeek !== 6) count++;
            }
            return count;
          });

          // Count present days per month
          const presentPerMonth = Array(12).fill(0);
          res.records.forEach((rec) => {
            const month = new Date(rec.date).getMonth();
            if (rec.status === "Present") presentPerMonth[month] += 1;
          });

          // Calculate percentage based on working days
          data = presentPerMonth.map((present, idx) => {
            const workingDays = workingDaysPerMonth[idx];
            return workingDays > 0 ? Math.round((present / workingDays) * 100) : 0;
          });
        } else if (filter === "month") {
          const days = endDate.getDate();
          data = Array(days).fill(0);
          res.records.forEach((rec) => {
            const day = new Date(rec.date).getDate() - 1;
            if (rec.status === "Present") data[day] = 100;
            else if (rec.status === "On Leave") data[day] = 50;
            else data[day] = 0;
          });
        } else {
          // week
          data = Array(7).fill(0);
          res.records.forEach((rec) => {
            const day = new Date(rec.date).getDay();
            if (rec.status === "Present") data[day] = 100;
            else if (rec.status === "On Leave") data[day] = 50;
            else data[day] = 0;
          });
        }
        setAttendance(data);
      } catch (err) {
        setError("Failed to load attendance data");
        setAttendance([]);
      }
      setLoading(false);
    };
    fetchData();
  }, [employeeId, filter, monthToUse]);

  const maxVal = Math.max(...attendance, 1);
  const chartOptions = {
    chart: {
      type: "bar",
      height: 350,
      toolbar: { show: false },
    },
    plotOptions: {
      bar: {
        borderRadius: 6,
        columnWidth: "60%",
        distributed: true,
      },
    },
    dataLabels: {
      enabled: true,
      formatter: (val) => `${val}%`,
      style: { colors: ["#fff"], fontSize: "10px" },
    },
    xaxis: {
      categories,
      labels: { style: { colors: "#333", fontSize: "11px" } },
    },
    yaxis: {
      labels: { formatter: (val) => `${val}%` },
      max: 100,
      min: 0,
    },
    colors: attendance.map((val) =>
      val >= 80 ? "#9AAB63" : val >= 50 ? "#F5D867" : "#FF6B6B"
    ),
    tooltip: {
      y: { formatter: (val) => `${val}% Attendance` },
    },
    grid: { strokeDashArray: 4, borderColor: "#e5e5e5" },
    legend: { show: false },
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        <h3 className="text-lg font-semibold text-ink">Attendance Percentage</h3>
        <div className="flex gap-2">
          {FILTERS.map((f) => (
            <button
              type="button"
              key={f.value}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold border transition ${
                filter === f.value
                  ? "bg-ink text-white border-ink"
                  : "bg-white text-ink border-gray-300 hover:border-ink"
              }`}
              onClick={(e) => { e.preventDefault(); setFilter(f.value); }}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Month Selection - Only show when 1M filter is selected */}
      {filter === "month" && (
        <div className="flex flex-wrap gap-1 mb-4">
          {MONTHS.map((m) => (
            <button
              type="button"
              key={m.value}
              onClick={(e) => { e.preventDefault(); setSelectedMonth(m.value); }}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition ${
                selectedMonth === m.value
                  ? "bg-blue-500 text-white"
                  : "bg-blue-100 text-blue-700 hover:bg-blue-200"
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-slate">Loading attendance data...</div>
        </div>
      ) : error ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-red-500">{error}</div>
        </div>
      ) : attendance.length === 0 ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-slate">No attendance data available</div>
        </div>
      ) : (
        <ReactApexChart
          options={chartOptions}
          series={[{ name: "Attendance", data: attendance }]}
          type="bar"
          height={350}
        />
      )}

      {/* Legend */}
      <div className="flex justify-center gap-6 mt-4 text-xs">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-[#9AAB63]"></div>
          <span className="text-slate">≥80% (Good)</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-[#F5D867]"></div>
          <span className="text-slate">50-79% (Average)</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-[#FF6B6B]"></div>
          <span className="text-slate">&lt;50% (Low)</span>
        </div>
      </div>
    </div>
  );
};

export default EmployeeAttendanceChart;
