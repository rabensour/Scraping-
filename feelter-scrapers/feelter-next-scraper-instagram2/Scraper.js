const puppeteer = require('puppeteer');
var clc = require("cli-color");
var cpuu = require('cputilization');
var sleep = require('system-sleep');
const { response } = require('express');

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

var instagramSearchConfig = {

    "userAgent": `Mozilla/5.0 (X11; Linux armv7l) AppleWebKit/537.36 (KHTML, like Gecko) Raspbian Chromium/74.0.3729.157 Chrome/74.0.3729.157 Safari/537.36`,
    "proxy": "200.10.42.198:8000",
    "searchBar": 'input[name="q"]',
    "searchButton": 'button[class="sc-btzYZH hzWpYj sc-gqjmRU lfrTvs"]',
    "waitSearchPage": 'div[class="scroll-body sc-cmTdod hfUNic"]',
    "firstPdtReviews": 'div[class="yuRUbf"] > a', //
    "waitReviewsPage": 'div[class="sc-gpHHfC beHpSH"]',
    "reviewSection": 'div[class="_aabd _aa8k _aanf"]',
    "nextPage": 'li[class="next"]',

    "selectAvatar": '#mount_0_0_2p > div > div > div.x9f619.x1n2onr6.x1ja2u2z > div > div > div > div.x78zum5.xdt5ytf.x10cihs4.x1t2pt76.x1n2onr6.x1ja2u2z > div.x9f619.xnz67gz.x78zum5.x168nmei.x13lgxp2.x5pf9jr.xo71vjh.x1uhb9sk.x1plvlek.xryxfnj.x1c4vz4f.x2lah0s.x1q0g3np.xqjyukv.x1qjc9v5.x1oa3qoh.x1qughib > div.xh8yej3.x1gryazu.x10o80wk.x14k21rp.x1porb0y.x17snn68.x6osk4m > section > main > div._aa6b._ad9f._aa6d > div._aa6e > article > div > div._ab8w._ab94._ab99._ab9f._ab9m._ab9p._abcm > div > div._aasi > div > header > div:nth-child(1) > div > div > div > a > img', // 
    "selectAuthor": '#mount_0_0_2p > div > div > div.x9f619.x1n2onr6.x1ja2u2z > div > div > div > div.x78zum5.xdt5ytf.x10cihs4.x1t2pt76.x1n2onr6.x1ja2u2z > div.x9f619.xnz67gz.x78zum5.x168nmei.x13lgxp2.x5pf9jr.xo71vjh.x1uhb9sk.x1plvlek.xryxfnj.x1c4vz4f.x2lah0s.x1q0g3np.xqjyukv.x1qjc9v5.x1oa3qoh.x1qughib > div.xh8yej3.x1gryazu.x10o80wk.x14k21rp.x1porb0y.x17snn68.x6osk4m > section > main > div._aa6b._ad9f._aa6d > div._aa6e > article > div > div._ab8w._ab94._ab99._ab9f._ab9m._ab9p._abcm > div > div._aasi > div > header > div._aaqy._aaqz > div._aar0._ad95._aar1 > div.x78zum5 > div > div > div > div > div > a', // 
    "selectHashtags": '#mount_0_0_2p > div > div > div.x9f619.x1n2onr6.x1ja2u2z > div > div > div > div.x78zum5.xdt5ytf.x10cihs4.x1t2pt76.x1n2onr6.x1ja2u2z > div.x9f619.xnz67gz.x78zum5.x168nmei.x13lgxp2.x5pf9jr.xo71vjh.x1uhb9sk.x1plvlek.xryxfnj.x1c4vz4f.x2lah0s.x1q0g3np.xqjyukv.x1qjc9v5.x1oa3qoh.x1qughib > div.xh8yej3.x1gryazu.x10o80wk.x14k21rp.x1porb0y.x17snn68.x6osk4m > section > main > div._aa6b._ad9f._aa6d > div._aa6e > article > div > div._ab8w._ab94._ab99._ab9f._ab9m._ab9p._abcm > div > div._ae2s._ae3v._ae3w > div._ae5q._akdn._ae5r._ae5s > ul > div > li > div > div > div._a9zr > div._a9zs > h1 > a', // 
    "selectRating": 'div[class="sc-dnqmqq ispjfD sc-gzVnrw buOHFr"] > div[class="sc-gipzik"]',
    "selectLikes": 'a[class="like sc-rBLzX hLtmen"] > div[class="like-count"]',
    "selectDate": '#__next > main > div > div > div:nth-child(2) > div.InfiniteScroll_infinite-scroll__UYEgy > div > div > div.UgcHeader_ugc-header__6oDmg > a > div:nth-child(2) > div > time',
    "selectCity": 'div[class="timestamp"] > span:nth-child(2)',
    "selectReview": 'h1[class="_aacl _aaco _aacu _aacx _aad7 _aade"]', // 
    "selectReviewImg": '#mount_0_0_2p > div > div > div.x9f619.x1n2onr6.x1ja2u2z > div > div > div > div.x78zum5.xdt5ytf.x10cihs4.x1t2pt76.x1n2onr6.x1ja2u2z > div.x9f619.xnz67gz.x78zum5.x168nmei.x13lgxp2.x5pf9jr.xo71vjh.x1uhb9sk.x1plvlek.xryxfnj.x1c4vz4f.x2lah0s.x1q0g3np.xqjyukv.x1qjc9v5.x1oa3qoh.x1qughib > div.xh8yej3.x1gryazu.x10o80wk.x14k21rp.x1porb0y.x17snn68.x6osk4m > section > main > div._aa6b._ad9f._aa6d > div._aa6e > article > div > div._aatk._aatn > div > div > div > div._aagv > img' // 

};

let doSearch = function (searchQuery, instagramSearchConfig) {
    return new Promise((resolve, reject) => {
        resolve(searchInstagram(searchQuery, instagramSearchConfig));
    })
}

let searchInstagram = async (mySearchQuery, myConfig) => {

    try {

        let searchResults;

        // let port_numbers = ['13040'];
        // let random_port_number = Math.floor(Math.random() * 3);
        // let randomIp = '5.79.73.131';
        // let randomPort = 13040;
        // let randomProxy = `${randomIp}:${randomPort}`;
        // console.log(clc.xterm(88)('Proxy:'), `${randomIp}:${randomPort}`);

        const browser = await puppeteer.launch({
            headless: false,
            defaultViewport: null,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-accelerated-2d-canvas',
                '--disable-web-security',
                '--no-first-run',
                '--no-zygote',
                '--single-process', // <- this one doesn't works in Windows
                '--disable-gpu',

                '--disable-arc-cpu-restriction',
                '--arc-disable-media-store-maintenance',
                '--webrtc-max-cpu-consumption-percentage',
                '--disable-gpu-rasterization',
                '--disable-low-res-tiling',
                '--disable-skia-runtime-opts',
                '--enable-arcvm-rt-vcpu',
                '--enable-native-gpu-memory-buffers',
                '--reduce-user-agent-platform-oscpu',
                '--vulkan-sync-cpu-memory-limit-mb',

                `--proxy-server=${myConfig.proxy}`
            ],
        })

        const page = await browser.newPage();

        await page.setUserAgent(myConfig.userAgent);

        function randomInteger(min, max) {
            return Math.floor(Math.random() * (max - min + 1)) + min;
        }

        try {
            let query0 = `https://www.instagram.com/web/search/topsearch/?context=blended&query=iphone%2012&include_reel=true/?__a=1&__d=dis`;
            let query = query0.replace(/\s/g, '');
            await page.goto(query, { waitUntil: 'load', timeout: 0 }); // URL
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

        console.log(clc.green(`ON WEBSITE PAGE`), clc.xterm(187)(`(${mySearchQuery})`));

        try {
            await page.screenshot({ path: 'screenshot.png', fullPage: true });
        } catch (error) {
            console.log('Cannot take the screenshot');
        }
        // await page.waitForSelector(myConfig.searchBar, { timeout: 0 });

        // await page.type(myConfig.searchBar, `${mySearchQuery} site:instagram.com`);

        await page.mouse.move(700, 20);
        await page.mouse.move(470, 90);

        // await page.keyboard.press('Enter');

        await page.mouse.move(600, 70);
        await page.mouse.move(800, 55);

        await page.waitForTimeout(randomInteger((10000), (15000)));

        // try {
        //     await page.screenshot({ path: 'screenshot.png', fullPage: true });
        // } catch (error) {
        //     console.log('Cannot take the screenshot');
        // }
        await cpuu(async function (error, sample) {
            if (sample.percentageBusy() > 0.95) {

                console.log(clc.xterm(13)('CPU Checkpoint 1 - OVERLOAD:'), sample.percentageBusy());

                // const pages = await browser.pages();

                // for (const page of pages) await page.close();

                // // await browser.close();
                // console.log('Pages Closed');

                if (process.pid) {
                    console.log('This process is your pid ' + process.pid);
                }

                sleep(60000);

                process.exit();

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

        // if ((await page.$(myConfig.firstPdtReviews) == null)) {
        //     console.log(clc.cyan(`NO RESULT FOUND FOR THIS KEYPHRASE (${mySearchQuery})`.toUpperCase()));
        //     browser.close();
        //     return 'No result found for this keyphrase';
        // }

        // const href = await page.evaluate(() => {
        //     let url = document.querySelector('div[class="yuRUbf"] > a').getAttribute('href')
        //     return url;
        // // });

        // try {
        //     await page.goto(`${href}/reviews`, { waitUntil: 'load', timeout: 0 }); // URL
        //     await page.setDefaultNavigationTimeout(0);
        // } catch (error) {
        //     console.log(clc.xterm(168)(`${error} (${mySearchQuery})`.toUpperCase()));
        //     if (`${error}`.includes('net::ERR_TIMED_OUT')) {
        //         delay(60000);
        //     }
        // }

        // console.log(clc.green(`ON WEBSITE PAGE`), clc.xterm(187)(`(${mySearchQuery})`));

        // try {
        //     await page.screenshot({ path: 'screenshot.png', fullPage: true });
        // } catch (error) {
        //     console.log('Cannot take the screenshot');
        // }
        // await page.waitForTimeout(randomInteger((10000), (15000)));

        // if ((await page.$('button[class="onetrust-close-btn-handler onetrust-close-btn-ui banner-close-button ot-close-icon"]') !== null)) {
        //     await page.click('button[class="onetrust-close-btn-handler onetrust-close-btn-ui banner-close-button ot-close-icon"]');
        //     console.log(clc.cyan(`${mySearchQuery} : Button 1 Clicked`));
        // }

        // if ((await page.$('#__next > main > div:nth-child(3) > div > div > div > div:nth-child(2) > a') !== null)) {
        //     await page.click('#__next > main > div:nth-child(3) > div > div > div > div:nth-child(2) > a');
        //     document.querySelector("#__next > main > div:nth-child(3) > div > div > div > div:nth-child(2) > a")
        //     console.log(clc.cyan(`${mySearchQuery} : Button 2 Clicked`));
        // }

        // let TITLE = await page.evaluate(() => {
        //     let productName = document?.querySelector(`title`)?.innerText;
        //     let splitTitle = `${productName}`.split('|')[0];
        //     return splitTitle;
        // });

        // await page.waitForTimeout(randomInteger((10000), (15000)));

        // await page.evaluate(async () => {
        //     await new Promise((resolve, reject) => {
        //         var totalHeight = 0;
        //         var distance = 100;
        //         var timer = setInterval(() => {
        //             var scrollHeight = document.body.scrollHeight;
        //             window.scrollBy(0, distance);
        //             totalHeight += distance;

        //             if (totalHeight >= scrollHeight) {
        //                 clearInterval(timer);
        //                 resolve();
        //             }
        //         }, 200);
        //     });
        // });

        // await page.waitForTimeout(randomInteger((6000), (10000)));

        // await cpuu(async function (error, sample) {
        //     if (sample.percentageBusy() > 0.95) {

        //         console.log(clc.xterm(13)('CPU Checkpoint 2 - OVERLOAD:'), sample.percentageBusy());

        //         // const pages = await browser.pages();

        //         // for (const page of pages) await page.close();

        //         // // await browser.close();
        //         // console.log('Pages Closed');

        //         if (process.pid) {
        //             console.log('This process is your pid ' + process.pid);
        //         }

        //         sleep(60000);

        //         process.exit();


        //     } else {
        //         console.log(clc.xterm(119)('CPU Checkpoint 2 - OKAY:'), sample.percentageBusy());
        //     }
        // });


        // if ((await page.$(myConfig.reviewSection) == null)) {
        //     console.log(clc.yellow(`REVIEW SECTION NOT FOUND (${mySearchQuery})`.toUpperCase()));
        //     browser.close();
        //     return 'No Reviews Found For This Product'
        // } else {
        //     console.log(clc.green(`REVIEW SECTION FOUND`), clc.xterm(187)(`(${mySearchQuery})`));
        // }

        // let URLs = await page.evaluate(() => {
        //     let list = document.querySelectorAll('div[class="_aabd _aa8k _aanf"] > a');
        //     let getUrls = [];
        //     for (let i = 0; i < list.length; i++) {
        //         let url = list[i].getAttribute('href');
        //         getUrls.push(url);
        //     }
        //     return getUrls;
        // });
        // console.log(clc.xterm(106)(`URLS (${mySearchQuery}) :`), URLs);


        // const axios = require('axios')
        // let linksArray = [];

        const fetch = require('node-fetch');

        let url = "https://www.instagram.com/web/search/topsearch/?context=blended&query=iphone%2012&include_reel=true/?__a=1&__d=dis";
        
        let settings = { method: "Get" };
        
        fetch(url, settings)
            .then(res => res.json())
            .then((json) => {
console.log(json)            });

        // for (let i = 0; i < URLs.length; i++) {

        //     const data = {
        //         user_key: "tyLkPSlshyZttOysqkKF",
        //         URLS:
        //             [
        //                 {
        //                     "URL": `https://www.instagram.com${URLs[i]}`,
        //                     "Headers": {
        //                         "Connection": "keep-alive",
        //                         "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:71.0) Gecko/20100101 Firefox/71.0",
        //                         "Upgrade-Insecure-Requests": "1"
        //                     },
        //                     "userId": "ID-0"
        //                 }
        //             ]
        //     }

        //     axios
        //         .post('http://s.infatica.io:5063', data)
        //         .then(res => {
        //             console.log(`Status: ${res.status}`)
        //             let id = Object.keys(res.data);
        //             console.log('Body: ', res.data[0].link);
        //             linksArray.push(res.data);
        //             console.log(linksArray);
        //             // let lastElement = linksArray[linksArray.length - 1];

        //             // let data1 = [];
        //             // page.goto(lastElement);
        //             // var fs = require('fs');

        //             // fs.writeFile("/tmp/test", lastElement.data, function(err) {
        //             //     if(err) {
        //             //         return console.log(err);
        //             //     }
        //             //     console.log("The file was saved!");
        //             // }); 
        //             var fs = require('fs');

        //             const http = require("http");
        //             const file = fs.createWriteStream("file.docx");
        //             let data1 = [];
        //             let users;

        //             http.get(linksArray[i], response => {
        //                 let data = [];
        //                 let data1 = [];
        //                 console.log(linksArray[i]);
        //                 response.pipe(file);
        //                 // const likes = file.match(/\<meta name="description" content="(.*?)\-/i)[1];
        //                 // data1.push({ likes });
        //                 // console.log('DTA', data1)

        //                 response.on('data', chunk => {
        //                     data.push(chunk);
        //                 });
        //                 response.on('end', () => {
        //                     console.log('Response ended: ');
        //                     users = Buffer.concat(data).toString();
        //                     // console.log(i, users)                    
        //                     var fs = require('fs');
        //                     let data1 = []
        //                                         fs.readFile('./file.docx', 'utf8', function (err, data) {
        //                                             if (err) throw err;
        //                                             // console.log('OK: ' + filename);
        //                                             const likes = data.match(/\<meta name="description" content="(.*?)\-/i)[1];
        //                                             data1.push({ likes });
        //                                             console.log('DTA', data1)
        //                                         });                            //    console.log(users)
        //                 });

        //             })
        //             // // delay(30000)
        //             // const likes = users.match(/\<meta name="description" content="(.*?)\-/i)[1];
        //             // data1.push({ likes });
        //             // console.log('DTA', data1)





        //             // fs.readFile('./file.docx', 'utf8', function (err, data) {
        //             //     if (err) throw err;
        //             //     // console.log('OK: ' + filename);
        //             //     const likes = data.match(/\<meta name="description" content="(.*?)\-/i)[1];
        //             //     data1.push({ likes });
        //             //     console.log('DTA', data1)
        //             // });
        //             return linksArray;
        //         })
        //         .catch(err => {
        //             console.error(err)
        //         })

        //     // return linksArray;


        // }

        // for (let i = 0; i < linksArray.length; i++) {
        //     console.log('i');
        //     let data = [];
        //     await page.goto(linksArray[i]);
        //     const likes = document?.querySelector('meta[name="description"]')?.getAttribute('content');
        //     data.push({ likes });
        //     return data
        // }
        // searchResults = await page.$$eval(myConfig.reviewSection, (results, myConfig) => {

        //     let data = [];

        //     results.forEach(result => {

        //         const avatar = result?.querySelector('div[class="Image_image__EAuYA Image_image--responsive__0J7_0 CircleImage_circle-image__cD6fD CircleImage_circle-image--lg__wwMXc"] > span > img')?.src;
        //         if (!avatar) {
        //             avatar = 'https://st3.depositphotos.com/1767687/16607/v/450/depositphotos_166074422-stock-illustration-default-avatar-profile-icon-grey.jpg'
        //         }

        //         const author = result?.querySelector(myConfig.selectAuthor)?.innerText;

        //         let count = 0;
        //         const stars = Array.from(result?.querySelectorAll('#__next > main > div > div > div:nth-child(2) > div.InfiniteScroll_infinite-scroll__UYEgy > div > div > div.UgcBody_ugc-body__xxfbp > div > div.StarRating_star-rating__K5CF_ > div > svg > path'), element => element.getAttribute('opacity'));
        //         for (i = 0; i < stars.length; i++) {
        //             if (stars[i] == 1) {
        //                 count++
        //             }
        //         }
        //         const rating = count;

        //         const date = result?.querySelector(myConfig.selectDate)?.getAttribute('datetime');

        //         const review = result?.querySelector(myConfig.selectReview)?.innerText;

        //         const image = result?.querySelector('div[class="Image_image__EAuYA Image_image--responsive__0J7_0 Review_review__image__YnIHF"] > span > img')?.src;

        //         let productURL = window.location.href;

        //         data.push({ avatar, author, rating, date, review, image, productURL });

        //     });

        //     return data;

        // }, myConfig);

        // await browser.close();

        // const commonWords = (a, b) => {
        //     let w;
        //     let f = a.toLowerCase();
        //     let s = b.toLowerCase();
        //     let first = `${f}`.split(" ");
        //     let second = `${s}`.split(" ");
        //     let temp;

        //     if (second.length > first.length) { temp = second; second = first; first = temp; }
        //     w = first.filter(function (e) {
        //         return second.indexOf(e) > -1;
        //     });

        //     return w.sort();
        // };

        // console.log(clc.xterm(226)(`TITLE (${mySearchQuery}) : `), clc.xterm(187)(TITLE));

        // if (searchResults.length !== 0) {
        //     console.log(searchResults);
        // }

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

                console.log(clc.xterm(13)('CPU Checkpoint 3 - OVERLOAD:'), sample.percentageBusy());

                if (process.pid) {
                    console.log('This process is your pid ' + process.pid);
                }

                sleep(60000);

                process.exit();

            } else {
                console.log(clc.xterm(119)('CPU Checkpoint 3 - OKAY:'), sample.percentageBusy());
            }
        });

        // if (searchResults.length == 0) {
        //     // browser.close();
        //     console.log(clc.xterm(89)(`No data found for this product`));
        //     return 'No data found for this product'
        // }
        // // else if (commonWords(TITLE, mySearchQuery).length < 2) {
        // //     // browser.close();
        // //     console.log(clc.xterm(89)(`Results not matching the keyphrase (${TITLE} / ${mySearchQuery})`));
        // //     return 'Results not matching the keyphrase'
        // // } 
        // else {
        //     // browser.close();
        //     console.log(clc.xterm(89)(`Results Delivered (${TITLE} / ${mySearchQuery})`));
        //     return searchResults;
        // }
    }
    catch (error) {
        if (error.message.includes("net::ERR_CONNECTION_CLOSED" || "net::ERR_TIMED_OUT")) {
            console.log(clc.red(`${mySearchQuery} : CONNEXION ERROR`))
            return 'connexion error';
        }
        console.log(error);
        const browser = await puppeteer.launch({
            headless: false,
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

module.exports = { instagramSearchConfig, doSearch, searchInstagram }