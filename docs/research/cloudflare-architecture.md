# Cloudflare architecture for Project Mandala

Research date: 2026-08-12  
Question: Which current Cloudflare products and constraints fit a 5,000-participant WhatsApp survey with live aggregates, weekly updates, AI assistance, deterministic fallback, operational anonymity, and indefinite retention of anonymous responses?

## Decision

Keep the existing React + Hono + Cloudflare Workers scaffold and use a **Workers Paid** account for the live launch. Deploy the React dashboard as Worker Static Assets and keep the Hono API, webhook handlers, scheduled handler, and queue consumer in the same Worker initially.

Use:

- two D1 databases: one short-lived contact/conversation store and one permanent anonymous survey store;
- one Cloudflare Queue plus a dead-letter queue for outbound WhatsApp work;
- one Cron Trigger to create the weekly update run and enqueue its recipients;
- AI Gateway in front of an explicitly chosen inference provider, with AI unavailable by design to all critical survey operations;
- Workers Logs/metrics and D1 metrics for platform visibility, plus a privacy-safe operational ledger in D1;
- a private R2 bucket and a small scheduled Workflow to export only the anonymous survey database beyond D1's 30-day recovery window.

Do **not** add Pages, KV, Durable Objects, Analytics Engine, Vectorize, or a separate dashboard service at launch. None solves a demonstrated requirement at this scale.

## Why the proposed core stack fits

### Workers, Hono, and React: keep

The current scaffold already matches Cloudflare's supported full-stack shape: its Vite integration builds React front-end assets and runs the API in the Workers runtime. Cloudflare documents React SPA + Worker API as a supported use case, and Static Assets can serve an SPA and its API from one Worker deployment ([React + Vite](https://developers.cloudflare.com/workers/framework-guides/web-apps/react/), [Vite plugin](https://developers.cloudflare.com/workers/vite-plugin/), [Static Assets routing](https://developers.cloudflare.com/workers/static-assets/routing/worker-script/)). Hono officially supports Workers bindings and can export `fetch` alongside `scheduled` handlers, so it does not obstruct the proposed scheduling model ([Hono's Cloudflare Workers guide](https://hono.dev/docs/getting-started/cloudflare-workers)).

One deployable is enough at launch:

- static dashboard files are served asset-first;
- `/api/*` serves public aggregate reads;
- `/webhooks/whatsapp` handles inbound provider callbacks;
- the `scheduled()` handler creates a weekly delivery run;
- the `queue()` handler calls the WhatsApp provider.

Splitting these into multiple Workers would add deployment and service-binding seams without a current isolation or scaling need.

The production service should use Workers Paid. Workers Free is limited to 100,000 requests per day and 10 ms CPU per HTTP invocation; Workers Paid has no daily request cap, defaults to 30 seconds CPU with a configurable maximum of five minutes, and both plans have 128 MB per isolate. A 5,000-person multi-turn chat plus dashboard polling can plausibly cross 100,000 invocations on a busy day even though the participant count itself is small ([Workers limits](https://developers.cloudflare.com/workers/platform/limits/)). Paid capacity is risk removal, not a signal that the workload is computationally large.

### D1: keep, but separate retention domains

D1 is sufficient for this workload. On Workers Paid, one D1 database can hold 10 GB; rows per table are unlimited within that storage limit; a query may run for 30 seconds; and one database processes queries serially. Cloudflare's own approximation says a database can process about 1,000 one-millisecond queries per second, while overload is possible if its queue fills. Five thousand survey responses over days are far below the storage and expected write-throughput constraints, provided queries are indexed and bounded ([D1 limits](https://developers.cloudflare.com/d1/platform/limits/)).

Use two databases to make the retention boundary concrete:

1. **Contact database**: WhatsApp number, provider message idempotency records, conversation/draft state, update opt-in, unsubscribe state, and delivery ledger. It must not retain a response identifier after submission and must be purged according to the 30-day post-close rule.
2. **Survey database**: anonymous response, profile answers, choice, moderated write-in candidate state, edit-token verifier, aggregate counters, questionnaire edition, and survey state. It contains no phone number or reversible contact lookup and is retained indefinitely.

This is operational separation, not absolute anonymity: the same Worker can access both bindings, and transient conversation state necessarily links a phone to an unfinished draft. The implementation specification still needs to define the submit state machine, deletion proof, token hashing, and which operational records count as contact data.

Keep response rows and aggregate counters in the same survey database. D1 `batch()` executes statements as a transaction and rolls the sequence back if one fails, so response create/edit and counter changes can be atomic ([D1 `batch()`](https://developers.cloudflare.com/d1/worker-api/d1-database/#batch)). Unique indexes should enforce immutable invariants such as one response per edit token or one aggregate row per edition/category; indexes also reduce rows scanned and are appropriate for equality filters used by the dashboard ([D1 indexes](https://developers.cloudflare.com/d1/best-practices/use-indexes/)).

Do not calculate every dashboard result by repeatedly scanning all raw responses. D1 bills by rows scanned; Cloudflare's pricing example shows that a full scan of a 5,000-row table counts as 5,000 rows read. The Free plan permits 5 million rows read per day, so only 1,000 such refreshes would exhaust that allowance ([D1 pricing](https://developers.cloudflare.com/d1/platform/pricing/)). Maintain coarse aggregate rows transactionally, apply the small-cell threshold in the API, and serve the aggregate endpoint through the Workers Cache API with a short public TTL ([Workers Cache API](https://developers.cloudflare.com/workers/runtime-apis/cache/)). This avoids KV and bounds both cost and accidental disclosure. The API—not React—must suppress any cell below three and must expose only approved one-dimensional groupings until the dashboard decision ticket says otherwise.

Read replication is unnecessary at launch. If measurement later shows globally distributed dashboard read latency, D1 read replication can be enabled without extra replica charges, but the Sessions API is required to use replicas. Replicas are asynchronous; `withSession("first-primary")` is the relevant starting constraint when a request must observe the latest committed standing ([D1 read replication](https://developers.cloudflare.com/d1/best-practices/read-replication/)).

## Justified additions

### Queues and a dead-letter queue: required for outbound work

A Cron invocation must not issue 5,000 WhatsApp requests directly. Workers allow only six simultaneous outgoing connections per invocation, and `waitUntil()` only extends an HTTP invocation by up to 30 seconds. Queue consumers instead have a 15-minute wall-clock limit, support batches of up to 100 messages, configurable concurrency, retries, and delayed retry. Queue limits—5,000 messages/second per queue, 25 GB backlog, and 250 concurrent push consumers—are comfortably above this workload ([Workers limits](https://developers.cloudflare.com/workers/platform/limits/), [Queues limits](https://developers.cloudflare.com/queues/platform/limits/)). The actual throughput setting must be below api.co.id's documented rate limit, which this research did not establish.

Use one outbound queue for acknowledgements, survey replies, weekly updates, and the final update. Include message class and priority in each small queue payload. A separate dead-letter queue is justified because, without one, a message that exhausts retries is deleted; Cloudflare's default is three retries ([batching and retries](https://developers.cloudflare.com/queues/configuration/batching-retries/), [dead-letter queues](https://developers.cloudflare.com/queues/configuration/dead-letter-queues/)).

Queues provide at-least-once delivery, so duplicates are possible. Every outbound message needs a stable idempotency key such as `(delivery_run, contact, template)`, recorded in the contact database and passed to the provider if its API supports idempotency ([Queues delivery guarantees](https://developers.cloudflare.com/queues/reference/delivery-guarantees/)). Retry 429 and transient 5xx responses with delay/backoff; permanently reject invalid-recipient and unsubscribe failures; expose DLQ depth to the maintainer.

Workers Paid is also the sensible queue tier. A successful queue message normally costs three operations (write, read, delete). One weekly 5,000-recipient run therefore uses about 15,000 operations before retries, above the Free plan's 10,000 included operations per day. Paid includes one million operations per month and supports configurable retention up to 14 days; Free retention is fixed at 24 hours ([Queues pricing](https://developers.cloudflare.com/queues/platform/pricing/)).

### Cron Trigger: required, but only as an idempotent producer

One weekly Cron Trigger should create a uniquely keyed delivery run and enqueue eligible, opted-in contacts in bounded batches. Cron expressions execute in UTC and configuration changes can take up to 15 minutes to propagate ([Cron Triggers](https://developers.cloudflare.com/workers/configuration/cron-triggers/)). A weekly trigger receives up to 15 minutes CPU on Workers Paid because its interval is at least one hour, but the handler should still do little more than create the run and enqueue work ([Workers limits](https://developers.cloudflare.com/workers/platform/limits/#cpu-time)).

Treat a schedule firing as repeatable: use the intended period—not `Date.now()` alone—as the unique delivery-run key, and skip recipients already enqueued for that run. The scheduled handler should return/await the work whose outcome must appear in Cron event status ([Scheduled Handler](https://developers.cloudflare.com/workers/runtime-apis/handlers/scheduled/)). This makes a repeated or manually retriggered run safe.

### AI Gateway plus an inference provider: keep Gateway, add the missing model

AI Gateway does not itself make AI decisions; it fronts a Cloudflare or third-party model endpoint and adds logging, caching, rate limits, analytics, routing, and spend controls. The architecture must therefore name one actual provider: either a Workers AI binding/model or a supported external provider through Gateway ([AI Gateway REST API](https://developers.cloudflare.com/ai-gateway/usage/rest-api/)). Workers AI is the lowest-integration Cloudflare-native option. Its current default text-generation limit is 300 requests per minute, which is likely adequate for optional assistance but must be load-tested against launch bursts ([Workers AI limits](https://developers.cloudflare.com/workers-ai/platform/limits/)).

AI remains outside the correctness path:

- deterministic state and approved buttons/lists handle every questionnaire answer;
- deterministic code validates submit/edit, computes standing, opts out, and responds when AI fails or returns 429;
- AI may explain prompts, classify non-critical intent, or suggest moderation groupings, but cannot write a final choice or aggregate directly;
- an AI timeout produces a static menu/help response, not a failed survey turn.

Gateway logs are privacy-sensitive: logging is enabled by default and includes prompts and model responses. Send `cf-aig-collect-log-payload: false` for participant traffic (or disable payload logging at the gateway), keep only non-identifying metadata, never attach phone numbers as custom metadata, and skip cache for personalized prompts with `cf-aig-skip-cache` ([AI Gateway logging](https://developers.cloudflare.com/ai-gateway/observability/logging/), [AI Gateway caching](https://developers.cloudflare.com/ai-gateway/features/caching/)). Configure rate and spend ceilings so optional AI can fail closed to the deterministic path. Current Gateway limits include 500 stored logs/second and, only when using Cloudflare-managed Unified Billing credentials, 200 requests per 60 seconds per gateway; BYOK is exempt from that particular limit ([AI Gateway limits](https://developers.cloudflare.com/ai-gateway/reference/limits/)).

### R2 plus one scheduled Workflow: required for indefinite recoverability, not request serving

Keeping rows indefinitely in D1 does not provide an indefinite recovery window. D1 Time Travel is always on but reaches only 30 days on Workers Paid (seven days on Free). Cloudflare explicitly recommends exporting D1 to R2 when a database state must be kept longer than 30 days ([D1 Time Travel](https://developers.cloudflare.com/d1/reference/time-travel/)).

Before live launch, configure exports of **only the survey database** to a private R2 bucket. Do not export the contact database, because doing so would defeat the promised phone-number deletion. Cloudflare's documented pattern uses a scheduled Workflow to start the asynchronous D1 REST export, poll it, download the SQL dump, and store it in R2 with step retries ([D1 backup Workflow](https://developers.cloudflare.com/workflows/examples/backup-d1/)). A running D1 export blocks other database requests, so execute it outside active intake peaks; the first permanent snapshot should be taken immediately after survey close ([D1 import/export limitations](https://developers.cloudflare.com/d1/best-practices/import-export-data/#known-limitations-1)). R2 has unlimited objects and storage per bucket under its platform limits, so the data volume is immaterial ([R2 limits](https://developers.cloudflare.com/r2/platform/limits/)).

Use immutable dated object keys, record a checksum and successful backup timestamp, test a restore before trial completion, and decide backup cadence/RPO plus bucket retention in the data-lifecycle ticket. Workflow steps can retry, so each external side effect must be idempotent ([Rules of Workflows](https://developers.cloudflare.com/workflows/build/rules-of-workflows/)). This Workflow is for backup orchestration only; using Workflows for each chat message or weekly recipient would be needless complexity beside Queues.

## Observability and secrets

The scaffold already enables Workers observability. Keep it. Workers metrics expose request/error status, CPU, wall time, and memory for up to three months. Workers Logs retain only three days on Free and seven days on Paid, with a 256 KB maximum log size ([Workers metrics](https://developers.cloudflare.com/workers/observability/metrics-and-analytics/), [Workers Logs](https://developers.cloudflare.com/workers/observability/logs/workers-logs/)). Therefore platform logs are diagnostic, not the permanent audit record.

Record these privacy-safe application facts in D1: webhook deduplication result, survey state transition, delivery-run counts, sent/failed/unsubscribed outcome, DLQ reconciliation, aggregate invariant checks, and last successful backup. Do not log webhook bodies, phone numbers, edit tokens, free-text answers, prompts, or model responses. Use random correlation IDs that cannot join the contact and survey databases after submission.

Use Worker secrets for api.co.id credentials, webhook verification material, AI credentials, edit-token pepper, and phone pseudonymization keys. Cloudflare explicitly warns not to place secrets in plaintext Wrangler `vars`; deployed secret values are hidden from Wrangler and the dashboard after creation ([Workers secrets](https://developers.cloudflare.com/workers/configuration/secrets/)). Front-end assets must contain no secret.

Minimum operational alerts should cover Worker 5xx/1101/1102 rates, D1 overload/errors, webhook signature failures, queue age/backlog, DLQ count, outbound provider 429/5xx rates, Cron run absence, weekly sent/failed totals, AI fallback rate, and backup age. Native metrics and logs are enough initially; Analytics Engine is not justified until a durable high-cardinality telemetry question exists.

## Capacity conclusion

The target of 5,000 participants does not require sharding, Durable Objects, or a separate analytics database. The risk is not raw compute; it is bursty multi-turn traffic, unbounded dashboard scans, duplicate delivery, third-party throttling, and accidental reconnection of phone data to permanent answers.

The live architecture should therefore be:

```text
WhatsApp/api.co.id -> Hono Worker -> contact D1
                         |         -> survey D1 -> short-TTL aggregate API -> React Static Assets
                         |         -> AI Gateway -> chosen model (optional; static fallback)
Cron Trigger ------------+-> outbound Queue -> queue consumer -> api.co.id
                                           \-> dead-letter Queue
Workflow schedule -> D1 anonymous export -> private R2
```

Open facts that must be resolved elsewhere are api.co.id's webhook authentication, response deadline, template approval rules, outbound rate limits, retry semantics, and idempotency support; exact questionnaire turn count; dashboard refresh interval; launch traffic shape; and the backup RPO/RTO. None changes the product selection above, but vendor limits determine queue concurrency and retry settings.

## Decision-relevant limits snapshot

Values below were taken from each product's official limits page on 2026-08-12 and must be rechecked before production launch.

| Product | Current limit relevant here | Architectural consequence |
|---|---:|---|
| Workers Free | 100,000 requests/day; 10 ms CPU/request | Suitable for trial only; live multi-turn traffic can exhaust it. |
| Workers Paid | No daily request cap; 30 s default/5 min max CPU; 128 MB memory | Adequate for API/webhooks and queue consumers. |
| Worker outgoing connections | 6 simultaneously waiting for headers | Never fan out weekly messages directly from one invocation. |
| Worker `waitUntil()` | Up to 30 s after HTTP response/disconnect | Not a durable job system; use Queue. |
| D1 Paid | 10 GB/database; 1,000 queries/invocation; 30 s/query | Two small databases and bounded transactions fit easily. |
| D1 Time Travel Paid | 30 days | Add R2 export for long-term recoverability. |
| Queues | 128 KB/message; 100-message consumer batch; 5,000 messages/s/queue; 15 min consumer wall time | 5,000 weekly messages fit; throttle to vendor. |
| Queue delivery | At least once | D1 delivery ledger and stable idempotency keys required. |
| AI Gateway | 500 logs/s/gateway; 200 requests/60 s only for Unified Billing credentials | Optional path must tolerate 429; protect prompt privacy. |
| Workers AI text generation | 300 requests/minute default | Load-test; deterministic fallback absorbs bursts. |

Sources: [Workers limits](https://developers.cloudflare.com/workers/platform/limits/), [D1 limits](https://developers.cloudflare.com/d1/platform/limits/), [Queues limits](https://developers.cloudflare.com/queues/platform/limits/), [AI Gateway limits](https://developers.cloudflare.com/ai-gateway/reference/limits/), and [Workers AI limits](https://developers.cloudflare.com/workers-ai/platform/limits/).
