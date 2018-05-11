'use strict';
var moment = require('moment');
var path = require('path');
var app = require(path.resolve(__dirname, '../server'));

/********************                                   原生SQL的使用
app.get('/test11', function(req, res){
    var mysql = app.dataSources.mysqlDs;
    var sql = 'select * from device_mas';
    mysql.connector.query(sql, function(err, data){
        res.send(data);
    });
});
********************/

/********************                                   async/await用法 
var getData = function(){
    return new Promise(function(resolve, reject){
        app.models.device_mas.find(function(err, mas){
            if(err) reject(err);
            else resolve(mas);
        });
    })
}

var start = async () =>{
    var mas = await getData()
    console.log(mas.length)
}
start()
*********************/

/********************                                   relation的modelTo和modelFrom
app.get('/test14', function(req, res){
    var aa = app.models.device_cat_mas_ext;
    var cat = aa.relations.deviceCatMas.modelTo;//modelTo返回device_cat_mas，modelFrom返回device_cat_mas_ext
    cat.find(function(err, data){
        if(err) throw err;
        res.send(data);
    });
});
********************/

/*********************                                  api/data/type include链表查询
 app.get('/test1', function(req, res){//api/data/type用include链表查询
    get_allSerialNo().then(function(serialNo_arr){

        var device_data_type = app.models.device_data_type;
        var serial_no = req.query.serial_no;
        var param = [];

        if(serial_no){
            param = serial_no.split(',');
        }else{
            param = serialNo_arr;
        }

        device_data_type.find({
            include: [
                {
                    relation: 'deviceDataTypeMas',
                    scope: {
                        fields: ['type_code', 'type_name', 'type_desc']
                    }
                }, 
                {
                    relation: 'deviceCatMas',
                    scope: {
                        fields: [],
                        include:{
                            relation: 'deviceMas',
                            scope: {
                                where: {
                                    serial_no: {inq: param}
                                }, 
                                fields: ['serial_no']
                            }
                        }
                    }
                }
            ], 
            fields: ['cat_id', 'type_id', 'type_order'],
            order: 'type_order DESC'
        }, function(err, data){
            if(err) throw err;
            
            var type_array = [];
            for(var i=data.length-1; i>=0;i--){
                var json = data[i].toJSON();
                if(json.deviceCatMas.deviceMas.length==0){
                    data.splice(i, 1);
                }else{
                    var obj = {};
                    obj.type_code = json.deviceDataTypeMas.type_code;
                    obj.type_name = json.deviceDataTypeMas.type_name;
                    obj.type_desc = json.deviceDataTypeMas.type_desc;
                    obj.type_order = json.type_order;
                    type_array.push(obj);
                }
            }
            console.log(data.length);
            res.send(type_array);
        });
    }).catch(function(err){
        return res.send(err);
    });
});
var get_allSerialNo = function(){
    return new Promise(function(resolve, reject){
        var device_mas = app.models.device_mas;
        device_mas.find(function(err, dev){
            if(err) reject(err);
            var serialNo_arr = [];
            dev.forEach(function(item){
                serialNo_arr.push(item.serial_no);
            })
            resolve(serialNo_arr);
        })
    })
}
 ********************/

/********************                                   用計數器解決異步循環陷阱
app.get('/test6', function(req, res){
    var device_data_type = app.models.device_data_type;
    var device_data_type_mas = app.models.device_data_type_mas;
    var arr = [];

    device_data_type.find({
        order: 'type_order ASC'
    }, function(err, data){
        if (err) throw err;

        var count = data.length;
        data.forEach(function(item){
            var obj = {};
            device_data_type_mas.findOne({
                where: {type_id: item.type_id}
            }, function(err, mas){
                if (err) throw err;
                obj.type_code = mas.type_code;
                obj.type_name = mas.type_name;
                obj.type_desc = mas.type_desc;
                obj.order = item.type_order;
                arr.push(obj);
                count--;
                if(count <= 0) res.send(arr);
            });
        })
    });
});
********************/

/********************                                   多个promise的执行顺序
app.get('/test9', function(req, res){
        new Promise(function(resolve, reject){
            new Promise(function(resolve, reject){
                console.log('1');
                resolve();
            }).then(function(){
                console.log('2');
            });
            console.log('3');
            resolve();
        }).then(function(){
            console.log('4');
            res.send('success');
        });//輸出1,3,2,4
    });
********************/

/********************                                   promise.all()的用法
var dev = app.models.device_mas;
var cat = app.models.device_cat_mas;
Promise.all([
    dev.find(), 
    cat.find()
])
.then(function(result){
    const a = result[0]
    const b = result[1]
    console.log(a.length);
    console.log(b.length);
})
.catch(function(err){
    throw err;
});
 ********************/

/********************                                   promise.then的参数是上一个的返回值
app.get('/test13', function(req, res){
    var device_cat_mas_ext = app.models.device_cat_mas_ext;
    var device_mas = app.models.device_mas;
    var serial_no = 'IoT001';
    var version = '1.0.0.0';
    new Promise(function(resolve, reject){
        device_mas.findOne({
            where: {serial_no: serial_no}
        }, function(err, mas){
            if(err) throw err;
            resolve(mas);
        });
    }).then(function(mas){
        if(mas){
            return device_cat_mas_ext.findOne({
                where: {cat_id: mas.cat_id, firmware_version: version}
            });
        }else{
            res.statusCode = 404;
            res.send({status: false, message: "Parameter error1"});
        }
    }).then(function(firmware){
        if(firmware){
            var path = require('path');
            var fs = require('fs');
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
            res.send({status: false, message: "Parameter error2"});
        }
    }).catch(function(err){
        console.log(err);
        res.end();
    });
});
********************/

/********************                                   obj的用法
var obj = {};
obj['a'] = 1;
if(obj.hasOwnProperty('a')){
    console.log('obj对象里已存在这个属性')
}
********************/

/********************                                   闭包的用法
 * 闭包就是能够读取其他函数内部变量的函数
 * 闭包可以理解成“return定义在一个函数内部的函数”
 * 本质上，闭包是将函数内部和函数外部连接起来的桥梁。
function iteratorFactory(i){
    var onclick = function(e){
        console.log(i)
    }
    return onclick;
}
var clickBoxs = document.querySelectorAll('.clickBox')
for (var i = 0; i < clickBoxs.length; i++){
    clickBoxs[i].onclick = iteratorFactory(i)//clickBoxs[i].onclick 现在是一个引用了i的闭包
}
********************/

/********************                                   Map的用法

********************/

/********************                                   Map的用法

********************/