#!/bin/sh

echo "git push"
git config --global user.email "travis@travis-ci.org"
git config --global user.name "Travis CI"
git config --global push.default current
# commit should be already created by grunt bumpup job
# git remote add origin-stoplay https://${GH_TOKEN}@github.com/stoplay/stoplay-ext.git > /dev/null 2>&1
git push https://${GH_TOKEN}@github.com/stoplay/stoplay-ext.git