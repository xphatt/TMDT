# Bằng chứng runtime và kiểm thử

Ngày ghi nhận: 2026-09-13. Nội dung đã lược bỏ giá trị môi trường/bí mật; không sao chép `.env` hoặc connection string.

## Toolchain

```text
Node.js: v24.15.0
npm: 11.12.1
```

## Kết quả CLI

```text
npm run lint       PASS (exit 0)
npm run typecheck  PASS (exit 0)
npm run test:unit  PASS (5/5)
npm test           PASS (23/23; production build successful)
```

## HTTP smoke

```text
GET  /api/health                 200  status=ok, database=connected
GET  /api/menu                   200
GET  /api/admin/orders           401  unauthenticated
GET  /api/admin/dashboard        401  unauthenticated
POST /api/feedback (invalid)     400
GET  /api/address?q=ab           400
GET  /does-not-exist             404
GET  /images/product-lineup.png  200
GET  optimized image URL         200
GET  /admin                      307  /admin/login?returnTo=%2Fadmin
```

Admin response headers observed:

```text
Cache-Control: no-store
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Referrer-Policy: no-referrer
```

## Demo-mode isolation check

```text
Existing server :3000, invalid order -> 503 demo_checkout_timeout
Temporary server :3001 with demo mode disabled, invalid order -> 400 invalid_order
Temporary :3001 process was stopped after verification.
Existing :3000 process was not stopped because it was not created by this audit.
```

## Load sample

```text
Endpoint: GET /api/menu
50 requests, concurrency 5:
  elapsed=647.90 ms, throughput=77.17 req/s
  p50=57.42 ms, p95=81.34 ms, max=104.18 ms, errors=0

200 requests, concurrency 20:
  elapsed=1819.76 ms, throughput=109.90 req/s
  p50=180.70 ms, p95=194.45 ms, max=203.16 ms, errors=0
```

## Git evidence

```text
D:\TMDT is not a Git repository.
Repository found at D:\TMDT\repository.
Branch: main
Tracked file count: 1
Tracked file: README.md
Worktree: README modified; .env.example, .gitignore, GITHUB_PUSH_GUIDE.md and docs untracked.
Commit count observed: 5, one author identity.
```

## Limits

- No valid admin credential was used.
- No successful order, feedback or review was submitted to the live D1 runtime.
- No production deployment was performed.
- No independent Chrome/Edge/Firefox/Safari/WebKit run was available.
- Load figures are local samples, not production SLA measurements.
