#!/bin/sh

git config --global user.email "travis@travis-ci.org"
git config --global user.name "Travis CI"
git config --global push.default current
# commit should be already created by grunt bumpup job
git push