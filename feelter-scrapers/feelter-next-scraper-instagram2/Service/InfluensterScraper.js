const { request } = require("http");

const caScraperApiPath = "/api/getInfluensterReviews?keyword=";
const options = {
    hostname: "localhost",//"localhost" 
      port: 50051,
      path: "/api/getInfluensterReviews?keyword=",
      method: "GET",
      Headers: {
          Accept: "*/*",
          "Accept-Encoding": "gzip, deflate, br",
          Connection: "keep-alive",
          "Content-Type": "application/json",
      },
  } 


async function getDataFromInfluensterServer(Phrase) {
    try {
        let data = "";
        options.path = `${caScraperApiPath}${Phrase.replace(/ /g, '%20')}`; // replace spaces with %20.
        console.log(data);
        const posturlArraypromise = new Promise((resolve) => {
            console.log("sending request to Influenster scraper...");

            const req = request(options, (res) => {
                console.log(`statusCode: ${res.statusCode}`);
                res.on("data", (chunk) => {
                    
                    data += chunk;
                });

                res.on("end", () => {
                    resolve(data);
                });
            });
            req.on("error", (error) => {
                console.error(error);
            });
            req.end();
        });

        return posturlArraypromise.then((val) => {
            return {
                success: true,
                error: false,
                msg: "Data fetched from Influenster API",
                data: val,
            };
        });
        return posturlArraypromise.error((error) => {
            return {
                success: false,
                error: falstruee,
                msg: error,
                data: error,
            };
        });
    } catch (error) {
        console.log(error);
        return null;
    }
};


module.exports = { getDataFromInfluensterServer };