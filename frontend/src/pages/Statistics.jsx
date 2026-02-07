import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import ReactApexChart from "react-apexcharts";
import { fetchStatistics } from "../services/api";

const Statistics = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const data = await fetchStatistics();
        setStats(data);
      } catch (err) {
        setError("Failed to load statistics");
        console.error(err);
      }
      setLoading(false);
    };
    loadStats();
  }, []);

  // Donut chart options for department distribution
  const donutOptions = {
    chart: { type: "donut" },
    labels: stats?.departmentDistribution?.map((d) => d._id) || [],
    colors: ["#9AAB63", "#B6CAEB", "#F5D867", "#F5B8DB", "#A8D5BA", "#D4B8F5"],
    legend: { position: "bottom", fontSize: "12px" },
    dataLabels: {
      enabled: true,
      formatter: (val, opts) => {
        const count = stats?.departmentDistribution?.[opts.seriesIndex]?.count || 0;
        return `${count}`;
      },
    },
    tooltip: {
      y: {
        formatter: (val, opts) => {
          const count = stats?.departmentDistribution?.[opts.seriesIndex]?.count || 0;
          return `${count} employees (${Math.round(val)}%)`;
        },
      },
    },
    plotOptions: {
      pie: {
        donut: {
          size: "65%",
          labels: {
            show: true,
            total: {
              show: true,
              label: "Total",
              formatter: () => stats?.totalEmployees || 0,
            },
          },
        },
      },
    },
  };
  const donutSeries = stats?.departmentDistribution?.map((d) => d.count) || [];

  // Bar chart for monthly trends
  const barOptions = {
    chart: { type: "bar", toolbar: { show: false }, stacked: false },
    plotOptions: { bar: { columnWidth: "60%", borderRadius: 4 } },
    xaxis: { categories: stats?.monthlyTrends?.map((m) => m.month) || [] },
    yaxis: { labels: { formatter: (val) => Math.round(val) } },
    colors: ["#9AAB63", "#F5B8DB", "#F5D867"],
    legend: { position: "top" },
    dataLabels: { enabled: false },
    grid: { strokeDashArray: 4, borderColor: "#e5e5e5" },
  };
  const barSeries = [
    { name: "Present", data: stats?.monthlyTrends?.map((m) => m.present) || [] },
    { name: "Absent", data: stats?.monthlyTrends?.map((m) => m.absent) || [] },
    { name: "On Leave", data: stats?.monthlyTrends?.map((m) => m.onLeave) || [] },
  ];

  return (
    <div className="min-h-screen bg-cream p-4 pl-44">
      <Sidebar />

      <div className="max-w-7xl mx-auto">
        <Topbar showSearch={false} />

        <div className="mt-6">
          <h2 className="text-2xl font-bold text-ink mb-2">Statistics Dashboard</h2>
          <p className="text-slate mb-6">View detailed statistics and analytics about your workforce.</p>

          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-slate">Loading statistics...</div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-red-500">{error}</div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Top Row: Total Employees + Insights */}
              <div className="grid gap-6 md:grid-cols-2">
                {/* Total Employees Card */}
                <div className="rounded-2xl bg-white p-6 shadow-soft">
                  <h3 className="text-sm font-medium text-slate mb-2">Total Employees</h3>
                  <p className="text-4xl font-bold text-ink">{stats.totalEmployees}</p>
                  <p className="text-sm text-slate mt-2">Overall workforce headcount</p>
                </div>

                {/* Quick Insights Card */}
                <div className="rounded-2xl bg-white p-6 shadow-soft">
                  <h3 className="text-sm font-medium text-slate mb-3">Quick Insights</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-slate mb-1">Top 3 Absentees</p>
                      <div className="space-y-1">
                        {stats.topAbsentees?.slice(0, 3).map((emp, idx) => (
                          <div key={idx} className="flex justify-between text-sm">
                            <span className="text-ink truncate">{emp.fullName}</span>
                            <span className="text-pastel-pink font-semibold">{emp.absent} days</span>
                          </div>
                        ))}
                        {(!stats.topAbsentees || stats.topAbsentees.length === 0) && (
                          <p className="text-xs text-slate">No data</p>
                        )}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-slate mb-1">Top 3 Best Attendance</p>
                      <div className="space-y-1">
                        {stats.bestAttendance?.slice(0, 3).map((emp, idx) => (
                          <div key={idx} className="flex justify-between text-sm">
                            <span className="text-ink truncate">{emp.fullName}</span>
                            <span className="text-pastel-green font-semibold">{emp.present} days</span>
                          </div>
                        ))}
                        {(!stats.bestAttendance || stats.bestAttendance.length === 0) && (
                          <p className="text-xs text-slate">No data</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Second Row: Donut Chart + Attendance Summary */}
              <div className="grid gap-6 md:grid-cols-2">
                {/* Department Distribution Donut */}
                <div className="rounded-2xl bg-white p-6 shadow-soft">
                  <h3 className="text-lg font-semibold text-ink mb-4">Department Distribution</h3>
                  {donutSeries.length > 0 ? (
                    <ReactApexChart
                      options={donutOptions}
                      series={donutSeries}
                      type="donut"
                      height={280}
                    />
                  ) : (
                    <div className="h-64 flex items-center justify-center text-slate">
                      No department data available
                    </div>
                  )}
                </div>

                {/* Attendance Summary */}
                <div className="rounded-2xl bg-white p-6 shadow-soft">
                  <h3 className="text-lg font-semibold text-ink mb-4">Attendance Summary</h3>
                  
                  {/* Today's Stats */}
                  <div className="mb-4">
                    <p className="text-xs font-medium text-slate mb-2">Today</p>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="bg-pastel-green/20 rounded-lg p-3 text-center">
                        <p className="text-2xl font-bold text-pastel-green">{stats.todayStats?.present || 0}</p>
                        <p className="text-xs text-slate">Present</p>
                      </div>
                      <div className="bg-pastel-pink/20 rounded-lg p-3 text-center">
                        <p className="text-2xl font-bold text-pastel-pink">{stats.todayStats?.absent || 0}</p>
                        <p className="text-xs text-slate">Absent</p>
                      </div>
                      <div className="bg-pastel-yellow/20 rounded-lg p-3 text-center">
                        <p className="text-2xl font-bold text-pastel-yellow">{stats.todayStats?.onLeave || 0}</p>
                        <p className="text-xs text-slate">On Leave</p>
                      </div>
                    </div>
                  </div>

                  {/* This Month Stats */}
                  <div>
                    <p className="text-xs font-medium text-slate mb-2">This Month</p>
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <div className="flex-1 bg-gray-100 rounded-full h-3 overflow-hidden">
                          <div
                            className="bg-pastel-green h-full rounded-full transition-all"
                            style={{ width: `${stats.monthStats?.presentPercent || 0}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium text-ink w-16">
                          {stats.monthStats?.presentPercent || 0}% Present
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex-1 bg-gray-100 rounded-full h-3 overflow-hidden">
                          <div
                            className="bg-pastel-pink h-full rounded-full transition-all"
                            style={{ width: `${stats.monthStats?.absentPercent || 0}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium text-ink w-16">
                          {stats.monthStats?.absentPercent || 0}% Absent
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex-1 bg-gray-100 rounded-full h-3 overflow-hidden">
                          <div
                            className="bg-pastel-yellow h-full rounded-full transition-all"
                            style={{ width: `${stats.monthStats?.onLeavePercent || 0}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium text-ink w-16">
                          {stats.monthStats?.onLeavePercent || 0}% Leave
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Third Row: Monthly Trends Chart */}
              <div className="rounded-2xl bg-white p-6 shadow-soft">
                <h3 className="text-lg font-semibold text-ink mb-4">Monthly Attendance Trends</h3>
                {barSeries?.[0]?.data?.length > 0 ? (
                  <ReactApexChart
                    options={barOptions}
                    series={barSeries}
                    type="bar"
                    height={300}
                  />
                ) : (
                  <div className="h-64 flex items-center justify-center text-slate">
                    No trend data available
                  </div>
                )}
              </div>

              {/* Fourth Row: Gender Distribution */}
              <div className="rounded-2xl bg-white p-6 shadow-soft">
                <h3 className="text-lg font-semibold text-ink mb-4">Gender Distribution</h3>
                <div className="space-y-4">
                  {/* Counts */}
                  <div className="flex justify-center gap-8">
                    <div className="text-center">
                      <p className="text-3xl font-bold text-pastel-blue">{stats.genderDistribution?.male || 0}</p>
                      <p className="text-sm text-slate">Men</p>
                    </div>
                    <div className="text-center">
                      <p className="text-3xl font-bold text-pastel-pink">{stats.genderDistribution?.female || 0}</p>
                      <p className="text-sm text-slate">Women</p>
                    </div>
                  </div>
                  
                  {/* Horizontal Progress Bar */}
                  <div className="relative">
                    <div className="flex h-8 rounded-full overflow-hidden bg-gray-100">
                      <div
                        className="bg-pastel-blue flex items-center justify-center transition-all"
                        style={{ width: `${stats.genderDistribution?.malePercent || 50}%` }}
                      >
                        <span className="text-xs font-semibold text-white">
                          {stats.genderDistribution?.malePercent || 50}%
                        </span>
                      </div>
                      <div
                        className="bg-pastel-pink flex items-center justify-center transition-all"
                        style={{ width: `${stats.genderDistribution?.femalePercent || 50}%` }}
                      >
                        <span className="text-xs font-semibold text-white">
                          {stats.genderDistribution?.femalePercent || 50}%
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Legend */}
                  <div className="flex justify-center gap-6">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-pastel-blue"></div>
                      <span className="text-sm text-slate">Men</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-pastel-pink"></div>
                      <span className="text-sm text-slate">Women</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Statistics;
