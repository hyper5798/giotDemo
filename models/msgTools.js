var moment = require('moment');
var ParseDefine =  require('./parseDefine.js');
var JsonFileTools =  require('./jsonFileTools.js');
var listDbTools =  require('./listDbTools.js');
var settings =  require('../settings.js');
var deviceDbTools =  require('./deviceDbTools.js');
var mData,mMac,mRecv,mDate,mTimestamp,mType,mExtra ;
var obj;
var overtime = 24;
var hour = 60*60*1000;
var isNeedGWMac = settings.isNeedGWMac;//For blazing
//Save data to file path
var path = './public/data/finalList.json';
//var path2 = './public/data/gwMap.json';
//Save data
var finalList = {};
var macGwIdMapList;//For gateway map (key:mac value:id array)
var gwIdMacMapList;//For gateway map (key:id value:mac)
var mac_tag_map = {};
var type_tag_map = {};//For filter repeater message key:mac+type value:tag
var type_time_map = {};
//Save user choice device type,GW MAC
var selectType,selectMac;
var finalListId = '';

function init(){
    //finalList = JsonFileTools.getJsonFromFile(path);
    listDbTools.findByName('finalList',function(err,lists){
        if(err)
            return;
        console.log('lists[0] :\n'+JSON.stringify(lists[0]));
        finalList = lists[0].list;
        finalListId = lists[0]['_id'];
        console.log('finalListId :'+finalListId);
    });
}

init();

exports.parseMsg = function (msg) {
    console.log('MQTT message :\n'+JSON.stringify(msg));
    try {
        obj = JSON.parse(msg.toString());
    }
    catch (e) {
        console.log('msgTools parse json error message #### drop :'+e.toString());
        return null;
    }
    //Get data attributes
    mData = obj.data;
    mType = mData.substring(0,4);
    mMac  = obj.macAddr;
    mDate = moment(mRecv).format('YYYY/MM/DD HH:mm:ss');
    mExtra = obj.extra;
    mRecv = obj.recv;
    mTimestamp = new Date(mRecv).getTime();

    if(isSameTagCheck(mType,mMac,mRecv))
        return null;
    if(mType.indexOf('aa')!=-1)
        mInfo = parseDefineMessage(mData,mType);

    var msg = {mac:mMac,type:mType,data:mData,recv:mRecv,date:mDate,extra:mExtra,timestamp:mTimestamp};
    finalList[mMac]=msg;


    if(mInfo){
        console.log('**** '+msg.date +' mac:'+msg.mac+' => data:'+msg.data+'\ninfo:'+JSON.stringify(mInfo));
        msg.information=mInfo;
    }

    saveToDB(msg,finalList);

    return msg;
}

function saveToDB(obj,list){
    listDbTools.updateList('finalList',list,function(err,info){
        if(err){
            console.log("Save list to DB :"+err);
        }
        console.log("Save list to DB :"+info);
    });
    
    deviceDbTools.saveDeviceMsg(obj,function(err,info){
        if(err){
            console.log("saveDeviceMsg  :"+err);
        }
        console.log("saveDeviceMsg :"+info);
    });
}

exports.setFinalList = function (list) {
    finalList = list;
}

exports.getFinalList = function () {
    return finalList;
}

exports.saveFinalListToFile = function () {
    /*var json = JSON.stringify(finalList);
    fs.writeFile(path, json, 'utf8');*/
    JsonFileTools.saveJsonToFile(path,finalList);
}

exports.getDevicesData = function (type,devices) {
    var array = [];
    if(isNeedGWMac){
        //For blazing
        if(gwIdMacMapList === undefined || gwIdMacMapList === null){
            initMap();
        }
    }

    if(devices){
        for (var i=0;i<devices.length;i++)
        {
            //if(i==53){
              //console.log( '#### '+devices[i].mac + ': ' + JSON.stringify(devices[i]) );
            //}
            array.push(getDevicesArray(devices[i],i,type));
        }
    }

    var dataString = JSON.stringify(array);
    if(array.length===0){
        dataString = null;
    }
    return dataString;
};

exports.getFinalData = function (finalist) {
    var mItem = 1;
    var array = [];
    if(finalist){

        //console.log( 'Last Device Information \n '+JSON.stringify( mObj));

        for (var mac in finalist)
        {
            //console.log( '#### '+mac + ': ' + JSON.stringify(finalist[mac]) );

            array.push(getArray(finalist[mac],mItem));
            mItem++;
        }
    }

    var dataString = JSON.stringify(array);
    if(array.length===0){
        dataString = null;
    }
    return dataString;
};

function getArray(obj,item){

    var arr = [];
    var connection_ok = "<img src='/icons/connection_ok.png' width='30' height='30' name='status'>";
    var connection_fail = "<img src='/icons/connection_fail.png' width='30' height='30' name='status'>";
    /*if(item<10){
        arr.push('0'+item);
    }else{
        arr.push(item.toString());
    }*/
    arr.push(item);

    arr.push(obj.mac);
    arr.push(obj.date);
    arr.push(obj.extra.rssi);
    arr.push(obj.extra.snr);
    console.log('obj.overtime :'+obj.overtime);


    if( obj.overtime){
        arr.push(connection_fail);
        //console.log('overtime = true');
    }else{
        arr.push(connection_ok);
        //console.log('overtime = false');
    }
    //console.log('arr = '+JSON.stringify(arr));
    return arr;
}

function getType(p) {
    if (Array.isArray(p)) return 'array';
    else if (typeof p == 'string') return 'string';
    else if (p != null && typeof p == 'object') return 'object';
    else return 'other';
}

function parseDefineMessage(data){
   var mInfo = ParseDefine.getInformation(data);
   return mInfo;
}


//type_tag_map is local JSON object
function isSameTagCheck(type,mac,recv){
	var time =  moment(recv).format('mm');

	//Get number of tag
	var tmp = mData.substring(4,6);
	var mTag = parseInt(tmp,16)*100;//流水號:百位
        mTag = mTag + parseInt(time,10);//分鐘:10位及個位
	var key = mac.concat(type);
	var tag = type_tag_map[key];

	if(tag === undefined){
		tag = 0;
	}

	/* Fix 時間進位問題
		example : time 由59分進到00分時絕對值差為59
	*/
	if (Math.abs(tag - mTag)<2 || Math.abs(tag - mTag)==59){
		console.log('mTag=' +mTag+'(key:' +key + '):tag='+tag+' #### drop');
		return true;
	}else{
		type_tag_map[key] = mTag;
		console.log('**** mTag=' +mTag+'(key:' +key + '):tag='+tag +'=>'+mTag+' @@@@ save' );
		return false;
	}
}
