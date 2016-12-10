'use strict';

const WIT_TOKEN = "ZGBRX5J4O45SWKNHECCWD2DYO6ALFG5I";
if (!WIT_TOKEN) {
  throw new Error('Missing WIT_TOKEN. Go to https://wit.ai/docs/quickstart to get one.')
}


var FB_PAGE_TOKEN = "EAAFcEJsjavEBAHxbSlisdVOGX08RNf5l4fEeQZANo24QkWmJS751M3X3NZA8IPj84ymiazDGyIPrMLZAgrIjMe2lMk3ZBzAr6ZBI00YBweMacQL8hwFDZAiBfDrO2dg13BfYZCYCZB9ZC19n1dsE97kt5X3MYsrx8uNc7tZC4Xiq399wZDZD";

if (!FB_PAGE_TOKEN) {
	throw new Error('Missing FB_PAGE_TOKEN. Go to https://developers.facebook.com/docs/pages/access-tokens to get one.')
}

var FB_VERIFY_TOKEN = 'gupshop'

module.exports = {
  WIT_TOKEN: WIT_TOKEN,
  FB_PAGE_TOKEN: FB_PAGE_TOKEN,
  FB_VERIFY_TOKEN: FB_VERIFY_TOKEN,
}