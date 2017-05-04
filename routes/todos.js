var express = require('express');
var router = express.Router();
var UnitDbTools = require('../models/unitDbTools.js');
var async = require('async');
var DeviceDbTools = require('../models/deviceDbTools.js');
var moment = require('moment');

/* GET home page. */
router.get('/', function(req, res, next) {
  if(req.session.user){
  	UnitDbTools.findAllUnits(function(err,units){
  		return res.json(units);
  	});
  }else{
  	return res.json('No limit');
  }
});

module.exports = router;