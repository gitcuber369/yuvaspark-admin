"use client";

import { useState, useEffect } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Calendar,
  Check,
  CheckCircle,
  Clock,
  Edit,
  ListChecks,
  Plus,
  Square,
  Trash2,
  XCircle
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { Checkbox } from "@/components/ui/checkbox";
import { DatePicker } from "@/components/ui/date-picker";
import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api/";

// API functions for assessment sessions
const createAssessmentSession = async (data) => {
  const res = await axios.post(`${API_URL}assessment-sessions`, data);
  return res.data;
};

const getAssessmentSessions = async () => {
  const res = await axios.get(`${API_URL}assessment-sessions`);
  return res.data;
};

const updateAssessmentSession = async (id, data) => {
  const res = await axios.put(`${API_URL}assessment-sessions/${id}`, data);
  return res.data;
};

const deleteAssessmentSession = async (id) => {
  const res = await axios.delete(`${API_URL}assessment-sessions/${id}`);
  return res.data;
};

// API function for topics
const getAllTopics = async () => {
  const res = await axios.get(`${API_URL}topics`);
  return res.data;
};

export default function AssessmentsPage() {
  const router = useRouter();
  const [assessmentSessions, setAssessmentSessions] = useState([]);
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newSession, setNewSession] = useState({
    name: "",
    startDate: new Date(),
    endDate: new Date(new Date().setDate(new Date().getDate() + 7)), // Default 7 days
    isActive: true,
    topicIds: []
  });
  const [selectedTopics, setSelectedTopics] = useState({});

  useEffect(() => {
    Promise.all([
      getAssessmentSessions(),
      getAllTopics()
    ]).then(([sessionsData, topicsData]) => {
      setAssessmentSessions(sessionsData);
      setTopics(topicsData);
      
      // Initialize selected topics object
      const topicsObj = {};
      topicsData.forEach(topic => {
        topicsObj[topic.id] = false;
      });
      setSelectedTopics(topicsObj);
      
      setLoading(false);
    }).catch(error => {
      console.error("Failed to load data:", error);
      toast.error("Failed to load assessment data");
      setLoading(false);
    });
  }, []);

  const handleCreateSession = async () => {
    if (!newSession.name) {
      toast.error("Please enter a session name");
      return;
    }
    
    // Get selected topic IDs
    const topicIds = Object.keys(selectedTopics).filter(id => selectedTopics[id]);
    
    if (topicIds.length === 0) {
      toast.error("Please select at least one topic");
      return;
    }
    
    try {
      await createAssessmentSession({
        ...newSession,
        topicIds
      });
      
      toast.success("Assessment session created successfully");
      
      // Reset form and refresh data
      setNewSession({
        name: "",
        startDate: new Date(),
        endDate: new Date(new Date().setDate(new Date().getDate() + 7)),
        isActive: true,
        topicIds: []
      });
      
      // Reset selected topics
      const resetTopics = {};
      topics.forEach(topic => {
        resetTopics[topic.id] = false;
      });
      setSelectedTopics(resetTopics);
      
      // Refresh sessions
      const updatedSessions = await getAssessmentSessions();
      setAssessmentSessions(updatedSessions);
      
    } catch (error) {
      console.error("Failed to create assessment session:", error);
      toast.error("Failed to create assessment session");
    }
  };

  const handleToggleActive = async (session) => {
    try {
      await updateAssessmentSession(session.id, {
        isActive: !session.isActive
      });
      
      toast.success(`Assessment ${session.isActive ? 'deactivated' : 'activated'} successfully`);
      
      // Refresh sessions
      const updatedSessions = await getAssessmentSessions();
      setAssessmentSessions(updatedSessions);
      
    } catch (error) {
      console.error("Failed to update assessment status:", error);
      toast.error("Failed to update assessment status");
    }
  };

  const handleDeleteSession = async (id) => {
    try {
      await deleteAssessmentSession(id);
      toast.success("Assessment session deleted successfully");
      
      // Refresh sessions
      const updatedSessions = await getAssessmentSessions();
      setAssessmentSessions(updatedSessions);
      
    } catch (error) {
      console.error("Failed to delete assessment session:", error);
      toast.error("Failed to delete assessment session");
    }
  };

  const handleViewResults = (sessionId) => {
    router.push(`/admin/assessments/results/${sessionId}`);
  };

  const isSessionActive = (session) => {
    const now = new Date();
    const startDate = new Date(session.startDate);
    const endDate = new Date(session.endDate);
    
    return session.isActive && now >= startDate && now <= endDate;
  };

  const getSessionStatusBadge = (session) => {
    if (!session.isActive) {
      return <Badge variant="outline">Inactive</Badge>;
    }
    
    const now = new Date();
    const startDate = new Date(session.startDate);
    const endDate = new Date(session.endDate);
    
    if (now < startDate) {
      return <Badge className="bg-yellow-100 text-yellow-800">Upcoming</Badge>;
    } else if (now > endDate) {
      return <Badge className="bg-gray-100 text-gray-800">Expired</Badge>;
    } else {
      return <Badge className="bg-green-100 text-green-800">Active</Badge>;
    }
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Assessment Management</h1>
        
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Assessment
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Assessment</DialogTitle>
              <DialogDescription>
                Set up a new assessment session for students
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Assessment Name</Label>
                <Input
                  id="name"
                  placeholder="Mid-Term Assessment"
                  value={newSession.name}
                  onChange={(e) => setNewSession({...newSession, name: e.target.value})}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Start Date</Label>
                  <DatePicker
                    date={newSession.startDate}
                    setDate={(date) => setNewSession({...newSession, startDate: date})}
                  />
                </div>
                <div className="grid gap-2">
                  <Label>End Date</Label>
                  <DatePicker
                    date={newSession.endDate}
                    setDate={(date) => setNewSession({...newSession, endDate: date})}
                  />
                </div>
              </div>
              
              <div className="grid gap-2">
                <Label>Topics</Label>
                <div className="border rounded-md p-3 max-h-[200px] overflow-y-auto">
                  <div className="space-y-2">
                    {topics.map((topic) => (
                      <div key={topic.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`topic-${topic.id}`}
                          checked={selectedTopics[topic.id] || false}
                          onCheckedChange={(checked) => {
                            setSelectedTopics({
                              ...selectedTopics,
                              [topic.id]: checked
                            });
                          }}
                        />
                        <label
                          htmlFor={`topic-${topic.id}`}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {topic.name}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isActive"
                  checked={newSession.isActive}
                  onCheckedChange={(checked) => {
                    setNewSession({...newSession, isActive: !!checked});
                  }}
                />
                <label
                  htmlFor="isActive"
                  className="text-sm font-medium leading-none"
                >
                  Publish immediately
                </label>
              </div>
            </div>
            
            <DialogFooter>
              <Button onClick={handleCreateSession}>Create Assessment</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Assessment Sessions</CardTitle>
          <CardDescription>
            Manage assessment sessions for students
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          ) : assessmentSessions.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No assessment sessions found</p>
              <p className="text-sm text-gray-400 mt-1">Create your first assessment session to get started</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Topics</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Submissions</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {assessmentSessions.map((session) => (
                  <TableRow key={session.id}>
                    <TableCell className="font-medium">{session.name}</TableCell>
                    <TableCell>
                      <div className="flex items-center text-sm">
                        <Calendar className="h-4 w-4 mr-1" />
                        {format(new Date(session.startDate), 'dd MMM')} - {format(new Date(session.endDate), 'dd MMM yyyy')}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {session.topicIds && session.topicIds.map((topicId) => {
                          const topic = topics.find(t => t.id === topicId);
                          return topic ? (
                            <Badge variant="outline" key={topicId} className="text-xs">
                              {topic.name}
                            </Badge>
                          ) : null;
                        })}
                      </div>
                    </TableCell>
                    <TableCell>
                      {getSessionStatusBadge(session)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <span className="font-medium mr-1">
                          {session.evaluations?.length || 0}
                        </span>
                        {session.evaluations?.length > 0 && (
                          <Button
                            variant="link"
                            className="p-0 h-auto text-blue-600"
                            onClick={() => handleViewResults(session.id)}
                          >
                            View
                          </Button>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button 
                          variant="outline" 
                          size="icon"
                          onClick={() => handleToggleActive(session)}
                        >
                          {session.isActive ? (
                            <XCircle className="h-4 w-4 text-red-500" />
                          ) : (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          )}
                        </Button>
                        <Button 
                          variant="outline" 
                          size="icon"
                          onClick={() => handleDeleteSession(session.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 