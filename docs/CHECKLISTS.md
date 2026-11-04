# Writing the checklists

The workflow barely changes between projects. The review's value comes from the
markdown files: rules that apply to **this** project.

## Guidelines

* **Short.** 6–10 items per file. Long lists get skimmed, by people and by the bot.
* **Project-specific.** "Write clean code" adds nothing. "Logic goes in the
  `<project>_*` module that owns the topic" does.
* **Checkable.** Each item is a yes/no question about the diff.
* **Bold name + one line.** `- **Cache metadata.** Entities loaded in preprocess add their cache tags.`
* **Link, don't copy.** If the project already has a longer doc, link it.

## Step 1 (optional): Draft `review-pitfalls.md` from the PR history

A list of what reviewers on the project catch repeatedly. Optional, but the most
valuable file. Skip it for a new project with little PR history; the bot works
without it.

In Claude Code, from the project folder, paste:

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

## Step 2: Draft the three checklists

In Claude Code, from the project folder, paste:

```text
Fill in docs/agents/pr-review/frontend.md, backend.md and drupal.md from their
templates. Use what you learn from this repo's code (themes, custom modules,
config layout, tooling) and from docs/agents/review-pitfalls.md if it exists.

For each file: keep the generic items that apply, replace every <...>
placeholder, add project-specific items, and delete items that don't apply.
6–10 items per file, each a bold name plus one line. Then check that the paths
in the area table of docs/agents/pr-review/README.md match this repo.
```

## Step 3: Review the drafts

Claude drafts, a person decides. For each file:

* Delete anything generic or wrong.
* Keep an item only if it has actually happened in this project.
* Remove the `<!-- Template ... -->` comment at the top.

## Step 4: Keep them current

When a review catches the same problem twice, add one line to
`docs/agents/review-pitfalls.md` with the PR number (create the file if needed).
