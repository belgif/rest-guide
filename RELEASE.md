# Releasing

Each push to GitHub triggers a new GitHub Actions build using the maven-ci workflow.

To release, simply create a tag:

```
git tag -a v1.0.0 -m "release v1.0.0"
git push origin v1.0.0
```

This triggers a new GitHub Actions build (maven-release workflow) using the tag as version number and creates a draft release with the release artifact attached.
On the releases GitHub page, you can edit the release notes, set the pre-release checkbox if applicable, and publish the release.

If the build fails because the staging repository is down, you can restart the build by re-tagging it:

```
git tag -d v1.0.0
git push --delete origin v1.0.0
git tag -a v1.0.0 -m "release v1.0.0" 
git push origin v1.0.0
```
