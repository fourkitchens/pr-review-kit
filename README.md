# pr-review-kit

An AI review bot for pull requests. Add the `claude review` label to a PR and
Claude explains the change, checks it against the ClickUp ticket, and comments
on the PR.

This kit gives you the files and the steps to add the bot to your project. Copy
them and make them your own.

## What the bot does

1. **Finds the ticket.** Takes the first ticket id in the PR description and
   downloads it from ClickUp (if configured; otherwise it uses the PR description).
2. **Reads the PR.** Description and diff, plus the project's `AGENTS.md` and
   `docs/agents/review-pitfalls.md` if it has them.
3. **Sorts the files** into frontend, backend and Drupal, and applies each
   area's checklist.
4. **Checks the acceptance criteria** one by one: met, partial, not met, or
   "check on the preview site".
5. **Flags changes the ticket didn't ask for.**
6. **Comments on the PR:** notes on specific lines, plus one summary.
7. **Removes the label**, so it can be added again.

## The files

```
workflows/
└── claude-review.yml                 ← runs the review when the label is added
docs/
├── README.md                         ← the steps the bot follows
├── frontend.md                       ← checklist for theme code
├── backend.md                        ← checklist for custom PHP
└── drupal.md                         ← checklist for config and deploy hooks
```

In your project they go in two places:

| From this kit | To your project |
|---|---|
| `workflows/claude-review.yml` | `.github/workflows/` |
| `docs/*.md` | `docs/agents/pr-review/` |

## Setup

About 1 hour, most of it writing the checklists (step 3).

You need:

- Admin access to the project's GitHub repo, and access to the fourkitchens
  GitHub organization (to clone this kit).
- The [`gh` CLI](https://cli.github.com/), logged in (`gh auth login`).
- [Claude Code](https://code.claude.com/docs) installed. It's used to get the
  token (step 4) and to draft the checklists.
- A Claude Pro or Max subscription, or an Anthropic API key.

### 1. Copy the files

```bash
gh repo clone fourkitchens/pr-review-kit ~/dev/pr-review-kit
cd ~/dev/<your-project>
git switch main && git pull
git switch -c add-pr-review
mkdir -p .github/workflows docs/agents/pr-review
cp -n ~/dev/pr-review-kit/workflows/claude-review.yml .github/workflows/
cp -n ~/dev/pr-review-kit/docs/*.md docs/agents/pr-review/
```

Use your default branch if it isn't `main`. `cp -n` skips files that already
exist, so a project's own checklists are never overwritten. Already cloned the
kit? Run `git -C ~/dev/pr-review-kit pull` instead of `gh repo clone`.

### 2. Set your ticket prefix

In `.github/workflows/claude-review.yml`, replace `<PREFIX>` with the prefix of
your project's ClickUp ticket ids. If tickets look like `BCJ-1234`, the line
becomes `TICKET_PATTERN: 'BCJ-[0-9]+'`. Not using ClickUp? Leave it empty:
`TICKET_PATTERN: ''`.

The bot looks for the ticket in the **PR description**, so every PR must include
the ticket id or its ClickUp link (e.g. `https://app.clickup.com/t/36718269/BCJ-1234`).
If your PR template already has a ticket field, you're set.

### 3. Fill in the markdown files

See [Writing the checklists](#writing-the-checklists) below. At minimum, in
`docs/agents/pr-review/README.md`:

- Replace `<Drupal>` with your stack.
- Check the paths in the area table match your repo.
- In the preview URL, replace `<site>` with your Pantheon site name, or the
  whole URL if you don't use Pantheon. Leave `<N>` and `<path>`: the bot fills them.

And in `frontend.md`, `backend.md` and `drupal.md`, replace or delete every
`<...>`; the bot reads whatever is left.

### 4. Add the secrets

You need **one** way to pay for Claude (set only one of the two secrets), and
optionally a ClickUp token.
Run the `gh secret set` commands from the project folder. Each one asks you to
paste the value, so it doesn't stay in your shell history.

#### Option A: Claude subscription (for testing)

Needs a Claude Pro or Max plan.

1. In a terminal, run `claude setup-token`.
2. Log in with your Claude account in the browser window that opens.
3. Copy the token it prints (starts with `sk-ant-oat`).
4. Save it: `gh secret set CLAUDE_CODE_OAUTH_TOKEN`

> Using a personal account? Turn off "Help improve Claude" in Claude's privacy
> settings, so client code is not used for training.

#### Option B: Company API key (for the team)

1. Go to the Claude Console ([platform.claude.com](https://platform.claude.com)) and log in with the company account.
   No access? Ask whoever manages Anthropic billing at Four Kitchens.
2. Settings → API keys → Create key. Give it a name like `<project>-pr-review`.
3. Copy the key (starts with `sk-ant-api`). It's shown only once.
4. Optional: set a monthly spend limit for the workspace.
5. Save it: `gh secret set ANTHROPIC_API_KEY`

#### Optional: ClickUp token (to read the ticket's acceptance criteria)

1. In ClickUp, click your avatar → Settings → Apps.
2. Under "API Token", click Generate (or Copy if you already have one).
3. Copy the token (starts with `pk_`).
4. Save it: `gh secret set CLICKUP_API_TOKEN`

The token is personal: the bot sees in ClickUp what you see.

### 5. Create the label

`--force` updates the label if it already exists.

```bash
gh label create "claude review" --color 6f42c1 --description "Runs a Claude review of the PR" --force
```

### 6. (Optional) Tell other agents where the review lives

If the project has an `AGENTS.md` or `CLAUDE.md`, add one line so local agents
can find the review. If it has neither, skip this step; the bot works without it.

```markdown
- **PR review** — steps and checklists used by the `claude review` label → [`docs/agents/pr-review/README.md`](docs/agents/pr-review/README.md)
```

### 7. Test it

1. Commit, push and open a PR with these changes. To test ClickUp too, put a
   ticket id in its description.
2. Add the `claude review` label.
3. Watch the run in the Actions tab. A review takes about 3–6 minutes; then the
   PR gets a "Claude review" comment, and the label is removed.
4. Merge the PR. From then on, the label works on any PR.

Not working?

| What you see | Likely cause |
|---|---|
| No run in Actions | The label isn't exactly `claude review`, Actions is off, or the organization doesn't allow `anthropics/claude-code-action` (Settings → Actions → General). |
| The "Run Claude Code review" step fails | A missing or expired secret (step 4). |
| The run fails on a PR from a fork | Expected: GitHub doesn't give secrets to forks. |
| The review says "A.C. not found" | No ticket id in the PR description, no ClickUp token, or `TICKET_PATTERN` still says `<PREFIX>` (step 2). |
| The run succeeds but no comment appears | Usually, `docs/agents/pr-review/README.md` is missing on that branch. |

## Using it

1. Put the ticket id or its ClickUp link in the PR description.
2. Add the `claude review` label.
3. In a few minutes, read the summary comment and the comments on specific
   lines. Start with "Blocking".
4. Fixed something? Add the label again for a new review.

The bot helps the reviewer; a person still reviews and approves the PR.

## Writing the checklists

The workflow barely changes between projects. What makes a review useful is the
markdown: rules that only apply to **this** project.

### What a good checklist looks like

- **Short.** 6–10 items per file. A long list gets skimmed, by people and by the bot.
- **Project-specific.** "Write clean code" adds nothing; the bot already knows
  that. "Logic goes in the `bcj_*` module that owns the topic" does.
- **Checkable.** Each item is a yes/no question about the diff.
- **Bold name + one line.** `- **Cache metadata.** Entities loaded in preprocess add their cache tags.`
- **Link, don't copy.** If the project already has a longer doc, link it instead
  of repeating it.

### Step 1 (optional): Draft `review-pitfalls.md` from your PR history

A list of what reviewers on this project catch again and again. Optional, but
the most valuable file. Skip it for a new project with little PR history; the
bot works without it.

Open Claude Code in the project folder and paste:

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

### Step 2: Draft the three checklists

In Claude Code, in the project folder, paste:

```text
Fill in docs/agents/pr-review/frontend.md, backend.md and drupal.md from their
templates. Use what you learn from this repo's code (themes, custom modules,
config layout, tooling) and from docs/agents/review-pitfalls.md if it exists.

For each file: keep the generic items that apply, replace every <...>
placeholder, add project-specific items, and delete items that don't apply.
6–10 items per file, each a bold name plus one line. Then check that the paths
in the area table of docs/agents/pr-review/README.md match this repo.
```

### Step 3: Review it yourself

Claude drafts, a person decides. Read each file and:

- Delete anything generic or wrong.
- For each item, ask: "has this actually happened in this project?" If not, drop it.
- Remove the `<!-- Template ... -->` comment at the top of each file.

### Step 4: Keep it alive

When a review catches the same problem twice, add one line to
`docs/agents/review-pitfalls.md` with the PR number (create the file if the
project doesn't have one yet).

## Cost and privacy

- About $0.30–2.50 per review with an API key; included in the plan with a
  Claude subscription.
- The diff and the files the bot reads are sent to Anthropic. With a company
  API key, they aren't used for training.
- The bot can only read the repo and comment on the PR.

## Updating a project

Each project has its own copy, so changes here don't reach projects on their
own. When this repo improves, copy the new workflow over the old one (plain `cp`,
without `-n`), then set your ticket prefix again ([step 2](#2-set-your-ticket-prefix)):

```bash
git -C ~/dev/pr-review-kit pull
cp ~/dev/pr-review-kit/workflows/claude-review.yml .github/workflows/
```

Then commit it and open a PR. Don't overwrite the markdown files: they're the project's own.

## Stuck?

Open an issue in this repo.
