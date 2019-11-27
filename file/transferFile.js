
const fs = require('fs')

/**
 * @function transferFile
 * @description Transfer a file from 'oldDir' to 'newDir' by changing the name of its path
 * @param {string} oldPath 
 * @param {string} newPath 
 */
const transferFile = (oldPath = ``, newPath = ``) => {
    
    try{
        fs.renameSync(oldPath, newPath, function (err) {
            if(err){
                console.log(`rename err: ${err}`)
            }
        })
    } catch(e) {
        // Invalid file path: oldPath or newPath
    }
}

module.exports = {
    transferFile
}