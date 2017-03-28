'use strict';
module.change_code = 1;
var _ = require('lodash');
var moment = require('moment');
var EVENTS_TABLE_NAME = 'BookedEvents';

// var dynasty = require('dynasty')({});

// !IMPORTANT! Before uploading to the Amazon Devs portal comment
// from line 11 to 18 and decomment line 7.

var localUrl = 'http://localhost:8000';
var localCredentials = {
  region: 'us-east-1',
  accessKeyId: 'fake',
  secretAccessKey: 'fake'
};
var localDynasty = require('dynasty')(localCredentials, localUrl);
var dynasty = localDynasty;

function DbHelper(bookedEventsTable) {
  if (typeof bookedEventsTable == 'undefined') {
    this.bookedEventsTable = function() {
      return dynasty.table(EVENTS_TABLE_NAME);
    };
  } else {
    this.bookedEventsTable = bookedEventsTable
  }
}

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
  var that = this;
  return that.bookedEventsTable().findAll(record.RoomDate)
    .then(function(dayRecords){
      var overlaps = 0;
      dayRecords.forEach(function(dayRecord) {
        if (overlap(dayRecord, record)) {
          overlaps += 1;
        }
      });
      if (overlaps === 0) {
        that.bookedEventsTable().insert(record)
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
  var that = this;
  return that.bookedEventsTable().findAll(roomDate)
    .then(function(records) {
      return records;
    })
    .catch(function(error){
      console.log(error);
    });
};

DbHelper.prototype.readRoomDateRecordsForNow = function(roomDate) {
  var that = this;
  return that.bookedEventsTable().findAll(roomDate)
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
  var that = this;
  return that.bookedEventsTable().findAll(roomDate)
    .then(function(records) {
      console.log("1", records)
      var ongoingEvent = records.find(function(record){
        console.log("2", record)
        var searchTime = moment(new Date(date2).toISOString().slice(0,10) + " " + time);
        var start = moment(new Date(record.Date).toISOString().slice(0,10) + " " + record.StartTime);
        var duration = moment.duration(record.Duration, moment.ISO_8601).asMinutes();
        var end = start.clone().add(duration, 'minutes');
        console.log("3", record)
        if (start <= searchTime && searchTime <= end) {
          return record;
        }
      });
      console.log("4", ongoingEvent)
      console.log("5", records)
      return ongoingEvent;
    })
    .catch(function(error){
      console.log("after catch");
      console.log(error);
    });
};

DbHelper.prototype.deleteRoomDateRecord = function(roomDate, eventName) {
  var that = this;
  return that.bookedEventsTable().findAll(roomDate)
    .then(function(records) {
      var deletedEvents = 0;
      records.forEach(function(record) {
        if (record.Name === eventName) {
          deletedEvents += 1;
          that.bookedEventsTable().remove({hash: roomDate, range: eventName})
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
