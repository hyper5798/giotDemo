var deviceDbTools =  require('./deviceDbTools.js');
var JsonFileTools =  require('./jsonFileTools.js');
var UnitDbTools =  require('./unitDbTools.js');

var recv = new Date();
//var devices = dbTools.findByMac(mac);
//console.log('find '+devices.length+' records');
var name　 = '瓜棚下感應裝置';
var choise = 3;
var step = 0;//0 change device info, 1:delete no info device

deviceDbTools.findAllDevices(function(err,devices){
    if(err){
        console.log(err);
    }
    for(var i = 0; i < devices.length; i++){
        
        if(devices[i].info == null){
            console.log('devices ('+i+'): '+devices[i]);
            console.log('info : '+devices[i].info);
            saveDevice(devices[i]);
        }else{
            console.log('devices with info ('+i+'): '+devices[i]);
        }
    }
});

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

function delDeviceById(_id){
    console.log('_id : '+ _id);
    deviceDbTools.removeDeviceById(_id,function(err,result){
        console.log('Debug remove Device By Id -----------------------------');
        if(err){
            console.log('Debug remove Device By Id fail : '+err);
        }
        console.log('Debug remove Device By Id success ');
    });
}