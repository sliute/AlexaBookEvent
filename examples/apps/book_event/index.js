'use strict';
module.change_code = 1;
var _ = require('lodash')
var Alexa = require('alexa-app');
var app = new Alexa.app('book_event');
var fs = require('fs');
var moment = require('moment');
//
// var DBHelper = require('./db_helper');
// var dbHelper = new DBHelper();

var EVENTS_TABLE_NAME = 'BookedEvents';
// var dynasty = require('dynasty')(credentials);
var localUrl = 'http://localhost:8000';
var localCredentials = {
  region: 'us-east-1',
  accessKeyId: 'fake',
  secretAccessKey: 'fake'
};
var localDynasty = require('dynasty')(localCredentials, localUrl);
var dynasty = localDynasty;

var createBookedEventsTable = function() {
  return dynasty.describe(EVENTS_TABLE_NAME)
    .catch(function(error) {
      console.log("createBookEventTable::error: ", error);
      return dynasty.create(EVENTS_TABLE_NAME, {
        key_schema: {
          hash: ['RoomDate', 'string'],
          range: ['Name', 'string']
        }
      });
    });
};

var bookedEventsTable = dynasty.table(EVENTS_TABLE_NAME);


app.pre = function(request, response, type) {
  createBookedEventsTable();
};


var cancelIntentFunction = function(req, res) {
  res.say('Sayonara!').shouldEndSession(true);
};

app.intent('AMAZON.CancelIntent', {}, cancelIntentFunction);
app.intent('AMAZON.StopIntent', {}, cancelIntentFunction);

app.launch(function(req, res) {
  var prompt = 'Welcome to Makers Room<break time="1s"/>' + 'You can check out any time you like, but you can never leave';
  var cardText = {
		"type": "Standard",
		"title": "Makers Room",
		"text": "Welcome to Makers Room.  To find out whether a room is currently booked, ask Alexa 'What's on now?'",
    "image": {
      "smallImageUrl": "https://pbs.twimg.com/profile_images/3087236754/91e379b7e0006d38ee0526946a38a1ea_400x400.png"
    }
  };
  res.card(cardText);
  res.say(prompt).reprompt(prompt).shouldEndSession(false);
});

app.intent('addHardCodedBookingIntent', {}, function(req, res){
  bookedEventsTable.insert({
    "RoomDate": "Joy Room 2017-03-17",
		"RoomName": "Joy Room",
		"Owner": "Dana",
		"Name": "Yoga Class 01",
		"Date": "2017-03-17",
		"StartTime": "17:00",
		"Duration": "PT60M"
	});

  bookedEventsTable.insert({
    "RoomDate": "Living Room 2017-03-17",
		"RoomName": "Living Room",
		"Owner": "Dana",
		"Name": "Yoga Class 02",
		"Date": "2017-03-17",
		"StartTime": "17:00",
		"Duration": "PT60M"
	});

  bookedEventsTable.insert({
    "RoomDate": "Joy Room 2017-03-22",
		"RoomName": "Joy Room",
		"Owner": "Dana",
		"Name": "Yoga Class 03",
		"Date": "2017-03-22",
		"StartTime": "17:00",
		"Duration": "PT60M"
	});
  res.say('Booking created for Joy Room').shouldEndSession(false);
});

app.intent('deleteBookingIntent', {}, function(req, res) {
  return bookedEventsTable.findAll('Joy Room 2017-03-22')
    .then(function(foundEvents) {
      var deletedEvents = 0;
      foundEvents.forEach(function(event) {
        if (event.Name === 'Yoga Class 03') {
          bookedEventsTable.remove({hash: 'Joy Room 2017-03-22', range: 'Yoga Class 03'})
          deletedEvents += 1
          res.say(event.Name + ' has been deleted');
        }
      })
      if (deletedEvents === 0) {
        res.say('Nothing found');
      }
    })
});

app.intent('dateBookingIntent', {
  'slots': {
    'DATE': 'AMAZON.DATE',
  },
  'utterances': ['{create|make|start} {|a} {booking|new booking} {|on|for} {-|DATE}']
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
    bookedEventsTable.insert(bookingDataComplete);

    var stringDuration = moment.duration(bookingData.Duration, moment.ISO_8601).asMinutes();

    res.say('Thanks ' + owner + '. You have booked the ' + bookingData.RoomName + ' for ' + bookingData.Date + ' at ' + bookingData.StartTime + ' for ' + stringDuration + ' minutes for ' + bookingData.Name).shouldEndSession(true);
    return true;
});

app.intent('findRoomDateBookingsIntent', {
    'slots': {
      'DATE': 'AMAZON.DATE',
      'ROOM': 'LIST_OF_ROOMS'
    },
    'utterances': ['{find bookings in} {-|ROOM} {|on} {-|DATE}']
  },
  function(req, res){
    var date = req.slot('DATE');
    var room = req.slot('ROOM');
    var dateRoom = (room + " " + date);
    return bookedEventsTable.findAll(dateRoom)
    .then(function(foundEvents) {
      if (foundEvents.length === 0) {
        res.say('There is nothing booked that day').shouldEndSession(true);
      } else {
        foundEvents.forEach(function(event) {
          res.say('Booked for ' + event.Name + ' in ' + event.RoomName + ' on ' + event.Date).shouldEndSession(true);
        });
      }
    });
});

app.intent('findNowBookingsIntent', {
    'slots': {
      'ROOM': 'LIST_OF_ROOMS'
  },
    'utterances': ['{-|find } {what is on now|what\'s on now|what is going on now|what\'s going on now} {in} {-|ROOM}']
},
  function(req, res) {
    var date = new Date().toISOString().slice(0,10);
    var room = req.slot('ROOM');
    var dateRoom = (room + " " + date);
    return bookedEventsTable.findAll(dateRoom)
    .then(function(foundEvents) {
      if (foundEvents.length === 0) {
        res.say(room + ' is currently available').shouldEndSession(true);
      } else {
        var timeCheck = foundEvents.find(function(event){
          var now = moment();
          var start = moment(new Date().toISOString().slice(0,10) + " " + event.StartTime);
          var duration = moment.duration(event.Duration, moment.ISO_8601).asMinutes();
          var end = start.clone().add(duration, 'minutes');
          if (start <= now && now <= end) {
            return event;
          }
        });

        if (timeCheck !== undefined) {
          var stringDuration = moment.duration(timeCheck.Duration, moment.ISO_8601).asMinutes();
          res.say(timeCheck.RoomName + ' is booked for ' + timeCheck.Name + ' at ' + timeCheck.StartTime + ' for ' + stringDuration + ' minutes.').shouldEndSession(true);
        } else {
          res.say(timeCheck.RoomName + ' is currently available').shouldEndSession(true);
        }
      }
    });
});

app.intent('findByTimeIntent', {
  'slots': {
    'TIME': 'AMAZON.TIME',
    'ROOM': 'LIST_OF_ROOMS',
    'DATE': 'AMAZON.DATE'
  },
  'utterances': ['{find} {what is on at|what\'s on at } {-|TIME} {|on} {-|DATE} {in} {-|ROOM}']
},
  function (req, res) {
    var time = req.slot('TIME');
    var date2 = req.slot('DATE');
    var room = req.slot('ROOM');
    var dateRoom = (room + " " + date2);
    return bookedEventsTable.findAll(dateRoom)
    .then(function(foundEvents) {
      if (foundEvents.length === 0) {
        res.say(room + ' is available at ' + time + ' on ' + date2).shouldEndSession(true);
      } else {

        var timeCheck = foundEvents.find(function(event){
          var searchTime = moment(new Date(date2).toISOString().slice(0,10) + " " + time);
          var start = moment(new Date(event.Date).toISOString().slice(0,10) + " " + event.StartTime);
          var duration = moment.duration(event.Duration, moment.ISO_8601).asMinutes();
          var end = start.clone().add(duration, 'minutes');
          if (start <= searchTime && searchTime <= end) {
            return event;
          }
        });
        if (timeCheck !== undefined) {
          res.say(timeCheck.RoomName + ' is booked on ' + timeCheck.Date + ' at ' + timeCheck.StartTime + ' for ' + timeCheck.Name).shouldEndSession(true);
        } else {
          res.say(timeCheck.RoomName + ' is available on ' + date2 + ' at ' + time).shouldEndSession(true);
        }
      }
    });
});

module.exports = app;
