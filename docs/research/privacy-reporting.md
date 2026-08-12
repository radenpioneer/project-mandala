# Privacy and statistical-disclosure constraints for Project Mandala

_Research note, 12 August 2026. This is product and engineering research, not legal advice. Indonesian counsel should confirm the application of UU PDP and any sector-specific rules before launch. ICO, NIST, ONS, Statistics Canada, and AAPOR materials below are used as technical and statistical benchmarks; they are not statements of Indonesian law._

## Question and design examined

This note examines the proposed WhatsApp survey design:

- respondents enter through one shared link and self-declare their relationship to KAMMI;
- one final response is allowed per WhatsApp number, but identity or membership cannot be verified;
- the WhatsApp number is retained separately for 30 days, while response rows are proposed to be retained indefinitely;
- a bearer token permits editing after submission;
- response fields include province, city, membership level, office-holding level, candidate preference, and more fields still to be decided;
- exact participation and candidate results, with public breakdowns, are intended to update live;
- cells smaller than 3 are intended to be suppressed; and
- a respondent can submit another person's name, which is moderated before becoming a choice for later respondents.

The central finding is that these controls support **confidential and pseudonymised processing**, but do not by themselves establish end-to-end anonymity. A minimum cell size of 3 is a useful floor for review, not proof that a live output is safe. Permanent aggregate statistics are much easier to justify than permanent row-level responses.

## 1. “Operational anonymity” needs a precise, limited promise

Indonesia's UU No. 27/2022 defines personal data as data about a person who is identified or identifiable, directly or indirectly, either alone or in combination with other information (Article 1). It also treats a full name as general personal data and combinations that identify a person as personal data (Article 4). The Act requires a lawful basis, purpose-limited and transparent processing, security, and—when consent is the basis—disclosure of the collected information, processing period, retention period, and data-subject rights (Articles 16, 20–21, 35–39). See the official [JDIH Komdigi text of UU No. 27/2022](https://jdih.komdigi.go.id/produk_hukum/view/id/832/t/undangundang%2Bnomor%2B27%2Btahun%2B2022).

The ICO's current anonymisation guidance gives a useful technical test: identifiability includes **singling out** a person or **linking** records, and simply removing direct identifiers is insufficient when other data can reconnect a record to a person. Its examples specifically identify age, occupation, and place of residence as linkable key variables. See [How do we ensure anonymisation is effective?](https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/data-sharing/anonymisation/how-do-we-ensure-anonymisation-is-effective/) and [Introduction to anonymisation](https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/data-sharing/anonymisation/introduction-to-anonymisation/).

Applied here:

- During intake, the WhatsApp provider and application necessarily process the sender's number alongside conversation/session state. At that stage the response is not anonymous.
- Separating the number store from the response store reduces exposure, but does not prove anonymisation. Message IDs, timestamps, logs, webhook payloads, rare profile combinations, or a retained join key can recreate the association.
- Province + city + membership level + office-holding level may isolate a known person in a small organisational community. This can occur without learning their legal name from the dataset.
- An edit token is a persistent record-level identifier. It is good access control when random, secret, and stored only as a digest, but its existence means the same response can be singled out. Whether that permits identification depends on the complete system and attacker context.
- “The dashboard does not show numbers” is a confidentiality statement, not an anonymity proof.

NIST likewise recommends defining the release model and evaluating the disclosure risk created by de-identified data before release; masking identifiers alone is not always sufficient. See [NIST SP 800-188, De-Identifying Government Datasets](https://www.nist.gov/publications/de-identifying-government-datasets-techniques-and-governance).

### Safe public wording

Do not promise “anonymous” without a documented, tested threat model. A supportable notice would state the actual controls, for example:

> Project Mandala receives your WhatsApp number to run the conversation, prevent repeat submissions, and—if you opt in—send updates. The number is stored separately and deleted 30 days after the survey closes. Published results are aggregated; the dashboard does not publish phone numbers or individual responses.

The final notice must also disclose relevant vendors, purposes, exact retention clocks, opt-in/withdrawal paths, and what happens to message transcripts, logs, backups, trial data, write-ins, and edit tokens. Calling this design **operational anonymity** is acceptable as an internal domain term only if its definition accompanies it; externally, the concrete control statement is safer.

### Required architecture gate

Before launch, document a data-flow and attempt to reconnect a response to a person using everything realistically available to the maintainer, vendors, and a motivated public observer. At minimum, verify that:

- the notification/deduplication store has no response ID or other join key;
- response rows contain no phone number, message ID, raw transcript, IP-like metadata, exact event time unnecessary for analysis, or other vendor identifier;
- logs and analytics do not record numbers, message bodies, edit tokens, or webhook payloads;
- edit tokens are high-entropy bearer secrets, only a one-way digest is stored, and tokens never appear in URLs or logs;
- deletion after 30 days covers primary storage, logs, caches, backups under project control, and a documented vendor-deletion path; and
- analytic geography is coarsened when combinations become rare.

These are necessary controls, not a declaration that the resulting data is legally anonymous.

## 2. Indefinite response retention is not justified by number separation alone

UU PDP requires personal-data processing to end when retention is reached, its purpose is achieved, or the data subject requests it; it requires deletion when personal data is no longer necessary, consent is withdrawn, the data subject requests deletion, or processing was unlawful (Articles 42–44). When consent is used, the retention and processing periods must be disclosed (Article 21). See the official [UU No. 27/2022 text](https://jdih.komdigi.go.id/produk_hukum/view/id/832/t/undangundang%2Bnomor%2B27%2Btahun%2B2022). Applicability and exceptions require legal review, but a notice saying “forever” does not itself resolve purpose, necessity, withdrawal, or deletion duties.

Long-lived de-identified data also has a changing threat environment. The ICO recommends regular anonymisation checks because new re-identification techniques and new external information appear over time; it specifically recommends testing with the resources available to a motivated intruder. See the ICO's [free-text and anonymisation guidance](https://ico.org.uk/for-organisations/advice-and-services/innovation-advice/previously-asked-questions/#effective-anonymisation). NIST similarly treats de-identification as risk management rather than a one-time identifier-removal step ([NIST SP 800-188](https://www.nist.gov/publications/de-identifying-government-datasets-techniques-and-governance)).

Therefore:

1. **Permanent aggregate output is the low-risk default.** Keep final candidate totals and sufficiently coarse, disclosure-controlled summaries indefinitely.
2. **Row-level response retention needs a fixed period and purpose.** Set a review/deletion date tied to audit, correction, and analysis needs. “Never” should not be the default while city, organisational level, timestamps, write-in text, or tokens remain.
3. **If indefinite row-level retention remains a requirement, make anonymisation a release gate.** Remove edit credentials, timestamps, raw text, and unnecessary detail; generalise rare geography/roles; perform and document a motivated-intruder test; then repeat the assessment periodically. If the test cannot make re-identification risk sufficiently remote, retain only aggregates permanently.
4. **Define a rights process before severing links.** An architecture that deliberately cannot locate a person's row may be unable to honour a later correction or deletion request. The notice must clearly say what can be changed or deleted, until when, and how the edit token is used. Counsel should assess whether the proposed mechanism meets applicable rights.

## 3. The survey reports its participants, not the KAMMI population

This is a voluntary, self-selected, non-probability survey. Statistics Canada explains that in a non-probability sample, inclusion probabilities are unknown; representativeness is a risky assumption, sampling variability cannot be estimated in the usual design-based way, and participation/selection bias may be present. See [Statistics Canada: Non-probability sampling](https://www150.statcan.gc.ca/n1/edu/power-pouvoir/ch13/nonprob/5214898-eng.htm). Its 2025 review likewise identifies possible selection bias and nonrepresentativeness as the central concern for voluntary internet data ([Use of nonprobability samples for official statistics](https://www150.statcan.gc.ca/n1/pub/12-001-x/2025001/article/00008-eng.htm)).

Five thousand responses may make percentages numerically stable among respondents, but it does not repair unknown coverage, self-selection, unverifiable eligibility, link forwarding, or falsified profiles. A large biased sample can remain biased.

Public reporting should therefore:

- say “responses” or “participating WhatsApp numbers,” not “verified cadres” or “KAMMI members”;
- describe results as preferences **among Project Mandala participants** and never as a mandate, election result, or estimate of all cadres;
- state that Project Mandala is independent and is not supported, operated, or endorsed by PP KAMMI or the Muktamar XIV Steering Committee;
- state that access used one shared link, identity and membership were not verified, alumni were allowed by design, and non-members could self-declare as members;
- publish unweighted base counts for every percentage and breakdown;
- avoid a conventional margin of sampling error. AAPOR permits precision measures for non-probability reports only when the underlying model, assumptions, validation, and calculation are described; no such model is currently proposed ([AAPOR Disclosure Standards](https://aapor.org/standards-and-ethics/disclosure-standards/)); and
- publish a methods page at the same time as the first live result.

The methods page should cover sponsor/operator, independence, target population versus actual participants, recruitment and link distribution, dates (including separation of limited-trial data), questionnaire and answer options, question order, WhatsApp mode, duplicate control, edits, incomplete responses, moderation, weighting (including “none”), data-quality exclusions, live-result exposure, known limitations, and the denominator for every result. These items align with AAPOR's disclosure checklist, which requires the sampling method, recruitment, dates, mode, sample sizes, weighting, processing/quality procedures, and a design-limitations statement ([AAPOR Disclosure Standards](https://aapor.org/standards-and-ethics/disclosure-standards/)).

## 4. Free-text candidate names require moderation before any publication or reuse

A name directly identifies the person named. A respondent can also put contact details, harassment, impersonation, or unrelated personal information into a nominal “name” field. The ICO notes that free text must be assessed for all identifying content and that automated removal is not sufficient without context-aware checks and continuing testing ([ICO effective-anonymisation Q&A](https://ico.org.uk/for-organisations/advice-and-services/innovation-advice/previously-asked-questions/#effective-anonymisation)). UU PDP identifies full names as personal data and requires a lawful basis and transparent, purpose-limited handling of personal data; it also prohibits unlawful disclosure of another person's personal data ([UU No. 27/2022](https://jdih.komdigi.go.id/produk_hukum/view/id/832/t/undangundang%2Bnomor%2B27%2Btahun%2B2022)). Whether a particular publication is lawful is a legal question.

The chosen “moderate response” policy should mean:

1. Store the original write-in in a restricted moderation queue, never directly in the public option table.
2. Reject content that is not a person's name; contains contact details, accusations, insults, or other personal data; or cannot be safely disambiguated.
3. Canonicalise spelling and aliases so duplicate labels do not split counts.
4. Publish only a moderator-approved display name. Approval means “valid displayable name,” not “eligible candidate,” “willing candidate,” or organisational endorsement.
5. Keep an auditable moderation rule and correction/removal contact for a person who has been named.
6. Do not send raw write-ins to an AI provider unless that transfer, purpose, retention, and human-review arrangement has been separately approved and disclosed.

An approved name becoming selectable immediately still reveals that at least one person recently entered it. Batch additions on a disclosed schedule, or add the choice immediately but do not reveal its origin or result until publication controls are satisfied.

## 5. A cell threshold of 3 is a floor, not a complete disclosure-control policy

The proposed rule means counts 0, 1, and 2 are withheld and counts of 3 or more may be shown. ONS uses suppression below 3 for some birth/death outputs, but its own guidance says disclosure depends on context, sensitivity, dimensions, totals, previous releases, and linkability; no single method is universally mandated. For flexible online tools it recommends considering a higher minimum such as 5. See the [ONS disclosure-control policy](https://www.ons.gov.uk/methodology/methodologytopicsandstatisticalconcepts/disclosurecontrol/policyonprotectingconfidentialityintablesofbirthanddeathstatistics).

Three failure modes matter here:

### Differencing

If a dashboard changes from one exact snapshot to the next after a known person responds, the delta can reveal that person's candidate or profile—even when the destination cell already contains more than 3 responses. Weekly WhatsApp updates, cached pages, screenshots, and time-series charts create multiple releases that an observer can compare. ONS warns that subtracting two larger figures can reveal a small count and that linked tables from the same population must be assessed together, not one table at a time ([ONS disclosure-control policy](https://www.ons.gov.uk/methodology/methodologytopicsandstatisticalconcepts/disclosurecontrol/policyonprotectingconfidentialityintablesofbirthanddeathstatistics)).

### Residual disclosure

Hiding one cell does not protect it when row/column totals and all other cells reveal the remainder. **Secondary suppression**, compatible rounding, or withholding a total is necessary. Suppressed zeroes, ones, and twos must use the same marker; showing “0” separately defeats the rule.

### Linkage and sparse combinations

Separate province, city, membership-level, office-level, candidate, and time views may collectively expose a rare combination even if each individual chart passes the threshold. Free cross-filtering multiplies this risk. The ICO describes this as the mosaic or jigsaw effect; ONS requires linked tables and previous releases to be assessed together ([ICO effective anonymisation](https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/data-sharing/anonymisation/how-do-we-ensure-anonymisation-is-effective/), [ONS disclosure-control policy](https://www.ons.gov.uk/methodology/methodologytopicsandstatisticalconcepts/disclosurecontrol/policyonprotectingconfidentialityintablesofbirthanddeathstatistics)).

### Minimum controls for live publication

- Apply suppression server-side to every count, percentage, chart, export, API response, accessibility label, and cached payload—not only the visible React component.
- Treat 3 as the minimum review floor, not automatic permission to publish. Permit coarser categories or a higher threshold for small cities, rare organisational roles, and interactive views.
- Do not allow arbitrary cross-filtering. Pre-approve one-dimensional breakdowns and assess the complete set of releases together.
- Use secondary suppression or consistent controlled rounding so totals cannot reconstruct hidden cells.
- Batch and delay exact updates; do not publish one-response deltas or exact response timestamps. The safe batch size and delay remain a product decision informed by a simulated differencing attack.
- Keep live and final-publication policies separate. Final data can be reviewed more carefully and coarsened further.
- Distinguish **privacy suppression** from **statistical reliability**. A cell of 3 may clear the chosen confidentiality floor but is too small to present as a stable subgroup conclusion. Set a separate, higher reporting/reliability rule and always show the unweighted base.
- Run an automated release test against current and prior snapshots, followed by human review of newly introduced fields or breakdowns.

## Decisions this research leaves for the map

1. **Public privacy claim:** approve concrete control wording; do not use unqualified “anonymous.”
2. **Retention:** replace “response never” with either a fixed row-level deletion/review period or a documented irreversible-anonymisation gate, while allowing disclosure-controlled aggregates to remain permanent.
3. **Rights and contact:** decide how participants and people named in write-ins request access, correction, withdrawal, or removal after identity links are severed.
4. **Live-release policy:** decide batch interval/size, rounding or secondary suppression, allowed one-dimensional breakdowns, and a separate statistical-reliability threshold.
5. **Geography:** decide whether city is needed in public results at all and when it collapses to province/other.
6. **Write-in policy:** approve moderation criteria, publication cadence, canonicalisation, appeal/removal path, and whether raw text may ever be sent to AI.
7. **Accountability:** assign the Project Maintainer to own the data-flow inventory, privacy notice, deletion evidence, disclosure tests, and incident path; obtain Indonesian legal review before live launch.

## Bottom line

Project Mandala can truthfully claim separation of contact data and aggregate-only public reporting. It cannot yet claim that responses are anonymous or safe to retain forever. The cell-size rule of 3 should be retained only as a minimum trigger inside a broader release-control system. Statistical claims must remain explicitly about self-selected participants, with methods and limitations next to the live figures.
