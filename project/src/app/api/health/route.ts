import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:5000";

export async function GET(request: NextRequest) {
  try {
    // Backend'e yönlendir
    const backendUrl = `${BACKEND_URL}/api/health`;

    try {
      const response = await fetch(backendUrl);

      if (!response.ok) {
        throw new Error(`Backend error: ${response.status}`);
      }

      const data = await response.json();
      return NextResponse.json({
        ...data,
        frontend: "OK",
        backend_connection: "OK",
      });
    } catch (backendError) {
      console.warn("Backend'e bağlanılamıyor:", backendError);

      return NextResponse.json({
        status: "success",
        message: "Frontend API çalışıyor",
        frontend: "OK",
        backend_connection: "FAILED",
        fallback_mode: true,
      });
    }
  } catch (error) {
    console.error("Health check hatası:", error);
    return NextResponse.json(
      {
        status: "error",
        message: "Health check failed",
        frontend: "ERROR",
      },
      { status: 500 }
    );
  }
}
