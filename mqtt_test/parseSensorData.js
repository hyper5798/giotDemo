
exports.getDataArray = function (data) {
	var arrDevice = [];
	var t1 = data.substring(0,4);
	var h1 = data.substring(4,8);
	var t2 = data.substring(8,12);
	var h2 = data.substring(12,16);
	console.log('data :'+data);
	console.log('t1 :'+t1);
	console.log('h1 :'+h1);
	console.log('t2 :'+t2);
	console.log('h2:'+h2);
	var t1Data = parseInt(t1,16)/10;
	var h1Data  = parseInt(h1,16)/10;
	var t2Data  = parseInt(t2,16)/10;
	var h2Data  = parseInt(h2,16)/10;
	arrDevice.push(t1Data);
	arrDevice.push(h1Data);
	arrDevice.push(t2Data);
	arrDevice.push(h2Data);

	return arrDevice;
};
