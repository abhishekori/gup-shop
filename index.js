var express = require('express')
var bodyParser = require('body-parser')
var request = require('request')

var Config = require('./config')
var FB = require('./connectors/facebook')
var Bot = require('./bot')

var app = express();

app.get("/",function(req,res){
	res.send("your app is running");
});
app.get('/webhooks', function (req, res) {
    if (req.query['hub.verify_token'] === "gupshop") {
        res.send(req.query['hub.challenge'])
    }
    res.send('Error, wrong token')
});

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

                console.log("lat: "+data[0].payload.coordinates.lat);
                console.log("long: "+data[0].payload.coordinates.long);
            }
            if(data[0].type=="image"){
                console.log("img url: "+data[0].payload.url);
            }

            FB.newMessage(entry.sender.id, "That's interesting!")
        } else {
            // SEND TO BOT FOR PROCESSING
            //Bot.read(entry.sender.id, entry.message.text, function (sender, reply) {
            //    FB.newMessage(sender, reply)
            //})
            FB.newMessage(sender, "your message "+entry.message.text);
        }
    }

    res.sendStatus(200)
})

app.set('port', (process.env.PORT) || 5000)
// SPIN UP SERVER
app.listen(app.get('port'), function () {

  console.log('Running on port', app.get('port'))
})
