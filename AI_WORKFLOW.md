# AI Workflow

Bu belge, arayüzün yapay zeka ile **nasıl** geliştirildiğini anlatır: hangi işler araca devredildi, hangi kararlar insanda kaldı ve üretilen kodun doğruluğu neye göre belirlendi.

Belgedeki her örnek gerçek oturum akışından ve commit geçmişinden alınmıştır.

---

## Kullanılan Tek Araç: Claude Code

Projede **başka hiçbir yardımcı IDE aracı kullanılmamıştır.**  Tüm süreç yalnızca **Claude Code** (Anthropic) terminal asistanı ile yürütüldü.

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

## Ekranda Görünmeyen Hatalar ve Nasıl Yakalandığı

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

## Önerinin Uygulanmadığı Noktalar

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

## Ölçüm Disiplini

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

## Commit Commit: Süreç Nasıl İlerledi

| Commit | Ne oldu |
| --- | --- |
| `fe167aa` | İskelet: liderlik tablosu, kendi sıra kartı, sezon geri sayımı. Görsel yön dört denemede oturdu; kabul edilen yön, verilen bir referans üzerinden belirlendi. |
| `4a4a00d` | Ülke bayrakları ve doğrudan backend bağlantısı. Proxy katmanı bilinçli olarak kaldırıldı — istemci ve sunucu ayrı projeler olduğu için gerçek CORS davranışını gizlememesi gerekiyordu. |
| `67be6b0` | **Veri kaynağı sınırı.** Ödül tutarları istemcide hesaplanmıyor, sunucudan geliyor. Aksi halde gösterilen tutar ile ödenen tutar zamanla ayrışırdı. Aynı kararla `neighbours` ve `entries` ayrımı netleşti. |
| `76f5b6f` | Ülke sıralaması istemci filtresinden sunucu parametresine taşındı. İstemcide filtrelemek yalnızca ilk 100'ü kapsıyordu; sunucuda her ülke kendi ZSET'inde indeksli olduğu için sıra numaraları ülke içinde 1'den başlıyor. |
| `fcd343a` | `strict` hiçbir tsconfig'de tanımlı değildi — Vite şablonunun varsayılanı düşürülmüştü. Kod katı ayarlarla sıfır hata verdiği doğrulanıp açıldı; bedeli olmayan bir kazanç. Aynı commit'te canlı uygulama adresi README'ye eklendi: dağıtım çalışıyordu ama belgede tıklanabilir bir link yoktu, yani karşılanmış bir kriter görünmüyordu. |
| `2066dcd` | Sekme dokunma hedefi ~28px'ti; WCAG 2.5.5 asgari 44px öneriyor. Case uygulamanın mobilde test edileceğini söylediği için doğrudan ilgiliydi. |
| `129b3f3` | `LeaderboardRow`'daki `memo` yorumu "polling her 15-30 sn'de tazeliyor" diyordu ama polling kaldırılmıştı. Karar doğruydu, gerekçesi yanlış yazılmıştı. İki ölü export da kaldırıldı. |

### Mobil taşmanın kovalanması

Dar ekranda sayfanın sağa kaydığı bildirildi. İlk bakışta satır yapısı doğru görünüyordu: `min-w-0 flex-1 truncate` zinciri kuruluydu, sabit genişlik yoktu.

Ölçüm sorunu üç katmanda buldu:

1. **`CoinValue` `shrink-0` değildi.** Uzun bir skor (`4.526.619`) esnek satırı zorluyordu. Boş listede görünmeyen, yalnızca veri gelince ortaya çıkan bir kırılma.
2. **`panel-gold` ve `capsule` `box-sizing: border-box` almıyordu.** `@utility` içinde tanımlı `border: 4px` genişliğe dahil olmuyor, iç içe geçtikçe birikiyordu.
3. **Grid kolonu `min-width: auto` varsayılanındaydı.** Asıl sebep buydu: `lg:grid-cols-[1fr_19rem]` içindeki panel, içeriği kadar genişleyip kapsayıcıyı aşıyordu. `minmax(0,1fr)` ile çözüldü.

375px viewport'ta ölçülen sonuç: taşan eleman **17 → 0**, panel sağ kenarı **387px → 378px** (viewport 390).

Buradaki ders şu: "responsive görünüyor" ile "ölçüldü" arasındaki fark, tam da veri geldiğinde ortaya çıkıyor.

### Havacılık paleti

Oyun bir havalimanı temasında olduğu için renkler yeniden kuruldu. İlk deneme gündoğumu pisti (turuncu-krem paneller) yönündeydi ve reddedildi: havalimanı bağlamında saman tonu yanlış çağrışım yapıyordu. Kabul edilen yön **uçak gövdesi** oldu — gece gökyüzü zemin, beyaz-gri paneller, pist yeşili para vurgusu.

**Hiçbir bileşene dokunulmadı.** Tema tokenlarının adları korunup yalnızca değerleri değiştirildi, çünkü tasarımın katman mantığı (koyu zemin → açık panel → daha açık kapsül) zaten doğru kurulmuştu. Palet değişimi tek dosyada, `@theme` bloğunda gerçekleşti.

Aynı turda 10 bileşene dağılmış sabit hex renkleri (`#a8620c` tek başına 10 yerde geçiyordu) tema tokenlarına çevrildi — palet artık tek noktadan yönetiliyor ve ikinci bir yön değişikliği yine tek dosyayla yapılabilir.

---

## Özetle

Yapay zeka bu projede **iskelet kurma, API sözleşmesini keşfetme, tekrarlayan bileşen yazımı, ölçüm ve dokümantasyon taslağı** aşamalarında hız kazandırdı.

Arayüz tarafında aracın belirleyici yeteneği tarayıcıyı sürebilmesiydi: üretilen ekran aynı oturumda açıldı, DOM ölçüldü, ağ trafiği sayıldı. "Derleniyor" ile "ekranda doğru görünüyor" arasındaki fark birkaç kez burada ayrıştı — en somut örneği mobil taşma: satır yapısı koda bakınca doğruydu, ölçünce üç ayrı katmanda kırıldığı görüldü.

Buna karşılık yön insanda kaldı:

- **Görsel yön** — hem ilk tasarım turunda hem palet seçiminde; her ikisinde de ilk öneri reddedildi
- **Veri kaynağı sınırları** — ödül tutarının sunucudan gelmesi, avatarın uydurulmaması
- **Ağ davranışı** — polling'in tamamen kaldırılması, canlılık yerine sessiz ekran tercihi
- **Kapsam** — hangi kırılmanın düzeltileceği, hangisinin bırakılacağı

Bir aracın değeri, ürettiği kod kadar **ürettiği kodun nerede sorgulandığıyla** ölçülür.
