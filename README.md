threeVR
=======

####An orientation-aware Virtual Reality controller for [three.js](http://threejs.org) ####

threeVR is a virtual reality controller that makes it easy to build device-orientation aware applications on top of the three.js library.

threeVR listens for device orientation event changes and orients a three.js scene in the direction the user is facing. This library also provides manual user override controls so users can drag to look around a scene and pinch to zoom in on scene features. Once user interaction is complete, the threeVR library snaps the scene's camera back to the current device orientation position. threeVR also provides a set of custom event callbacks that web applications can use to build their own compelling user interfaces.

[Live Demo](http://richtr.github.io/threeVR/examples/vr_basic.html) | [Basic Usage](#basic-usage) | [API](#api) | [Reference Material](#reference-material) | [License](#license)

### Basic Usage ###

Add [three.js](https://github.com/mrdoob/three.js/) and [DeviceOrientationController.js](https://github.com/richtr/threeVR/blob/master/js/DeviceOrientationController.js) to your project:

    <script src="/lib/three.min.js"></script>
    <script src="/js/DeviceOrientationController.js"></script>

Create a new `DeviceOrientationController` object in JavaScript passing in your scene's `camera` (required) and the target `domElement` object (optional, defaults to  the `document` object).

Then call `connect()` to start the controller.

    <script>
      controls = new DeviceOrientationController( camera, renderer.domElement );
      controls.connect();
    </script>

### API ###

##### connect() #####

Start the controller and register all required deviceorientation and manual interaction override event listeners

Example:

    controls.connect(); // start listening for device orientation changes

##### disconnect() #####

Stop the controller and de-register all required deviceorientation and manual interaction override event listeners

Example:

    controls.disconnect(); // stop listening for device orientation changes

##### addEventListener(type, callback) #####

Register an event handler when events fire in the `DeviceOrientationController` object.

Available event types are:

* `compassneedscalibration` - when the system compass indicates that it needs calibration
* `orientationchange` - when the screen orientation changes (e.g. the user rotates their screen from portrait to landscape or vice-versa). The current screen orientation can subsequently be read from `controls.screenOrientation`.
- `userinteractionstart` - when the user starts manually overriding deviceorientation controls by interacting with the renderer DOM element.
- `userinteractionend` - when the user ends manually overriding deviceorientation controls by interacting with the renderer DOM element.
- `zoomstart` - when the user manually starts zooming the scene in the renderer DOM element.
- `zoomend` - when the user manually ends zooming the scene in the renderer DOM element.
- `rotatestart` - when the user manually starts rotating the scene in the renderer DOM element.
- `rotateend` - when the user manually ends rotating the scene in the renderer DOM element.

Example usage:

    controls.addEventListener('userinteractionstart', function() {
      controls.element.style.cursor = 'move';
    });

    controls.addEventListener('userinteractionend', function() {
      controls.element.style.cursor = 'normal';
    });

##### removeEventListener(type, callback) #####

De-register an event handler previously registered with `addEventListener(type, callback)`.

##### freeze #####

Prevent device orientation from updating the `camera` position.

Example:

    controls.freeze = true; // pause deviceorientation affecting camera rotation

##### enableManualDrag #####

Whether to allow the user to manually override the automatic deviceorientation controls by dragging the scene to rotate the camera manually.

The camera will automatically snap back to the deviceorientation when the user stops interacting with the scene.

Default is `true`.

Example:

    controls.enableManualDrag = false; // disable user manual scene drag-to-rotate override

##### enableManualZoom #####

Whether to allow the user to manually override the automatic deviceorientation controls by pinching the scene to zoom manually.

The camera will automatically snap back to the deviceorientation when the user stops interacting with the scene.

Default is `true`.

Example:

    controls.enableManualZoom = false; // disable user manual scene pinch-to-zoom override

##### useQuaternions #####

Whether to use quaternions to calculate the device orientation (`true`) or rotation matrices (`false`).

Default is `true`.

Example:

    controls.useQuaternions = false; // use rotation matrix math

### Reference Material ###

* Article: [Practical application and usage of the W3C Device Orientation API](http://dev.opera.com/articles/view/w3c-device-orientation-usage/)
* [W3C Spec](http://w3c.github.io/deviceorientation/spec-source-orientation.html)

### License ###

MIT. Copyright (c) Rich Tibbett
