icons:
	rm -f ./client/common/rco_logo/logo.svg
	cp ./src/rcopen_logo-circle.svg ./client/common/rco_logo/logo.svg
	sed -i 's/#4a7fb5/#ffffff/g' ./client/common/rco_logo/logo.svg

	convert -resize 640x640 -border 40x40 -bordercolor White ./src/rcopen_logo-circle.svg ./static/snippet.jpg
	../../../node_modules/.bin/gulp generate-favicon
	> ./static/headers.html
	../../../node_modules/.bin/gulp inject-favicon-markups
	rm -f ./faviconData.json

.PHONY: icons
