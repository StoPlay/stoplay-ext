#!/bin/sh

echo "git push"
git config --global user.email "travis@travis-ci.org"
git config --global user.name "Travis CI"
git config --global push.default current
# at this point grunt bumpup should have completed,
# incrementing package and manifest files
git stash
# need to do it, bc Travis checks out a commit by hash
git checkout ${TRAVIS_BRANCH}
# apply our version changes
git stash pop
# commit and tag with proper text
grunt release
# using env var GH_TOKEN
git push https://${GH_TOKEN}@github.com/stoplay/stoplay-ext.git