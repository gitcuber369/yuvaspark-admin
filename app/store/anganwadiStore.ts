import { create } from "zustand";
import {
  getAllAnganwadis,
  createAnganwadi as apiCreateAnganwadi,
  deleteAnganwadi as apiDeleteAnganwadi,
  updateAnganwadi as apiUpdateAnganwadi,
  getAnganwadiById as apiGetAnganwadiById,
  assignToAnganwadi as apiAssignToAnganwadi,
} from "@/app/api/api";

type Anganwadi = {
  id: string;
  name: string;
  location: string;
  district: string;
  teachers?: { id: string; name: string }[];
  students?: { id: string; name: string }[];
};

type AnganwadiStore = {
  anganwadis: Anganwadi[];
  loading: boolean;
  fetchAnganwadis: () => Promise<void>;
  createAnganwadi: (
    name: string,
    location: string,
    district: string,
    teacherIds?: string[],
    studentIds?: string[]
  ) => Promise<void>;
  deleteAnganwadi: (id: string) => Promise<void>;
  updateAnganwadi: (
    id: string,
    data: Partial<Omit<Anganwadi, "id">> & {
      teacherIds?: string[];
      studentIds?: string[];
    }
  ) => Promise<void>;
  getAnganwadiById: (id: string) => Promise<Anganwadi | null>;
  assignToAnganwadi: (
    anganwadiId: string,
    teacherId?: string,
    studentId?: string
  ) => Promise<void>;
};

export const useAnganwadiStore = create<AnganwadiStore>((set) => ({
  anganwadis: [],
  loading: false,

  fetchAnganwadis: async () => {
    set({ loading: true });
    const data = await getAllAnganwadis();
    set({ anganwadis: data, loading: false });
  },

  createAnganwadi: async (name, location, district, teacherIds, studentIds) => {
    await apiCreateAnganwadi(name, location, district, teacherIds, studentIds);
    await useAnganwadiStore.getState().fetchAnganwadis();
  },

  deleteAnganwadi: async (id) => {
    await apiDeleteAnganwadi(id);
    await useAnganwadiStore.getState().fetchAnganwadis();
  },

  updateAnganwadi: async (id, data) => {
    await apiUpdateAnganwadi(id, data);
    await useAnganwadiStore.getState().fetchAnganwadis();
  },

  getAnganwadiById: async (id) => {
    try {
      const anganwadi = await apiGetAnganwadiById(id);
      return anganwadi;
    } catch (error) {
      console.error("Error fetching Anganwadi by ID", error);
      return null;
    }
  },

  assignToAnganwadi: async (anganwadiId, teacherId, studentId) => {
    await apiAssignToAnganwadi(anganwadiId, teacherId, studentId);
    await useAnganwadiStore.getState().fetchAnganwadis();
  },
}));
