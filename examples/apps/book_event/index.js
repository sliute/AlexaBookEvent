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

var cancelIntentFunction = function(req, res) {
  res.say('Sayonara!').shouldEndSession(true);
};

app.intent('AMAZON.CancelIntent', {}, cancelIntentFunction);
app.intent('AMAZON.StopIntent', {}, cancelIntentFunction);

app.intent('readRoomDateBookingsIntent', {
  'slots': {
    'ROOM': 'LIST_OF_ROOMS',
    'DATE': 'AMAZON.DATE'
  },
  'utterances': ['{tell|give} {|me} {|all} {|the} {bookings|events} {for} {-|ROOM} {|on|for} {-|DATE}']},
function(req, res){
  var room = req.slot('ROOM');
  var date = req.slot('DATE');
  var roomDate = req.slot('ROOM') + ' ' + req.slot('DATE');
  return dbHelper.readRoomDateRecords(roomDate)
    .then(function(results) {
      if (results.length !== 0) {
        results.forEach(function(event) {
          res.say('Booked for ' + event.Name + ' in ' + event.RoomName + ' on ' + event.Date + ' ').shouldEndSession(false);
        });
      } else {
        res.say('The ' + room + ' is free the whole day on ' + date).shouldEndSession(false);
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
        res.say('Sorry, I could find nothing to delete');
      } else {
        res.say(eventName + ' from ' + eventRoom + ' on ' + eventDate + ' has been deleted').shouldEndSession(false);
      }
    });
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

    res.say('You are booking ' + room + '. What time would you like to book' + room + '?').shouldEndSession(false);
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

    res.say('You are booking the room for ' + stringDuration + 'minutes. What is the name of your event?').shouldEndSession(false);
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
    dbHelper.addRecord(bookingDataComplete);
    var stringDuration = moment.duration(bookingData.Duration, moment.ISO_8601).asMinutes();
    res.say('Thanks' + owner + '. You have booked the' + bookingData.RoomName + ' for ' + bookingData.Date + ' at ' + bookingData.StartTime + ' for ' + stringDuration + ' minutes for ' + bookingData.Name).shouldEndSession(true);
    return true;
});

app.intent('GetByDayIntent', {
  'slots': {
    'DATE': 'AMAZON.DATE'
  },
  'utterances': ['{what is on|what\'s on|what is on on|what\'s on on} {-|DATE}']
},
  function (req, res) {
    var date = req.slot('DATE');
    var dateBookings = [];
    bookings.Items.forEach(function(item){
      if (date === item.Date) {
        dateBookings.push(item);
      }
    });
    if (dateBookings.length === 0) {
      res.say('There is nothing booked that day');
    } else {
      dateBookings.forEach(function(item){
        res.say('At ' + item.StartTime + ' <break time="0.5s"/> ' + item.Owner + ' booked ' + item.RoomName + ' for ' + item.Name + ' for ' + item.Duration + ' <break time="1s"/>').shouldEndSession(false);
      });
    }
    return true;
}
);

app.intent('GetNowIntent', {
  'utterances': ['{what is on now|what\'s on now|what is going on now|what\'s going on now}']
},
  function(req, res) {
    var dateBookings = [];
    bookings.Items.forEach(function(item){
      if (new Date().toISOString().slice(0,10) === item.Date) {
        dateBookings.push(item);
      }
    });
    var nowBooking;
    dateBookings.forEach(function(item){
      var now = moment();
      var start = moment(new Date().toISOString().slice(0,10) + " " + item.StartTime);
      var duration = moment.duration(item.Duration, moment.ISO_8601).asMinutes();
      var end = start.clone().add(duration, 'minutes');
      if (start <= now && now <= end) {
        nowBooking = item;
      }
    });
    if (nowBooking !== undefined) {
      res.say(nowBooking.Owner + ' booked ' + nowBooking.Name + ' from ' + nowBooking.StartTime + ' for ' + nowBooking.Duration).shouldEndSession(false);
    } else {
      res.say('All rooms are free now').shouldEndSession(false);
    }
  }
);

app.intent('GetByTimeIntent', {
  'slots': {
    'TIME': 'AMAZON.TIME',
    'DATE': 'AMAZON.DATE'
  },
  'utterances': ['{what is on at|what\'s on at } {-|TIME} {-|DATE}']
},
  function (req, res) {
    var time = req.slot('TIME');
    var date2 = req.slot('DATE');

    var timeCheck = bookings.Items.find(function(item){
      if (time === item.StartTime && item.Date === date2) {
        return item;
      }
    });
    if (timeCheck !== undefined) {
      res.say(timeCheck.Owner + ' booked ' + timeCheck.RoomName + ' for ' + timeCheck.Name + ' from ' + timeCheck.StartTime + ' for ' + timeCheck.Duration).shouldEndSession(false);
    } else {
      res.say('All rooms are free at ' + time + ' ' + date2).shouldEndSession(false);
    }
}
);

app.intent('addHardCodedBookingsIntent', {}, function(req, res){
  dbHelper.addRecord({
    "RoomDate": "Joy Room 2017-03-17",
		"RoomName": "Joy Room",
		"Owner": "Dana",
		"Name": "Yoga Class 01",
		"Date": "2017-03-17",
		"StartTime": "17:00",
		"Duration": "PT60M"
	});

  dbHelper.addRecord({
    "RoomDate": "Living Room 2017-03-17",
		"RoomName": "Living Room",
		"Owner": "Dana",
		"Name": "Yoga Class 02",
		"Date": "2017-03-17",
		"StartTime": "17:00",
		"Duration": "PT60M"
	});

  dbHelper.addRecord({
    "RoomDate": "Joy Room 2017-03-22",
		"RoomName": "Joy Room",
		"Owner": "Dana",
		"Name": "Yoga Class 03",
		"Date": "2017-03-22",
		"StartTime": "17:00",
		"Duration": "PT60M"
	});

  res.say('Three hard-coded bookings created!').shouldEndSession(false);
});

module.exports = app;
