'use strict';

var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');

chai.use(chaiAsPromised);
var expect = require('chai').expect;
var should = require('chai').should;

var DBhelper = require('../db_helper');
chai.config.includeStack = true;

describe('DBhelper', function(){

  describe("#readRoomDateRecords()", function(){

    var subject = new DBhelper();

    var record =       {
            "RoomDate": "joy room 2017-03-27",
            "RoomName": "joy room",
            "Owner": "dana",
            "Name": "yoga class",
            "Date": "2017-03-27",
            "StartTime": "17:00",
            "Duration": "PT60M"
          }

    it ('should return the record passed in', function(done) {

      var fakeBookedEventsTable = function() {
        return {
          findAll: function() {
            return new Promise(function(resolve, reject) {
              resolve(record);
            });
          }
        }
      }

      var subject = new DBhelper(fakeBookedEventsTable);

      subject.readRoomDateRecords("joy room 2017-03-27").then(function(candidate) {
        expect(candidate).to.equal(record);
        done();
      });
    });

    it ('should throw an error', function(done) {

      var fakeBookedEventsTable = function() {
        return {
          findAll: function() {
            return new Promise(function(resolve, reject){
              reject('Error');
            });
          }
        }
      }

      var subject = new DBhelper(fakeBookedEventsTable);

      subject.readRoomDateRecords().then(function(candidate) {
        expect(candidate).not.to.equal(record);
        done();
      });
    });
  });

  describe("#readRoomDateRecordsForTime()", function(){

    var subject = new DBhelper();

    var items = [
        {
          "RoomDate": "joy room 2017-03-27",
          "RoomName": "joy room",
          "Owner": "dana",
          "Name": "yoga class",
          "Date": "2017-03-27",
          "StartTime": "17:00",
          "Duration": "PT60M"
        },
        {
          "RoomDate": "living room 2017-03-28",
          "RoomName": "living room",
          "Owner": "evgeny",
          "Name": "software conference",
          "Date": "2017-03-28",
          "StartTime": "13:00",
          "Duration": "PT1H"
        },
        {
          "RoomDate": "big room 2017-03-29",
          "RoomName": "big room",
          "Owner": "stefan",
          "Name": "snore meditation",
          "Date": "2017-03-29",
          "StartTime": "14:00",
          "Duration": "PT30M"
        }
      ];

    it ('should return the ongoing event', function(done) {

      var thenable = { then: function(resolve) {
        resolve(items);
      }};

      var fakeBookedEventsTable = function() {
        return {
          findAll: function() {
            return Promise.resolve({
              then: function(onFulfill, onReject) { onFulfill(items)}
            });
          }
        }
      }

      var subject = new DBhelper(fakeBookedEventsTable);

      console.log("HERE", subject);
      console.log("HERE3", fakeBookedEventsTable);



    //   subject.readRoomDateRecords("joy room 2017-03-27").then(function(candidate) {
    //     expect(candidate).to.equal(record);
    //     done();
    //   });
    // });

      subject.readRoomDateRecordsForTime("big room 2017-03-29", "2017-03-29", "14:00").then(function(candidate) {
           console.log("callback", candidate);
           console.log("callback2", candidate);
          //  var ongoingEvent = records.find(function(record){
          //    var searchTime = moment(new Date(date2).toISOString().slice(0,10) + " " + time);
          //    var start = moment(new Date(record.Date).toISOString().slice(0,10) + " " + record.StartTime);
          //    var duration = moment.duration(record.Duration, moment.ISO_8601).asMinutes();
          //    var end = start.clone().add(duration, 'minutes');
          //    if (start <= searchTime && searchTime <= end) {
          //      return record;
          //    }
          //  });
          //  return ongoingEvent;
           expect(candidate).to.equal({
                     "RoomDate": "big room 2017-03-29",
                     "RoomName": "big room",
                     "Owner": "stefan",
                     "Name": "snore meditation",
                     "Date": "2017-03-29",
                     "StartTime": "14:00",
                     "Duration": "PT30M"
                   });
        done();
        });
    });

  });

});
