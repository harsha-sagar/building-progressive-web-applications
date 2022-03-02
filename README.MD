## manifest
- "display" can hold other values like "fullscreen", "minimal-ui", "browser"
- "orientation" can be "any", "protrait", "landscape", "portrait-primary"
- "related_applications" can be array of objects

## service worker
- service worker configuration is independent of manifest file. Manifest file tells more about having application icon on the home screen.
- service worker works only for https domain, localhost is exceptional.
