import {h, Component} from 'preact'
import {init, run} from '../main.js'

export default class Scene extends Component {
  shouldComponentUpdate() {
		return false;
	}

	componentDidMount() {
		setTimeout( () => this.setup(), 0);
	}

	setup() {
    init(this.base, this.props.updateHUD)
		run()
	}

	render() {
		return <div id="container" />
	}
}
