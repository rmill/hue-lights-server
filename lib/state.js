const { getConfig } = require('./config')
const { getCurrentState } = require('./actions')

var state = getConfig()

function initialize() {
  for (var light of state.lights) {
    getCurrentState(light).then(s => _updateState(JSON.parse(s)))
  }
}

function _updateState(s) {
  for (var light of state.lights) {
    if (light.id === s.uniqueid) light.state = s.state
  }
}

module.exports = {
  initialize,
  state
}
