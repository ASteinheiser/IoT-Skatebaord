var meshblu = require('meshblu');
var meshbluJSON = require('./meshblu.json');
var five = require("johnny-five");
var _ = require('lodash');
var Stats = require('fast-stats').Stats;

var uuid    = meshbluJSON.uuid;
var token   = meshbluJSON.token;

var edison = new five.Board({
  port: "/dev/ttyMFD1"
});

var push = 0, distance = 0, wheelDiameter = 0, index = 0;
var sampleSize = 5;
var sample = new Stats();
var posPushThreshold = 0.17;
var negPushThreshold = (-0.17);

var skateData = {
  pushes: 0,
  distance: 0
};

function sendMessage(message){
  conn.message({
    "devices": "*",
    "payload": message
  });
};

function resetData(){
  skateData = {pushes: 0, distance: 0};
  distance = 0;
  push = 0;
  index = 0;
  sample.reset();
};

function resetSessions(){
  savedSessions = [];
  updateSession(savedSessions);
};

var conn = meshblu.createConnection({
  "uuid": uuid,
  "token": token
});

var MESSAGE_SCHEMA = {
  "type": "object",
  "properties": {
    "reset": {
      "type": "boolean",
      "default": false
    }
  }
};

var OPTIONS_SCHEMA = {
  "type": "object",
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

conn.on('config', function(device){
  wheelDiameter = device.options.wheelDiameter;
});

conn.on('ready', function(data){
  console.log('UUID AUTHENTICATED!');
  console.log(data);

  conn.whoami({}, function(device){
    wheelDiameter = device.options.wheelDiameter;
  });

  conn.update({
    "uuid": uuid,
    "messageSchema": MESSAGE_SCHEMA,
    "optionsSchema": OPTIONS_SCHEMA
  });

  edison.on("ready", function() {

    var reedSwitch = new five.Sensor.Digital(12);
    var accelerometer = new five.IMU({controller: "MPU6050"});

    conn.on('message', function(message){
      if (message.payload.reset == true) {
        resetData();
      }
    });

    reedSwitch.on("change", function() {
      if (this.value == 1) {
        distance += (wheelDiameter*Math.PI)/1000;
        skateData.distance = distance;
        sendMessage(skateData);
      }
    });

    accelerometer.on("change", function() {
      if (index < sampleSize) {
        sample.push(this.accelerometer.y);
        index ++;
      } else {
        sample.shift();
        sample.push(this.accelerometer.y);

        var range = sample.range();

        if (range[1] > posPushThreshold && range[0] < negPushThreshold) {
          push ++;
          skateData.pushes = push;
          sendMessage(skateData);
          index = 0;
          sample.reset();
        }
      }
    });
  });
});
