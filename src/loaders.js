import _ from 'lodash'
import { TextureLoader, CubeTextureLoader } from 'three'

const basePath = '/assets/'

const textureLoader = new TextureLoader().setPath(basePath)
const cubeTextureLoader = new CubeTextureLoader().setPath(basePath)

export const loadTexture = textureLoader.load.bind(textureLoader)

export const loadCubeTexture = (texture) => cubeTextureLoader.load(_.fill(new Array(6), texture))

export function loadSprite (name, type = 'png') {
  return new Promise((resolve, reject) => {
    let path = [name, type].join('.')
    textureLoader.load(path, resolve, null, reject)
  })
}
