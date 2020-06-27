
const { Builder, By } = require('selenium-webdriver')
const { Key } = require('selenium-webdriver/lib/input')
const { chromedriver } = require('chromedriver')

const fs = require('fs')
const request = require('request')

/**
 * @function waitUntilClickable
 * @description Wait until an element can be clickable. Is great for waiting for front-end pages to load. 
 *              Works for finding elements via css or xpath. Can be easily extended to more types
 *              WARNING: Is prone to running continuously forever
 * @param {*} driver 
 * @param {*} path 
 */
const waitUntilClickable = async(driver = {}, path = ``) => {
    var visible = false
    while(!visible){
        try{
            await driver.findElement(By.css(path))
            visible = true
        } catch (e) {
            try{
                await driver.findElement(By.xpath(path))
                visible = true
            } catch (e) {}
        }
    }
}

/**
 * @function download
 * @description Download a media item using request and fs libraries
 * @param {*} url 
 * @param {*} path 
 */
const downloadImage = async (url, path) => {
    await request.head(url, async (err, res, body) => {
      await request(url)
        .pipe(await fs.createWriteStream(path))
    })
}

/**
 * @function main
 * @description Run the main program to save all Groupme Gallery photos that mimicks that of a front-end user
 */
const main = async () => {

    // Read the data from "setup.json"
    const setupData = require('./setup.json')
    const browserType = setupData.browserType
    const chatName = setupData.chatName
    const sendInfo = setupData.sendInfoToChat

    const start = new Date()
    var imageCount = 0
    var videoCount = 0

    console.log(`groupme-gallery-downloader: Setup data: ${JSON.stringify(setupData)}`)

    try{
    
        // BEGIN Login into a groupme account ------------------------------------------------
        const driver = await new Builder().forBrowser(browserType)
            .build()

        // Open Browser
        await driver.get(`https://web.groupme.com/chats`)

        // At this point, the user logins into their GroupMe account by hand. Then there is no need
        // to manage a username and password

        // END Login into a groupme account --------------------------------------------------
        // BEGIN Navigate to GroupMe Gallery -------------------------------------------------

        // Search Group
        console.log(`groupme-gallery-downloader: Searching group: ${chatName}`)
        await waitUntilClickable(driver, `[placeholder="Search chats"]`)
        const groupsSearch = await driver.findElement(By.css(`[placeholder="Search chats"]`))
        await groupsSearch.sendKeys(chatName)

        // Click Group
        console.log(`groupme-gallery-downloader: Clicking group: ${chatName}`)
        await waitUntilClickable(driver, `[ng-if="filteredChats.length"]`)
        const desiredGroup = await driver.findElement(By.css(`[ng-if="filteredChats.length"]`))
        await desiredGroup.click()

        // Click Group Header Dropdown
        console.log(`groupme-gallery-downloader: Clicking ${chatName}'s Settings`)
        await waitUntilClickable(driver, `[class="accessible-focus menu-toggle dropdown-toggle"]`)
        const groupDropdown = await driver.findElement(By.css(`[class="accessible-focus menu-toggle dropdown-toggle"]`))
        await groupDropdown.click()

        // Click Gallery
        console.log(`groupme-gallery-downloader: Clicking ${chatName}'s Gallery`)
        await waitUntilClickable(driver, `[ng-click="showGallery()"]`)
        const galleryButton = await driver.findElement(By.css(`[ng-click="showGallery()"]`))
        await galleryButton.click()
        // END Navigate to GroupMe Gallery ---------------------------------------------------
        // BEGIN Saving Gallery Media -------------------------------------------------------

        // Click "Load More" until all of the media in the groupme are there on the page
        while(true) {
            // Let the media load
            await driver.sleep(5000)

            try{
                const loadMoreButton = await driver.findElement(By.css(`[ng-click="loadNextPage()"]`))
                await loadMoreButton.click()
                console.log(`groupme-gallery-downloader: Loading More Media`)
            } catch (e) {
                // Loaded all pictures
                // Wait for last of media to load
                console.log(`groupme-gallery-downloader: Loaded All GroupMe Media`)
                await driver.sleep(5000)
                break
            }
        }

        // Get all media items on the page
        // Because the Gallery can store all of the image urls on the same page, we can just grab all the image urls at once
        const media = await driver.findElements(By.xpath(`//*[@ng-repeat="item in items"]//img`))

        for(const mediaIter of media) {
            var mediaSrc = await mediaIter.getAttribute(`src`)

            // Remove preview suffix so images are to full scale
            mediaSrc = await mediaSrc.replace(`.preview`, ``)

            const isImage = await mediaSrc.includes(`i.groupme.com`)
            const isVideo = await mediaSrc.includes(`v.groupme.com`)

            // Save all images using the image src url
            if(isImage) {
                const fileName = await mediaSrc.split(`.`)[mediaSrc.split(`.`).length-1]
                const path = `./gallery/${fileName}.png`
              
                await downloadImage(mediaSrc, path)
                console.log(`groupme-gallery-downloader: Downloaded image ${fileName}.png`)
                imageCount++
            }

            // Save all videos by clicking download on them
            if(isVideo) {
                // Click video
                const videoButton = await mediaIter.findElement(By.xpath("./.."))
                await videoButton.click()

                // Wait for video to load
                await driver.sleep(3000)

                // Click download
                await waitUntilClickable(driver, `[ng-click="download()"]`)
                const downloadButton = await driver.findElement(By.css(`[ng-click="download()"]`))
                await downloadButton.click()

                // Wait for video to download
                await driver.sleep(3000)

                // Click exit
                await waitUntilClickable(driver, `//*[@class="zoom-layout"]//button[@ng-click="$close()"]`)
                const exitButton = await driver.findElement(By.xpath(`//*[@class="zoom-layout"]//button[@ng-click="$close()"]`))
                await exitButton.click()
              
                console.log(`groupme-gallery-downloader: Downloaded video in C:/Downloads`)
                videoCount++
            }
        }

        // END Saving Gallery Photos ---------------------------------------------------------
        // BEGIN Sending Download Info To That GroupMe ---------------------------------------

        // Send the execution time, image count, and video count to the groupme
        // for confirmation it saved all gallery data
        if(sendInfo){

            // Click Close Gallery button
            await waitUntilClickable(driver, `[id="CloseGalleryBtn"]`)
            const closeGalleryButton = await driver.findElement(By.css(`[id="CloseGalleryBtn"`))
            await closeGalleryButton.click()

            // Type Execution Data in Send Messege Field
            const end = new Date()
            var executionTime = (end - start) / 1000
            const dataSent = `groupme-gallery-downloader: Execution Time: ${executionTime} seconds, Images saved: ${imageCount}, Videos saved: ${videoCount}`
            
            await waitUntilClickable(driver, `[aria-label="Start typing and press enter to send"]`)
            const sendMsgField = await driver.findElement(By.css(`[aria-label="Start typing and press enter to send"]`))
            await sendMsgField.sendKeys(dataSent)

            // Click Send Messeage to GroupMe
            await sendMsgField.sendKeys(Key.ENTER)

            // Wait to confirm the msg sent
            await driver.sleep(1000)
        }
        // END Sending Download Info To That GroupMe ---------------------------------------

        // CLOSE driver
        await driver.close()
        await driver.quit()

    } catch (e){
        console.log(`groupme-gallery-downloader: ${e}`)
    }

    const end = new Date()
    var executionTime = (end - start) / 1000

    console.log(`\n`)
    console.log(`groupme-gallery-downloader: execution time: ${executionTime} seconds`)
    console.log(`groupme-gallery-downloader: images saved: ${imageCount}`)
    console.log(`groupme-gallery-downloader: videos saved: ${videoCount}`)

    return null
}

Promise.all([main()])