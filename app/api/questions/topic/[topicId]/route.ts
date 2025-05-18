import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ topicId: string }> }
) {
  try {
    const { topicId } = await context.params;
    
    // Make a request to the backend API
    const response = await axios.get(
      `${process.env.BACKEND_API_URL || 'https://0dd7-2401-4900-1cd7-672e-f883-6669-8e54-fbef.ngrok-free.app'}/questions/topic/${topicId}`,
      {
        headers: {
          // Forward authorization if present
          Authorization: request.headers.get("Authorization") || "",
        },
      }
    );

    // Return the data from the backend
    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error("Error fetching questions by topic:", error.message);
    
    // Return appropriate error response based on status code
    return new NextResponse(
      JSON.stringify({
        message: error.response?.data?.message || "Failed to fetch questions by topic",
      }),
      {
        status: error.response?.status || 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
} 