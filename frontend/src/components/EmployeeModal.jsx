import { useEffect, useState, useRef } from "react";

const emptyForm = {
  employeeId: "",
  firstName: "",
  middleName: "",
  lastName: "",
  email: "",
  department: "",
  role: "",
};

const VALID_DEPARTMENTS = ["HR", "IT", "Operations", "Marketing", "Sales"];

// Map each role to its correct department
const ROLE_TO_DEPARTMENT = {
  "Recruiter": "HR",
  "Payroll Executive": "HR",
  "IT Manager": "IT",
  "Frontend Developer": "IT",
  "Backend Developer": "IT",
  "DevOps Engineer": "IT",
  "QA Tester": "IT",
  "Operations Manager": "Operations",
  "Logistics Coordinator": "Operations",
  "Warehouse Supervisor": "Operations",
  "Marketing Head": "Marketing",
  "SEO Analyst": "Marketing",
  "Content Writer": "Marketing",
  "Graphic Designer": "Marketing",
  "Sales Manager": "Sales",
  "Sales Executive": "Sales",
};

const VALID_ROLES = Object.keys(ROLE_TO_DEPARTMENT);

// Get roles for a specific department
const getRolesForDepartment = (department) => {
  if (!department) return VALID_ROLES;
  return VALID_ROLES.filter(role => ROLE_TO_DEPARTMENT[role].toLowerCase() === department.toLowerCase());
};

// Validate Employee ID - only alphanumeric, no spaces or special characters
const validateEmployeeId = (id) => {
  if (!id) return null;
  
  if (/\s/.test(id)) {
    return "Employee ID cannot contain spaces";
  }
  
  if (!/^[a-zA-Z0-9]+$/.test(id)) {
    return "Employee ID can only contain letters and numbers (no special characters)";
  }
  
  return null;
};

// Common valid TLDs
const VALID_TLDS = ['com', 'org', 'net', 'edu', 'gov', 'io', 'co', 'in', 'uk', 'us', 'ca', 'au', 'de', 'fr', 'jp', 'cn', 'info', 'biz', 'xyz', 'online', 'site', 'tech', 'app', 'dev'];

const validateEmail = (email) => {
  if (!email) return null;
  
  // Max total length check
  if (email.length > 254) {
    return "Email too long (max 254 characters)";
  }
  
  // Check for @ symbol
  if (!email.includes("@")) {
    if (email.length > 3) {
      return "Email must contain @";
    }
    return null; // Still typing
  }
  
  // Check for multiple @ symbols
  if ((email.match(/@/g) || []).length > 1) {
    return "Email cannot contain multiple @ symbols";
  }
  
  const [localPart, domain] = email.split("@");
  
  // Local part validation
  if (!localPart || localPart.length < 3) {
    return "Email must have at least 3 characters before @";
  }
  
  if (localPart.length > 64) {
    return "Email local part too long (max 64 characters)";
  }
  
  // Must start with a letter
  if (!/^[a-zA-Z]/.test(localPart)) {
    return "Email must start with a letter";
  }
  
  // Cannot end with special characters
  if (/[._-]$/.test(localPart)) {
    return "Email cannot end with a dot, underscore, or hyphen";
  }
  
  // Cannot have consecutive special characters
  if (/[._-]{2,}/.test(localPart)) {
    return "Email cannot have consecutive dots, underscores, or hyphens";
  }
  
  // Only allow valid characters
  if (!/^[a-zA-Z][a-zA-Z0-9._-]*$/.test(localPart)) {
    return "Email contains invalid characters (use letters, numbers, dots, underscores, hyphens)";
  }
  
  // Domain validation
  if (!domain || domain.length < 1) {
    return "Email must have a domain after @";
  }
  
  // Domain should not start or end with dot or hyphen
  if (/^[.-]/.test(domain) || /[.-]$/.test(domain)) {
    return "Domain cannot start or end with dot or hyphen";
  }
  
  // Check for consecutive dots
  if (/\.{2,}/.test(domain)) {
    return "Domain cannot have consecutive dots";
  }
  
  // Domain must contain a dot
  if (!domain.includes(".")) {
    if (domain.length >= 4) {
      return "Domain must contain a dot (e.g., gmail.com)";
    }
    return null; // Still typing
  }
  
  const domainParts = domain.split(".");
  const tld = domainParts[domainParts.length - 1].toLowerCase();
  const domainName = domainParts.slice(0, -1).join(".");
  
  // Domain name validation
  if (!domainName || domainName.length < 2) {
    return "Domain name must be at least 2 characters";
  }
  
  if (domainName.length > 63) {
    return "Domain name too long";
  }
  
  if (!/^[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?$/.test(domainName.replace(/\./g, ''))) {
    return "Domain name contains invalid characters";
  }
  
  // TLD validation
  if (!tld || tld.length < 2) {
    return "Domain extension must be at least 2 letters";
  }
  
  if (tld.length > 6) {
    return "Domain extension too long";
  }
  
  if (!/^[a-zA-Z]+$/.test(tld)) {
    return "Domain extension must only contain letters";
  }
  
  // Check if TLD is valid (warn but don't block)
  if (!VALID_TLDS.includes(tld)) {
    return `Unusual domain extension '.${tld}' - please verify`;
  }
  
  return null;
};

const EmployeeModal = ({ isOpen, onClose, onSave, employee, saving, existingDepartments = [], existingRoles = [], existingEmployees = [] }) => {
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [showDeptDropdown, setShowDeptDropdown] = useState(false);
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  
  const deptRef = useRef(null);
  const roleRef = useRef(null);

  const allDepts = [...new Set([...VALID_DEPARTMENTS, ...existingDepartments])].sort();
  const allRoles = [...new Set([...VALID_ROLES, ...existingRoles])].sort();

  // Check if employee ID already exists
  const checkDuplicateId = (id) => {
    if (!id || (employee && employee.employeeId === id)) return null;
    const exists = existingEmployees.some(emp => emp.employeeId === id);
    return exists ? "Employee ID already exists" : null;
  };

  // Check if person already exists (all fields except ID match)
  const checkDuplicatePerson = (formData) => {
    const fullName = [formData.firstName, formData.middleName, formData.lastName].filter(Boolean).join(" ");
    if (!fullName || !formData.email || !formData.department || !formData.role) return null;
    
    const exists = existingEmployees.find(emp => {
      // Skip comparing with current employee during edit
      if (employee && emp._id === employee._id) return false;
      return (
        emp.fullName.toLowerCase() === fullName.toLowerCase() &&
        emp.email.toLowerCase() === formData.email.toLowerCase() &&
        emp.department.toLowerCase() === formData.department.toLowerCase() &&
        emp.role.toLowerCase() === formData.role.toLowerCase()
      );
    });
    
    return exists ? `${exists.fullName} already exists with these details` : null;
  };

  useEffect(() => {
    if (employee) {
      // Parse existing fullName into parts
      const nameParts = (employee.fullName || "").split(" ");
      let firstName = "", middleName = "", lastName = "";
      if (nameParts.length === 1) {
        firstName = nameParts[0];
      } else if (nameParts.length === 2) {
        firstName = nameParts[0];
        lastName = nameParts[1];
      } else if (nameParts.length >= 3) {
        firstName = nameParts[0];
        lastName = nameParts[nameParts.length - 1];
        middleName = nameParts.slice(1, -1).join(" ");
      }
      setForm({
        employeeId: employee.employeeId || "",
        firstName,
        middleName,
        lastName,
        email: employee.email || "",
        department: employee.department || "",
        role: employee.role || "",
      });
    } else {
      setForm(emptyForm);
    }
    setError("");
    setFieldErrors({});
  }, [employee, isOpen]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (deptRef.current && !deptRef.current.contains(e.target)) {
        setShowDeptDropdown(false);
      }
      if (roleRef.current && !roleRef.current.contains(e.target)) {
        setShowRoleDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Validate department-role combination
  const validateDeptRoleMatch = (dept, role) => {
    if (!dept || !role) return null;
    
    // Find the role in our mapping (case-insensitive)
    const matchedRole = VALID_ROLES.find(r => r.toLowerCase() === role.toLowerCase());
    if (!matchedRole) return null; // Role not in system, will be caught by other validation
    
    const correctDept = ROLE_TO_DEPARTMENT[matchedRole];
    if (correctDept.toLowerCase() !== dept.toLowerCase()) {
      return `Wrong department - ${matchedRole} belongs to ${correctDept} department`;
    }
    return null;
  };

  const handleChange = (field) => (event) => {
    const value = event.target.value;
    const newForm = { ...form, [field]: value };
    setForm(newForm);
    
    // Clear the top error message when user starts typing
    setError("");
    
    if (field === "employeeId") {
      const idFormatError = validateEmployeeId(value);
      const idError = idFormatError || checkDuplicateId(value);
      // Clear error if value is valid, otherwise show new error
      setFieldErrors((prev) => ({ ...prev, employeeId: value ? idError : null }));
    }
    
    if (field === "firstName") {
      // Clear firstName error when user types
      setFieldErrors((prev) => ({ ...prev, firstName: null }));
      // Check for duplicate person
      const personError = checkDuplicatePerson(newForm);
      setFieldErrors((prev) => ({ ...prev, fullName: personError }));
    }
    
    if (field === "middleName") {
      // Check for duplicate person
      const personError = checkDuplicatePerson(newForm);
      setFieldErrors((prev) => ({ ...prev, fullName: personError }));
    }
    
    if (field === "lastName") {
      // Clear lastName error when user types
      setFieldErrors((prev) => ({ ...prev, lastName: null }));
      // Check for duplicate person
      const personError = checkDuplicatePerson(newForm);
      setFieldErrors((prev) => ({ ...prev, fullName: personError }));
    }
    
    if (field === "email") {
      const emailError = validateEmail(value);
      // Also check for duplicate person when email changes
      const personError = checkDuplicatePerson(newForm);
      // Clear error if value is empty (just started typing), otherwise validate
      setFieldErrors((prev) => ({ ...prev, email: value ? emailError : null, fullName: personError }));
    }
    
    if (field === "department") {
      setShowDeptDropdown(true);
      let deptError = null;
      if (value && value.length >= 2) {
        const match = allDepts.some(d => d.toLowerCase() === value.toLowerCase());
        if (!match) {
          deptError = "Select a valid department from the list";
        }
      }
      
      // Check if current role matches new department
      const roleError = validateDeptRoleMatch(value, newForm.role);
      // Also check for duplicate person
      const personError = checkDuplicatePerson(newForm);
      setFieldErrors((prev) => ({ ...prev, department: deptError, role: roleError, fullName: personError }));
    }
    
    if (field === "role") {
      setShowRoleDropdown(true);
      let roleError = null;
      if (value && value.length >= 2) {
        const match = allRoles.some(r => r.toLowerCase() === value.toLowerCase());
        if (!match) {
          roleError = "Select a valid role from the list";
        } else {
          // Check if role matches current department
          roleError = validateDeptRoleMatch(newForm.department, value);
        }
      }
      // Also check for duplicate person
      const personError = checkDuplicatePerson(newForm);
      // Clear error when user starts typing, only show validation errors for valid-length input
      setFieldErrors((prev) => ({ ...prev, role: roleError, fullName: personError }));
    }
  };

  const selectDepartment = (dept) => {
    const newForm = { ...form, department: dept };
    setForm(newForm);
    setShowDeptDropdown(false);
    
    // Clear the top error message
    setError("");
    
    // Check if current role matches new department
    const roleError = validateDeptRoleMatch(dept, form.role);
    // Also check for duplicate person
    const personError = checkDuplicatePerson(newForm);
    setFieldErrors((prev) => ({ ...prev, department: null, role: roleError, fullName: personError }));
  };

  const selectRole = (role) => {
    const newForm = { ...form, role: role };
    setForm(newForm);
    setShowRoleDropdown(false);
    
    // Clear the top error message
    setError("");
    
    // Check if selected role matches current department
    const roleError = validateDeptRoleMatch(form.department, role);
    // Also check for duplicate person
    const personError = checkDuplicatePerson(newForm);
    setFieldErrors((prev) => ({ ...prev, role: roleError, fullName: personError }));
  };

  const getFilteredOptions = (options, searchValue) => {
    if (!searchValue) return options;
    const lower = searchValue.toLowerCase();
    const matches = options.filter(opt => opt.toLowerCase().includes(lower));
    const nonMatches = options.filter(opt => !opt.toLowerCase().includes(lower));
    return [...matches, ...nonMatches];
  };

  // Get roles filtered by department if one is selected
  const getAvailableRoles = () => {
    if (form.department && allDepts.some(d => d.toLowerCase() === form.department.toLowerCase())) {
      return getRolesForDepartment(form.department);
    }
    return allRoles;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    const genericError = "Enter the correct field details";

    // Validate required fields
    if (!form.employeeId) {
      setFieldErrors((prev) => ({ ...prev, employeeId: "Employee ID is required" }));
      setError(genericError);
      return;
    }
    
    if (!form.firstName) {
      setFieldErrors((prev) => ({ ...prev, firstName: "First name is required" }));
      setError(genericError);
      return;
    }
    
    if (!form.lastName) {
      setFieldErrors((prev) => ({ ...prev, lastName: "Last name is required" }));
      setError(genericError);
      return;
    }
    
    if (!form.email) {
      setFieldErrors((prev) => ({ ...prev, email: "Email is required" }));
      setError(genericError);
      return;
    }
    
    if (!form.department) {
      setFieldErrors((prev) => ({ ...prev, department: "Department is required" }));
      setError(genericError);
      return;
    }
    
    if (!form.role) {
      setFieldErrors((prev) => ({ ...prev, role: "Role is required" }));
      setError(genericError);
      return;
    }

    // Validate Employee ID format
    const idFormatError = validateEmployeeId(form.employeeId);
    if (idFormatError) {
      setFieldErrors((prev) => ({ ...prev, employeeId: idFormatError }));
      setError(genericError);
      return;
    }

    // Check for duplicate Employee ID
    const idError = checkDuplicateId(form.employeeId);
    if (idError) {
      setFieldErrors((prev) => ({ ...prev, employeeId: idError }));
      setError(genericError);
      return;
    }

    // Create fullName from parts
    const fullName = [form.firstName, form.middleName, form.lastName].filter(Boolean).join(" ");

    // Check for duplicate person
    const personError = checkDuplicatePerson(form);
    if (personError) {
      setFieldErrors((prev) => ({ ...prev, fullName: personError }));
      setError(genericError);
      return;
    }

    // Final email validation
    if (!form.email.includes("@") || !form.email.includes(".")) {
      setFieldErrors((prev) => ({ ...prev, email: "Please enter a valid email address (e.g., name@example.com)" }));
      setError(genericError);
      return;
    }

    const emailError = validateEmail(form.email);
    if (emailError) {
      setFieldErrors((prev) => ({ ...prev, email: emailError }));
      setError(genericError);
      return;
    }

    // Final department/role validation
    if (!allDepts.some(d => d.toLowerCase() === form.department.toLowerCase())) {
      setFieldErrors((prev) => ({ ...prev, department: "Please select a valid department from the dropdown" }));
      setError(genericError);
      return;
    }

    if (!allRoles.some(r => r.toLowerCase() === form.role.toLowerCase())) {
      setFieldErrors((prev) => ({ ...prev, role: "Please select a valid role from the dropdown" }));
      setError(genericError);
      return;
    }

    // Validate department-role combination
    const deptRoleError = validateDeptRoleMatch(form.department, form.role);
    if (deptRoleError) {
      setFieldErrors((prev) => ({ ...prev, role: deptRoleError }));
      setError(genericError);
      return;
    }

    try {
      // Convert email to lowercase and combine name parts before saving
      await onSave({
        employeeId: form.employeeId,
        fullName,
        email: form.email.toLowerCase(),
        department: form.department,
        role: form.role,
      });
    } catch (err) {
      setError(err.message || "Unable to save employee.");
    }
  };

  if (!isOpen) {
    return null;
  }

  const filteredDepts = getFilteredOptions(allDepts, form.department);
  const availableRoles = getAvailableRoles();
  const filteredRoles = getFilteredOptions(availableRoles, form.role);

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/30 px-4">
      <div className="w-full max-w-xl rounded-2xl bg-cream border-4 border-pastel-blue p-8 shadow-soft relative">
        <button
          type="button"
          className="absolute top-4 right-4 p-1 rounded-full hover:bg-gray-200 transition"
          onClick={onClose}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 text-ink"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <div className="mb-6">
          <div>
            <h3 className="text-xl font-semibold text-ink">
              {employee ? "Edit Employee" : "Add Employee"}
            </h3>
            <p className="text-sm text-slate">
              Keep employee records accurate and up to date.
            </p>
          </div>
        </div>

        {error ? (
          <div className="mb-4 px-4 py-2 text-sm text-red-600 font-bold">
            {error}
          </div>
        ) : null}

        <form className="grid gap-5" onSubmit={handleSubmit}>
          <div className="grid gap-5 md:grid-cols-2">
            {/* Employee ID field */}
            <div className="relative">
              <input
                className={`rounded-card bg-cream px-4 py-3 text-sm text-black placeholder:text-gray-500 outline-none w-full ${
                  fieldErrors.employeeId ? "ring-2 ring-red-300" : ""
                }`}
                placeholder="Employee ID *"
                value={form.employeeId}
                onChange={handleChange("employeeId")}
              />
              {fieldErrors.employeeId && (
                <div className="absolute left-0 right-0 top-full mt-1 z-20">
                  <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-xs text-red-600 shadow-lg">
                    {fieldErrors.employeeId}
                  </div>
                </div>
              )}
            </div>
            
            {/* First Name field */}
            <div className="relative">
              <input
                className={`rounded-card bg-cream px-4 py-3 text-sm text-black placeholder:text-gray-500 outline-none w-full ${
                  fieldErrors.firstName ? "ring-2 ring-red-300" : ""
                }`}
                placeholder="First name *"
                value={form.firstName}
                onChange={handleChange("firstName")}
              />
              {fieldErrors.firstName && (
                <div className="absolute left-0 right-0 top-full mt-1 z-20">
                  <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-xs text-red-600 shadow-lg">
                    {fieldErrors.firstName}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            {/* Middle Name field (optional) */}
            <div className="relative">
              <input
                className="rounded-card bg-cream px-4 py-3 text-sm text-black placeholder:text-gray-500 outline-none w-full"
                placeholder="Middle name"
                value={form.middleName}
                onChange={handleChange("middleName")}
              />
            </div>
            
            {/* Last Name field */}
            <div className="relative">
              <input
                className={`rounded-card bg-cream px-4 py-3 text-sm text-black placeholder:text-gray-500 outline-none w-full ${
                  fieldErrors.lastName || fieldErrors.fullName ? "ring-2 ring-red-300" : ""
                }`}
                placeholder="Last name *"
                value={form.lastName}
                onChange={handleChange("lastName")}
              />
              {(fieldErrors.lastName || fieldErrors.fullName) && (
                <div className="absolute left-0 right-0 top-full mt-1 z-20">
                  <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-xs text-red-600 shadow-lg">
                    {fieldErrors.lastName || fieldErrors.fullName}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            {/* Email field */}
            <div className="relative">
              <input
                className={`rounded-card bg-cream px-4 py-3 text-sm text-black placeholder:text-gray-500 outline-none w-full ${
                  fieldErrors.email ? "ring-2 ring-red-300" : ""
                }`}
                placeholder="Email address *"
                type="email"
                value={form.email}
                onChange={handleChange("email")}
              />
              {fieldErrors.email && (
                <div className="absolute left-0 right-0 top-full mt-1 z-20">
                  <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-xs text-red-600 shadow-lg">
                    {fieldErrors.email}
                  </div>
                </div>
              )}
            </div>

            {/* Department field with dropdown */}
            <div className="relative" ref={deptRef}>
              <input
                className={`rounded-card bg-cream px-4 py-3 text-sm text-black placeholder:text-gray-500 outline-none w-full ${
                  fieldErrors.department ? "ring-2 ring-red-300" : ""
                }`}
                placeholder="Department *"
                value={form.department}
                onChange={handleChange("department")}
                onFocus={() => setShowDeptDropdown(true)}
              />
              {showDeptDropdown && (
                <div className="absolute left-0 right-0 top-full mt-1 z-20 max-h-40 overflow-y-auto bg-white border border-gray-200 rounded-lg shadow-lg">
                  {fieldErrors.department && (
                    <div className="px-3 py-2 text-xs text-red-600 bg-red-50 border-b border-red-100">
                      {fieldErrors.department}
                    </div>
                  )}
                  {filteredDepts.map((dept) => {
                    const isMatch = form.department && dept.toLowerCase().includes(form.department.toLowerCase());
                    return (
                      <button
                        key={dept}
                        type="button"
                        className={`w-full text-left px-3 py-2 text-sm hover:bg-pastel-blue/30 transition ${
                          isMatch ? "bg-pastel-green/20 font-medium" : ""
                        }`}
                        onClick={() => selectDepartment(dept)}
                      >
                        {dept}
                      </button>
                    );
                  })}
                </div>
              )}
              {!showDeptDropdown && fieldErrors.department && (
                <div className="absolute left-0 right-0 top-full mt-1 z-20">
                  <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-xs text-red-600 shadow-lg">
                    {fieldErrors.department}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Role field with dropdown */}
          <div className="relative" ref={roleRef}>
            <input
              className={`rounded-card bg-cream px-4 py-3 text-sm text-black placeholder:text-gray-500 outline-none w-full ${
                fieldErrors.role ? "ring-2 ring-red-300" : ""
              }`}
              placeholder={form.department ? `Role (for ${form.department}) *` : "Role *"}
              value={form.role}
              onChange={handleChange("role")}
              onFocus={() => setShowRoleDropdown(true)}
            />
            {showRoleDropdown && (
              <div className="absolute left-0 right-0 top-full mt-1 z-20 max-h-48 overflow-y-auto bg-white border border-gray-200 rounded-lg shadow-lg">
                {fieldErrors.role && (
                  <div className="px-3 py-2 text-xs text-red-600 bg-red-50 border-b border-red-100">
                    {fieldErrors.role}
                  </div>
                )}
                {form.department && availableRoles.length < allRoles.length && (
                  <div className="px-3 py-1.5 text-[10px] text-slate bg-gray-50 border-b">
                    Showing roles for {form.department} department
                  </div>
                )}
                {filteredRoles.map((role) => {
                  const isMatch = form.role && role.toLowerCase().includes(form.role.toLowerCase());
                  const roleDept = ROLE_TO_DEPARTMENT[role];
                  return (
                    <button
                      key={role}
                      type="button"
                      className={`w-full text-left px-3 py-2 text-sm hover:bg-pastel-blue/30 transition flex justify-between items-center ${
                        isMatch ? "bg-pastel-green/20 font-medium" : ""
                      }`}
                      onClick={() => selectRole(role)}
                    >
                      <span>{role}</span>
                      {!form.department && (
                        <span className="text-[10px] text-slate bg-gray-100 px-1.5 py-0.5 rounded">
                          {roleDept}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
            {!showRoleDropdown && fieldErrors.role && (
              <div className="absolute left-0 right-0 top-full mt-1 z-20">
                <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-xs text-red-600 shadow-lg">
                  {fieldErrors.role}
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              className="rounded-full bg-cream px-5 py-2 text-xs font-semibold text-ink"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-full bg-pastel-blue px-6 py-2 text-xs font-semibold text-ink transition hover:shadow-soft"
              disabled={saving}
            >
              {saving ? "Saving..." : "Save Employee"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EmployeeModal;
