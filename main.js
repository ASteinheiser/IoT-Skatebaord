var meshblu = require('meshblu');
var meshbluJSON = require('./meshblu.json');

var five = require("johnny-five");

var uuid    = meshbluJSON.uuid;
var token   = meshbluJSON.token;

var conn = meshblu.createConnection({
  "uuid": uuid,
  "token": token
});

var MESSAGE_SCHEMA = {
  "type": 'object',
  "properties": {
    "example": {
      "type": "string"
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

    //var hallEffect = new five.Sensor.Digital(2);
    var hallEffect = new five.Sensor({
      pin: "12",
      freq: 100,
      type: "digital"
    });

    var distance = 0;

    hallEffect.on("change", function() {
      if (this.value == 0) {
        distance += (70*Math.PI)/1000;
        console.log("total distance:    " + Math.round(distance * 100) / 100 + " meters");
      }
    });

    imu.on("change", function() {

      if (this.accelerometer.y >= 0.9){
        console.log("------------ Push in progress!! ------------");
        conn.message({
        "devices": "*",
        "payload": {
          "action":"push",
          "accel": this.accelerometer.y
        }
      });
      }


    });
  });

});
