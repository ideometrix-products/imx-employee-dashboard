import { Instance } from "./api";
import { loginResponse, ILeaveRequest } from "./types";

export async function login({

  email,
  password,
}: {
  email: string;
  password: string;
}): Promise<loginResponse> {
  try {
    const response = await Instance.post(`/employee/login`, { email, password });
    localStorage.setItem('isAuthenticated', 'true');
    localStorage.setItem('employeeId', response.data.employeeId);

    return response.data;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.log(error)
    throw new Error(
      error.response?.data?.error || error.message || 'Failed to login'
    );
  }
}

// Check-in
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function checkIn(): Promise<any> {
  const employeeId = localStorage.getItem("employeeId");
  if (!employeeId) {
    throw new Error("Employee ID not found");
  }

  const response = await Instance.post("/employee/attendance/check-in", { employeeId });
  return response.data;
}


// start break
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function StartBreak(): Promise<any> {
  const employeeId = localStorage.getItem("employeeId");
  if (!employeeId) {
    throw new Error("Employee ID not found");
  }

  const response = await Instance.post("/employee/attendance/start-break", { employeeId });
  return response.data;
}

// end break
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function endBreak(): Promise<any> {
  const employeeId = localStorage.getItem("employeeId");
  if (!employeeId) {
    throw new Error("Employee ID not found");
  }

  const response = await Instance.post("/employee/attendance/end-break", { employeeId });
  return response.data;
}


// Checkout
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function checkOut(): Promise<any> {
  const employeeId = localStorage.getItem("employeeId");
  if (!employeeId) {
    throw new Error("Employee ID not found");
  }

  const response = await Instance.post("/employee/attendance/check-out", { employeeId });
  return response.data;
}


// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function getAttendanceSummary(): Promise<any> {
  const employeeId = localStorage.getItem("employeeId");
  if (!employeeId) {
    throw new Error("Employee ID not found");
  }

  // Use Pakistan timezone to match backend
  const today = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Karachi' });
  const response = await Instance.get(
    `/employee/attendance/summary/${employeeId}/by-date?date=${today}`
  );
  return response.data.data;
}

export async function AddLeave(newLeave: FormData): Promise<ILeaveRequest> {
  try {
    const response = await Instance.post("/leaveRequest/applyLeave", newLeave, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || error.message || "Failed to add Leave Request"
    );
  }
}

export async function getLeaves(): Promise<ILeaveRequest[]> {
  const response = await Instance.get("/leaveRequest/myLeaves");
  return response.data.data;
}


// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function getSequentialAttendance(): Promise<any> {
  const employeeId = localStorage.getItem("employeeId");
  if (!employeeId) {
    throw new Error("Employee ID not found");
  }

  // Use Pakistan timezone to match backend
  const today = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Karachi' });
  const response = await Instance.get(
    `/employee/attendance/sequence/${employeeId}?date=${today}`
  );
  return response.data.data;
}

export async function fetchProfile() {
  const response = await Instance.get('/employee/me');
  return response.data;
}