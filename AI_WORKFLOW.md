# AI Workflow

Bu belge, frontend'in yapay zeka desteğiyle nasıl geliştirildiğini açıklar. Amacı, kod üretiminin hangi noktada hızlandırıcı olduğunu ve **direksiyonun kimde kaldığını** somut örneklerle göstermektir.

Belgedeki her örnek gerçek oturum akışından alınmıştır. Kimin neyi bulduğu, sonradan güzelleştirilmeden yazılmıştır — çünkü böyle bir belgenin tek değeri doğruluğudur.

---

## Kullanılan Tek Araç: Claude Code

Projede **başka hiçbir yardımcı IDE aracı kullanılmamıştır.** Ne Copilot, ne Cursor, ne Windsurf, ne de başka bir kod tamamlama eklentisi devrede olmadı. Tüm süreç yalnızca **Claude Code** (Anthropic) terminal asistanı ile yürütüldü.

Frontend tarafında aracın bir yeteneği belirleyici oldu: **tarayıcıyı sürebilmesi.** Üretilen arayüz aynı oturumda açıldı, ekran görüntüsü alındı, DOM sorgulandı, ağ trafiği ölçüldü. Bir arayüz için "derleniyor" ile "ekranda doğru görünüyor" arasındaki fark buradan gelir — ve bu projede birkaç kez bu ikisi ayrıştı.

---

## Temel İlke: Üretilen Kod, Doğrulanmadıkça Kod Değildir

Bu projede benimsenen kural şudur: **yapay zekanın ürettiği hiçbir çıktı, çalıştırılarak doğrulanmadan "tamam" sayılmaz.**

Frontend'de doğrulama üç katmanda yürüdü: derleme, canlı API'ye karşı ölçüm, ve tarayıcıda görsel/davranışsal kontrol.

| Üretilen | Doğrulama | Sonuç |
|---|---|---|
| Tüm TypeScript kaynak | `tsc -b && vite build` | ✅ Geçti |
| Lint | `oxlint` | ✅ Uyarısız |
| API sözleşmesi | Altı ucun tamamı canlı servise `curl` | ✅ Şekiller doğrulandı |
| Para aritmetiği | Sunucu `projection` ile kendi hesabım karşılaştırıldı | ✅ 100 kayıtta en büyük fark **48 kuruş** (yuvarlama) |
| Dört persona ekranı | Tarayıcıda tek tek açıldı | ✅ #1, #2476, #121, `rank: null` |
| İlk 100 dışı senaryosu | DOM'dan satır sayımı | ✅ 6 kayıt (118–123), kendi satırı `aria-current` |
| 1. sıradaki oyuncunun penceresi | DOM'dan satır sayımı | ✅ 3 kayıt |
| Boşta ağ trafiği | 31 sn boyunca `fetch` sayacı | ✅ **0 istek** |
| Yenile düğmesi | Tıklama sonrası `fetch` sayacı | ✅ 6 istek |
| Responsive kırılım | Derlenmiş CSS'te medya sorgusu | ✅ `40rem` ve `64rem` üretiliyor |
| Bayrak CDN'i | `flagcdn` uçları `curl` ile | ✅ 200 / geçersiz kodda 404 |

### Doğrulanamayan bir adım ve nasıl raporlandığı

Mobil düzen **gerçek dar ekranda görsel olarak doğrulanamadı.** Tarayıcı eklentisi pencereyi yeniden boyutlandıramadı; `resize_window` çağrısı sessizce etkisiz kaldı (ekran görüntüsü hâlâ 1568 piksel geldi).

Burada iki seçenek vardı: "responsive sınıflar yazıldı, çalışır" demek, ya da neyin ölçüldüğünü daraltmak. İkincisi yapıldı — derlenmiş CSS'te kırılım noktalarının gerçekten üretildiği doğrulandı (`@media (width>=40rem)`, `@media (width>=64rem)`), ama **görsel teyidin yapılmadığı açıkça geliştiriciye bildirildi.**

Doğrulanamayan bir adım "başarılı" sayılmadı, açık bir eksik olarak işaretlendi.

---

## Human-in-the-Loop: Kararların Nerede Verildiği

Yapay zeka bu projede hiçbir zaman tek başına yön belirlemedi. Kod yazmaya başlamadan önce, farklı okumaların **maddi olarak farklı işe** yol açacağı noktalarda araç durdu ve seçenekleri gerekçeleriyle sundu.

### Tasarım yönü: dört kez reddedilen öneri

Bu projenin en belirleyici geri bildirim döngüsü tasarım tarafında yaşandı. Araç arka arkaya **dört ayrı yön** önerdi, geliştirici dördünü de reddetti:

| # | Aracın önerisi | Geliştiricinin tepkisi |
|---|---|---|
| 1 | Koyu tema + mor→pembe gradient, emoji rozetler | *"ai slop diye çığlık atıyor"* |
| 2 | Havalimanı bilgi panosu (FIDS): amber fosfor, dar grotesk | Emoji sorunu çözüldü ama yön tutmadı |
| 3 | Açık bej "biniş kartı": kağıt dokusu, mürekkep laciverti | *"bu ne ya"* — kırtasiye faturası gibi |
| 4 | Kokpit koyu arduvaz + tek amber aksan | *"layoutu falan değiştirsene"* |

Beşinci turda geliştirici **referans görsel** verdi: casual mobil oyun arayüzü — ahşap zemin, kurdele başlıklı altın panel, kapsül satırlar, kabartma düğmeler. Nihai tasarım budur.

Buradaki asıl nokta: **görsel yön araç tarafından bulunmadı.** Araç dört kez denedi ve dördü de tutmadı; yönü belirleyen şey geliştiricinin verdiği referanstı. Aracın katkısı, o referansı web'e çevirmek (Tailwind `@theme` token'ları, `perf-l` perfore kenar, `btn3d` basılabilir düğme) oldu — yönü seçmek değil.

Aynı şekilde emoji kullanımı da geliştiricinin kararıdır: *"emoji de kullanma, daha yaratıcı ol"* denilmesi üzerine bayrak emojileri ISO kod rozetine, sonra da geliştiricinin talebiyle gerçek bayrak görsellerine (`flagcdn`) çevrildi.

### Geliştiricinin verdiği diğer kararlar

| Karar | Geliştiricinin seçimi | Sonucu |
|---|---|---|
| **CORS nasıl çözülsün?** | Proxy kalksın, doğrudan backend'e bağlan | Vite dev proxy'si tamamen silindi; CORS'un backend'de çözülmesi gerektiği README'ye not düşüldü |
| **Avatar nereden gelsin?** | `userId`'den deterministik türet | API avatar döndürmüyor; sahte fotoğraf yerine hash'ten renk + baş harf. Aynı oyuncu hep aynı rozeti alır |
| **Ülke sekmesi olsun mu?** | Evet, istemci tarafı filtre | Backend'de ülke filtresi yok (`?country=` **400** döner); ilk 100 üzerinde filtreleniyor, kapsam sınırı README'de |
| **Demo persona sayısı** | Dördü de kalsın | `mid` (#2476) ile `outside` (#121) aynı ekranı farklı derinlikte gösteriyor |
| **Ağ trafiği ne olsun?** | Polling tamamen kalksın | *"çağırmadığı-tetiklenmediği sürece atma"* — zamanlayıcılar silindi, yerine manuel yenile düğmesi |
| **Logo** | Marka logosu kullanılsın | `public/logo.png`; favicon logodan örneklenen `#ef6723` ile yeniden çizildi |

Bu kararların hiçbiri araç tarafından varsayılmadı.

### Belirsizliğin varsayımla doldurulmaması

Oturumun başında rehber metni `country` alanının satırlarda bulunduğunu varsayıyordu, ama canlı API'de o alan yoktu ve `?country=TR` **400** dönüyordu. Araç bunu ölçtü ve sessizce bir yol seçmek yerine **geliştiriciye sordu**: bayraklar tamamen çıksın mı, istemcide uydurulsun mu, yoksa sekme yarım mı bırakılsın?

Geliştiricinin cevabı üçünden de farklıydı: *"country is now live, re-fetch — senin verin eski deploy'dan."* Yeniden çekildi, alan gerçekten gelmişti. Yanlış varsayımla ilerlenseydi ya sahte veri üretilecek ya da var olan bir özellik atlanacaktı.

---

## Aracın Yakaladığı, Geliştiricinin Onayladığı Sorunlar

Aşağıdaki bulgular **araç tarafından tespit edilmiş**, teşhisi geliştiriciye gerekçesiyle raporlanmış, düzeltme onaylanarak uygulanmıştır.

### 1. Token gelmeden yetkili uçlara istek atılması

Geliştiricinin paylaştığı ağ paneli ekran görüntüsünde `around`, `me` ve `rewards` uçlarının **401** döndüğü görüldü. Sebep, bu üç ucun `identify` tamamlanmadan çağrılmasıydı: token henüz `localStorage`'da yoktu.

Aynı ekran görüntüsünde CORS hataları da vardı ve ikisi kolayca birbirine karışabilirdi. Ayrım önemliydi — CORS backend sorunu, 401 ise istemci sorunuydu.

Veri hook'una `enabled` bayrağı eklendi; yetkili uçlar `ready` olmadan istek atmıyor. (O aşamada hook `usePolling` adındaydı; polling kaldırılınca `useResource` oldu, bayrak korundu.) Bu, aracın kendi ürettiği koddaki bir hatadır ve geliştiricinin paylaştığı kanıtla yüzeye çıkmıştır.

### 2. "Çevrem" sekmesinde yanlış alanın kullanılması

Geliştirici `neighbours` alanını kullanmayı istediğinde, araç önce alanın gerçekten var olduğunu doğruladı — ve doğrularken **bir hata buldu**:

```
top modu     → entries: 100 kayıt | neighbours: 3 kayıt
outside modu → entries: 6 kayıt   | neighbours: 6 kayıt
unranked     → entries: 100 kayıt | neighbours: 0 kayıt
```

`entries` kullanıldığı için **1. sıradaki oyuncunun "Çevrem" sekmesinde 100 satır görünüyordu.** `neighbours` doğru pencereyi döndürüyordu. Ayrıca `unranked` durumunda `entries` 100 kayıt döndürdüğü için boş durum ekranı hiç tetiklenmeyebilirdi.

Düzeltildi ve tarayıcıda ölçülerek doğrulandı: 1. sıra → 3 satır, 121. sıra → 6 satır + "17 sıra atlandı".

### 3. Ağ panelindeki "(cancelled)" satırlarının teşhisi

Geliştirici kırmızı satırlar gördü ve *"bir kırmızı response geliyor bu ne"* diye sordu. Araç bunları hata olarak kabul etmek yerine inceledi:

- Satırlarda `(cancelled)` yazıyordu, `failed` değil
- Hepsi **0.0 kB** idi
- Her uç ekranda **iki kez** vardı: biri iptal, biri **200**

Teşhis: React StrictMode dev'de bileşenleri iki kez mount ediyor, veri hook'unun cleanup'ı ilk turu `abort()` ediyordu. Yani beklenen davranıştı ve üretim derlemesinde hiç oluşmuyordu.

Buna rağmen geliştirici *"o kırmızıları istemiyorum, adamlar performansa çok takılıyor"* dedi. Burada iki yol vardı: StrictMode'u kapatmak (gerçek cleanup hatalarını gizlerdi) ya da isteği tekilleştirmek. **İkincisi seçildi**: `client.ts`'te uçuştaki GET istekleri paylaşılıyor, ikinci mount yeni bağlantı açmıyor. Semptom yerine sebep giderildi ve StrictMode'un koruması korundu.

---

## Aracın Önerisinin Reddedildiği Noktalar

### Ödül matematiğinin istemcide tutulmaması

Araç başlangıçta ödül paylarını istemcide hesaplıyordu: ilk üç sıra sabit oran, 4–100 arası skora orantılı, tamamı `bigint` kuruş üzerinden. Hesap doğruydu — sunucunun `projection` ucuyla karşılaştırıldığında 100 kayıtta en büyük fark **48 kuruştu.**

Geliştirici `GET /rewards/projection` ucunu gösterdi. Doğruluk farkı ihmal edilebilir olmasına rağmen istemci hesabı **tamamen silindi**, çünkü mesele doğruluk değildi: **gösterilen tutar ile ödenecek tutarın aynı kaynaktan gelmesi.** İki bağımsız hesap, ileride birbirinden ayrışacak iki hesap demektir.

`lib/prize.ts` bir hesaplayıcıdan, sunucu tutarlarını `userId` ile eşleştiren ince bir katmana indirildi. `lib/money.ts`'teki `shareOf` ve `rateToFraction` ölü kod olarak kaldırıldı.

### Karmaşık çözümün geri alınması

"(cancelled)" satırlarını çözerken araç önce veri hook'u içinde sökülmeyi bir makroteğe erteleyen bir yaklaşım denedi. Yazılan `queueMicrotask` bloğu hiçbir iş yapmıyordu ve mantık takip edilemez haldeydi.

Araç bunu commit etmek yerine `git checkout` ile **geri aldı** ve sorunu doğru katmanda — istek katmanında tekilleştirme ile — çözdü. Çalışan ama anlaşılmaz bir çözüm, çalışan bir çözüm sayılmadı.

### Ölü kodun belgeye yazılmadan önce temizlenmesi

Bu belge yazılırken bağımlılıklar denetlendi ve üç paketin (`@radix-ui/react-avatar`, `@radix-ui/react-tooltip`, `tailwindcss-animate`) hiç kullanılmadığı görüldü. Belgeye "shadcn/ui deseni kullanıldı" yazmadan önce bunlar kaldırıldı. Aynı denetimde `CountdownTimer.tsx` ve Vite şablonundan kalan `public/icons.svg` de ölü olarak bulunup silindi.

---

## Belgenin Kendisine Uygulanan Doğruluk Kuralı

Bu belge yazılırken performans iddiaları ölçülmeden yazılmadı. "Boşta istek atmıyor" cümlesi için tarayıcıda `fetch` sayacı kuruldu:

```
31 saniye boşta bekleme → 0 istek
Yenile düğmesine basıldı → 6 istek
```

İlk ölçüm yanıltıcı çıkmıştı: 5 istek görünüyordu. Bunlar sayaç kurulduktan sonra tamamlanan **açılış** istekleriydi, tekrar eden trafik değil. Sayaç sıfırlanıp zaman damgalı olarak yeniden ölçüldü ve gerçek sonuç (0) alındı. **İlk okuma olduğu gibi kabul edilmedi.**

Aynı şekilde `neighbours`, `projection` ve `flagcdn` uçlarının varlığı, koda dokunulmadan önce `curl` ile doğrulandı — geliştiricinin verdiği bilgi doğruydu, ama doğrulanmadan kod yazılmadı.

---

## İnsan Kararı Olarak Kalan Mimari Tercihler

- **Para asla `Number` ile işlenmez.** `poolAmount`, `balance`, `amount` string gelir; `lib/money.ts` bunları `bigint` kuruşa çevirir. `Number` yalnızca `Intl` ile biçimlendirme anında kullanılır.
- **Geri sayım istemcide sayar.** `secondsRemaining` bir kez alınır, sayaç `Date.now()` farkından yürür. Sunucudan saniyede bir istek çekilmez; sekme arka plandayken `setInterval` kısılsa bile geri dönüşte sayaç doğru kalır.
- **`LeaderboardRow` tek bileşendir.** İlk 100 listesi ve around penceresi aynı bileşeni kullanır; tek fark `isCurrentUser` prop'udur. İki ayrı satır bileşeni yazmak, "yeniden kullanılabilir bileşen" kriterinin tam tersidir.
- **`key` olarak `userId`, index değil.** Sıralama değiştiğinde React tüm listeyi yeniden çizmez.
- **Kendi satırı `isCurrentUser` ile bulunur.** `neighbours` dizisinin uzunluğu 3–6 arası değişir (1. sırada üstte, son sırada altta kimse yoktur); index'e göre arama yanlış sonuç verir.
- **`rank: null` ≠ `0`.** Sıralamada olmayan oyuncuya boş tablo değil, skor gönderme ekranı gösterilir.

---

## Açık Bırakılan Riskler

Doğrulama disiplininin bir parçası da, kapatılmayanı açıkça söylemektir:

- **Mobil düzen gerçek cihazda görsel olarak doğrulanmadı.** Kırılım noktalarının derlenmiş CSS'te üretildiği doğrulandı, ancak dar ekranda göz kontrolü yapılamadı (tarayıcı eklentisi pencereyi boyutlandıramadı).
- **Backend CORS başlığı göndermiyor.** API `Access-Control-Allow-Credentials: true` gönderirken `Access-Control-Allow-Origin` göndermiyor; bu haliyle `curl` çalışır ama tarayıcı tüm istekleri bloklar. Proxy geliştirici kararıyla kaldırıldığı için bu, backend'de çözülmesi gereken açık bir maddedir.
- **"Ülkem" sekmesi yalnızca ilk 100'ü kapsar.** Backend'de ülke filtresi olmadığı için tüm oyuncular içinde ülke sıralaması yapılamıyor. Gerçek ülke sıralaması ayrı bir Redis ZSET gerektirir.
- **Otomatik test yok.** Doğrulama derleme, canlı API ölçümü ve tarayıcı kontrolüyle yapıldı; birim/bileşen testi yazılmadı.
- **Veri artık canlı tazelenmiyor.** Polling geliştirici kararıyla kaldırıldı. Sıralama değiştiğinde ekran kendiliğinden güncellenmez; kullanıcı yenile düğmesine basmalıdır. Ağ trafiği karşılığında canlılıktan feragat edilmiştir.

---

## Özetle

Yapay zeka bu projede **iskelet kurma, API sözleşmesini keşfetme, tekrarlayan bileşen yazımı, ölçüm ve dokümantasyon taslağı** aşamalarında hız kazandırdı. Canlı API'ye karşı ölçüm yaparak `neighbours`/`entries` karışıklığı ve token yarışı gibi somut sorunları yüzeye çıkardı.

Buna karşılık direksiyon geliştiricide kaldı:

- **Görsel yön** — araç dört kez denedi, dördü de reddedildi; yönü belirleyen geliştiricinin verdiği referanstı,
- **Ağ davranışı** — polling'in tamamen kaldırılması,
- **Veri kaynağı sınırları** — ödül tutarının sunucudan gelmesi, avatarın uydurulmaması,
- Ve bu belgenin gerçeğe sadık kalması

insan kararıdır. Aracın değeri, ürettiği kod kadar **ürettiği kodun nerede sorgulandığıyla** ölçülür.
