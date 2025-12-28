
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const mockJobs = [
  {
    title: "Senior Mimar",
    description: "Konut ve ticari projelerde deneyimli senior mimar arayışımız bulunmaktadır. AutoCAD, Revit ve SketchUp bilgisi zorunludur.",
    requirements: "Mimarlık fakültesi mezunu, En az 5 yıl deneyim, AutoCAD, Revit, SketchUp bilgisi, Proje yönetimi deneyimi, İyi seviyede İngilizce",
    job_type: "Tam Zamanlı",
    location: "İstanbul, Türkiye",
    salary_min: 15000,
    salary_max: 25000,
    category: "Mimarlık",
    experience_level: "Senior (5-8)",
    remote_allowed: false,
    featured: true,
    status: 'active'
  },
  {
    title: "İç Mimar",
    description: "Yaratıcı ve yenilikçi iç mimari projelerinde yer almak isteyen iç mimar arıyoruz. Konut ve ticari projelerde çalışma fırsatı.",
    requirements: "İç Mimarlık mezunu, 2-5 yıl deneyim, 3ds Max, V-Ray bilgisi, Photoshop, Illustrator, Yaratıcı düşünce",
    job_type: "Tam Zamanlı",
    location: "Ankara, Türkiye",
    salary_min: 8000,
    salary_max: 15000,
    category: "İç Mimari",
    experience_level: "Mid Level (2-5)",
    remote_allowed: true,
    featured: false,
    status: 'active'
  },
  {
    title: "Proje Yöneticisi",
    description: "Büyük ölçekli inşaat projelerini yönetecek deneyimli proje yöneticisi arayışımız bulunmaktadır.",
    requirements: "İnşaat Mühendisliği veya Mimarlık mezunu, En az 8 yıl proje yönetimi deneyimi, PMP sertifikası tercih edilir, Liderlik becerileri, MS Project bilgisi",
    job_type: "Tam Zamanlı",
    location: "İzmir, Türkiye",
    salary_min: 20000,
    salary_max: 35000,
    category: "İnşaat",
    experience_level: "Expert (8+)",
    remote_allowed: false,
    featured: true,
    status: 'active'
  },
  {
    title: "Junior Mimar",
    description: "Kariyerine yeni başlayan ve öğrenmeye açık junior mimar arayışımız bulunmaktadır. Mentorluk desteği sağlanacaktır.",
    requirements: "Mimarlık fakültesi mezunu, 0-2 yıl deneyim, AutoCAD bilgisi, Öğrenmeye açık, Takım çalışmasına uygun",
    job_type: "Tam Zamanlı",
    location: "Bursa, Türkiye",
    salary_min: 6000,
    salary_max: 10000,
    category: "Mimarlık",
    experience_level: "Entry Level (0-2)",
    remote_allowed: false,
    featured: false,
    status: 'active'
  },
  {
    title: "Peyzaj Mimarı",
    description: "Otel ve resort projelerinde peyzaj tasarımı yapacak deneyimli peyzaj mimarı arıyoruz.",
    requirements: "Peyzaj Mimarlığı mezunu, 3-6 yıl deneyim, AutoCAD, Lumion bilgisi, Bitki bilgisi, Yaratıcı yaklaşım",
    job_type: "Yarı Zamanlı",
    location: "Antalya, Türkiye",
    salary_min: 10000,
    salary_max: 18000,
    category: "Peyzaj",
    experience_level: "Mid Level (2-5)",
    remote_allowed: true,
    featured: false,
    status: 'active'
  },
  {
    title: "BIM Uzmanı",
    description: "BIM teknolojileri konusunda uzman, Revit ve Navisworks bilgisine sahip uzman arayışımız bulunmaktadır.",
    requirements: "Mimarlık veya İnşaat Mühendisliği mezunu, 4-7 yıl BIM deneyimi, Revit, Navisworks bilgisi, BIM koordinasyonu deneyimi, Teknik İngilizce",
    job_type: "Sözleşmeli",
    location: "İstanbul, Türkiye",
    salary_min: 18000,
    salary_max: 28000,
    category: "Teknoloji",
    experience_level: "Senior (5-8)",
    remote_allowed: true,
    featured: true,
    status: 'active'
  }
];

async function main() {
  console.log('Seeding jobs...');

  // Find a user to assign jobs to
  let user = await prisma.users.findFirst({
    where: { user_type: 'firm' }
  });

  if (!user) {
    // try any user
    user = await prisma.users.findFirst();
  }

  if (!user) {
    // create a mock user
    user = await prisma.users.create({
      data: {
        email: 'mockfirm@example.com',
        password_hash: 'hashedpassword',
        first_name: 'Mock',
        last_name: 'Firm',
        user_type: 'firm',
        company_name: 'Mock Architectural Studio',
        is_active: true
      }
    });
    console.log('Created mock firm user');
  } else {
    console.log(`Using existing user: ${user.email}`);
  }

  for (const job of mockJobs) {
    await prisma.jobs.create({
      data: {
        ...job,
        employer_id: user.id
      }
    });
  }

  console.log('Jobs seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
