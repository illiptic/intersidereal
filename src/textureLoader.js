import {TextureLoader} from 'three'

const loader = new TextureLoader()
loader.path = '/assets/'

export function loadTextures () {

  let load = (asset) => new Promise((resolve, reject) => {
    loader.load(asset, resolve, null, (e) => {
      console.error(e)
      resolve()
    })
  })

  return Promise.all([
    'earthmap1k.jpg',
    'jupitermap.jpg',
    'mars_1k_color.jpg',
    'mercurymap.jpg',
    'plutomap1k.jpg'
  ].map(asset => load(asset)))
}

export function loadSprite (name, type = 'png') {
  return new Promise((resolve, reject) => {
    let path = [name, type].join('.')
    loader.load(path, resolve, null, reject)
  })
}

export default loadTextures
