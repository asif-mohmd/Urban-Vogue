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

        await browser.close();
        process.exit();
    } catch (e) {
    res.status(404).json({ status: false, error: 'Something went wrong on the server.' });
    }
    
})();

Symbol.dispose = Symbol.dispose || Symbol('dispose');
