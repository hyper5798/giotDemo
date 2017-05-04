var parseSensorData = require('./parseSensorData');
var arr = parseSensorData.getDataArray('010d01ffc9010c01');
for (var i = 0; i < arr.length; i++) {
    // Iterate over numeric indexes from 0 to 5, as everyone expects.
    console.log('data'+i+' : '+arr[i]);
}