'use strict';
module.change_code = 1;
var _ = require('lodash')
var Alexa = require('alexa-app');
var app = new Alexa.app('book_event');
var BookingManager = require('./bookingmanager')

app.launch(function(req, res) {
  var prompt = 'To start, please say create booking'
  res.say(prompt).reprompt(prompt).shouldEndSession(false);
});

module.exports = app;
