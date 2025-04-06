import { create } from "zustand";
import axios from "axios";

export interface Anganwadi {
  id: string;
  name: string;
  location: string;
  district: string;
  teachers: { id: string; name: string }[]; // adjust based on backend response
  students: { id: string; name: string }[];
}

interface AnganwadiState {
  anganwadis: Anganwadi[];
  loading: boolean;
  error: string | null;

  fetchAnganwadis: (search?: string) => Promise<void>;
  getAnganwadiById: (id: string) => Promise<Anganwadi | null>;
  createAnganwadi: (
    data: Partial<Anganwadi> & {
      teacherIds?: string[];
      studentIds?: string[];
    }
  ) => Promise<void>;
  updateAnganwadi: (
    id: string,
    data: Partial<Anganwadi> & {
      teacherIds?: string[];
      studentIds?: string[];
    }
  ) => Promise<void>;
  deleteAnganwadi: (id: string) => Promise<void>;
  assignToAnganwadi: (
    anganwadiId: string,
    teacherId?: string,
    studentId?: string
  ) => Promise<void>;
}

export const useAnganwadiStore = create<AnganwadiState>((set, get) => ({
  anganwadis: [],
  loading: false,
  error: null,

  fetchAnganwadis: async (search?: string) => {
    try {
      set({ loading: true, error: null });
      const res = await axios.get("http://localhost:3000/api/anganwadis", {
        params: search ? { search } : {},
      });
      set({ anganwadis: res.data });
    } catch (error: any) {
      set({ error: error.message });
    } finally {
      set({ loading: false });
    }
  },

  getAnganwadiById: async (id) => {
    try {
      const res = await axios.get(`http://localhost:3000/api/anganwadis/${id}`);
      return res.data;
    } catch (error) {
      console.error("Error fetching Anganwadi by ID:", error);
      return null;
    }
  },

  createAnganwadi: async (data) => {
    try {
      set({ loading: true });
      await axios.post("http://localhost:3000/api/anganwadis", data);
      await get().fetchAnganwadis();
    } catch (error: any) {
      console.error("Error creating Anganwadi:", error);
      set({ error: error.message });
    } finally {
      set({ loading: false });
    }
  },

  updateAnganwadi: async (id, data) => {
    try {
      set({ loading: true });
      await axios.put(`http://localhost:3000/api/anganwadis/${id}`, data);
      await get().fetchAnganwadis();
    } catch (error: any) {
      console.error("Error updating Anganwadi:", error);
      set({ error: error.message });
    } finally {
      set({ loading: false });
    }
  },

  deleteAnganwadi: async (id) => {
    try {
      set({ loading: true });
      await axios.delete(`http://localhost:3000/api/anganwadis/${id}`);
      await get().fetchAnganwadis();
    } catch (error: any) {
      console.error("Error deleting Anganwadi:", error);
      set({ error: error.message });
    } finally {
      set({ loading: false });
    }
  },

  assignToAnganwadi: async (anganwadiId, teacherId, studentId) => {
    try {
      await axios.post(`http://localhost:3000/api/anganwadi/assign`, {
        anganwadiId,
        teacherId,
        studentId,
      });
      await get().fetchAnganwadis();
    } catch (error: any) {
      console.error("Error assigning to Anganwadi:", error);
      set({ error: error.message });
    }
  },
}));
