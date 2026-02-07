const FilterPanel = ({
  departments,
  roles,
  selectedDepartment,
  setSelectedDepartment,
  selectedRole,
  setSelectedRole,
}) => {
  return (
    <div className="rounded-2xl bg-white p-4 shadow-soft">
      <h3 className="mb-4 text-sm font-semibold text-ink">
        Filter by: Role and Department
      </h3>
      
      {/* Department Filter */}
      <div className="mb-3">
        <label className="mb-1.5 block text-xs font-medium text-slate">
          Department
        </label>
        <select
          value={selectedDepartment}
          onChange={(e) => setSelectedDepartment(e.target.value)}
          className="w-full rounded-xl border border-slate/20 bg-cream/50 px-3 py-2 text-sm text-ink focus:border-pastel-pink focus:ring-2 focus:ring-pastel-pink/20 focus:outline-none transition"
        >
          <option value="All">All Departments</option>
          {departments.map((dept) => (
            <option key={dept} value={dept}>
              {dept}
            </option>
          ))}
        </select>
      </div>

      {/* Role Filter */}
      <div>
        <label className="mb-1.5 block text-xs font-medium text-slate">
          Role
        </label>
        <select
          value={selectedRole}
          onChange={(e) => setSelectedRole(e.target.value)}
          className="w-full rounded-xl border border-slate/20 bg-cream/50 px-3 py-2 text-sm text-ink focus:border-pastel-pink focus:ring-2 focus:ring-pastel-pink/20 focus:outline-none transition"
        >
          <option value="All">All Roles</option>
          {roles.map((role) => (
            <option key={role} value={role}>
              {role}
            </option>
          ))}
        </select>
      </div>

      {/* Clear Filters */}
      {(selectedDepartment !== "All" || selectedRole !== "All") && (
        <button
          type="button"
          onClick={() => {
            setSelectedDepartment("All");
            setSelectedRole("All");
          }}
          className="mt-3 w-full rounded-xl bg-pastel-pink/30 px-3 py-1.5 text-xs font-medium text-ink hover:bg-pastel-pink/50 transition"
        >
          Clear Filters
        </button>
      )}
    </div>
  );
};

export default FilterPanel;
