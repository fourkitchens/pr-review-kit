# Usage

## Running a review

1. Link the PR to its Productive task (see below).
2. Add the `claude review` label.
3. After a few minutes, read the summary comment and the inline comments,
   starting with "Blocking".
4. After pushing fixes, add the label again for a new review.

The bot supports the reviewer; a person still reviews and approves the PR.

## Linking the Productive task

The bot finds the task by its task ID, the long number at the end of the task's
URL. It looks first for a task link in the PR description
(`https://app.productive.io/59815-four-kitchens/projects/<project id>/tasks/task/<task id>`),
then for a branch name that starts with the task ID (`feature/<task id>-login-fix`).

The short task number (e.g. `#10017`) doesn't work: Productive can't look a
task up by it.

## Keeping the rules current

When a review catches the same problem twice, add one line to
`docs/agents/review-pitfalls.md` with the PR number (create the file if needed).
The rules in `docs/agents/pr-review/` belong to the project; change them as the
project changes.

## What the bot does

1. **Reads the task.** Fetches the linked Productive task and its to-dos. Without
   a task or a Productive token, it uses the PR description.
2. **Reads the PR.** Description and diff, plus the project's `AGENTS.md` and
   `docs/agents/review-pitfalls.md` if present.
3. **Sorts the files** into frontend, backend and Drupal, and applies each
   area's checklist.
4. **Checks the acceptance criteria** one by one: met, partial, not met, or
   needs a manual check on the preview site.
5. **Flags scope drift**: changes the ticket didn't ask for.
6. **Comments on the PR**: inline notes plus one summary.
7. **Removes the label**, so it can be added again.

## Cost and privacy

* About $0.30–2.50 per review with an API key; included in the plan with a
  Claude subscription.
* The diff and the files the bot reads are sent to Anthropic. With a company
  API key, they aren't used for training.
* The bot can only read the repo and comment on the PR.
