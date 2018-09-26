#!/bin/sh

echo "Merging ${TRAVIS_BRANCH} to develop"
git config --global user.email "travis@travis-ci.org"
git config --global user.name "Travis CI"
git config --global push.default current
# need to do it, bc Travis checks out a commit by hash
git fetch && git checkout develop && git merge ${TRAVIS_BRANCH} --no-edit
git push https://${GH_TOKEN}@github.com/stoplay/stoplay-ext.git