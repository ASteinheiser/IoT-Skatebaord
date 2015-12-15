var meshblu = require('meshblu');
var meshbluJSON = require('./meshblu.json');
var five = require("johnny-five");
var _ = require('lodash');
var Stats = require('fast-stats').Stats;

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

  var debouncedMessage = _.debounce(function(payload){
    conn.message({
      "devices": "*",
      "payload": payload
    });
  }, 750);

  var debouncingMessage = _.debounce(function(payload){
    conn.message({
      "devices": "*",
      "payload": payload
    });
  }, 750);

  conn.update({
    "uuid": uuid,
    "messageSchema": MESSAGE_SCHEMA
  });

  var board = new five.Board({
    port: "/dev/ttyMFD1"
  });

  board.on("ready", function() {
    var distance = 0;
    var i = 0;
    var dataSize = 5;
    var s = new Stats();
    var posPushThreshold = 0.17;
    var negPushThreshold = (-0.17);

    var reedSwitch = new five.Sensor.Digital(12);

    var imu = new five.IMU({
      controller: "MPU6050"
    });

    reedSwitch.on("change", function() {
      if (this.value == 1) {
        distance += ((70)*Math.PI)/1000;
        debouncingMessage({"distance(meters)": distance});
      }
    });

    imu.on("change", function() {
      if (i < dataSize) {
        s.push(this.accelerometer.y);
        i ++;
      } else {
        s.shift();
        s.push(this.accelerometer.y);

        var r = s.range();
        var diff = r[1] - r[0];

        if (r[1] > posPushThreshold && r[0] < negPushThreshold) {
          debouncedMessage({"push": true});
          i = 0;
          s.reset();
        }
      }
    });
  });
});
