'use strict';

const WIT_TOKEN = "ZGBRX5J4O45SWKNHECCWD2DYO6ALFG5I";
if (!WIT_TOKEN) {
  throw new Error('Missing WIT_TOKEN. Go to https://wit.ai/docs/quickstart to get one.')
}


var FB_PAGE_TOKEN = "EAAFcEJsjavEBACKjPktHJxW1TjzaEBCVDe23DDdf6ZA7tQ1X7Mlg28OqzNsG6ZCPbKPFtZCOrb0NXM866CBhUAhhSQhrHdAi46Dcapz7oYTi8arEy4xBEWlXHoovo7TKx3LcV4mCSCzuy6ZCcP9wblZBrYK0oAyKnPzNbA1XUXAZDZD";

if (!FB_PAGE_TOKEN) {
	throw new Error('Missing FB_PAGE_TOKEN. Go to https://developers.facebook.com/docs/pages/access-tokens to get one.')
}

var FB_VERIFY_TOKEN = 'gupshop'

module.exports = {
  WIT_TOKEN: WIT_TOKEN,
  FB_PAGE_TOKEN: FB_PAGE_TOKEN,
  FB_VERIFY_TOKEN: FB_VERIFY_TOKEN,
}