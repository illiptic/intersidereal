import {h, Component, options} from 'preact'
import _ from 'lodash'
import {Frustum, Matrix4} from 'three'
import {getContainerDimensions, formatNumber, formatNumbers} from '../utils.js'

options.debounceRendering = requestAnimationFrame

const frustum = new Frustum()

export default class Hud extends Component {
  getPings (system, camera, jumpInProgress ) {
    if (!jumpInProgress) {
      return this.getVisibleObjects(system, camera).map(({id, coords, d}) => {
        const container = getContainerDimensions()
        const halfWidth  = container.size[ 0 ] / 2
        const halfHeight = container.size[ 1 ] / 2

        let distance = formatNumber(d)
        return {
          distance: distance[0],
          distanceScale: distance[1],
          position: {
            left: Math.round(coords.x * halfWidth + halfWidth) + 'px',
            top: Math.round(- coords.y * halfHeight + halfHeight) + 'px'
          }
        }
      })
    }
  }

  getVisibleObjects (system, camera) {
    camera.updateMatrixWorld(); // make sure the camera matrix is updated
  	camera.matrixWorldInverse.getInverse( camera.matrixWorld );
  	frustum.setFromMatrix( new Matrix4().multiplyMatrices( camera.projectionMatrix, camera.matrixWorldInverse ) );
  	return system.children.map(o => {
  		if (o.name && frustum.intersectsObject( o )) {
        let position = o.getWorldPosition()
  			let d = position.distanceTo(camera.getWorldPosition()) - o.geometry.boundingSphere.radius
  			return {d, coords: position.project(camera), id: o.uuid}
  		}
  	}).filter(o => !!o)
  }

  componentDidUpdate() {
		// invoking setState() in componentDidUpdate() creates an animation loop:
		// this.setState()
	}

  render ({system, camera, jumpInProgress}) {
    return (
      <div id="hud">
        {system && camera && this.getPings(system, camera, jumpInProgress).map(ping => (
          <div className="ping" style={ping.position}>
            <div className="distance">{ping.distance} e<sup>{ping.distanceScale}</sup></div>
          </div>
        ))}
      </div>
    )
  }
}
