#!/bin/bash
jekyll build -d dist --config _config-deploy.yml
git add dist
git commit dist -m "Building site for gh-pages"
git subtree push --prefix dist origin gh-pages
