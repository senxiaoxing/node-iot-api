'use strict';

var app = require('../server');
var fs = require('fs');
var path = require('path');

var router = module.exports.download_router = require('loopback').Router();

router.get('/', function(req, res){
    var serial_no = req.query.serial_no;
    var version = req.query.version;
    var device_cat_mas_ext = app.models.device_cat_mas_ext;
    var device_mas = app.models.device_mas;
    device_mas.findOne({
        where: {serial_no: serial_no}
    }, function(err, mas){
        if(err) throw err;
        if(mas){
            device_cat_mas_ext.findOne({
                where: {cat_id: mas.cat_id, firmware_version: version}
            }, function(err, firmware){
                if(err) throw err;
                if(firmware){
                    var base_path = 'c:/firmware';//IOT設備固件下載根路徑
                    var firmware_path = firmware.firmware_path;
                    var firmware_name = firmware.firmware_name;
                    var currFile = path.join(base_path, firmware_path);
                    var fReadStream;

                    fs.exists(currFile, function(exist){
                        if(exist){
                            res.set({
                                "Content-type":"application/octet-stream",
                                "Content-Disposition":"attachment;filename="+encodeURI(firmware_name)
                            });
                            fReadStream = fs.createReadStream(currFile);
                            fReadStream.on("data",(chunk) => res.write(chunk,"binary"));
                            fReadStream.on("end",function () {
                                res.statusCode = 200;
                                res.end();
                            });
                        }else{
                            res.statusCode = 404;
                            res.send({status: false, message: "File not exist"});
                        }
                    })
                }else{
                    res.statusCode = 404;
                    res.send({status: false, message: "Parameter error"});
                }
            });
        }else{
            res.statusCode = 404;
            res.send({status: false, message: "Parameter error"});
        }
    });
});