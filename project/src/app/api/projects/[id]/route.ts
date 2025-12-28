import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:5000";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  console.log(`[Proxy] GET request for ID: ${params.id}`);

  try {
    const backendUrl = `${BACKEND_URL}/api/projects/${params.id}`;
    
    // Auth header varsa al
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    const authHeader = request.headers.get('authorization');
    if (authHeader) headers['Authorization'] = authHeader;

    const response = await fetch(backendUrl, { headers });
    console.log(`[Proxy] Backend Response Status: ${response.status}`);

    // Hata kontrolü
    if (!response.ok) {
        let errorData = { message: "Backend error" };
        try { errorData = await response.json(); } catch {}
        console.error(`[Proxy] Backend Error Body:`, errorData);
        return NextResponse.json(errorData, { status: response.status });
    }

    const data = await response.json();

    // Data transformation (backend response -> frontend expectation)
    if (data.success && data.data && data.data.project) {
        const p = data.data.project;
        
        // 1. project_images -> images
        p.images = p.project_images ? p.project_images.map((img: any) => img.image_url) : (p.images || []);
        
        // 2. users -> user 
        if (p.users && !p.user) {
            p.user = p.users;
        }

        // 3. Price conversation (String -> Number) to prevent calculation errors
        if (p.price && typeof p.price === 'string') {
            p.price = Number(p.price);
        }

        // 4. Missing fields fallback (Prevent frontend crash due to missing DB fields)
        if (!p.specifications) {
            p.specifications = {
                totalArea: p.area || "-",
                buildingArea: "-",
                gardenArea: "-",
                floors: "-",
                rooms: "-",
                bathrooms: "-",
                garage: "-",
                features: []
            };
        }
        if (!p.deliverables) p.deliverables = [];
        if (!p.tags) p.tags = [];
        if (!p.reviews) p.reviews = [];
        if (!p.license) {
             p.license = {
                 type: "Standart",
                 description: "Lisans bilgisi bulunamadı.",
                 modifications: "-",
                 resale: "-"
             };
        }
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Proxy GET error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
  ) {
    try {
      const backendUrl = `${BACKEND_URL}/api/projects/${params.id}`;
      
      const headers: HeadersInit = { 'Content-Type': 'application/json' };
      const authHeader = request.headers.get('authorization');
      if (authHeader) headers['Authorization'] = authHeader;
  
      const response = await fetch(backendUrl, { method: 'DELETE', headers });
  
      if (!response.ok) {
          let errorData;
          try { errorData = await response.json(); } catch {}
          return NextResponse.json(errorData || { error: 'Delete failed' }, { status: response.status });
      }
  
      const data = await response.json();
      return NextResponse.json(data);
    } catch (error) {
      return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
  }
