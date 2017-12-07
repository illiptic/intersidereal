/*
 * based on code by James Baicoianu / http://www.baicoianu.com/
 */
import {Quaternion, Vector2, Vector3, Spherical, Math as THREEMath} from 'three'

export default function FlyControls ( object, camera, domElement ) {

	this.object = object;
	this.camera = camera

	this.domElement = ( domElement !== undefined ) ? domElement : document;
	if ( domElement ) this.domElement.setAttribute( 'tabindex', - 1 );

	// API

	this.movementSpeed = 1.0;
	this.rollSpeed = 0.005;

	this.autoForward = false;

	this.dampeningFactor = 0.9

	// disable default target object behavior

	// internals

	this.tmpQuaternion = new Quaternion();

	this.mouseStatus = 0;

  this.lookState = {x: 0, y: 0}
	this.lookVector = new Vector3( 0, 0, 0 );
	this.lookAngle = new Vector2(0, Math.PI/2)

	this.moveState = { up: 0, down: 0, left: 0, right: 0, forward: 0, back: 0, pitchUp: 0, pitchDown: 0, yawLeft: 0, yawRight: 0, rollLeft: 0, rollRight: 0, dampening: 0 };
	this.thrustVector = new Vector3( 0, 0, 0 );
	this.velocityVector = new Vector3( 0, 0, 0 );
	this.rotationVector = new Vector3( 0, 0, 0 );
	this.movementSpeedMultiplier = 1

	this.handleEvent = function ( event ) {

		if ( typeof this[ event.type ] == 'function' ) {

			this[ event.type ]( event );

		}

	};

	this.keydown = function( event ) {

		if ( event.altKey ) {

			return;

		}

		//event.preventDefault();

		switch ( event.keyCode ) {

			case 16: /* shift */ this.movementSpeedMultiplier = 100; break;

			case 87: /*W*/ this.moveState.forward = 1; break;
			case 83: /*S*/ this.moveState.back = 1; break;

			case 65: /*A*/ this.moveState.left = 1; break;
			case 68: /*D*/ this.moveState.right = 1; break;

			case 82: /*R*/ this.moveState.up = 1; break;
			case 70: /*F*/ this.moveState.down = 1; break;

			case 38: /*up*/ this.moveState.pitchUp = 1; break;
			case 40: /*down*/ this.moveState.pitchDown = 1; break;

			case 37: /*left*/ this.moveState.yawLeft = 1; break;
			case 39: /*right*/ this.moveState.yawRight = 1; break;

			case 81: /*Q*/ this.moveState.rollLeft = 1; break;
			case 69: /*E*/ this.moveState.rollRight = 1; break;

			case 32: /* space */ this.moveState.dampening = 1; break;
		}

		this.updateMovementVector();
		this.updateRotationVector();

	};

	this.keyup = function( event ) {

		switch ( event.keyCode ) {

			case 16: /* shift */ this.movementSpeedMultiplier = 1; break;

			case 87: /*W*/ this.moveState.forward = 0; break;
			case 83: /*S*/ this.moveState.back = 0; break;

			case 65: /*A*/ this.moveState.left = 0; break;
			case 68: /*D*/ this.moveState.right = 0; break;

			case 82: /*R*/ this.moveState.up = 0; break;
			case 70: /*F*/ this.moveState.down = 0; break;

			case 38: /*up*/ this.moveState.pitchUp = 0; break;
			case 40: /*down*/ this.moveState.pitchDown = 0; break;

			case 37: /*left*/ this.moveState.yawLeft = 0; break;
			case 39: /*right*/ this.moveState.yawRight = 0; break;

			case 81: /*Q*/ this.moveState.rollLeft = 0; break;
			case 69: /*E*/ this.moveState.rollRight = 0; break;

			case 32: /* space */ this.moveState.dampening = 0; break;
		}

		this.updateMovementVector();
		this.updateRotationVector();

	};

	this.mousedown = function( event ) {
		if ( this.domElement !== document ) {
			this.domElement.focus();
		}

		event.preventDefault();
		event.stopPropagation();

		switch ( event.button ) {
			case 0: this.mouseStatus = 1; break;
			case 2: this.mouseStatus = 2; break;
		}
	};

	this.mousemove = function( event ) {

		if ( this.mouseStatus  === 2 ) {

			var container = this.getContainerDimensions();
			var halfWidth  = container.size[ 0 ] / 2;
			var halfHeight = container.size[ 1 ] / 2;

			this.moveState.yawLeft   = - ( ( event.pageX - container.offset[ 0 ] ) - halfWidth  ) / halfWidth * 2;
			this.moveState.pitchDown =   ( ( event.pageY - container.offset[ 1 ] ) - halfHeight ) / halfHeight * 2;

			this.updateRotationVector();

		} else if (this.mouseStatus === 1) {
			var container = this.getContainerDimensions();
			var halfWidth  = container.size[ 0 ] / 2;
			var halfHeight = container.size[ 1 ] / 2;

			this.lookState.x = - ( ( event.pageX - container.offset[ 0 ] ) - halfWidth  ) / halfWidth * 2;
			this.lookState.y =   ( ( event.pageY - container.offset[ 1 ] ) - halfHeight ) / halfHeight * 2;

			this.updateLookVector()
		}

	};

	this.mouseup = function( event ) {

		event.preventDefault();
		event.stopPropagation();

		switch ( event.button ) {

			case 0: {
				this.mouseStatus = 0;
				this.lookState.x = this.lookState.y = 0;
				break;
			}
			case 2: {
				this.mouseStatus = 0;
				this.moveState.yawLeft = this.moveState.pitchDown = 0;
				break;
			}

		}
		this.updateLookVector()
		this.updateRotationVector();

	};

	this.update = function( delta ) {
		var moveMult = delta * this.movementSpeed * this.movementSpeedMultiplier;
		var rotMult = delta * this.rollSpeed;

		this.tmpQuaternion.set( this.rotationVector.x * rotMult, this.rotationVector.y * rotMult, this.rotationVector.z * rotMult, 1 ).normalize();
		this.object.quaternion.multiply( this.tmpQuaternion );

		// expose the rotation vector for convenience
		this.object.rotation.setFromQuaternion( this.object.quaternion, this.object.rotation.order );

		// translate in world space (inertia is independent from facing)
		let m = this.thrustVector.clone().transformDirection(this.object.matrix).multiplyScalar(this.thrustVector.length() * moveMult)
		this.velocityVector.add(m)
		if (this.moveState.dampening) {
			let thrust = new Vector3().setScalar(this.dampeningFactor)
			this.velocityVector.multiply(thrust).roundToZero()
		}
		this.object.position.add(this.velocityVector)

		// look around
		let cam = this.camera
		this.lookAngle.x -= this.lookVector.x * rotMult
		this.lookAngle.y += this.lookVector.y * rotMult
		this.lookAngle.y = THREEMath.clamp(this.lookAngle.y, Math.PI / 4, 3*Math.PI/4)
		let spherical = new Spherical(50, this.lookAngle.y, this.lookAngle.x)
		cam.position.setFromSpherical(spherical)
		cam.rotation.set(this.lookAngle.y - Math.PI / 2, this.lookAngle.x, 0, 'YXZ')
	};

	this.updateMovementVector = function() {

		var forward = ( this.moveState.forward || ( this.autoForward && ! this.moveState.back ) ) ? 1 : 0;

		this.thrustVector.x = ( - this.moveState.left    + this.moveState.right );
		this.thrustVector.y = ( - this.moveState.down    + this.moveState.up );
		this.thrustVector.z = ( - forward                + this.moveState.back );

		// console.log( 'move:', [ this.thrustVector.x, this.thrustVector.y, this.thrustVector.z ] );
	};

	this.updateRotationVector = function() {

		this.rotationVector.x = ( - this.moveState.pitchDown + this.moveState.pitchUp );
		this.rotationVector.y = ( - this.moveState.yawRight  + this.moveState.yawLeft );
		this.rotationVector.z = ( - this.moveState.rollRight + this.moveState.rollLeft );

		//console.log( 'rotate:', [ this.rotationVector.x, this.rotationVector.y, this.rotationVector.z ] );

	};

	this.updateLookVector = function () {
		this.lookVector.x = - this.lookState.x
		this.lookVector.y = this.lookState.y
	}

	this.getContainerDimensions = function() {

		if ( this.domElement != document ) {

			return {
				size	: [ this.domElement.offsetWidth, this.domElement.offsetHeight ],
				offset	: [ this.domElement.offsetLeft,  this.domElement.offsetTop ]
			};

		} else {

			return {
				size	: [ window.innerWidth, window.innerHeight ],
				offset	: [ 0, 0 ]
			};

		}

	};

	function bind( scope, fn ) {

		return function () {

			fn.apply( scope, arguments );

		};

	}

	function contextmenu( event ) {

		event.preventDefault();

	}

	this.dispose = function() {

		this.domElement.removeEventListener( 'contextmenu', contextmenu, false );
		this.domElement.removeEventListener( 'mousedown', _mousedown, false );
		this.domElement.removeEventListener( 'mousemove', _mousemove, false );
		this.domElement.removeEventListener( 'mouseup', _mouseup, false );

		window.removeEventListener( 'keydown', _keydown, false );
		window.removeEventListener( 'keyup', _keyup, false );

	};

	var _mousemove = bind( this, this.mousemove );
	var _mousedown = bind( this, this.mousedown );
	var _mouseup = bind( this, this.mouseup );
	var _keydown = bind( this, this.keydown );
	var _keyup = bind( this, this.keyup );

	this.domElement.addEventListener( 'contextmenu', contextmenu, false );

	this.domElement.addEventListener( 'mousemove', _mousemove, false );
	this.domElement.addEventListener( 'mousedown', _mousedown, false );
	this.domElement.addEventListener( 'mouseup',   _mouseup, false );

	window.addEventListener( 'keydown', _keydown, false );
	window.addEventListener( 'keyup',   _keyup, false );

	this.updateMovementVector();
	this.updateRotationVector();
	this.updateLookVector();
};
