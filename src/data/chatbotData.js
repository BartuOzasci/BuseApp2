// Chatbot pre-defined messages and responses
export const WELCOME_MESSAGES = [
  "Merhaba Buse! 🌸 Ben senin kişisel asistanınım.",
  "Sana bu uygulama hakkında yardımcı olabilirim. İşte yapabileceklerin:",
];

export const FEATURE_LIST = [
  {
    id: 'followers',
    label: '📊 Takipçi Takibi',
    description: 'Takipçi sayını gir ve grafiklerle takip et. Haftalık, aylık ve yıllık analizlerini gör.'
  },
  {
    id: 'calendar',
    label: '📅 Takvim',
    description: 'Bugünün tarihini gör, ayın takvimini incele ve günlerini planla.'
  },
  {
    id: 'todos',
    label: '✅ Yapılacaklar Listesi',
    description: 'Her gün için yapılacaklar listesi oluştur. Kartları kaydırarak günler arasında geç.'
  },
  {
    id: 'content',
    label: '🎬 İçerik Takvimi',
    description: 'Haftalık içerik planını oluştur. Her gün için içerik fikirlerin ve planların.'
  },
  {
    id: 'today_todos',
    label: '📋 Bugünkü Yapılacaklarım',
    description: 'Bugün yapman gereken şeyleri hemen listelerim.'
  },
  {
    id: 'weekly_content',
    label: '🗓️ Bu Haftanın İçerik Planı',
    description: 'Bu haftanın içerik takvimini sana özet olarak sunarım.'
  }
];

export const QUICK_ACTIONS = [
  { id: 'today_todos', label: 'Bugünkü yapılacaklarım ne?' },
  { id: 'weekly_content', label: 'Haftalık içerik planım ne?' },
  { id: 'help', label: 'Ne yapabilirsin?' },
];

export const DAYS_TR = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];
export const DAYS_SHORT_TR = ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'];
export const MONTHS_TR = [
  'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
  'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
];
