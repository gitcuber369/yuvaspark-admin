"use client";

import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Copy, CheckCircle } from "lucide-react";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function ApiDocsPage() {
  const router = useRouter();
  const [copiedEndpoint, setCopiedEndpoint] = useState<string | null>(null);

  const copyToClipboard = (text: string, endpoint: string) => {
    navigator.clipboard.writeText(text);
    setCopiedEndpoint(endpoint);
    setTimeout(() => setCopiedEndpoint(null), 2000);
  };

  const CodeBlock = ({
    code,
    language = "json",
    endpoint,
  }: {
    code: string;
    language?: string;
    endpoint: string;
  }) => (
    <div className="relative">
      <pre className="bg-gray-900 text-gray-100 p-4 rounded-md overflow-x-auto">
        <code className={`language-${language}`}>{code}</code>
      </pre>
      <Button
        variant="ghost"
        size="sm"
        className="absolute top-2 right-2 text-gray-400 hover:text-white"
        onClick={() => copyToClipboard(code, endpoint)}
      >
        {copiedEndpoint === endpoint ? (
          <CheckCircle className="h-4 w-4" />
        ) : (
          <Copy className="h-4 w-4" />
        )}
      </Button>
    </div>
  );

  return (
    <div className="container mx-auto py-4 sm:py-6 px-4 sm:px-6">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
        <Button
          variant="ghost"
          onClick={() => router.push("/admin/global-assessments")}
          className="w-full sm:w-auto"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <h1 className="text-xl sm:text-2xl font-bold">
          API Documentation for Mobile Integration
        </h1>
      </div>

      <div className="grid gap-4 sm:gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Overview</CardTitle>
            <CardDescription>
              Documentation for integrating mobile apps with the Global
              Assessment API
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm sm:text-base">
              This documentation provides details on how to integrate mobile
              apps with the Global Assessment API. Teachers can submit student
              responses to global assessments through these endpoints.
            </p>
          </CardContent>
        </Card>

        <Tabs defaultValue="submission" className="w-full">
          <TabsList className="w-full sm:w-auto flex flex-wrap">
            <TabsTrigger value="submission" className="flex-1 sm:flex-none">
              Student Submission
            </TabsTrigger>
            <TabsTrigger value="assessments" className="flex-1 sm:flex-none">
              List Assessments
            </TabsTrigger>
            <TabsTrigger value="anganwadis" className="flex-1 sm:flex-none">
              Anganwadi Details
            </TabsTrigger>
          </TabsList>
          <TabsContent value="submission">
            <Card>
              <CardHeader>
                <CardTitle>Record Student Submission</CardTitle>
                <CardDescription>
                  Submit a student's responses for a global assessment
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 sm:space-y-6">
                <div>
                  <h3 className="text-base sm:text-lg font-medium mb-2">
                    Endpoint
                  </h3>
                  <div className="overflow-x-auto">
                    <CodeBlock
                      endpoint="submission-endpoint"
                      code="POST /api/global-assessments/:assessmentId/student/:studentId"
                      language="bash"
                    />
                  </div>
                </div>

                <div>
                  <h3 className="text-base sm:text-lg font-medium mb-2">
                    Request Body
                  </h3>
                  <div className="overflow-x-auto">
                    <CodeBlock
                      endpoint="submission-body"
                      code={`{
  "teacherId": "teacher-uuid", 
  "anganwadiId": "anganwadi-uuid",
  "responses": [
    {
      "questionId": "question-uuid",
      "startTime": "2023-06-15T10:30:00Z",
      "endTime": "2023-06-15T10:31:30Z",
      "audioUrl": "https://example.com/audio.mp3" // Optional, will be uploaded by API
    },
    // ... more responses
  ]
}`}
                    />
                  </div>
                </div>

                <div>
                  <h3 className="text-base sm:text-lg font-medium mb-2">
                    Response
                  </h3>
                  <div className="overflow-x-auto">
                    <CodeBlock
                      endpoint="submission-response"
                      code={`{
  "message": "Student submission recorded successfully",
  "submission": {
    "id": "submission-uuid",
    "assessmentSessionId": "assessment-uuid",
    "anganwadiId": "anganwadi-uuid",
    "studentId": "student-uuid",
    "teacherId": "teacher-uuid",
    "submissionStatus": "COMPLETED",
    "submittedAt": "2023-06-15T10:35:00Z",
    "responses": [
      // Array of created responses
    ]
  }
}`}
                    />
                  </div>
                </div>

                <div className="bg-amber-50 p-4 rounded-md border border-amber-200">
                  <h3 className="text-amber-800 font-medium text-sm sm:text-base">
                    Important Note
                  </h3>
                  <p className="text-amber-700 text-xs sm:text-sm mt-1">
                    Student submissions are only created when teachers submit
                    responses through the mobile app. There are no pre-created
                    placeholders, so you must provide all required data in your
                    request.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="assessments">
            <Card>
              <CardHeader>
                <CardTitle>Get Active Assessments</CardTitle>
                <CardDescription>
                  List all active global assessments available for an anganwadi
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 sm:space-y-6">
                <div>
                  <h3 className="text-base sm:text-lg font-medium mb-2">
                    Endpoint
                  </h3>
                  <div className="overflow-x-auto">
                    <CodeBlock
                      endpoint="assessments-endpoint"
                      code="GET /api/global-assessments/active?anganwadiId=:anganwadiId"
                      language="bash"
                    />
                  </div>
                </div>

                <div>
                  <h3 className="text-base sm:text-lg font-medium mb-2">
                    Response
                  </h3>
                  <div className="overflow-x-auto">
                    <CodeBlock
                      endpoint="assessments-response"
                      code={`[
  {
    "id": "assessment-uuid",
    "name": "Term 1 Assessment 2023",
    "description": "First term assessment for all anganwadis",
    "startDate": "2023-06-01T00:00:00Z",
    "endDate": "2023-06-30T23:59:59Z",
    "isActive": true,
    "status": "PUBLISHED",
    "topics": [
      {
        "id": "topic-uuid",
        "name": "Basic Counting",
        "questions": [
          {
            "id": "question-uuid",
            "text": "Count from 1 to 10"
          },
          // ... more questions
        ]
      },
      // ... more topics
    ]
  },
  // ... more assessments
]`}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
                 
          <TabsContent value="anganwadis">
                      
            <Card>
              <CardHeader>
                <CardTitle>Get Anganwadi Details</CardTitle>
                <CardDescription>
                  Get details about an anganwadi and its students
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 sm:space-y-6">
                <div>
                  <h3 className="text-base sm:text-lg font-medium mb-2">
                    Endpoint
                  </h3>
                  <div className="overflow-x-auto">
                    <CodeBlock
                      endpoint="anganwadi-endpoint"
                      code="GET /api/anganwadis/:anganwadiId"
                      language="bash"
                    />
                  </div>
                </div>

                <div>
                  <h3 className="text-base sm:text-lg font-medium mb-2">
                    Response
                  </h3>
                  <div className="overflow-x-auto">
                    <CodeBlock
                      endpoint="anganwadi-response"
                      code={`{
  "id": "anganwadi-uuid",
  "name": "Anganwadi Center 1",
  "location": "Village 1, District A",
  "teacher": {
    "id": "teacher-uuid",
    "name": "Teacher Name"
  },
  "students": [
    {
      "id": "student-uuid",
      "name": "Student Name",
      "gender": "MALE",
      "status": "ACTIVE"
    },
    // ... more students
  ]
}`}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-800 text-base sm:text-lg">
              Implementation Guide
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 text-blue-700 text-sm sm:text-base">
              <p>
                <strong>Mobile App Implementation Steps:</strong>
              </p>
              <ol className="list-decimal pl-5 space-y-2">
                <li>Fetch active assessments for the teacher's anganwadi</li>
                <li>Display assessment details and questions to the teacher</li>
                <li>
                  Allow the teacher to select a student and record audio
                  responses
                </li>
                <li>Submit the student's responses to the API</li>
                <li>Track completion status for each assessment</li>
              </ol>
              <p className="mt-4">
                <strong>Important:</strong> Student submissions will only be
                tracked after the teacher submits them through your mobile app.
                This is a change from the previous workflow where student
                placeholders were created in advance.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
