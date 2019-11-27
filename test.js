
const { getFilePaths } = require('./file/getFilePaths')
const { makeDirectory } = require('./file/makeDirectory')
const { transferFile } = require('./file/transferFile')
const downloadsFolder = require('downloads-folder')


const main = async () => {

    console.log(`Running Main....`)

    var downloadPath = downloadsFolder()

    // This is for differentating between newly downloaded groupme media and the files within the downloads
    var filePaths = getFilePaths(downloadPath)
    console.log(filePaths)
    //makeDirectory(`${downloadPath}/newDirectory2`)
    //transferFile(`${downloadPath}/server.c`, `${downloadPath}/newDirectory2/server.c`)
    
    return null
}

main()