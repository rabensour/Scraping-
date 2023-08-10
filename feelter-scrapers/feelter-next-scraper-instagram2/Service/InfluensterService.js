const { parseDate } = require("chrono-node");
const { promisify } = require("util");
const { WTSQS } = require('wtsqs');
const { sendReviewsBulk } = require('./mentionManualServer');
const { getDataFromInfluensterServer } = require('./InfluensterScraper');
const chrono = require('chrono-node');
const fs = require('fs');

let opertaionInterval = 30000;

const consQueueUrl = "https://sqs.us-west-2.amazonaws.com/001431519265/InfluensterKeyPhrases.fifo";

const wtsqsCons = new WTSQS({
  url: consQueueUrl,
  accessKeyId: 'AKIAQAVKTIAQ3DEWU4DA',
  secretAccessKey: '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',
  region: 'us-west-2',
  defaultMessageGroupId: 'Influenster',
});

const BATCH_SIZE = 30;

let formatReview = (keyPhraseData, newReviewStructure) => {
  var result = {
    Phrase: keyPhraseData.Phrase,
    // Avatar: newReviewStructure?.user_image_url,
    KeyPhraseID: keyPhraseData?.ID,
    SourceID: keyPhraseData?.SourceID,
    Posted: newReviewStructure?.post_date,
    UserName: newReviewStructure?.username,
    Text: newReviewStructure?.content,
    // Image: newReviewStructure?.video_url ? newReviewStructure?.video_url : newReviewStructure?.image_url,
     Image:  newReviewStructure?.image_url,
    //  Title: newReviewStructure?.title,
    SourceURL: "https://www.drizly.com/",
    SearchTerm: "https://www.drizly.com/",
    Likes: newReviewStructure?.rating,
    Dislikes: 0,
  };
  return result;
};

let getCurrentDateTIme = () => {
  var curr = new Date().toString();
  curr = curr.replace(" GMT+0000 (Coordinated Universal Time)", '');
  curr = curr.replace(" GMT+0200 (Israel Standard Time)", '');
  return curr
}


let doSearch = function (searchQueries) {
  return new Promise((resolve) => {
    resolve(searchSource(searchQueries));
  });
};

let searchSource = async (searchQuery) => {
  try {
    let mentionModel = [];
    let retires = 2;
    let rawData;
    let dataJson;

    while ((!rawData || !rawData.data || rawData.data == '{"err":{}}' || rawData.data == 'No data found for this Keyword') && retires != 0) {
      rawData = await getDataFromInfluensterServer(searchQuery);
      retires--;
    }

    if (rawData.error == true) {
      console.log("Received an error", rawData.msg);
      return;
    }

    if (!rawData || !rawData.data || rawData.data == '{"err":{}}' || rawData.data == '"No data found for this Keyword"') {
      console.log("Didn't recieve data from Fragantica api");
      return;
    }
    try {
      console.log('RAWDATA', rawData)
      dataJson = JSON.parse(rawData.data);

    }
    catch (error) {
      console.log("Coudn't parse raw data to json.", error);
      return;
    }

    if (!dataJson) {
      console.log("Coudn't parse raw data to json.", dataJson);
      return;
    }
    // for (i=0;i<dataJson.length;i++) {
    dataJson.forEach((result) => {
      //  result.date = new Date();
      if (!(result.date == null || result.date == undefined)) {

        const username = result.author;
        const profile = result.profile;
        const rating = result.rating;
        const likes = result.likes;
        const post_date = result.date;
        const city = result.city;
        const content = result.review;
        const image_url = result.reviewImg;

        mentionModel.push({
          username: username,
          profile: profile,
          rating: rating,
          likes: likes,
          post_date: post_date,
          city: city,
          content: content,
          image_url: image_url,
        });
      }
    });
    // console.log(dataJson[0]);
    //converting posted date:
    for (let i = 0; i < mentionModel.length; i++) {
      mentionModel[i].post_date = parseDate(mentionModel[i].post_date)
        .toLocaleString();

    }
    //console.log(mentionModel)
    //console.log(mentionModel);
    return mentionModel;
  } catch (error) {
    console.log(error + ` ---  ${getCurrentDateTIme()}`);
  }
};

let sleep = function (ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

let resShow = async function (keyPhraseData) {
  try {
    keyPhraseData.SourceID = '122';
    console.log("Start research for keyPhrase: " + keyPhraseData.Phrase + ` ---  ${getCurrentDateTIme()}`);
    var reviews = await doSearch(keyPhraseData.Phrase);

    if (!reviews) {
      // lets try again just in case...
      await sleep(3000);
      reviews = await doSearch(keyPhraseData.Phrase);
    }
    if (!reviews) {
      console.log("Done research for key:", keyPhraseData.Phrase + ` - No mentions ---  ${getCurrentDateTIme()}`);
      // await sleep(20000);
      // startOperation();
      return;
    }

    if (reviews.length == 0) {
      console.log("Received 0 reviews.");
      console.log("Done research for key:", keyPhraseData.Phrase + ` ---  ${getCurrentDateTIme()}`);
      return;
    }

    let batchCounter = 0;
    let reviewsInOldFormat = [];
    let tasksIds = [];
    console.log("Start formating raw data. " + reviews.length);
    for (i = 0; i < reviews.length; i++) {
      if (i == 0) console.log(reviews[i]);
      if (reviews[i].review != "" || reviews[i].image_url) {

        let formattedReview = formatReview(keyPhraseData, reviews[i]);
        batchCounter++;
        reviewsInOldFormat.push(formattedReview);
      }
      if (batchCounter >= BATCH_SIZE) {
        tasksIds.push(await sendReviewsBulk(keyPhraseData, reviewsInOldFormat));
        reviewsInOldFormat = [];
        batchCounter = 0;
      }
    }


    //there are remainder of reviews num % BATCH_SIZE leftover reviews
    if (reviewsInOldFormat.length > 0) {
      tasksIds.push(
        await sendReviewsBulk(keyPhraseData, reviewsInOldFormat, true)
      ); //send last batch of reviews
    }
  } catch (error) {
    console.log(error);
  }
  console.log("Done research for key:", keyPhraseData.Phrase + ` ---  ${getCurrentDateTIme()}`);
  // await sleep(180000);
  // await startOperation();
};

resShow = promisify(resShow);

async function startOperation() {
  await new Promise(resolve => setTimeout(resolve, 500));
  let retires = 2;

  // let instagramQueue = JSON.parse(await fs.readFileSync("./queues/instQueue.json", 'utf8'));
  // let influensterQueue = JSON.parse(await fs.readFileSync("./queues/infQueue.json", 'utf8'));

  try {
    // let queueSize = await wtsqsCons.size();
    // if (queueSize == 0) {
    //   console.log("Fragantica keyPhrase queue is empty." + ` ---  ${getCurrentDateTIme()}`);
    //   return;
    // }

    // let sqsMessage = await wtsqsCons.popOne();

    // while (retires != 0 && (!sqsMessage || !sqsMessage.body)) {
    //   sqsMessage = await wtsqsCons.popOne();
    //   retires--;
    // }

    // if (!sqsMessage || !sqsMessage.body) {
    //   console.log("Failed to receive data from queue." + ` ---  ${getCurrentDateTIme()}`);
    //   return;
    // }
    //await resShow(sqsMessage.body);

    let influensterQueue = JSON.parse(await fs.readFileSync("./InfluensterQueue.json", 'utf8'));
    let currMessage = influensterQueue.pop();
    await fs.writeFileSync("./InfluensterQueue.json", JSON.stringify(influensterQueue));
    await resShow(currMessage);


  } catch (e) {
    console.log(e);
  }
}

startOperation();

setInterval(startOperation, opertaionInterval);

module.exports = { doSearch, searchSource };