# groupme-gallery-downloader
A front-end web application to access and download all of a GroupMe's gallery data.

## Statement
I wanted a way to save all of a GroupMe's gallery data. Groupme does not have any built-in functionality saving an entire group's gallery without going into each gallery image and video and downloading it by hand. Myself being a programmer and being 'lazy' that I did not want to do this by hand for every GroupMe where I wanted to save memories, I wrote this program to automate that process.

At first, I read and learned about GroupMe's API and REST services to try to run everything through the backend, which was great and very interesting. However, I wanted to create a tool that anyone could easily use to download their GroupMe gallery data. I decided early on to put a huge focus on simplicity and ease of use. Thus, using a web automation framework like Selenium and accessing GroupMe through the front-end seemed to be the easiest to code, easiest to maintain or manipulate, and easiest to automate downloads. 

## How It Works
This project is indended to serve as a standalone project that performs the following steps.
1. Opens a Chrome browser instance on your machine
2. The User Logs into their GroupMe account 

**NOTE:** This part may be automated for entering a username and password, but I did not want to manipulate those data points, also may have to manually type your GroupMe PIN for 2FA. Easiest to let the user do that once

3. From here, the program takes over and searches for the desired chat name
4. Opens a particular GroupMe group and its gallery
5. **Traverses through all media** in that group's gallery and clicks 'Download'
6. Open your `C:/.../Downloads` folder and see all of the gallery data. Then, drag and drop everything into your own folder outside of downloads.

## Project Setup
### Getting Started
Here are the instructions as how to run the project:
1. Download the Reposity or Install Git and run: `git clone https://github.com/Avery-Swank/groupme-gallery-downloader.git`
2. Modify the values in `setup.json` to the gallery you want to download
3. Run `$ npm install` within the project. Ensures you have all of the proper libraries: Selenium, etc.
4. Run `$ node app.js`

### setup.json
Again, the goal of this project is to make it easy for anyone, with or without coding experience, to use this tool to download their GroupMe data. The only file that needs edits to your specific GroupMe account and group chat name is in `setup.json`

```
{
    "browserType": "chrome",
    "chatName": "My first chat"
}
```

 - **browserType**: The type of browser to load on your machine. Currently only works for a Chrome Browser.
 - **chatName**: The name of the GroupMe group gallery data you want to download.

## Next Developments
 - Add more types of browsers beyond chrome: firefox, internet explorer, etc.
 - Save all of the gallery data in a folder within Downloads to prevent a cluttered Downloads directory
 - Add option to download a particular number of recent media rather than the entire gallery

## Software Reference
 - [NodeJS](https://nodejs.org/en/)
 - [Selenium Webdriver](https://selenium.dev/)
