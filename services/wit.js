'use strict'

var Config = require('../config')
var FB = require('../connectors/facebook')
var Wit = require('node-wit').Wit
var request = require('request')


var firstEntityValue = function (entities, entity) {
	var val = entities && entities[entity] &&
		Array.isArray(entities[entity]) &&
		entities[entity].length > 0 &&
		entities[entity][0].value

	if (!val) {
		return null
	}
	return typeof val === 'object' ? val.value : val
}


var actions = {
	say (sessionId, context, message, cb) {
		// Bot testing mode, run cb() and return
		if (require.main === module) {
			cb()
			return
		}

		console.log('WIT WANTS TO TALK TO:', context._fbid_)
		console.log('WIT HAS SOMETHING TO SAY:', message)
		console.log('WIT HAS A CONTEXT:', context)
		//console.log("your fb id is "+context._fbid_);
		FB.newMessage(context._fbid_, message)
		//if (checkURL(message)) {
		//	FB.newMessage(context._fbid_, message, true)
		//} else {
		//
		//}


		cb()

	},

	merge(sessionId, context, entities, message, cb) {

		var lat = firstEntityValue(entities,"lat");
		var long = firstEntityValue(entities,"long");
		var productName=firstEntityValue(entities,"productName");
		var storeName=firstEntityValue(entities,"storeName");
		var listItems=firstEntityValue(entities,"listItems");
		console.log("the list got "+listItems);
		if(listItems){
			context.listItems=listItems.split(",");
			console.log("the array is")
			console.log(listItems);
		}


		if(lat){
			context.lat=lat;
		}
		if(long){
			context.long=long;
		}
		if(productName){
			context.long=productName;
		}
		if(storeName){
			context.storeName=storeName;
		}

		cb(context)
	},

	error(sessionId, context, error) {
		console.log(error.message)
	},['getMall'](sessionId,context,cb){
		//console.log(entities);
		context.mallName="mantri"+context.lat+context.long;
		FB.newMessage(context._fbid_, context.mallName)
		cb(context);

	},['findProduct'](sessionId,context,cb){
		context.stores=["spar","bata","mcd"];
		var atts= {
			"attachment": {
				"type": "template",
				"payload": {
					"template_type": "generic",
					"elements": [{
						"title": "First card",
						"subtitle": "Element #1 of an hscroll",
						"image_url": "http://messengerdemo.parseapp.com/img/rift.png",
						"buttons": [{
							"type": "web_url",
							"url": "https://www.messenger.com",
							"title": "web url"
						}, {
							"type": "postback",
							"title": "Postback",
							"payload": "Payload for first element in a generic bubble",
						}],
					}, {
						"title": "Second card",
						"subtitle": "Element #2 of an hscroll",
						"image_url": "http://messengerdemo.parseapp.com/img/gearvr.png",
						"buttons": [{
							"type": "postback",
							"title": "Postback",
							"payload": "Payload for second element in a generic bubble",
						}],
					}]
				}
			}
		};
		FB.newMessage(context._fbid_, context.mallName,atts);
		cb(context);
	},
	['findStore'](sessionId,context,cb){
		context.storeLocation=context.storeName+" location";
		FB.newMessage(context._fbid_, "its present in "+context.storeLocation);
		cb(context);
	},['getDeals'](sessionId,context,cb){
		context.dealsResult=["","","",""];
		cb(context);
	},['addToList'](sessionId,context,cb){
		context.listProducts=context.listItems;
		console.log(context.listProducts);

		//FB.newMessage(context._fbid_,context.listProducts+"" );
		cb(context);
	},['showList'](sessionId,context,cb){

		context.listProducts="blah blah blah"+context._fbid_;
		cb(context);
	},['familyAddToList'](sessionId,context,cb){

		cb(context);
	},['addFamMembers'](sessionId,context,cb){
		cb(context);
	}
}

// SETUP THE WIT.AI SERVICE
var getWit = function () {
	console.log('GRABBING WIT')
	return new Wit(Config.WIT_TOKEN, actions)
}

module.exports = {
	getWit: getWit,
}

// BOT TESTING MODE
if (require.main === module) {
	console.log('Bot testing mode!')
	var client = getWit()
	client.interactive()
}


