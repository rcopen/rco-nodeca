### Generating logo.svg

```sh
svgo -i ./logo_rcopen_SVG.svg -o ../static/logo.svg -p 1
```

### Generating snippet.jpg

```sh
convert -resize 640x640 ./logo_rcopen_SVG.svg ../static/snippet.jpg
```

### Generating favicons

Use https://realfavicongenerator.net/ with the following options:

Favicon for iOS - Web Clip
 - [x] Add a solid, plain background to fill the transparent regions.

Favicon for Android Chrome
 - Main settings
   - [x] Add a solid, plain background to fill the transparent regions.
   - App name: RC Open
 - Options
   - [x] Browser. In this mode, when the user clicks the link, Android Chrome behaves as if the page was opened like any regular web site. 

Windows Metro
 - Use this color: #da532c
 - [x] Use the original favicon as is.

Safari Pinned Tab
 - [x] Turn your picture into a monochrom icon. Play with the threshold to get the best result.

Favicon Generator Options
 - Compression
   - [x] Very high quality, very low compression factor (Expected compression rate: 32%)
