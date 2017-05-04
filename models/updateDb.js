var deviceDbTools =  require('./deviceDbTools.js');
var moment = require('moment');
var debug = true;

exports.toUpdate = function () {
    deviceDbTools.findAllDevices(function(err,devices){
        if(err){
            console.log(err);
        }
        for(var i = 0; i < devices.length; i++){
           
            //Weather data not need save
            if(isTarget(devices[i])){
                /*Find delete target*/

                if(debug){
                    console.log('Updata DB format delete: '+devices[i].macAddr + ', type :'+devices[i].index);
                }   
                delDeviceById(devices[i]);
            
            }else{
                if(debug){
                    console.log('Updata DB format update: '+devices[i].macAddr + ', type :'+devices[i].index)
                }
                if(devices[i].info.data0){
                    console.log('info : '+devices[i].info);
                    updateDevice(devices[i]);
                }
            }
        }
    });
};



function isTarget(device){
    var mac = device.macAddr;
    if(mac === '040004b8'){
        return true;
    }else{
        return false;
    }
}

function updateDevice(device){
    var mInfo = {};
    //console.log('@@@@ device info:'+JSON.stringify(device.info));
    var mData = device.data;
    var mType =  mData.substring(0,4);
    if(mType === 'aa00'){
        mInfo.temperature  = device.info.data0;
        mInfo.humidity     = device.info.data1;
        mInfo.voltage      = device.info.data2;
    }else if(mType === 'aa03'){
        mInfo.frmaldehyde  = device.info.data0;
        mInfo.co2          = device.info.data1;
        mInfo.temperature  = device.info.data2;
        mInfo.humidity     = device.info.data3;
        mInfo.co           = device.info.data4;
        mInfo.pm10         = device.info.data5;
        mInfo.pm25         = device.info.data6;
        mInfo.tvoc         = device.info.data7;
    }else if(mType === 'aa01'){
        mInfo.pressure     = device.info.data0;
        mInfo.temperature  = device.info.data1;
        mInfo.humidity     = device.info.data2;
        mInfo.light        = device.info.data3;
        mInfo.uv           = device.info.data4;
        mInfo.rain         = device.info.data5;
    }
    var momObj = moment(device.recv_at);
    var mTime =  momObj.format('YYYY-MM-DD HH:mm:ss');
    var json = {info:mInfo,time:mTime};
    deviceDbTools.updateDeviceData(device._id,json);
}

function saveDevice(device){
    console.log('mac : '+ device.macAddr);
    console.log('data : '+ device.data);
    console.log('recv_at : '+ device.recv_at);
    deviceDbTools.saveDevice(device.macAddr,device.data,device.recv_at,function(err,info){
        console.log('Debug save Device -----------------------------');
        if(err){
            console.log('Debug save Device fail : '+err);
            return;
        }
        console.log('Debug save Device success ');
        console.log('Debug info.voltage : '+info.data4);
    });
    delDeviceById(device._id);
}

function delDeviceById(device){
    var _id = device._id;
    console.log('_id : '+ _id);
    deviceDbTools.removeDeviceById(_id,function(err,result){
        console.log('Debug remove Device By Id -----------------------------');
        if(err){
            console.log('Debug remove Device By Id fail : '+err);
        }
        console.log('Debug remove Device By Id success ');
    });
}