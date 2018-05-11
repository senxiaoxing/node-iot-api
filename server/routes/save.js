var app = require('../server');
const uuidv4 = require('uuid/v4');
var router = module.exports.save_router = require('loopback').Router();

/**根目錄為 api/save 
router.get('/', function(req, res) {
  res.send('get api/save root');
});*/

router.post('/device', function(req, res) {
    var device_mas = app.models.device_mas;
    var data = JSON.parse(req.body.data);
    var cat_id = data.cat_id;
    var serial_no = data.serial_no;
    var dev_name = data.dev_name;
    var dev_desc = data.dev_desc;
    var dev_icon = data.dev_icon;
    var dev_order = data.dev_order;

    if(data && cat_id && serial_no && dev_name){
        device_mas.findOrCreate(//可用於判斷是否存在，相當於exist()
        {where: {serial_no: serial_no}},
        {
            dev_id: uuidv4(),
            cat_id: cat_id,
            serial_no: serial_no,
            dev_name: dev_name,
            dev_desc: dev_desc,
            dev_icon: dev_icon,
            dev_order: dev_order
        }, function(err, dev, isCreated){
            if (err) return res.send({status: false, message: err});

            if(isCreated){
                res.send(dev);
            }
            else{
                res.send({status: false, message: 'Device already exists!'});
            }
        });
    }
    else{
        res.send({status: false, message: 'Parameter error'});
    }
});

router.post('/value', function(req, res) {
    var device_data = app.models.device_data;
    var data = JSON.parse(req.body.data);
    
    if(data){
        data.forEach(function(item){//给data里的每个对象加一个original_data属性
            var arr_origin = [];
            arr_origin.push(item.serial_no);
            arr_origin.push(item.data_type);
            arr_origin.push(item.data_record_datetime);
            arr_origin.push(item.data_value);
            var original_data = arr_origin.join() + ';';

            item.original_data = original_data;
        })
        device_data.create(data, function(err, dev_data){//批量上傳
            if (err) return res.send({status: false, message: err});
        
            res.send({status: true, cnt: dev_data});
        });
    }else{
        res.send({status: false, message: 'Parameter error'});
    }
});