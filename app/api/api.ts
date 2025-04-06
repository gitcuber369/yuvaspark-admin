import API from "@/utils/axiosInstance";
import { useAuthStore } from "../store/authStore";

export const registerUser = async (
  name: string,
  email: string,
  password: string,
  role: string
) => {
  const res = await API.post("auth/register", { name, email, password, role });
  return res.data;
};

export const loginUser = async (email: string, password: string) => {
  const res = await API.post("auth/login", { email, password });
  useAuthStore.getState().login(res.data.token, res.data.role); // Update Zustand store
  return res.data;
};

export const logoutUser = () => {
  useAuthStore.getState().logout(); // Logout using Zustand
  window.location.href = "/auth/login"; // Redirect to login page
};

export const createTeacher = async (
  name: string,
  phone: string,
  cohortId?: string,
  anganwadiId?: string
) => {
  const res = await API.post("/teachers", {
    name,
    phone,
    cohortId,
    anganwadiId,
  });
  return res.data;
};

// ✅ Get All Teachers (with cohort & anganwadi info)
export const getAllTeachers = async () => {
  const res = await API.get("/teachers");
  return res.data;
};

// ✅ Delete a Teacher by ID
export const deleteTeacher = async (id: string) => {
  const res = await API.delete(`/teachers/${id}`);
  return res.data;
};

// ✅ Assign Teacher to a Cohort
export const assignTeacherToCohort = async (
  teacherId: string,
  cohortId: string
) => {
  const res = await API.post("/teachers/assign-cohort", {
    teacherId,
    cohortId,
  });
  return res.data;
};

// ✅ Assign Teacher to an Anganwadi
export const assignTeacherToAnganwadi = async (
  teacherId: string,
  anganwadiId: string
) => {
  const res = await API.post("/teachers/assign-anganwadi", {
    teacherId,
    anganwadiId,
  });
  return res.data;
};

// ✅ Get Teachers by Anganwadi (by ID or name)
export const getTeachersByAnganwadi = async ({
  id,
  name,
}: {
  id?: string;
  name?: string;
}) => {
  const queryParams = new URLSearchParams();
  if (id) queryParams.append("id", id);
  if (name) queryParams.append("name", name);

  const res = await API.get(`/teachers/by-anganwadi?${queryParams.toString()}`);
  return res.data;
};

export const createAnganwadi = async (
  name: string,
  location: string,
  district: string,
  teacherIds?: string[],
  studentIds?: string[]
) => {
  const res = await API.post("/anganwadis", {
    name,
    location,
    district,
    teacherIds,
    studentIds,
  });
  return res.data;
};

// ✅ Get all Anganwadis
export const getAllAnganwadis = async () => {
  const res = await API.get("/anganwadis");
  return res.data;
};

// ✅ Get single Anganwadi by ID
export const getAnganwadiById = async (id: string) => {
  const res = await API.get(`/anganwadis/${id}`);
  return res.data;
};

// ✅ Update Anganwadi
export const updateAnganwadi = async (
  id: string,
  data: {
    name?: string;
    location?: string;
    district?: string;
    teacherIds?: string[];
    studentIds?: string[];
  }
) => {
  const res = await API.put(`/anganwadis/${id}`, data);
  return res.data;
};

// ✅ Delete Anganwadi
export const deleteAnganwadi = async (id: string) => {
  const res = await API.delete(`/anganwadis/${id}`);
  return res.data;
};

// ✅ Assign Teacher or Student to Anganwadi
export const assignToAnganwadi = async ({
  anganwadiId,
  teacherId,
  studentId,
}: {
  anganwadiId: string;
  teacherId?: string;
  studentId?: string;
}) => {
  const res = await API.post("/anganwadis/assign", {
    anganwadiId,
    teacherId,
    studentId,
  });
  return res.data;
};


// ✅ Create Cohort

export const createStudent = async ({
  name,
  age,
  cohortId,
  gender,
  status,
  anganwadiId,
}: {
  name: string;
  age: number;
  cohortId: string;
  gender?: string;
  status?: string;
  anganwadiId?: string;
}) => {
  const res = await API.post("/students", {
    name,
    age,
    cohortId,
    gender,
    status,
    anganwadiId,
  });
  return res.data;
};

// ✅ Get All Students
export const getAllStudents = async () => {
  const res = await API.get("/students");
  return res.data;
};

// ✅ Delete a Student by ID
export const deleteStudent = async (id: string) => {
  const res = await API.delete(`/students/${id}`);
  return res.data;
};

// ✅ Assign Student to Anganwadi (PATCH)
export const assignStudentToAnganwadi = async ({
  studentId,
  anganwadiId,
}: {
  studentId: string;
  anganwadiId: string;
}) => {
  const res = await API.patch("/students/assign-anganwadi", {
    studentId,
    anganwadiId,
  });
  return res.data;
};

// ✅ Get Students by Anganwadi ID (GET)
export const getStudentsByAnganwadi = async (anganwadiId: string) => {
  const res = await API.get(`/students/anganwadi/${anganwadiId}`);
  return res.data;
};


