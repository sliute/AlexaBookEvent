'use strict';
module.change_code = 1;
var _ = require('lodash')
var Alexa = require('alexa-app');
var app = new Alexa.app('book_event');
var moment = require('moment');
var DbHelper = require('./db_helper');
var dbHelper = new DbHelper();

app.pre = function(request, response, type) {
  dbHelper.createBookedEventsTable();
};

app.launch(function(req, res) {
  var prompt = 'Welcome to Makers Rooms<break time="1s"/>' + 'Make a booking <break time="0.5s"/> check a room\'s schedule <break time="0.5s"/> or say help for more information.';
  var cardText = {
		"type": "Standard",
		"title": "Makers Rooms",
		"text": "Welcome to Makers Rooms. Make a booking, check a schedule, or say help for more information.",
    "image": {
      "smallImageUrl": "https://pbs.twimg.com/profile_images/3087236754/91e379b7e0006d38ee0526946a38a1ea_400x400.png"
    }
  };
  res.card(cardText);
  res.say(prompt).reprompt(prompt).shouldEndSession(false);
});

app.intent('dateBookingIntent', {
  'slots': {
    'DATE': 'AMAZON.DATE',
  },
  'utterances': ['{create|make} {|a} {booking|new booking} {|on|for} {-|DATE}']
},
  function(req, res) {
    var date = req.slot('DATE');

    var session = req.getSession();
    session.set("Date", date);

    res.say('You are making a booking for ' + date + '. Which room would you like to book?').shouldEndSession(false);
    return true;
});

app.intent('roomBookingIntent', {
  'slots': {
    'ROOM': 'LIST_OF_ROOMS',
  },
  'utterances': ['{|book} {-|ROOM}']
},
  function(req, res) {
    var room = req.slot('ROOM');

    var session = req.getSession();
    session.set("RoomName", room);

    res.say('You are booking ' + room + '. What time would you like to book ' + room + '?').shouldEndSession(false);
    return true;
});

app.intent('timeBookingIntent', {
  'slots': {
    'TIME': 'AMAZON.TIME',
  },
  'utterances': ['{|book} {|for|at} {-|TIME}']
},
  function(req, res) {
    var time = req.slot('TIME');

    var session = req.getSession();
    session.set("StartTime", time);

    res.say('You are booking the room at ' + time + '. How long would you like to book it for?').shouldEndSession(false);
    return true;
});

app.intent('durationBookingIntent', {
  'slots': {
    'DURATION': 'AMAZON.DURATION',
  },
  'utterances': ['{|book} {|for} {-|DURATION}']
},
  function(req, res) {
    var duration = req.slot('DURATION');
    var stringDuration = moment.duration(duration, moment.ISO_8601).asMinutes();
    var session = req.getSession();
    session.set("Duration", duration);

    res.say('You are booking the room for ' + stringDuration + ' minutes. What is the name of your event?').shouldEndSession(false);
    return true;
});

app.intent('nameBookingIntent', {
  'slots': {
    'NAME': 'DESCRIPTION',
  },
  'utterances': ['{|my event is called} {-|NAME}']
},
  function(req, res) {
    var name = req.slot('NAME');

    var session = req.getSession();
    session.set("Name", name);

    res.say('You are booking the room for ' + name + '. Finally, What is your name?').shouldEndSession(false);
    return true;
});

app.intent('ownerBookingIntent', {
  'slots': {
    'OWNER': 'LIST_OF_MAKERS',
  },
  'utterances': ['{|my name is} {-|OWNER}']
},
  function(req, res) {
    var owner = req.slot('OWNER');
    var session = req.getSession();
    session.set("Owner", owner);

    var bookingData = res.sessionObject.attributes;
    session.set("RoomDate", bookingData.RoomName + " " + bookingData.Date);
    var bookingDataComplete = res.sessionObject.attributes;
    var stringDuration = moment.duration(bookingData.Duration, moment.ISO_8601).asMinutes();

    return dbHelper.addRecord(bookingDataComplete)
      .then(function(overlaps) {
        if (overlaps) {
          res.say('Sorry, the room is booked at that time').shouldEndSession(false);
        } else {
          res.say('Thanks ' + owner + ' You have booked the ' + bookingData.RoomName + ' for ' + bookingData.Date + ' from ' + bookingData.StartTime + ' for ' + stringDuration + ' minutes for ' + bookingData.Name).shouldEndSession(true);
          var cardText = {
        		"type": "Standard",
        		"title": "You've Booked a Room!",
        		"text": "Success! You've booked " + bookingData.RoomName + " for " + bookingData.Date + " from " + bookingData.StartTime + " for " + stringDuration + " minutes for " + bookingData.Name + ".",
            "image": {
              "smallImageUrl": "https://pbs.twimg.com/profile_images/3087236754/91e379b7e0006d38ee0526946a38a1ea_400x400.png"
            }
          };
          res.card(cardText);
        }
      });
});

app.intent('findByRoomDateIntent', {
  'slots': {
    'ROOM': 'LIST_OF_ROOMS',
    'DATE': 'AMAZON.DATE'
  },
  'utterances': ['{find|tell|give} {|me} {|all} {|the} {bookings|events} {in} {-|ROOM} {|on|for} {-|DATE}']},
function(req, res){
  var room = req.slot('ROOM');
  var date = req.slot('DATE');
  var roomDate = req.slot('ROOM') + ' ' + req.slot('DATE');
  return dbHelper.readRoomDateRecords(roomDate)
    .then(function(results) {
      if (results.length !== 0) {
        results.forEach(function(event) {
          res.say('Booked for ' + event.Name + ' in ' + event.RoomName + ' on ' + event.Date + ' ').shouldEndSession(true);
        });
      } else {
        res.say('The ' + room + ' is free the whole day on ' + date).shouldEndSession(true);
      }
    });
});

app.intent('findByRoomWithNowIntent', {
    'slots': {
      'ROOM': 'LIST_OF_ROOMS'
  },
    'utterances': ['{find|tell|give} {|me} {what is on now|what\'s on now|what is going on now|what\'s going on now} {in} {-|ROOM}']
},
  function(req, res) {
    var date = new Date().toISOString().slice(0,10);
    var room = req.slot('ROOM');
    var roomDate = (room + " " + date);

    return dbHelper.readRoomDateRecordsForNow(roomDate)
    .then(function(ongoingEvent) {
      if (ongoingEvent !== undefined) {
        var stringDuration = moment.duration(ongoingEvent.Duration, moment.ISO_8601).asMinutes();
        res.say(ongoingEvent.RoomName + ' is booked from ' + ongoingEvent.StartTime + ' for ' + stringDuration + ' minutes for ' + ongoingEvent.Name).shouldEndSession(true);
      } else {
        res.say(room + ' is currently available').shouldEndSession(true);
      }
    });
});

app.intent('findByRoomWithTimeAndDateIntent', {
  'slots': {
    'TIME': 'AMAZON.TIME',
    'ROOM': 'LIST_OF_ROOMS',
    'DATE': 'AMAZON.DATE'
  },
  'utterances': ['{find|tell|give} {|me} {what is on at|what\'s on at } {-|TIME} {|on} {-|DATE} {in} {-|ROOM}']
},
  function (req, res) {
    var time = req.slot('TIME');
    var date2 = req.slot('DATE');
    var room = req.slot('ROOM');
    var roomDate = (room + " " + date2);

    return dbHelper.readRoomDateRecordsForTime(roomDate, date2, time)
    .then(function(ongoingEvent) {
      if (ongoingEvent !== undefined) {
        var stringDuration = moment.duration(ongoingEvent.Duration, moment.ISO_8601).asMinutes();
        res.say(ongoingEvent.RoomName + ' is booked from ' + ongoingEvent.StartTime + ' for ' + stringDuration + ' minutes for ' + ongoingEvent.Name).shouldEndSession(true);
      } else {
        res.say(room + ' is available on ' + date2 + ' at ' + time).shouldEndSession(true);
      }
    });
});

app.intent('deleteBookingIntent', {
  'slots': {
    'NAME': 'DESCRIPTION',
    'ROOM': 'LIST_OF_ROOMS',
    'DATE': 'AMAZON.DATE'
  },
  'utterances': ['{remove|delete|cancel} {-|NAME} {from} {-|ROOM} {|on|for} {-|DATE}']},
function(req, res) {
  var eventName = req.slot('NAME');
  var eventRoom = req.slot('ROOM');
  var eventDate = req.slot('DATE');
  var roomDate = req.slot('ROOM') + ' ' + req.slot('DATE');
  return dbHelper.deleteRoomDateRecord(roomDate, eventName)
    .then(function(deletedEvents) {
      if (deletedEvents === 0) {
        res.say('Sorry, there was no such booking to cancel');
      } else {
        res.say(eventName + ' from ' + eventRoom + ' on ' + eventDate + ' has been deleted').shouldEndSession(true);

      }
    });
});

app.intent('secretIntent', {
  'utterances': ['{who\'s|who is} {Rob Holden}']},
  function(req, res) {
    var answer = 'I know, but I won\'t tell you';
    res.say(answer).shouldEndSession(true);
    var cardText = {
      "type": "Standard",
      "title": "Secret revealed!",
      "text": "Here is Rob!",
      "image": {
        "smallImageUrl": "https://scontent-lht6-1.xx.fbcdn.net/v/t1.0-9/10350508_10153547537482877_795798945280772953_n.jpg?oh=c0037cecfdc5e0075c583f1adb65423e&oe=596E63DF"
      }
    };
    res.card(cardText);
});

app.intent('AMAZON.HelpIntent', {},
  function(req, res) {
    var help = 'Welcome to Makers Rooms Help <break time="0.5s"/>' +
      'To create a new booking, say <break time="0.5s"/> create a new booking on a date and then follow the instructions <break time="1s"/>' +
      'To check a room\'s schedule for a certain date, say <break time="0.5s"/> tell me all the events in room for date <break time="1s"/>' +
      'To see what\'s going on in a room now, say <break time="0.5s"/>  what is on now in room <break time="1s"/>' +
      'To see what\'s going on in a room at a certain date and time, say <break time="0.5s"/>  what is on at time on date in room <break time="1s"/>' +
      'To delete a booking, say <break time="0.5s"/>  delete booking name from room on date <break time="1s"/>' +
      'You can also say <break time="0.5s"/>  stop or cancel to exit.';
    res.say(help).shouldEndSession(true);
  });

var cancelIntentFunction = function(req, res) {
  res.say('Sayonara!').shouldEndSession(true);
};

app.intent('AMAZON.CancelIntent', {}, cancelIntentFunction);

app.intent('AMAZON.StopIntent', {}, cancelIntentFunction);

app.intent('addThreeSampleBookingsIntent', {}, function(req, res){
  dbHelper.addSampleRecords();
  res.say('You have added three sample bookings!').shouldEndSession(false);
});

module.exports = app;
