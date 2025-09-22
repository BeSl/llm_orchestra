import { NextResponse } from "next/server"

export async function GET() {
  // Mock health check endpoint
  return NextResponse.json({
    status: "healthy",
    uptime: Math.floor(process.uptime()),
    version: "1.0.0",
    timestamp: new Date().toISOString(),
  })
}
