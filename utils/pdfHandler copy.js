const puppeteer = require('puppeteer');


(async function(){
    try {
        const browser = await puppeteer.launch();
        const page = await browser.newPage();

        await page.setContent("<h1>hello</h1>");
        await page.emulateMedia("screen");

        await page.pdf({
            path:'mypdf.pdf',
            format: "A4",
            printBackground : true
        });

        console.log('done');
        await browser.close();
        process.exit();
    } catch (e) {
        console.log("our error", e);
    }
})();

Symbol.dispose = Symbol.dispose || Symbol('dispose');
