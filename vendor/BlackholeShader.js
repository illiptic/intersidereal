/**
 * Based on Darryl Huffman's code:
 * https://codepen.io/darrylhuffman/pen/gRZrpv
 */
import * as THREE from 'three'

export default /* BlackholeShader */{

	uniforms: {
		"tDiffuse": { value: null },
		"opacity":  { value: 1.0 },
		"u_resolution": new THREE.Uniform(new THREE.Vector2(window.innerWidth, window.innerHeight)),
		"u_mouse": new THREE.Uniform(new THREE.Vector2(window.innerWidth/2, window.innerHeight/2)),
		"u_mass": { value: 0.002 },
		"u_time": { value: 0.0 },
		"u_clickedTime": { value: 0.0 }
	},

	vertexShader: [
		"varying vec2 vUv;",
		"void main() {",
			"vUv = uv;",
			"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",
		"}"
	].join( "\n" ),

	fragmentShader: [
		'#ifdef GL_ES',
		'precision mediump float;',
		'#endif',

		'#define PI 3.14159265359',

		'uniform sampler2D tDiffuse;',
		'varying vec2 vUv;',

		'uniform vec2 u_resolution;',
		'uniform vec2 u_mouse;',
		'uniform float u_mass;',
		'uniform float u_time;',
		'uniform float u_clickedTime;',

		'vec2 rotate(vec2 mt, vec2 st, float angle){',
			'float cos = cos((angle + u_clickedTime) * 1.0); // try replacing * 1.0 with * PI',
			'float sin = sin(angle * 0.0); // try removing the * 0.0',
			'// there are so many different cool effects that can be achieved by just messing with the cos and sin',

			'// Uncomment these two lines for realism',
			'//float cos = cos(angle) * (u_time * 0.3);',
			'//float sin = sin(angle) * (u_time * 0.3);',

			'float nx = (cos * (st.x - mt.x)) + (sin * (st.y - mt.y)) + mt.x;',
			'float ny = (cos * (st.y - mt.y)) - (sin * (st.x - mt.x)) + mt.y;',
			'return vec2(nx, ny);',
		'}',

		'void main() {',
		  'vec2 st = gl_FragCoord.xy/u_resolution;',
			'vec2 mt = u_mouse.xy/u_resolution;',

			'float dx = st.x - mt.x;',
			'float dy = st.y - mt.y;',

			'float dist = sqrt(dx * dx + dy * dy);',
			'float pull = u_mass / (dist * dist);',

		  'vec3 color = vec3(0.0);',
			'vec2 r = rotate(mt,st,pull);',
			'vec4 imgcolor = texture2D(tDiffuse, r);',
			'color = vec3(',
				'(imgcolor.x - (pull * 0.25)),',
				'(imgcolor.y - (pull * 0.25)), ',
				'(imgcolor.z - (pull * 0.25))',
			');',


		  'gl_FragColor = vec4(color,1.);',
		'}'
	].join( "\n" )

};
