import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    console.log(`API route handler: Fetching question details for id: ${id}`);
    
    // Make a request to the backend API
    const backendUrl = `${process.env.BACKEND_API_URL || 'http://localhost:3000'}/questions/${id}`;
    console.log(`Making request to backend URL: ${backendUrl}`);
    
    const response = await axios.get(
      backendUrl,
      {
        headers: {
          // Forward authorization if present
          Authorization: request.headers.get("Authorization") || "",
        },
      }
    );

    console.log(`Received response from backend:`, response.data);
    // Return the data from the backend
    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error("Error fetching question details:", error.message);
    console.error("Full error:", error);
    
    // Return appropriate error response based on status code
    return new NextResponse(
      JSON.stringify({
        message: error.response?.data?.message || "Failed to fetch question details",
      }),
      {
        status: error.response?.status || 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
} 