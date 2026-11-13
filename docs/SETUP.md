# Setup

Adds the review bot to a Drupal project. Most of the time goes into writing the
project's rules (step 2).

You need admin access to the project's GitHub repo and the
[GitHub CLI](https://cli.github.com/) logged in.

## 1. Install

From your project's root, run:

```bash
composer config --json --merge extra.drupal-scaffold.allowed-packages '["fourkitchens/pr-review-kit"]'
composer require --dev fourkitchens/pr-review-kit:^1
```

This adds `.github/workflows/claude-review.yml` and the rule files in
`docs/agents/pr-review/`. Files that already exist are never overwritten.

## 2. Write the project's rules

The review is only as good as these rules. Good rules are:

* **Short.** 6–10 items per file. Long lists get skimmed, by people and by the bot.
* **Specific to the project.** "Write clean code" adds nothing. "Logic goes in the
  `<project>_*` module that owns the topic" does.
* **Yes or no.** Each item is a question you can answer by looking at the diff.
* **A bold name and one line.** `- **Cache metadata.** Entities loaded in preprocess add their cache tags.`
* **Linked, not copied.** If the project already has a longer doc, link to it.

The bot also reads the project's `AGENTS.md` and its workflow facts. If the
project doesn't have them yet, run the `drupal-setup-agents` skill from
[ai-cookbook](https://github.com/fourkitchens/ai-cookbook) first.

Claude Code can write the first draft. Open it in your project's root and paste
these prompts.

**a. Pitfalls from past PRs (optional).** A list of what reviewers on this project
catch again and again. Skip it on a new project with few PRs.

```text
Read the review comments on the last 100 merged PRs of this repo
(`gh pr list --state merged -L 100`, then `gh api` for each PR's review
comments and reviews). Find the issues reviewers raise more than once.

Write docs/agents/review-pitfalls.md: a "# Review pitfalls" title, then the
issues grouped into 5–8 numbered "## N. <Topic>" sections, one bullet per rule,
each ending with the PR number that shows it, e.g. "(PR #123)".
Skip one-off comments and generic advice. Don't invent rules that the comments
don't show.
```

**b. The checklists.**

```text
Fill in docs/agents/pr-review/README.md, frontend.md, backend.md and drupal.md
from their templates. Use what you learn from this repo's code (themes, custom
modules, config layout, tooling) and from docs/agents/review-pitfalls.md if it
exists.

In README.md, replace <Drupal> with the project's stack, check that the paths
in the area table match this repo, and replace <site> in the preview URL with
the Pantheon site name. Leave <N> and <path>; the bot fills them in.

In the other files: keep the generic items that apply, replace every <...>
placeholder, add project-specific items, and delete items that don't apply.
6–10 items per file, each a bold name plus one line.
```

**c. Review the drafts.** Claude drafts, a person decides. In each file, delete
anything generic or wrong, keep an item only if it has happened in this project,
and remove the `<!-- Template ... -->` comment at the top.

## 3. Add the secrets

From your project's root, run these. Each one asks for the value.

```bash
gh secret set ANTHROPIC_API_KEY      # Claude Console → Settings → API keys
gh secret set PRODUCTIVE_API_TOKEN   # Productive → Settings → API integrations (optional)
```

Skip any secret the GitHub organization already has. Without the Productive
token, the bot reviews against the PR description instead of the task.

To test with a personal Claude Pro or Max plan instead of an API key, run
`claude setup-token` and save the token with `gh secret set CLAUDE_CODE_OAUTH_TOKEN`.

## 4. Create the label and test

```bash
gh label create "claude review" --color 6f42c1 --description "Runs a Claude review of the PR" --force
```

Commit, push and open a PR, then add the `claude review` label. After about
3–6 minutes the PR gets a "Claude review" comment and the label is removed.
Merge the PR, and the label works on any PR.

## Troubleshooting

| Symptom | Likely cause |
| --- | --- |
| `composer require` adds no files | The package isn't allowed (step 1). Add it, then run `composer drupal:scaffold`. |
| No run in Actions | The label isn't exactly `claude review`, or Actions is off. |
| The review step fails | A missing or expired secret (step 3). |
| The review says "A.C. not found" | The run's summary in Actions says why: no task link or task in the branch name (see [Usage](USAGE.md)), a task code that matches more than one task, or no Productive token. |

## Updates

Changes to the review reach every project on its next run. The files in
`docs/agents/pr-review/` belong to the project, and `composer update` never
overwrites them.
