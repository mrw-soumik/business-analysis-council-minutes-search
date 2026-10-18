# St. John's Council Minutes Assistant: Two-Page Summary

> **Independent portfolio project.** Not affiliated with or endorsed by the City of St. John's. Source documents are © City of St. John's and are retrieved from the City's public meetings portal; this repository does not redistribute them.

**Mostafa Rafiur Wasib, business analyst.** This summarizes version 0.9.1 of the business analysis pack: the analysis of 17 October 2026, with the implementation's measured results recorded on 18 October 2026. It is a complete draft for stakeholder validation. Current-state facts come from public City pages. No stakeholder interviews have taken place, so the roles and needs below are assumptions to validate. For the full detail, see the [full pack](council-minutes-assistant-ba-pack.pdf) (80 pages).

## The problem and who it affects

St. John's City Council makes its formal decisions at Regular Council Meetings, and the City publishes the minutes on its eSCRIBE portal. On 17 October 2026, 242 of the 253 Regular Council Meetings held since 8 July 2019 listed minutes. The portal's search returns meetings and documents, not answers, and shows no text excerpts. Finding what council decided therefore means opening documents one at a time and searching inside each one.

This affects residents, journalists and researchers, community association volunteers, and City staff who answer public enquiries. People who cannot find a decision contact the City, and some make a formal access request, even though minutes are available without one.

**The solution.** The St. John's Council Minutes Assistant answers a plain-language question in one of two ways. It gives a short answer that cites the meeting, date and page and links to the official document, or it says "not found in the minutes". The eSCRIBE portal remains the official record.

**Scope.** Regular Council Meeting minutes published on eSCRIBE (portal coverage starts July 2019). Out of scope for the first release: Committee of the Whole and other meetings, agendas, attachments, video, and any change to eSCRIBE.

## Stakeholders (assumed, to validate)

- **Business sponsor:** the City Clerk's office, as the assumed owner of council records.
- **Users:** residents; journalists and researchers; community association volunteers; City staff who answer enquiries (City Clerk's office and 311).
- **Consulted:** ATIPP Coordinator (privacy), Legal (copyright and disclaimer), City IT and accessibility advisors.
- **Kept satisfied:** Mayor and Council, whose decisions must be portrayed accurately.

## Current state and future state

| | Today (publicly observed) | With the assistant |
|---|---|---|
| Finding a decision | Browse the calendar or run a keyword search; results list documents | Ask in plain language and get a short answer |
| Checking it | Open minutes one at a time; in-document search needs the exact words | Meeting, date and page citations, verbatim excerpts and a link to the official document |
| When it is not there | Not obvious: try again, give up or contact the City | An explicit "not found", with the period searched and next steps |
| Staying current | Minutes appear only after adoption at a later meeting | Daily ingestion behind a quality gate, with coverage dates always shown |

![Simplified future-state flow. A question is answered only from retrieved passages and every claim is checked for a citation, so the user gets either a cited answer or a not found reply. A daily update indexes new minutes and publishes the index only if the quality gate passes.](diagrams/future-state-simplified.svg)

*Simplified from the future-state BPMN 2.0 map ([diagrams/future-state.bpmn](diagrams/future-state.bpmn)), which shows every pool, lane and gateway.*

## The ten most important requirements

| ID | Requirement (as defined in the BRD) | Priority |
|---|---|---|
| FR-01 | Answer natural-language questions about Regular Council Meeting minutes | Must |
| FR-02 | Every answer cites meeting name, meeting date and page, and links to the official document | Must |
| FR-03 | When the minutes do not contain the answer, say so instead of guessing | Must |
| FR-05 | Show the retrieved source passages (short excerpts) next to the answer | Must |
| FR-06 | Hybrid retrieval (keyword + semantic) so exact terms (by-law numbers, street names) and paraphrases both work | Must |
| FR-07 | Ingest newly published minutes without manual editing (repeatable pipeline) | Must |
| NFR-01 | Quality gate (retrieval): correct source page in the top 5 results (hit@5) for at least 85% of answerable evaluation questions | Must |
| NFR-02 | Quality gate (answers): at least 90% of answer citations point to a passage that supports the claim; at least 80% of unanswerable questions correctly declined | Must |
| NFR-05 | Accessibility: demo UI meets WCAG 2.1 AA (keyboard use, contrast, labels) | Must |
| NFR-06 | Privacy: no accounts, no personal data collected; questions are not stored with identifiers (aligned with NL ATIPPA, 2015 principles) | Must |

These serve the three business requirements: **BR-01** reduce the time to find what council decided; **BR-02** make every answer traceable to the official record; and **BR-03** reduce routine enquiries handled manually (an assumption to validate). The full set is 7 functional (27 detailed), 7 non-functional (25 detailed), 11 stakeholder and 11 transition requirements.

## Success measures (proposed targets, not results)

| Measure | Proposed target | How the baseline will be measured |
|---|---|---|
| SM-01 Time to find a council decision (BR-01) | At least 50% lower | Moderated sessions, eight participants |
| SM-02 Answers traceable to the record (BR-02) | 100% cite it; at least 90% of citations support the claim | No answer-level traceability today |
| SM-03 Users able to check the answer (BR-02) | At least 80% agree | Same question about the current portal |
| SM-04 Routine enquiries handled manually (BR-03) | 25% fewer within six months | Eight weeks of enquiry tagging |
| SM-05 Staff time per routine enquiry (BR-03) | 30% lower | Timed sample of at least 30 enquiries |

## Acceptance and measured results

- **Backlog:** 26 user stories (90 points) in 7 epics, each with Gherkin acceptance criteria. Release 1 (MVP): 19 stories, 69 points.
- **UAT:** 30 UAT test cases (22 High, 8 Medium) over two cycles, run by persona representatives, an assistive technology user and the ATIPP Coordinator. All are "Not run": no human UAT has been performed yet.
- **Automated checks:** 13 of the 14 automated checks met their thresholds in the implementation ([Project A](https://github.com/mrw-soumik/stjohns-council-minutes-rag)), with PA-02 report-only. Retrieval hit@5 was 0.954 against the 85% target (NFR-01). All 20 unanswerable questions were declined, and 90.2% of citations point to the correct agenda item (NFR-02). axe-core found 0 violations (NFR-05, automated part), and the local model costs USD 0 per answer (NFR-04).
- **Not met:** NFR-03 answer time. The p95 was 12.82 s with 6 passages and 10.96 s with 4, against a 10 s target. Next steps: retrieve fewer passages, or use a smaller or hosted model, then re-measure.
- **Deviation:** citations name the agenda item instead of the page number, because PDF downloads met a browser verification step (C-03, OQ-05).
- **Traceability:** every one of the 14 functional and non-functional requirements traces to a business requirement, at least one user story and at least one UAT test case. 50 of the 52 detailed requirements are tested directly, and the build fails on any gap.

## Top three risks

| Risk | Mitigation |
|---|---|
| R-01 Wrong answer: the model states something the minutes do not say (rated High) | Answer only from retrieved passages, with every claim cited; decline when unsupported; NFR-02 gate; disclaimer; problem reports |
| R-02 Outdated answer: a later decision supersedes the one cited, or recent minutes are not yet published (rated High) | Meeting dates and the coverage end date shown with every answer; decisions listed in date order; daily ingestion |
| R-08 Source access: scripted requests for minutes PDFs received a browser verification page (rated High; observed) | Use HTML minutes where possible; agree an access method with the City (OQ-05); never bypass access controls |

## Read more

| Document | What it covers | Document | What it covers |
|---|---|---|---|
| [01 Business requirements](01-business-requirements-document.md) | All requirements, stakeholders, data, rules, risks | [02 User stories](02-user-stories.md) | 26 stories, Gherkin criteria, release plan |
| [03 UAT test plan](03-uat-test-plan.md) | 30 test cases; measured results by check | [04 Traceability matrix](04-traceability-matrix.md) ([CSV](traceability.csv)) | Requirement to story, test and check |
| [Full pack as one PDF](council-minutes-assistant-ba-pack.pdf) | All four documents with full-size diagrams | [Process maps](diagrams/) | BPMN 2.0 models, current and future state |
