
const { Builder, By } = require('selenium-webdriver')
const { chromedriver } = require('chromedriver')

/**
 * @function waitUntilClickable
 * @description Wait until an element can be clickable. Is great for waiting for front-end pages to load. 
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
    const email = setupData.emailUsername
    const password = setupData.password
    const chatName = setupData.chatName

    console.log(`Running groupme-gallery-downloader with data: \n ${JSON.stringify(setupData)}`)

    try{
    
        // BEGIN Login into a groupme account ------------------------------------------------
        const driver = await new Builder().forBrowser(browserType)
                                      .build()

        // Open Browser
        await driver.get(`https://web.groupme.com/chats`)
        //await driver.manage().window().maximize()
        
        // Enter Email/User name
        const usernameField = await driver.findElement(By.css(`[ng-model="username"]`))
        await usernameField.sendKeys(email)

        // Enter Password
        const passwordField = await driver.findElement(By.css(`[ng-model="password"]`))
        await passwordField.sendKeys(password)

        // Click Login
        const loginButton = await driver.findElement(By.css(`[type="submit"]`))
        await loginButton.click()

        // **Then presents 2FA**
        // **Needs to be done manually to get past 2FA**

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
        // BEGIN Saving Gallery Photos -------------------------------------------------------

        console.log(`groupme-gallery-downloader: Clicked gallery in group chat: ${chatName}`)

        // Click the first image
        await waitUntilClickable(driver, `[class="img-wrap accessible-focus"]`)
        const firstImage = await driver.findElement(By.css(`[class="img-wrap accessible-focus"]`))
        await firstImage.click()
        
        // Will continually add images until there is no 'next button'
        // ie there are no more images
        var count = 0
        while(true){

            try{
                var image = null
                var video = null
                var validAddr = false
                var mediaAddr = ""

                // Wait for image or video to show
                await waitUntilClickable(driver, `[class="current-media"]`)
                
                // Check if the media is a image or a video and grab the src accordingly
                // Otherwise wait and try again because it is a given that something will show up
                while(!validAddr){
                    try{
                        image = await driver.findElement(By.xpath(`//div[@class="current-media"]//img`))
                    } catch(e) {
                        console.log(`Media is not an image`)
                    }
    
                    try{
                        video = await driver.findElement(By.xpath(`//div[@class="current-media"]//video/source`))
                    } catch(e) {
                        console.log(`Media is not a video`)
                    }

                    if(!(image == null && video == null)){
                        mediaAddr = (image != null) ? await image.getAttribute(`src`) : await video.getAttribute(`src`)
                        validAddr = !mediaAddr.includes(`gm-hash-spinner`)
                    } else {
                        validAddr = false
                    }

                    // Buffer inbetween scans to determine images from videos. Prevents element stale references for loading pages
                    await driver.sleep(500)
                }

                console.log(`groupme-gallery-downloader: Media Index ${count}: ${mediaAddr}`)

                // Click Download button
                await waitUntilClickable(driver, `[ng-click="download()"]`)
                const downloadButton = await driver.findElement(By.css(`[ng-click="download()"]`))
                await downloadButton.click()

                // Click Next-Media button
                const nextButton = await driver.findElement(By.css(`[ng-click="next(); $event.stopPropagation();"]`))
                await nextButton.click()

                count++
            } catch (e) {
                console.log(`groupme-gallery-downloader: All images have been saved`)
                break
            }
        }

        // At this point, it is possible the driver closes before the last media file is downloaded. To ensure
        // that the last media downloads, wait for a static amount of time
        await driver.sleep(3000)

        // END Saving Gallery Photos ---------------------------------------------------------
        // CLOSE driver
        await driver.close()
        await driver.quit()

    } catch (e){
        await driver.close()
        await driver.quit()

        console.log(`groupme-gallery-downloader error: ${e}`)
    }

    return null
}

Promise.all([main()])