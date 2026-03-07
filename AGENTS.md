# AGENTS.md

## Cursor Cloud specific instructions

### Overview

BarDawg Trivia is an early-stage bar trivia web app. The codebase has two parts:

- **Static frontend** (`index.html`, `classic.html`, `Assets/`): vanilla HTML/CSS/JS, no build step.
- **Python script** (`TriviaRequests.py`): standalone script that fetches trivia from the Open Trivia Database API using the `requests` library.

### Running the app

Serve the frontend with Python's built-in HTTP server:

```
python3 -m http.server 8000
```

Then open `http://localhost:8000/index.html` in a browser.

### Running the Python script

```
python3 TriviaRequests.py
```

### Caveats

- The landing page fetches `mscoringPanel.htl` via `fetch()`, which does not exist — this causes a 404 in the console but does not break the page.
- `lightning.html` and `team.html` are referenced but do not exist; clicking those buttons yields 404 pages.
- There is no build system, no linter config, no test framework, and no package manager config in this project.
- The Python `requests` library is the only external dependency (already available system-wide; `pip install requests` if missing).
