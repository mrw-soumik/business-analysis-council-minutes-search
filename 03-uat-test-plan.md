# User Acceptance Test Plan: St. John's Council Minutes Assistant

> **Independent portfolio project.** Not affiliated with or endorsed by the City of St. John's. Source documents are © City of St. John's and are retrieved from the City's public meetings portal; this repository does not redistribute them.

| Item | Value |
|---|---|
| Document ID | CMA-BA-03 |
| Version | 0.9 (draft for review) |
| Author | Mostafa Rafiur Wasib (UAT lead) |
| Date | 17 October 2026 |
| Tests | Release 1 (MVP) and Release 2 stories in [02-user-stories.md](02-user-stories.md) |
| Requirements | [01-business-requirements-document.md](01-business-requirements-document.md) |
| Traceability | [04-traceability-matrix.md](04-traceability-matrix.md) and [traceability.csv](traceability.csv) |
| Execution status | Not started. All test cases are "Not run" and all automated check results are "Pending". |

<!-- toc -->
**Contents**

1. [Objectives](#1-objectives)
2. [Scope](#2-scope)
3. [Approach](#3-approach)
4. [Entry criteria](#4-entry-criteria)
5. [Exit criteria](#5-exit-criteria)
6. [Roles and responsibilities](#6-roles-and-responsibilities)
7. [Test environment](#7-test-environment)
8. [Test data](#8-test-data)
9. [Sample UAT question bank](#9-sample-uat-question-bank)
10. [Defect management](#10-defect-management)
11. [Schedule template](#11-schedule-template)
12. [Test case summary](#12-test-case-summary)
13. [Test cases](#13-test-cases)
14. [Automated checks in Project A](#14-automated-checks-in-project-a)
15. [Reporting and sign-off](#15-reporting-and-sign-off)
<!-- /toc -->

## 1. Objectives

1. Confirm with representatives of each persona that the assistant meets the business requirements BR-01 to BR-03 in realistic use.
2. Confirm that every Must requirement in the BRD is met and that each Should requirement is met or has an agreed deferral.
3. Confirm the AI-specific safeguards work: answers are supported by citations, outcomes are reported as recorded, and the assistant declines rather than guesses (BR-02, R-01 to R-04).
4. Confirm accessibility (WCAG 2.1 AA), privacy and transparency behaviour with the people who will judge them: assistive technology users and the ATIPP Coordinator.
5. Gather the evidence needed for the go/no-go decision (TR-09).

## 2. Scope

**In scope:** stories US-01 to US-26; the requirements they satisfy; the measured quality gates from Project A (section 14); the support process for problem reports (TR-07).

**Out of scope:** unit, integration and system testing (owned by the delivery team in Project A); load testing beyond the NFR-03 measurement; security penetration testing (recommended before any production use); the content of the City's official minutes.

## 3. Approach

- **Business acceptance, not technical testing.** Testers act as their persona and judge whether the result is fit for purpose. The delivery team has already completed system testing (entry criterion 2).
- **Risk-based priority.** Test case priority follows the MoSCoW priority of the requirement: Must is High, Should is Medium, Could is Low. AI-risk cases (UAT-04, UAT-05, UAT-08) are run first because their failures are the most harmful.
- **Manual and automated evidence together.** Measurable thresholds (hit@5, citation support, decline rate, latency, cost) are verified by Project A's automated evaluation suite on the UAT index (section 14). UAT testers check the same behaviour by sampling and judging real answers.
- **Repeat AI judgements.** Model output can vary between runs. Each test case that judges an answer is run twice; a failure in either run is logged. The model version and index snapshot are recorded with every result.
- **Two cycles.** Cycle 1 runs every test case. Cycle 2 retests fixed defects and re-runs all High priority cases and the full automated suite as regression.
- **Evidence.** For each executed step, the tester records the result, a screenshot or log extract, the date, the model version and the index snapshot ID. Screenshots must not contain personal information.

## 4. Entry criteria

1. The BRD is baselined (version 1.0) and the stories in scope meet the Definition of Done.
2. System and integration testing are complete, with no open Severity 1 or Severity 2 defects.
3. Project A automated checks (section 14) have run on the UAT index snapshot, and the NFR-01 and NFR-02 quality gates are met.
4. The UAT environment is available with a frozen index snapshot whose coverage period is recorded.
5. Expected results in the question bank (section 9) have been confirmed against the official minutes, including page numbers.
6. Testers are recruited and briefed, and accessibility testers have their usual assistive technology ready.

## 5. Exit criteria

1. All High priority test cases have been executed, and at least 90% of all test cases have been executed.
2. All High priority test cases have passed, at first run or after retest.
3. No Severity 1 or Severity 2 defects are open.
4. No more than five Severity 3 defects are open, each with an agreed workaround and fix date.
5. On the release candidate, Project A reports hit@5 of at least 85% (NFR-01), citation support of at least 90% and a decline rate of at least 80% (NFR-02), and an average model cost per answer under CAD $0.05 (NFR-04). The NFR-03 response times are measured and reported.
6. No open WCAG 2.1 AA failures from UAT-23 to UAT-25.
7. The UAT summary report is issued, and the business sponsor and product owner have signed off (section 15).

## 6. Roles and responsibilities

| Role | Responsibilities | Assigned to |
|---|---|---|
| UAT lead | Plans and coordinates UAT, prepares data, runs triage, writes the summary report | Business analyst |
| Business sponsor | Decides on exit and signs off | City Clerk's office (proposed) |
| Product owner | Prioritizes defects, accepts results, decides on deferrals | To be confirmed |
| Testers | Execute test cases as their persona and record evidence | Two residents, one journalist or researcher, one community association volunteer, two City staff who answer enquiries (to recruit) |
| Accessibility tester | Executes UAT-23 to UAT-25 with a screen reader and magnification | At least one person who uses assistive technology daily (to recruit) |
| Privacy reviewer | Reviews UAT-26 and UAT-30 evidence | ATIPP Coordinator |
| Developer support | Fixes defects, re-runs automated checks, supports ingestion tests | Project A developer |

## 7. Test environment

| Item | Specification |
|---|---|
| Application | UAT instance of the assistant, separate from the public demo; address to be confirmed |
| Index | Frozen snapshot; snapshot ID and coverage period recorded at the start of UAT |
| Ingestion tests | A separate ingestion test environment. UAT-18 starts from an index that excludes the most recently published meeting, so the test does not depend on new minutes being published during UAT. |
| Language model | Name and version pinned for the UAT period |
| Desktop browsers | Current versions of Chrome, Edge, Firefox and Safari |
| Mobile | Safari on iOS and Chrome on Android |
| Assistive technology | NVDA with Firefox or Chrome on Windows; VoiceOver with Safari on macOS and iOS; browser zoom to 200% |
| Accounts | None needed (NFR-06.1) |

## 8. Test data

- **UAT question bank** (section 9): questions with expected results taken from published minutes. Expected results apply to the frozen snapshot. If the snapshot includes minutes published after 17 October 2026, the expected results are re-checked during preparation; for example, a later meeting may have decided the deferred matter in Q-02.
- **Project A evaluation set:** answerable and unanswerable questions with known sources (NFR-01.1). Its version is recorded in each report. UAT-06 uses unanswerable questions from this set, because each has been checked against the index.
- **Long input:** a 501-character question for UAT-01.
- **Accessibility checklist:** the WCAG 2.1 AA success criteria named in NFR-05.
- **No personal information** is used in any test question.

## 9. Sample UAT question bank

Facts below were checked against the HTML minutes of the Regular Council Meeting of 22 September 2026 and the portal listing on 17 October 2026. Page numbers are confirmed from the official PDF during preparation.

| ID | Question | Type | Expected result | Used in |
|---|---|---|---|---|
| Q-01 | Did council ratify the collective agreement with CUPE Local 1289? | Answerable | Yes. Regular Council Meeting, 22 September 2026, item 15.1; motion carried 8 to 2; resolution SJMC-R-2026-09-22/309. | UAT-01 to UAT-04, UAT-11 |
| Q-02 | What did council decide about 351-361 Kenmount Road? | Answerable, nuanced outcome | Council deferred the matter for two weeks (22 September 2026, item 6.4; carried 8 to 1, with one abstention after a declared conflict of interest). Must not be reported as approved; must note that a later decision may exist. | UAT-05 |
| Q-03 | Did council adopt the Rennie's River and Central and Mundy Pond neighbourhood plans? | Answerable, nuanced outcome | Adopted in principle, with staff directed to prepare the related Municipal Plan and Development Regulations amendments (22 September 2026, item 8.1; carried 10 to 0; resolution SJMC-R-2026-09-22/306). Must not be reported as finally adopted. | UAT-05 |
| Q-04 | SJMC-R-2026-09-22/309 | Exact identifier | Same passage as Q-01. | UAT-13 |
| Q-05 | DEV2600106; and separately, 259 Blackmarsh Road | Exact identifier | 22 September 2026, item 6.4; and 22 September 2026, item 6.8. | UAT-14 |
| Q-06 | Did council approve the new contract with CUPE Local 1289? | Paraphrase | Same passage as Q-01. | UAT-15 |
| Q-07 | What did council decide at the meeting of 6 October 2026? | Minutes not yet published | At the snapshot date the minutes were not listed. Expected: "not yet published", with the latest meeting covered (22 September 2026). | UAT-07 |
| Q-08 | What did Committee of the Whole decide on 15 September 2026? | Scope explanation | Committee of the Whole makes no final decisions. Its report was considered at the Regular Council Meeting of 22 September 2026, item 8.1. | UAT-09 |
| Q-09 | Should council approve more bike lanes? | Out of scope | Declined with a one-sentence explanation. | UAT-08 |
| Q-10 | Q-01 with the date range 1 January 2025 to 31 December 2025 | Date filter | No citation outside 2025; not found in that period. | UAT-16 |

## 10. Defect management

**Severity** (impact on the business)

| Severity | Definition | Examples |
|---|---|---|
| S1 Critical | Wrong or harmful output presented as fact, a privacy or security breach, or the service is unusable. No workaround. | An answer contradicts its cited passage; a citation points to a passage that does not exist; questions stored with an IP address; outage. |
| S2 Major | A Must requirement fails, or a main function is impaired with no reasonable workaround. | A citation link opens the wrong meeting; a keyboard trap; the assistant guesses instead of saying "not found"; the spending cap is not enforced. |
| S3 Minor | A function works incorrectly but a workaround exists, or a Should requirement fails. | An unclear date error message; a missing ellipsis on a shortened excerpt; page anchors not supported in one browser. |
| S4 Cosmetic | Presentation issue with no effect on function or meaning. | Spacing; a typing error in help text. |

**Priority** (urgency of the fix)

| Priority | Definition |
|---|---|
| P1 Immediate | Blocks further testing or go-live. Fix now. |
| P2 High | Fix before go-live. |
| P3 Medium | Fix in the next release or patch; workaround documented. |
| P4 Low | Add to the backlog. |

**Lifecycle:** New, Triaged, In progress, Fixed, Ready for retest, Closed (or Reopened). A defect may be Deferred only with the product owner's written approval and a recorded reason.

**Triage:** daily during execution, with the UAT lead, product owner and developer. Any S1 is escalated to the business sponsor the same day. Any answer-quality defect (S1 or S2) is added as a regression item to the Project A evaluation set.

## 11. Schedule template

Dates are set when the UAT environment is confirmed. Durations are suggestions.

| Phase | Activities | Owner | Suggested duration | Planned start | Planned end | Status |
|---|---|---|---|---|---|---|
| Preparation | Confirm question bank pages; set up environment and snapshot; recruit testers | UAT lead | 1 week | TBD | TBD | Not started |
| Briefing | 30-minute tester briefing and persona scripts | UAT lead | 1 day | TBD | TBD | Not started |
| Cycle 1 | Execute all test cases; run the automated suite on the snapshot | Testers, developer | 1 week | TBD | TBD | Not started |
| Fixing | Fix S1 and S2 defects; agree S3 workarounds | Developer, product owner | 1 week | TBD | TBD | Not started |
| Cycle 2 | Retest; regression of High priority cases; re-run the automated suite | Testers, developer | 3 days | TBD | TBD | Not started |
| Exit review | Summary report, go/no-go recommendation, sign-off | UAT lead, sponsor, product owner | 2 days | TBD | TBD | Not started |

## 12. Test case summary

| ID | Test case | Story | Requirements | Type | Priority | Status |
|---|---|---|---|---|---|---|
| UAT-01 | Answer a plain-language question with citations | US-01 | FR-01.1, FR-01.2 | Functional | High | Not run |
| UAT-02 | Citation shows meeting name, date and page | US-07 | FR-02.1 | Functional | High | Not run |
| UAT-03 | Citation link opens the official document at the cited page | US-08 | FR-02.2 | Functional | High | Not run |
| UAT-04 | Every statement is supported by its cited passage | US-01, US-07, US-10, US-20 | FR-01.2, FR-02.4, NFR-02.1 | AI quality | High | Not run |
| UAT-05 | Outcome reported exactly as recorded | US-05 | FR-01.4 | AI quality | High | Not run |
| UAT-06 | "Not found" response for an unanswerable question | US-02 | FR-03.1 | Functional | High | Not run |
| UAT-07 | Minutes not yet published | US-02 | FR-03.3 | Functional | Medium | Not run |
| UAT-08 | Out-of-scope questions declined | US-03 | FR-03.2 | AI quality | High | Not run |
| UAT-09 | Committee of the Whole question explained | US-06 | FR-01.5 | Functional | Medium | Not run |
| UAT-10 | Several decisions listed in date order | US-04 | FR-01.3 | Functional | Medium | Not run |
| UAT-11 | Source excerpts shown with the answer | US-10 | FR-05.1, FR-05.2, FR-05.3 | Functional | High | Not run |
| UAT-12 | HTML-only minutes cited by agenda item | US-09 | FR-02.3 | Functional | Medium | Not run |
| UAT-13 | Resolution number retrieves the right passage | US-12 | FR-06.1, FR-02.5 | Functional | High | Not run |
| UAT-14 | File number and civic address retrieve the right passage | US-12 | FR-06.1 | Functional | High | Not run |
| UAT-15 | Paraphrased question retrieves the right passage | US-13 | FR-06.2 | Functional | High | Not run |
| UAT-16 | Date range restricts the sources | US-14 | FR-04.1, FR-04.3 | Functional | Medium | Not run |
| UAT-17 | Invalid date range rejected with a clear message | US-14 | FR-04.2 | Functional | Medium | Not run |
| UAT-18 | New minutes ingested on schedule without manual editing | US-15 | FR-07.1, FR-07.4 | Operational | High | Not run |
| UAT-19 | Re-run creates no duplicates; changed minutes re-indexed | US-16, US-18 | FR-07.2, FR-07.5 | Operational | High | Not run |
| UAT-20 | Ingestion log and coverage dates updated | US-17 | FR-07.3, NFR-07.2 | Operational | High | Not run |
| UAT-21 | Failed quality gate keeps the previous index | US-19 | NFR-01.2 | Operational | High | Not run |
| UAT-22 | Disclaimer, coverage, model name and independence notice shown | US-11 | NFR-07.1, NFR-07.2, NFR-07.3, NFR-07.4 | Transparency | High | Not run |
| UAT-23 | Keyboard-only use | US-21 | NFR-05.1 | Accessibility | High | Not run |
| UAT-24 | Screen reader labels and announcements | US-21 | NFR-05.3, NFR-05.4 | Accessibility | High | Not run |
| UAT-25 | Contrast, zoom and reflow | US-21 | NFR-05.2, NFR-05.5 | Accessibility | High | Not run |
| UAT-26 | No account, no tracking, no identifiers in logs | US-22 | NFR-06.1, NFR-06.2, NFR-06.3, NFR-06.4 | Privacy | High | Not run |
| UAT-27 | Response time and progress indicator | US-23 | NFR-03.1, NFR-03.2, NFR-03.3 | Performance | Medium | Not run |
| UAT-28 | Spending cap switches to search-only mode | US-24 | NFR-04.1 | Operational | High | Not run |
| UAT-29 | Staff copies a citation into a reply | US-25 | FR-02.1, FR-02.2 | Functional | Medium | Not run |
| UAT-30 | Report a wrong answer without personal information | US-26 | TR-07, NFR-06.1 | Support | High | Not run |

**Totals:** 30 test cases: 22 High priority and 8 Medium priority.

## 13. Test cases

### UAT-01 Answer a plain-language question with citations

**Story:** US-01. **Requirements:** FR-01.1, FR-01.2. **Priority:** High. **Status:** Not run.

**Preconditions:** UAT snapshot includes the minutes of 22 September 2026. Tester acts as P1 Resident.

**Steps**
1. Open the assistant.
2. Ask Q-01: "Did council ratify the collective agreement with CUPE Local 1289?"
3. Count the words in the answer.
4. Paste a 501-character question and try to submit it.

**Expected result**
- The answer says council ratified the agreement, is 150 words or fewer, and cites the Regular Council Meeting of 22 September 2026.
- The 501-character question cannot be submitted, and the 500 character limit is stated.

### UAT-02 Citation shows meeting name, date and page

**Story:** US-07. **Requirements:** FR-02.1. **Priority:** High. **Status:** Not run.

**Preconditions:** UAT-01 answer available.

**Steps**
1. Ask Q-01.
2. Read each citation.

**Expected result**
- Each citation shows the meeting name, meeting date and page, for example "Regular Council Meeting, 22 September 2026, page n", where n matches the page confirmed in preparation.

### UAT-03 Citation link opens the official document at the cited page

**Story:** US-08. **Requirements:** FR-02.2. **Priority:** High. **Status:** Not run.

**Preconditions:** Q-01 answer available. Test in Chrome, Edge, Firefox and Safari.

**Steps**
1. Select the first citation link.
2. Note the address and the page shown.
3. Repeat in each desktop browser.

**Expected result**
- The official minutes for 22 September 2026 open from the City's eSCRIBE portal.
- The PDF opens at the cited page, or, where the browser does not support page links, the page number is shown next to the link.

### UAT-04 Every statement is supported by its cited passage

**Story:** US-01, US-07, US-10, US-20. **Requirements:** FR-01.2, FR-02.4, NFR-02.1. **Priority:** High. **Status:** Not run.

**Preconditions:** A sample of 10 answerable questions from the evaluation set, plus Q-01 to Q-03. Two reviewers.

**Steps**
1. Ask each question twice (two runs).
2. For every statement in each answer, open the cited passage and judge whether it supports the statement.
3. Record any statement with no citation, and any citation that does not support its statement.
4. Compare the reviewers' judgements with the Project A citation support result (PA-03).

**Expected result**
- No statement is uncited.
- No citation contradicts its statement; at least 90% of citations support their statements.
- The reviewers' judgements broadly agree with PA-03; any large difference is logged for the delivery team.

### UAT-05 Outcome reported exactly as recorded

**Story:** US-05. **Requirements:** FR-01.4. **Priority:** High. **Status:** Not run.

**Preconditions:** Snapshot includes the minutes of 22 September 2026. Tester acts as P2 Journalist.

**Steps**
1. Ask Q-02: "What did council decide about 351-361 Kenmount Road?"
2. Ask Q-03: "Did council adopt the Rennie's River and Central and Mundy Pond neighbourhood plans?"
3. Repeat both questions in a second run.

**Expected result**
- Q-02: the answer says the matter was deferred for two weeks, does not describe it as approved or rejected, and notes that a later decision may exist after the coverage end date.
- Q-03: the answer says the plans were adopted in principle and that staff were directed to prepare the related amendments, and does not describe the plans as finally adopted.

### UAT-06 "Not found" response for an unanswerable question

**Story:** US-02. **Requirements:** FR-03.1. **Priority:** High. **Status:** Not run.

**Preconditions:** Three unanswerable questions from the Project A evaluation set (IDs recorded).

**Steps**
1. Ask each unanswerable question.
2. Read the response.

**Expected result**
- Each response says the answer was not found in the Regular Council Meeting minutes, names the coverage period searched, and offers next steps (rephrase, browse eSCRIBE, contact the City Clerk's office or 311).
- No answer text or citation is shown.

### UAT-07 Minutes not yet published

**Story:** US-02. **Requirements:** FR-03.3. **Priority:** Medium. **Status:** Not run.

**Preconditions:** Snapshot's latest meeting with minutes is known (22 September 2026 at the 17 October 2026 snapshot).

**Steps**
1. Ask Q-07: "What did council decide at the meeting of 6 October 2026?"

**Expected result**
- The response says the minutes for that meeting are not yet published and gives the latest meeting date covered.

### UAT-08 Out-of-scope questions declined

**Story:** US-03. **Requirements:** FR-03.2. **Priority:** High. **Status:** Not run.

**Preconditions:** None.

**Steps**
1. Ask Q-09: "Should council approve more bike lanes?"
2. Ask "Will my property taxes go up next year?"
3. Ask "Is my neighbour's extension legal under the by-law?"

**Expected result**
- Each is declined with a one-sentence explanation that the assistant only reports what the minutes record.
- No opinion, prediction or legal interpretation is given, and no citation is shown.

### UAT-09 Committee of the Whole question explained

**Story:** US-06. **Requirements:** FR-01.5. **Priority:** Medium. **Status:** Not run.

**Preconditions:** Snapshot includes the minutes of 22 September 2026.

**Steps**
1. Ask Q-08: "What did Committee of the Whole decide on 15 September 2026?"

**Expected result**
- The response explains that Committee of the Whole makes no final decisions.
- It states, with a citation, that the committee's report was considered at the Regular Council Meeting of 22 September 2026, item 8.1.

### UAT-10 Several decisions listed in date order

**Story:** US-04. **Requirements:** FR-01.3. **Priority:** Medium. **Status:** Not run.

**Preconditions:** An evaluation set topic decided at two or more Regular Council Meetings (ID recorded).

**Steps**
1. Ask what council decided about that topic.

**Expected result**
- Each decision is listed with its meeting date, oldest first, and each has a citation.
- The answer says that a later decision may change an earlier one.

### UAT-11 Source excerpts shown with the answer

**Story:** US-10. **Requirements:** FR-05.1, FR-05.2, FR-05.3. **Priority:** High. **Status:** Not run.

**Preconditions:** Q-01 answer available.

**Steps**
1. Ask Q-01.
2. Count the excerpts and the characters in each.
3. Compare each excerpt with the official minutes.
4. Match each numbered citation marker to its excerpt.

**Expected result**
- Up to five excerpts, each 300 characters or fewer, word for word as in the minutes, with an ellipsis where shortened.
- Each excerpt is labelled with meeting name, date and page and links to the official document.
- Each numbered marker in the answer matches one excerpt.

### UAT-12 HTML-only minutes cited by agenda item

**Story:** US-09. **Requirements:** FR-02.3. **Priority:** Medium. **Status:** Not run.

**Preconditions:** A question whose answer is in one of the nine meetings with HTML-only minutes (for example, the meeting of 29 July 2025), with expected item confirmed in preparation.

**Steps**
1. Ask the prepared question.
2. Read the citation and open its link.

**Expected result**
- The citation shows the meeting name, meeting date and "item n".
- The link opens the HTML minutes on the eSCRIBE portal.

### UAT-13 Resolution number retrieves the right passage

**Story:** US-12. **Requirements:** FR-06.1, FR-02.5. **Priority:** High. **Status:** Not run.

**Preconditions:** Snapshot includes the minutes of 22 September 2026.

**Steps**
1. Ask Q-04: "SJMC-R-2026-09-22/309".
2. Review the retrieved passages and the answer.

**Expected result**
- The passage for item 15.1 of 22 September 2026 is among the top five results.
- The answer or citation shows the resolution number.

### UAT-14 File number and civic address retrieve the right passage

**Story:** US-12. **Requirements:** FR-06.1. **Priority:** High. **Status:** Not run.

**Preconditions:** Snapshot includes the minutes of 22 September 2026. Tester acts as P3 Community volunteer.

**Steps**
1. Ask "DEV2600106".
2. Ask "What did council decide about 259 Blackmarsh Road?"

**Expected result**
- Step 1: item 6.4 of 22 September 2026 is among the top five results.
- Step 2: item 6.8 of 22 September 2026 is among the top five results and is cited in the answer.

### UAT-15 Paraphrased question retrieves the right passage

**Story:** US-13. **Requirements:** FR-06.2. **Priority:** High. **Status:** Not run.

**Preconditions:** Snapshot includes the minutes of 22 September 2026.

**Steps**
1. Ask Q-06: "Did council approve the new contract with CUPE Local 1289?"

**Expected result**
- Item 15.1 of 22 September 2026 is among the top five results and is cited, even though the minutes use "ratify" and "collective agreement".

### UAT-16 Date range restricts the sources

**Story:** US-14. **Requirements:** FR-04.1, FR-04.3. **Priority:** Medium. **Status:** Not run.

**Preconditions:** None.

**Steps**
1. Leave the dates blank and ask Q-01; note the citations.
2. Set the range 1 January 2025 to 31 December 2025 and ask Q-01 again (Q-10).

**Expected result**
- Step 1 searches the full coverage period and cites 22 September 2026.
- Step 2 cites no meeting outside 2025 and reports that the answer was not found in that period.

### UAT-17 Invalid date range rejected with a clear message

**Story:** US-14. **Requirements:** FR-04.2. **Priority:** Medium. **Status:** Not run.

**Preconditions:** None. Run once with a keyboard and once with a screen reader.

**Steps**
1. Set the start date to 31 December 2025 and the end date to 1 January 2025.
2. Try to submit a question.

**Expected result**
- The question is not submitted.
- An error message explains in text that the start date must be on or before the end date, and the screen reader announces it.

### UAT-18 New minutes ingested on schedule without manual editing

**Story:** US-15. **Requirements:** FR-07.1, FR-07.4. **Priority:** High. **Status:** Not run.

**Preconditions:** Ingestion test environment with an index that excludes the most recently published Regular Council Meeting. Request logging enabled.

**Steps**
1. Ask a question answered only by the excluded meeting; confirm "not found".
2. Let the scheduled ingestion run (or trigger the scheduled job).
3. Ask the same question again.
4. Review the request log for the run.

**Expected result**
- After the run, the question is answered with a citation to the newly ingested meeting, with no manual editing.
- The log shows at most one request per second, the descriptive User-Agent, no re-download of unchanged documents, and no attempt to bypass access controls.

### UAT-19 Re-run creates no duplicates; changed minutes re-indexed

**Story:** US-16, US-18. **Requirements:** FR-07.2, FR-07.5. **Priority:** High. **Status:** Not run.

**Preconditions:** Ingestion test environment after UAT-18. A test copy of one document with changed content is available to the pipeline.

**Steps**
1. Record the counts of meetings, documents and passages.
2. Run ingestion again with nothing new; record the counts.
3. Present the changed document version; run ingestion.
4. Ask a question about the changed text.

**Expected result**
- Step 2 counts equal step 1 counts.
- After step 3 the changed document is re-indexed, and passages from the earlier version are no longer returned.

### UAT-20 Ingestion log and coverage dates updated

**Story:** US-17. **Requirements:** FR-07.3, NFR-07.2. **Priority:** High. **Status:** Not run.

**Preconditions:** UAT-18 completed.

**Steps**
1. Open the ingestion log for the run.
2. Open the assistant and read the coverage period and last update date.

**Expected result**
- The log lists meetings found, added, unchanged and failed.
- The coverage period matches the meetings in the index, and the last update date is the date of the run.

### UAT-21 Failed quality gate keeps the previous index

**Story:** US-19. **Requirements:** NFR-01.2. **Priority:** High. **Status:** Not run.

**Preconditions:** Ingestion test environment. A deliberately degraded test index (for example, built with a corrupted passage set) that scores below 85% hit@5.

**Steps**
1. Run the publish step with the degraded index.
2. Ask Q-01 in the assistant.
3. Check the maintainer's alerts.

**Expected result**
- The gate fails and the degraded index is not published; Q-01 is still answered from the previous index.
- The maintainer receives an alert with the evaluation report.

### UAT-22 Disclaimer, coverage, model name and independence notice shown

**Story:** US-11. **Requirements:** NFR-07.1, NFR-07.2, NFR-07.3, NFR-07.4. **Priority:** High. **Status:** Not run.

**Preconditions:** None.

**Steps**
1. Open the assistant and ask Q-01.
2. Look for the disclaimer, coverage period, last update date, model name and version, and independence notice.

**Expected result**
- All five items are visible on the page or with the answer, in plain language.
- The disclaimer states that the service is not the official record, can make mistakes, and that the official minutes on eSCRIBE prevail.

### UAT-23 Keyboard-only use

**Story:** US-21. **Requirements:** NFR-05.1. **Priority:** High. **Status:** Not run.

**Preconditions:** Desktop browser; mouse not used.

**Steps**
1. Use Tab, Shift+Tab, Enter and Space to reach every control.
2. Ask Q-01, open a citation, set a date range and use "Report a problem".

**Expected result**
- Every function can be completed with the keyboard in a logical order.
- The focus indicator is always visible, and there is no keyboard trap.

### UAT-24 Screen reader labels and announcements

**Story:** US-21. **Requirements:** NFR-05.3, NFR-05.4. **Priority:** High. **Status:** Not run.

**Preconditions:** NVDA with Firefox or Chrome, and VoiceOver with Safari.

**Steps**
1. Navigate to the question box and the date fields.
2. Ask Q-01 and wait for the answer.
3. Move through the answer, citations and excerpts.

**Expected result**
- Every input has a spoken label.
- The progress status and the arrival of the answer are announced without moving focus unexpectedly.
- Citations and excerpts are read in a logical order with meaningful link text.

### UAT-25 Contrast, zoom and reflow

**Story:** US-21. **Requirements:** NFR-05.2, NFR-05.5. **Priority:** High. **Status:** Not run.

**Preconditions:** Contrast checking tool available.

**Steps**
1. Check text and interface component contrast on the main page and an answer.
2. Zoom to 200%.
3. Narrow the window to 320 CSS pixels and ask Q-01.

**Expected result**
- Text contrast is at least 4.5 to 1, and large text and interface components at least 3 to 1.
- At 200% zoom and at 320 pixels wide, no content or function is lost and text does not need horizontal scrolling.

### UAT-26 No account, no tracking, no identifiers in logs

**Story:** US-22. **Requirements:** NFR-06.1, NFR-06.2, NFR-06.3, NFR-06.4. **Priority:** High. **Status:** Not run.

**Preconditions:** Browser developer tools available; developer support to show log entries; privacy reviewer present.

**Steps**
1. Use the assistant and inspect cookies and network requests.
2. Read the privacy notice near the question box.
3. Ask Q-01, then ask the developer to show the matching log entry.
4. Ask the developer to show the retention job configuration and its last run.

**Expected result**
- No sign-in, no tracking cookies, no third-party analytics requests.
- The privacy notice tells users not to enter personal information and states what is stored and for how long.
- The log entry contains the question text, date and quality data only, with no IP address or other identifier.
- Log entries older than the retention period are deleted.

### UAT-27 Response time and progress indicator

**Story:** US-23. **Requirements:** NFR-03.1, NFR-03.2, NFR-03.3. **Priority:** Medium. **Status:** Not run.

**Preconditions:** PA-05 and PA-06 results available for the snapshot. Tester acts as P4 City staff.

**Steps**
1. Ask five questions from the question bank and time each answer.
2. Load the search-only demo and time the results for one query after the page has loaded.
3. Watch for the progress indicator while an answer is prepared.

**Expected result**
- Observed times are consistent with PA-05 (p95 under 10 seconds) and PA-06 (under 1 second).
- A progress indicator is shown until each answer appears.

### UAT-28 Spending cap switches to search-only mode

**Story:** US-24. **Requirements:** NFR-04.1. **Priority:** High. **Status:** Not run.

**Preconditions:** UAT instance with the daily cap set to a test value that has been reached.

**Steps**
1. Ask Q-01.

**Expected result**
- Search results with citations are returned, without a generated answer.
- A notice explains that generated answers are temporarily unavailable.

### UAT-29 Staff copies a citation into a reply

**Story:** US-25. **Requirements:** FR-02.1, FR-02.2. **Priority:** Medium. **Status:** Not run.

**Preconditions:** Tester acts as P4 City staff with an email draft open.

**Steps**
1. Ask Q-01.
2. Choose "Copy citation" on the first citation.
3. Paste into the email draft.

**Expected result**
- The pasted text contains the meeting name, meeting date, page or item and the official link, as plain text.
- A confirmation is shown and announced to assistive technology.

### UAT-30 Report a wrong answer without personal information

**Story:** US-26. **Requirements:** TR-07, NFR-06.1. **Priority:** High. **Status:** Not run.

**Preconditions:** Triage queue access for the maintainer; privacy reviewer present.

**Steps**
1. Ask Q-01.
2. Choose "Report a problem" and describe a test issue.
3. Check the maintainer's triage queue.

**Expected result**
- The report is submitted without asking for a name or contact details.
- The triage queue shows the report with the question, answer and citations.
- The report is acknowledged within the TR-07 target during the pilot.

## 14. Automated checks in Project A

These checks belong to the implementation's evaluation suite in [Project A](https://github.com/mrw-soumik/stjohns-council-minutes-rag). The check IDs are proposed by this pack and will be aligned with Project A's own test names when its evaluation report is published. Until then **every result is Pending**: no result is claimed here.

| Check ID | Automated check | Requirements | Threshold | Related UAT | Result |
|---|---|---|---|---|---|
| PA-01 | Retrieval evaluation: hit@5 on answerable questions, overall and for exact-term and paraphrase subsets; keyword-only, semantic-only and combined | NFR-01, NFR-01.1, NFR-01.3, FR-06.1, FR-06.2, FR-06.3 | At least 85% | UAT-13, UAT-14, UAT-15, UAT-21 | Pending |
| PA-02 | Retrieval evaluation by year and by format (PDF, HTML) | NFR-01.3 | Report only | UAT-21 | Pending |
| PA-03 | Answer evaluation: share of citations that support their claim | NFR-02, NFR-02.1, NFR-02.2, FR-02.4, FR-01.2 | At least 90% | UAT-04 | Pending |
| PA-04 | Answer evaluation: share of unanswerable questions declined | NFR-02, NFR-02.2, FR-03.1 | At least 80% | UAT-06, UAT-08 | Pending |
| PA-05 | Latency benchmark: p95 end-to-end answer time | NFR-03, NFR-03.1 | Under 10 seconds | UAT-27 | Pending |
| PA-06 | Search-only demo: time to results after page load | NFR-03, NFR-03.2 | Under 1 second | UAT-27 | Pending |
| PA-07 | Cost report: average model cost per answer from API usage, in CAD | NFR-04, NFR-04.2 | Under CAD $0.05 | UAT-28 | Pending |
| PA-08 | Automated accessibility scan of the UI (for example axe-core) | NFR-05, NFR-05.2, NFR-05.3 | No serious or critical violations | UAT-23, UAT-24, UAT-25 | Pending |
| PA-09 | Privacy test: application logs contain no IP address or other identifier | NFR-06, NFR-06.2 | Pass | UAT-26 | Pending |
| PA-10 | UI test: disclaimer, coverage dates, model name and independence notice rendered | NFR-07, NFR-07.1, NFR-07.2, NFR-07.3, NFR-07.4 | Pass | UAT-22 | Pending |
| PA-11 | Citation tests: every answer other than "not found" has at least one citation with meeting name, date, page or item and a valid official URL | FR-02, FR-02.1, FR-02.2, FR-02.3 | 100% of answers | UAT-02, UAT-03, UAT-12 | Pending |
| PA-12 | Date filter tests: no retrieved passage outside the selected range | FR-04, FR-04.3 | 100% of filtered queries | UAT-16 | Pending |
| PA-13 | Excerpt tests: every excerpt is 300 characters or fewer and a verbatim substring of its source | FR-05, FR-05.1 | 100% of excerpts | UAT-11 | Pending |
| PA-14 | Ingestion tests: re-run creates no duplicates; log written; coverage updated | FR-07, FR-07.2, FR-07.3 | Pass | UAT-19, UAT-20 | Pending |

Automated scans find only part of the accessibility issues, so the manual cases UAT-23 to UAT-25 remain required.

## 15. Reporting and sign-off

**Daily during execution:** test cases run, passed, failed and blocked; new defects by severity; blockers.

**UAT summary report:** scope tested; results by test case; defects by severity and status; Project A check results with versions; deviations from this plan; open risks; go/no-go recommendation.

| Role | Name | Decision (accept, accept with conditions, reject) | Signature | Date |
|---|---|---|---|---|
| Business sponsor | | | | |
| Product owner | | | | |
| UAT lead | | | | |
| Privacy reviewer (ATIPP Coordinator) | | | | |
