import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import EmployeeAttendanceChart from "../components/EmployeeAttendanceChart";
import { fetchEmployees } from "../services/api";

const Reports = () => {
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [showChart, setShowChart] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadEmployees = async () => {
      try {
        const data = await fetchEmployees();
        setEmployees(data);
        
        // Extract unique departments
        const depts = [...new Set(data.map((e) => e.department))].sort();
        setDepartments(depts);
      } catch (err) {
        console.error("Failed to load employees:", err);
      }
      setLoading(false);
    };
    loadEmployees();
  }, []);

  // Get roles filtered by selected department
  const availableRoles = selectedDepartment
    ? [...new Set(employees.filter(e => e.department === selectedDepartment).map(e => e.role))].sort()
    : [...new Set(employees.map(e => e.role))].sort();

  // Filter employees based on selected department and role
  const filteredEmployees = employees.filter((emp) => {
    if (selectedDepartment && emp.department !== selectedDepartment) return false;
    if (selectedRole && emp.role !== selectedRole) return false;
    return true;
  });

  // Handle department change
  const handleDepartmentChange = (dept) => {
    setSelectedDepartment(dept);
    // Reset role if it's not available in the new department
    if (dept) {
      const rolesInDept = employees.filter(e => e.department === dept).map(e => e.role);
      if (selectedRole && !rolesInDept.includes(selectedRole)) {
        setSelectedRole("");
      }
    }
    setSelectedEmployee("");
    setShowChart(false);
  };

  // Handle role change - auto-select department if only one matches
  const handleRoleChange = (role) => {
    setSelectedRole(role);
    if (role && !selectedDepartment) {
      const deptsWithRole = [...new Set(employees.filter(e => e.role === role).map(e => e.department))];
      if (deptsWithRole.length === 1) {
        setSelectedDepartment(deptsWithRole[0]);
      }
    }
    setSelectedEmployee("");
    setShowChart(false);
  };

  // Handle employee change - auto-fill department and role
  const handleEmployeeChange = (empId) => {
    setSelectedEmployee(empId);
    if (empId) {
      const emp = employees.find(e => e.employeeId === empId);
      if (emp) {
        setSelectedDepartment(emp.department);
        setSelectedRole(emp.role);
      }
    }
    setShowChart(false);
  };

  const handleSubmit = () => {
    if (selectedEmployee) {
      setShowChart(true);
    }
  };

  const handleReset = () => {
    setSelectedDepartment("");
    setSelectedRole("");
    setSelectedEmployee("");
    setShowChart(false);
  };

  return (
    <div className="min-h-screen bg-cream p-4 pl-44">
      <Sidebar />

      <div className="max-w-5xl">
        <Topbar showSearch={false} />

        <div className="mt-6">
          <h2 className="text-2xl font-bold text-ink mb-2">Individual Employee Attendance</h2>
          <p className="text-slate mb-6">Select an employee to view their attendance percentage.</p>

          {/* Filter Bar */}
          <div className="rounded-2xl bg-white p-6 shadow-soft mb-6">
            <div className="grid gap-4 md:grid-cols-4">
              {/* Department Dropdown */}
              <div>
                <label className="block text-sm font-medium text-ink mb-2">Department</label>
                <select
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pastel-blue"
                  value={selectedDepartment}
                  onChange={(e) => handleDepartmentChange(e.target.value)}
                >
                  <option value="">All Departments</option>
                  {departments.map((dept) => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>

              {/* Role Dropdown */}
              <div>
                <label className="block text-sm font-medium text-ink mb-2">Role</label>
                <select
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pastel-blue"
                  value={selectedRole}
                  onChange={(e) => handleRoleChange(e.target.value)}
                >
                  <option value="">All Roles</option>
                  {availableRoles.map((role) => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </select>
              </div>

              {/* Employee ID/Name Dropdown */}
              <div>
                <label className="block text-sm font-medium text-ink mb-2">Employee ID / Name</label>
                <select
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pastel-blue"
                  value={selectedEmployee}
                  onChange={(e) => handleEmployeeChange(e.target.value)}
                >
                  <option value="">Select Employee</option>
                  {filteredEmployees.map((emp) => (
                    <option key={emp.employeeId} value={emp.employeeId}>
                      {emp.employeeId} - {emp.fullName}
                    </option>
                  ))}
                </select>
              </div>

              {/* Submit Button */}
              <div className="flex items-end gap-2">
                <button
                  onClick={handleSubmit}
                  disabled={!selectedEmployee}
                  className="flex-1 rounded-full bg-ink text-white px-6 py-2 text-sm font-semibold shadow-soft transition hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Generate
                </button>
                <button
                  onClick={handleReset}
                  className="rounded-full border border-ink text-ink px-4 py-2 text-sm font-semibold transition hover:bg-gray-100"
                >
                  Reset
                </button>
              </div>
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="rounded-2xl bg-white p-12 shadow-soft text-center">
              <p className="text-slate">Loading employees...</p>
            </div>
          )}

          {/* Chart Section */}
          {!loading && showChart && selectedEmployee && (
            <div className="rounded-2xl bg-white p-6 shadow-soft">
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-ink">
                  Attendance for: {employees.find(e => e.employeeId === selectedEmployee)?.fullName || selectedEmployee}
                </h3>
                <p className="text-sm text-slate">
                  {employees.find(e => e.employeeId === selectedEmployee)?.department} • {employees.find(e => e.employeeId === selectedEmployee)?.role}
                </p>
              </div>
              <EmployeeAttendanceChart employeeId={selectedEmployee} />
            </div>
          )}

          {/* Placeholder when no chart */}
          {!loading && !showChart && (
            <div className="rounded-2xl bg-white p-12 shadow-soft text-center">
              <div className="text-6xl mb-4">📊</div>
              <h3 className="text-lg font-semibold text-ink mb-2">No Employee Selected</h3>
              <p className="text-slate">Select an employee from the filters above and click Generate to view their attendance chart.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Reports;
