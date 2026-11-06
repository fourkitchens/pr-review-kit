# PR Review Kit

Claude Code review bot for pull requests on Four Kitchens projects. Adding the
`claude review` label to a PR runs a review against the Productive task's
acceptance criteria and posts the findings on the PR.

## At A Glance

|   |   |
|---|---|
| Trigger | `claude review` label on a pull request |
| Runs on | GitHub Actions ([claude-code-action](https://github.com/anthropics/claude-code-action)) |
| Ticket source | Productive (optional) |
| Review rules | `docs/agents/pr-review/` in each project |
| Cost | ~$0.30–2.50 per review with an API key |

## Dependencies and Requirements

* [Composer](https://getcomposer.org/)
* [GitHub CLI](https://cli.github.com/)
* [Claude Code](https://code.claude.com/docs)

## Repository Layout

| Path | Purpose |
| --- | --- |
| `.github/workflows/review.yml` | Review workflow, shared by all projects. |
| `templates/workflow/` | Project workflow. Goes in the project's `.github/workflows/`. |
| `templates/pr-review/` | Review instructions and checklists. Go in the project's `docs/agents/pr-review/`. |
| `composer.json` | Composer package. Installing it adds the templates to the project. |
| `docs/` | Setup and usage guides. |

## Documentation

* [Setup](docs/SETUP.md)
* [Usage](docs/USAGE.md)

## Versions

Projects call the review with `@v1`, which points at the latest `v1.x.y`
release, so fixes arrive on their own. To take updates only when you choose,
pin a release (`@v1.0.0`) in the project's `.github/workflows/claude-review.yml`.

## Contributing

Open an issue or a pull request in this repo.
