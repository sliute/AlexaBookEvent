'use strict';
module.change_code = 1;
var _ = require('lodash')
var Alexa = require('alexa-app');
var app = new Alexa.app('book_event');
var moment = require('moment');
var DbHelper = require('./db_helper');
var dbHelper = new DbHelper();
var PASSWORD = "object oriented booking";
var validatedPassword;

app.pre = function(request, response, type) {
  dbHelper.createBookedEventsTable();
};

app.launch(function(req, res) {
  var prompt = 'Welcome to Makers Rooms<break time="1s"/>' + 'Make a booking <break time="0.5s"/> check a room\'s schedule <break time="0.5s"/> or say help for more information.';
  var cardText = buildCard("Makers Rooms", "Welcome to Makers Rooms. Make a booking, check a schedule, or say help for more information.");
  res.card(cardText);
  res.say(prompt).reprompt(prompt).shouldEndSession(false);
});

app.intent('startBookingIntent', {
  'utterances': ['{create|make} {|a} {booking|new booking}']
},
  function(req, res) {
    res.say('To create a new booking please say <break time="0.5s"/> the password is <break time="0.5s"/> followed by the password').shouldEndSession(false);
    return true;
});

app.intent('passwordBookingIntent', {
  'slots': {
    'PASSWORD': 'PASSWORDS',
  },
  'utterances': ['{the password is} {-|PASSWORD}']
},
  function(req, res) {
    var password = req.slot('PASSWORD');
    if (password === PASSWORD) {
      var session = req.getSession();
      session.set("PasswordValidation", true);
      res.say('Thank you. What is the date of your booking?').shouldEndSession(false);
      return true;
    }
    else {
      res.say('Sorry. I do not recognise this password. Please try again or ask makers for the correct password.').shouldEndSession(false);
      return true;
    }
});

app.intent('dateBookingIntent', {
  'slots': {
    'DATE': 'AMAZON.DATE',
  },
  'utterances': ['{-|DATE}']
},
  function(req, res) {
    validatedPassword = res.sessionObject.attributes.PasswordValidation;
    if (validatedPassword === true) {
      var date = req.slot('DATE');
      var session = req.getSession();
      session.set("Date", date);
      res.say('You are making a booking for ' + date + '. Which room would you like to book?').shouldEndSession(false);
      return true;
    }
    else {
      res.say('Sorry. You can not create a booking without providing a password. To create a new booking please say <break time="0.5s"/> the password is <break time="0.5s"/> followed by the password').shouldEndSession(true);
      return true;
    }
});

app.intent('roomBookingIntent', {
  'slots': {
    'ROOM': 'LIST_OF_ROOMS',
  },
  'utterances': ['{|book} {-|ROOM}']
},
  function(req, res) {
    if (validatedPassword === true) {
      var room = req.slot('ROOM');
      var session = req.getSession();
      session.set("RoomName", room);
      res.say('You are booking ' + room + '. What time would you like to book ' + room + ' for?').shouldEndSession(false);
      return true;
    }
    else {
      res.say('Sorry. You can not create a booking without providing a password. To create a new booking please say <break time="0.5s"/> the password is <break time="0.5s"/> followed by the password').shouldEndSession(true);
      return true;
    }
});

app.intent('timeBookingIntent', {
  'slots': {
    'TIME': 'AMAZON.TIME',
  },
  'utterances': ['{|book} {|for|at} {-|TIME}']
},
  function(req, res) {
    if (validatedPassword === true) {
      var time = req.slot('TIME');
      var session = req.getSession();
      session.set("StartTime", time);
      res.say('You are booking the room from ' + time + '. How long would you like to book it for?').shouldEndSession(false);
      return true;
    }
    else {
      res.say('Sorry. You can not create a booking without providing a password. To create a new booking please say <break time="0.5s"/> the password is <break time="0.5s"/> followed by the password').shouldEndSession(true);
      return true;
    }
});

app.intent('durationBookingIntent', {
  'slots': {
    'DURATION': 'AMAZON.DURATION',
  },
  'utterances': ['{|book} {|for} {-|DURATION}']
},
  function(req, res) {
    if (validatedPassword === true) {
      var duration = req.slot('DURATION');
      var stringDuration = moment.duration(duration, moment.ISO_8601).asMinutes();
      var session = req.getSession();
      session.set("Duration", duration);
      res.say('You are booking the room for ' + stringDuration + ' minutes. What is the name of your event?').shouldEndSession(false);
      return true;
    }
    else {
      res.say('Sorry. You can not create a booking without providing a password. To create a new booking please say <break time="0.5s"/> the password is <break time="0.5s"/> followed by the password').shouldEndSession(true);
      return true;
    }
});

app.intent('nameBookingIntent', {
  'slots': {
    'NAME': 'DESCRIPTION',
  },
  'utterances': ['{|my event is called} {-|NAME}']
},
  function(req, res) {
    if (validatedPassword === true) {
      var name = req.slot('NAME');
      var session = req.getSession();
      session.set("Name", name);
      res.say('You are booking the room for ' + name + '. Finally, what is your name?').shouldEndSession(false);
      return true;
    }
    else {
      res.say('Sorry. You can not create a booking without providing a password. To create a new booking please say <break time="0.5s"/> the password is <break time="0.5s"/> followed by the password').shouldEndSession(true);
      return true;
    }
});

app.intent('ownerBookingIntent', {
  'slots': {
    'OWNER': 'LIST_OF_MAKERS',
  },
  'utterances': ['{|my name is} {-|OWNER}']
},
  function(req, res) {
    if (validatedPassword === true) {
      var bookingData = res.sessionObject.attributes;
      var owner = req.slot('OWNER');
      var session = req.getSession();
      session.clear("PasswordValidation", true);
      session.set("Owner", owner);
      session.set("RoomDate", bookingData.RoomName + " " + bookingData.Date);
      var bookingDataComplete = res.sessionObject.attributes;
      var stringDuration = moment.duration(bookingData.Duration, moment.ISO_8601).asMinutes();

      return dbHelper.addRecord(bookingDataComplete)
        .then(function(overlaps) {
          if (overlaps >= 1) {
            res.say('Sorry, the room is booked at that time').shouldEndSession(false);
          } else if (overlaps === 0) {
            res.say('Thanks ' + owner + '. You have booked the ' + bookingData.RoomName + ' for ' + bookingData.Date + ' from ' + bookingData.StartTime + ' for ' + stringDuration + ' minutes for ' + bookingData.Name).shouldEndSession(true);
            var cardText = buildCard("You've Booked a Room!", "Success! You've booked " + bookingData.RoomName + " for " + bookingData.Date + " from " + bookingData.StartTime + " for " + stringDuration + " minutes for " + bookingData.Name + ".");
            res.card(cardText);
          } else {
            res.say('Sorry, I have failed to add the booking to the database. Please retry.').shouldEndSession(true);
          }
        });
    }
    else {
      res.say('Sorry. You can not create a booking without providing a password. To create a new booking please say <break time="0.5s"/> the password is <break time="0.5s"/> followed by the password').shouldEndSession(true);
      return true;
    }
});

app.intent('findByRoomDateIntent', {
  'slots': {
    'ROOM': 'LIST_OF_ROOMS',
    'DATE': 'AMAZON.DATE'
  },
  'utterances': ['{find|tell|give} {|me} {|all} {|the} {bookings|events} {in} {-|ROOM} {|on|for} {-|DATE}']
},
  function(req, res){
    var room = req.slot('ROOM');
    var date = req.slot('DATE');
    var roomDate = req.slot('ROOM') + ' ' + req.slot('DATE');
    return dbHelper.readRoomDateRecords(roomDate)
      .then(function(results) {
        if (results.length !== 0) {
          res.say('On ' + date + ' the ' + room + ' is booked for <break time="0.5s"/>').shouldEndSession(false);
          results.forEach(function(event) {
            res.say(event.Owner + 's' + event.Name + ' at ' + event.StartTime + ' <break time="0.5s"/>').shouldEndSession(false);
          });
          res.shouldEndSession(true);
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
      console.log("index", ongoingEvent)
      if (ongoingEvent !== undefined) {
        var stringDuration = moment.duration(ongoingEvent.Duration, moment.ISO_8601).asMinutes();
        res.say(ongoingEvent.Owner + ' has booked the room from ' + ongoingEvent.StartTime + ' for ' + stringDuration + ' minutes for ' + ongoingEvent.Name).shouldEndSession(true);
      } else {
        res.say(room + ' is available on ' + date2 + ' at ' + time).shouldEndSession(true);
      }
    });
});

app.intent('startDeleteBookingIntent', {
  'utterances': ['{delete|remove} {|a} {booking}']
},
  function(req, res) {
    res.say('To delete a booking please say delete with password, followed by the password').shouldEndSession(false);
    return true;
});

app.intent('passwordDeleteBookingIntent', {
  'slots': {
    'PASSWORD': 'PASSWORDS',
  },
  'utterances': ['{delete with password} {-|PASSWORD}']
},
  function(req, res) {
    var password = req.slot('PASSWORD');
    if (password === PASSWORD) {
      var session = req.getSession();
      session.set("PasswordValidation", true);
      res.say('Thank you To delete a booking say delete <break time="0.5s"/> name from <break time="0.5s"/> room on <break time="0.5s"/> date').shouldEndSession(false);
      return true;
    }
    else {
      res.say('Sorry. I do not recognise this password. Please try again or ask makers for the correct password.').shouldEndSession(false);
      return true;
    }
});

app.intent('deleteBookingIntent', {
  'slots': {
    'NAME': 'DESCRIPTION',
    'ROOM': 'LIST_OF_ROOMS',
    'DATE': 'AMAZON.DATE'
  },
  'utterances': ['{remove|delete} {-|NAME} {from} {-|ROOM} {|on|for} {-|DATE}']},
function(req, res) {
  validatedPassword = res.sessionObject.attributes.PasswordValidation;
  if (validatedPassword === true) {
    var eventName = req.slot('NAME');
    var eventRoom = req.slot('ROOM');
    var eventDate = req.slot('DATE');
    var roomDate = req.slot('ROOM') + ' ' + req.slot('DATE');
    return dbHelper.deleteRoomDateRecord(roomDate, eventName)
      .then(function(deletedEvents) {
        if (deletedEvents === 0) {
          res.say('Sorry, I found no such booking to delete').shouldEndSession(true);
        } else if (deletedEvents === 1) {
          res.say('You have deleted ' + eventName + ' from ' + eventRoom + ' for ' + eventDate).shouldEndSession(true);
        } else {
          res.say('Sorry, I have failed to delete the booking from the database. Please retry.').shouldEndSession(true);
        }
      });
  }
  else {
    res.say('Sorry. You can not delete a booking without providing a password. To delete a booking please say <break time="0.5s"/> the password is <break time="0.5s"/> followed by the password').shouldEndSession(true);
    return true;
  }
});

app.intent('secretIntent', {
  'utterances': ['{who\'s|who is} {Rob Holden}']
},
  function(req, res) {
    var answer = 'I know <break time="0.5s"/> but I won\'t tell you';
    res.say(answer).shouldEndSession(true);
    var cardText = buildCard("Secret revealed", "Here is Rob!");
    res.card(cardText);
});

app.intent('AMAZON.HelpIntent', {},
  function(req, res) {
    var help = 'Welcome to Makers Rooms Help <break time="0.5s"/>';
    var content = 'To create a new booking, say <break time="0.5s"/> create a new booking on a date and then follow the instructions <break time="1s"/>' +
    'To check a room\'s schedule for a certain date, say <break time="0.5s"/> tell me all the events in room for date <break time="1s"/>' +
    'To see what\'s going on in a room now, say <break time="0.5s"/>  what is on now in room <break time="1s"/>' +
    'To see what\'s going on in a room at a certain date and time, say <break time="0.5s"/>  what is on at time on date in room <break time="1s"/>' +
    'To delete a booking, say <break time="0.5s"/>  delete booking name from room on date <break time="1s"/>' +
    'You can also say <break time="0.5s"/>  stop or cancel to exit.';
    var cardText = buildCard("Makers Room Help", content);
    res.say(help + content).shouldEndSession(true);
    res.card(cardText);
});

var cancelIntentFunction = function(req, res) {
  res.say('Sayonara!').shouldEndSession(true);
};

app.intent('AMAZON.CancelIntent', {}, cancelIntentFunction);

app.intent('AMAZON.StopIntent', {}, cancelIntentFunction);

// Only use the following intent locally, to add a quick set of sample bookings to
// DynamoDB Local. Also un-comment the relevant lines at the end of db_helper.js.
// The sample bookings are stored in localSampleRecords.json.

// app.intent('addLocalSampleBookingsIntent', {},
//   function(req, res){
//     dbHelper.addSampleRecords();
//     res.say('You have added some sample bookings to DynamoDB Local').shouldEndSession(false);
// });

function buildCard(title, text){
  return {
    "type": "Standard",
    "title": title,
    "text": text,
    "image": {
      "smallImageUrl": "https://cdn-images-1.medium.com/max/1600/1*HIJGMWtNFLBwpG5kpfmAXg.jpeg"
    }
  };
}

module.exports = app;
