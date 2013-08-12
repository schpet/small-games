#!/bin/bash
jekyll build -d dist --config _config-deploy.yml
git add dist && git commit -m "building site for deploy"
git subtree push --prefix dist origin gh-pages
