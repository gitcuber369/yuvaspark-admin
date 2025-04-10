import { create } from "zustand";
import {
  getAllTeachers,
  createTeacher as apiCreateTeacher,
  deleteTeacher as apiDeleteTeacher,
  getTeachersByAnganwadi,
} from "@/app/api/api";

type Teacher = {
  id: string;
  name: string;
  phone: string;
  cohort?: { id: string; name: string };
  anganwadi?: { id: string; name: string };
};

type TeacherStore = {
  teachers: Teacher[];
  loading: boolean;
  fetchTeachers: () => Promise<void>;
  createTeacher: (
    name: string,
    phone: string,
    cohortId?: string,
    anganwadiId?: string
  ) => Promise<void>;
  deleteTeacher: (id: string) => Promise<void>;
  getByAnganwadi: (params: { id?: string; name?: string }) => Promise<void>;
};

export const useTeacherStore = create<TeacherStore>((set) => ({
  teachers: [],
  loading: false,

  fetchTeachers: async () => {
    set({ loading: true });
    const data = await getAllTeachers();
    set({ teachers: data, loading: false });
  },

  createTeacher: async (name, phone, cohortId, anganwadiId) => {
    await apiCreateTeacher(name, phone, cohortId, anganwadiId);
    await useTeacherStore.getState().fetchTeachers();
  },

  deleteTeacher: async (id) => {
    await apiDeleteTeacher(id);
    await useTeacherStore.getState().fetchTeachers();
  },

  getByAnganwadi: async (params) => {
    const data = await getTeachersByAnganwadi(params);
    set({ teachers: data.teachers });
  },
}));
