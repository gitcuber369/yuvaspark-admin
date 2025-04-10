import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

export async function GET(request: NextRequest) {
  try {
    // Get query parameters
    const url = new URL(request.url);
    const topic = url.searchParams.get("topic");
    const search = url.searchParams.get("search");
    
    // Build query string
    const queryParams = new URLSearchParams();
    if (topic) queryParams.append("topic", topic);
    if (search) queryParams.append("search", search);
    
    // Make request to the backend
    const backendUrl = `${process.env.BACKEND_API_URL || 'http://localhost:3000'}/questions`;
    const finalUrl = queryParams.toString() 
      ? `${backendUrl}?${queryParams.toString()}` 
      : backendUrl;
    
    const response = await axios.get(finalUrl, {
      headers: {
        // Forward authorization if present
        Authorization: request.headers.get("Authorization") || "",
      },
    });

    // Return the data
    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error("Error fetching questions:", error.message);
    
    return new NextResponse(
      JSON.stringify({
        message: error.response?.data?.message || "Failed to fetch questions",
      }),
      {
        status: error.response?.status || 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
} 