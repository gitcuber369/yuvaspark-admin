import { create } from 'zustand';
import { toast } from 'sonner';

export interface StudentResponse {
  id: string;
  studentId: string;
  questionId: string;
  evaluationId: string;
  startTime: string;
  endTime: string;
  audioUrl: string;
  student?: {
    id: string;
    name: string;
  };
  question?: {
    id: string;
    text: string;
  };
  evaluation?: {
    id: string;
    topic: {
      name: string;
    };
  };
  StudentResponseScore?: {
    id: string;
    score: number;
    gradedAt: string;
  }[];
}

interface TeacherResponseFilters {
  studentId?: string;
  startDate?: string;
  endDate?: string;
}

interface TeacherResponseStore {
  responses: StudentResponse[];
  loading: boolean;
  error: string | null;
  fetchTeacherResponses: (teacherId: string, filters?: TeacherResponseFilters) => Promise<void>;
  fetchByStudent: (teacherId: string, studentId: string) => Promise<void>;
  exportResponses: (teacherId: string, filters?: TeacherResponseFilters) => Promise<string>;
}

export const useTeacherResponseStore = create<TeacherResponseStore>((set) => ({
  responses: [],
  loading: false,
  error: null,
  
  fetchTeacherResponses: async (teacherId: string, filters = {}) => {
    set({ loading: true, error: null });
    try {
      // Build query params
      const queryParams = new URLSearchParams();
      if (filters.studentId) queryParams.append('studentId', filters.studentId);
      if (filters.startDate) queryParams.append('startDate', filters.startDate);
      if (filters.endDate) queryParams.append('endDate', filters.endDate);
      
      const url = `http://localhost:3000/api/teachers/${teacherId}/student-responses?${queryParams.toString()}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error('Failed to fetch teacher responses');
      }
      
      const data = await response.json();
      set({ responses: data, loading: false });
    } catch (error: any) {
      console.error('Error fetching teacher responses:', error);
      set({ error: error.message || 'An unknown error occurred', loading: false });
      toast.error('Failed to load responses');
    }
  },
  
  fetchByStudent: async (teacherId: string, studentId: string) => {
    set({ loading: true, error: null });
    try {
      const url = `http://localhost:3000/api/teachers/${teacherId}/student-responses?studentId=${studentId}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error('Failed to fetch student responses');
      }
      
      const data = await response.json();
      set({ responses: data, loading: false });
    } catch (error: any) {
      console.error('Error fetching student responses:', error);
      set({ error: error.message || 'An unknown error occurred', loading: false });
      toast.error('Failed to load student responses');
    }
  },
  
  exportResponses: async (teacherId: string, filters = {}) => {
    set({ loading: true, error: null });
    try {
      // Build query params for export
      const queryParams = new URLSearchParams();
      if (filters.studentId) queryParams.append('studentId', filters.studentId);
      if (filters.startDate) queryParams.append('startDate', filters.startDate);
      if (filters.endDate) queryParams.append('endDate', filters.endDate);
      
      // Use the general export endpoint but with teacher-specific filters
      const url = `http://localhost:3000/api/student-responses/export?teacherId=${teacherId}&${queryParams.toString()}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error('Failed to export student responses');
      }
      
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      
      return downloadUrl;
    } catch (error: any) {
      console.error('Error exporting student responses:', error);
      set({ error: error.message || 'An unknown error occurred', loading: false });
      toast.error('Failed to export responses');
      throw error;
    } finally {
      set({ loading: false });
    }
  }
})); 