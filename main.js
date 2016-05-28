var meshblu = require('meshblu');
var meshbluJSON = require('./meshblu.json');
var five = require("johnny-five");

var edison = new five.Board({
  port: "/dev/ttyMFD1"
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

function sendMessage(message){
  conn.message({
    "devices": ["*"],
    "payload": message
  });
};

var uuid = meshbluJSON.uuid;
var token = meshbluJSON.token;

var conn = meshblu.createConnection({
  "uuid": uuid,
  "token": token
});

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
    "optionsSchema": OPTIONS_SCHEMA,
    "type": "device:iot-skateboard",
    "logoUrl": "https://s3-us-west-2.amazonaws.com/octoblu-icons/device/iot-skateboard.svg"
  });

  edison.on("ready", function() {

    var zAccel = new five.Sensor.Analog(5);
    var yAccel = new five.Sensor.Analog(6);
    var xAccel = new five.Sensor.Analog(7);

    conn.on('message', function(message){
      if (message.reset == true) {
        console.log('reset');
      }
    });

    zAccel.on("change", function() {
      console.log("Z accelerometer: ", this.value)
    });

    yAccel.on("change", function() {
      console.log("Y accelerometer: ", this.value)
    });

    xAccel.on("change", function() {
      console.log("X accelerometer: ", this.value)
    });
  });
});
