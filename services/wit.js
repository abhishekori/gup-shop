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


		if(lat){
			context.lat=lat;
		}
		if(long){
			context.long=long;
		}
		if(productName){
			context.long=productName;
		}

		cb(context)
	},

	error(sessionId, context, error) {
		console.log(error.message)
	},
	['locateItem'](sessionId,context,cb){

		cb(context)
	},['getMall'](sessionId,context,cb){
		//console.log(entities);
		context.mallName="mantri"+context.lat+context.long;
		FB.newMessage(context._fbid_, context.mallName)
		cb(context);

	},['findProduct'](sessionId,context,cb){
		context.stores=["spar","bata","mcd"];
		FB.newMessage(context._fbid_, context.mallName,true);
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


