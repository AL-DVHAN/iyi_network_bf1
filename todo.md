# IYI Network BF1 - Proje TODO

## Veritabanı & Altyapı
- [x] Veritabanı şeması: users, weekly_challenges, challenge_completions, leaderboard_entries, feedback, ban_list, donations, pro_tips, server_stats, ban_appeals
- [x] tRPC router'ları: encyclopedia, stats, challenges, leaderboard, feedback, server, bans, donations, profile
- [x] Gametools Network API proxy endpoint'leri
- [x] Multer dosya yükleme endpoint'i (/api/upload)
- [x] Stripe webhook endpoint'i (/api/stripe/webhook)

## Tasarım & Layout
- [x] Global dark mode tema (BF1 askeri atmosferi - koyu gri/kahverengi/altın renk paleti)
- [x] Ana navigasyon bar (7 bölüm + arama çubuğu + auth)
- [x] Responsive tasarım (mobil, tablet, masaüstü)
- [x] BF1 tarzı tipografi (Oswald + Rajdhani fontları)

## Sayfalar
- [x] Ana sayfa (Hero + canlı sunucu widget + son istatistikler)
- [x] Ansiklopedi sayfası (silahlar + araçlar, JSON'dan dinamik)
- [x] Oyuncu istatistik sayfası (Gametools API entegrasyonu)
- [x] Canlı Sunucu Dashboard (oyuncu sayısı, harita, bilet, admin)
- [x] Haftalık Görevler sayfası (görevler + rozetler + puan)
- [x] Liderlik Tablosu (aylık aktif oyuncular, süre/puan/kill bazlı)
- [x] Hakkımızda sayfası (klan tarihi, üye sayısı, vizyon)
- [x] Geri Bildirim sayfası (form + Discord Webhook + dosya yükleme)
- [x] Kullanıcı Profili sayfası (EA hesap bağlama, puan, rozetler)
- [x] Admin paneli (görev yönetimi, ban listesi, donator yönetimi)
- [x] Ban listesi & itiraz formu
- [x] Destekçi Ol sayfası (Stripe Checkout, 4 kademe)

## Özellikler
- [x] Fuzzy search (Fuse.js) + Türkçe karakter normalizasyonu
- [x] Oyuncu arama → istatistik sayfasına yönlendirme
- [x] Silah/araç arama → ansiklopedi sayfasına yönlendirme
- [x] Oynama süresi standardizasyonu (saniye → saat, yukarı yuvarlama)
- [x] Discord Webhook entegrasyonu (geri bildirim bildirimleri)
- [x] Dosya yükleme (video + görsel) geri bildirim formunda
- [x] Stripe donator sistemi (rozet, isim rengi, ayrıcalıklar)
- [x] Ban yönetim sistemi (ban listesi, itiraz formu, admin paneli)
- [x] Rozet ve puan sistemi
- [x] EA hesap bağlama (Account Linking)

## Testler
- [x] Auth logout testleri
- [x] Türkçe karakter normalizasyon testleri (23 test)
- [x] Oynama süresi yuvarlama testleri
- [x] Leaderboard, challenges, bans, donations, feedback testleri
- [x] Tüm 23 test geçiyor ✓

## Gelecek Geliştirmeler
- [ ] Stripe anahtarları yapılandırıldıktan sonra ödeme akışını test et
- [ ] EA hesap doğrulama (gerçek EA API entegrasyonu)
- [ ] Haftalık görev otomatik oluşturma (cron job)
- [ ] Liderlik tablosu otomatik güncelleme
- [ ] Hetzner deployment rehberi (DEPLOYMENT.md)

## Hata Düzeltmeleri
- [x] Stats sayfası: accuracy.toFixed is not a function hatası - API'den string gelen sayısal değerleri parseFloat ile parse et

## Yeni İstekler (2. Tur)
- [x] Gametools API yanıt alanlarını doğru eşleştir (timePlayed, kdr, kpm, spm, accuracy, headshotsPercent, longestHeadshot, highestKillStreak)
- [x] Oynama süresi hesabını düzelt (API saniye mi dakika mı veriyor kontrol et)
- [x] Silah tablosuna sıralama (Kill, İsabet, Süre, HS Oranı, Kill/dk) ekle
- [x] Sınıf istatistikleri tablosuna sıralama + HS oranı + KPM ekle
- [x] Canlı Sunucu skorunu API'den gerçek zamanlı çek (sabit 1970-1300 değil)

## 3. Tur İstekler
- [x] Harita isimlerini doğru Türkçeleştir (Achi Baba→Alçıtepe, Fort De Vaux→Vaux Kalesi, Cape Helles→Seddülbahir, Galicia→Galiçya, Giant's Shadow→Giant'ın Gölgesi, Empire's Edge→İmparatorluğun Kıyısı, Lupkow Pass→Lupkow Geçidi, Nivelle Nights→Nivelle Geceleri)
- [x] Conquest→Fetih, German Empire→Alman İmparatorluğu Türkçeleştirme
- [x] Sol üst IYI ikonunu klan logosuyla değiştir
- [x] Ansiklopedi silah verisini düzelt - tüm silahlar gösterilmeli (247 silah, 44 araç)
- [x] Silah detay kartındaki istatistikleri düzelt (“Referans İstatistikler” başlığı + açıklama eklendi)

## 4. Tur İstekler
- [x] Hakkımızda: Hikayemiz → Bakımda, Yetkililer RainRapMusic0001 Kurucu + boş slotlar Bakımda
- [x] Hakkımızda: Klan Kuralları → Sunucu Kuralları (9 kural özet)
- [x] Hakkımızda: Discord linki discord.gg/kayiboyuclan, email/EA Origin kaldır
- [x] Hakkımızda: Aktif Üye 150+, Sunucu Uptime → Sunucu Sayısı = 1
- [x] Tüm Discord linklerini discord.gg/kayiboyuclan olarak güncelle
- [x] Renk temasını mavi tonlara çek
- [x] Tema seçici ekle (Siyah / Mavi / Beyaz) - üst panelden erişilebilsin
- [x] Navbar yüksekliğini büyüt, kategoriler arası boşluğu artır

## 5. Tur İstekler
- [ ] Tema renk uyumu düzeltilsin (kahverengi kalıntılar, beyaz temada görünmez yazılar)
- [ ] Ansiklopedi silah sırası yeni JSON'dan güncellenmeli (Türkçe isimler, doğru kategoriler)
- [ ] Ansiklopedi detay kartından Referans Kill/İsabet/Süre istatistikleri kaldırılsın
- [ ] Ansiklopedi kategori içeriklerine BAKIMDA yazısı eklensin
- [ ] Navbar: IYI Network → KAYI BOYU CLAN, BF1 yazısı kaldırılsın
- [ ] Navbar yüksekliği ve yazı boyutu büyütülsün
- [ ] Footer: 2024→2025, Gametools mention ekle, sarı IYI ikonu ve portal yazıları kaldırılsın
- [ ] Destekçi Ol: Tek paket, 100 TL, basit özellikler
- [ ] Canlı Sunucu: Conquest→Fetih, API ibaresi kaldırılsın, detay paneli toggle ile açılsın

## 6. Tur İstekler - Klan Üyeleri Sekmesi
- [x] Klan üyelerini veritabanına kaydet (130+ oyuncu)
- [x] Gametools API'den her üyenin istatistiklerini çek (K/D, oyun süresi)
- [x] "Üyelerimiz" sekmesi oluştur - Hakkımızda sayfasına ekle
- [x] Profil kartları: isim, K/D, oyun süresi, avatar
- [x] Otomatik kaydırılan şerit (carousel) - sonsuz döngü
- [x] Responsive tasarım (mobil'de 2-3 kart, desktop'ta 5-6 kart)
- [ ] Üyelerimiz sekmesine tıklanabilir oyuncu profili linki
