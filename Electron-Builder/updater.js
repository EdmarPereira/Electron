//module
const {autoUpdater} = require('electron-updater')

autoUpdater.logger = require('electron-log')
autoUpdater.logger.transports.file.level = 'debug'




//check for updates
exports.check = () => {
    console.log('Checking for updates')
    // start check for updates
    autoUpdater.checkForUpdates()


}
