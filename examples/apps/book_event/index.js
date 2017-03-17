'use strict';
module.change_code = 1;
var _ = require('lodash')
var Alexa = require('alexa-app');
var app = new Alexa.app('book_event');
var fs = require('fs');
var bookings = JSON.parse(fs.readFileSync('./apps/book_event/bookings.json', 'utf8'));
// var bookings = JSON.parse(fs.readFileSync('./bookings.json', 'utf8'));

app.launch(function(req, res) {
  var prompt = 'Welcome to Makers Room<break time="1s"/>' + 'You can check out any time you like, but you can never leave';
  res.say(prompt).reprompt(prompt).shouldEndSession(false);
});

app.intent('BookIntent', {
  'slots': {
    'NAME': 'LIST_OF_ROOMS'
  },
  'utterances': ['{call this booking} {something|NAME}']
},
  function(req, res) {
    var room = req.slot('NAME');
    res.say('Booking name is ' + room).shouldEndSession(false);
    return true;
});

var cancelIntentFunction = function(req, res) {
  res.say('Sayonara!').shouldEndSession(true);
};
app.intent('AMAZON.CancelIntent', {}, cancelIntentFunction);
app.intent('AMAZON.StopIntent', {}, cancelIntentFunction);

app.intent('ReadIntent', {
  'utterances': ['{what is on|what\'s on}']
},
  function (req, res) {
    bookings.Items.forEach(function(item){
      res.say('At ' + item.StartTime + ' <break time="0.5s"/> ' + item.Owner + ' booked ' + item.RoomName + ' for ' + item.Name + ' for ' + item.Duration + ' <break time="1s"/>').shouldEndSession(false);
    });
    return true;
}
);

app.intent('GetByTimeIntent', {
  'slots': {
    'TIME': 'AMAZON.TIME'
  },
  'utterances': ['{what is on at|what\'s on at } {TIME}']
},
  function (req, res) {
    var time = req.slot('TIME');
    var timeCheck = bookings.Items.find(function(item){
      if (time === item.StartTime) {
        return item;
      }
    });
    if (timeCheck !== undefined) {
      res.say(timeCheck.Owner + ' booked ' + timeCheck.RoomName + ' for ' + timeCheck.Name + ' from ' + timeCheck.StartTime + ' for ' + timeCheck.Duration).shouldEndSession(false);
    } else {
      res.say('Room is free at ' + time).shouldEndSession(false);
    }
}
);

module.exports = app;
