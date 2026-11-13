# Usage

## Running a review

1. Link the PR to its Productive task (see below).
2. Add the `claude review` label.
3. After a few minutes, read the summary comment and the inline comments,
   starting with "Blocker".
4. After pushing fixes, add the label again for a new review.

The bot supports the reviewer; a person still reviews and approves the PR.

## Linking the Productive task

The bot looks first for a task link in the PR description
(`https://app.productive.io/59815-four-kitchens/projects/<project id>/tasks/task/<task id>`).
Without one, it reads the branch name. Start any part of it with:

* the task ID, the long number at the end of the task's URL:
  `feature/21323404-login-fix`
* or the task code shown in Productive, in any case: `feature/PROJ-123-login-fix`

This is the same branch name
[productive-sync](https://github.com/fourkitchens/productive-sync) uses, so one
name works for both.

Some task codes belong to more than one task. When that happens the bot doesn't
guess: link the task in the PR description. The run's summary in Actions shows
which task the bot used.

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
