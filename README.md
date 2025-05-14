# LinkedIn Clone

Modern bir sosyal ağ ve profesyonel iş platformu klonu. Next.js, TypeScript, MongoDB ve Clerk Authentication ile geliştirilmiştir.

## 🌟 Özellikler

- **Kullanıcı Yetkilendirme ve Profiller**
  - Clerk Authentication ile güvenli oturum yönetimi
  - Rol tabanlı sistem (İşveren ve Çalışan)
  - Kapsamlı kullanıcı profilleri (eğitim, deneyim, beceriler)
  - Profil düzenleme ve yönetim sistemi
  - Kullanıcı arama ve otomatik tamamlama

- **Sosyal Medya İşlevleri**
  - Gönderi oluşturma, düzenleme ve silme
  - Fotoğraf yükleme desteği
  - Gönderi beğenme
  - Gönderi yorum sistemi
  - Kullanıcıları takip etme

- **İş İlanları ve Başvurular**
  - İş ilanı türünde gönderiler oluşturabilme
  - İlanları filtreleme ve görüntüleme
  - İş ilanlarına başvuru sistemi
  - Başvuruları yönetme ve takip etme
  - İşverenler için başvuru bildirimleri

- **Bildirim Sistemi**
  - Gerçek zamanlı bildirimler
  - Beğeni, yorum ve takip bildirimleri
  - İş başvurusu bildirimleri
  - Okunmuş/okunmamış bildirim yönetimi
  - Bildirim sayacı ve gruplandırma

- **Admin Paneli**
  - Kullanıcı yönetimi ve engelleyebilme
  - İçerik moderasyonu
  - İstatistik görüntüleme

## 🚀 Teknik Özellikler

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS, Shadcn/UI
- **Auth**: Clerk Authentication
- **Database**: MongoDB, Mongoose
- **Storage**: Azure Blob Storage (resim depolama)
- **Deployment**: Vercel'e hazır

## 🔧 Başlangıç

1. Gereksinimleri yükleyin:
   ```bash
   npm install
   ```

2. Ortam değişkenlerini ayarlayın (.env dosyası oluşturun):
   ```
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
   CLERK_SECRET_KEY=
   NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
   NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
   NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/role-selection
   NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/role-selection
   
   MONGODB_URI=

   # Azure Storage için (resim yükleme)
   AZURE_STORAGE_ACCOUNT_NAME=
   AZURE_STORAGE_ACCOUNT_KEY=
   AZURE_STORAGE_CONTAINER_NAME=
   ```

3. Geliştirme sunucusunu başlatın:
   ```bash
   npm run dev
   ```

4. Tarayıcınızda [http://localhost:3000](http://localhost:3000) adresini açın

## 📋 Proje Yapısı

- **/app**: Next.js 14 App Router sayfaları ve API rotaları
- **/components**: Yeniden kullanılabilir React bileşenleri
- **/mongodb**: MongoDB bağlantısı ve şema modelleri
- **/lib**: Yardımcı fonksiyonlar ve servisler
- **/actions**: Sunucu tarafı işlemler (Server Actions)
- **/middleware**: Auth ve diğer middleware işlemleri
- **/public**: Statik dosyalar

## 🧩 Ana Bileşenler

- **PostFeed**: Gönderi akışını görüntüler (Tüm, Normal, İş İlanları)
- **Post**: Tekil gönderi bileşeni
- **PostForm**: Yeni gönderi oluşturma formu
- **CommentFeed**: Gönderi yorumlarını görüntüler
- **UserInformation**: Kullanıcı profil bilgilerini görüntüler
- **NotificationDropdown**: Bildirim menüsü
- **FollowButton**: Kullanıcı takip etme düğmesi
- **ApplyJobButton**: İş ilanlarına başvuru düğmesi
- **SearchBar**: Kullanıcı arama ve otomatik tamamlama
- **PublicProfile**: Kapsamlı kullanıcı profil görünümü

## 👩‍💻 Kullanıcı Rolleri

- **Employee (Çalışan)**: 
  - Normal gönderiler oluşturabilir
  - İş ilanlarına başvurabilir
  - Profil bilgilerini (eğitim, deneyim, beceriler) düzenleyebilir

- **Employer (İşveren)**: 
  - İş ilanı gönderileri oluşturabilir
  - Başvuruları görüntüleyebilir ve yönetebilir
  - Başvuru bildirimleri alabilir

- **Admin**: 
  - Moderasyon yetkileri
  - Kullanıcı yönetimi ve engelleyebilme
  - Platform ayarları ve içerik denetimi

## 🌐 API Rotaları

- **/api/posts**: Gönderi CRUD işlemleri
- **/api/posts/[post_id]/comments**: Yorum işlemleri
- **/api/posts/[post_id]/like**: Beğeni işlemleri
- **/api/followers**: Takip işlemleri
- **/api/notifications**: Bildirim işlemleri
- **/api/profile**: Profil CRUD işlemleri
- **/api/profile/education**: Eğitim bilgileri yönetimi
- **/api/profile/experience**: Deneyim bilgileri yönetimi
- **/api/profile/skills**: Beceri bilgileri yönetimi
- **/api/users/search**: Kullanıcı arama API'si
- **/api/applications**: İş başvuruları işlemleri
- **/api/admin**: Admin panel API rotaları

## 📱 Responsive Tasarım

Platform, mobil cihazlardan masaüstü ekranlara kadar tüm cihazlarda sorunsuz çalışacak şekilde tasarlanmıştır.

## 🛠️ Katkıda Bulunma

1. Bu repo'yu fork edin
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Değişikliklerinizi commit edin (`git commit -m 'Add amazing feature'`)
4. Branch'inizi push edin (`git push origin feature/amazing-feature`)
5. Pull Request açın

## 📝 Lisans

MIT