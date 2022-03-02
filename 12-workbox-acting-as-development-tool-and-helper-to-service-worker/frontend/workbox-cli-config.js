module.exports = {
  "globDirectory": "public/",
  "globPatterns": [
    "**/*.{ico,html,json,css,js}",
		"src/images/*.{jpg,png}"
  ],
  "swSrc": "public/sw-base.js",
  "swDest": "public/serviceWorker.js",
  "globIgnores": [
    "../workbox-cli-config.js",
		"help/**"
  ]
};
