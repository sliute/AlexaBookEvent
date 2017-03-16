'use strict';
module.change_code = 1;
var _ = require('lodash')
var Alexa = require('alexa-app');
// var BOOK_EVENT_SESSION_KEY = 'book_event';
var app = new Alexa.app('book_event');
// var BookingManager = require('./bookingmanager');
// var DBHelper = require('./db_helper');
// var dbHelper = new DBHelper();

// app.pre = function(request, response, type) {
//   dbHelper.createBookEventTable();
// };

app.launch(function(req, res) {
  var prompt = 'Welcome to Makers Room<break time="1s"/>' + 'You can check out any time, but you can never leave';
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
    var bookings = {
      'Items': [ { EventName: 'Yoga Class', EventStartTime: '3:00 PM' },
      { EventName: 'Voodoo Academy', EventStartTime: '4:00 PM' }]
    };
    bookings.Items.forEach(function(item){
      res.say('Room is booked for ' + item.EventName + ' at ' + item.EventStartTime).shouldEndSession(false);
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
    var bookings = {
      'Items': [ { EventName: 'Yoga Class', EventStartTime: '15:00' },
      { EventName: 'Voodoo Academy', EventStartTime: '16:00' }]
    };
    bookings.Items.find(function(item){
      if (time === item.EventStartTime) {
        res.say('Room is booked for ' + item.EventName + ' at ' + item.EventStartTime).shouldEndSession(false);
        return true;
      } else {
        res.say('Room is free at ' + time).shouldEndSession(false);
        return true;
      }
    });
    return true;
}
);
//
// var getBooking = function(bookingData) {
//   if (bookingData === undefined) {
//     bookingData = {};
//   }
//   return new BookingManager(bookingData);
// }
//
// var getBookingFromRequest = function(request) {
//   var BookingData = request.session(BOOK_EVENT_SESSION_KEY);
//   return getBooking(BookingData);
// }
//
// var createBookingIntentFunction = function(bookingManager, request, response) {
//   var stepValue = request.slot('STEPVALUE');
//   bookingManager.started = true;
//   if (stepValue !== undefined) {
//     bookingManager.getStep().value = stepValue
//   }
// };
//
// app.intent('createBookingIntent', {
//     'slots': {
//       'STEPVALUE': 'STEPVALUES',
//     },
//     'utterances': ['{new|start|create|begin} {|a|the} booking', '{-|STEPVALUE}']
//   },
//   function(request, response) {
//     createBookingIntentFunction(getBookingFromRequest(request), request, response);
//   }
// );



module.exports = app;
