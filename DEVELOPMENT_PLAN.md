# Mimariproje.com - Geliştirme Planı

## Proje Özeti

Mimariproje.com, Türkiye'deki mimarlık firmaları ile serbest çalışan mimarları bir araya getiren, online mimarlık hizmetleri sunan bir platformdur. Platform, mimarlık firmalarının profillerini oluşturup yaptıkları işleri sergileyebileceği, kullanıcıların online proje satışı yapabileceği, müşteri ve freelancer'ların mesajlaşabileceği bir sistemdir.

## Teknoloji Stack

- **Frontend:** Next.js 14 + TypeScript + Tailwind CSS + Shadcn UI
- **Backend:** Node.js + TypeScript + Express.js + Prisma ORM
- **Veritabanı:** PostgreSQL
- **Authentication:** JWT (Access + Refresh Token)
- **Payment:** iyzico
- **File Storage:** Local Storage / AWS S3 (gelecekte)
- **Real-time:** Socket.io (WebSocket)
- **Deployment:** Docker + CI/CD

## Mevcut Altyapı Durumu

### ✅ Tamamlanan Bileşenler

#### Backend
- [x] Node.js + TypeScript + Express.js kurulumu
- [x] Prisma ORM yapılandırması
- [x] PostgreSQL veritabanı bağlantısı
- [x] JWT authentication (temel)
- [x] User CRUD operations
- [x] Project CRUD operations
- [x] Job CRUD operations
- [x] Message/Conversation sistem
- [x] Notification sistem
- [x] Payment model (temel yapı)
- [x] File upload sistemi
- [x] Socket.io kurulumu

#### Frontend
- [x] Next.js 14 App Router kurulumu
- [x] Tailwind CSS + Shadcn UI
- [x] Authentication sayfaları (login/register)
- [x] Dashboard temel yapısı
- [x] Proje listeleme sayfaları
- [x] İş ilanları sayfaları
- [x] Mesajlaşma arayüzü
- [x] Bildirimler paneli
- [x] Profil sayfaları
- [x] Header/Footer
- [x] Dark/Light theme

#### Veritabanı Tabloları (Mevcut)
- [x] users
- [x] projects
- [x] project_images
- [x] jobs
- [x] job_applications
- [x] conversations
- [x] messages
- [x] notifications
- [x] notification_preferences
- [x] payments
- [x] invoices
- [x] subscriptions
- [x] admin_users
- [x] admin_logs
- [x] system_settings

---

## Geliştirme Fazları

### Faz 0: Kritik Düzeltmeler (1 Hafta) ⚡ ÖNCELIK: KRİTİK

**Hedef:** Güvenlik açıklarını kapatmak ve temel eksiklikleri gidermek

#### Backend Güvenlik
- [ ] Helmet.js middleware ekleme (HTTP security headers)
- [ ] Rate limiting middleware (express-rate-limit)
- [ ] CORS yapılandırmasını gözden geçirme
- [ ] Input validation güçlendirme (zod)
- [ ] Refresh token mekanizması

#### Authentication Düzeltmeleri
- [ ] Refresh token implementasyonu
- [ ] Token blacklist (logout için)
- [ ] Account lockout (başarısız giriş denemesi)

### Faz 1: Authentication Tamamlama (1-2 Hafta) ÖNCELIK: YÜKSEK

#### Backend Geliştirmeleri
- [ ] Password reset (e-posta ile) implementasyonu
- [ ] Email verification sistemi
- [ ] Password strength validation
- [ ] Rate limiting for auth endpoints

#### Frontend Geliştirmeleri
- [ ] Şifre sıfırlama sayfası (/auth/sifre-sifirlama)
- [ ] E-posta doğrulama sayfası (/auth/dogrulama)
- [ ] Token refresh logic in AuthContext
- [ ] "Beni hatırla" checkbox

#### Yeni Veritabanı Tabloları
- [ ] password_reset_tokens
- [ ] email_verification_tokens

### Faz 2: Core Features (2-3 Hafta) ÖNCELIK: YÜKSEK

#### Review & Rating System
- [ ] reviews tablosu oluşturma
- [ ] Backend: Review CRUD endpoints
- [ ] Frontend: Review component ve sayfaları
- [ ] Rating agregasyonu (ortalama hesaplama)

#### Portfolio System
- [ ] portfolio_items tablosu oluşturma
- [ ] Backend: Portfolio CRUD endpoints
- [ ] Frontend: Portföy düzenleme sayfası
- [ ] Görsel galeri yönetimi

#### Favorites System
- [ ] favorites tablosu oluşturma
- [ ] Backend: Favorites API
- [ ] Frontend: Favori butonu ve /favorilerim sayfası

#### Tags & Skills System
- [ ] tags tablosu
- [ ] project_tags tablosu
- [ ] user_skills tablosu
- [ ] Backend: Tags API
- [ ] Frontend: Etiket seçici component

### Faz 3: Payment & Monetization (2-3 Hafta) ÖNCELIK: YÜKSEK

**Hedef:** Platform gelir modelini implement etmek

#### iyzico Entegrasyonu
- [ ] iyzico sandbox hesabı kurulumu
- [ ] Payment intent creation
- [ ] 3D Secure flow
- [ ] Callback/webhook handling
- [ ] Refund işlemleri

#### Komisyon Sistemi (%10-15)
- [ ] escrow_transactions tablosu
- [ ] Emanet hesap mantığı
- [ ] Otomatik komisyon hesaplama
- [ ] Satıcıya ödeme transfer sistemi

#### İş İlanı Paketleri
- [ ] job_packages tablosu
- [ ] user_job_packages tablosu
- [ ] Paket satın alma flow
- [ ] İlan sayısı takibi

#### Premium Üyelik
- [ ] Subscription plan detayları
- [ ] Öne çıkarma sistemi
- [ ] Premium özellikler aktivasyonu

### Faz 4: Advanced Search & Discovery (1-2 Hafta) ÖNCELIK: ORTA

- [ ] Full-text search (PostgreSQL tsvector)
- [ ] Auto-complete/suggestions
- [ ] Gelişmiş filtreler (konum, fiyat, kategori, beceri)
- [ ] Search result caching
- [ ] Kaydedilmiş aramalar

### Faz 5: Admin Panel & Analytics (1-2 Hafta) ÖNCELIK: ORTA

#### Admin Dashboard
- [ ] User management (ban, verify, promote)
- [ ] Content moderation queue
- [ ] Payment/transaction overview
- [ ] System health metrics

#### Analytics
- [ ] User registration trends
- [ ] Project/job posting metrics
- [ ] Revenue tracking
- [ ] Popular searches dashboard

### Faz 6: Internationalization (1 Hafta) ÖNCELIK: DÜŞÜK

- [ ] next-intl kurulumu
- [ ] Türkçe çevirileri (varsayılan)
- [ ] İngilizce çevirileri
- [ ] Çince çevirileri (opsiyonel)
- [ ] Dil seçici UI

### Faz 7: Testing & Deployment (1-2 Hafta) ÖNCELIK: YÜKSEK

#### Testing
- [ ] Jest/Vitest unit tests (backend)
- [ ] Playwright/Cypress E2E tests
- [ ] API integration tests
- [ ] Load testing

#### Deployment
- [ ] Docker Compose production config
- [ ] CI/CD pipeline (GitHub Actions)
- [ ] SSL/TLS setup
- [ ] CDN yapılandırması
- [ ] Monitoring (Sentry, logs)

---

## Yeni Veritabanı Şeması

### Eklenecek Tablolar

```sql
-- Reviews (Değerlendirme sistemi)
CREATE TABLE reviews (
  id SERIAL PRIMARY KEY,
  reviewer_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  reviewed_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  project_id INTEGER REFERENCES projects(id) ON DELETE SET NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  is_visible BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Portfolio Items
CREATE TABLE portfolio_items (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  category VARCHAR(100),
  completion_date DATE,
  client_name VARCHAR(200),
  is_featured BOOLEAN DEFAULT false,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Portfolio Images
CREATE TABLE portfolio_images (
  id SERIAL PRIMARY KEY,
  portfolio_item_id INTEGER REFERENCES portfolio_items(id) ON DELETE CASCADE,
  image_url VARCHAR(500) NOT NULL,
  alt_text VARCHAR(200),
  is_primary BOOLEAN DEFAULT false,
  order_index INTEGER DEFAULT 0
);

-- Favorites
CREATE TABLE favorites (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, project_id)
);

-- Tags
CREATE TABLE tags (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  category VARCHAR(50), -- skill, project_type, style
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Project Tags
CREATE TABLE project_tags (
  project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
  tag_id INTEGER REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (project_id, tag_id)
);

-- User Skills
CREATE TABLE user_skills (
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  tag_id INTEGER REFERENCES tags(id) ON DELETE CASCADE,
  proficiency_level VARCHAR(50), -- beginner, intermediate, expert
  PRIMARY KEY (user_id, tag_id)
);

-- Escrow Transactions
CREATE TABLE escrow_transactions (
  id SERIAL PRIMARY KEY,
  project_id INTEGER REFERENCES projects(id),
  buyer_id INTEGER REFERENCES users(id),
  seller_id INTEGER REFERENCES users(id),
  amount DECIMAL(10,2) NOT NULL,
  commission_rate DECIMAL(4,2) NOT NULL,
  commission_amount DECIMAL(10,2) NOT NULL,
  seller_amount DECIMAL(10,2) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending', -- pending, released, refunded, disputed
  payment_id INTEGER REFERENCES payments(id),
  created_at TIMESTAMP DEFAULT NOW(),
  released_at TIMESTAMP,
  disputed_at TIMESTAMP,
  resolved_at TIMESTAMP
);

-- Job Packages
CREATE TABLE job_packages (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  job_count INTEGER NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  validity_days INTEGER DEFAULT 365,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- User Job Packages
CREATE TABLE user_job_packages (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  package_id INTEGER REFERENCES job_packages(id),
  remaining_jobs INTEGER NOT NULL,
  purchased_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP NOT NULL
);

-- Password Reset Tokens
CREATE TABLE password_reset_tokens (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  token VARCHAR(255) UNIQUE NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  used_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Email Verification Tokens
CREATE TABLE email_verification_tokens (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  token VARCHAR(255) UNIQUE NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  verified_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Refresh Tokens
CREATE TABLE refresh_tokens (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  token VARCHAR(500) UNIQUE NOT NULL,
  device_info VARCHAR(500),
  ip_address VARCHAR(45),
  expires_at TIMESTAMP NOT NULL,
  revoked_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## API Endpoints (Eklenecek)

### Authentication
```
POST /api/auth/refresh          - Token yenileme
POST /api/auth/forgot-password  - Şifre sıfırlama isteği
POST /api/auth/reset-password   - Yeni şifre belirleme
POST /api/auth/verify-email     - E-posta doğrulama
POST /api/auth/resend-verification - Doğrulama e-postası tekrar gönder
```

### Reviews
```
GET    /api/reviews/:userId     - Kullanıcı değerlendirmeleri
POST   /api/reviews             - Değerlendirme ekle
PUT    /api/reviews/:id         - Değerlendirme güncelle
DELETE /api/reviews/:id         - Değerlendirme sil
```

### Favorites
```
GET    /api/favorites           - Favorileri listele
POST   /api/favorites           - Favorilere ekle
DELETE /api/favorites/:projectId - Favorilerden çıkar
```

### Portfolio
```
GET    /api/portfolio/:userId   - Portföy öğeleri
POST   /api/portfolio           - Portföy öğesi ekle
PUT    /api/portfolio/:id       - Portföy öğesi güncelle
DELETE /api/portfolio/:id       - Portföy öğesi sil
```

### Payments (Genişletilmiş)
```
POST /api/payments/create-intent    - Ödeme başlat
POST /api/payments/confirm          - Ödeme onayla (3D Secure sonrası)
POST /api/payments/webhook          - iyzico callback
GET  /api/payments/escrow/:id       - Emanet durumu
POST /api/payments/release/:id      - Emanet serbest bırak
POST /api/payments/dispute/:id      - Anlaşmazlık bildir
```

### Search
```
GET /api/search/projects        - Proje araması
GET /api/search/users           - Kullanıcı araması
GET /api/search/jobs            - İş ilanı araması
GET /api/search/suggestions     - Arama önerileri
```

---

## Güvenlik Gereksinimleri

### Authentication
- [x] JWT token based authentication
- [ ] Refresh token mechanism
- [x] Password hashing (bcrypt)
- [ ] Email verification
- [ ] Password reset functionality
- [ ] Account lockout after 5 failed attempts

### Authorization
- [x] Role-based access control (user, admin, premium)
- [x] Resource ownership validation
- [ ] API rate limiting (100 req/min)
- [x] Input validation (zod)

### Data Protection
- [x] SQL injection prevention (Prisma ORM)
- [x] XSS protection (React default)
- [ ] CSRF protection
- [ ] Sensitive data encryption
- [ ] KVKK compliance

---

## Success Metrics

### Technical Metrics
- Page load time < 3 seconds
- API response time < 500ms
- 99.9% uptime
- Zero critical security vulnerabilities

### Business Metrics
- User registration rate
- Project posting rate
- Job application rate
- Payment success rate
- User retention rate
- Platform commission revenue

---

## Timeline

### Hafta 1-2: Faz 0 + Faz 1
- Security fixes
- Authentication tamamlama

### Hafta 3-4: Faz 2
- Review sistemi
- Portfolio sistemi
- Favorites sistemi

### Hafta 5-6: Faz 3
- iyzico entegrasyonu
- Komisyon sistemi
- Paket sistemi

### Hafta 7-8: Faz 4 + Faz 5
- Advanced search
- Admin panel

### Hafta 9: Faz 6 + Faz 7
- i18n (opsiyonel)
- Testing & Deployment

---

## Next Steps

1. **Hemen Yapılacak:**
   - Helmet.js ve rate limiting ekleme
   - Refresh token implementasyonu

2. **Bu Hafta:**
   - Password reset flow
   - Email verification
   - Yeni veritabanı tabloları

3. **Gelecek Hafta:**
   - Review sistemi
   - iyzico sandbox entegrasyonu
