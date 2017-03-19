'use strict';
module.change_code = 1;
var _ = require('lodash');
var EVENTS_TABLE_NAME = 'BookedEvents';

// var dynasty = require('dynasty')({});
var localUrl = 'http://localhost:8000';
var localCredentials = {
  region: 'us-east-1',
  accessKeyId: 'fake',
  secretAccessKey: 'fake'
};
var localDynasty = require('dynasty')(localCredentials, localUrl);
var dynasty = localDynasty;

function DbHelper() {}

var bookedEventsTable = function() {
  return dynasty.table(EVENTS_TABLE_NAME);
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
  return bookedEventsTable()
    .insert(record)
    .catch(function(error){console.log(error);});
};

DbHelper.prototype.readRoomDateRecords = function(roomdate) {
  return bookedEventsTable().findAll(roomdate)
    .then(function(records) {
      return records;
    })
    .catch(function(error){
      console.log(error);
    });
};

// BookingManager.prototype.storeBookEventData = function(userId, bookEventData) {
//   console.log("writing bookEventData to database for user " + userId);
//   return bookEventTable().insert({
//     userId: userId,
//     data: JSON.stringify(bookEventData)
//   }).catch(function(error) {
//     console.log(error);
//   });
// };
//
// BookingManager.prototype.readBookEventData = function(userId) {
//   console.log("reading bookEventData from database for user " + userId);
//   return bookEventTable().find(userId)
//     .then(function(result) {
//       var data = (result === undefined ? {} : JSON.parse(result["data"]));
//       return new BookingManager(data);
//     })
//     .catch(function(error) {
//       console.log(error);
//     });
// };

module.exports = DbHelper;
