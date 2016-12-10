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


		cb()

	},

	merge(sessionId, context, entities, message, cb) {

		var lat = firstEntityValue(entities,"lat");
		var long = firstEntityValue(entities,"long");
		var productName=firstEntityValue(entities,"productName");
		var storeName=firstEntityValue(entities,"storeName");
		var listItems=firstEntityValue(entities,"listItems");
		var quantity=firstEntityValue(entities,"quantity");
		var item = firstEntityValue(entities,"item");
		var productQuantity = firstEntityValue(entities,"productQuantity");
		var name=firstEntityValue(entities,"name");
		var fbId = firstEntityValue(entities,"fbId");
		//var pingUrl="https://graph.facebook.com/v2.6/"+context._fbid_+"?access_token="+Config.FB_PAGE_TOKEN;
		//request(pingUrl,function(error, response, body){
		//	console.log(body)
		//});

		if(item){
			context.item=item;
		}
		if(productQuantity){
			context.productQuantity=productQuantity;
		}
		if(context.familyMembers==null){
			var pingUrl="https://graph.facebook.com/v2.6/"+context._fbid_+"?access_token="+Config.FB_PAGE_TOKEN;
			request(pingUrl,function(error, response, body){
				//console.log(body)
				context.familyMembers=[{name:body.first_name,fbid:context._fbid_}];
			});

		}
		if(name){
			context.name=name;
		}
		if(fbId){
			context.fbid=fbId;
		}
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
		if(listItems){
			context.listItems=listItems;
		}


		cb(context)
	},

	error(sessionId, context, error) {
		console.log(error.message)
	},['addItem'](sessionId,context,cb){
		var url;
		//request.post(url,{form:{item:context.item}},function(err,httpResponse,body){
		//	console.log("addItem");
		//	console.log("err "+err);
		//	console.log("httpResponse "+httpResponse);
		//	console.log("body "+body);
        //
		//});
		context.listProducts="bread,butter,bun";
		FB.newMessage(context._fbid_,context.productQuantity+" "+context.item+" added. The list is " +context.listProducts);
		cb(context);
	},['getMall'](sessionId,context,cb){
		//console.log(entities);
		var url;
		//request(url, function (error, response, body) {
		//	if (!error && response.statusCode == 200) {
		//		console.log(body) // Show the HTML for the Google homepage.
        //
		//	}
		//})
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
							"type": "postback",
							"title": "done",
							"payload": 1,
						},{
							type:"postback",
							"title":"skip",
							payload:0
						}],
					}]
				}
			}
		};
		context.mallName="mantri"+context.lat+context.long;
		FB.newMessage(context._fbid_,"the first item",atts);
		//FB.newMessage(context._fbid_,"please send the quantity you picked up i ll update your ");
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
							"type": "postback",
							"title": "Postback",
							"payload": "Payload for first element in a generic bubble",
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
		var url;
		 request.post(url,{form:{list:context.listProducts}},function(err,httpResponse,body){
			 console.log("addToList");
			 console.log("err "+err);
			 console.log("httpResponse "+httpResponse);
			 console.log("body "+body);

		 });
		console.log(context.listProducts);

		//FB.newMessage(context._fbid_,context.listProducts+"" );
		cb(context);
	},['showList'](sessionId,context,cb){

		//context.listProducts="blah blah blah"+context._fbid_;
		context.listProducts="bread,butter,bun";
		FB.newMessage(context._fbid_, context.listProducts+" is the list")
		cb(context);
	},['familyAddToList'](sessionId,context,cb){

		for(var i=0;i<context.familyMembers.length;i++){
			FB.newMessage(context._fbid_,"")
		}

		cb(context);
	},['addFamMembers'](sessionId,context,cb){
			context.familyMembers.push({name:context.name,fbid:context.fbid});
		console.log(context.familyMembers);
		cb(context);
	},['getId'](sessionId,context,cb){
		context.meid=context._fbid_;
		cb(context);
	},['removeAllFam'](sessionId,context,cb){
		context.familyMembers=[];
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


