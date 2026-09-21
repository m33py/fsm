# Logic Diagrams — source of truth

These diagrams are the **canonical reference for system logic**. Screens, server actions,
and schema are built *against* these, not the other way around. When the logic changes, the
diagram changes here first, in the same PR.

## Format: Mermaid (why)

Diagrams are authored in **Mermaid** (fenced ` ```mermaid ` blocks in Markdown) because:

- **It renders natively on GitHub** — you get the picture without leaving the repo.
- **It's text** — it diffs, reviews, and merges like code, so a logic change is a reviewable
  line change, not an opaque binary blob.
- **One source, no drift** — the same file is both the human diagram and the spec the
  shared transition rulebook (`design-review.md` §2.4) is implemented from.

The stylized Excalidraw hand-drawings from the design sessions were for *feeling* the flow;
these Mermaid files are for *being the reference*. The Excalidraw visuals can be regenerated
on demand and are not the source of truth. (If we ever want editable native `.excalidraw`
files checked in alongside, we add them as clearly-secondary companions — Mermaid stays
canonical.)

## Index

| File | What it defines |
|---|---|
| `job-lifecycle-fsm.md` | The core Job finite state machine — states, transitions, who triggers each, which timestamp is captured, resolution outcomes. |
| `escalation-notification-flow.md` | The `notification_rules` tiered escalation flow — trigger → condition → wait window → action/channel, and how reassignment re-enters the FSM. |

## Status

These reflect the four decisions recorded in `docs/design-review.md` (dual response clock,
`resolution_outcome`, Accepted/En-route substate, one shared transition rulebook). They are
**design source of truth**; `docs/technical-design.md` is updated to match when Phase-1 build
begins — until then, where the two differ, `design-review.md` + these diagrams are the newer
intent.
