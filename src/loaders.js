import _ from 'lodash'
import * as THREE from 'three'
const basePath = '/assets/'

window.THREE = THREE
require("three/examples/js/loaders/OBJLoader2")

const textureLoader = new THREE.TextureLoader().setPath(basePath)
const cubeTextureLoader = new THREE.CubeTextureLoader().setPath(basePath)
const objLoader = new THREE.OBJLoader2()
objLoader.setPath(basePath)

export const loadTexture = textureLoader.load.bind(textureLoader)

export const loadCubeTexture = (texture) => cubeTextureLoader.load(_.fill(new Array(6), texture))

export function loadSprite (name, type = 'png') {
  return new Promise((resolve, reject) => {
    let path = [name, type].join('.')
    textureLoader.load(path, resolve, null, reject)
  })
}

export function loadModel (name) {
  return new Promise((resolve, reject) => {
    let path = name + '.obj'
    objLoader.load(path, resolve, ()=>{}, reject)
  })
}
