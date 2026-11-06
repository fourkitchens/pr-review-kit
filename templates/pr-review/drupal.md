<!--
  Template from fourkitchens/pr-review-kit.
  Keep the generic items that apply, fill in the <...> ones, add what your
  reviewers catch often, delete what doesn't apply. Then delete this comment.
  Not a Drupal project? Rename this file to match your platform, or delete it
  and its row and mentions in pr-review/README.md.
-->

# Drupal checklist

Applies to exported config (`config/**`), install/update/deploy hooks, module
`*.yml`, and patches.

- **Config is complete.** Every UI change the PR describes has its exported
  YAML, and the YAML has no unrelated changes (stray `uuid`, `_core`, or config
  from another feature riding along).
- **Config split.** <Dev-only modules and settings live in `<config/dev>`, not
  `config/sync/`. Delete if the project has no split.>
- **Hook placement.** Data fixes that depend on imported config run in a
  post-deploy hook (`*.deploy.php`); update hooks run before config import.
  Changed config defaults that must apply to existing content come with a hook
  or a documented manual step.
- **Module removal.** A module is uninstalled in one deploy and removed from
  `composer.json` in a later one; both in the same PR is blocking.
- **Permissions and roles.** Permission changes are intentional and minimal;
  nothing grants admin-level permissions without the ticket asking.
- **Deploy notes.** Anything the deploy needs beyond `drush deploy` (string
  imports, manual steps) is written in the PR description.
- **<Project-specific rule>.** <One line: what to check and why, e.g.
  multilingual rules or a sibling site that needs the same change.>
