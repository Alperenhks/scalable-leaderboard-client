# Panteon — Liderlik Tablosu

Haftalık liderlik tablosu istemcisi. Idle/clicker havalimanı oyunu için
tasarlandı: oyuncu kendi sırasını kaydırmadan görür, ödül havuzunu ve sezon
geri sayımını takip eder.

**▶ Canlı uygulama:** https://scalable-leaderboard-client.vercel.app

**Canlı API:** `https://scalable-leaderboard-engine.onrender.com/api`
**Backend deposu:** https://github.com/Alperenhks/scalable-leaderboard-engine

> İstemci ve sunucu ayrı depolarda ve ayrı dağıtılır (Vercel / Render); bu
> depo yalnızca istemciyi barındırır.

## Kurulum

```bash
npm install
npm run dev      # http://localhost:5173
```

`npm run build` üretim derlemesi, `npm run lint` statik kontrol.

## API bağlantısı

İstemci doğrudan backend'e bağlanır:
`https://scalable-leaderboard-engine.onrender.com/api`

Farklı bir ortama bağlanmak için `VITE_API_BASE` ver:

```bash
VITE_API_BASE=https://baska-ortam.example.com/api npm run build
```

Değişken tanımsız ya da boş bırakılırsa üretim backend'ine düşer.

> **CORS:** Backend `Access-Control-Allow-Origin` başlığını gönderiyor ve
> `localhost:5173` ile `*.vercel.app` origin'lerine izin veriyor. Whitelist
> dışındaki origin'lere başlık gönderilmiyor (bilinçli kısıtlama).
> Farklı bir port ya da alan adından yayın yapacaksan backend whitelist'ine
> eklenmesi gerekir — örneğin `vite preview` varsayılan portu 4173 listede
> değildir.

## Vercel'e dağıtım

Depo Vercel'e bağlandığında ek yapılandırma gerekmez; `vercel.json` framework,
derleme komutu ve çıktı dizinini tanımlar.

1. Vercel'de **New Project** → bu depoyu içe aktar.
2. Framework otomatik **Vite** algılanır (`vercel.json` bunu sabitler).
3. Environment Variables **isteğe bağlıdır** — boş bırakılırsa üretim
   backend'i kullanılır. Farklı bir backend için:
   `VITE_API_BASE = https://.../api`
4. Deploy.

`*.vercel.app` alan adları backend CORS whitelist'inde olduğu için preview
dağıtımları da çalışır. Özel bir alan adı bağlarsan backend'e eklenmesi gerekir.

`VITE_` öneki olmayan değişkenler istemci paketine dahil edilmez. Bu paket
tamamen istemci tarafında çalışır; **gizli bilgi (API anahtarı, secret)
konulmamalıdır** — derleme anında paketin içine gömülür ve herkese görünür.

## Ekranlar

Sağ üstteki oyuncu seçici token'ı arka planda değiştirir; dört durum tek tıkla
denenebilir:

| Mod | Sıra | Ne gösterir |
| --- | --- | --- |
| Zirvedeki oyuncu | 1 | `inTopWindow: true` — kutlama, satır listede işaretli |
| Ortalama oyuncu | ~2476 | İlk 100 dışı, derin sıra |
| İlk 100 dışı | 121 | **Asıl senaryo:** kopukluk göstergesi + 6 kayıt |
| Skoru olmayan | `null` | Boş tablo değil, "Skor Gönder" ekranı |

## Kararlar

**Para asla `Number` ile işlenmez.** `poolAmount`, `balance`, `amount` string
gelir. `lib/money.ts` bunları `bigint` kuruşa çevirir; ödül payları tamsayı
aritmetiğiyle hesaplanır (`lib/prize.ts`), böylece kuruş kaybı olmaz. `Number`
yalnızca `Intl` ile biçimlendirme anında kullanılır.

**Geri sayım istemcide yürür.** `secondsRemaining` sunucudan bir kez alınır,
`useCountdown` timestamp farkından sayar — sekme arka plandayken `setInterval`
kısılsa bile geri dönüşte doğru kalır. Saniyede istek atılmaz.

**Arka planda periyodik istek yok.** Veriler açılışta bir kez çekilir; sonra
yalnızca kullanıcı yenile dediğinde, persona değiştiğinde veya skor
gönderildiğinde tazelenir. Ölçüldü: 31 saniye boşta beklemede **0 istek**,
yenile düğmesinde 6 istek. Karşılığında tablo canlı güncellenmez — bilinçli
bir denge.

**Yetkili uçlar token'ı bekler.** `enabled` bayrağı olmadan `/me`, `/around` ve
`/me/rewards` kimlik alınmadan çağrılıyor ve 401 dönüyordu.

**`LeaderboardRow` tek bileşen.** Hem ilk 100 listesinde hem around
penceresinde aynı bileşen kullanılır; tek fark `isCurrentUser` prop'u. `key`
olarak `userId` verilir, index değil — sıra değiştiğinde liste baştan çizilmez.

**Ülke sıralaması sunucudan gelir.** `/leaderboard` ve `/leaderboard/around`
uçları `country` parametresi alır; sıralama o ülkeyle sınırlanır ve sıra
numaraları ülke içinde 1'den başlar. Böylece globalde 2476. olan oyuncu kendi
ülkesinde 129/249 olarak görünür — ilk 100'e giremeyen oyuncunun ekranda
anlamlı bir yeri olur. Geçersiz kod 400, bilinmeyen ülke boş liste döner.
Ülke verisi yalnızca sekme açıldığında çekilir.

**Ödül tutarları sunucudan gelir.** `GET /rewards/projection` tek kaynaktır;
istemcide yeniden hesaplanmaz, böylece gösterilen tutar ödenecek tutardan
ayrışmaz. Yanıttaki `me.isEligible` ve `me.pointsToEligible` "ödül bölgesine ne
kadar kaldı" mesajını besler.

**"Çevrem" `neighbours` alanını kullanır.** Uzunluğu 3–6 arası değişir (1. sırada
üstte kimse yok, son sırada altta kimse yok); sabit varsayılmaz. Kendi satırı
index ile değil `isCurrentUser` ile bulunur. Sıralamada olmayan oyuncuda bu dizi
boş döner ve skor gönderme ekranı gösterilir.

**Bayraklar flagcdn'den gelir.** `entry.country` ISO kodu
`https://flagcdn.com/w20/{kod}.png` adresine çevrilir (retina için `w40` 2x).
Kod yoksa ya da CDN 404 dönerse bayrak hiç çizilmez — kırık görsel çıkmaz.

**Avatarlar `userId`'den türetilir.** API avatar alanı döndürmüyor; foto
uydurmak yerine `userId` hash'inden deterministik renk ve baş harf üretilir.
Aynı oyuncu her zaman aynı rozeti alır.

**`rank: null` ≠ `0`.** Sıralamada olmayan oyuncuya boş tablo değil, skor
gönderme ekranı gösterilir.

## Yapı

```
src/
├── api/          client.ts (fetch + token), types.ts (sözleşme)
├── hooks/        useResource, useCountdown, useSession
├── lib/          money (bigint kuruş), prize (pay hesabı), format, utils
└── components/
    ├── leaderboard/   LeaderboardRow · LeaderboardList · AroundWindow
    ├── season/        SeasonHeader · PrizeBreakdown
    ├── player/        MyRankCard · PlayerSwitcher · RewardHistory
    └── ui/            GamePanel · button · tabs · dropdown-menu ·
                       RankMedal · PlayerAvatar · CoinValue · CountryTag
```

Tailwind v4 + Radix (shadcn/ui deseni). Tema `src/index.css` içinde `@theme`
ile tanımlı: ahşap zemin, altın panel, kurdele başlık, kabartma düğmeler.

## Notlar

- Render ücretsiz katmanda 15 dk hareketsizlikten sonra uyur; ilk istek ~50 sn
  sürebilir. Açılışta iskelet ekran ve bilgi metni gösterilir.
- Backend `limit` üst sınırı 100'dür; 100 satır sanallaştırma gerektirmez.
- `country` alanı `null` olabilir; her yerde kontrol edilir.
