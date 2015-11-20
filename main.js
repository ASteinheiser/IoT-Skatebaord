var five = require("johnny-five");
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

    // console.log("accelerometer");
    // console.log("  x            : ", this.accelerometer.x);
    //console.log("  y            : ", this.accelerometer.y);
    // console.log("  z            : ", this.accelerometer.z);
    // console.log("  pitch        : ", this.accelerometer.pitch);
    // console.log("  roll         : ", this.accelerometer.roll);
    // console.log("  acceleration : ", this.accelerometer.acceleration);
    // console.log("  inclination  : ", this.accelerometer.inclination);
    // console.log("  orientation  : ", this.accelerometer.orientation);
    // console.log("--------------------------------------");

    if (this.accelerometer.y >= 0.9){
      console.log("------------ Push in progress!! ------------");
    }

    // console.log("gyro");
    // console.log("  x            : ", this.gyro.x);
    // console.log("  y            : ", this.gyro.y);
    // console.log("  z            : ", this.gyro.z);
    // console.log("  pitch        : ", this.gyro.pitch);
    // console.log("  roll         : ", this.gyro.roll);
    // console.log("  yaw          : ", this.gyro.yaw);
    // console.log("  rate         : ", this.gyro.rate);
    // console.log("  isCalibrated : ", this.gyro.isCalibrated);
    // console.log("--------------------------------------");

    // console.log("temperature");
    // console.log("  celsius      : ", this.temperature.celsius);
    // console.log("  fahrenheit   : ", this.temperature.fahrenheit);
    // console.log("  kelvin       : ", this.temperature.kelvin);
    // console.log("--------------------------------------");
  });
});
