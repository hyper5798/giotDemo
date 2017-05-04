"use strict";
/* 
 * Firmata Demo 
 * Blink Example
 */

 var serialPort = "COM3";
 var connector = require('./firmataConnector');
 var arduino = connector(serialPort);
 var isOn = false;
 var sendValue = false;

 arduino.on('connection', function() {//Listen connection
 	/* pin mode */
	
 	arduino.pinMode(9, arduino.OUTPUT);
	arduino.pinMode(10, arduino.INPUT);
 	/* blink example */
 	setInterval(function(){
		if(isOn != sendValue){
			isOn = sendValue;
			if(sendValue) {
				arduino.digitalWrite(9, arduino.HIGH);
			} else {
				arduino.digitalWrite(9, arduino.LOW);
			}
		}
		//console.log(new Date()+'********************'+isOn);
	}, 500);
 });

 exports.setSwitch = function (value) {
	sendValue = value;
	//console.log(new Date()+'********************'+sendValue);
 }