NPM_PACKAGE := $(shell node -e 'process.stdout.write(require("./package.json").name)')
NPM_VERSION := $(shell node -e 'process.stdout.write(require("./package.json").version)')

TMP_PATH    := /tmp/${NPM_PACKAGE}-$(shell date +%s)

REMOTE_NAME ?= origin
REMOTE_REPO ?= $(shell git config --get remote.${REMOTE_NAME}.url)

GITHUB_PROJ := nodeca/${NPM_PACKAGE}


help:
	echo "make help       - Print this help"
	echo "make lint       - Lint sources with JSHint"
	echo "make test       - Lint sources and run all tests"
	echo "make publish    - Set new version tag and publish npm package"
	echo "make todo       - Find and list all TODOs"


lint:
	cd ../.. && NODECA_APP_PATH=./node_modules/${NPM_PACKAGE} $(MAKE) lint


test: lint
	cd ../.. && NODECA_APP=${NPM_PACKAGE} $(MAKE) test

icons:
	rm -f ./client/common/rcd_logo/logo.svg
	cp ./src/rcopen_logo-circle.svg ./client/common/rcd_logo/logo.svg
	sed -i 's/#4a7fb5/#e0e0e0/g' ./client/common/rcd_logo/logo.svg

	convert -resize 640x640 -border 40x40 -bordercolor White ./src/rcopen_logo-circle.svg ./static/snippet.jpg
	./node_modules/.bin/gulp generate-favicon
	> ./static/headers.html
	./node_modules/.bin/gulp inject-favicon-markups
	rm -f ./faviconData.json


todo:
	grep 'TODO' -n -r --exclude-dir=assets --exclude-dir=\.git --exclude=Makefile . 2>/dev/null || test true


.PHONY: icons lint test todo
.SILENT: help todo