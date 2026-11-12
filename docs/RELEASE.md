# Release

Pick the version from what projects must do to take the change:

* **Patch** (`v1.0.1`): a fix. Projects do nothing.
* **Minor** (`v1.1.0`): a new feature. Projects do nothing.
* **Major** (`v2.0.0`): projects must change their workflow or rule files.
  Start a `v2` tag and update `@v1` and `^1` in the templates and docs.

After merging to `main`, create the release and move `v1` to it:

```bash
git switch main && git pull
gh release create v1.1.0 --target main --generate-notes
git fetch --tags
git tag -f v1 'v1.1.0^{commit}'
git push -f origin v1
```

A tag ruleset (Settings → Rules → Rulesets) protects `v*` tags from being
moved or deleted, so only repo admins can move `v1`.

Composer reads `v1` as version `1.0.0`, so `composer show` lists `v1` in place
of `v1.0.0`. `^1` still installs the latest release.
