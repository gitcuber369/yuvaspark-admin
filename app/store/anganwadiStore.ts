import { create } from "zustand";
import {
  createAnganwadi,
  getAllAnganwadis,
  getAnganwadiById,
  updateAnganwadi,
  deleteAnganwadi,
  assignToAnganwadi,
  checkAnganwadiDependencies,
} from "@/app/api/api"; // update path as needed
import { Key } from "react";

interface Teacher {
  name: string;
  phone: string;
}

export interface Anganwadi {
  _id: Key | null | undefined;
  id: string;
  name: string;
  location: string;
  district: string;
  teacher: Teacher;
  studentIds?: string[];
}

interface AnganwadiStore {
  anganwadis: Anganwadi[];
  loading: boolean;
  error: string | null;

  fetchAnganwadis: () => Promise<void>;
  fetchAnganwadiById: (id: string) => Promise<Anganwadi | null>;
  addAnganwadi: (
    name: string,
    location: string,
    district: string,
    teacher: Teacher,
    studentIds?: string[]
  ) => Promise<void>;
  updateAnganwadi: (
    id: string,
    data: Partial<Omit<Anganwadi, "id" | "teacher">> & {
      studentIds?: string[];
    }
  ) => Promise<void>;
  removeAnganwadi: (id: string) => Promise<void>;
  checkDependencies: (id: string) => Promise<{hasDependencies: boolean; details?: string}>;
  assignStudent: (studentId: string, anganwadiId: string) => Promise<void>;
}

export const useAnganwadiStore = create<AnganwadiStore>((set, get) => ({
  anganwadis: [],
  loading: false,
  error: null,

  fetchAnganwadis: async () => {
    set({ loading: true, error: null });
    try {
      const data = await getAllAnganwadis();
      set({ anganwadis: data, loading: false });
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },

  fetchAnganwadiById: async (id) => {
    try {
      const anganwadi = await getAnganwadiById(id);
      return anganwadi;
    } catch (err: any) {
      set({ error: err.message });
      return null;
    }
  },

  addAnganwadi: async (name, location, district, teacher, studentIds) => {
    set({ loading: true, error: null });
    try {
      const newAnganwadi = await createAnganwadi(
        name,
        location,
        district,
        teacher,
        studentIds
      );
      set((state) => ({
        anganwadis: [...state.anganwadis, newAnganwadi],
        loading: false,
      }));
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },

  updateAnganwadi: async (id, data) => {
    set({ loading: true, error: null });
    try {
      const updated = await updateAnganwadi(id, data);
      set((state) => ({
        anganwadis: state.anganwadis.map((a) =>
          a.id === id ? { ...a, ...updated } : a
        ),
        loading: false,
      }));
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },

  removeAnganwadi: async (id) => {
    set({ loading: true, error: null });
    try {
      await deleteAnganwadi(id);
      set((state) => ({
        anganwadis: state.anganwadis.filter((a) => a.id !== id),
        loading: false,
      }));
    } catch (err: any) {
      set({ error: err.message, loading: false });
      throw err; // Re-throw the error to be handled by the component
    }
  },

  checkDependencies: async (id) => {
    try {
      const result = await checkAnganwadiDependencies(id);
      return result;
    } catch (err: any) {
      set({ error: err.message });
      return { hasDependencies: true, details: err.message };
    }
  },

  assignStudent: async (studentId, anganwadiId) => {
    set({ loading: true, error: null });
    try {
      const updated = await assignToAnganwadi({ studentId, anganwadiId });
      set((state) => ({
        anganwadis: state.anganwadis.map((a) =>
          a.id === anganwadiId
            ? { ...a, studentIds: [...(a.studentIds || []), studentId] }
            : a
        ),
        loading: false,
      }));
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },
}));
