var fs = require('fs');
let data1 = []
                    fs.readFile('./file.docx', 'utf8', function (err, data) {
                        if (err) throw err;
                        // console.log('OK: ' + filename);
                        const likes = data.match(/\<meta name="description" content="(.*?)\-/i)[1];
                        data1.push({ likes });
                        console.log('DTA', data1)
                    });