<!--
  Template from fourkitchens/pr-review-kit.
  Keep the generic items that apply, fill in the <...> ones, add what your
  reviewers catch often, delete what doesn't apply. Then delete this comment.
-->

# Frontend checklist

Applies to `web/themes/custom/**`. <If the project has a frontend doc (theme
builds, design rules), link it here; otherwise delete this sentence.>

- **Right theme.** <Name the themes and what each is for, e.g. "`site` is the
  current theme, `legacy` is only for old pages.">
- **Built output.** <If built files are committed, say which ones need
  rebuilding after a source change. Delete this item if nothing is committed.>
- **Design fidelity.** Exact values from the design (px, spacing, type), every
  breakpoint handled, existing mixins and variables reused instead of new ones.
- **Empty markup guarded.** Wrappers, captions and image containers render only
  when they have content.
- **Accessibility.** Heading levels in order; elements styled as links are
  links; links wrapping text and image carry an `aria-label`; forms are
  keyboard-operable and announce errors.
- **Translatable strings.** New UI strings in Twig use `|t` / `{% trans %}`.
- **JS hygiene.** Behaviors use `once()`, no stray `console.log`, no globals
  leaking between components.
- **<Project-specific rule>.** <One line: what to check and why.>
