var MongoClient = require('mongodb').MongoClient;
var urldb = "mongodb://localhost:27017/";

var fs = require('fs');
var fetch = require('node-fetch');
var url = require('url');
var path = require('path');
const sharp = require('sharp');

async function download(url, fileName, url2, name) {
    try {
        var headers = {
            'User-Agent': 'CoolToolName/0.0 (https://example.org/cool-tool/; cool-tool@example.org) used-base-library/0.0'
        }
        var response = await fetch(url, { method: 'GET', headers: headers });
        if (response.headers.get('content-type').includes('text/html')) {
            var buffer = await response.buffer();
            fs.writeFile(fileName + '_' + '+url', buffer, () => {
            });
            response = await fetch(url2, { method: 'GET', headers: headers });
        }
        if (response.headers.get('content-type').includes('text/html')) {
            var buffer = await response.buffer();
            fs.writeFile(fileName + '_' + 'url2', buffer, () => {
            });
            throw new Error('Не картинка');
        }
        var buffer = await response.buffer();

        fs.writeFile(fileName, buffer, () => {
            sharp(fileName)
                .resize(290)
                .toFile(fileName.split('.').slice(0, -1).join('.') + '_290.jpg', function (err) {
                });
        });
    } catch (error) {
        console.log(url);
        console.log(url2);
        console.log(fileName);
        console.log(error);
    }
}

function loadImages(collName, imgUrlFieldName) {
    MongoClient.connect(urldb, function (err, db) {
        if (err) throw err;
        var dbo = db.db("app");
        dbo.collection(collName).find({}).toArray(function (err, result) {
            if (err) throw err;
            result.forEach(function (item) {

                for (let index = 0; index <= 5; index++) {
                    let iUFN;
                    if (index > 0) {
                        iUFN = imgUrlFieldName + '_' + index;
                    }
                    else {
                        iUFN = imgUrlFieldName;
                    }

                    if (item.hasOwnProperty(iUFN)) {
                        if (item[iUFN].trim() !== '') {
                            var parsed = url.parse(item[iUFN].trim());
                            if (path.extname(parsed.pathname) == '') {
                            }
                            let pu;
                            if(index > 0){
                               pu = item.pageUrl + '_' + index
                            }else{
                                pu = item.pageUrl;
                            }
                            download(encodeURI(item[iUFN]), '.\\public\\images\\' + collName + '\\' + pu + '.jpg', item[iUFN].trim(), item.name);
                        }
                        else {
                            console.log('Not image url to ' + item.name);
                        }
                    }
                    {
                        console.log('Not item.hasOwnProperty(iUFN) - ' + item.name);
                    }
                }
            })
            db.close();
        });
    });
}

loadImages('temples','imgUrl');
//loadImages('personsreligions', 'photoUrl');