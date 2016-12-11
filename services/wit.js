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
		var reqItems=firstEntityValue(entities,"reqItems");
		var reqName = firstEntityValue(entities,"reqName");
		//var pingUrl="https://graph.facebook.com/v2.6/"+context._fbid_+"?access_token="+Config.FB_PAGE_TOKEN;
		//request(pingUrl,function(error, response, body){
		//	console.log(body)
		//});

		if(reqName){
			context.reqName=reqName;
		}
		if(reqItems){
			context.reqItems=reqItems.split(",");

		}

		if(item){
			context.item=item;
		}
		if(productQuantity){
			context.productQuantity=productQuantity;
		}else{
			context.productQuantity=0;
		}
		if(!context.familyMembers){
			var pingUrl="https://graph.facebook.com/v2.6/"+context._fbid_+"?access_token="+Config.FB_PAGE_TOKEN;
			request(pingUrl,function(error, response, body){
				//console.log(body)
				context.familyMembers=[];
				var result=JSON.parse(body)
				var fname=result.first_name+"";
				fname=fname.toLowerCase();
				context.familyMembers.push({name:fname,fbid:context._fbid_});
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
		var url="http://192.52.166.93:3000/add/"+context._fbid_+"/"+context.item+"/"+context.productQuantity;
		var params={userId:context._fbid_,itemName:context.item,quantity:context.productQuantity};
		var contentLength = params.length;
		request(url,function(err,httpResponse,body){
			console.log("addToList");
			console.log("err "+err);
			console.log("httpResponse "+httpResponse);
			console.log("body "+body);
			var result=JSON.parse(body);


			//context.mallName="mantri"+context.lat+context.long;
			FB.newMessage(context._fbid_,context.productQuantity+" "+context.item+" added");



		});
			context.itemsList=" ";
			//FB.newMessage(context._fbid_,context.productQuantity+" "+context.item+" added. The list is " +context.itemsList);
		cb(context);
	},['getMall'](sessionId,context,cb){
		//console.log(entities);
		var url="http://192.52.166.93:3000/next/"+context._fbid_;
		var params={userId:context._fbid_};

		request(url,function(err,httpResponse,body){
			console.log("addToList");
			console.log("err "+err);
			console.log("httpResponse "+httpResponse);
			console.log("body "+body);
			var result=JSON.parse(body);
			var value=result.value;

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
			context.mallName="mantri"+context.lat+context.long;
			FB.newMessage(context._fbid_,"the first item",atts);



		});
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
		context.itemsList="bread,butter,bun";
		FB.newMessage(context._fbid_, context.listProducts+" is the list")
		cb(context);
	},['familyAddToList'](sessionId,context,cb){
		var fam=context.familyMembers;
		console.log(context.familyMembers);

		for(var i=0;i<fam.length;i++){
			if(context.familyMembers[i].fbid!=context._fbid_)
			{
				FB.newMessage(context.familyMembers[i].fbid,context.familyMembers[0].name+" has asked if you want to add any items to shopping list");
				FB.newMessage(context.familyMembers[i].fbid,"reply by saying "+context.familyMembers[0].name+" deo,eggs,olive oil");

			}

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
	},['addItemsToReqList'](sessionId,context,cb){
		var url;
		//request.post(url,{form:{userId:context._fbid_,itemName:context.item,quantity:context.productQuantity}},function(err,httpResponse,body){
		//	console.log("addItem");
		//	console.log("err "+err);
		//	console.log("httpResponse "+httpResponse);
		//	console.log("body "+body);
		//
		//});
		context.itemsList="bread,butter,bun";
		FB.newMessage(context._fbid_,context.reqItems+" added to "+context.reqName+"'s list. The list is " +JSON.stringify(context.itemsList));

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


