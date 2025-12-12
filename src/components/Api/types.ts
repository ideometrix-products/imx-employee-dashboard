export interface loginResponse {
    token: string;
    user: {
      email: string;
      password: string;
    };
  }
  // types.ts

export interface ILeaveRequest {
  _id: string;
  employeeId: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: "Pending" | "Approved" | "Rejected";
  leaveType: "Annual leave" | "Sick leave"; 
  appliedAt: Date;
}



