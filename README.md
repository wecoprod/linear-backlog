# linear-backlog

A self-hosted public kanban board that pulls issues from Linear and displays them for your users.

Filter issues by a label (e.g. `show-backlog`) — only those issues appear on the board, grouped by workflow state.

**Live example:** [backlog.wecopost.com](https://backlog.wecopost.com)

## Setup

1. Clone the repo and install dependencies:

```bash
git clone https://github.com/wecoprod/linear-backlog.git
cd linear-backlog
npm install
```

2. Copy `.env.example` and fill in your values:

```bash
cp .env.example .env
```

| Variable | Required | Description |
|---|---|---|
| `LINEAR_API_TOKEN` | ✓ | Linear personal API key (Settings → API → Personal API keys) |
| `LINEAR_TEAM_ID` | ✓ | UUID of the Linear team (visible in the team URL or API) |
| `LINEAR_PROJECT` | | Name of a Linear project to filter issues (e.g. `wecopost`) |
| `LINEAR_PROJECT_ID` | | UUID of a Linear project — use instead of `LINEAR_PROJECT` if names conflict |
| `LINEAR_LABEL` | ✓ | Label name to filter issues (e.g. `show-backlog`) |
| `CACHE_TTL` | | Cache duration in seconds (default: `60`) |
| `BRAND_COLOR` | | Hex color for theming borders and backgrounds (default: `"#6366f1"`) — wrap in quotes |
| `BOARD_TITLE` | | Page title and header text (default: `Backlog`) |
| `BOARD_DESCRIPTION` | | Subtitle displayed next to the title |
| `BOARD_STATES` | | Comma-separated list of state names to display, in order (default: all states) |
| `BOARD_LOCALE` | | UI language: `en` or `fr` (default: `en`) |

3. Add the label to issues in Linear that you want to display publicly.

## Development

```bash
npm run dev      # Start dev server at http://localhost:4321
npm test         # Run unit tests
npm run build    # Build for production
npm start        # Start production server
```

## Docker

```bash
# Build and run
docker build -t linear-backlog .
docker run -p 4321:4321 --env-file .env linear-backlog

# Or with docker compose
docker compose up
```

> **Note:** `docker compose up` reads your shell environment variables or an `.env` file in the project root.

## How it works

On each page load, the app fetches workflow states and matching issues from the Linear GraphQL API, groups them by state, and renders a kanban board server-side. Responses are cached in memory for `CACHE_TTL` seconds to avoid hammering the API. If the API is unavailable, the last cached response is served (stale-on-error).

## License

MIT
