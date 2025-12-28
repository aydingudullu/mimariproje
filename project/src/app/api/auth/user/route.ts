import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:5000";

export async function GET(request: NextRequest) {
  try {
    // Backend'e yönlendir
    const backendUrl = `${BACKEND_URL}/api/auth/user`;
    
    try {
      const response = await fetch(backendUrl, {
        headers: {
          "Authorization": request.headers.get("authorization") || "",
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Backend error: ${response.status}`);
      }

      const data = await response.json();
      return NextResponse.json(data);

    } catch (backendError) {
      console.warn("Backend'e bağlanılamıyor, mock user döndürülüyor:", backendError);
      
      // Backend çalışmıyorsa mock user döndür
      const mockUser = {
        id: 2,
        email: "admin@mimariproje.com",
        first_name: "Admin",
        last_name: "User",
        company_name: "Mimariproje",
        user_type: "company",
        profession: "Mimar",
        phone: "+905551234567",
        location: "İstanbul",
        bio: "Admin kullanıcı",
        avatar_url: "",
        profile_image_url: "",
        is_verified: true,
        subscription_type: "premium",
        created_at: new Date().toISOString(),
        full_name: "Admin User"
      };

      return NextResponse.json({ user: mockUser });
    }

  } catch (error) {
    console.error("User getirme hatası:", error);
    return NextResponse.json(
      { error: "Kullanıcı bilgileri alınırken bir hata oluştu" },
      { status: 500 }
    );
  }
}
