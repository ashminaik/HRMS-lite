import { NavLink } from "react-router-dom";

const menuItems = [
  { label: "Dashboard", path: "/" },
  { label: "Statistics", path: "/statistics" },
  { label: "Employee Reports", path: "/reports" },
];

const Sidebar = () => {
  return (
    <aside className="fixed left-2 top-4 bottom-4 w-36 rounded-2xl bg-[#111827] px-3 py-6 text-white shadow-soft flex flex-col">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-black tracking-wide leading-none">HRMS</h1>
        <h1 className="text-3xl font-black tracking-wide leading-none">Lite</h1>
        <p className="text-base font-bold text-white mt-2">Admin Panel</p>
      </div>

      <nav className="space-y-2">
        {menuItems.map((item) => (
          <NavLink
            key={item.label}
            to={item.path}
            className={({ isActive }) =>
              `flex w-full items-center rounded-xl px-3 py-2.5 text-left text-sm font-medium transition ${
                isActive
                  ? "bg-pastel-green/80 text-ink shadow-soft"
                  : "text-white/80 hover:bg-white/10"
              }`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
