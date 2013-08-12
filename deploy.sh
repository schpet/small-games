#!/bin/bash
jekyll build -d dist --config _config-deploy.yml
git subtree push --prefix dist origin gh-pages
