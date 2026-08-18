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
| Ülke filtresi | `?country=` canlı ölçüm (TR / ZZ / TURKEY) | ✅ 200 · boş liste · 400 |
| Ülke içi sıralama | `mid` personası: global vs ülke sırası | ✅ Global **2476** → RU içinde **129/249** |
| CORS (üretim) | `*.vercel.app` origin'leriyle preflight + GET | ✅ Başlık dönüyor; whitelist dışına dönmüyor |
| Üretim derlemesi | `vite preview`, proxy yok, canlı backend | ✅ Tüm ekranlar çalıştı |

### Doğrulanamayan bir adım ve nasıl raporlandığı

Mobil düzen **gerçek dar ekranda görsel olarak doğrulanamadı.** Tarayıcı eklentisi pencereyi yeniden boyutlandıramadı; `resize_window` çağrısı sessizce etkisiz kaldı (ekran görüntüsü hâlâ 1568 piksel geldi).

Burada iki seçenek vardı: "responsive sınıflar yazıldı, çalışır" demek, ya da neyin ölçüldüğünü daraltmak. İkincisi yapıldı — derlenmiş CSS'te kırılım noktalarının gerçekten üretildiği doğrulandı (`@media (width>=40rem)`, `@media (width>=64rem)`), ama **görsel teyidin yapılmadığı açıkça geliştiriciye bildirildi.**

Doğrulanamayan bir adım "başarılı" sayılmadı, açık bir eksik olarak işaretlendi.

---

## Human-in-the-Loop: Kararların Nerede Verildiği

Yapay zeka bu projede hiçbir zaman tek başına yön belirlemedi. Kod yazmaya başlamadan önce, farklı okumaların **maddi olarak farklı işe** yol açacağı noktalarda araç durdu ve seçenekleri gerekçeleriyle sundu.

### Tasarım yönü: dört kez reddedilen öneri

Bu projenin en belirleyici geri bildirim döngüsü tasarım tarafında yaşandı. Araç arka arkaya **dört ayrı yön** önerdi, geliştirici dördünü de reddetti:

| # | Aracın önerisi | Reddedilme gerekçesi |
|---|---|---|
| 1 | Koyu tema + mor→pembe gradient, emoji rozetler | Jenerik yapay zeka çıktısı izlenimi veriyor; bir oyun stüdyosunun ürününe yakışmıyor |
| 2 | Havalimanı bilgi panosu (FIDS): amber fosfor, dar grotesk | Emoji sorunu giderildi, ancak yön bir oyun arayüzü olarak tutmadı |
| 3 | Açık bej "biniş kartı": kağıt dokusu, mürekkep laciverti | Basılı evrak estetiği; oyun arayüzünden uzak |
| 4 | Kokpit koyu arduvaz + tek amber aksan | Renk paleti değişti, yerleşim hâlâ kurumsal panel düzeninde |

Beşinci turda geliştirici **referans görsel** verdi: casual mobil oyun arayüzü — ahşap zemin, kurdele başlıklı altın panel, kapsül satırlar, kabartma düğmeler. Nihai tasarım budur.

Buradaki asıl nokta: **görsel yön araç tarafından bulunmadı.** Araç dört kez denedi ve dördü de tutmadı; yönü belirleyen şey geliştiricinin verdiği referanstı. Aracın katkısı, o referansı web'e çevirmek (Tailwind `@theme` token'ları, `perf-l` perfore kenar, `btn3d` basılabilir düğme) oldu — yönü seçmek değil.

Aynı şekilde emoji kullanımı da geliştiricinin kararıdır: emoji rozetlerinin arayüzü ucuzlaştırdığı gerekçesiyle kaldırılması istendi. Bayrak emojileri önce ISO kod rozetine, ardından geliştiricinin talebiyle gerçek bayrak görsellerine (`flagcdn`) çevrildi.

### Geliştiricinin verdiği diğer kararlar

| Karar | Geliştiricinin seçimi | Sonucu |
|---|---|---|
| **CORS nasıl çözülsün?** | Proxy kalksın, doğrudan backend'e bağlan | Vite dev proxy'si tamamen silindi; CORS'un backend'de çözülmesi gerektiği README'ye not düşüldü |
| **Avatar nereden gelsin?** | `userId`'den deterministik türet | API avatar döndürmüyor; sahte fotoğraf yerine hash'ten renk + baş harf. Aynı oyuncu hep aynı rozeti alır |
| **Ülke sekmesi olsun mu?** | Evet | Önce istemci tarafı filtre ile yapıldı; backend ülke ucunu ekleyince sunucu tarafı filtreye geçildi (aşağıya bakınız) |
| **Demo persona sayısı** | Dördü de kalsın | `mid` (#2476) ile `outside` (#121) aynı ekranı farklı derinlikte gösteriyor |
| **Ağ trafiği ne olsun?** | Polling tamamen kalksın | Talep açıktı: istek yalnızca tetiklendiğinde atılmalı. Zamanlayıcılar silindi, yerine manuel yenile düğmesi kondu |
| **Logo** | Marka logosu kullanılsın | `public/logo.png`; favicon logodan örneklenen `#ef6723` ile yeniden çizildi |

Bu kararların hiçbiri araç tarafından varsayılmadı.

### Belirsizliğin varsayımla doldurulmaması

Oturumun başında rehber metni `country` alanının satırlarda bulunduğunu varsayıyordu, ama canlı API'de o alan yoktu ve `?country=TR` **400** dönüyordu. Araç bunu ölçtü ve sessizce bir yol seçmek yerine **geliştiriciye sordu**: bayraklar tamamen çıksın mı, istemcide uydurulsun mu, yoksa sekme yarım mı bırakılsın?

Geliştiricinin cevabı üç seçenekten de farklı oldu: alan bu sırada backend'e eklenmişti ve elde edilen veri eski dağıtımdandı; yeniden çekilmesi istendi. Çekildiğinde alan gerçekten geliyordu. Yanlış varsayımla ilerlenseydi ya sahte veri üretilecek ya da var olan bir özellik atlanacaktı.

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

Geliştirici ağ panelindeki kırmızı satırları fark etti ve bunların ne olduğunu sordu. Araç bunları hata olarak kabul etmek yerine inceledi:

- Satırlarda `(cancelled)` yazıyordu, `failed` değil
- Hepsi **0.0 kB** idi
- Her uç ekranda **iki kez** vardı: biri iptal, biri **200**

Teşhis: React StrictMode dev'de bileşenleri iki kez mount ediyor, veri hook'unun cleanup'ı ilk turu `abort()` ediyordu. Yani beklenen davranıştı ve üretim derlemesinde hiç oluşmuyordu.

Teknik olarak zararsız olmasına rağmen geliştirici bu satırların kalmamasını istedi; gerekçe, değerlendirmede performans göstergelerine dikkat edilmesiydi. Burada iki yol vardı: StrictMode'u kapatmak (gerçek cleanup hatalarını gizlerdi) ya da isteği tekilleştirmek. **İkincisi seçildi**: `client.ts`'te uçuştaki GET istekleri paylaşılıyor, ikinci mount yeni bağlantı açmıyor. Semptom yerine sebep giderildi ve StrictMode'un koruması korundu.

### Belgedeki bir iddianın geliştirici tarafından düzeltilmesi

Belgenin ilk halinde şöyle bir madde vardı: *"Backend'de ülke filtresi yok
(`?country=` 400 döner); ilk 100 üzerinde istemcide filtreleniyor."*

Bu, yazıldığı anda **ölçülmüş ve doğruydu** — `?country=TR` gerçekten 400
dönüyordu ve altı farklı parametre adı ile altı ayrı uç denenmiş, hepsi
400/404 vermişti.

Geliştirici bu maddeye itiraz etti: ülke sıralaması çalışıyordu. Araç
iddiasını savunmak yerine yeniden ölçtü ve **hâlâ 400 aldı**; ardından iki
olasılığı ayırıp geliştiriciye sordu: backend'e yeni bir uç mu eklendi, yoksa
kastedilen şey arayüzdeki sekmenin çalışması mıydı?

Cevap birincisiydi. Backend bu sırada güncellenmişti ve ölçüm yeniden
yapıldığında filtre canlıydı:

```
GET /leaderboard?country=TR&limit=3  →  200, total: 256, sıralar 1'den başlıyor
GET /leaderboard?country=ZZ          →  200, total: 0, boş liste
GET /leaderboard?country=TURKEY      →  400
```

Bunun üzerine istemci tarafı filtre **tamamen kaldırıldı** ve sunucu filtresine
geçildi. Fark yalnızca teknik değil, işlevseldi:

| | İstemci filtresi (eski) | Sunucu filtresi (yeni) |
|---|---|---|
| Kapsam | Yalnızca global ilk 100 içindeki hemşehriler | Ülkedeki **tüm** oyuncular |
| Sıra numarası | Global sıra (ör. 2476) | Ülke içi sıra (ör. 129) |
| 150. sıradaki oyuncu | Listede **hiç görünmüyordu** | Görünüyor |

Canlı doğrulama, özelliğin asıl değerini gösteriyor: globalde **2476.** olan bir
oyuncu kendi ülkesinde **129/249**. İlk 100'e giremeyen oyuncunun ekranda
anlamlı bir yeri olması, bu ekranın çözmesi gereken problemin ta kendisiydi.

Buradaki asıl nokta iki yönlüdür. Araç doğrulanmış bir ölçüme dayandığı için
iddiasını hemen terk etmedi, yeniden ölçtü — ama ölçüm ile geliştiricinin
bildiği arasındaki çelişkiyi **varsayımla kapatmadı**, ayrıştırıcı bir soru
sordu. Belge, ölçüm tekrarlandıktan sonra düzeltildi.

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

## Dağıtım Hazırlığı

Vercel'e çıkmadan önce yapılan hazırlık da ölçümle yürüdü; yapılandırma
yazılmadan önce hedef ortamın gerçekten çalışacağı doğrulandı.

**CORS'un üretimde çalışacağı önceden sınandı.** Kod yazmak yerine önce
backend'e Vercel benzeri origin'lerle istek atıldı. Sonuç, belgedeki açık
riskin kapandığını gösterdi: backend artık `Access-Control-Allow-Origin`
gönderiyor ve `*.vercel.app` alt alan adlarının tamamını kabul ediyor —
yani preview dağıtımları da çalışacak. Whitelist dışındaki bir origin'e
(`https://kotu-site.example.com`) başlık dönmediği ayrıca doğrulandı; izin
politikası açık değil, kısıtlı.

**Üretim derlemesi gerçekten çalıştırıldı.** `npm run build` çıktısı
`vite preview` ile, geliştirme sunucusu ve proxy olmadan servis edildi;
canlı backend'e karşı tüm ekranlar açıldı. Bu sırada bir ölçüm hatası da
yakalandı: ilk deneme `4173` portunda yapıldı ve ekran hata verdi. Sebep
kodda değildi — o port backend whitelist'inde yoktu. Ölçüm whitelist'teki
portta tekrarlandı ve uygulama sorunsuz çalıştı. **Hata mesajı olduğu gibi
kabul edilip koda müdahale edilmedi**, önce sebebi ayrıştırıldı.

**Boş ortam değişkenine karşı sağlamlaştırma.** `VITE_API_BASE` için
`??` operatörü kullanılıyordu; bu, değişken Vercel'de **boş string** olarak
tanımlanırsa varsayılana düşmez ve uygulama kırılırdı. `trim() ||` kontrolüne
çevrildi ve sondaki eğik çizgi temizlemesi eklendi. Bu, üretimde gerçekleşmesi
kolay ama fark edilmesi zor bir hata sınıfıydı.

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
- ~~**Backend CORS başlığı göndermiyor.**~~ **Kapatıldı.** Backend güncellendi; `Access-Control-Allow-Origin` artık gönderiliyor ve `localhost:5173` ile `*.vercel.app` origin'lerine izin veriliyor. Whitelist dışına başlık gönderilmiyor. Üretim derlemesi proxy'siz olarak canlı backend'e karşı çalıştırılıp doğrulandı.
- ~~**"Ülkem" sekmesi yalnızca ilk 100'ü kapsar.**~~ **Kapatıldı.** Backend'e `country` parametresi eklendi; sıralama artık sunucuda, ülkedeki tüm oyuncular üzerinde yapılıyor ve sıra numaraları ülke içinde 1'den başlıyor.
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
