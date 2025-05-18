import { create } from 'zustand';

interface AssessmentSession {
  id: string;
  evaluationId: string;
  studentId: string;
  teacherId: string;
  startTime: string;
  endTime: string | null;
  status: string;
  score: number | null;
  student: {
    id: string;
    name: string;
  };
  teacher: {
    id: string;
    name: string;
  };
  evaluation: {
    id: string;
    title: string;
  };
}

interface AssessmentSessionFilters {
  studentId?: string;
  teacherId?: string;
  evaluationId?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
}

interface AssessmentSessionStore {
  sessions: AssessmentSession[];
  loading: boolean;
  error: string | null;
  fetchSessions: (filters?: AssessmentSessionFilters) => Promise<void>;
  getSessionDetails: (sessionId: string) => Promise<AssessmentSession>;
  exportSessions: (filters?: AssessmentSessionFilters) => Promise<string>;
}

export const useAssessmentSessionStore = create<AssessmentSessionStore>((set, get) => ({
  sessions: [],
  loading: false,
  error: null,

  fetchSessions: async (filters = {}) => {
    set({ loading: true, error: null });
    try {
      const queryParams = new URLSearchParams();
      if (filters.studentId) queryParams.append('studentId', filters.studentId);
      if (filters.teacherId) queryParams.append('teacherId', filters.teacherId);
      if (filters.status) queryParams.append('status', filters.status);
      if (filters.startDate) queryParams.append('startDate', filters.startDate);
      if (filters.endDate) queryParams.append('endDate', filters.endDate);

      const url = `https://0dd7-2401-4900-1cd7-672e-f883-6669-8e54-fbef.ngrok-free.app/api/assessment-sessions?${queryParams.toString()}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error('Failed to fetch assessment sessions');
      }
      
      const data = await response.json();
      set({ sessions: data });
    } catch (error: any) {
      console.error('Error fetching assessment sessions:', error);
      set({ error: error.message || 'An unknown error occurred' });
    } finally {
      set({ loading: false });
    }
  },

  getSessionDetails: async (sessionId: string) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch(`https://0dd7-2401-4900-1cd7-672e-f883-6669-8e54-fbef.ngrok-free.app/api/assessment-sessions/${sessionId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch session details');
      }
      
      const data = await response.json();
      return data;
    } catch (error: any) {
      console.error('Error fetching session details:', error);
      set({ error: error.message || 'An unknown error occurred' });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  exportSessions: async (filters = {}) => {
    set({ loading: true, error: null });
    try {
      const queryParams = new URLSearchParams();
      if (filters.studentId) queryParams.append('studentId', filters.studentId);
      if (filters.teacherId) queryParams.append('teacherId', filters.teacherId);
      if (filters.status) queryParams.append('status', filters.status);
      if (filters.startDate) queryParams.append('startDate', filters.startDate);
      if (filters.endDate) queryParams.append('endDate', filters.endDate);
      
      const url = `https://0dd7-2401-4900-1cd7-672e-f883-6669-8e54-fbef.ngrok-free.app/api/assessment-sessions/export?${queryParams.toString()}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error('Failed to export assessment sessions');
      }
      
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      
      return downloadUrl;
    } catch (error: any) {
      console.error('Error exporting assessment sessions:', error);
      set({ error: error.message || 'An unknown error occurred' });
      throw error;
    } finally {
      set({ loading: false });
    }
  }
})); 