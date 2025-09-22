import { NextResponse } from "next/server"

// Simple test endpoint to verify API connectivity
export async function GET() {
  return NextResponse.json({
    status: "success",
    message: "Authentication test endpoint is working",
    timestamp: new Date().toISOString(),
  })
}