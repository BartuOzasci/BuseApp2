# Buse Acar — İçerik Üreticisi Paneli

Instagram içerik üreticileri için mobil öncelikli bir PWA. Veri Supabase'de
tutulur; Supabase yapılandırılmamışsa uygulama `localStorage` ile çalışmaya
devam eder.

## Çalıştırma

```bash
npm install
cp .env.example .env    # Supabase bilgilerini doldur (isteğe bağlı)
npm run dev
```

`.env` yoksa uygulama açılır ve "Sadece bu cihazda" rozetiyle localStorage
modunda çalışır.

## Supabase

1. Supabase panelinde **SQL Editor → New query** → `supabase/schema.sql`
   dosyasının tamamını yapıştır → **Run**.
2. **Project Settings → API** bölümünden `Project URL` ve `anon public`
   anahtarını al, `.env` içine yaz.
3. Dev sunucusunu yeniden başlat (Vite env değişkenlerini açılışta okur).

Cihazında localStorage verisi varsa ve bulut boşsa uygulama üstte
"Buluta Taşı" teklifi gösterir.

> ⚠️ Şema girişsiz (anonim) erişim için yazıldı: uygulamanın adresini bilen
> herkes veriyi okuyabilir ve değiştirebilir. Giriş eklemek için
> `supabase/schema.sql` dosyasının sonundaki nota bak.

Uygulama `http://localhost:3000` adresinde açılır.

| Komut | Ne yapar |
|---|---|
| `npm run dev` | Geliştirme sunucusu (hot reload) |
| `npm run build` | `dist/` klasörüne production derlemesi |
| `npm run preview` | Derlenmiş sürümü yerelde önizler |

## Bölümler

| Sekme | İçerik |
|---|---|
| **Büyüme** | Takipçi kaydı, zaman aralığına göre grafik, günlük ortalama, kayıt listesi (silinebilir) |
| **Hedef** | Takipçi hedefi, ilerleme halkası, tahmini varış tarihi, tamamlanan hedef arşivi |
| **Fikirler** | İçerik fikir bankası — format, aşama (Fikir → Çekilecek → Kurguda → Paylaşıldı), kategori, arama |
| **Saatler** | Paylaşım saati ısı haritası. Kendi gönderi verin yeterliyse ona, değilse genel öneriye göre |

Sağ alttaki asistan butonu bu bölümlerdeki veriyi okuyup özet çıkarır.

## Yapı

```
supabase/schema.sql    veritabanı şeması + RLS politikaları
netlify.toml           Netlify derleme ayarları
src/
  App.jsx              sekme yönetimi + tüm state
  lib/supabase.js      Supabase istemcisi (env yoksa null)
  data/api.js          veri katmanı — bulut varsa Supabase, yoksa localStorage
  components/
    ui/index.jsx       ortak arayüz parçaları (başlık, boş durum, alt panel)
    Navbar.jsx         üst başlık
    BottomNav.jsx      alt sekme çubuğu
    FollowerTracker.jsx
    GoalTracker.jsx
    IdeaBank.jsx
    BestTimes.jsx
    Chatbot.jsx
    Footer.jsx
    SyncBar.jsx        veri kaynağı durumu + buluta taşıma teklifi
  config/colors.js     Tailwind dışında (grafik, SVG) kullanılan renkler
  data/storage.js      localStorage sarmalayıcı (yerel mod + önbellek)
  data/chatbotData.js  asistan metinleri + Türkçe tarih etiketleri
  utils/dateUtils.js   tarih ve sayı yardımcıları
  index.css            tasarım sistemi (kart, buton, tipografi sınıfları)
```

## Notlar

- Tarihler yerel saate göre yazılır (`toDateStr`). Daha önce `toISOString()`
  kullanıldığı için akşam saatlerinde girilen kayıt bir önceki güne düşüyordu.
- Renk paleti değişmedi: marka pembesi + nötr `ink` gri skalası.
- Etkileşim oranı otomatik hesaplanmıyor. Instagram Graph API bir sunucu ve
  Business hesap onayı gerektirdiği için bu tarayıcı-içi uygulamada mümkün değil.
