const express = require('express');
const app = express();
const port = 50051;

const session = require('express-session');
var memoryStore = new session.MemoryStore();

var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

let cors = require('cors');

const clientApi = require('./getReviews');

try {

    app.use("/api", clientApi);

} catch (err) {
    console.error(`Error connecting to API - ${err}`);
}

app.listen(port, function () {
    console.log(`Example app listening on port ${port}!`)
})

