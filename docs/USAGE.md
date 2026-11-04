# Usage

## Running a review

1. Include the Productive task link in the PR description, or start the branch
   name with the task ID (`feature/<task id>-login-fix`).
2. Add the `claude review` label.
3. After a few minutes, read the summary comment and the inline comments,
   starting with "Blocking".
4. After pushing fixes, add the label again for a new review.

The bot supports the reviewer; a person still reviews and approves the PR.

## What the bot does

1. **Finds the ticket.** Takes the task ID from the first Productive task link
   in the PR description, or else from the branch name, and fetches the task and
   its to-dos from Productive (if configured; otherwise it uses the PR
   description).
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
