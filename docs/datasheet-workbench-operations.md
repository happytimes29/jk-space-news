# Datasheet Workbench operations

This runbook covers `/api/datasheet/relay`, the only server-side boundary used by the Datasheet Workbench. PDFs are parsed in the browser; the Relay receives selected text passages, model settings, an operation name, and an ephemeral bearer API key.

## Runtime contract

- Runtime: Next.js Node route, dynamic and `no-store`.
- Providers: `openai-compatible`, `anthropic`, and `gemini`.
- Allowed operations: `connect`, `discover`, `extract`, `repair`, `explain`, and `question`.
- Request body limit: 512 KiB, enforced by declared length and streamed bytes.
- Upstream success response limit: 2 MiB, enforced by declared length and streamed bytes.
- Prompt limit: 450,000 JavaScript characters; model name limit: 200 characters; bearer key limit: 4,096 non-whitespace characters.
- Upstream timeout: 60 seconds. A caller abort also cancels the provider request.
- Redirects: at most two, same-origin only, with target validation repeated for each hop.
- Browser input: PDF files no larger than 25 MiB and no more than 100 pages. A usable text layer is required.
- Responses use `Cache-Control: no-store`, `Referrer-Policy: no-referrer`, and no cookies.

The route does not implement a global rate limiter because a serverless instance cannot reliably coordinate counters. Production must apply a platform/WAF rate limit to `POST /api/datasheet/relay`, preferably per source IP with a conservative burst allowance. Monitor 429, 502, and 504 ratios and provider costs; do not add request bodies, authorization headers, prompts, or PDF text to metrics.

## Provider and SSRF behavior

Anthropic is restricted to `https://api.anthropic.com/v1/messages`. Gemini is restricted to `https://generativelanguage.googleapis.com/v1beta/models/`. OpenAI-compatible mode accepts a custom HTTPS base URL, but rejects credentials in the URL, non-443 explicit ports, localhost, `.local`, empty DNS, private/reserved IPv4 or IPv6, and redirects to a different origin. DNS results are validated before every request and redirect, then the outbound socket is pinned to those exact validated addresses so a second lookup cannot rebind the host to a private address.

An OpenAI-compatible service behind a private network, VPN, local address, nonstandard port, or cross-origin redirect is intentionally unsupported and returns `relay_target_blocked`. Do not weaken the validator to support an individual endpoint; use a publicly reachable HTTPS endpoint with stable public DNS.

## Privacy and log audit

The product is restricted to public component Datasheet PDFs. The upload screen must continue to warn against internal specifications, schematics, customer data, and confidential documents. The API key exists only in React memory and the current authorization header; it must never enter Local Storage, Session Storage, cookies, URLs, analytics, reports, or server logs.

Before each release:

1. Search `components/datasheet`, `lib/datasheet`, and `app/api/datasheet` for `localStorage`, `sessionStorage`, `cookies(`, `console.`, and `apiKey`.
2. Confirm client persistence contains provider kind/model/base URL only, if persistence is ever added; the current implementation persists none of these fields.
3. Confirm Relay logs contain only event name, provider identifier, and numeric status. They must not include headers, prompt, response body, file name, quotation, model output, or key.
4. Inspect platform request logging and tracing. Disable body/header capture for this path and verify authorization headers are redacted.
5. Download Markdown and JSON reports and confirm they contain normalized results and cited passages, never credentials or unrelated chunks.

## Deployment check

Run:

```bash
npm run lint
npm run typecheck
npm test
npm run build:local
npx playwright test tests/datasheet-workbench.e2e.ts
```

Verify `/tools/datasheet-workbench/app`, `/zh-cn/tools/datasheet-workbench/app`, and `/en/tools/datasheet-workbench/app`; confirm the Node Relay route exists in the build output. Use the E2E mock for routine verification. A real-provider smoke test requires the operator's own disposable key and a public Datasheet, and must not be recorded.

The reproducible public-PDF safety corpus, artifact hashes, and current fail-closed table limitation are recorded in `docs/datasheet-workbench-golden-corpus.md`. Update that record when a manufacturer replaces a source PDF; do not silently bless a new hash.

## Incident response and kill switch

For suspected credential exposure, runaway cost, provider abuse, SSRF regression, or sensitive content in logs:

1. Immediately block `POST /api/datasheet/relay` in the hosting platform firewall/WAF. A 403 or 503 is an acceptable emergency response; static portfolio pages and browser-only tools should remain available.
2. Revoke any affected provider keys. JK Space does not own user BYOK keys, so publish a notice asking affected users to revoke theirs when exposure is plausible.
3. Disable request-body/header capture and restrict access to existing logs. Preserve only sanitized event metadata required for investigation.
4. Roll back to the last known-good deployment or deploy a route-level 503 response. Do not point the client directly at provider APIs as a workaround.
5. Re-run Relay unit tests, the secret/persistence audit, and the mocked E2E flow before removing the platform block.

Record the incident time range, affected deployment, provider/status metadata, mitigation, and verification. Never copy prompts, PDF passages, or authorization values into the incident record.
