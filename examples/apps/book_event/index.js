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
  var prompt = 'Welcome to Book Me Alexa' + 'To create a new booking, say create a booking' + 'You can also say stop or cancel to exit.';
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
