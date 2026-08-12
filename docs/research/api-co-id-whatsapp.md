# api.co.id WhatsApp capabilities and constraints

Research date: 2026-08-12

## Decision summary

api.co.id is a plausible provider for a limited Project Mandala trial, but the publicly available evidence is not sufficient to lock it in for production. Its [first-party product material](https://api.co.id/whatsapp-api-gateway/) establishes the broad building blocks—official WhatsApp Cloud API access, inbound and status webhooks, HMAC signing, templates, interactive buttons/lists, consent tracking, delivery/read status, and a REST send endpoint—but not the contracts needed to implement or operate them safely.

Treat api.co.id as a **candidate gated by an authenticated documentation review and contract test**, not yet as a decided dependency. Five gates must pass before launch:

1. Obtain written confirmation that this independent, non-binding survey of candidates for an organisation's chair is permitted. [WhatsApp's policy](https://whatsappbusiness.com/policy/) prohibits political parties, politicians/candidates/campaigns, entities providing services related to politics, and private voting-solution providers for elections. It does not explicitly classify this internal, unofficial preference survey, so applicability cannot be inferred safely.
2. Resolve the anonymity conflict. api.co.id's [privacy policy](https://api.co.id/privacy-policy/) says it processes phone numbers, message content, sender/recipient identities, and message metadata, while its [product](https://api.co.id/whatsapp-api-gateway/) includes conversation history/CRM/team inbox. Separating phone numbers from responses only in D1 therefore does not make the conversation unlinkable in api.co.id or Meta systems.
3. Obtain the current authenticated OpenAPI/Postman documentation and verify the custom-webhook payload, signature procedure, acknowledgement deadline, retry/order semantics, outbound idempotency contract, error schema, and interactive payloads.
4. Verify a WABA and messaging tier that can reach 5,000 unique recipients, and confirm the current vendor rate limit. One [api.co.id integration article](https://api.co.id/blog/cara-send-otp-whatsapp-di-api-co-id/) states 60 WhatsApp messages/minute by default; a 5,000-message weekly update would take at least 83 minutes 20 seconds at that rate.
5. Pre-approve the weekly-update template and its category, collect explicit opt-in, and implement immediate opt-out. Under [WhatsApp policy](https://whatsappbusiness.com/policy/), a weekly update will normally be outside the 24-hour customer-service window and therefore cannot be sent as an ordinary free-form reply.

## What official sources establish

| Area | Established | Still unestablished |
| --- | --- | --- |
| Product and onboarding | api.co.id describes its service as a Meta Cloud API/Tech Provider integration. It offers Embedded Signup and an advanced Manual Login using a WABA and Meta system-user token. Each sending number needs an active api.co.id licence. ([product](https://api.co.id/whatsapp-api-gateway/), [setup guide](https://api.co.id/panduan-manual-login-whatsapp-api-co-id/)) | Production approval lead time for this use case; exact legal-entity requirements for an independent project; whether Project Mandala can obtain the needed business verification and display name. |
| Outbound send | The public example uses `POST https://chat.api.co.id/api/v1/public/messages/send`, `Authorization: Bearer`, JSON, a destination number, channel, and message type. A successful example returns a provider message ID and `sent` status. Templates can be created/submitted and must be approved by Meta. ([product](https://api.co.id/whatsapp-api-gateway/)) | The full schema, versioning policy, timeout/error model, template payload for this use case, and whether the non-`/public` endpoint mentioned elsewhere remains valid. First-party examples are internally inconsistent about hostname/path, so implementation must use the authenticated current spec. |
| Inbound webhook | api.co.id advertises real-time custom webhooks for incoming messages and status updates, signed with HMAC-SHA256. Its product page says incoming text, image, document, and location are supported. ([product](https://api.co.id/whatsapp-api-gateway/)) | The Project Mandala callback setup, event envelope, interactive-reply payload, signature header/name/encoding, signing secret lifecycle, timestamp/replay protection, acknowledgement deadline, retries, duplicate behavior, event order, and replay tools are not in public documentation. The [Manual Login callback](https://api.co.id/panduan-manual-login-whatsapp-api-co-id/) is the **Meta-to-api.co.id** callback, not documentation of the api.co.id-to-Project-Mandala webhook. |
| Interactive questionnaire | api.co.id advertises outbound reply buttons and list menus. ([product](https://api.co.id/whatsapp-api-gateway/)) Meta's hosted [SDK reference](https://whatsapp.github.io/WhatsApp-Nodejs-SDK/api-reference/messages/interactive/) describes up to 3 reply buttons and up to 10 list choices. | api.co.id's exact interactive request and callback schemas, present limits, client compatibility, and behavior outside the 24-hour window. Candidate/profile lists must not assume more than 10 visible choices without pagination or another tested flow. |
| Conversation window | [WhatsApp policy](https://whatsappbusiness.com/policy/) allows free-form replies within 24 hours of the user's last message; outside that window only approved templates may be sent. api.co.id repeats the same model and says it has a window-status endpoint. ([pricing guide](https://api.co.id/blog/whatsapp-api-pricing/)) | The endpoint contract is not public. The category Meta will approve for weekly standing updates is also unknown; budget them conservatively as chargeable templates until approval proves otherwise. |
| Opt-in and unsubscribe | [WhatsApp policy](https://whatsappbusiness.com/policy/) requires a phone number plus opt-in for subsequent messages and requires all block/discontinue/opt-out requests to be honoured. api.co.id advertises OPT_IN/OPT_OUT, blacklist, and consent management. ([broadcast guide](https://api.co.id/blog/whatsapp-blast-adalah/), [product](https://api.co.id/whatsapp-api-gateway/)) | Public API contracts for consent/blacklist are absent. It is unknown whether a `STOP`-style inbound message is automatically enforced, which languages/variants are recognised, or how quickly enforcement reaches every sending surface. |
| Status and tracking | api.co.id advertises sent/delivered/read/failed tracking and unique message IDs; its setup guide describes inbound messages, delivery status, and template-status events. ([product](https://api.co.id/whatsapp-api-gateway/), [setup guide](https://api.co.id/panduan-manual-login-whatsapp-api-co-id/)) Meta notes that [status callbacks may arrive out of order](https://www.postman.com/meta/whatsapp-business-platform/request/rgtfq23/message-status-update-notifications), so timestamps—not arrival order—represent progression. | Provider-specific status payloads, terminal-state definitions, retention, status lookup endpoint, re-delivery, and reconciliation after missed webhooks. An HTTP send success must not be treated as delivery. |
| Retries and idempotency | The [product page](https://api.co.id/whatsapp-api-gateway/) markets sending as “retry-safe” and says it will not double-send. | No public idempotency key/header, retention window, request fingerprint rules, retryable status list, webhook deduplication key, or guarantee explains that claim. Project Mandala must not rely on it until contract-tested. |
| Rate and scale | A first-party [integration article](https://api.co.id/blog/cara-send-otp-whatsapp-di-api-co-id/) states a default limit of 60 WhatsApp messages/minute and says increases can be requested. Another [first-party guide](https://api.co.id/blog/cara-verifikasi-bisnis-di-facebook-business-manager/) says unverified accounts may be limited to roughly 250 unique recipients/day and that verified messaging tiers rise progressively. api.co.id's [terms](https://dashboard.api.co.id/terms) allow limits to change. | Account-specific sending tier, inbound limits, burst behavior, `429` response/retry headers, concurrency limits, increase process/SLA, and achievable tier before 1 September. “Unlimited messages” in the vendor plan does not prove unlimited throughput or bypass Meta recipient tiers. |
| Pricing | api.co.id says Meta template charges are billed directly without provider markup. Since 1 July 2025 it describes Meta charging per delivered template message by category and country; free-form/service replies are free within the 24-hour window, and utility templates may be free within it. ([pricing guide](https://api.co.id/blog/whatsapp-api-pricing/)) | A stable provider price and exact Indonesian template rate. The current [product page](https://api.co.id/whatsapp-api-gateway/) contains conflicting figures: “from Rp100,000/month,” a detailed discounted monthly price of Rp150,000, and an FAQ stating Rp100,000/month. Get a checkout screenshot or written quote and use Meta's live rate card when budgeting. |
| Security | api.co.id claims TLS 1.3 in transit, encryption at rest, AES-256-GCM for stored Meta access tokens, HMAC-SHA256 webhooks, role-based access control, and audit logs. ([product](https://api.co.id/whatsapp-api-gateway/), [setup guide](https://api.co.id/panduan-manual-login-whatsapp-api-co-id/)) [Terms](https://dashboard.api.co.id/terms) make the customer responsible for API-key security. | Security certifications/audit reports, data residency, incident notification/SLA, secret rotation, webhook replay defence, role granularity for hiding conversations, and whether logs/backups can be deleted on demand. |
| Privacy and retention | api.co.id's [privacy policy](https://api.co.id/privacy-policy/) says it processes identity/account data, WhatsApp numbers, message content/media, delivery/read metadata, timestamps, and sender/recipient identities; it shares message data with Meta/WhatsApp and other operational vendors. It says data is kept while an account is active/as needed and that some message logs *may* be deleted after 30–90 days. | A binding retention maximum, backup deletion, tenant deletion/export API, whether CRM conversation content can be disabled, and whether administrators can view phone-linked answers. “May be deleted” is not a retention guarantee. |
| Test facilities | api.co.id advertises free account registration, interactive documentation, a Postman collection, and limited “sandbox mode” while Meta business verification is pending. ([product](https://api.co.id/whatsapp-api-gateway/), [verification guide](https://api.co.id/blog/cara-verifikasi-bisnis-di-facebook-business-manager/)) | No public WhatsApp sandbox guide, test credentials/number, allowed-recipient rules, sandbox quota, mock webhook/replay facility, or assurance that the WhatsApp Postman collection is accessible without buying a licence. The [public documentation catalogue](https://docs.api.co.id/) currently does not list WhatsApp, and the product's documentation link routes to login. |
| Reliability and terms | [Terms](https://dashboard.api.co.id/terms) say the service is provided “as is/as available”; api.co.id may change limits, pricing, formats, features, or suspend/discontinue service. | No public WhatsApp uptime SLA, support response time, maintenance notice, disaster recovery targets, or public vendor status page was found. |

## Consequences for Project Mandala

### Weekly updates

The deep link causes the participant to message first, which opens a [24-hour customer-service window](https://whatsappbusiness.com/policy/). The interactive questionnaire can therefore use free-form/interactive replies during that active session, subject to the tested api.co.id schema. A weekly update is outside that window for most participants and must use an approved template.

For 5,000 opted-in participants:

- one weekly edition means up to 5,000 template sends;
- at the documented default 60 messages/minute, the theoretical minimum batch duration is 83 minutes 20 seconds;
- `N` weekly editions mean up to `5,000 × N` chargeable template sends, plus any final-results message;
- the batch requires a queue, pacing, per-recipient suppression check immediately before send, and reconciliation from delivery-status events;
- target launch readiness depends on the WABA's **actual** unique-recipient tier, not merely the api.co.id subscription's “unlimited messages” label.

Do not classify standing updates as `UTILITY` merely to lower cost. Submit truthful wording and let Meta determine the template category. Budget using the chargeable category until approval is known.

### Anonymity

The planned “operational anonymity” can only describe Project Mandala's own data model unless api.co.id provides stronger controls. A participant's questionnaire answers traverse WhatsApp/Meta and api.co.id alongside their WhatsApp identity ([privacy policy](https://api.co.id/privacy-policy/)), and api.co.id advertises an [inbox/CRM](https://api.co.id/whatsapp-api-gateway/) that stores conversations.

Before claiming that the Project Maintainer cannot link a response to a number, determine whether:

- conversation storage can be disabled or automatically deleted;
- the maintainer can be denied inbox/CRM access while retaining technical administration;
- vendor support personnel can access conversations;
- exports, audit logs, and backups retain phone-linked content;
- api.co.id will contractually honour a 30-day phone-data deletion requirement.

If these cannot be guaranteed, change the disclosure to say that Project Mandala's database unlinks submitted responses, while WhatsApp, Meta, and api.co.id may process and temporarily retain phone-linked message content. Do not promise operator-unlinkability.

### Political-use eligibility

[WhatsApp Business Messaging Policy](https://whatsappbusiness.com/policy/) explicitly prohibits use by political parties, politicians, political candidates, political campaigns, entities offering services related to politics/campaign strategy, and private companies offering voting systems for elections. Project Mandala is described as independent, non-binding, unrelated to PP KAMMI's formal election mechanism, and KAMMI chair candidates are not necessarily “political candidates” under this policy. Those facts reduce but do not eliminate ambiguity.

This is a vendor/platform eligibility question, not an engineering interpretation. Send api.co.id a precise written description and obtain a written decision before purchasing or onboarding. Include “independent,” “non-binding preference survey,” “not endorsed by PP KAMMI,” “not the official Muktamar election,” the live-results feature, and weekly participant updates. Ask api.co.id to escalate to Meta if necessary.

## Required vendor-validation checklist

Request these artifacts and answers from api.co.id before the architecture is frozen:

1. Current WhatsApp OpenAPI file and Postman collection, with API version and deprecation policy.
2. Exact outbound endpoint and authentication format; explanation of the `/api/v1/messages/send` versus `/api/v1/public/messages/send` examples.
3. Custom-webhook setup and complete payload samples for inbound text, reply-button/list selection, delivery/read/failure, template status, and error events.
4. HMAC header name, canonical bytes, digest encoding, secret creation/rotation, timestamp tolerance, replay protection, and dual-secret rotation procedure.
5. Webhook acknowledgement timeout, retry schedule/duration, duplicate and ordering guarantees, replay UI/API, and behavior during Project Mandala downtime.
6. Outbound idempotency-key contract, deduplication window, safe retry rules, request timeout guidance, `429`/`5xx` behavior, and reconciliation/status lookup.
7. Interactive message limits and exact payloads, including whether more than ten candidates require pagination.
8. Window-status, consent, opt-out, and blacklist endpoint contracts; whether opt-out is enforced for single-send, templates, broadcasts, retries, and queued jobs.
9. Approval/category guidance for a weekly live-standing update and a final-results template.
10. Project Mandala's initial and attainable WABA unique-recipient tier, business-verification prerequisites, expected approval time, and process to support 5,000 recipients before launch.
11. Confirmed account-specific rate limits, burst/concurrency limits, increase process, and response headers.
12. Exact current platform price, taxes, Meta payment arrangement, Indonesian template rates, refund terms, and whether trial/sandbox needs a paid licence.
13. Sandbox/test number, recipient allow-list, quota, mock events/replay, template test procedure, and separation between limited trial and production data.
14. Binding message/metadata/backup retention, deletion/export procedure, data residency, subprocessors, support access, breach notification, and role capable of administering API keys without reading inbox conversations.
15. Written WhatsApp-policy eligibility for the described independent survey, and any content/display-name disclaimers required to avoid implying PP KAMMI affiliation.
16. WhatsApp-specific uptime SLA, status page, support escalation hours, and recovery objectives.

## Conditional implementation posture

If those gates pass, use these conservative contracts in Project Mandala:

- accept webhook bytes only after signature and replay checks; persist the provider event/message ID; acknowledge quickly; process asynchronously;
- make every state transition and questionnaire answer idempotent because duplicate delivery remains possible until proved otherwise;
- use an outbox for outbound messages and track `queued → accepted → sent → delivered/read` or `failed`, with timestamps rather than callback arrival order;
- maintain Project Mandala's own opt-in/opt-out ledger and check it at queue time **and again immediately before send**; mirror vendor blacklist state as defence in depth;
- pace weekly sends below the confirmed rate, stop on systemic failures or quality warnings, and never blind-retry an ambiguous send without idempotency/reconciliation;
- keep API/Meta secrets in server-side secret bindings only, isolate trial and production credentials/data, and grant the least possible vendor-dashboard access;
- make the poll/tally flow deterministic when AI or the messaging provider is degraded; enqueue/replay messaging without changing responses or counts.

## Sources

All sources are first-party; accessed 2026-08-12.

- [api.co.id — Official WhatsApp Business API product page](https://api.co.id/whatsapp-api-gateway/)
- [api.co.id — Manual Login WhatsApp Cloud API guide](https://api.co.id/panduan-manual-login-whatsapp-api-co-id/)
- [api.co.id — WhatsApp API pricing model](https://api.co.id/blog/whatsapp-api-pricing/)
- [api.co.id — WhatsApp blast, consent, blacklist, and broadcast](https://api.co.id/blog/whatsapp-blast-adalah/)
- [api.co.id — WhatsApp OTP integration and stated rate limit](https://api.co.id/blog/cara-send-otp-whatsapp-di-api-co-id/)
- [api.co.id — Meta business verification and messaging tiers](https://api.co.id/blog/cara-verifikasi-bisnis-di-facebook-business-manager/)
- [api.co.id — Privacy Policy](https://api.co.id/privacy-policy/)
- [api.co.id — Terms of Service](https://dashboard.api.co.id/terms)
- [api.co.id — Public API documentation catalogue](https://docs.api.co.id/)
- [WhatsApp — Business Messaging Policy](https://whatsappbusiness.com/policy/)
- [Meta-hosted WhatsApp SDK — interactive message limits](https://whatsapp.github.io/WhatsApp-Nodejs-SDK/api-reference/messages/interactive/)
- [Meta official Postman collection — webhook payload reference](https://www.postman.com/meta/whatsapp-business-platform/folder/vzaxn16/webhook-payload-reference)
- [Meta official Postman collection — message-status callbacks](https://www.postman.com/meta/whatsapp-business-platform/request/rgtfq23/message-status-update-notifications)
