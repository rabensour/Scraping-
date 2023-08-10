const express = require('express');
const router = express.Router();
const session = require('express-session');
var memoryStore = new session.MemoryStore();

var instagramSearch = require('./Scraper');

let configuration = instagramSearch.instagramSearchConfig;
// console.log(configuration);

router.get(`/getInstagramReviews`, async (request, response) => {
    let myKeyword = request.query.keyword;
    console.log('Keyword', myKeyword)
    let ret;
    try {
        ret = await instagramSearch.doSearch(`${myKeyword}`, configuration)
        response.json(ret)
    } catch (err) {
        ret = { err };
        console.log(err)
    }
});

module.exports = router;
