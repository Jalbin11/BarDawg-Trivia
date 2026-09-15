# BarDawg Trivia

A host-side bar trivia app: open one page on a laptop, run a full trivia night —
real questions, a visible timer, team scoring — without a spreadsheet or a phone app.

## How to run it

Open `index.html` directly in a browser. That's it — no install, no build step, no
server. Click **Classic Mode** to start a round.

## Current state

- **Classic Mode** is playable end to end: questions are fetched live from the
  [Open Trivia DB](https://opentdb.com/) API, each question has a real 15-second
  countdown, and answering (or timing out) locks the buttons, reveals the correct
  answer, and advances to the next question. A round is 10 questions, then a summary
  screen shows the score.
- **Team scoring** works via the "Score" button on the Classic Mode screen: add or
  remove teams at any point, award or adjust points, and see a running scoreboard.
  Scores are saved to the browser's `localStorage`, so a page reload or a closed lid
  doesn't lose the night. "New Game" clears scores after asking for confirmation.
- Scores live in one browser on the host's laptop — there is no backend, no accounts,
  and no cross-device sync. That's the whole design, not a gap.
- **Lightning Round** and **Team Battle** modes referenced in earlier versions of this
  README do not exist and are not currently planned.

## How to deploy it

This is a static site — any static host works:

- **Cloudflare Pages**: connect the repo (or drag-and-drop the folder) and deploy;
  no build command needed.
- **Self-hosted** on tc1's Caddy: drop the repo contents at
  `http://100.82.11.93:8443/b/bardawg-trivia/` (see `docs/homelab-integration.md` in
  [agent-builds](https://github.com/Jalbin11/agent-builds)).

## Attribution

Trivia questions are provided by the [Open Trivia DB](https://opentdb.com/), licensed
under [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/).
