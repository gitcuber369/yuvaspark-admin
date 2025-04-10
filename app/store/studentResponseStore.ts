import { create } from 'zustand';

interface StudentResponse {
  id: string;
  studentId: string;
  questionId: string;
  response: string;
  isCorrect: boolean;
  evaluationId: string;
  createdAt: string;
  student: {
    id: string;
    name: string;
  };
  question: {
    id: string;
    text: string;
  };
  evaluation?: {
    id: string;
    title: string;
  };
  StudentResponseScore?: {
    id: string;
    score: number;
    feedback: string;
    gradedAt: string;
  }[];
  audioUrl?: string;
}

interface StudentResponseFilters {
  studentId?: string;
  evaluationId?: string;
  questionId?: string;
  startDate?: string;
  endDate?: string;
}

interface StudentResponseStore {
  responses: StudentResponse[];
  loading: boolean;
  error: string | null;
  fetchResponses: (filters?: StudentResponseFilters) => Promise<void>;
  fetchByStudent: (studentId: string) => Promise<void>;
  fetchByEvaluation: (evaluationId: string) => Promise<void>;
  fetchScoredResponses: (filters?: StudentResponseFilters) => Promise<void>;
  fetchResponseById: (id: string) => Promise<StudentResponse>;
  deleteResponse: (id: string) => Promise<void>;
  exportResponses: (filters?: StudentResponseFilters) => Promise<string>;
}

export const useStudentResponseStore = create<StudentResponseStore>((set, get) => ({
  responses: [],
  loading: false,
  error: null,

  fetchResponses: async (filters = {}) => {
    set({ loading: true, error: null });
    try {
      // Default to scored responses since there's no generic endpoint
      let url = 'http://localhost:3000/api/student-responses/scored';
      
      // If filters are provided, use the appropriate endpoint
      if (filters.studentId) {
        url = `http://localhost:3000/api/student-responses/student/${filters.studentId}`;
      } else if (filters.evaluationId) {
        url = `http://localhost:3000/api/student-responses/evaluation/${filters.evaluationId}`;
      }
      
      // Add date filters as query parameters if they exist
      if (filters.startDate || filters.endDate) {
        const queryParams = new URLSearchParams();
        if (filters.startDate) queryParams.append('startDate', filters.startDate);
        if (filters.endDate) queryParams.append('endDate', filters.endDate);
        if (queryParams.toString()) {
          url = `${url}?${queryParams.toString()}`;
        }
      }
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error('Failed to fetch student responses');
      }
      
      const data = await response.json();
      set({ responses: data });
    } catch (error: any) {
      console.error('Error fetching student responses:', error);
      set({ error: error.message || 'An unknown error occurred' });
    } finally {
      set({ loading: false });
    }
  },
  
  fetchByStudent: async (studentId: string) => {
    set({ loading: true, error: null });
    try {
      const url = `http://localhost:3000/api/student-responses/student/${studentId}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error('Failed to fetch student responses');
      }
      
      const data = await response.json();
      set({ responses: data });
    } catch (error: any) {
      console.error('Error fetching student responses:', error);
      set({ error: error.message || 'An unknown error occurred' });
    } finally {
      set({ loading: false });
    }
  },
  
  fetchByEvaluation: async (evaluationId: string) => {
    set({ loading: true, error: null });
    try {
      const url = `http://localhost:3000/api/student-responses/evaluation/${evaluationId}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error('Failed to fetch student responses');
      }
      
      const data = await response.json();
      set({ responses: data });
    } catch (error: any) {
      console.error('Error fetching student responses:', error);
      set({ error: error.message || 'An unknown error occurred' });
    } finally {
      set({ loading: false });
    }
  },
  
  fetchScoredResponses: async (filters = {}) => {
    set({ loading: true, error: null });
    try {
      const queryParams = new URLSearchParams();
      
      // Apply filters if provided
      if (filters.evaluationId) {
        queryParams.append('evaluationId', filters.evaluationId);
      }
      if (filters.startDate) {
        queryParams.append('startDate', filters.startDate);
      }
      if (filters.endDate) {
        queryParams.append('endDate', filters.endDate);
      }
      
      let url = `http://localhost:3000/api/student-responses/scored`;
      if (queryParams.toString()) {
        url += `?${queryParams.toString()}`;
      }
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error('Failed to fetch scored responses');
      }
      
      const data = await response.json();
      set({ responses: data });
    } catch (error: any) {
      console.error('Error fetching scored responses:', error);
      set({ error: error.message || 'An unknown error occurred' });
    } finally {
      set({ loading: false });
    }
  },
  
  fetchResponseById: async (id: string) => {
    set({ loading: true, error: null });
    try {
      const url = `http://localhost:3000/api/student-responses/${id}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error('Failed to fetch response');
      }
      
      const data = await response.json();
      return data;
    } catch (error: any) {
      console.error('Error fetching response details:', error);
      set({ error: error.message || 'An unknown error occurred' });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  deleteResponse: async (id: string) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch(`http://localhost:3000/api/student-responses/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete student response');
      }
      
      set(state => ({
        responses: state.responses.filter(response => response.id !== id)
      }));
    } catch (error: any) {
      console.error('Error deleting student response:', error);
      set({ error: error.message || 'An unknown error occurred' });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  exportResponses: async (filters = {}) => {
    set({ loading: true, error: null });
    try {
      // Note: Assuming an export endpoint exists, otherwise we need to implement client-side export
      const queryParams = new URLSearchParams();
      if (filters.studentId) queryParams.append('studentId', filters.studentId);
      if (filters.evaluationId) queryParams.append('evaluationId', filters.evaluationId);
      if (filters.startDate) queryParams.append('startDate', filters.startDate);
      if (filters.endDate) queryParams.append('endDate', filters.endDate);
      
      const url = `http://localhost:3000/api/student-responses/export?${queryParams.toString()}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error('Failed to export student responses');
      }
      
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      
      return downloadUrl;
    } catch (error: any) {
      console.error('Error exporting student responses:', error);
      set({ error: error.message || 'An unknown error occurred' });
      throw error;
    } finally {
      set({ loading: false });
    }
  }
})); 