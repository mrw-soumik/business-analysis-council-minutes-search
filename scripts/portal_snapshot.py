#!/usr/bin/env python3
"""Reproduce the current-state facts cited in the business requirements document.

Reads meeting metadata (names, dates and the list of published documents) from the
City of St. John's public eSCRIBE meetings portal and summarises coverage of
Regular Council Meeting minutes. It does not download any City document; it only
reads the calendar listing that the portal itself uses.

Polite by design: at most one request per second, a descriptive User-Agent, and a
local cache (.cache/portal/) so that repeated runs do not re-fetch.

Usage (Python 3.9+, standard library only):
    python3 scripts/portal_snapshot.py --as-of 2026-10-17
    python3 scripts/portal_snapshot.py --as-of 2026-10-17 --out evidence/portal-snapshot-2026-10-17.json

Independent portfolio project. Not affiliated with or endorsed by the City of St. John's.
"""
from __future__ import annotations

import argparse
import collections
import datetime as dt
import json
import pathlib
import time
import urllib.request

PORTAL = "https://pub-stjohns.escribemeetings.com"
ENDPOINT = PORTAL + "/MeetingsCalendarView.aspx/GetCalendarMeetings"
USER_AGENT = "stjohns-council-minutes-rag/0.1 (portfolio research; contact mostafa.wasib73@gmail.com)"
RCM = "Regular Council Meeting"
REPO = pathlib.Path(__file__).resolve().parent.parent
CACHE = REPO / ".cache" / "portal"


def date_ranges(as_of: dt.date) -> list[tuple[str, str]]:
    """Calendar windows queried. The portal's earliest meeting is in 2019."""
    ranges = [("2000-01-01", "2019-12-31"), ("2020-01-01", "2025-12-31")]
    for year in range(2026, as_of.year + 1):
        ranges.append((f"{year}-01-01", f"{year}-12-31"))
    return ranges


def fetch_range(start: str, end: str, refresh: bool) -> list[dict]:
    CACHE.mkdir(parents=True, exist_ok=True)
    cached = CACHE / f"calendar_{start}_{end}.json"
    if cached.exists() and not refresh:
        return json.loads(cached.read_text(encoding="utf-8"))["d"]
    body = json.dumps({"calendarStartDate": start, "calendarEndDate": end}).encode("utf-8")
    request = urllib.request.Request(
        ENDPOINT,
        data=body,
        headers={"Content-Type": "application/json; charset=utf-8", "User-Agent": USER_AGENT},
        method="POST",
    )
    with urllib.request.urlopen(request, timeout=60) as response:
        payload = response.read()
    cached.write_bytes(payload)
    time.sleep(1.1)  # at most one request per second
    return json.loads(payload)["d"]


def doc_titles(meeting: dict) -> list[str]:
    return [link.get("Title") or "" for link in (meeting.get("MeetingDocumentLink") or [])]


def summarise(meetings: list[dict], as_of: dt.date) -> dict:
    def meeting_date(m: dict) -> dt.date:
        return dt.datetime.strptime(m["StartDate"][:10], "%Y/%m/%d").date()

    held = [m for m in meetings if meeting_date(m) <= as_of]
    rcm_held = sorted((m for m in held if m["MeetingName"].strip() == RCM), key=meeting_date)

    def has_minutes(m: dict) -> bool:
        return any(t in ("Minutes (PDF)", "Minutes (HTML)") for t in doc_titles(m))

    with_minutes = [m for m in rcm_held if has_minutes(m)]
    pdf = [m for m in with_minutes if "Minutes (PDF)" in doc_titles(m)]
    html_only = [m for m in with_minutes if "Minutes (PDF)" not in doc_titles(m)]
    without = [m for m in rcm_held if not has_minutes(m)]

    per_year: dict[int, collections.Counter] = collections.defaultdict(collections.Counter)
    for m in held:
        per_year[meeting_date(m).year]["meetings_held"] += 1
    for m in rcm_held:
        c = per_year[meeting_date(m).year]
        c["regular_council_meetings_held"] += 1
        c["with_minutes_listed"] += int(has_minutes(m))
        c["with_pdf_minutes"] += int("Minutes (PDF)" in doc_titles(m))

    return {
        "source": ENDPOINT,
        "as_of": as_of.isoformat(),
        "note": "Counts are of meetings listed on the public portal with a start date on or before as_of. "
                "No City documents were downloaded.",
        "earliest_meeting_on_portal": min(meeting_date(m) for m in meetings).isoformat(),
        "regular_council_meetings_held": len(rcm_held),
        "with_minutes_listed": len(with_minutes),
        "with_pdf_minutes": len(pdf),
        "html_only_minutes": len(html_only),
        "without_minutes_listed": len(without),
        "html_only_meeting_dates": [meeting_date(m).isoformat() for m in html_only],
        "meeting_dates_without_minutes": [meeting_date(m).isoformat() for m in without],
        "latest_meeting_with_minutes": meeting_date(with_minutes[-1]).isoformat() if with_minutes else None,
        "latest_meeting_held": meeting_date(rcm_held[-1]).isoformat() if rcm_held else None,
        "per_year": {str(y): dict(sorted(c.items())) for y, c in sorted(per_year.items())},
    }


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__.split("\n\n")[0])
    parser.add_argument("--as-of", default=dt.date.today().isoformat(), help="cut-off date, YYYY-MM-DD")
    parser.add_argument("--out", help="write the JSON summary to this path")
    parser.add_argument("--refresh", action="store_true", help="ignore the local cache and fetch again")
    args = parser.parse_args()
    as_of = dt.date.fromisoformat(args.as_of)

    meetings: list[dict] = []
    for start, end in date_ranges(as_of):
        meetings.extend(fetch_range(start, end, args.refresh))
    summary = summarise(meetings, as_of)

    text = json.dumps(summary, indent=2) + "\n"
    if args.out:
        out = pathlib.Path(args.out)
        out.parent.mkdir(parents=True, exist_ok=True)
        out.write_text(text, encoding="utf-8")
    print(text)


if __name__ == "__main__":
    main()
