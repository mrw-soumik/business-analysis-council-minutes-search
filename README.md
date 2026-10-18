# Business Analysis: St. John's Council Minutes Assistant

A complete business analysis work sample for a public-sector AI product: the requirements, user stories, UAT plan, traceability and BPMN process maps for a service that answers plain-language questions about St. John's City Council decisions, with citations to the official minutes.

> **Independent portfolio project.** Not affiliated with or endorsed by the City of St. John's. Source documents are © City of St. John's and are retrieved from the City's public meetings portal; this repository does not redistribute them.

- **Author:** Mostafa Rafiur Wasib ([GitHub: mrw-soumik](https://github.com/mrw-soumik))
- **Status:** version 0.9, complete draft for stakeholder validation, 17 October 2026
- **Full pack as one PDF:** [council-minutes-assistant-ba-pack.pdf](council-minutes-assistant-ba-pack.pdf)

<!-- pdf:start -->
## What this is

The **St. John's Council Minutes Assistant** lets a resident, journalist, community volunteer or City staff member ask a question such as "What did council decide about 351-361 Kenmount Road?". The answer is short and cites the exact meeting, date and page, with a link to the official document. When the minutes do not answer the question, it says "not found in the minutes" instead of guessing.

This repository is the **business analysis** for that product, written to the standard a municipal or consulting business systems analyst would produce. It uses BABOK Guide v3 terminology and requirements classification (business, stakeholder, solution and transition requirements), BPMN 2.0 process models, MoSCoW prioritization, INVEST user stories with Gherkin acceptance criteria, and a requirements traceability matrix.

## Who it is for

- **Hiring managers and recruiters** for Business Analyst and Business Systems Analyst roles: a realistic, end-to-end example of requirements work on an AI product in a public-sector setting.
- **Delivery teams:** the requirements and acceptance tests that the implementation (Project A) is built and measured against.

## Five-minute path

1. **Executive summary:** [BRD section 1](01-business-requirements-document.md#1-executive-summary). The problem, the solution, scope and the decisions needed.
2. **Process maps:** the [current state](diagrams/current-state.svg) with pain points, then the [future state](diagrams/future-state.svg). Both are BPMN 2.0 models.
3. **Requirements:** [BRD section 9](01-business-requirements-document.md#9-requirements). Shared IDs (BR, FR, NFR) with priority, rationale and testable acceptance criteria.
4. **Three stories:** [US-05](02-user-stories.md#us-05-get-the-outcome-exactly-as-recorded) (a deferral must not be reported as an approval), [US-07](02-user-stories.md#us-07-see-citations-with-meeting-name-date-and-page) (citations) and [US-15](02-user-stories.md#us-15-ingest-newly-published-minutes-on-a-schedule) (ingestion).
5. **Traceability:** the [forward matrix](04-traceability-matrix.md#3-forward-traceability), from business requirement to the automated check that measures it.

## What is in the pack

| Document | Contents |
|---|---|
| [01-business-requirements-document.md](01-business-requirements-document.md) | The core BRD: document control, executive summary, background, SMART success measures with baseline methods, scope, stakeholder register, power and interest grid, RACI, elicitation plan, proto-personas, current and future state with BPMN maps, gap analysis, requirements with IDs and acceptance criteria, data requirements and conceptual data model, business rules, transition requirements, assumptions, constraints and dependencies, risks (including AI, privacy and copyright risks), open questions, glossary and a blank sign-off table |
| [02-user-stories.md](02-user-stories.md) | 7 epics and 26 INVEST user stories with Gherkin acceptance criteria, MoSCoW priority, relative estimates and the requirements each satisfies; prioritization rationale and a two-release plan |
| [03-uat-test-plan.md](03-uat-test-plan.md) | UAT objectives, approach, entry and exit criteria, roles, environment, test data and question bank, defect severity and priority, schedule template, 30 test cases (all "Not run") and the mapping to Project A's automated checks (all "Pending") |
| [04-traceability-matrix.md](04-traceability-matrix.md) and [traceability.csv](traceability.csv) | Business requirement to functional or non-functional requirement to user stories to UAT test cases to Project A automated checks, generated from the documents and checked for gaps |
| [diagrams/](diagrams/) | Current-state and future-state BPMN 2.0 models (`.bpmn`) with SVG and PNG renders, the context diagram and the conceptual data model |
| [evidence/](evidence/) and [scripts/portal_snapshot.py](scripts/portal_snapshot.py) | The reproducible source of every current-state count quoted in the BRD |

## How it connects to Project A

The implementation lives in a separate repository, [stjohns-council-minutes-rag](https://github.com/mrw-soumik/stjohns-council-minutes-rag) (Project A), a retrieval-augmented generation (RAG) application. The two projects share requirement IDs: BR-01 to BR-03, FR-01 to FR-07 and NFR-01 to NFR-07.

- This pack **defines** the requirements and their acceptance thresholds. For example, NFR-01 requires the correct source page in the top five results for at least 85% of answerable test questions.
- Project A **implements** them and **measures** the thresholds with its automated evaluation suite.
- The traceability matrix links each requirement to the Project A check that measures it (PA-01 to PA-14). Every result is **Pending** until Project A publishes its evaluation report. This pack claims no results.

## Key findings from the current-state analysis

Observed on the City's public pages and eSCRIBE portal on 17 October 2026 (sources and method in BRD section 7.2 and Appendix A):

- Regular Council Meetings are where council makes its formal decisions. Committee of the Whole makes no final decisions, so the first release covers Regular Council Meeting minutes only.
- The portal lists 253 Regular Council Meetings from 8 July 2019 to 6 October 2026. 242 list minutes; 9 of those are HTML-only, with no page numbers to cite, which led to requirement FR-02.3.
- The portal's keyword search returns meetings and documents but no text excerpts, so each result must be opened and read.
- Minutes are adopted at a later meeting, so the newest decisions are not yet searchable. This drives the "not yet published" message (FR-03.3) and visible coverage dates (NFR-07.2).
- Scripted requests for minutes PDFs received a browser verification page. That makes an agreed access method a dependency and an open question for the City (D-05, OQ-05).

## What this pack does and does not claim

- Current-state facts are limited to what is publicly observable, each with its source. Everything about City internal processes is labelled as an assumption to validate.
- No interviews, workshops or surveys have taken place. The personas are proto-personas, and BRD section 5.5 sets out the elicitation plan that would validate them.
- No baseline is invented. Success measures state how each baseline will be measured; targets are proposals for the sponsor to confirm.
<!-- pdf:end -->

## Standards and validation

- **BPMN 2.0:** both process models pass four checks:
  - they import into bpmn-js in headless Chrome with zero warnings, plus checks that no label wraps unexpectedly and no task icon overlaps its text;
  - they pass bpmnlint's recommended rules;
  - they validate against the official OMG BPMN 2.0 XML schema (`npm run xsd:bpmn`, which downloads the schema from omg.org and uses xmllint);
  - the published SVGs are exported by bpmn-js itself.

  Open the `.bpmn` files in [bpmn.io](https://demo.bpmn.io) or Camunda Modeler to edit them.
- **Traceability:** `tools/trace/build-traceability.mjs` generates the matrix and CSV from the documents. It fails if any reference is broken or any requirement lacks a story or a UAT case.
- **Writing:** Canadian English, plain language, no hype.

## Rebuild

Requirements: Node.js 20 or later, Google Chrome (used through puppeteer-core; no browser is downloaded), Python 3.9 or later for the evidence script, and poppler (`pdftotext`) for the PDF contents page numbers.

```sh
cd tools
npm ci
npm run build        # BPMN models, validation, diagrams, traceability and the PDF
```

Individual steps: `npm run bpmn`, `npm run lint:bpmn`, `npm run xsd:bpmn`, `npm run diagrams`, `npm run trace`, `npm run pdf`. Set `CHROME_PATH` if Chrome is not in the default macOS location.

To reproduce the current-state counts (reads only the portal's public meeting listing, at most one request per second, with a local cache):

```sh
python3 scripts/portal_snapshot.py --as-of 2026-10-17
```

## Repository structure

```text
01-business-requirements-document.md   BRD (CMA-BA-01)
02-user-stories.md                     User stories and release plan (CMA-BA-02)
03-uat-test-plan.md                    UAT test plan (CMA-BA-03)
04-traceability-matrix.md              Traceability matrix, generated (CMA-BA-04)
traceability.csv                       Traceability, machine-readable, generated
council-minutes-assistant-ba-pack.pdf  The full pack as one PDF
diagrams/                              BPMN models, SVG and PNG renders, context diagram, data model
evidence/                              Portal snapshot used for current-state counts
scripts/portal_snapshot.py             Reproduces the snapshot
tools/                                 Build and validation tooling (Node.js)
```

## Copyright and data

City of St. John's documents are not stored in this repository. The snapshot script reads only the public meeting listing (dates, meeting types and the names of published documents). The `.gitignore` excludes PDF files other than this pack, to prevent City documents being committed by mistake. Any demo of the product shows excerpts of 300 characters or fewer, with links to the official source.
