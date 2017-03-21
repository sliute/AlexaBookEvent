'use strict';
module.change_code = 1;
var _ = require('lodash');
var moment = require('moment');
var EVENTS_TABLE_NAME = 'BookedEvents';

var dynasty = require('dynasty')({});
// var localUrl = 'http://localhost:8000';
// var localCredentials = {
//   region: 'us-east-1',
//   accessKeyId: 'fake',
//   secretAccessKey: 'fake'
// };
// var localDynasty = require('dynasty')(localCredentials, localUrl);
// var dynasty = localDynasty;

function DbHelper() {}

var bookedEventsTable = function() {
  return dynasty.table(EVENTS_TABLE_NAME);
};

var overlap = function(r1, r2) {
  var start1 = moment(r1.Date + " " + r1.StartTime);
  var start2 = moment(r2.Date + " " + r2.StartTime);
  var duration1 = moment.duration(r1.Duration, moment.ISO_8601).asMinutes();
  var duration2 = moment.duration(r2.Duration, moment.ISO_8601).asMinutes();
  var end1 = start1.clone().add(duration1, 'minutes');
  var end2 = start2.clone().add(duration1, 'minutes');
  return (Math.max(start1, start2) < Math.min(end1, end2));
};

DbHelper.prototype.createBookedEventsTable = function() {
  return dynasty.describe(EVENTS_TABLE_NAME)
    .catch(function(error) {
      console.log("createBookedEventTable::error: ", error);
      return dynasty.create(EVENTS_TABLE_NAME, {
        key_schema: {
          hash: ['RoomDate', 'string'],
          range: ['Name', 'string']
        }
      });
    });
};

DbHelper.prototype.addRecord = function(record) {
  return bookedEventsTable().findAll(record.RoomDate)
    .then(function(dayRecords){
      var overlaps = 0;
      dayRecords.forEach(function(dayRecord) {
        if (overlap(dayRecord, record)) {
          overlaps += 1;
        }
      });
      if (overlaps === 0) {
        bookedEventsTable().insert(record)
        .catch(function(error){
          console.log(error);
          overlaps = -1;
        });
      }
      return overlaps;
    })
    .catch(function(error){
      console.log(error);
    });
};

DbHelper.prototype.readRoomDateRecords = function(roomDate) {
  return bookedEventsTable().findAll(roomDate)
    .then(function(records) {
      return records;
    })
    .catch(function(error){
      console.log(error);
    });
};

DbHelper.prototype.readRoomDateRecordsForNow = function(roomDate) {
  return bookedEventsTable().findAll(roomDate)
    .then(function(records) {
      var ongoingEvent = records.find(function(record){
        var now = moment();
        var start = moment(new Date().toISOString().slice(0,10) + " " + record.StartTime);
        var duration = moment.duration(record.Duration, moment.ISO_8601).asMinutes();
        var end = start.clone().add(duration, 'minutes');
        if (start <= now && now <= end) {
          return record;
        }
      });
      return ongoingEvent;
    })
    .catch(function(error){
      console.log(error);
    });
};

DbHelper.prototype.readRoomDateRecordsForTime = function(roomDate, date2, time) {
  return bookedEventsTable().findAll(roomDate)
    .then(function(records) {
      var ongoingEvent = records.find(function(record){
        var searchTime = moment(new Date(date2).toISOString().slice(0,10) + " " + time);
        var start = moment(new Date(record.Date).toISOString().slice(0,10) + " " + record.StartTime);
        var duration = moment.duration(record.Duration, moment.ISO_8601).asMinutes();
        var end = start.clone().add(duration, 'minutes');
        if (start <= searchTime && searchTime <= end) {
          return record;
        }
      });
      return ongoingEvent;
    })
    .catch(function(error){
      console.log(error);
    });
};

DbHelper.prototype.deleteRoomDateRecord = function(roomDate, eventName) {
  return bookedEventsTable().findAll(roomDate)
    .then(function(records) {
      var deletedEvents = 0;
      records.forEach(function(record) {
        if (record.Name === eventName) {
          deletedEvents += 1;
          bookedEventsTable().remove({hash: roomDate, range: eventName})
          .catch(function(error){
            console.log(error);
            deletedEvents = -1;
          });
        }
      });
      return deletedEvents;
    })
    .catch(function(error){
      console.log(error);
    });
};

// Only uncomment the lines below if you need to add some sample bookings to
// DynamoDB Local. To do that, also uncomment the intent at the end of index.js.
// The sample bookings are stored in localSampleRecords.json.

// var fs = require('fs');
// var sampleRecords;
// fs.readFile('apps/book_event/localSampleRecords.json', 'utf8', function (err, data) {
//   if (err) throw err;
//   sampleRecords = JSON.parse(data);
// });
//
// DbHelper.prototype.addSampleRecords = function() {
//   sampleRecords.Items.forEach(function(item) {
//     this.addRecord(item);
//   });
// };

module.exports = DbHelper;
