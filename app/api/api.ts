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
  useAuthStore.getState().login(res.data.token); // Update Zustand store
  return res.data;
};

export const logoutUser = () => {
  useAuthStore.getState().logout(); // Logout using Zustand
  window.location.href = "/auth/login"; // Redirect to login page
};

// ✅ Create a Teacher (Only one teacher per Anganwadi allowed)
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

// ✅ Get Single Teacher by ID
export const getTeacherById = async (id: string) => {
  const res = await API.get(`/teachers/${id}`);
  return res.data;
};

// ✅ Delete a Teacher by ID
export const deleteTeacher = async (id: string) => {
  const res = await API.delete(`/teachers/${id}`);
  return res.data;
};

// ✅ Search Teachers by name or phone
export const searchTeachers = async (search: string) => {
  const res = await API.get(`/teachers/search?search=${search}`);
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
  teacher: {
    name: string;
    phone: string;
  },
  studentIds?: string[]
) => {
  const res = await API.post("/anganwadis", {
    name,
    location,
    district,
    teacher,
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

// ✅ Update Anganwadi (name, location, district, studentIds)
export const updateAnganwadi = async (
  id: string,
  data: {
    name?: string;
    location?: string;
    district?: string;
    studentIds?: string[];
  }
) => {
  const res = await API.patch(`/anganwadis/${id}`, data);
  return res.data;
};

// ✅ Delete Anganwadi
export const deleteAnganwadi = async (id: string) => {
  const res = await API.delete(`/anganwadis/${id}`);
  return res.data;
};

// ✅ Assign Student to Anganwadi
export const assignToAnganwadi = async ({
  anganwadiId,
  studentId,
}: {
  anganwadiId: string;
  studentId: string;
}) => {
  const res = await API.post("/anganwadis/assign", {
    anganwadiId,
    studentId,
  });
  return res.data;
};

// ✅ Create Cohort
export const createStudent = async ({
  name,
  gender,
  status,
  anganwadiId,
}: {
  name: string;
  gender?: string;
  status?: string;
  anganwadiId?: string;
}) => {
  const res = await API.post("/students", {
    name,
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

// ===== QUESTION & TOPIC ENDPOINTS =====

// ✅ Get All Topics
export const getAllTopics = async () => {
  try {
    const res = await API.get("topics");
    return res.data;
  } catch (error) {
    console.error("Error fetching topics:", error);
    throw error;
  }
};

// ✅ Create a Topic
export const createTopic = async (name: string) => {
  try {
    const res = await API.post("topics", { name });
    return res.data;
  } catch (error) {
    console.error("Error creating topic:", error);
    throw error;
  }
};

// ✅ Get Questions by Topic
export const getQuestionsByTopic = async (topicId: string) => {
  try {
    const res = await API.get(`questions/topic/${topicId}`);
    return res.data;
  } catch (error) {
    console.error("Error fetching questions by topic:", error);
    throw error;
  }
};

// ✅ Get All Questions (with optional filters)
export const getAllQuestions = async (filters?: {
  topic?: string;
  search?: string;
}) => {
  try {
    const queryParams = new URLSearchParams();

    if (filters?.topic) queryParams.append("topic", filters.topic);
    if (filters?.search) queryParams.append("search", filters.search);

    const res = await API.get(
      `questions${queryParams.toString() ? `?${queryParams.toString()}` : ""}`
    );
    return res.data;
  } catch (error) {
    console.error("Error fetching questions:", error);
    throw error;
  }
};

// ✅ Get Question Details with Stats
export const getQuestionDetails = async (id: string) => {
  try {
    // Make sure we're using the correct path
    const res = await API.get(`questions/${id}`);
    return res.data;
  } catch (error) {
    console.error("Error fetching question details:", error);
    throw error;
  }
};

// ✅ Create a Question
export const createQuestion = async (formData: FormData) => {
  try {
    const res = await API.post("questions", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return res.data;
  } catch (error) {
    console.error("Error creating question:", error);
    throw error;
  }
};

// ✅ Batch Create Questions - No longer needed as we're using individual create calls
// export const batchCreateQuestions = async (questions: {
//   text: string;
//   topicId: string;
//   imageUrl: string;
//   audioUrl: string;
// }[]) => {
//   try {
//     const res = await API.post("questions/batch", { questions });
//     return res.data;
//   } catch (error) {
//     console.error("Error batch creating questions:", error);
//     throw error;
//   }
// };

// Assessment Session API functions

// Create a new assessment session
export const createAssessmentSession = async (data: {
  name: string;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  topicIds: string[];
}) => {
  try {
    const res = await API.post("assessment-sessions", data);
    return res.data;
  } catch (error) {
    console.error("Error creating assessment session:", error);
    throw error;
  }
};

// Get all assessment sessions
export const getAssessmentSessions = async () => {
  try {
    const res = await API.get("assessment-sessions");
    return res.data;
  } catch (error) {
    console.error("Error fetching assessment sessions:", error);
    throw error;
  }
};

// Get assessment session by ID
export const getAssessmentSessionById = async (id: string) => {
  try {
    const res = await API.get(`assessment-sessions/${id}`);
    return res.data;
  } catch (error) {
    console.error("Error fetching assessment session:", error);
    throw error;
  }
};

// Get active assessment sessions
export const getActiveAssessmentSessions = async () => {
  try {
    const res = await API.get("assessment-sessions/active");
    return res.data;
  } catch (error) {
    console.error("Error fetching active assessment sessions:", error);
    throw error;
  }
};

// Update assessment session
export const updateAssessmentSession = async (
  id: string,
  data: {
    name?: string;
    startDate?: Date;
    endDate?: Date;
    isActive?: boolean;
    topicIds?: string[];
  }
) => {
  try {
    const res = await API.put(`assessment-sessions/${id}`, data);
    return res.data;
  } catch (error) {
    console.error("Error updating assessment session:", error);
    throw error;
  }
};

// Delete assessment session
export const deleteAssessmentSession = async (id: string) => {
  try {
    const res = await API.delete(`assessment-sessions/${id}`);
    return res.data;
  } catch (error) {
    console.error("Error deleting assessment session:", error);
    throw error;
  }
};

// Get questions by assessment session
export const getQuestionsByAssessmentSession = async (sessionId: string) => {
  try {
    const res = await API.get(`questions/session/${sessionId}`);
    return res.data;
  } catch (error) {
    console.error("Error fetching questions by assessment session:", error);
    throw error;
  }
};

// Get teacher assessment sessions
export const getTeacherAssessmentSessions = async (teacherId: string) => {
  try {
    const res = await API.get(`teachers/${teacherId}/assessment-sessions`);
    return res.data;
  } catch (error) {
    console.error("Error fetching teacher assessment sessions:", error);
    throw error;
  }
};

// Global Assessment API functions

// Create a new global assessment
export const createGlobalAssessment = async (data: {
  name: string;
  description?: string;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  topicIds: string[];
  anganwadiIds: string[];
}) => {
  try {
    const res = await API.post("global-assessments", data);
    return res.data;
  } catch (error) {
    console.error("Error creating global assessment:", error);
    throw error;
  }
};

// Get all global assessments with statistics
export const getGlobalAssessments = async () => {
  try {
    const res = await API.get("global-assessments");
    return res.data;
  } catch (error) {
    console.error("Error fetching global assessments:", error);
    throw error;
  }
};

// Get details of a specific global assessment
export const getGlobalAssessmentById = async (id: string) => {
  try {
    const res = await API.get(`global-assessments/${id}`);
    return res.data;
  } catch (error) {
    console.error("Error fetching global assessment:", error);
    throw error;
  }
};

// Get submissions for a specific anganwadi in a global assessment
export const getAnganwadiSubmissions = async (assessmentId: string, anganwadiId: string) => {
  try {
    const res = await API.get(`global-assessments/${assessmentId}/anganwadi/${anganwadiId}`);
    return res.data;
  } catch (error) {
    console.error("Error fetching anganwadi submissions:", error);
    throw error;
  }
};

// Record a student submission for a global assessment
export const recordStudentSubmission = async (
  assessmentId: string, 
  studentId: string, 
  data: {
    teacherId: string;
    anganwadiId: string;
    responses?: Array<{
      questionId: string;
      startTime: Date;
      endTime: Date;
      audioUrl: string;
      evaluationId?: string;
    }>;
  }
) => {
  try {
    const res = await API.post(`global-assessments/${assessmentId}/student/${studentId}`, data);
    return res.data;
  } catch (error) {
    console.error("Error recording student submission:", error);
    throw error;
  }
};

// Publish a global assessment
export const publishGlobalAssessment = async (id: string) => {
  try {
    const res = await API.patch(`global-assessments/${id}/publish`);
    return res.data;
  } catch (error) {
    console.error("Error publishing global assessment:", error);
    throw error;
  }
};

// Complete a global assessment
export const completeGlobalAssessment = async (id: string) => {
  try {
    const res = await API.patch(`global-assessments/${id}/complete`);
    return res.data;
  } catch (error) {
    console.error("Error completing global assessment:", error);
    throw error;
  }
};

// Get details of a specific submission
export const getSubmissionById = async (assessmentId: string, submissionId: string) => {
  try {
    const res = await API.get(`global-assessments/${assessmentId}/submissions/${submissionId}`);
    return res.data;
  } catch (error) {
    console.error("Error fetching submission details:", error);
    throw error;
  }
};

// Score a single student response
export const scoreStudentResponse = async (responseId: string, score: number) => {
  try {
    const res = await API.post(`/student-responses/${responseId}/score`, { score });
    return res.data;
  } catch (error) {
    console.error("Error scoring response:", error);
    throw error;
  }
};

// Batch score multiple responses
export const batchScoreResponses = async (scores: { responseId: string; score: number }[]) => {
  try {
    const res = await API.post("/student-responses/batch-score", { scores });
    return res.data;
  } catch (error) {
    console.error("Error batch scoring responses:", error);
    throw error;
  }
};

// Get student responses for assessment
export const getStudentResponses = async (assessmentId: string) => {
  try {
    const res = await API.get(`/student-responses/evaluation/${assessmentId}`);
    return res.data;
  } catch (error) {
    console.error("Error fetching student responses:", error);
    throw error;
  }
};
