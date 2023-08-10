const puppeteer = require('puppeteer');
var clc = require("cli-color");
var cpuu = require('cputilization');

let sentToBackOffice = 0;

function delay(time) {
    return new Promise(resolve => setTimeout(resolve, time));
}

process.on('warning', warningInfo => {
    if (warningInfo) {
        console.log(clc.yellow(`${warningInfo}`))
        delay(60000)
    }
});

process.on('error', errorInfo => {
    if (errorInfo.includes('TimeoutError')) {
        console.log(clc.red(`TTTTTTTTTTTTTTTTTTTTTTTTTTTTT`))
        process.exit(1);
    }
});

process.on('error', errorInfo => {
    if (errorInfo.includes('ProtocolError')) {
        console.log(clc.red(`PPPPPPPPPPPPPPPPPPPPPPPPPPPPP`))
        process.exit(1);
    }
});

var makeupalleySearchConfig = {

    "userAgent": `Mozilla/5.0 (X11; Linux armv7l) AppleWebKit/537.36 (KHTML, like Gecko) Raspbian Chromium/74.0.3729.157 Chrome/74.0.3729.157 Safari/537.36`,
    "proxy": "http://199.203.131.155:20201",
    "searchBar": 'input[name="q"]',
    "firstPdtReviews": 'div[class="yuRUbf"] > a', //
    "reviewSection": 'div[id="product-review"] > article', //
    "clickMoreReviews": 'a[class="btn btn-default mua-see-more-btn event-tracking"]', //
    "readMoreBtn": 'a[class="ml-1 readmore"]', //
    "nextPage": 'li[class="next"]',

    "selectAuthor": 'div[class="__UserLink__"] > a', //
    "selectRating": 'span[class="rating-value"]', //
    "selectDate": 'div[class="date"]', //
    "selectReview": 'div[class="__ReviewTextReadMoreV2__"] > div', //

};

let doSearch = function (searchQuery, makeupalleySearchConfig) {
    return new Promise((resolve, reject) => {
        resolve(searchMakeupalley(searchQuery, makeupalleySearchConfig));
    })
}

let searchMakeupalley = async (mySearchQuery, myConfig) => {

    try {

        let searchResults;

        let port_numbers = ['20201', '20241', '20254'];
        let random_port_number = Math.floor(Math.random() * 3);
        let randomIp = '199.203.131.155';
        let randomPort = port_numbers[random_port_number];
        let randomProxy = `${randomIp}:${randomPort}`;
        console.log(clc.xterm(88)('Proxy:'), `${randomIp}:${randomPort}`);

        const browser = await puppeteer.launch({
            headless: true,
            defaultViewport: null,
            args: [
                '--disable-dev-shm-usage',
                '--no-sandbox',
                '--single-process',
                '--no-zygote',
                // `--proxy-server=${randomProxy}`,
            ],
        })

        const page = await browser.newPage();

        await page.setUserAgent(myConfig.userAgent);

        function randomInteger(min, max) {
            return Math.floor(Math.random() * (max - min + 1)) + min;
        }

        try {
            await page.goto(`https://www.google.com`, { waitUntil: 'load', timeout: 0 }); // URL
            await page.setDefaultNavigationTimeout(0);
        } catch (error) {
            if (`${error}`.includes('net::ERR_TIMED_OUT')) {
                browser.close();
                console.log(clc.xterm(168)(`${error} (${mySearchQuery})`.toUpperCase()));
                return 'Connexion Error'
            }
        }

        await page.mouse.move(1000, 40);
        await page.mouse.move(900, 50);
        await page.mouse.move(300, 40);

        console.log(clc.green(`ON SEARCH PAGE`), clc.xterm(187)(`(${mySearchQuery})`));

        // await page.screenshot({ path: 'screenshot.png', fullPage: true });

        await page.waitForSelector(myConfig.searchBar, { timeout: 0 });

        await page.type(myConfig.searchBar, `${mySearchQuery} site:makeupalley.com`);

        await page.mouse.move(700, 20);
        await page.mouse.move(470, 90);

        await page.keyboard.press('Enter');

        await page.mouse.move(600, 70);
        await page.mouse.move(800, 55);

        await page.waitForTimeout(randomInteger((10000), (15000)));

        // await page.screenshot({ path: 'screenshot.png', fullPage: true });
        await cpuu(async function (error, sample) {
            if (sample.percentageBusy() > 0.95) {

                    console.log(clc.xterm(13)('CPU Checkpoint 1 - OVERLOAD:'), sample.percentageBusy());
                    // child_process.spawn('pm2', ['stop', 'Infscrap', ' MakeupalleyService'], {
                    //     stdio: 'inherit'
                    // });
                    browser.close();

                    await delay(60000);

            } else {
                console.log(clc.xterm(119)('CPU Checkpoint 1 - OKAY:'), sample.percentageBusy());
            }
        });

        if ((await page.$(myConfig.robotBlocking) !== null)) {
            console.log(clc.magenta(`CAPTCHA BLOKING (${mySearchQuery})`.toUpperCase()));
            browser.close();
            return 'Captcha Blocking';
        }

        await page.waitForTimeout(randomInteger((10000), (15000)));

        if ((await page.$(myConfig.firstPdtReviews) == null)) {
            console.log(clc.cyan(`NO RESULT FOUND FOR THIS KEYPHRASE (${mySearchQuery})`.toUpperCase()));
            browser.close();
            return 'No result found for this keyphrase';
        }

        await page.$eval(myConfig.firstPdtReviews, button => button.click(), { waitUntil: 'load', timeout: 0 });

        // const href = await page.evaluate(() => {
        //     let url = document.querySelector('div[class="yuRUbf"] > a').getAttribute('href')
        //     return url;
        // });

        // try {
        //     await page.goto(`${href}/reviews`, { waitUntil: 'load', timeout: 0 }); // URL
        //     await page.setDefaultNavigationTimeout(0);
        // } catch (error) {
        //     console.log(clc.xterm(168)(`${error} (${mySearchQuery})`.toUpperCase()));
        //     if (`${error}`.includes('net::ERR_TIMED_OUT')) {
        //         delay(60000);
        //     }
        // }

        console.log(clc.green(`ON WEBSITE PAGE`), clc.xterm(187)(`(${mySearchQuery})`));

        // await page.screenshot({ path: 'screenshot.png', fullPage: true });

        await page.waitForTimeout(randomInteger((10000), (15000)));

        // if ((await page.$('button[class="onetrust-close-btn-handler onetrust-close-btn-ui banner-close-button ot-close-icon"]') !== null)) {
        //     await page.click('button[class="onetrust-close-btn-handler onetrust-close-btn-ui banner-close-button ot-close-icon"]');
        //     console.log(clc.cyan(`${mySearchQuery} : Button 1 Clicked`));
        // }

        // if ((await page.$('#__next > main > div:nth-child(3) > div > div > div > div:nth-child(2) > a') !== null)) {
        //     await page.click('#__next > main > div:nth-child(3) > div > div > div > div:nth-child(2) > a');
        //     document.querySelector("#__next > main > div:nth-child(3) > div > div > div > div:nth-child(2) > a")
        //     console.log(clc.cyan(`${mySearchQuery} : Button 2 Clicked`));
        // }

        let TITLE = await page.evaluate(() => {
            let productName = document?.querySelector(`title`)?.innerText;
            let splitTitle = `${productName}`.split('|')[0];
            return splitTitle;
        });

        await page.waitForTimeout(randomInteger((10000), (15000)));

        await page.evaluate(async () => {
            await new Promise((resolve, reject) => {
                var totalHeight = 0;
                var distance = 100;
                var timer = setInterval(() => {
                    var scrollHeight = document.body.scrollHeight;
                    window.scrollBy(0, distance);
                    totalHeight += distance;

                    if (totalHeight >= scrollHeight) {
                        clearInterval(timer);
                        resolve();
                    }
                }, 200);
            });
        });

        if ((await page.$(myConfig.clickMoreReviews) !== null)) {
            await page.$eval(myConfig.clickMoreReviews, button => button.click(), { waitUntil: 'load', timeout: 0 });
        }

        await page.waitForTimeout(randomInteger((6000), (10000)));

        await cpuu(async function (error, sample) {
            if (sample.percentageBusy() > 0.95) {

                try {
                    console.log(clc.xterm(13)('CPU Checkpoint 2 - OVERLOAD:'), sample.percentageBusy());

                    browser.close();

                    await delay(60000);

                } catch (error) {
                    console.log(clc.xterm(31)('Browser Closed'));
                }

            } else {
                console.log(clc.xterm(119)('CPU Checkpoint 2 - OKAY:'), sample.percentageBusy());
            }
        });

        if ((await page.$(myConfig.reviewSection) == null)) {
            console.log(clc.yellow(`REVIEW SECTION NOT FOUND (${mySearchQuery})`.toUpperCase()));
            browser.close();
            return 'No Reviews Found For This Product'
        } else {
            console.log(clc.green(`REVIEW SECTION FOUND`), clc.xterm(187)(`(${mySearchQuery})`));
        }

        searchResults = await page.$$eval(myConfig.reviewSection, (results, myConfig) => {

            let data = [];

            results.forEach(result => {

                const author = result?.querySelector(myConfig.selectAuthor)?.innerText;

                const rating = parseInt(result?.querySelector(myConfig.selectRating)?.innerText);

                const date1 = result?.querySelector(myConfig.selectDate)?.innerText;
                let date = new Date();
                let date2 = `${date1}`.split(' ')[0];
                if (date1.includes('day')) {  // Retrieve date  
                    str = date1.replace(' days ago', '');
                    date.setDate(date.getDate() - date2);
                    date = date.toJSON();
                } else if (date1.includes('month')) {
                    str = date1.replace(' months ago', '');
                    if (str = 'a') { str = 1 }
                    date.setMonth(date.getMonth() - date2);
                    date = date.toJSON();
                } else if (date1.includes('year')) {
                    str = date1.split(' ');
                    date.setFullYear(date.getFullYear() - date2);
                    date = date.toJSON();
                }

                const review = result?.querySelector(myConfig.selectReview)?.innerText;

                let productURL = window.location.href;

                data.push({ author, rating, date, review, productURL });

            });

            return data;

        }, myConfig);

        browser.close();

        const commonWords = (a, b) => {
            let w;
            let f = a.toLowerCase();
            let s = b.toLowerCase();
            let j = f.replace(/"|'/g, '');
            let k = s.replace(/"|'/g, '');
            let first = `${j}`.split(" ");
            let second = `${k}`.split(" ");
            let temp;

            if (second.length > first.length) { temp = second; second = first; first = temp; }
            w = first.filter(function (e) {
                return second.indexOf(e) > -1;
            });

            return w.sort();
        };

        console.log(clc.xterm(226)(`TITLE (${mySearchQuery}) : `), clc.xterm(187)(TITLE));

        console.log(searchResults);

        let date_ob = new Date();
        let date = ("0" + date_ob.getDate()).slice(-2);
        let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
        let year = date_ob.getFullYear();
        let hours = date_ob.getHours();
        let minutes = date_ob.getMinutes();
        let seconds = date_ob.getSeconds();
        let checkingTime = year + "-" + month + "-" + date + " " + hours + ":" + minutes + ":" + seconds;

        sentToBackOffice++;
        console.log(clc.xterm(154)(`${sentToBackOffice} Keyphrases sent to BackOffice (${mySearchQuery}), [${checkingTime}]`))

        await cpuu(async function (error, sample) {
            if (sample.percentageBusy() > 0.95) {

                try {
                    console.log(clc.xterm(13)('CPU Checkpoint 3 - OVERLOAD:'), sample.percentageBusy());
                    // child_process.spawn('pm2', ['stop', 'Infscrap', ' MakeupalleyService'], {
                    //     stdio: 'inherit'
                    // });
                    browser.close();

                    await delay(60000);

                } catch (error) {
                    console.log(clc.xterm(31)('Browser Closed'));
                }

            } else {
                console.log(clc.xterm(119)('CPU Checkpoint 3 - OKAY:'), sample.percentageBusy());
            }
        });

        if (searchResults.length == 0) {
            // browser.close();
            console.log(clc.xterm(89)(`No data found for this product`));
            return 'No data found for this product'
        } else if (commonWords(TITLE, mySearchQuery).length < 2) {
            // browser.close();
            console.log(clc.xterm(89)(`Results not matching the keyphrase (${TITLE} / ${mySearchQuery})`));
            return 'Results not matching the keyphrase'
        } else {
            // browser.close();
            console.log(clc.xterm(89)(`Results Delivered (${TITLE} / ${mySearchQuery})`));
            return searchResults;
        }
    }
    catch (error) {
        if (error.message.includes("net::ERR_CONNECTION_CLOSED" || "net::ERR_TIMED_OUT")) {
            console.log(clc.red(`${mySearchQuery} : CONNEXION ERROR`))
            return 'connexion error';
        }
        console.log(error);
        const browser = await puppeteer.launch({
            headless: true,
            defaultViewport: null,
            args: [
                '--disable-dev-shm-usage',
                "--no-sandbox",
                '--single-process',
                '--no-zygote',
                `--proxy-server=${myConfig.proxy}`,
            ],
        });
        console.log('page closed.');
        browser.close();
    }

};

module.exports = { makeupalleySearchConfig, doSearch, searchMakeupalley }