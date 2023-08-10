const express = require('express');
const router = express.Router();
const session = require('express-session');
var memoryStore = new session.MemoryStore();

var makeupalleySearch = require('./Scraper');

let configuration = makeupalleySearch.makeupalleySearchConfig;
// console.log(configuration);

router.get(`/getMakeupalleyReviews`, async (request, response) => {
    let myKeyword = request.query.keyword;
    console.log('Keyword', myKeyword)
    let ret;
    try {
        ret = await makeupalleySearch.doSearch(`${myKeyword}`, configuration)
        response.json(ret)
    } catch (err) {
        ret = { err };
        console.log(err)
    }
});

module.exports = router;
