# Releasing

When preparing a release, first make sure that the changelog (changelog.adoc) and the update-date (in index.adoc) are updated.

Each push to GitHub triggers a new GitHub Actions build using the maven-ci workflow.

To release, simply create a tag:

```
git tag -a v2023.06 -m "release v2023.06"
git push origin v2023.06
```

This triggers a new GitHub Actions build (maven-release workflow) using the tag as version number and creates a draft release with the release artifact attached.
On the releases GitHub page, you can edit the release notes, set the pre-release checkbox if applicable, and publish the release.

If you detected a problem and want to recreate the release, you can remove the draft release and create a new build by re-tagging it:

```
git tag -d v2023.06
git push --delete origin v20023.06
git tag -a v1.0.0 -m "release v2023.06" 
git push origin v2023.06
```
