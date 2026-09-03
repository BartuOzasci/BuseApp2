# Buse Acar — İçerik Üreticisi Paneli

Instagram içerik üreticileri için mobil öncelikli bir PWA. Tüm veri tarayıcıda
(`localStorage`) tutulur; sunucu veya hesap gerekmez.

## Çalıştırma

```bash
npm install
npm run dev
```

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
src/
  App.jsx              sekme yönetimi + tüm state
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
  config/colors.js     Tailwind dışında (grafik, SVG) kullanılan renkler
  data/storage.js      localStorage sarmalayıcı
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
