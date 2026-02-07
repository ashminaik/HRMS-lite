import { useEffect, useMemo, useState } from "react";
import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";
import SummaryCards from "./components/SummaryCards";
import EmployeeList from "./components/EmployeeList";
import EmployeeModal from "./components/EmployeeModal";
import SectionHeader from "./components/SectionHeader";
import StatusBanner from "./components/StatusBanner";
import MiniCalendar from "./components/MiniCalendar";
import FilterPanel from "./components/FilterPanel";
import ConfirmModal from "./components/ConfirmModal";
import QuickAttendance from "./components/QuickAttendance";
import {
  createEmployee,
  deleteEmployee,
  fetchAttendanceByDate,
  fetchEmployees,
  fetchSummary,
  markAttendance,
  updateEmployee,
} from "./services/api";

const toISODate = (date) => date.toISOString().split("T")[0];

const App = () => {
  const [employees, setEmployees] = useState([]);
  const [attendanceMap, setAttendanceMap] = useState({});
  const [summary, setSummary] = useState({});
  const [loadingEmployees, setLoadingEmployees] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("All");
  const [selectedRole, setSelectedRole] = useState("All");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [modalOpen, setModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [savingEmployee, setSavingEmployee] = useState(false);
  const [savingAttendanceId, setSavingAttendanceId] = useState(null);
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
    confirmText: "Confirm",
    confirmColor: "bg-pastel-blue",
    icon: "warning"
  });

  // Track employees without attendance marked
  const unmarkedEmployees = useMemo(() => {
    return employees
      .filter((emp) => !attendanceMap[emp.employeeId])
      .map((emp) => emp.employeeId);
  }, [employees, attendanceMap]);

  const loadEmployees = async () => {
    try {
      setLoadingEmployees(true);
      const data = await fetchEmployees();
      setEmployees(data);
      setError("");
    } catch (err) {
      setError(err.message || "Failed to load employees.");
    } finally {
      setLoadingEmployees(false);
    }
  };

  const loadAttendance = async (dateValue) => {
    try {
      const data = await fetchAttendanceByDate(toISODate(dateValue));
      const map = {};
      data.records.forEach((record) => {
        map[record.employee.employeeId] = record.status;
      });
      setAttendanceMap(map);
    } catch (err) {
      setError(err.message || "Failed to load attendance.");
    }
  };

  const loadSummary = async (dateValue) => {
    try {
      const data = await fetchSummary(toISODate(dateValue));
      setSummary(data);
    } catch (err) {
      setError(err.message || "Failed to load summary.");
    }
  };

  useEffect(() => {
    loadEmployees();
  }, []);

  useEffect(() => {
    loadAttendance(selectedDate);
    loadSummary(selectedDate);
  }, [selectedDate]);


  const departments = useMemo(() => {
    const set = new Set(employees.map((employee) => employee.department));
    return Array.from(set).sort();
  }, [employees]);

  const roles = useMemo(() => {
    const set = new Set(employees.map((employee) => employee.role));
    return Array.from(set).sort();
  }, [employees]);

  const filteredEmployees = useMemo(() => {
    const term = search.toLowerCase();
    return employees.filter((employee) => {
      const matchesSearch =
        employee.fullName.toLowerCase().includes(term) ||
        employee.employeeId.toLowerCase().includes(term) ||
        employee.department.toLowerCase().includes(term) ||
        employee.role.toLowerCase().includes(term) ||
        employee.email.toLowerCase().includes(term);

      const matchesDepartment =
        selectedDepartment === "All" ||
        employee.department === selectedDepartment;

      const matchesRole =
        selectedRole === "All" || employee.role === selectedRole;

      return matchesSearch && matchesDepartment && matchesRole;
    });
  }, [employees, search, selectedDepartment, selectedRole]);

  const handleStatusChange = async (employee, status) => {
    // Prevent editing for future dates
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    if (selectedDate > today) {
      setError("Cannot edit attendance for future dates.");
      return;
    }
    
    try {
      setSavingAttendanceId(employee.employeeId);
      await markAttendance({
        employeeId: employee.employeeId,
        date: toISODate(selectedDate),
        status,
      });
      setAttendanceMap((prev) => ({ ...prev, [employee.employeeId]: status }));
      await loadSummary(selectedDate);
    } catch (err) {
      setError(err.message || "Failed to update attendance.");
    } finally {
      setSavingAttendanceId(null);
    }
  };

  const handleQuickAttendance = async (employee, date, status) => {
    // Prevent editing for future dates
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    const targetDate = new Date(date);
    if (targetDate > today) {
      return { error: "Cannot mark attendance for future dates." };
    }

    // Check if Sunday
    if (targetDate.getDay() === 0) {
      return { error: "Sunday is off day." };
    }
    
    try {
      await markAttendance({
        employeeId: employee.employeeId,
        date: date,
        status,
      });
      
      // Check if marking for currently selected date - update UI directly
      const currentDateStr = toISODate(selectedDate);
      if (date === currentDateStr) {
        // Update attendance map immediately for instant visual feedback
        setAttendanceMap((prev) => ({ ...prev, [employee.employeeId]: status }));
      }
      
      // Reload summary
      await loadSummary(selectedDate);
      
      return { success: true, markedDate: date };
    } catch (err) {
      return { error: err.message || "Failed to mark attendance." };
    }
  };

  const handleSaveEmployee = async (form) => {
    setSavingEmployee(true);
    try {
      if (editingEmployee) {
        await updateEmployee(editingEmployee._id, form);
      } else {
        await createEmployee(form);
      }
      setModalOpen(false);
      setEditingEmployee(null);
      await loadEmployees();
      await loadSummary(selectedDate);
    } finally {
      setSavingEmployee(false);
    }
  };

  const handleDeleteEmployee = async (employee) => {
    setConfirmModal({
      isOpen: true,
      title: "Delete Employee",
      message: `Delete ${employee.fullName}? This removes attendance records too.`,
      confirmText: "Delete",
      confirmColor: "bg-[#f44336]",
      icon: "danger",
      onConfirm: async () => {
        try {
          await deleteEmployee(employee._id);
          setEmployees((prev) => prev.filter((item) => item._id !== employee._id));
          await loadSummary(selectedDate);
        } catch (err) {
          setError(err.message || "Failed to delete employee.");
        }
      }
    });
  };

  const handleMarkAll = async (status) => {
    // Prevent editing for future dates
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    if (selectedDate > today) {
      setError("Cannot edit attendance for future dates.");
      return;
    }

    const statusColors = {
      "Present": "bg-[#9AAB63]",
      "Absent": "bg-[#f44336]",
      "On Leave": "bg-[#F5D867]"
    };

    setConfirmModal({
      isOpen: true,
      title: `Mark All ${status}`,
      message: `Mark all ${filteredEmployees.length} employees as "${status}"?`,
      confirmText: `Mark ${status}`,
      confirmColor: statusColors[status] || "bg-pastel-blue",
      icon: "warning",
      onConfirm: async () => {
        try {
          for (const employee of filteredEmployees) {
            await markAttendance({
              employeeId: employee.employeeId,
              date: toISODate(selectedDate),
              status,
            });
            setAttendanceMap((prev) => ({ ...prev, [employee.employeeId]: status }));
          }
          await loadSummary(selectedDate);
        } catch (err) {
          setError(err.message || "Failed to mark all attendance.");
        }
      }
    });
  };

  const handleClearAll = async () => {
    // Prevent editing for future dates
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    if (selectedDate > today) {
      setError("Cannot edit attendance for future dates.");
      return;
    }

    setConfirmModal({
      isOpen: true,
      title: "Clear All Attendance",
      message: `Clear attendance status for all ${filteredEmployees.length} employees?`,
      confirmText: "Clear All",
      confirmColor: "bg-pastel-blue",
      icon: "info",
      onConfirm: async () => {
        try {
          // Clear the attendance map for filtered employees
          const clearedMap = { ...attendanceMap };
          for (const employee of filteredEmployees) {
            delete clearedMap[employee.employeeId];
          }
          setAttendanceMap(clearedMap);
          await loadSummary(selectedDate);
        } catch (err) {
          setError(err.message || "Failed to clear attendance.");
        }
      }
    });
  };

  return (
    <div className="min-h-screen bg-cream text-slate">
      <Sidebar />

      <main
        className="relative min-h-screen overflow-hidden px-6 pb-12"
        style={{ marginLeft: "9.5rem" }}
      >
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -right-24 top-10 h-64 w-64 rounded-full bg-pastel-blue/50 blur-3xl" />
          <div className="absolute left-24 top-40 h-72 w-72 rounded-full bg-pastel-lavender/60 blur-3xl" />
          <div className="absolute right-1/3 bottom-12 h-64 w-64 rounded-full bg-pastel-green/50 blur-3xl" />
        </div>
        <div className="mx-auto">
          <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_280px]">
            {/* Left column: Topbar + Summary + Main content */}
            <div>
              <Topbar
                search={search}
                setSearch={setSearch}
              />

              <SummaryCards summary={summary} className="mt-3" />

              <div className="space-y-4 pt-4">
                <StatusBanner message={error} tone="error" />
                {unmarkedEmployees.length > 0 ? (
                  <p className="text-sm font-medium text-red-500 animate-pulse-red">
                    {unmarkedEmployees.length} employee(s) have not been marked for attendance today. Please mark their status.
                  </p>
                ) : employees.length > 0 ? (
                  <p className="text-sm font-medium text-pastel-green">
                    All {employees.length} employees have been marked.
                  </p>
                ) : null}

                <SectionHeader
                  title="Employee Attendance"
                  subtitle="Mark daily status and manage employee records."
                />

                {/* Mark All Buttons and Add Employee on same row */}
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="text-xs font-semibold text-slate">Mark All:</span>
                    <button
                      type="button"
                      className="rounded-full bg-pastel-green px-4 py-1.5 text-xs font-semibold text-white shadow-soft transition hover:opacity-90"
                      onClick={() => handleMarkAll("Present")}
                    >
                      Present
                    </button>
                    <button
                      type="button"
                      className="rounded-full bg-[#f44336] px-4 py-1.5 text-xs font-semibold text-white shadow-soft transition hover:opacity-90"
                      onClick={() => handleMarkAll("Absent")}
                    >
                      Absent
                    </button>
                    <button
                      type="button"
                      className="rounded-full bg-pastel-yellow px-4 py-1.5 text-xs font-semibold text-white shadow-soft transition hover:opacity-90"
                      onClick={() => handleMarkAll("On Leave")}
                    >
                      On Leave
                    </button>
                    <button
                      type="button"
                      className="rounded-full bg-pastel-blue px-4 py-1.5 text-xs font-semibold text-ink shadow-soft transition hover:opacity-90"
                      onClick={handleClearAll}
                    >
                      Clear All
                    </button>
                  </div>
                  <button
                    type="button"
                    className="rounded-full bg-pastel-lavender border-3 border-pastel-blue px-6 py-2 text-xs font-semibold text-ink shadow-soft transition hover:-translate-y-0.5"
                    onClick={() => {
                      setEditingEmployee(null);
                      setModalOpen(true);
                    }}
                  >
                    Add Employee
                  </button>
                </div>

                <EmployeeList
                  employees={filteredEmployees}
                  attendanceMap={attendanceMap}
                  onStatusChange={handleStatusChange}
                  onEdit={(employee) => {
                    setEditingEmployee(employee);
                    setModalOpen(true);
                  }}
                  onDelete={handleDeleteEmployee}
                  savingAttendanceId={savingAttendanceId}
                  loading={loadingEmployees}
                  unmarkedEmployees={unmarkedEmployees}
                  selectedDate={selectedDate}
                />
              </div>
            </div>

            {/* Right column: Quick Attendance + Calendar + Filters */}
            <aside className="space-y-4 pt-4">
              <QuickAttendance
                employees={employees}
                onMarkAttendance={handleQuickAttendance}
                selectedDate={selectedDate}
                setSelectedDate={setSelectedDate}
              />
              <div className="pt-32">
                <MiniCalendar 
                  selectedDate={selectedDate} 
                  setSelectedDate={setSelectedDate} 
                />
              </div>
              {/* Calendar date messages */}
              {selectedDate > new Date(new Date().setHours(23, 59, 59, 999)) && (
                <p className="text-xs text-red-500 font-medium px-2">
                  Cannot edit for future dates
                </p>
              )}
              {selectedDate <= new Date(new Date().setHours(23, 59, 59, 999)) && 
               Object.keys(attendanceMap).length === 0 && 
               !loadingEmployees && (
                <p className="text-xs text-red-500 font-medium px-2">
                  Data not available for {selectedDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </p>
              )}
              <FilterPanel
                departments={departments}
                roles={roles}
                selectedDepartment={selectedDepartment}
                setSelectedDepartment={setSelectedDepartment}
                selectedRole={selectedRole}
                setSelectedRole={setSelectedRole}
              />
            </aside>
          </div>
        </div>
      </main>

      <EmployeeModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSaveEmployee}
        employee={editingEmployee}
        saving={savingEmployee}
        existingDepartments={departments}
        existingRoles={roles}
        existingEmployees={employees}
      />

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmText={confirmModal.confirmText}
        confirmColor={confirmModal.confirmColor}
        icon={confirmModal.icon}
      />
    </div>
  );
};

export default App;
