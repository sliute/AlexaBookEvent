'use strict';
module.change_code = 1;
var _ = require('lodash');
var BOOK_EVENT_TABLE_NAME = 'BookEventData';
// var dynasty = require('dynasty')(credentials);
var localUrl = 'http://localhost:8000';
var localCredentials = {
  region: 'us-east-1',
  accessKeyId: 'fake',
  secretAccessKey: 'fake'
};
var localDynasty = require('dynasty')(localCredentials, localUrl);
var dynasty = localDynasty;

function BookingManager() {}

var bookEventTable = function() {
  return dynasty.table(BOOK_EVENT_TABLE_NAME);
};

BookingManager.prototype.createBookEventTable = function() {
  return dynasty.describe(BOOK_EVENT_TABLE_NAME)
    .catch(function(error) {
      console.log("createBookEventTable::error: ", error);
      return dynasty.create(BOOK_EVENT_TABLE_NAME, {
        key_schema: {
          hash: ['userId', 'string'],
        }
      });
    });
};

BookingManager.prototype.storeBookEventData = function(userId, bookEventData) {
  console.log("writing bookEventData to database for user " + userId);
  return bookEventTable().insert({
    userId: userId,
    data: JSON.stringify(bookEventData)
  }).catch(function(error) {
    console.log(error);
  });
};

BookingManager.prototype.readBookEventData = function(userId) {
  console.log("reading bookEventData from database for user " + userId);
  return bookEventTable().find(userId)
    .then(function(result) {
      var data = (result === undefined ? {} : JSON.parse(result["data"]));
      return new BookingManager(data);
    })
    .catch(function(error) {
      console.log(error);
    });
};

module.exports = BookingManager;
