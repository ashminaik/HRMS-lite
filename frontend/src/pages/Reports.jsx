import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";

const Reports = () => {
  return (
    <div className="min-h-screen bg-cream p-4 pl-44">
      <Sidebar />

      <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
        <div>
          <Topbar showSearch={false} />

          <div className="mt-6">
            <h2 className="text-2xl font-bold text-ink mb-2">Reports Dashboard</h2>
            <p className="text-slate mb-6">Generate and view reports about attendance and employee data.</p>

            <div className="grid gap-6 md:grid-cols-2">
              {/* Report cards */}
              <div className="rounded-2xl bg-white p-6 shadow-soft hover:shadow-lg transition cursor-pointer">
                <h3 className="text-lg font-semibold text-ink mb-2">Attendance Report</h3>
                <p className="text-sm text-slate">Generate detailed attendance reports by date range.</p>
                <button className="mt-4 rounded-full bg-pastel-blue px-4 py-2 text-xs font-semibold text-ink">
                  Generate
                </button>
              </div>

              <div className="rounded-2xl bg-white p-6 shadow-soft hover:shadow-lg transition cursor-pointer">
                <h3 className="text-lg font-semibold text-ink mb-2">Department Report</h3>
                <p className="text-sm text-slate">View attendance breakdown by department.</p>
                <button className="mt-4 rounded-full bg-pastel-green px-4 py-2 text-xs font-semibold text-ink">
                  Generate
                </button>
              </div>

              <div className="rounded-2xl bg-white p-6 shadow-soft hover:shadow-lg transition cursor-pointer">
                <h3 className="text-lg font-semibold text-ink mb-2">Leave Report</h3>
                <p className="text-sm text-slate">Track leave patterns and usage across employees.</p>
                <button className="mt-4 rounded-full bg-pastel-yellow px-4 py-2 text-xs font-semibold text-ink">
                  Generate
                </button>
              </div>

              <div className="rounded-2xl bg-white p-6 shadow-soft hover:shadow-lg transition cursor-pointer">
                <h3 className="text-lg font-semibold text-ink mb-2">Employee Report</h3>
                <p className="text-sm text-slate">Complete employee directory and information export.</p>
                <button className="mt-4 rounded-full bg-pastel-pink px-4 py-2 text-xs font-semibold text-ink">
                  Generate
                </button>
              </div>
            </div>

            <div className="mt-6 rounded-2xl bg-white p-6 shadow-soft">
              <h3 className="text-lg font-semibold text-ink mb-4">Recent Reports</h3>
              <p className="text-slate">No reports generated yet.</p>
            </div>
          </div>
        </div>

        {/* Right sidebar placeholder */}
        <div className="hidden lg:block">
          <div className="rounded-2xl bg-white p-4 shadow-soft">
            <h3 className="font-semibold text-ink mb-3">Export Options</h3>
            <p className="text-sm text-slate">Download reports in various formats.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
