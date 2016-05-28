var meshblu = require('meshblu');
var meshbluJSON = require('./meshblu.json');
var five = require("johnny-five");
var _ = require("lodash");

// var MESSAGE_SCHEMA = {
//   "type": "object",
//   "properties": {
//     "reset": {
//       "type": "boolean",
//       "default": false
//     }
//   }
// };
//
// var OPTIONS_SCHEMA = {
//   "type": "object",
//   "properties": {
//     "wheelDiameter": {
//       "type": "integer"
//     }
//   }
// };

function sendMessage(message){
  conn.message({
    "devices": ["*"],
    "payload": message
  });
};

var edison = new five.Board({
  port: "/dev/ttyMFD1"
});

var uuid = meshbluJSON.uuid;
var token = meshbluJSON.token;

var conn = meshblu.createConnection({
  "uuid": uuid,
  "token": token
});

conn.on('notReady', function(data){
  console.log('UUID FAILED AUTHENTICATION!', data);
  sendMessage("UUID FAILED AUTH: ", data);
});

conn.on('config', function(device){
  // wheelDiameter = device.options.wheelDiameter;
});

conn.on('ready', function(data){
  console.log('UUID AUTHENTICATED!');
  console.log(data);
  sendMessage('Device Ready')

  conn.whoami({}, function(device){
    // wheelDiameter = device.options.wheelDiameter;
  });

  conn.update({
    "uuid": uuid,
    "messageSchema": MESSAGE_SCHEMA,
    "optionsSchema": OPTIONS_SCHEMA,
    "type": "device:iot-skateboard",
    "logoUrl": "https://s3-us-west-2.amazonaws.com/octoblu-icons/device/iot-skateboard.svg"
  });

  edison.on("ready", function() {

    var zAccel = new five.Sensor.Analog(0);
    var yAccel = new five.Sensor.Analog(6);
    var xAccel = new five.Sensor.Analog(7);

    conn.on('message', function(message){
      // if (message.reset == true) {
      //   console.log('reset');
      // }
    });

    zAccel.on("change", function() {
      _.throttle(console.log("Z accelerometer: ", this.value), 500);
    });

    yAccel.on("change", function() {
      _.throttle(console.log("Y accelerometer: ", this.value), 500);
    });

    xAccel.on("change", function() {
      _.throttle(console.log("X accelerometer: ", this.value), 500);
    });
  });
});
