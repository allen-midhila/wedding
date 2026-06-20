# Agent Operations Guide

Purpose: Provide a single machine-friendly and human-readable operating guide for agents working in this workspace.

## Canonical Entry Points
- Knowledge base root: `info/`
- Master index: `info/INDEX.md`
- This operations guide: `AGENT_OPERATIONS.md`

## Section Index Map
Use these IDs in all outputs, updates, and status notes.

| ID | Topic | Path |
| --- | --- | --- |
| WED-01 | Couple and Primary Contacts | info/01-people/01-couple-and-primary-contacts.md |
| WED-02 | Wedding Vision and Style | info/02-vision/02-wedding-vision-and-style.md |
| WED-03 | Key Dates and Milestones | info/03-schedule/03-key-dates-and-milestones.md |
| WED-04 | Ceremony Details | info/04-event/04-ceremony-details.md |
| WED-05 | Reception Details | info/04-event/05-reception-details.md |
| WED-06 | Guest List and Attendance | info/05-guests/06-guest-list-and-attendance.md |
| WED-07 | Budget and Payments | info/06-finance/07-budget-and-payments.md |
| WED-08 | Wedding Party and Roles | info/01-people/08-wedding-party-and-roles.md |
| WED-09 | Vendor Roster | info/07-vendors/09-vendor-roster.md |
| WED-10 | Attire and Beauty | info/08-design/10-attire-and-beauty.md |
| WED-11 | Decor and Design Plan | info/08-design/11-decor-and-design-plan.md |
| WED-12 | Food and Beverage | info/09-experience/12-food-and-beverage.md |
| WED-13 | Music and Entertainment | info/09-experience/13-music-and-entertainment.md |
| WED-14 | Logistics and Operations | info/03-schedule/14-logistics-and-operations.md |
| WED-15 | Stationery and Website | info/05-guests/15-stationery-and-website.md |
| WED-16 | Legal and Administrative | info/10-legal-travel/16-legal-and-administrative.md |
| WED-17 | Honeymoon and Post-Wedding | info/10-legal-travel/17-honeymoon-and-post-wedding.md |
| WED-18 | Decision Log | info/11-controls/18-decision-log.md |
| WED-19 | Open Questions and Risks | info/11-controls/19-open-questions-and-risks.md |
| WED-20 | Weekly Status Snapshot | info/03-schedule/20-weekly-status-snapshot.md |

## Agent Operating Rules
1. Treat `info/INDEX.md` as the routing table and section registry.
2. Write updates in the smallest relevant section file instead of creating duplicate notes.
3. Reference section IDs (`WED-xx`) in every generated output.
4. Record final decisions in `WED-18` and unresolved items in `WED-19`.
5. If a request touches multiple domains, update each source file and then summarize in `WED-20`.

## Standard Update Workflow
1. Read `info/INDEX.md`.
2. Resolve request to one or more section IDs.
3. Read and update only the mapped section files.
4. Add decision/risk entries when applicable.
5. Return a short change summary listing touched `WED-xx` IDs.

## Quick Routing Hints
- Budget, payments, cost changes -> WED-07
- Guest counts, plus-ones, RSVP -> WED-06 and WED-15
- Vendor contracts, contacts, due dates -> WED-09
- Day-of timings and logistics -> WED-03 and WED-14
- Legal paperwork and license -> WED-16
- Post-wedding tasks -> WED-17

## Health Check (for agents)
- Index exists: yes
- Section files expected: 20
- Control files for governance: WED-18, WED-19, WED-20
