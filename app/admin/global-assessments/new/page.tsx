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
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { DatePicker } from "@/components/ui/date-picker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  createGlobalAssessment,
  getAllTopics,
  getAllAnganwadis,
} from "@/app/api/api";
import { toast } from "sonner";
import { Save, Loader2, ArrowLeft, ChevronRight } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Topic {
  id: string;
  name: string;
  questions: Array<{
    id: string;
    text: string;
  }>;
}

interface Anganwadi {
  id: string;
  name: string;
  location?: string;
  students?: Array<{
    id: string;
    name: string;
  }>;
}

export default function NewGlobalAssessmentPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("basic");
  const [loading, setLoading] = useState(false);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [anganwadis, setAnganwadis] = useState<Anganwadi[]>([]);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    startDate: new Date(),
    endDate: new Date(new Date().setDate(new Date().getDate() + 7)),
    isActive: true,
    topicIds: [] as string[],
    anganwadiIds: [] as string[],
  });

  // Topic selection state
  const [selectedTopics, setSelectedTopics] = useState<Record<string, boolean>>(
    {}
  );

  // Anganwadi selection state
  const [selectedAnganwadis, setSelectedAnganwadis] = useState<
    Record<string, boolean>
  >({});

  // For search/filter
  const [topicSearch, setTopicSearch] = useState("");
  const [anganwadiSearch, setAnganwadiSearch] = useState("");

  // Form validation
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Fetch topics and anganwadis
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [topicsData, anganwadisData] = await Promise.all([
          getAllTopics(),
          getAllAnganwadis(),
        ]);

        setTopics(topicsData);
        setAnganwadis(anganwadisData);

        // Initialize selection states
        const topicSelections: Record<string, boolean> = {};
        topicsData.forEach((topic: Topic) => {
          topicSelections[topic.id] = false;
        });
        setSelectedTopics(topicSelections);

        const anganwadiSelections: Record<string, boolean> = {};
        anganwadisData.forEach((anganwadi: Anganwadi) => {
          anganwadiSelections[anganwadi.id] = false;
        });
        setSelectedAnganwadis(anganwadiSelections);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load required data");
      }
    };

    fetchData();
  }, []);

  // Handle topic selection
  const handleTopicToggle = (topicId: string) => {
    setSelectedTopics((prev) => ({
      ...prev,
      [topicId]: !prev[topicId],
    }));
  };

  // Handle anganwadi selection
  const handleAnganwadiToggle = (anganwadiId: string) => {
    setSelectedAnganwadis((prev) => ({
      ...prev,
      [anganwadiId]: !prev[anganwadiId],
    }));
  };

  // Select/deselect all topics
  const handleSelectAllTopics = (select: boolean) => {
    const newSelection = { ...selectedTopics };
    Object.keys(newSelection).forEach((id) => {
      newSelection[id] = select;
    });
    setSelectedTopics(newSelection);
  };

  // Select/deselect all anganwadis
  const handleSelectAllAnganwadis = (select: boolean) => {
    const newSelection = { ...selectedAnganwadis };
    Object.keys(newSelection).forEach((id) => {
      newSelection[id] = select;
    });
    setSelectedAnganwadis(newSelection);
  };

  // Validate form before submission
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (formData.startDate >= formData.endDate) {
      newErrors.dates = "End date must be after start date";
    }

    const selectedTopicIds = Object.keys(selectedTopics).filter(
      (id) => selectedTopics[id]
    );
    if (selectedTopicIds.length === 0) {
      newErrors.topics = "At least one topic must be selected";
    }

    const selectedAnganwadiIds = Object.keys(selectedAnganwadis).filter(
      (id) => selectedAnganwadis[id]
    );
    if (selectedAnganwadiIds.length === 0) {
      newErrors.anganwadis = "At least one anganwadi must be selected";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix the errors before submitting");
      return;
    }

    setLoading(true);

    try {
      // Get selected topic IDs
      const topicIds = Object.keys(selectedTopics).filter(
        (id) => selectedTopics[id]
      );

      // Get selected anganwadi IDs
      const anganwadiIds = Object.keys(selectedAnganwadis).filter(
        (id) => selectedAnganwadis[id]
      );

      // Prepare form data
      const assessmentData = {
        ...formData,
        topicIds,
        anganwadiIds,
      };

      // Submit to API
      const response = await createGlobalAssessment(assessmentData);

      toast.success("Global assessment created successfully");
      router.push("/admin/global-assessments");
    } catch (error: any) {
      console.error("Error creating global assessment:", error);
      toast.error(error.message || "Failed to create global assessment");
    } finally {
      setLoading(false);
    }
  };

  // Helper to filter topics by search term
  const filteredTopics = topics.filter((topic) =>
    topic.name.toLowerCase().includes(topicSearch.toLowerCase())
  );

  // Helper to filter anganwadis by search term
  const filteredAnganwadis = anganwadis.filter((anganwadi) =>
    anganwadi.name.toLowerCase().includes(anganwadiSearch.toLowerCase())
  );

  // Count selected items
  const selectedTopicCount =
    Object.values(selectedTopics).filter(Boolean).length;
  const selectedAnganwadiCount =
    Object.values(selectedAnganwadis).filter(Boolean).length;

  // Navigate between tabs
  const goToNextTab = () => {
    if (activeTab === "basic") {
      if (!formData.name.trim()) {
        setErrors({ ...errors, name: "Name is required" });
        return;
      }
      if (formData.startDate >= formData.endDate) {
        setErrors({ ...errors, dates: "End date must be after start date" });
        return;
      }
      setActiveTab("topics");
    } else if (activeTab === "topics") {
      const selectedTopicIds = Object.keys(selectedTopics).filter(
        (id) => selectedTopics[id]
      );
      if (selectedTopicIds.length === 0) {
        setErrors({ ...errors, topics: "At least one topic must be selected" });
        return;
      }
      setActiveTab("anganwadis");
    }
  };

  const goToPreviousTab = () => {
    if (activeTab === "topics") {
      setActiveTab("basic");
    } else if (activeTab === "anganwadis") {
      setActiveTab("topics");
    }
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <Button
            variant="ghost"
            onClick={() => router.push("/admin/global-assessments")}
            className="mr-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-2xl font-bold">Create Global Assessment</h1>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="basic">Basic Information</TabsTrigger>
          <TabsTrigger value="topics">Select Topics</TabsTrigger>
          <TabsTrigger value="anganwadis">Select Anganwadis</TabsTrigger>
        </TabsList>

        <TabsContent value="basic">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>
                Enter the basic details for this global assessment
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">
                  Assessment Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="E.g., Term 1 Assessment 2024"
                  className={errors.name ? "border-red-500" : ""}
                />
                {errors.name && (
                  <p className="text-sm text-red-500">{errors.name}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Assessment Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Provide a brief description of this assessment"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>
                    Start Date <span className="text-red-500">*</span>
                  </Label>
                  <DatePicker
                    date={formData.startDate}
                    onSelect={(date) =>
                      date && setFormData({ ...formData, startDate: date })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label>
                    End Date <span className="text-red-500">*</span>
                  </Label>
                  <DatePicker
                    date={formData.endDate}
                    onSelect={(date) =>
                      date && setFormData({ ...formData, endDate: date })
                    }
                  />
                </div>
              </div>
              {errors.dates && (
                <p className="text-sm text-red-500">{errors.dates}</p>
              )}

              <div className="flex items-center space-x-2 pt-2">
                <Checkbox
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) =>
                    setFormData({
                      ...formData,
                      isActive: checked as boolean,
                    })
                  }
                />
                <Label htmlFor="isActive">
                  Set this assessment as active immediately
                </Label>
              </div>
            </CardContent>
            <CardFooter className="justify-end">
              <Button type="button" onClick={goToNextTab}>
                Next: Select Topics
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="topics">
          <Card>
            <CardHeader>
              <CardTitle>Select Topics</CardTitle>
              <CardDescription>
                Choose the topics to include in this assessment
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col md:flex-row justify-between gap-4 mb-4">
                <div className="flex-1">
                  <Input
                    placeholder="Search topics..."
                    value={topicSearch}
                    onChange={(e) => setTopicSearch(e.target.value)}
                    className="mb-2"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSelectAllTopics(true)}
                  >
                    Select All
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSelectAllTopics(false)}
                  >
                    Deselect All
                  </Button>
                </div>
              </div>

              <div className="border rounded-md h-[300px] overflow-y-auto p-2">
                {filteredTopics.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">
                    No topics found matching your search
                  </p>
                ) : (
                  <div className="space-y-2">
                    {filteredTopics.map((topic) => (
                      <div
                        key={topic.id}
                        className="flex items-center space-x-2 p-2 hover:bg-muted/50 rounded"
                      >
                        <Checkbox
                          id={`topic-${topic.id}`}
                          checked={selectedTopics[topic.id] || false}
                          onCheckedChange={() => handleTopicToggle(topic.id)}
                        />
                        <Label
                          htmlFor={`topic-${topic.id}`}
                          className="flex-1 cursor-pointer"
                        >
                          {topic.name}
                        </Label>
                        <span className="text-sm text-muted-foreground">
                          {topic.questions.length} questions
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="text-sm text-muted-foreground">
                Selected {selectedTopicCount} of {topics.length} topics
              </div>

              {errors.topics && (
                <p className="text-sm text-red-500">{errors.topics}</p>
              )}
            </CardContent>
            <CardFooter className="justify-between">
              <Button variant="outline" onClick={goToPreviousTab}>
                Back
              </Button>
              <Button onClick={goToNextTab}>
                Next: Select Anganwadis
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="anganwadis">
          <Card>
            <CardHeader>
              <CardTitle>Select Anganwadis</CardTitle>
              <CardDescription>
                Choose which anganwadis will participate in this assessment
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col md:flex-row justify-between gap-4 mb-4">
                <div className="flex-1">
                  <Input
                    placeholder="Search anganwadis..."
                    value={anganwadiSearch}
                    onChange={(e) => setAnganwadiSearch(e.target.value)}
                    className="mb-2"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSelectAllAnganwadis(true)}
                  >
                    Select All
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSelectAllAnganwadis(false)}
                  >
                    Deselect All
                  </Button>
                </div>
              </div>

              <div className="border rounded-md h-[300px] overflow-y-auto p-2">
                {filteredAnganwadis.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">
                    No anganwadis found matching your search
                  </p>
                ) : (
                  <div className="space-y-2">
                    {filteredAnganwadis.map((anganwadi) => (
                      <div
                        key={anganwadi.id}
                        className="flex items-center space-x-2 p-2 hover:bg-muted/50 rounded"
                      >
                        <Checkbox
                          id={`anganwadi-${anganwadi.id}`}
                          checked={selectedAnganwadis[anganwadi.id] || false}
                          onCheckedChange={() =>
                            handleAnganwadiToggle(anganwadi.id)
                          }
                        />
                        <Label
                          htmlFor={`anganwadi-${anganwadi.id}`}
                          className="flex-1 cursor-pointer"
                        >
                          {anganwadi.name}
                        </Label>
                        <span className="text-sm text-muted-foreground">
                          {anganwadi.location || ""}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="text-sm text-muted-foreground">
                Selected {selectedAnganwadiCount} of {anganwadis.length}{" "}
                anganwadis
              </div>

              {errors.anganwadis && (
                <p className="text-sm text-red-500">{errors.anganwadis}</p>
              )}
            </CardContent>
            <CardFooter className="justify-between">
              <Button variant="outline" onClick={goToPreviousTab}>
                Back
              </Button>
              <Button onClick={handleSubmit} disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Create Assessment
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
