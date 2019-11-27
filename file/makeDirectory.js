
const fs = require('fs')

/**
 * @function makeDirectory
 * @description Make a directory at the desired 'dirPath'
 * @param {string} dirPath 
 */
const makeDirectory = (dirPath = ``) => {

    try{
        fs.mkdirSync(dirPath)
    } catch (e) {
        // Directory already exists
    }
    
}

module.exports = {
    makeDirectory
}