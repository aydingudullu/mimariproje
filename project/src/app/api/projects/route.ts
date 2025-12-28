import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:5000";

export async function GET(request: NextRequest) {
  console.log("GET /api/projects called");

  try {
    const { searchParams } = new URL(request.url);
    const backendUrl = `${BACKEND_URL}/api/projects?${searchParams.toString()}`;

    try {
      const response = await fetch(backendUrl);

      if (!response.ok) {
        throw new Error(`Backend error: ${response.status}`);
      }

      const data = await response.json();
      return NextResponse.json(data);
    } catch (backendError) {
      console.warn(
        "Backend'e bağlanılamıyor, mock data döndürülüyor:",
        backendError
      );

      // Mock data
      const mockProjects = [
        {
          id: 1,
          title: "Modern Villa Tasarımı",
          description: "Lüks ve modern villa tasarımı",
          category: "residential",
          price: 150000.0,
          location: "İstanbul, Beşiktaş",
          area: 450.0,
          style: "modern",
          specializations: ["Villa", "Modern", "Lüks"],
          images: [],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          user: {
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
            full_name: "Admin User",
          },
        },
      ];

      return NextResponse.json({
        projects: mockProjects,
        pagination: {
          page: 1,
          per_page: 12,
          total: mockProjects.length,
          pages: 1,
          has_next: false,
          has_prev: false,
        },
      });
    }
  } catch (error) {
    console.error("Projeler getirme hatası:", error);
    return NextResponse.json(
      { error: "Projeler yüklenirken bir hata oluştu" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  console.log("POST /api/projects called");

  try {
    const formData = await request.formData();

    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const category = formData.get("category") as string;
    const price = formData.get("price") as string;
    const location = formData.get("location") as string;
    const area = formData.get("area") as string;
    const style = formData.get("style") as string;
    const specializations = formData.get("specializations") as string;

    console.log("Form data received:", { title, description, category, price });

    if (!title || !description || !category || !price) {
      return NextResponse.json(
        { error: "Gerekli alanlar eksik" },
        { status: 400 }
      );
    }

    const projectData: any = {
      title: title.trim(),
      description: description.trim(),
      category: category.trim(),
      price: parseFloat(price) || 0,
    };

    if (location?.trim()) projectData.location = location.trim();
    if (area && area.trim()) projectData.area = area.toString();
    if (style?.trim()) projectData.style = style.trim();
    if (specializations) {
      try {
        projectData.tags = JSON.parse(specializations);
      } catch (e) {
        projectData.tags = [];
      }
    }

    const backendUrl = `${BACKEND_URL}/api/projects`;

    // Get auth token from request headers or cookies
    const authHeader = request.headers.get("authorization");
    const cookieToken = request.cookies.get("mimariproje_access_token")?.value;
    const token = authHeader || (cookieToken ? `Bearer ${cookieToken}` : null);

    console.log("Sending to backend:", backendUrl);
    console.log("Payload:", JSON.stringify(projectData));

    if (!token) {
      return NextResponse.json(
        { error: "Yetkilendirme gerekli" },
        { status: 401 }
      );
    }

    try {
      const response = await fetch(backendUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": token,
        },
        body: JSON.stringify(projectData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Backend error response:", errorText);
        let errorData = {};
        try {
          errorData = JSON.parse(errorText);
        } catch (e) {
          errorData = { error: errorText };
        }
        
        return NextResponse.json(
           errorData,
          { status: response.status }
        );
      }

      const result = await response.json();
      return NextResponse.json(result, { status: 201 });
    } catch (backendError) {
      console.warn(
        "Backend'e bağlanılamıyor, mock response döndürülüyor:",
        backendError
      );

      // Mock response
      const mockProject = {
        id: Date.now(),
        title: title.trim(),
        description: description.trim(),
        category: category.trim(),
        price: parseFloat(price) || 0,
        location: location?.trim() || "",
        area: parseFloat(area) || 0,
        style: style?.trim() || "",
        specializations: specializations ? JSON.parse(specializations) : [],
        images: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        user: {
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
          full_name: "Admin User",
        },
      };

      return NextResponse.json(
        {
          message: "Proje başarıyla eklendi (mock data)",
          project: mockProject,
        },
        { status: 201 }
      );
    }
  } catch (error) {
    console.error("Proje ekleme hatası:", error);
    return NextResponse.json(
      { error: "Proje eklenirken bir hata oluştu" },
      { status: 500 }
    );
  }
}
