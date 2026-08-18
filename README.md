# Panteon — Liderlik Tablosu

Haftalık liderlik tablosu istemcisi. Idle/clicker havalimanı oyunu için
tasarlandı: oyuncu kendi sırasını kaydırmadan görür, ödül havuzunu ve sezon
geri sayımını takip eder.

**Canlı API:** `https://scalable-leaderboard-engine.onrender.com/api`

## Kurulum

```bash
npm install
npm run dev      # http://localhost:5173
```

`npm run build` üretim derlemesi, `npm run lint` statik kontrol.

## API bağlantısı

İstemci doğrudan backend'e bağlanır:
`https://scalable-leaderboard-engine.onrender.com/api`

> **Backend'de yapılması gereken:** API şu an `Access-Control-Allow-Credentials: true`
> gönderiyor ama `Access-Control-Allow-Origin` göndermiyor. Bu haliyle tarayıcı
> tüm istekleri CORS'tan bloklar (curl ile çalışır, tarayıcıda çalışmaz).
> NestJS tarafında:
>
> ```ts
> app.enableCors({ origin: true, credentials: true });
> ```

Backend düzeltilene kadar geliştirmede same-origin proxy kullanılabilir —
`vite.config.ts` içindeki dev proxy hazır:

```bash
VITE_API_BASE=/api npm run dev
```

Farklı bir ortama bağlanmak için:

```bash
VITE_API_BASE=https://baska-ortam.example.com/api npm run build
```

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

**Polling sekme arka plandayken durur.** `usePolling` görünürlüğü izler; öne
gelince bayat veri göstermemek için hemen bir kez çeker. Sıklıklar: tablo 30sn,
kendi çevren 15sn, sezon 60sn.

**Yetkili uçlar token'ı bekler.** `enabled` bayrağı olmadan `/me`, `/around` ve
`/me/rewards` kimlik alınmadan çağrılıyor ve 401 dönüyordu.

**`LeaderboardRow` tek bileşen.** Hem ilk 100 listesinde hem around
penceresinde aynı bileşen kullanılır; tek fark `isCurrentUser` prop'u. `key`
olarak `userId` verilir, index değil — sıra değiştiğinde liste baştan çizilmez.

**Ülke sekmesi istemcide filtrelenir.** Backend'de ülke filtresi yok
(`?country=` 400 döner). Çekilmiş ilk 100 üzerinde `entry.country` ile
filtrelenir — kapsamı bu yüzden ilk 100 ile sınırlıdır.

**Avatarlar `userId`'den türetilir.** API avatar alanı döndürmüyor; foto
uydurmak yerine `userId` hash'inden deterministik renk ve baş harf üretilir.
Aynı oyuncu her zaman aynı rozeti alır.

**`rank: null` ≠ `0`.** Sıralamada olmayan oyuncuya boş tablo değil, skor
gönderme ekranı gösterilir.

## Yapı

```
src/
├── api/          client.ts (fetch + token), types.ts (sözleşme)
├── hooks/        usePolling, useCountdown, useSession
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
