# Setup

Adds the review bot to a project. Most of the time goes into writing the
checklists (step 3).

## Requirements

* Admin access to the project's GitHub repo
* [GitHub CLI](https://cli.github.com/), logged in (`gh auth login`)
* [Claude Code](https://code.claude.com/docs), used to get the token (step 4) and to draft the checklists
* Claude Pro/Max subscription or Anthropic API key

## 1. Copy the files

```bash
gh repo clone fourkitchens/pr-review-kit ~/dev/pr-review-kit
cd ~/dev/<your-project>
git switch main && git pull
git switch -c add-pr-review
mkdir -p .github/workflows docs/agents/pr-review
cp -n ~/dev/pr-review-kit/workflows/claude-review.yml .github/workflows/
cp -n ~/dev/pr-review-kit/templates/*.md docs/agents/pr-review/
```

* Use the project's default branch if it isn't `main`.
* `cp -n` skips files that already exist, so a project's own checklists are never overwritten.
* If the kit is already cloned, run `git -C ~/dev/pr-review-kit pull` instead of `gh repo clone`.

## 2. Link each PR to its Productive task

The bot finds the task by its **task ID**, the long number at the end of the
task's URL. It looks in two places, in this order:

1. A task link in the **PR description**, e.g.
   `https://app.productive.io/59815-four-kitchens/projects/<project id>/tasks/task/<task id>`.
2. The **branch name**, when a segment starts with the task ID, e.g.
   `feature/<task id>-login-fix`.

The short number shown on the task (e.g. `#10017`) doesn't work: the Productive
API can't look a task up by it. If the project's PR template still asks for a
ClickUp link, change it to ask for the Productive task link.

## 3. Fill in the markdown files

Follow [Writing the checklists](CHECKLISTS.md). At minimum:

* In `docs/agents/pr-review/README.md`:
  * Replace `<Drupal>` with the project's stack.
  * Check that the paths in the area table match the repo.
  * In the preview URL, replace `<site>` with the Pantheon site name, or the whole
    URL if the project isn't on Pantheon. Leave `<N>` and `<path>`; the bot fills them.
* In `frontend.md`, `backend.md` and `drupal.md`, replace or delete every `<...>`.
  The bot reads whatever is left.

## 4. Add the secrets

Set **one** of the two Claude secrets, and optionally the Productive token. Run the
`gh secret set` commands from the project folder; each one prompts for the value,
so it doesn't stay in the shell history.

### Option A: Claude subscription (testing)

Requires a Claude Pro or Max plan.

1. Run `claude setup-token`.
2. Log in with the Claude account in the browser window that opens.
3. Copy the printed token (starts with `sk-ant-oat`).
4. `gh secret set CLAUDE_CODE_OAUTH_TOKEN`

With a personal account, turn off "Help improve Claude" in Claude's privacy
settings so client code is not used for training.

### Option B: Company API key (team use)

1. Log in to the [Claude Console](https://platform.claude.com) with the company account.
2. Settings → API keys → Create key, named e.g. `<project>-pr-review`.
3. Copy the key (starts with `sk-ant-api`). It is shown only once.
4. Optional: set a monthly spend limit for the workspace.
5. `gh secret set ANTHROPIC_API_KEY`

### Productive token (optional)

Lets the bot read the task's acceptance criteria.

If the repo or the GitHub organization already has a `PRODUCTIVE_API_TOKEN`
secret for the Productive task sync workflow, the bot uses it and there is nothing to
add. Otherwise:

1. In Productive: Settings → API integrations → Generate new token. The bot
   only reads, so read-only access is enough.
2. Copy the token.
3. `gh secret set PRODUCTIVE_API_TOKEN`

The token is personal: the bot sees in Productive what its owner sees.

The bot uses the Four Kitchens organization (`59815`) unless a
`PRODUCTIVE_ORG_ID` secret is set, so the secret the task sync workflow uses
also works here.

## 5. Create the label

```bash
gh label create "claude review" --color 6f42c1 --description "Runs a Claude review of the PR" --force
```

`--force` updates the label if it already exists.

## 6. Link the review from AGENTS.md (optional)

If the project has an `AGENTS.md` or `CLAUDE.md`, add this line so local agents
can find the review. The bot works without it.

```markdown
- **PR review** — steps and checklists used by the `claude review` label → [`docs/agents/pr-review/README.md`](docs/agents/pr-review/README.md)
```

## 7. Test

1. Commit, push and open a PR with these changes. To test Productive, add a task
   link to its description.
2. Add the `claude review` label.
3. Watch the run in the Actions tab. A review takes about 3–6 minutes; then the
   PR gets a "Claude review" comment and the label is removed.
4. Merge the PR. From then on, the label works on any PR.

## Troubleshooting

| Symptom | Likely cause |
| --- | --- |
| No run in Actions | The label isn't exactly `claude review`, Actions is off, or the organization doesn't allow `anthropics/claude-code-action` (Settings → Actions → General). |
| The "Run Claude Code review" step fails | A missing or expired secret (step 4). |
| The run fails on a PR from a fork | Expected: GitHub doesn't expose secrets to forks. |
| The review says "A.C. not found" | No Productive task link in the PR description or task ID in the branch name (step 2), or no Productive token (step 4). The "Fetch Productive task" step log says which. |
| The run succeeds but no comment appears | Usually, `docs/agents/pr-review/README.md` is missing on that branch. |

## Updating a project

Each project keeps its own copy, so changes in this kit don't reach projects
automatically. To update the workflow, overwrite it (plain `cp`, without `-n`),
then commit it in a PR:

```bash
git -C ~/dev/pr-review-kit pull
cp ~/dev/pr-review-kit/workflows/claude-review.yml .github/workflows/
```

Projects that used ClickUp also need the `PRODUCTIVE_API_TOKEN` secret (step 4),
and can delete the old one with `gh secret delete CLICKUP_API_TOKEN`. In their
`docs/agents/pr-review/README.md`, replace the ClickUp line in the A.C. list
under "1. Gather" with the Productive one from
[`templates/README.md`](../templates/README.md): it tells the bot which to-dos
count as criteria.

Don't overwrite the markdown files; they belong to the project.
