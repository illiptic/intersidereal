import {h, Component} from 'preact'
import Scene from './Scene.js'
import Hud from './Hud.js'

export default class App extends Component {
  updateHUD ({system, camera}) {
    this.setState({
      system, camera
    })
  }

  render ({}, {system, camera}) {
    return (
      <div>
        <Scene updateHUD={this.updateHUD.bind(this)}/>
        <Hud system={system} camera={camera} />
      </div>
    )
  }
}
