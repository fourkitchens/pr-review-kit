# PR Review Kit

Claude Code review bot for pull requests on Four Kitchens projects. Adding the
`claude review` label to a PR runs a review against the Productive task's
acceptance criteria and posts the findings on the PR.

## At A Glance

| Item | Details |
| --- | --- |
| Trigger | `claude review` label on a pull request |
| Runs on | GitHub Actions ([claude-code-action](https://github.com/anthropics/claude-code-action)) |
| Ticket source | Productive (optional) |
| Review rules | `docs/agents/pr-review/` in each project |
| Cost | ~$0.30–2.50 per review with an API key |

## Dependencies and Requirements

* [GitHub CLI](https://cli.github.com/)
* [Claude Code](https://code.claude.com/docs)
* Claude Pro/Max subscription or Anthropic API key
* Productive API token (optional)

## Repository Layout

| Path | Purpose |
| --- | --- |
| `workflows/claude-review.yml` | Review workflow. Copy to `.github/workflows/`. |
| `templates/` | Review instructions and checklist templates. Copy to `docs/agents/pr-review/`. |
| `docs/` | Setup, usage and checklist guides. |

## Documentation

* [Setup](docs/SETUP.md)
* [Usage](docs/USAGE.md)
* [Writing the checklists](docs/CHECKLISTS.md)

## Contributing

Open an issue or a pull request in this repo.
