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
        //    FB.newMessage(sender, body)
        //  }
        //})

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