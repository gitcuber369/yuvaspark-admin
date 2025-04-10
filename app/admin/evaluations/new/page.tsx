"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  createEvaluation,
  getAllStudents,
  getAllTeachers,
  getAllTopics,
  getAssessmentSessions,
} from "@/app/api/api";
import { toast } from "sonner";
import { FileAudio, Loader2, Mic, Save } from "lucide-react";
import { useDropzone } from "react-dropzone";
import { Textarea } from "@/components/ui/textarea";

interface Student {
  id: string;
  name: string;
}

interface Teacher {
  id: string;
  name: string;
}

interface Topic {
  id: string;
  name: string;
  questions: Array<{
    id: string;
    text: string;
  }>;
}

interface AssessmentSession {
  id: string;
  name: string;
  isActive: boolean;
}

export default function NewEvaluationPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [students, setStudents] = useState<Student[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [sessions, setSessions] = useState<AssessmentSession[]>([]);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Form state
  const [formData, setFormData] = useState({
    studentId: "",
    teacherId: "",
    topicId: "",
    weekNumber: "1",
    assessmentSessionId: "none",
    questions: [] as string[],
  });

  // Fetch all required data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [studentsData, teachersData, topicsData, sessionsData] =
          await Promise.all([
            getAllStudents(),
            getAllTeachers(),
            getAllTopics(),
            getAssessmentSessions(),
          ]);
        setStudents(studentsData);
        setTeachers(teachersData);
        setTopics(topicsData);
        setSessions(sessionsData.filter((s: AssessmentSession) => s.isActive));
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load required data");
      }
    };

    fetchData();
  }, []);

  // Handle topic change to update questions
  const handleTopicChange = (value: string) => {
    const selectedTopic = topics.find((topic) => topic.id === value);
    setFormData({
      ...formData,
      topicId: value,
      // Auto-select all questions for this topic
      questions: selectedTopic?.questions.map((q) => q.id) || [],
    });
  };

  // Dropzone for audio file
  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      "audio/*": [".mp3", ".wav", ".m4a", ".ogg"],
    },
    maxFiles: 1,
    onDrop: (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        setAudioFile(acceptedFiles[0]);
      }
    },
  });

  // Validate form
  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!formData.studentId) errors.studentId = "Student is required";
    if (!formData.teacherId) errors.teacherId = "Teacher is required";
    if (!formData.topicId) errors.topicId = "Topic is required";
    if (!formData.questions.length)
      errors.questions = "At least one question is required";
    if (!audioFile) errors.audioFile = "Audio recording is required";

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fill in all required fields");
      return;
    }

    setLoading(true);

    try {
      const formDataToSubmit = new FormData();
      formDataToSubmit.append("studentId", formData.studentId);
      formDataToSubmit.append("teacherId", formData.teacherId);
      formDataToSubmit.append("topicId", formData.topicId);
      formDataToSubmit.append("weekNumber", formData.weekNumber);

      if (formData.assessmentSessionId && formData.assessmentSessionId !== "none") {
        formDataToSubmit.append(
          "assessmentSessionId",
          formData.assessmentSessionId
        );
      }

      // Add questions as JSON string
      formDataToSubmit.append("questions", JSON.stringify(formData.questions));

      // Add audio file
      if (audioFile) {
        formDataToSubmit.append("audio", audioFile);
      }

      // Create metadata
      const metadata = {
        recordingType: "evaluation",
        topicId: formData.topicId,
        studentId: formData.studentId,
        teacherId: formData.teacherId,
        weekNumber: formData.weekNumber,
        timestamp: new Date().toISOString(),
        responses: formData.questions.map((questionId) => ({
          questionId,
          startTime: new Date().toISOString(), // Placeholder
          endTime: new Date().toISOString(), // Placeholder
        })),
      };

      formDataToSubmit.append("metadata", JSON.stringify(metadata));

      // Submit the form
      const response = await createEvaluation(formDataToSubmit);

      toast.success("Evaluation created successfully");
      router.push(`/admin/evaluations/${response.evaluation.id}`);
    } catch (error: any) {
      console.error("Error creating evaluation:", error);
      toast.error(error.message || "Failed to create evaluation");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-6 h-full overflow-y-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Create New Evaluation</h1>
        <Button variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>
                Enter the basic details for this evaluation
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="student">
                    Student <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.studentId}
                    onValueChange={(value) =>
                      setFormData({ ...formData, studentId: value })
                    }
                  >
                    <SelectTrigger
                      id="student"
                      className={formErrors.studentId ? "border-red-500" : ""}
                    >
                      <SelectValue placeholder="Select a student" />
                    </SelectTrigger>
                    <SelectContent className="z-50 max-h-[200px]">
                      {students.map((student) => (
                        <SelectItem key={student.id} value={student.id}>
                          {student.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {formErrors.studentId && (
                    <p className="text-sm text-red-500">
                      {formErrors.studentId}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="teacher">
                    Teacher <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.teacherId}
                    onValueChange={(value) =>
                      setFormData({ ...formData, teacherId: value })
                    }
                  >
                    <SelectTrigger
                      id="teacher"
                      className={formErrors.teacherId ? "border-red-500" : ""}
                    >
                      <SelectValue placeholder="Select a teacher" />
                    </SelectTrigger>
                    <SelectContent className="z-50 max-h-[200px]">
                      {teachers.map((teacher) => (
                        <SelectItem key={teacher.id} value={teacher.id}>
                          {teacher.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {formErrors.teacherId && (
                    <p className="text-sm text-red-500">
                      {formErrors.teacherId}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="topic">
                    Topic <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.topicId}
                    onValueChange={handleTopicChange}
                  >
                    <SelectTrigger
                      id="topic"
                      className={formErrors.topicId ? "border-red-500" : ""}
                    >
                      <SelectValue placeholder="Select a topic" />
                    </SelectTrigger>
                    <SelectContent className="z-50 max-h-[200px]">
                      {topics.map((topic) => (
                        <SelectItem key={topic.id} value={topic.id}>
                          {topic.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {formErrors.topicId && (
                    <p className="text-sm text-red-500">{formErrors.topicId}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="weekNumber">Week Number</Label>
                  <Input
                    id="weekNumber"
                    type="number"
                    min="1"
                    max="52"
                    value={formData.weekNumber}
                    onChange={(e) =>
                      setFormData({ ...formData, weekNumber: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="session">Assessment Session (Optional)</Label>
                  <Select
                    value={formData.assessmentSessionId}
                    onValueChange={(value) =>
                      setFormData({ ...formData, assessmentSessionId: value })
                    }
                  >
                    <SelectTrigger id="session">
                      <SelectValue placeholder="Select a session" />
                    </SelectTrigger>
                    <SelectContent className="z-50 max-h-[200px]">
                      <SelectItem value="none">None</SelectItem>
                      {sessions.map((session) => (
                        <SelectItem key={session.id} value={session.id}>
                          {session.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Evaluation Audio</CardTitle>
              <CardDescription>
                Upload the audio recording of the evaluation session
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-md p-6 text-center cursor-pointer hover:bg-gray-50 ${
                  formErrors.audioFile ? "border-red-500" : "border-gray-300"
                }`}
              >
                <input {...getInputProps()} />
                {audioFile ? (
                  <div className="flex flex-col items-center">
                    <FileAudio className="h-10 w-10 text-gray-400 mb-2" />
                    <p className="text-sm font-medium">{audioFile.name}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {(audioFile.size / (1024 * 1024)).toFixed(2)} MB
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <Mic className="h-10 w-10 text-gray-400 mb-2" />
                    <p className="text-sm font-medium">
                      Drag & drop an audio file, or click to select
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Supports MP3, WAV, M4A, and OGG formats
                    </p>
                  </div>
                )}
              </div>
              {formErrors.audioFile && (
                <p className="text-sm text-red-500 mt-2">
                  {formErrors.audioFile}
                </p>
              )}
            </CardContent>
          </Card>

          {formData.topicId && (
            <Card>
              <CardHeader>
                <CardTitle>Questions</CardTitle>
                <CardDescription>
                  Selected questions for this evaluation
                </CardDescription>
              </CardHeader>
              <CardContent>
                {formData.questions.length === 0 ? (
                  <p className="text-gray-500 italic">
                    No questions available for the selected topic.
                  </p>
                ) : (
                  <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                    {topics
                      .find((t) => t.id === formData.topicId)
                      ?.questions.map((question, index) => (
                        <div
                          key={question.id}
                          className="flex items-start p-3 border rounded-md"
                        >
                          <div className="mr-2 mt-1 bg-gray-200 text-gray-700 w-6 h-6 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0">
                            {index + 1}
                          </div>
                          <div className="flex-1">
                            <p>{question.text}</p>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
                {formErrors.questions && (
                  <p className="text-sm text-red-500 mt-2">
                    {formErrors.questions}
                  </p>
                )}
              </CardContent>
            </Card>
          )}

          <Card>
            <CardFooter className="flex justify-end gap-4 pt-6">
              <Button variant="outline" onClick={() => router.back()}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Create Evaluation
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </form>
    </div>
  );
}
