import { useMemo } from "react";

const FilterPanel = ({
  departments,
  roles,
  employees = [],
  selectedDepartment,
  setSelectedDepartment,
  selectedRole,
  setSelectedRole,
}) => {
  // Build a map of role -> department
  const roleToDepartment = useMemo(() => {
    const map = {};
    employees.forEach((emp) => {
      if (!map[emp.role]) {
        map[emp.role] = emp.department;
      }
    });
    return map;
  }, [employees]);

  // Filter roles based on selected department
  const filteredRoles = useMemo(() => {
    if (selectedDepartment === "All") {
      return roles;
    }
    return roles.filter((role) => {
      // Check if any employee with this role belongs to the selected department
      return employees.some(
        (emp) => emp.role === role && emp.department === selectedDepartment
      );
    });
  }, [roles, selectedDepartment, employees]);

  // Handle department change - reset role if it doesn't belong to new department
  const handleDepartmentChange = (dept) => {
    setSelectedDepartment(dept);
    if (dept !== "All" && selectedRole !== "All") {
      // Check if current role exists in new department
      const roleExistsInDept = employees.some(
        (emp) => emp.role === selectedRole && emp.department === dept
      );
      if (!roleExistsInDept) {
        setSelectedRole("All");
      }
    }
  };

  // Handle role change - auto-select department
  const handleRoleChange = (role) => {
    setSelectedRole(role);
    if (role !== "All") {
      const dept = roleToDepartment[role];
      if (dept && selectedDepartment === "All") {
        setSelectedDepartment(dept);
      }
    }
  };

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
          onChange={(e) => handleDepartmentChange(e.target.value)}
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
          onChange={(e) => handleRoleChange(e.target.value)}
          className="w-full rounded-xl border border-slate/20 bg-cream/50 px-3 py-2 text-sm text-ink focus:border-pastel-pink focus:ring-2 focus:ring-pastel-pink/20 focus:outline-none transition"
        >
          <option value="All">All Roles</option>
          {filteredRoles.map((role) => (
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
