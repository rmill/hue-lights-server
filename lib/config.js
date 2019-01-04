const fs = require("fs")

const FILE_LOCATION = './config.json'
var config

function getConfig() {
  if (config) {
    return config
  }

  try {
    var configFile = fs.readFileSync(FILE_LOCATION, { encoding: 'utf-8' })
  } catch(err) {
    console.log(`Config file '${FILE_LOCATION}' not found`);
    return null
  }

  return JSON.parse(configFile)
}

function saveConfig(updatedConfig) {
  config = updatedConfig
  fs.writeFileSync(FILE_LOCATION, JSON.stringify(updatedConfig))
}

function createConfig(lights) {
  return {
    lights: Object.assign({}, ...lights),
    groups: {
      bedroom: [],
      clue_room: [],
      dance_hall: [],
      hallway: [],
      kitchen: [],
      living_room: [],
      study: []
    }
  }
}

exports.createConfig = createConfig
exports.getConfig = getConfig
exports.saveConfig = saveConfig
