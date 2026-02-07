const apiBase = (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(
  /\/$/,
  ""
);

const request = async (path, options = {}) => {
  const response = await fetch(`${apiBase}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  if (!response.ok) {
    let message = "Request failed";
    try {
      const data = await response.json();
      message = data.message || message;
    } catch (err) {
      message = response.statusText || message;
    }
    throw new Error(message);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
};

export const fetchEmployees = () => request("/api/employees");

export const createEmployee = (payload) =>
  request("/api/employees", {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const updateEmployee = (id, payload) =>
  request(`/api/employees/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });

export const deleteEmployee = (id) =>
  request(`/api/employees/${id}`, {
    method: "DELETE",
  });

export const fetchAttendanceByDate = (date) =>
  request(`/api/attendance?date=${encodeURIComponent(date)}`);

export const markAttendance = (payload) =>
  request("/api/attendance", {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const fetchSummary = (date) =>
  request(`/api/attendance/summary?date=${encodeURIComponent(date)}`);
