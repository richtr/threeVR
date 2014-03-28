/**
 * @author richt / http://richt.me
 *
 * W3C Device Orientation control (http://www.w3.org/TR/orientation-event/)
 * with manual user drag override handling
 */

var DeviceOrientationController = function(object) {

  this.object = object;

  this.freeze = true;

  this.useQuaternions = true; // use quaternions by default

  this.deviceOrientation = {};
  this.screenOrientation = 0;

  var isUserInteracting = false,
      onPointerDownPointerX = 0, onPointerDownPointerY = 0,
      lon = 0, lat = 0,
      scrollSpeedX, scrollSpeedY,
      tmpQuat = new THREE.Quaternion();

  this.onDeviceOrientationChangeEvent = function(rawEvtData) {
    this.deviceOrientation = rawEvtData;
  };

  this.onScreenOrientationChangeEvent = function() {
    this.screenOrientation = window.orientation || 0;
  };

  this.onDocumentMouseDown = function(event) {
    event.preventDefault();

    tmpQuat.copy(this.object.quaternion);

    isUserInteracting = true;

    onPointerDownPointerX = event.clientX;
    onPointerDownPointerY = event.clientY;

    lon = 0;
    lat = 0;

    // Set consistent scroll speed based on current viewport width/height
    scrollSpeedX = (1200 / window.innerWidth) * 0.1;
    scrollSpeedY = (800 / window.innerHeight) * 0.1;
  };

  this.onDocumentMouseMove = function(event) {
    if (isUserInteracting === true) {
      lon = (onPointerDownPointerX - event.clientX) * scrollSpeedX;
      lat = (onPointerDownPointerY - event.clientY) * scrollSpeedY;
    }
  };

  this.onDocumentMouseUp = function(event) {
    isUserInteracting = false;
  };

  this.onDocumentTouchStart = function(event) {
    if (event.touches.length == 1) {
      event.preventDefault();

      tmpQuat.copy(this.object.quaternion);

      isUserInteracting = true;

      onPointerDownPointerX = event.touches[0].pageX;
      onPointerDownPointerY = event.touches[0].pageY;

      lon = 0;
      lat = 0;

      // Set consistent scroll speed based on current viewport width/height
      scrollSpeedX = (1200 / window.innerWidth) * 0.1;
      scrollSpeedY = (800 / window.innerHeight) * 0.1;
    }
  };

  this.onDocumentTouchMove = function(event) {
    if (isUserInteracting === true && event.touches.length > 0) {
      lon = (onPointerDownPointerX - event.touches[0].pageX) * scrollSpeedX;
      lat = (onPointerDownPointerY - event.touches[0].pageY) * scrollSpeedY;
    }
  };

  this.onDocumentTouchEnd = function(event) {
    isUserInteracting = false;
  };

  var createQuaternion = function() {

    var finalQuaternion = new THREE.Quaternion();

    var euler = new THREE.Euler();

    var screenTransform = new THREE.Quaternion();

    var worldTransform = new THREE.Quaternion(-Math.sqrt(0.5), 0, 0, Math.sqrt(0.5)); // - PI/2 around the x-axis

    var minusHalfAngle = 0;

    return function(alpha, beta, gamma, screenOrientation) {

      euler.set(beta, alpha, -gamma, 'YXZ');

      finalQuaternion.setFromEuler(euler);

      minusHalfAngle = -screenOrientation / 2;

      screenTransform.set(0, 0, Math.sin(minusHalfAngle), Math.cos(minusHalfAngle));

      if(alpha !== 0) {
        finalQuaternion.multiply(worldTransform);
      }

      finalQuaternion.multiply(screenTransform);

      return finalQuaternion;

    }

  }();

  var createRotationMatrix = function() {

    var finalMatrix = new THREE.Matrix4();

    var deviceEuler = new THREE.Euler();
    var screenEuler = new THREE.Euler();
    var worldEuler = new THREE.Euler(-Math.PI / 2, 0, 0, 'YXZ'); // - PI/2 around the x-axis

    var screenTransform = new THREE.Matrix4();

    var worldTransform = new THREE.Matrix4();
    worldTransform.makeRotationFromEuler(worldEuler);

    return function(alpha, beta, gamma, screenOrientation) {

      deviceEuler.set(beta, alpha, -gamma, 'YXZ');

      finalMatrix.identity();

      finalMatrix.makeRotationFromEuler(deviceEuler);

      screenEuler.set(0, -screenOrientation, 0, 'YXZ');

      screenTransform.identity();

      screenTransform.makeRotationFromEuler(screenEuler);

      finalMatrix.multiply(screenTransform);

      if(alpha !== 0) {
        finalMatrix.multiply(worldTransform);
      }

      return finalMatrix;

    }

  }();

  this.updateManualMove = function() {

    var rotation = new THREE.Euler(0, 0, 0, "YXZ");

    var rotQuat = new THREE.Quaternion();
    var objQuat = new THREE.Quaternion();

    return function() {

      rotation.set(
        THREE.Math.degToRad(lat),
        THREE.Math.degToRad(lon),
        0
      );

      rotQuat.setFromEuler(rotation);

      objQuat.multiplyQuaternions(tmpQuat, rotQuat);

      //this.object.quaternion.slerp( objQuat, 0.07 ); // smoothing
      this.object.quaternion.copy( objQuat ); // no smoothing

    };

  }();

  this.updateDeviceMove = function() {

    var alpha, beta, gamma, orient;

    var objQuat; // when we use quaternions

    var objMatrix; // when we use rotation matrixes

    return function() {

      if (this.freeze) return;

      alpha  = THREE.Math.degToRad(this.deviceOrientation.alpha || 0); // Z
      beta   = THREE.Math.degToRad(this.deviceOrientation.beta  || 0); // X'
      gamma  = THREE.Math.degToRad(this.deviceOrientation.gamma || 0); // Y''
      orient = THREE.Math.degToRad(this.screenOrientation       || 0); // O

      if (this.useQuaternions) {

        objQuat = createQuaternion(alpha, beta, gamma, orient);

        //this.object.quaternion.slerp( objQuat, 0.07 ); // smoothing
        this.object.quaternion.copy( objQuat ); // no smoothing

      } else {

        objMatrix = createRotationMatrix(alpha, beta, gamma, orient);

        this.object.quaternion.setFromRotationMatrix(objMatrix);

      }

    };

  }();

  this.update = function() {
    if (isUserInteracting) {
      this.updateManualMove();
    } else {
      this.updateDeviceMove();
    }
  };

  function bind(scope, fn) {
    return function() {
      fn.apply(scope, arguments);
    };
  };

  this.connect = function() {
    this.onScreenOrientationChangeEvent(); // run once on load

    window.addEventListener('orientationchange', bind(this, this.onScreenOrientationChangeEvent), false);
    window.addEventListener('deviceorientation', bind(this, this.onDeviceOrientationChangeEvent), false);

    document.addEventListener('mousedown', bind(this, this.onDocumentMouseDown), false);
    document.addEventListener('mousemove', bind(this, this.onDocumentMouseMove), false);
    document.addEventListener('mouseup', bind(this, this.onDocumentMouseUp), false);

    document.addEventListener('touchstart', bind(this, this.onDocumentTouchStart), false);
    document.addEventListener('touchmove', bind(this, this.onDocumentTouchMove), false);
    document.addEventListener('touchend', bind(this, this.onDocumentTouchEnd), false);

    this.freeze = false;
  };

  this.disconnect = function() {
    this.freeze = true;

    window.removeEventListener('orientationchange', bind(this, this.onScreenOrientationChangeEvent), false);
    window.removeEventListener('deviceorientation', bind(this, this.onDeviceOrientationChangeEvent), false);

    document.removeEventListener('mousedown', bind(this, this.onDocumentMouseDown), false);
    document.removeEventListener('mousemove', bind(this, this.onDocumentMouseMove), false);
    document.removeEventListener('mouseup', bind(this, this.onDocumentMouseUp), false);

    document.removeEventListener('touchstart', bind(this, this.onDocumentTouchStart), false);
    document.removeEventListener('touchmove', bind(this, this.onDocumentTouchMove), false);
    document.removeEventListener('touchend', bind(this, this.onDocumentTouchEnd), false);
  };

};
