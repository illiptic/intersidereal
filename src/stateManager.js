import _ from 'lodash'

export default stateManager

const state = {}

const stateManager = {
  setState,
  getState
}

export function setState (newState) {
  _.merge(state, newState)
}

export function getState () {
  return _.cloneDeep(state)
}
