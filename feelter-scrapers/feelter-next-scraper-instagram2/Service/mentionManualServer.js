const axios = require("axios");
const TEST = false; // prevent send of reviews to the server.
const manualMentionInsertionServiceAPI = "https://us-central1-feelmi-969.cloudfunctions.net/ManualMentionInsertion";
//const manualMentionInsertionServiceAPI = "http://localhost:5050/bulk";

let sendReviewsBulk = async (
  keyPhraseData,
  reviewList,
  performRecompute = false
) => {
 
  console.log(reviewList);
 // console.log(keyPhraseData);
  if (TEST) {
    return { mock_data: `Mock sending reviews # ${reviewList.length}` };
  }
  console.log(`sending bulk reviews`);
 
  return await axios
    .post(manualMentionInsertionServiceAPI, {
      keyPhraseData,
      reviews: reviewList,
      performRecompute,
    })
    .then((response) => {
    //  console.log(repsonse)
      return { data: response?.data };
    })
    .catch((error) => {
      console.error(error)
      return { error };
    });
};

module.exports = { sendReviewsBulk };