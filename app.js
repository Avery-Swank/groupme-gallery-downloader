
const { Builder, By } = require('selenium-webdriver')
const { Key } = require('selenium-webdriver/lib/input')
const { chromedriver } = require('chromedriver')

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
 * @function main
 * @description Run the main program to save all Groupme Gallery photos that mimicks that of a front-end user
 */
const main = async () => {

    console.log("Running main...")

    // Read the data from "setup.json"
    const setupData = require('./setup.json')
    const browserType = setupData.browserType
    const chatName = setupData.chatName
    const sendInfo = setupData.sendInfoToChat

    if(browserType.length == 0 || chatName.length == 0){
        console.log(`Invalid Setup data. \n ${JSON.stringify(setupData)}`)
        return null
    }

    console.log(`Running groupme-gallery-downloader with data: \n ${JSON.stringify(setupData)}`)

    const start = new Date()
    var mediaCount = 0
    var imageCount = 0
    var videoCount = 0

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
        await waitUntilClickable(driver, `[placeholder="Search chats"]`)
        const groupsSearch = await driver.findElement(By.css(`[placeholder="Search chats"]`))
        await groupsSearch.sendKeys(chatName)

        // Click Group
        await waitUntilClickable(driver, `[ng-if="filteredChats.length"]`)
        const desiredGroup = await driver.findElement(By.css(`[ng-if="filteredChats.length"]`))
        await desiredGroup.click()

        // Click Group Header Dropdown
        await waitUntilClickable(driver, `[class="accessible-focus menu-toggle dropdown-toggle"]`)
        const groupDropdown = await driver.findElement(By.css(`[class="accessible-focus menu-toggle dropdown-toggle"]`))
        await groupDropdown.click()

        // Click Gallery
        await waitUntilClickable(driver, `[ng-click="showGallery()"]`)
        const galleryButton = await driver.findElement(By.css(`[ng-click="showGallery()"]`))
        await galleryButton.click()
        // END Navigate to GroupMe Gallery ---------------------------------------------------
        // BEGIN Saving Gallery Media -------------------------------------------------------

        console.log(`groupme-gallery-downloader: Clicked gallery in group chat: ${chatName}`)

        // Click the first image
        await waitUntilClickable(driver, `[class="img-wrap accessible-focus"]`)
        const firstImage = await driver.findElement(By.css(`[class="img-wrap accessible-focus"]`))
        await firstImage.click()
        
        // Will continually add images until there is no 'next button'
        // ie there are no more images
        while(true){

            try{
                var image = null
                var video = null

                // Wait for image or video to show
                await waitUntilClickable(driver, `[class="current-media"]`)
                
                // Check if the media is a image or a video and grab the src accordingly
                // Otherwise wait and try again because it is a given that something will show up
                // Helps slow down execution
                while(true){
                    try{
                        image = await driver.findElement(By.xpath(`//div[@class="media-wrap"]/img`))
                        imageCount++
                    } catch(e) { /* loop and try again or current media is not a image*/ }
    
                    try{
                        video = await driver.findElement(By.xpath(`//div[@class="video-wrap"]/video`))
                        videoCount++
                    } catch(e) { /* loop and try again or current media is not a video */ }

                    if(!(image == null && video == null)){
                        break
                    }
                }

                // Click Download button
                await waitUntilClickable(driver, `[ng-click="download()"]`)
                const downloadButton = await driver.findElement(By.css(`[ng-click="download()"]`))
                await downloadButton.click()
                await driver.sleep((Math.random() * 5000))    // Download buffer

                console.log(`groupme-gallery-downloader: Media Downloaded: ${mediaCount}`)

                // Click Next-Media button
                const nextButton = await driver.findElement(By.css(`[ng-click="next(); $event.stopPropagation();"]`))
                await nextButton.click()

                await driver.sleep(500) // Loading next media buffer 

                mediaCount++
            } catch (e) {
                console.log(`groupme-gallery-downloader: All media have been saved`)
                break
            }
        }

        // At this point, it is possible the driver closes before the last media file is downloaded. To ensure
        // that the last media downloads, wait for a static amount of time
        await driver.sleep(3000)

        // END Saving Gallery Photos ---------------------------------------------------------
        // BEGIN Sending Download Info To That GroupMe ---------------------------------------

        // Send the execution time, image count, and video count to the groupme
        // for confirmation it saved all gallery data
        if(sendInfo){

            // Click Current Media button
            await waitUntilClickable(driver, `[class="close accessible-focus-dark"][ng-click="$close()"]`)
            const currMediaButton = await driver.findElement(By.css(`[class="close accessible-focus-dark"][ng-click="$close()"]`))
            await currMediaButton.click()

            // Click Close Gallery button
            await waitUntilClickable(driver, `[class="close accessible-focus"]`)
            const closeGalleryButton = await driver.findElement(By.css(`[class="close accessible-focus"]`))
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
        await driver.close()
        await driver.quit()

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