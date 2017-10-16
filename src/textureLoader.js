import {TextureLoader} from 'three'

export function loadTextures () {
  const loader = new TextureLoader()
  loader.path = '/assets/'

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

export default loadTextures
