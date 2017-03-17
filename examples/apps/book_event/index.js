'use strict';
module.change_code = 1;
var _ = require('lodash')
var Alexa = require('alexa-app');
// var BOOK_EVENT_SESSION_KEY = 'book_event';
var app = new Alexa.app('book_event');
var fs = require('fs');
var bookings = JSON.parse(fs.readFileSync('./apps/book_event/bookings.json', 'utf8'));
// var bookings = JSON.parse(fs.readFileSync('./bookings.json', 'utf8'));

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

app.intent('createBookingIntent', {

  'slots': {
    'TITLE': 'DESCRIPTION',
    'DATE': 'AMAZON.DATE',
    'TIME': 'AMAZON.TIME',
    'OWNER': 'LIST_OF_MAKERS',
    'DURATION': 'AMAZON.DURATION'
  },
  'utterances': ['{book room|create booking|call booking} {|for} {-|TITLE}']
},
  function(req, res) {
    var title = req.slot('TITLE');
    var newEvent = {
  		"EventName": "Mango Party",
  	};

    // var addEvent = JSON.stringify(newEvent);

    fs.readFile('./apps/book_event/bookings.json', 'utf8', function(err, data){
      console.log("hello");
      if (err) {
        console.log(err);
      } else {
        bookings = JSON.parse(data);
        bookings.Items.push(newEvent);
        var json = JSON.stringify(bookings);
        fs.writeFile('./apps/book_event/bookings.json', json, 'utf8');
      }
    })
    res.say('Room is booked for ' + title).shouldEndSession(false);
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
      res.say('At ' + item.EventStartTime + 'the room is booked for' + item.EventName + '<break time="1s"/>').shouldEndSession(false);
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
      if (time === item.EventStartTime) {
        return item;
      }
    });
    if (timeCheck !== undefined) {
      res.say('Room is booked for ' + timeCheck.EventName + ' at ' + timeCheck.EventStartTime).shouldEndSession(false);
    } else {
      res.say('Room is free at ' + time).shouldEndSession(false);
    }
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
