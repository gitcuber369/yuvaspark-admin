import { create } from "zustand";
import {
  createStudent,
  getAllStudents,
  deleteStudent,
  assignStudentToAnganwadi,
  getStudentsByAnganwadi,
  updateStudent,
} from "@/app/api/api";

interface Student {
  id: string;
  name: string;
  gender?: string;
  status?: string;
  anganwadiId?: string;
  anganwadi?: {
    id: string;
    name: string;
  };
}

interface StudentStore {
  students: Student[];
  loading: boolean;
  error: string | null;

  fetchStudents: () => Promise<void>;
  addStudent: (data: Omit<Student, "id">) => Promise<void>;
  removeStudent: (id: string) => Promise<void>;
  assignToAnganwadi: (studentId: string, anganwadiId: string) => Promise<void>;
  fetchByAnganwadi: (anganwadiId: string) => Promise<void>;
  updateStudent: (id: string, data: Partial<Omit<Student, "id">>) => Promise<void>;
}

export const useStudentStore = create<StudentStore>((set) => ({
  students: [],
  loading: false,
  error: null,

  fetchStudents: async () => {
    set({ loading: true, error: null });
    try {
      const data = await getAllStudents();
      set({ students: data, loading: false });
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },

  addStudent: async (data) => {
    set({ loading: true, error: null });
    try {
      const newStudent = await createStudent(data);
      set((state) => ({
        students: [...state.students, newStudent],
        loading: false,
      }));
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },

  removeStudent: async (id) => {
    set({ loading: true, error: null });
    try {
      await deleteStudent(id);
      set((state) => ({
        students: state.students.filter((student) => student.id !== id),
        loading: false,
      }));
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },

  assignToAnganwadi: async (studentId, anganwadiId) => {
    set({ loading: true, error: null });
    try {
      const updated = await assignStudentToAnganwadi({
        studentId,
        anganwadiId,
      });
      set((state) => ({
        students: state.students.map((s) =>
          s.id === studentId ? { ...s, anganwadiId: updated.anganwadiId } : s
        ),
        loading: false,
      }));
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },

  fetchByAnganwadi: async (anganwadiId) => {
    set({ loading: true, error: null });
    try {
      const students = await getStudentsByAnganwadi(anganwadiId);
      set({ students, loading: false });
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },

  updateStudent: async (id, data) => {
    set({ loading: true, error: null });
    try {
      const updatedStudent = await updateStudent(id, data);
      set((state) => ({
        students: state.students.map((s) =>
          s.id === id ? updatedStudent : s
        ),
        loading: false,
      }));
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },
}));
