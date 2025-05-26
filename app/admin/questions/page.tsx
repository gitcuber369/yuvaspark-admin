"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  getAllTopics,
  getQuestionsByTopic,
  getAllQuestions,
  getQuestionDetails,
  createQuestion,
} from "@/app/api/api";
import { useRouter } from "next/navigation";

interface Question {
  id: string;
  text: string;
  imageUrl: string;
  audioUrl: string;
  topicId: string;
  answerOptions?: string[];
  correctAnswer?: number | null;
  topic?: {
    id: string;
    name: string;
  };
  stats?: {
    totalResponses: number;
    gradedResponses: number;
    averageScore: number;
    gradingPercentage: number;
  };
}

interface Topic {
  id: string;
  name: string;
}

interface BatchQuestionInput {
  text: string;
  topicId: string;
  image: File | null;
  audio: File | null;
  answerOptions: string[];
  correctAnswer: number | null;
}

export default function QuestionAdminPage() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [selectedTopicId, setSelectedTopicId] = useState("");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("all");

  // For single question creation
  const [text, setText] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [audio, setAudio] = useState<File | null>(null);
  const [answerOptions, setAnswerOptions] = useState<string[]>([
    "",
    "",
    "",
    "",
  ]); // 4 empty options
  const [correctAnswer, setCorrectAnswer] = useState<number | null>(null);
  const [open, setOpen] = useState(false);

  // For question details
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(
    null
  );
  const [detailsOpen, setDetailsOpen] = useState(false);

  // For batch creation
  const [batchOpen, setBatchOpen] = useState(false);
  const [batchQuestions, setBatchQuestions] = useState<BatchQuestionInput[]>([
    {
      text: "",
      topicId: "",
      image: null,
      audio: null,
      answerOptions: ["", "", "", ""],
      correctAnswer: null,
    },
  ]);

  const router = useRouter();

  useEffect(() => {
    const fetchTopics = async () => {
      try {
        const data = await getAllTopics();
        setTopics(data);
        if (data.length > 0) {
          setSelectedTopicId(data[0].id);
        }
      } catch (error) {
        console.error("Failed to fetch topics:", error);
        toast.error("Failed to load topics");
      }
    };

    fetchTopics();
  }, []);

  useEffect(() => {
    const fetchQuestions = async () => {
      setIsLoading(true);
      try {
        let data;
        if (activeTab === "by-topic" && selectedTopicId) {
          data = await getQuestionsByTopic(selectedTopicId);
        } else {
          const filters: { topic?: string; search?: string } = {};
          if (searchQuery) filters.search = searchQuery;
          if (activeTab === "by-topic" && selectedTopicId)
            filters.topic = selectedTopicId;

          data = await getAllQuestions(filters);
        }
        setQuestions(data);
      } catch (error) {
        console.error("Failed to fetch questions:", error);
        toast.error("Failed to load questions");
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuestions();
  }, [selectedTopicId, activeTab, searchQuery]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTopicId || !text || !image || !audio) {
      toast.error("All fields are required.");
      return;
    }

    setIsLoading(true);
    const formData = new FormData();
    formData.append("topicId", selectedTopicId);
    formData.append("text", text);
    formData.append("image", image);
    formData.append("audio", audio);

    // Filter out empty answer options and add to formData
    const filteredOptions = answerOptions.filter(
      (option) => option.trim() !== ""
    );

    // Add each answer option as a separate form field
    filteredOptions.forEach((option, index) => {
      formData.append(`answerOptions[${index}]`, option);
    });

    // Add correctAnswer if selected and valid
    if (
      correctAnswer !== null &&
      correctAnswer >= 0 &&
      correctAnswer < filteredOptions.length
    ) {
      formData.append("correctAnswer", correctAnswer.toString());
    }

    try {
      await createQuestion(formData);
      toast.success("Question created successfully!");
      setText("");
      setImage(null);
      setAudio(null);
      setAnswerOptions(["", "", "", ""]);
      setCorrectAnswer(null);
      setOpen(false);

      // Refresh questions
      if (activeTab === "by-topic" && selectedTopicId) {
        const data = await getQuestionsByTopic(selectedTopicId);
        setQuestions(data);
      } else {
        const data = await getAllQuestions({
          search: searchQuery,
          topic: activeTab === "by-topic" ? selectedTopicId : undefined,
        });
        setQuestions(data);
      }
    } catch (error) {
      console.error("Failed to create question:", error);
      toast.error("Failed to create question");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBatchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate batch questions
    const invalidQuestions = batchQuestions.filter(
      (q) => !q.text || !q.topicId || !q.image || !q.audio
    );

    if (invalidQuestions.length > 0) {
      toast.error("All fields are required for each question");
      return;
    }

    setIsLoading(true);
    try {
      // Process each question one by one
      for (const question of batchQuestions) {
        const formData = new FormData();
        formData.append("topicId", question.topicId);
        formData.append("text", question.text);

        if (question.image) {
          formData.append("image", question.image);
        }

        if (question.audio) {
          formData.append("audio", question.audio);
        }

        // Filter out empty answer options
        const filteredOptions = question.answerOptions.filter(
          (option) => option.trim() !== ""
        );

        // Add each answer option as a separate form field
        filteredOptions.forEach((option, index) => {
          formData.append(`answerOptions[${index}]`, option);
        });

        // Add correctAnswer if selected and valid
        if (
          question.correctAnswer !== null &&
          question.correctAnswer >= 0 &&
          question.correctAnswer < filteredOptions.length
        ) {
          formData.append("correctAnswer", question.correctAnswer.toString());
        }

        await createQuestion(formData);
      }

      toast.success("Questions created successfully!");
      setBatchQuestions([
        {
          text: "",
          topicId: "",
          image: null,
          audio: null,
          answerOptions: ["", "", "", ""],
          correctAnswer: null,
        },
      ]);
      setBatchOpen(false);

      // Refresh questions
      const data = await getAllQuestions({
        search: searchQuery,
        topic: activeTab === "by-topic" ? selectedTopicId : undefined,
      });
      setQuestions(data);
    } catch (error) {
      console.error("Failed to create batch questions:", error);
      toast.error("Failed to create batch questions");
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewDetails = async (questionId: string) => {
    setIsLoading(true);
    try {
      const data = await getQuestionDetails(questionId);
      setSelectedQuestion(data);
      setDetailsOpen(true);
    } catch (error) {
      console.error("Failed to fetch question details:", error);
      toast.error("Failed to load question details");
    } finally {
      setIsLoading(false);
    }
  };

  const addBatchQuestion = () => {
    setBatchQuestions([
      ...batchQuestions,
      {
        text: "",
        topicId: "",
        image: null,
        audio: null,
        answerOptions: ["", "", "", ""],
        correctAnswer: null,
      },
    ]);
  };

  const removeBatchQuestion = (index: number) => {
    const newBatchQuestions = [...batchQuestions];
    newBatchQuestions.splice(index, 1);
    setBatchQuestions(newBatchQuestions);
  };

  const updateBatchQuestion = (
    index: number,
    field: keyof BatchQuestionInput,
    value: any
  ) => {
    const newBatchQuestions = [...batchQuestions];
    newBatchQuestions[index] = { ...newBatchQuestions[index], [field]: value };
    setBatchQuestions(newBatchQuestions);
  };

  return (
    <div className="max-w-7xl mx-auto p-2 sm:p-6 space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold">Question Management</h1>
        <div className="flex flex-col sm:flex-row w-full sm:w-auto gap-2 sm:gap-3">
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>Add Question</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Add New Question</DialogTitle>
                <DialogDescription>
                  Fill all fields to create a new question.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="topic">Topic</Label>
                  <Select
                    value={selectedTopicId}
                    onValueChange={setSelectedTopicId}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a topic" />
                    </SelectTrigger>
                    <SelectContent>
                      {topics.map((topic) => (
                        <SelectItem key={topic.id} value={topic.id}>
                          {topic.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="text">Question Text</Label>
                  <Input
                    id="text"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="What's the question?"
                  />
                </div>

                <div className="space-y-4">
                  <Label>Answer Options (up to 4)</Label>
                  {answerOptions.map((option, index) => (
                    <div key={index} className="flex gap-2 items-center">
                      <Input
                        value={option}
                        onChange={(e) => {
                          const newOptions = [...answerOptions];
                          newOptions[index] = e.target.value;
                          setAnswerOptions(newOptions);
                        }}
                        placeholder={`Answer option ${index + 1}`}
                      />
                      <div className="flex items-center gap-2">
                        <input
                          type="radio"
                          id={`correctAnswer-${index}`}
                          name="correctAnswer"
                          checked={correctAnswer === index}
                          onChange={() => setCorrectAnswer(index)}
                        />
                        <Label
                          htmlFor={`correctAnswer-${index}`}
                          className="text-sm cursor-pointer"
                        >
                          Correct
                        </Label>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="image">Image File</Label>
                  <Input
                    id="image"
                    type="file"
                    accept="image/*"
                    onChange={(e) => setImage(e.target.files?.[0] || null)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="audio">Audio File</Label>
                  <Input
                    id="audio"
                    type="file"
                    accept="audio/*"
                    onChange={(e) => setAudio(e.target.files?.[0] || null)}
                  />
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Uploading..." : "Upload Question"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>

          <Dialog open={batchOpen} onOpenChange={setBatchOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">Batch Create</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Batch Create Questions</DialogTitle>
                <DialogDescription>
                  Create multiple questions at once by uploading files for each
                  question.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleBatchSubmit} className="space-y-6">
                {batchQuestions.map((question, index) => (
                  <div key={index} className="p-4 border rounded-md space-y-3">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-medium">Question #{index + 1}</h4>
                      {batchQuestions.length > 1 && (
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={() => removeBatchQuestion(index)}
                        >
                          Remove
                        </Button>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label>Topic</Label>
                      <Select
                        value={question.topicId}
                        onValueChange={(value) =>
                          updateBatchQuestion(index, "topicId", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a topic" />
                        </SelectTrigger>
                        <SelectContent>
                          {topics.map((topic) => (
                            <SelectItem key={topic.id} value={topic.id}>
                              {topic.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Question Text</Label>
                      <Input
                        value={question.text}
                        onChange={(e) =>
                          updateBatchQuestion(index, "text", e.target.value)
                        }
                        placeholder="What's the question?"
                      />
                    </div>

                    <div className="space-y-4">
                      <Label>Answer Options (up to 4)</Label>
                      {question.answerOptions.map((option, optionIndex) => (
                        <div
                          key={optionIndex}
                          className="flex gap-2 items-center"
                        >
                          <Input
                            value={option}
                            onChange={(e) => {
                              const newOptions = [...question.answerOptions];
                              newOptions[optionIndex] = e.target.value;
                              updateBatchQuestion(
                                index,
                                "answerOptions",
                                newOptions
                              );
                            }}
                            placeholder={`Answer option ${optionIndex + 1}`}
                          />
                          <div className="flex items-center gap-2">
                            <input
                              type="radio"
                              id={`question-${index}-correctAnswer-${optionIndex}`}
                              name={`question-${index}-correctAnswer`}
                              checked={question.correctAnswer === optionIndex}
                              onChange={() =>
                                updateBatchQuestion(
                                  index,
                                  "correctAnswer",
                                  optionIndex
                                )
                              }
                            />
                            <Label
                              htmlFor={`question-${index}-correctAnswer-${optionIndex}`}
                              className="text-sm cursor-pointer"
                            >
                              Correct
                            </Label>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="space-y-2">
                      <Label>Image File</Label>
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={(e) =>
                          updateBatchQuestion(
                            index,
                            "image",
                            e.target.files?.[0] || null
                          )
                        }
                      />
                      {question.image && (
                        <p className="text-sm text-green-600">
                          File selected: {question.image.name}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label>Audio File</Label>
                      <Input
                        type="file"
                        accept="audio/*"
                        onChange={(e) =>
                          updateBatchQuestion(
                            index,
                            "audio",
                            e.target.files?.[0] || null
                          )
                        }
                      />
                      {question.audio && (
                        <p className="text-sm text-green-600">
                          File selected: {question.audio.name}
                        </p>
                      )}
                    </div>
                  </div>
                ))}

                <div className="flex justify-between">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addBatchQuestion}
                  >
                    Add Another Question
                  </Button>

                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? "Creating..." : "Create All Questions"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Questions</CardTitle>
        </CardHeader>

        <CardContent>
          <Tabs
            defaultValue="all"
            value={activeTab}
            onValueChange={setActiveTab}
            className="mb-6"
          >
            <TabsList className="w-full sm:w-auto">
              <TabsTrigger value="all" className="flex-1">
                All Questions
              </TabsTrigger>
              <TabsTrigger value="by-topic" className="flex-1">
                By Topic
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <Input
                  placeholder="Search questions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full sm:max-w-sm"
                />
              </div>
            </TabsContent>

            <TabsContent value="by-topic" className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                <Select
                  value={selectedTopicId}
                  onValueChange={setSelectedTopicId}
                >
                  <SelectTrigger className="w-full sm:w-[200px]">
                    <SelectValue placeholder="Select a topic" />
                  </SelectTrigger>
                  <SelectContent>
                    {topics.map((topic) => (
                      <SelectItem key={topic.id} value={topic.id}>
                        {topic.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Input
                  placeholder="Search within topic..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full sm:max-w-sm"
                />
              </div>
            </TabsContent>
          </Tabs>

          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <p>Loading questions...</p>
            </div>
          ) : questions.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <p className="text-muted-foreground mb-2">No questions found.</p>
              <p className="text-sm text-muted-foreground">
                {activeTab === "by-topic"
                  ? "Try selecting a different topic or create a new question."
                  : "Create a new question to get started."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto -mx-2 sm:mx-0">
              <div className="inline-block min-w-full align-middle">
                <div className="overflow-hidden md:rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="min-w-[200px]">
                          Question Text
                        </TableHead>
                        <TableHead className="min-w-[100px]">Topic</TableHead>
                        <TableHead className="min-w-[120px]">Media</TableHead>
                        <TableHead className="text-right min-w-[160px]">
                          Actions
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {questions.map((q) => (
                        <TableRow key={q.id}>
                          <TableCell className="font-medium">
                            <div className="line-clamp-2">{q.text}</div>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className="max-w-[120px] truncate"
                            >
                              {q.topic?.name || "Unknown Topic"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                              {q.imageUrl && (
                                <a
                                  href={q.imageUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-500 hover:underline text-sm"
                                >
                                  Download Image
                                </a>
                              )}
                              {q.audioUrl && (
                                <audio
                                  controls
                                  src={q.audioUrl}
                                  className="h-8 max-w-[150px]"
                                />
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex flex-col sm:flex-row justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleViewDetails(q.id)}
                                className="w-full sm:w-auto whitespace-nowrap"
                              >
                                Preview
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  router.push(`/admin/questions/${q.id}`)
                                }
                                className="w-full sm:w-auto whitespace-nowrap"
                              >
                                View Details
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Question Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>Question Details</DialogTitle>
          </DialogHeader>

          {selectedQuestion && (
            <div className="space-y-4 sm:space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">
                    Topic
                  </h3>
                  <p>{selectedQuestion.topic?.name}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">
                    Question ID
                  </h3>
                  <p className="text-sm font-mono">{selectedQuestion.id}</p>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">
                  Question Text
                </h3>
                <p className="text-lg">{selectedQuestion.text}</p>
              </div>

              {/* Answer Options Section */}
              {selectedQuestion.answerOptions &&
                selectedQuestion.answerOptions.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">
                      Answer Options
                    </h3>
                    <div className="space-y-2 mt-2">
                      {selectedQuestion.answerOptions.map((option, index) => (
                        <div
                          key={index}
                          className={`p-2 rounded-md ${
                            selectedQuestion.correctAnswer === index
                              ? "bg-green-100 border border-green-300"
                              : "bg-gray-50 border border-gray-200"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            {selectedQuestion.correctAnswer === index && (
                              <Badge
                                variant="outline"
                                className="bg-green-500 text-white"
                              >
                                Correct Answer
                              </Badge>
                            )}
                            <p
                              className={
                                selectedQuestion.correctAnswer === index
                                  ? "font-medium"
                                  : ""
                              }
                            >
                              {option}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">
                    Image
                  </h3>
                  {selectedQuestion.imageUrl ? (
                    <div className="rounded-md overflow-hidden border">
                      <img
                        src={selectedQuestion.imageUrl}
                        alt="Question visual"
                        className="w-full h-auto object-contain max-h-[200px]"
                      />
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No image available</p>
                  )}
                </div>

                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">
                    Audio
                  </h3>
                  {selectedQuestion.audioUrl ? (
                    <div className="p-4 border rounded-md">
                      <audio
                        controls
                        src={selectedQuestion.audioUrl}
                        className="w-full"
                      />
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No audio available</p>
                  )}
                </div>
              </div>

              {selectedQuestion.stats && (
                <div className="pt-4 border-t">
                  <h3 className="text-md font-semibold mb-3">
                    Response Statistics
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">
                    <div className="p-3 bg-muted rounded-md">
                      <h4 className="text-sm font-medium text-muted-foreground">
                        Total Responses
                      </h4>
                      <p className="text-2xl font-semibold">
                        {selectedQuestion.stats.totalResponses}
                      </p>
                    </div>
                    <div className="p-3 bg-muted rounded-md">
                      <h4 className="text-sm font-medium text-muted-foreground">
                        Graded
                      </h4>
                      <p className="text-2xl font-semibold">
                        {selectedQuestion.stats.gradedResponses}
                      </p>
                    </div>
                    <div className="p-3 bg-muted rounded-md">
                      <h4 className="text-sm font-medium text-muted-foreground">
                        Average Score
                      </h4>
                      <p className="text-2xl font-semibold">
                        {selectedQuestion.stats.averageScore.toFixed(1)}
                      </p>
                    </div>
                    <div className="p-3 bg-muted rounded-md">
                      <h4 className="text-sm font-medium text-muted-foreground">
                        Grading %
                      </h4>
                      <p className="text-2xl font-semibold">
                        {selectedQuestion.stats.gradingPercentage.toFixed(0)}%
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
