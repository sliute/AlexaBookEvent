'use strict';
module.change_code = 1;
var _= require('lodash');

function BookingManager(obj) {
  this.started = false;
  this.bookingIndex = 0;
  this.currentStep = 0;
  this.bookingScript = [
    {
      "template": "the room has been booked for ${date} at ${start_time} by ${owner} for ${title} for ${duration}",
      "steps": [
        {
          "value": null,
          "template_key": "date",
          "prompt": "a date",
        },
        {
          "value": null,
          "template_key": "start_time",
          "prompt": "a start time",
        },
        {
          "value": null,
          "template_key": "owner",
          "prompt": "your name",
        },
        {
          "value": null,
          "template_key": "title",
          "prompt": "an event title",
        },
        {
          "value": null,
          "template_key": "duration",
          "prompt": "a duration",
        }]
    }
  ];
  for (var prop in obj) this[prop] = obj[prop];
}

BookingManager.prototype.currentBookingScript = function() {
  return this.bookingScript[this.bookingIndex];
};

BookingManager.prototype.completed = function() {
  return this.currentStep === (this.currentBookingScript().steps.length - 1);
};

BookingManager.prototype.printBooking = function() {
  var currentBooking = this.currentBookingScript();
  var values = _.reduce(currentBooking.steps, function(accumulator, step) {
    accumulator[step.template_key] = step.value;
    return accumulator;
  }, {});
  var compiledBooking = _.template(currentBooking.template);
  return compiledBooking(values);
};


module.exports = BookingManager;
