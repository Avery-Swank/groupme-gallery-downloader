
const fs = require('fs')

/**
 * @function getFilePaths
 * @description Return a list of files within the provided directory 'dirPath'
 * @param {string} dirPath 
 */
const getFilePaths = (dirPath = ``) => {
    var files = fs.readdirSync(dirPath)
    return files
}

module.exports = {
    getFilePaths
}