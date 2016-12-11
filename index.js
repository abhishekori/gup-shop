'use strict'

var express = require('express')
var bodyParser = require('body-parser')
var request = require('request')

var Config = require('./config')
var FB = require('./connectors/facebook')
var Bot = require('./bot')


// LETS MAKE A SERVER!
var app = express()
app.set('port', (process.env.PORT) || 5000)
// SPIN UP SERVER
app.listen(app.get('port'), function () {

  console.log('Running on port', app.get('port'))
})
// PARSE THE BODY
app.use(bodyParser.json())


// index page
app.get('/', function (req, res) {
  res.send('hello world i am a chat bot')
})

// for facebook to verify
app.get('/webhooks', function (req, res) {
  if (req.query['hub.verify_token'] === Config.FB_VERIFY_TOKEN) {
    res.send(req.query['hub.challenge'])
  }
  res.send('Error, wrong token')
})

// to send messages to facebook
app.post('/webhooks', function (req, res) {
  var entry = FB.getMessageEntry(req.body)
  // IS THE ENTRY A VALID MESSAGE?
  let messaging_events = req.body.entry[0].messaging[0];
  console.log("messaging events "+messaging_events);

  if(messaging_events.postback){

    console.log(JSON.stringify(messaging_events.postback));
      var url;
    var params={};
    if(messaging_events.postback.payload=="USER_DEFINED_PAYLOAD"){

      FB.newMessage(entry.sender.id,"Hi I am GupShop your daily grocery and super market assistant");
      FB.newMessage(entry.sender.id,"I can prepare your shopping list. Just say add 3 banana");
      FB.newMessage(entry.sender.id,"once you are done with preparing the list just head to your local super market and send me your current location");
      FB.newMessage(entry.sender.id,"I will identify the mall and show you all the items in your shopping list of their exact place and calculate your total");
    }
    if(messaging_events.postback.payload=="done"){
      url="http://192.52.166.93:3000/next/"+entry.sender.id;
      //FB.newMessage(entry.sender.id,"next item");
      params={userId:entry.sender.id};
    }else{
      url="http://192.52.166.93:3000/product";
      params={key:messaging_events.postback.payload};
      //FB.newMessage(entry.sender.id,"more abu");
    }

    request(url,function(err,httpResponse,body){
      console.log("addToList");
      console.log("err "+err);
      console.log("httpResponse "+httpResponse);
      console.log("body "+body);
      var result=JSON.parse(body);
      var value=result.value;
      if(result.status=="End")
      {
        FB.newMessage(entry.sender.id,"you have bought all the items the total cost is "+value.total+" Rs");

      }else{
        var atts= {
          "attachment": {
            "type": "template",
            "payload": {
              "template_type": "generic",
              "elements": [{
                "title": value.name,
                "subtitle": value.hrl,
                "image_url": value.img,
                "buttons": [{
                  "type": "postback",
                  "title": "done",
                  "payload": "done",
                }],
              }]
            }
          }
        };
        FB.newMessage(entry.sender.id,"the first item",atts);



      }
            });

  }
  if (entry && entry.message) {

    if (entry.message.attachments) {
      // NOT SMART ENOUGH FOR ATTACHMENTS YET

      var data =entry.message.attachments;

      if(data[0].type=='location')
      {
        var lat=data[0].payload.coordinates.lat;
        var long=data[0].payload.coordinates.long;

        console.log("lat: "+data[0].payload.coordinates.lat);
        console.log("long: "+data[0].payload.coordinates.long);
        console.log(lat+","+long);
        Bot.read(entry.sender.id, lat+" "+long, function (sender, reply) {
          FB.newMessage(sender, reply)
        })
      }
      if(data[0].type=="image"){

        console.log("img url: "+data[0].payload.url);


        //request('https://api.qrserver.com/v1/read-qr-code/?fileurl='+data[0].payload.url, function (error, response, body) {
        //  if (!error && response.statusCode == 200) {
        //    console.log(body) // Show the HTML for the Google homepage.
        //    FB.newMessage(entry.sender.id, body)
        //  }
        //},function(){
        //
        //});

      }

      //FB.newMessage(entry.sender.id, "That's interesting!")
    } else {
      // SEND TO BOT FOR PROCESSING
      Bot.read(entry.sender.id, entry.message.text, function (sender, reply) {
        FB.newMessage(sender, reply)
      })
    // FB.newMessage(entry.sender.id, entry.message.text)
    }
  }

  res.sendStatus(200)
})