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

    it ('should return the ongoing event', function() {

      var fakeBookedEventsTable = function() {
        return {
          findAll: function() {
            return new Promise(function(resolve){
              resolve(items);
            });
          }
        }
      }

      var subject = new DBhelper(fakeBookedEventsTable);
      console.log("promise1", subject.readRoomDateRecordsForTime("big room 2017-03-29", "2017-03-29", "14:00"));
      // the promise is pending //

      return expect(subject.readRoomDateRecordsForTime("big room 2017-03-29", "2017-03-29", "14:00")).to.eventually.equal({
                "RoomDate": "big room 2017-03-29",
                "RoomName": "big room",
                "Owner": "stefan",
                "Name": "snore meditation",
                "Date": "2017-03-29",
                "StartTime": "14:00",
                "Duration": "PT30M"
              });


      // .then(function(candidate) {
      //      console.log("callback", candidate);
      //      expect(candidate).to.eventually.equal({
      //                "RoomDate": "big room 2017-03-29",
      //                "RoomName": "big room",
      //                "Owner": "stefan",
      //                "Name": "snore meditation",
      //                "Date": "2017-03-29",
      //                "StartTime": "14:00",
      //                "Duration": "PT30M"
      //              });
      // });
    });

  });

});
