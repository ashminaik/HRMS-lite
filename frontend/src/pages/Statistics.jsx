import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";

const Statistics = () => {
  return (
    <div className="min-h-screen bg-cream p-4 pl-44">
      <Sidebar />

      <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
        <div>
          <Topbar showSearch={false} />

          <div className="mt-6">
            <h2 className="text-2xl font-bold text-ink mb-2">Statistics Dashboard</h2>
            <p className="text-slate mb-6">View detailed statistics and analytics about your workforce.</p>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {/* Placeholder cards for statistics */}
              <div className="rounded-2xl bg-white p-6 shadow-soft">
                <h3 className="text-lg font-semibold text-ink mb-2">Attendance Rate</h3>
                <p className="text-3xl font-bold text-pastel-green">--</p>
                <p className="text-sm text-slate mt-1">This month</p>
              </div>

              <div className="rounded-2xl bg-white p-6 shadow-soft">
                <h3 className="text-lg font-semibold text-ink mb-2">Leave Rate</h3>
                <p className="text-3xl font-bold text-pastel-yellow">--</p>
                <p className="text-sm text-slate mt-1">This month</p>
              </div>

              <div className="rounded-2xl bg-white p-6 shadow-soft">
                <h3 className="text-lg font-semibold text-ink mb-2">Absence Rate</h3>
                <p className="text-3xl font-bold text-pastel-pink">--</p>
                <p className="text-sm text-slate mt-1">This month</p>
              </div>
            </div>

            <div className="mt-6 rounded-2xl bg-white p-6 shadow-soft">
              <h3 className="text-lg font-semibold text-ink mb-4">Department Overview</h3>
              <p className="text-slate">Charts and graphs will be displayed here.</p>
              <div className="h-64 bg-cream/50 rounded-xl mt-4 flex items-center justify-center text-slate">
                Chart Placeholder
              </div>
            </div>
          </div>
        </div>

        {/* Right sidebar placeholder */}
        <div className="hidden lg:block">
          <div className="rounded-2xl bg-white p-4 shadow-soft">
            <h3 className="font-semibold text-ink mb-3">Quick Stats</h3>
            <p className="text-sm text-slate">Additional statistics widgets can go here.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Statistics;
