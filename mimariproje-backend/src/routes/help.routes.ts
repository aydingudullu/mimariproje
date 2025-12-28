import { Router, Response } from 'express';

const router = Router();

interface HelpArticle {
  id: string;
  title: string;
  category: string;
  content: string;
  tags: string[];
}

// Help articles database (in production, store in database)
const helpArticles: HelpArticle[] = [
  {
    id: 'getting-started',
    title: 'Başlangıç Rehberi',
    category: 'genel',
    content: `
# Mimariproje.com'a Hoş Geldiniz

## Hesap Oluşturma
1. Ana sayfada "Kayıt Ol" butonuna tıklayın
2. E-posta adresinizi girin ve güçlü bir şifre oluşturun
3. E-posta adresinize gelen doğrulama linkine tıklayın
4. Profilinizi tamamlayın

## Profil Tamamlama
- Profesyonel bir profil fotoğrafı ekleyin
- Uzmanlık alanlarınızı belirtin
- Deneyim yıllarınızı girin
- Kısa bir biyografi yazın

## İlk Projenizi Ekleme
1. Profilim > Projelerim sayfasına gidin
2. "Yeni Proje Ekle" butonuna tıklayın
3. Proje detaylarını doldurun
4. Yüksek kaliteli görseller yükleyin
5. Projeyi yayınlayın
    `.trim(),
    tags: ['başlangıç', 'kayıt', 'profil'],
  },
  {
    id: 'uploading-projects',
    title: 'Proje Yükleme',
    category: 'projeler',
    content: `
# Proje Yükleme Rehberi

## Desteklenen Dosya Formatları
- Görseller: JPG, PNG, WebP
- Maksimum boyut: 10MB

## Proje Bilgileri
- **Başlık**: Kısa ve açıklayıcı olmalı
- **Açıklama**: Projenin detaylarını içermeli
- **Kategori**: Doğru kategori seçimi görünürlüğü artırır
- **Fiyat**: Rekabetçi ve adil olmalı

## İpuçları
- Yüksek çözünürlüklü görseller kullanın
- Farklı açılardan fotoğraflar ekleyin
- Teknik çizimleri dahil edin
- Proje hikayesini anlatın
    `.trim(),
    tags: ['proje', 'yükleme', 'görsel'],
  },
  {
    id: 'payments',
    title: 'Ödemeler ve Faturalama',
    category: 'odemeler',
    content: `
# Ödemeler ve Faturalama

## Ödeme Yöntemleri
- Kredi kartı / Banka kartı
- Güvenli ödeme altyapısı (iyzico)

## Fatura
- Her ödeme için otomatik fatura oluşturulur
- Faturalar Profilim > Ödemeler bölümünden indirilebilir

## İade Politikası
- Satın alımdan sonra 14 gün içinde iade talep edilebilir
- Dijital ürünlerin iadesi koşullara tabidir
    `.trim(),
    tags: ['ödeme', 'fatura', 'iade'],
  },
  {
    id: 'messaging',
    title: 'Mesajlaşma',
    category: 'iletisim',
    content: `
# Mesajlaşma Sistemi

## Yeni Mesaj Gönderme
1. Kullanıcının profiline gidin
2. "Mesaj Gönder" butonuna tıklayın
3. Mesajınızı yazın ve gönderin

## Dosya Paylaşımı
- Mesajlarda dosya paylaşabilirsiniz
- Desteklenen formatlar: Görseller, PDF

## Bildirimler
- Yeni mesajlar için e-posta bildirimi alırsınız
- Uygulama içi bildirimler anlık olarak görünür
    `.trim(),
    tags: ['mesaj', 'iletişim', 'dosya'],
  },
  {
    id: 'job-posting',
    title: 'İş İlanı Yayınlama',
    category: 'is-ilanlari',
    content: `
# İş İlanı Yayınlama

## İlan Oluşturma
1. İş İlanları sayfasına gidin
2. "İlan Oluştur" butonuna tıklayın
3. İş detaylarını doldurun
4. Bütçe aralığını belirtin
5. İlanı yayınlayın

## Başvuru Yönetimi
- Gelen başvuruları inceleyebilirsiniz
- Başvuru sahipleriyle mesajlaşabilirsiniz
- Başvuruları kabul veya reddetebilirsiniz
    `.trim(),
    tags: ['iş', 'ilan', 'başvuru'],
  },
  {
    id: 'account-security',
    title: 'Hesap Güvenliği',
    category: 'guvenlik',
    content: `
# Hesap Güvenliği

## Güçlü Şifre
- En az 8 karakter kullanın
- Büyük/küçük harf, rakam ve sembol içersin
- Diğer sitelerde kullandığınız şifreleri kullanmayın

## Şifre Değiştirme
1. Ayarlar sayfasına gidin
2. "Şifre Değiştir" seçeneğini tıklayın
3. Mevcut şifrenizi girin
4. Yeni şifrenizi iki kez girin

## Hesap Kurtarma
- Şifrenizi unuttuysanız "Şifremi Unuttum" linkini kullanın
- E-posta adresinize sıfırlama linki gönderilir
    `.trim(),
    tags: ['güvenlik', 'şifre', 'hesap'],
  },
];

// Categories
const categories = [
  { id: 'genel', name: 'Genel', icon: 'info' },
  { id: 'projeler', name: 'Projeler', icon: 'folder' },
  { id: 'odemeler', name: 'Ödemeler', icon: 'credit-card' },
  { id: 'iletisim', name: 'İletişim', icon: 'message-circle' },
  { id: 'is-ilanlari', name: 'İş İlanları', icon: 'briefcase' },
  { id: 'guvenlik', name: 'Güvenlik', icon: 'shield' },
];

/**
 * GET /api/help/articles
 * Tüm yardım makalelerini listele
 */
router.get('/articles', (req, res: Response) => {
  const category = req.query.category as string;
  
  let filtered = helpArticles;
  if (category) {
    filtered = helpArticles.filter(a => a.category === category);
  }

  res.json({
    success: true,
    data: {
      articles: filtered.map(a => ({
        id: a.id,
        title: a.title,
        category: a.category,
        tags: a.tags,
      })),
    },
  });
});

/**
 * GET /api/help/articles/:id
 * Makale detayı
 */
router.get('/articles/:id', (req, res: Response) => {
  const article = helpArticles.find(a => a.id === req.params.id);
  
  if (!article) {
    return res.status(404).json({ success: false, error: 'Makale bulunamadı' });
  }

  res.json({
    success: true,
    data: { article },
  });
});

/**
 * GET /api/help/categories
 * Yardım kategorileri
 */
router.get('/categories', (req, res: Response) => {
  res.json({
    success: true,
    data: { categories },
  });
});

/**
 * GET /api/help/search
 * Yardım içeriğinde ara
 */
router.get('/search', (req, res: Response) => {
  const query = (req.query.q as string || '').toLowerCase().trim();
  
  if (query.length < 2) {
    return res.json({ success: true, data: { results: [] } });
  }

  const results = helpArticles.filter(a => 
    a.title.toLowerCase().includes(query) ||
    a.content.toLowerCase().includes(query) ||
    a.tags.some(t => t.toLowerCase().includes(query))
  ).map(a => ({
    id: a.id,
    title: a.title,
    category: a.category,
    snippet: a.content.substring(0, 150) + '...',
  }));

  res.json({
    success: true,
    data: { results, query },
  });
});

/**
 * GET /api/help/faq
 * Sık Sorulan Sorular
 */
router.get('/faq', (req, res: Response) => {
  const faqs = [
    { q: 'Nasıl kayıt olabilirim?', a: 'Ana sayfadaki "Kayıt Ol" butonuna tıklayarak e-posta adresinizle kayıt olabilirsiniz.' },
    { q: 'Projelerimi nasıl yükleyebilirim?', a: 'Profilim > Projelerim sayfasından "Yeni Proje Ekle" butonunu kullanabilirsiniz.' },
    { q: 'Ödeme yöntemleri nelerdir?', a: 'Kredi kartı ve banka kartı ile güvenli ödeme yapabilirsiniz.' },
    { q: 'İade alabilir miyim?', a: '14 gün içinde iade talep edebilirsiniz. Dijital ürünler için koşullar geçerlidir.' },
    { q: 'Hesabımı nasıl silebilirim?', a: 'Ayarlar > Hesap Ayarları bölümünden hesabınızı silebilirsiniz.' },
    { q: 'Premium üyelik avantajları nelerdir?', a: 'Öne çıkan projeler, sınırsız yükleme, öncelikli destek ve daha fazlası.' },
  ];

  res.json({
    success: true,
    data: { faqs },
  });
});

export default router;
