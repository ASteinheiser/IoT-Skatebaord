var meshblu = require('meshblu');
var meshbluJSON = require('./meshblu.json');
var five = require("johnny-five");
var _ = require('lodash');

var uuid    = meshbluJSON.uuid;
var token   = meshbluJSON.token;

var conn = meshblu.createConnection({
  "uuid": uuid,
  "token": token
});

var MESSAGE_SCHEMA = {
  "type": 'object',
  "properties": {
    "wheelDiameter": {
      "type": "integer"
    }
  }
};

conn.on('notReady', function(data){
  console.log('UUID FAILED AUTHENTICATION!');
  console.log(data);
});

conn.on('ready', function(data){
  console.log('UUID AUTHENTICATED!');
  console.log(data);

  var throttledMessage = _.throttle(function(payload){
    conn.message({
      "devices": "*",
      "payload": payload
    });
  }, 500);

  conn.update({
    "uuid": uuid,
    "messageSchema": MESSAGE_SCHEMA
  });

  var board = new five.Board({
    port: "/dev/ttyMFD1"
  });

  board.on("ready", function() {
    var imu = new five.IMU({
      controller: "MPU6050"
    });

    var hallEffect = new five.Sensor.Digital(12);

    var distance = 0;

    hallEffect.on("change", function() {

      if (this.value == 0) {
        distance += ((70)*Math.PI)/1000;
        console.log("total distance: " + distance);

        throttledMessage({"distance": Math.round(distance * 100) / 100});
      }
    });

    imu.on("change", function() {
      throttledMessage({"accel": this.accelerometer.y});
    });
  });
});
