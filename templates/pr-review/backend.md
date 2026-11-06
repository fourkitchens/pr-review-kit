<!--
  Template from fourkitchens/pr-review-kit.
  Keep the generic items that apply, fill in the <...> ones, add what your
  reviewers catch often, delete what doesn't apply. Then delete this comment.
-->

# Backend checklist

Applies to custom PHP (`web/modules/custom/**`, theme `.theme` files) and
`composer.json`. <If the project has a doc about its modules, link it here;
otherwise delete this sentence.>

- **Right module.** The logic sits in the <`prefix_*`> module that owns the
  topic, extending it rather than duplicating logic or adding a new module.
- **Root cause.** The fix addresses the cause, and prefers the broader hook when
  one exists over patching one render path.
- **Drupal APIs.** Services injected and registered in `services.yml` (no
  `\Drupal::` in classes that support injection); form alters target the
  specific form hook.
- **Cache metadata.** Entities loaded in preprocess or render code add their
  cache tags/contexts to the render array.
- **Security.** Output escaped (no raw `#markup` with user input, `|raw` only on
  trusted strings); queries use placeholders or the entity query API; routes
  and forms check access; no secrets committed.
- **Standards.** New code passes <phpcs / phpstan level N>. Flag only new
  violations.
- **Translatable strings.** User-facing strings use `t()` / `$this->t()` with
  placeholders, never concatenation.
- **Cleanup.** No debug logging, `dpm()`, `var_dump()`, or commented-out code.
- **Composer.** Contrib/core bugs are fixed with a patch pointing at the
  upstream issue; `composer.lock` is updated alongside.
- **<Project-specific rule>.** <One line: what to check and why.>
