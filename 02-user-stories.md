# User Stories and Release Plan: St. John's Council Minutes Assistant

> **Independent portfolio project.** Not affiliated with or endorsed by the City of St. John's. Source documents are © City of St. John's and are retrieved from the City's public meetings portal; this repository does not redistribute them.

| Item | Value |
|---|---|
| Document ID | CMA-BA-02 |
| Version | 0.9 (draft for validation with the delivery team) |
| Author | Mostafa Rafiur Wasib |
| Date | 17 October 2026 |
| Derived from | [01-business-requirements-document.md](01-business-requirements-document.md) (requirement IDs FR, NFR, TR) |
| Verified by | [03-uat-test-plan.md](03-uat-test-plan.md) and Project A automated checks; see [04-traceability-matrix.md](04-traceability-matrix.md) |

<!-- toc -->
**Contents**

1. [Purpose](#1-purpose)
2. [Conventions](#2-conventions)
3. [Epics](#3-epics)
4. [Story summary](#4-story-summary)
5. [Stories and acceptance criteria](#5-stories-and-acceptance-criteria)
6. [INVEST review](#6-invest-review)
7. [Prioritization rationale](#7-prioritization-rationale)
8. [Release plan](#8-release-plan)
<!-- /toc -->

## 1. Purpose

This backlog turns the solution requirements in the BRD into user stories that a delivery team can plan, build and test. Each story names who benefits and why, carries Gherkin acceptance criteria, and lists the requirement IDs it satisfies. Some examples in the acceptance criteria come from the published minutes of the Regular Council Meeting of 22 September 2026, so testers can check them against the real record. Page numbers are shown as `<n>` until confirmed against the official PDF during test preparation.

## 2. Conventions

- **Story format:** As a *persona*, I want *capability*, so that *benefit*. Personas P1 to P4 are defined in BRD section 6. The product owner and maintainer appear in enabler stories that protect quality and operations.
- **Acceptance criteria:** Gherkin (Given, When, Then). Each story has at least one scenario and is covered by at least one UAT case.
- **Priority:** MoSCoW, consistent with the BRD. A story takes the highest priority of the requirements it satisfies, unless noted.
- **Estimates:** relative story points on a modified Fibonacci scale (1, 2, 3, 5, 8, 13). The reference story is US-08 (2 points). These are the author's initial sizes for planning and are to be re-estimated by the delivery team.
- **INVEST:** independent, negotiable, valuable, estimable, small and testable (section 6).

**Definition of Ready**

- Persona, benefit, acceptance criteria, priority, estimate and requirement IDs are present.
- Test data is identified (UAT question bank items or evaluation set items).
- Dependencies are known, and open questions that affect the story are resolved or explicitly deferred.

**Definition of Done**

- All acceptance criteria pass, with automated tests added in Project A where the behaviour can be automated.
- The evaluation suite shows no regression against the NFR-01 and NFR-02 thresholds.
- UI changes pass an automated accessibility scan and a manual keyboard check.
- No personal data is introduced (privacy checklist from NFR-06).
- Help content and the runbook are updated where behaviour changed.
- The product owner has accepted the story.

## 3. Epics

| Epic | Name | Goal | Business requirements | Solution requirements |
|---|---|---|---|---|
| EP-01 | Ask and answer | People get a short, accurate answer or an honest "not found". | BR-01, BR-02 | FR-01, FR-03 |
| EP-02 | Trust and verification | Every answer can be checked against the official record. | BR-02 | FR-02, FR-05, NFR-07 |
| EP-03 | Find exact terms and filter | Exact identifiers, paraphrases and date ranges all work. | BR-01 | FR-04, FR-06 |
| EP-04 | Keep the record current | New minutes are added safely without manual editing. | BR-01, BR-02 | FR-07 |
| EP-05 | Quality gates | Releases meet agreed retrieval and answer quality thresholds. | BR-01, BR-02 | NFR-01, NFR-02 |
| EP-06 | Accessible, private and affordable | Everyone can use it; nobody is tracked; costs stay capped. | BR-01, BR-02, BR-03 | NFR-03, NFR-04, NFR-05, NFR-06 |
| EP-07 | Staff support and feedback | Staff can reuse citations; anyone can report a problem. | BR-02, BR-03 | FR-02, TR-07 |

## 4. Story summary

| ID | Story | Persona | Epic | Priority | Points | Release | Satisfies |
|---|---|---|---|---|---|---|---|
| US-01 | Ask a question in plain language | P1 Resident | EP-01 | Must | 5 | R1 | FR-01.1, FR-01.2 |
| US-02 | Be told when the minutes do not contain the answer | P1 Resident | EP-01 | Must | 3 | R1 | FR-03.1, FR-03.3 |
| US-03 | Decline questions outside council decisions | P1 Resident | EP-01 | Must | 2 | R1 | FR-03.2 |
| US-04 | See all decisions on a topic in date order | P3 Community volunteer | EP-01 | Should | 5 | R2 | FR-01.3 |
| US-05 | Get the outcome exactly as recorded | P2 Journalist or researcher | EP-01 | Must | 3 | R1 | FR-01.4 |
| US-06 | Understand where final decisions are made | P1 Resident | EP-01 | Should | 2 | R2 | FR-01.5 |
| US-07 | See citations with meeting name, date and page | P2 Journalist or researcher | EP-02 | Must | 3 | R1 | FR-02.1, FR-02.4 |
| US-08 | Open the official document at the cited page | P1 Resident | EP-02 | Must | 2 | R1 | FR-02.2 |
| US-09 | Cite HTML-only minutes by agenda item | P2 Journalist or researcher | EP-02 | Should | 3 | R2 | FR-02.3 |
| US-10 | Read the source excerpts next to the answer | P2 Journalist or researcher | EP-02 | Must | 3 | R1 | FR-05.1, FR-05.2, FR-05.3 |
| US-11 | See coverage dates, disclaimer and model name | P1 Resident | EP-02 | Must | 2 | R1 | NFR-07.1, NFR-07.2, NFR-07.3, NFR-07.4 |
| US-12 | Find by exact identifier | P3 Community volunteer | EP-03 | Must | 5 | R1 | FR-06.1, FR-02.5 |
| US-13 | Find with my own words | P1 Resident | EP-03 | Must | 5 | R1 | FR-06.2, FR-06.3 |
| US-14 | Limit the search to a date range | P2 Journalist or researcher | EP-03 | Should | 3 | R2 | FR-04.1, FR-04.2, FR-04.3 |
| US-15 | Ingest newly published minutes on a schedule | Maintainer | EP-04 | Must | 8 | R1 | FR-07.1, FR-07.4 |
| US-16 | Re-run ingestion without duplicates | Maintainer | EP-04 | Must | 3 | R1 | FR-07.2 |
| US-17 | Review the ingestion log and coverage update | Maintainer | EP-04 | Must | 2 | R1 | FR-07.3, NFR-07.2 |
| US-18 | Re-index amended minutes | Maintainer | EP-04 | Should | 3 | R2 | FR-07.5 |
| US-19 | Publish an index only if it passes the retrieval gate | Product owner | EP-05 | Must | 5 | R1 | NFR-01.1, NFR-01.2, NFR-01.3 |
| US-20 | Measure citation support and decline rate before release | Product owner | EP-05 | Must | 5 | R1 | NFR-02.1, NFR-02.2 |
| US-21 | Use the assistant with a keyboard and screen reader | P1 Resident | EP-06 | Must | 5 | R1 | NFR-05.1, NFR-05.2, NFR-05.3, NFR-05.4, NFR-05.5 |
| US-22 | Ask without an account or being tracked | P1 Resident | EP-06 | Must | 3 | R1 | NFR-06.1, NFR-06.2, NFR-06.3, NFR-06.4 |
| US-23 | Get an answer while the caller waits | P4 City staff | EP-06 | Should | 3 | R2 | NFR-03.1, NFR-03.2, NFR-03.3 |
| US-24 | Stay within the daily spending cap | Product owner | EP-06 | Must | 3 | R1 | NFR-04.1, NFR-04.2 |
| US-25 | Copy a citation into a reply | P4 City staff | EP-07 | Should | 2 | R2 | FR-02.1, FR-02.2 |
| US-26 | Report a wrong or unclear answer | P1 Resident | EP-07 | Must | 2 | R1 | TR-07, NFR-06.1 |

**Totals:** 26 stories, 90 points. Release 1 (MVP): 19 stories, 69 points. Release 2: 7 stories, 21 points.

## 5. Stories and acceptance criteria

### EP-01 Ask and answer

#### US-01 Ask a question in plain language

**As a** resident, **I want** to ask about a council decision in my own words, **so that** I do not need to know the meeting date or the wording used in the minutes.

| Priority | Estimate | Release | Satisfies | Verified by |
|---|---|---|---|---|
| Must | 5 points | R1 | FR-01.1, FR-01.2 | UAT-01, UAT-04 |

```gherkin
Feature: Ask a question in plain language

  Scenario: Answer a question about a recorded decision
    Given the index includes the Regular Council Meeting minutes of 22 September 2026
    When I ask "Did council ratify the collective agreement with CUPE Local 1289?"
    Then I see an answer of 150 words or fewer
    And the answer says that council ratified the agreement
    And the answer cites the Regular Council Meeting of 22 September 2026

  Scenario: Question longer than the limit
    Given I am on the question page
    When I type a question longer than 500 characters
    Then I cannot submit it
    And I see a message that states the 500 character limit
```

#### US-02 Be told when the minutes do not contain the answer

**As a** resident, **I want** to be told plainly when the minutes do not answer my question, **so that** I do not rely on a guess and I know what to do next.

| Priority | Estimate | Release | Satisfies | Verified by |
|---|---|---|---|---|
| Must | 3 points | R1 | FR-03.1, FR-03.3 | UAT-06, UAT-07 |

```gherkin
Feature: Honest "not found" responses

  Scenario: Topic not recorded in the minutes
    Given a question that the UAT question bank marks as unanswerable
    When I ask that question
    Then I see that the answer was not found in the Regular Council Meeting minutes
    And the message names the coverage period that was searched
    And the message offers next steps: rephrase, browse the eSCRIBE portal, or contact the City Clerk's office or 311
    And no citation is shown

  Scenario: Minutes not yet published
    Given the latest minutes in the index are from the meeting of 22 September 2026
    When I ask what council decided at the meeting of 6 October 2026
    Then I am told that minutes for that meeting are not yet published
    And I am told the latest meeting date covered
```

#### US-03 Decline questions outside council decisions

**As a** resident, **I want** the assistant to tell me when a question is not about recorded council decisions, **so that** I am not given opinions or predictions presented as facts.

| Priority | Estimate | Release | Satisfies | Verified by |
|---|---|---|---|---|
| Must | 2 points | R1 | FR-03.2 | UAT-08 |

```gherkin
Feature: Decline out-of-scope questions

  Scenario Outline: Opinions, predictions and legal advice are declined
    When I ask "<question>"
    Then I see a one-sentence explanation that the assistant only reports what the minutes record
    And no answer text or citation is shown

    Examples:
      | question                                            |
      | Should council approve more bike lanes?             |
      | Will my property taxes go up next year?             |
      | Is my neighbour's extension legal under the by-law? |
```

#### US-04 See all decisions on a topic in date order

**As a** community association volunteer, **I want** all decisions about a topic listed oldest to newest with their dates, **so that** I can see how a matter developed and which decision is the latest.

| Priority | Estimate | Release | Satisfies | Verified by |
|---|---|---|---|---|
| Should | 5 points | R2 | FR-01.3 | UAT-10 |

```gherkin
Feature: Decisions in date order

  Scenario: Topic decided at more than one meeting
    Given the evaluation set contains a topic decided at two or more Regular Council Meetings
    When I ask what council decided about that topic
    Then each decision is listed with its meeting date
    And the decisions appear oldest first
    And the answer says that a later decision may change an earlier one
```

#### US-05 Get the outcome exactly as recorded

**As a** journalist, **I want** the outcome reported exactly as the minutes record it, **so that** I do not report a deferral as an approval or an adoption in principle as a final adoption.

| Priority | Estimate | Release | Satisfies | Verified by |
|---|---|---|---|---|
| Must | 3 points | R1 | FR-01.4 | UAT-05 |

```gherkin
Feature: Outcomes reported as recorded

  Scenario: A deferral is not reported as an approval
    Given the minutes of 22 September 2026 record that council deferred the matter at 351-361 Kenmount Road for two weeks
    When I ask "What did council decide about 351-361 Kenmount Road?"
    Then the answer says the matter was deferred for two weeks
    And the answer does not say the application was approved or rejected
    And the answer says that a later decision may exist after the coverage end date

  Scenario: An adoption in principle is not reported as a final adoption
    Given the minutes of 22 September 2026 record that council adopted two neighbourhood plans in principle
    When I ask "Did council adopt the Rennie's River and Central and Mundy Pond neighbourhood plans?"
    Then the answer says the plans were adopted in principle
    And the answer says staff were directed to prepare the related Municipal Plan and Development Regulations amendments
    And the answer does not describe the plans as finally adopted
```

#### US-06 Understand where final decisions are made

**As a** resident, **I want** to be told, when I ask about Committee of the Whole, that final decisions are made at Regular Council Meetings, **so that** I look for the decision in the right place.

| Priority | Estimate | Release | Satisfies | Verified by |
|---|---|---|---|---|
| Should | 2 points | R2 | FR-01.5 | UAT-09 |

```gherkin
Feature: Committee of the Whole questions

  Scenario: Question about a Committee of the Whole meeting
    When I ask "What did Committee of the Whole decide on 15 September 2026?"
    Then I am told that Committee of the Whole makes no final decisions
    And I am told its report was considered at the Regular Council Meeting of 22 September 2026, item 8.1
    And that statement has a citation
```

### EP-02 Trust and verification

#### US-07 See citations with meeting name, date and page

**As a** journalist, **I want** every statement in an answer cited with the meeting name, date and page, **so that** I can verify and quote it.

| Priority | Estimate | Release | Satisfies | Verified by |
|---|---|---|---|---|
| Must | 3 points | R1 | FR-02.1, FR-02.4 | UAT-02, UAT-04 |

```gherkin
Feature: Complete citations

  Scenario: Every statement is cited
    When I receive an answer that is not "not found"
    Then every statement in the answer has at least one numbered citation
    And each citation shows the meeting name, the meeting date and the page number
    And a citation reads like "Regular Council Meeting, 22 September 2026, page <n>"
```

#### US-08 Open the official document at the cited page

**As a** resident, **I want** a citation to open the official minutes at the cited page, **so that** I can check the answer myself.

| Priority | Estimate | Release | Satisfies | Verified by |
|---|---|---|---|---|
| Must | 2 points | R1 | FR-02.2 | UAT-03 |

```gherkin
Feature: Links to the official record

  Scenario: PDF citation opens the official document
    Given an answer cites PDF minutes on page <n>
    When I select the citation link
    Then the official minutes open from the City's eSCRIBE portal
    And the PDF viewer opens at page <n>, or the page number is shown next to the link if my browser does not support page links
```

#### US-09 Cite HTML-only minutes by agenda item

**As a** journalist, **I want** answers based on HTML-only minutes to cite the agenda item, **so that** I can still find the exact place in the record.

| Priority | Estimate | Release | Satisfies | Verified by |
|---|---|---|---|---|
| Should | 3 points | R2 | FR-02.3 | UAT-12 |

```gherkin
Feature: Citations for HTML-only minutes

  Scenario: Answer from minutes published only in HTML
    Given the minutes of a meeting are published only in HTML
    When an answer cites those minutes
    Then the citation shows the meeting name, the meeting date and "item <number>"
    And the link opens the HTML minutes on the eSCRIBE portal
```

#### US-10 Read the source excerpts next to the answer

**As a** journalist, **I want** to read the source excerpts next to the answer, **so that** I can judge it without opening every document.

| Priority | Estimate | Release | Satisfies | Verified by |
|---|---|---|---|---|
| Must | 3 points | R1 | FR-05.1, FR-05.2, FR-05.3 | UAT-11, UAT-04 |

```gherkin
Feature: Source excerpts

  Scenario: Excerpts shown with the answer
    When I receive an answer that is not "not found"
    Then I see up to five excerpts next to the answer
    And each excerpt is 300 characters or fewer and copied word for word from the minutes
    And a shortened excerpt is marked with an ellipsis
    And each excerpt is labelled with the meeting name, date and page or item and links to the official document
    And each numbered citation marker in the answer matches one excerpt
```

#### US-11 See coverage dates, disclaimer and model name

**As a** resident, **I want** to see what period the assistant covers, that it is not the official record, and which model produced the answer, **so that** I know how far to trust it.

| Priority | Estimate | Release | Satisfies | Verified by |
|---|---|---|---|---|
| Must | 2 points | R1 | NFR-07.1, NFR-07.2, NFR-07.3, NFR-07.4 | UAT-22 |

```gherkin
Feature: Transparency information

  Scenario: Information shown on the page
    When I open the assistant
    Then I see the coverage period with the first and latest meeting dates and the last update date
    And I see a disclaimer that the official minutes on eSCRIBE prevail
    And I see the name and version of the language model
    And I see the independence notice
```

### EP-03 Find exact terms and filter

#### US-12 Find by exact identifier

**As a** community association volunteer, **I want** to search by an address, by-law number, resolution number or development file number, **so that** I find the exact item I am following.

| Priority | Estimate | Release | Satisfies | Verified by |
|---|---|---|---|---|
| Must | 5 points | R1 | FR-06.1, FR-02.5 | UAT-13, UAT-14 |

```gherkin
Feature: Exact identifiers

  Scenario Outline: An exact identifier retrieves the right passage
    When I ask about "<identifier>"
    Then the top five retrieved passages include the minutes of <meeting>, item <item>

    Examples:
      | identifier            | meeting           | item |
      | SJMC-R-2026-09-22/309 | 22 September 2026 | 15.1 |
      | DEV2600106            | 22 September 2026 | 6.4  |
      | 259 Blackmarsh Road   | 22 September 2026 | 6.8  |

  Scenario: Resolution number shown when present
    Given the cited passage contains the resolution number SJMC-R-2026-09-22/309
    When the answer cites that passage
    Then the resolution number is shown in the answer or the citation
```

#### US-13 Find with my own words

**As a** resident, **I want** to find decisions even when I use different words from the minutes, **so that** I do not have to guess the official wording.

| Priority | Estimate | Release | Satisfies | Verified by |
|---|---|---|---|---|
| Must | 5 points | R1 | FR-06.2, FR-06.3 | UAT-15 |

```gherkin
Feature: Paraphrased questions

  Scenario: Different words from the minutes
    When I ask "Did council approve the new contract with CUPE Local 1289?"
    Then the top five retrieved passages include the minutes of 22 September 2026, item 15.1
    And the answer cites that passage
```

FR-06.3 (how keyword and semantic results are combined) is a design requirement. It is verified through the subset reporting in Project A check PA-01 rather than by a user-facing scenario.

#### US-14 Limit the search to a date range

**As a** journalist, **I want** to limit the search to a date range, **so that** I only see decisions from the period I am reporting on.

| Priority | Estimate | Release | Satisfies | Verified by |
|---|---|---|---|---|
| Should | 3 points | R2 | FR-04.1, FR-04.2, FR-04.3 | UAT-16, UAT-17 |

```gherkin
Feature: Date range filter

  Scenario: The range excludes meetings outside it
    Given I set the date range from 1 January 2025 to 31 December 2025
    When I ask "Did council ratify the collective agreement with CUPE Local 1289?"
    Then no citation is from a meeting outside 2025
    And if no 2025 meeting answers the question, I am told it was not found in that period

  Scenario: Start date after end date
    When I set a start date that is later than the end date
    Then I see an error message that explains the problem in text
    And the question is not submitted until the range is corrected
```

### EP-04 Keep the record current

#### US-15 Ingest newly published minutes on a schedule

**As the** maintainer, **I want** newly published Regular Council Meeting minutes ingested automatically on a schedule, **so that** answers stay current without manual editing.

| Priority | Estimate | Release | Satisfies | Verified by |
|---|---|---|---|---|
| Must | 8 points | R1 | FR-07.1, FR-07.4 | UAT-18 |

```gherkin
Feature: Scheduled ingestion

  Scenario: New minutes are published on the portal
    Given the index covers all minutes published up to the last run
    And minutes for a later Regular Council Meeting are then published on eSCRIBE
    When the scheduled ingestion runs
    Then the new minutes are indexed without any manual editing
    And questions about that meeting can be answered with citations

  Scenario: Polite access to the portal
    When the ingestion runs
    Then it sends at most one request per second with the descriptive User-Agent
    And it does not download documents that have not changed
    And it does not try to bypass any access control on the portal
```

Note: this is the largest story and carries the most uncertainty because of constraint C-03 (browser verification on PDF requests). If the access method is not agreed before sprint planning, split it into (a) detect newly listed minutes and ingest HTML minutes, and (b) ingest PDF minutes once an access method is agreed (OQ-05).

#### US-16 Re-run ingestion without duplicates

**As the** maintainer, **I want** to re-run ingestion without creating duplicates, **so that** I can recover from a failed run safely.

| Priority | Estimate | Release | Satisfies | Verified by |
|---|---|---|---|---|
| Must | 3 points | R1 | FR-07.2 | UAT-19 |

```gherkin
Feature: Idempotent ingestion

  Scenario: Re-run with nothing new
    Given an ingestion run has completed
    When I run ingestion again and no minutes are new or changed
    Then the numbers of meetings, documents and passages in the index are unchanged
```

#### US-17 Review the ingestion log and coverage update

**As the** maintainer, **I want** an ingestion log and updated coverage dates after every run, **so that** I can see what changed and users can see how current the data is.

| Priority | Estimate | Release | Satisfies | Verified by |
|---|---|---|---|---|
| Must | 2 points | R1 | FR-07.3, NFR-07.2 | UAT-20 |

```gherkin
Feature: Ingestion log and coverage

  Scenario: After a run
    When an ingestion run finishes
    Then the log records the meetings found, added, unchanged and failed
    And the coverage period shown to users matches the meetings in the index
    And the last update date is the date of the run
```

#### US-18 Re-index amended minutes

**As the** maintainer, **I want** changed minutes detected and re-indexed, **so that** answers reflect corrected documents.

| Priority | Estimate | Release | Satisfies | Verified by |
|---|---|---|---|---|
| Should | 3 points | R2 | FR-07.5 | UAT-19 |

```gherkin
Feature: Amended minutes

  Scenario: A document's content changes
    Given a minutes document in the index is replaced on the portal with changed content
    When ingestion runs
    Then the changed document is re-indexed
    And passages from the earlier version are no longer returned
```

### EP-05 Quality gates

#### US-19 Publish an index only if it passes the retrieval gate

**As the** product owner, **I want** a new index published only if it passes the retrieval quality gate, **so that** a faulty ingestion cannot lower answer quality.

| Priority | Estimate | Release | Satisfies | Verified by |
|---|---|---|---|---|
| Must | 5 points | R1 | NFR-01.1, NFR-01.2, NFR-01.3 | UAT-21 |

```gherkin
Feature: Retrieval quality gate

  Scenario: The gate passes
    Given a new index has been built
    When the evaluation suite reports hit@5 of at least 85% on the answerable questions
    Then the new index is published
    And the coverage dates are updated

  Scenario: The gate fails
    Given a new index has been built
    When the evaluation suite reports hit@5 below 85%
    Then the previous index stays live
    And the maintainer is alerted with the evaluation report
```

#### US-20 Measure citation support and decline rate before release

**As the** product owner, **I want** citation support and the decline rate measured before each release, **so that** I can show the answers meet the agreed quality thresholds.

| Priority | Estimate | Release | Satisfies | Verified by |
|---|---|---|---|---|
| Must | 5 points | R1 | NFR-02.1, NFR-02.2 | UAT-04 |

```gherkin
Feature: Answer quality report

  Scenario: Report before release
    When the answer evaluation runs on the current evaluation set
    Then the report shows the share of citations that support their claim
    And the share of unanswerable questions that were declined
    And the evaluation set version, the model name and the date
    And the release is blocked if citation support is below 90% or the decline rate is below 80%
```

### EP-06 Accessible, private and affordable

#### US-21 Use the assistant with a keyboard and screen reader

**As a** resident who uses a screen reader, **I want** to ask questions and hear the answers and citations announced, **so that** I can use the service independently.

| Priority | Estimate | Release | Satisfies | Verified by |
|---|---|---|---|---|
| Must | 5 points | R1 | NFR-05.1, NFR-05.2, NFR-05.3, NFR-05.4, NFR-05.5 | UAT-23, UAT-24, UAT-25 |

```gherkin
Feature: Accessible use

  Scenario: Keyboard only
    Given I use only a keyboard
    When I move through the page, ask a question and open a citation
    Then every control is reachable in a logical order
    And the focus is always visible

  Scenario: Screen reader
    Given I use a screen reader
    When an answer is ready
    Then the answer is announced without my focus moving unexpectedly
    And the question box and the date fields have spoken labels

  Scenario: Zoom and contrast
    When I zoom the page to 200% or narrow it to 320 pixels wide
    Then no content or function is lost and there is no horizontal scrolling for text
    And text meets a contrast ratio of at least 4.5 to 1
```

#### US-22 Ask without an account or being tracked

**As a** resident, **I want** to use the assistant without an account and without being tracked, **so that** my questions cannot be linked to me.

| Priority | Estimate | Release | Satisfies | Verified by |
|---|---|---|---|---|
| Must | 3 points | R1 | NFR-06.1, NFR-06.2, NFR-06.3, NFR-06.4 | UAT-26 |

```gherkin
Feature: Privacy by design

  Scenario: No account and no tracking
    When I use the assistant
    Then I am never asked to sign in or give personal information
    And no tracking cookies or third-party analytics are set
    And I see a privacy notice near the question box

  Scenario: Logs contain no identifiers
    Given I have asked a question
    When the maintainer inspects the application logs
    Then the log entry contains the question text, the date and quality data only
    And it contains no IP address or other identifier
    And entries older than the retention period have been deleted
```

#### US-23 Get an answer while the caller waits

**As a** City staff member answering an enquiry, **I want** answers within a few seconds, **so that** I can respond while the caller waits.

| Priority | Estimate | Release | Satisfies | Verified by |
|---|---|---|---|---|
| Should | 3 points | R2 | NFR-03.1, NFR-03.2, NFR-03.3 | UAT-27 |

```gherkin
Feature: Response time

  Scenario: Performance test
    When the performance test runs over the evaluation set
    Then the 95th percentile end-to-end answer time is under 10 seconds
    And search-only results appear in under 1 second after the page has loaded

  Scenario: Progress indicator
    When I ask a question
    Then a progress indicator is shown until the answer appears
    And the status is announced to assistive technology
```

#### US-24 Stay within the daily spending cap

**As the** product owner, **I want** a daily spending cap with an automatic switch to search-only mode, **so that** running costs stay within budget.

| Priority | Estimate | Release | Satisfies | Verified by |
|---|---|---|---|---|
| Must | 3 points | R1 | NFR-04.1, NFR-04.2 | UAT-28 |

```gherkin
Feature: Spending cap

  Scenario: The daily cap is reached
    Given the daily spending cap has been reached
    When a user asks a question
    Then the assistant returns search results with citations but no generated answer
    And a notice explains that generated answers are temporarily unavailable

  Scenario: Cost report
    When the cost report runs
    Then it shows the average model cost per answer in CAD calculated from the provider's usage records
    And it shows the exchange rate and date used
```

### EP-07 Staff support and feedback

#### US-25 Copy a citation into a reply

**As a** City staff member answering an enquiry, **I want** to copy a citation and its official link in one step, **so that** I can paste a reference the resident can check into my reply.

| Priority | Estimate | Release | Satisfies | Verified by |
|---|---|---|---|---|
| Should | 2 points | R2 | FR-02.1, FR-02.2 | UAT-29 |

```gherkin
Feature: Copy citation

  Scenario: Copy a citation as plain text
    Given an answer with citations is shown
    When I choose "Copy citation" for one citation
    Then the meeting name, meeting date, page or item and the official link are copied as plain text
    And a confirmation is announced to assistive technology
```

#### US-26 Report a wrong or unclear answer

**As a** resident, **I want** to report an answer that looks wrong without giving personal information, **so that** it can be corrected for everyone.

| Priority | Estimate | Release | Satisfies | Verified by |
|---|---|---|---|---|
| Must | 2 points | R1 | TR-07, NFR-06.1 | UAT-30 |

```gherkin
Feature: Report a problem

  Scenario: Report an answer
    Given an answer is shown
    When I choose "Report a problem" and describe the issue
    Then the report is sent with the question, the answer and its citations
    And I am not asked for my name or contact details
    And the report appears in the maintainer's triage queue
```

## 6. INVEST review

| Criterion | How the backlog meets it | Exceptions and actions |
|---|---|---|
| Independent | Stories are split by capability, not by technical layer. Dependencies are sequencing only: ingestion (US-15) comes before answering (US-01), and US-25 builds on US-07. | None that share scope. |
| Negotiable | Stories state needs and outcomes, not screen designs. For example, US-25 could be a button or a keyboard shortcut. | Wording of the "not found" and disclaimer messages depends on OQ-07. |
| Valuable | Every story names who benefits and why. Enabler stories (US-16, US-19, US-20, US-24) are written for the product owner or maintainer because they protect quality, cost and recovery. | None. |
| Estimable | Acceptance criteria and test data exist for every story. | US-15 is the least certain because of C-03; see the split plan in its note. |
| Small | The largest story is 8 points and fits in one sprint at the planning velocity below. | US-15 is the split candidate. |
| Testable | Every story has Gherkin scenarios and at least one UAT case, and the measurable ones also have a Project A automated check. | Coverage is checked automatically (see 04-traceability-matrix.md). |

## 7. Prioritization rationale

1. **Trust before convenience.** Everything BR-02 depends on is Must: citations, "not found", excerpts, transparency, quality gates and the problem-report channel. An AI answer that cannot be checked fails the purpose and creates risk (R-01, R-03).
2. **The core finding capability is Must.** Plain-language questions (US-01) and hybrid retrieval for exact terms and paraphrases (US-12, US-13) deliver BR-01.
3. **Currency is Must.** Without scheduled, safe ingestion (US-15 to US-17), answers go stale quickly (R-02), because minutes are published after adoption at a later meeting.
4. **Public-sector obligations are Must.** Accessibility (US-21), privacy (US-22) and the spending cap (US-24) are conditions for any public release, not enhancements.
5. **Should stories improve the experience or serve narrower needs, and have workarounds.** People can add the year to a question until the date filter (US-14) exists. HTML-only minutes still get a meeting-level citation until US-09 adds item numbers, and they affect 9 of 242 meetings. Staff can copy text by hand until US-25. Response-time tuning (US-23) matters most for staff on the phone.
6. **Later and Won't.** Structured motion data (resolution numbers and vote counts as fields), Committee of the Whole minutes and decision notes are later-release candidates that depend on OQ-06, OQ-13 and OQ-14. Accounts, saved histories, alerts, agendas, video and other languages are out of scope for now (BRD section 4.2).

## 8. Release plan

Planning velocity is assumed at 20 points per two-week sprint for a two-person team, to be replaced by measured velocity after the first sprint.

| Release | Sprint | Stories | Points | Outcome |
|---|---|---|---|---|
| R1 (MVP) | Sprint 1 | US-15, US-16, US-17, US-19 | 18 | Minutes ingested safely; retrieval gate and evaluation set in place |
| R1 (MVP) | Sprint 2 | US-12, US-13, US-01, US-03, US-08 | 19 | Questions answered from hybrid retrieval, with links to the official record |
| R1 (MVP) | Sprint 3 | US-02, US-05, US-07, US-10, US-11, US-20 | 19 | Full citations, excerpts, honest "not found", answer quality gate |
| R1 (MVP) | Sprint 4 | US-21, US-22, US-24, US-26 | 13 | Accessibility, privacy, cost cap and problem reports; remaining capacity for UAT fixes |
| R1 | | **Release 1 total** | **69** | UAT and pilot (TR-03) start after Sprint 4 |
| R2 | Sprint 5 and part of Sprint 6 | US-04, US-06, US-09, US-14, US-18, US-23, US-25 | 21 | Date filter, decisions in date order, HTML item citations, staff copy, amended minutes, performance tuning |
| Later | To be planned | Structured motions, Committee of the Whole minutes, decision notes | Not estimated | Subject to OQ-06, OQ-13, OQ-14 |

**MVP definition:** a member of the public can ask a question about Regular Council Meeting minutes and get either a short answer with complete citations, verbatim excerpts and links to the official record, or an honest "not found". The service is accessible, collects no personal data, keeps costs capped, and only publishes indexes that pass the quality gates.
