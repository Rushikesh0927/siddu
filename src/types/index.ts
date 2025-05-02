export enum UserRole {
  STUDENT = "STUDENT",
  EMPLOYER = "EMPLOYER",
  ADMIN = "ADMIN"
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

export interface Profile {
  id: string;
  name: string | null;
  email: string | null;
  role: UserRole;
  created_at: string | null;
  updated_at: string | null;
  phone: string | null;
  college: string | null;
  degree: string | null;
  skills: string[] | null;
  bio: string | null;
}

export interface Job {
  id: string;
  title: string;
  description: string;
  company: string;
  location: string;
  type: string;
  skills: string[];
  createdAt: string;
  updatedAt: string;
  employerId: string;
  status: "ACTIVE" | "INACTIVE" | "HOLD";
}

export interface Application {
  id: string;
  jobId: string;
  studentId: string;
  status: "PENDING" | "APPROVED" | "REJECTED" | "HOLD";
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: string;
  job_id: string;
  employer_id: string;
  student_id: string;
  description: string;
  status: "pending" | "submitted" | "approved" | "rejected";
  file_url: string | null;
  created_at: string;
  updated_at: string;
}
