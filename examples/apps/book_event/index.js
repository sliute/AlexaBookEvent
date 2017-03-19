'use strict';
module.change_code = 1;
var _ = require('lodash')
var Alexa = require('alexa-app');
var app = new Alexa.app('book_event');
var fs = require('fs');
var bookings = {};
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

app.intent('seeRoomDateBookingsIntent', {}, function(req, res){
  return bookedEventsTable.findAll('Joy Room 2017-03-17')
    .then(function(foundEvents) {
      foundEvents.forEach(function(event) {
        res.say('Booked for ' + event.Name + ' in ' + event.RoomName + ' on ' + event.Date).shouldEndSession(false);
      });
    });
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
})

app.launch(function(req, res) {
  bookings.Items = [];
  bookings.Items.push({
		"RoomName": "Joy Room",
		"Owner": "Dana",
		"Name": "Yoga Class",
		"Date": "2017-03-17",
		"StartTime": "17:00",
		"Duration": "PT60M"
	}, {
		"RoomName": "Rooster Blood Room",
		"Owner": "Papillon",
		"Name": "Voodoo Academy",
		"Date": "2017-03-13",
		"StartTime": "16:00",
		"Duration": "PT45M"
	}, {
		"RoomName": "Living Room",
		"Owner": "Evgeny",
		"Name": "CEO Stuff",
		"Date": "2017-03-13",
		"StartTime": "15:00",
		"Duration": "PT15M"
	});
  var json = JSON.stringify(bookings);
  fs.writeFile('/tmp/bookings.json', json, 'utf8');

  var prompt = 'Welcome to Makers Room<break time="1s"/>' + 'You can check out any time you like, but you can never leave';
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
  		"Name": title,
  	};

    fs.readFile('/tmp/bookings.json', 'utf8', function(err, data){
      if (err) {
        console.log(err);
      } else {
        bookings = JSON.parse(data);
        bookings.Items.push(newEvent);
        var json = JSON.stringify(bookings);
        fs.writeFile('/tmp/bookings.json', json, 'utf8');
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

module.exports = app;
