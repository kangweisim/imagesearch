var mongo = require('mongodb').MongoClient;
var dbURI = "mongodb://admin:freecodecamp@ds147454.mlab.com:47454/freecodecamp"

var express = require('express');
var app = express();
var https = require('https');
var gapi = "https://www.googleapis.com/customsearch/v1?key=AIzaSyDqg5-l5x7nhvkBwYHYHbapyDuO6KGqf0U&cx=016134960534850683544:a6jpppanzie";

app.get('/api/imagesearch/:query', (req, res) => {
  var query = req.params.query;
  var offset = req.query.offset;
  var url = gapi + "&q=" + query;
  var db;
  mongo.connect(dbURI).then((database) => {
    database.collection('imagesearch').insert({
      term: query,
      when: (new Date()).toJSON()
    }).catch(console.error);
    database.close();
  });
  if(offset) url += "&start=" + parseInt(offset*10);
  url += "&searchType=image";
  https.get(url, (response) => {
    response.setEncoding("utf8");
    let body = "";
    response.on("data", (data) => {
      body += data;
    });
    response.on("end", () => {
      body = JSON.parse(body);
      var items = body.items;
      items = items.map((item) => {
        console.log(item);
        return {
          url: item.link,
          snippet: item.snippet,
          thumbnail: item.image.thumbnailLink,
          context: item.image.contextLink
        };
      });
      res.end(JSON.stringify(items));
    });
  });
});

app.get('/api/latest/imagesearch', (req, res) => {
  var db;
  mongo.connect(dbURI).then((database) => {
    db = database;
    return database.collection('imagesearch').find({}, {term:1, when:1, _id:0}).sort({_id:-1}).limit(10).toArray();
  }).then((data) => {
    db.close();
    res.end(JSON.stringify(data));
  }).catch(console.error);
});

app.listen(3000, () => {
  console.log("Node.js is listening...");
});
