var app = require('../server');
var moment = require('moment');
var _ = require('lodash');
var router = module.exports.data_router = require('loopback').Router();

/** 根目錄為 api/data
router.get('/', function(req, res) {
    res.send('get api/data root');
  });*/

router.get('/device', function(req, res){
    var device_mas = app.models.device_mas;
    device_mas.find({
        fields: ['serial_no', 'dev_name', 'dev_desc', 'dev_icon', 'dev_order'],
        order: 'dev_order ASC'
    }, function(err, dev){
        if (err) res.send({status: false, message: err});
        res.send(dev);
    });
});

router.get('/type', function(req, res){
    var conn = app.dataSources.mysqlDs;
    var serial_no = req.query.serial_no;
    if (serial_no){
        var param = serial_no.split(',');
        var sql = 'select distinct m.type_code, m.type_name, m.type_desc, t.type_order from device_data_type t join device_data_type_mas m on m.type_id = t.type_id join device_cat_mas c on c.cat_id = t.cat_id join device_mas d on d.cat_id = c.cat_id where serial_no in (?) order by t.type_order';
        conn.connector.query(sql, param, function(err, rows){
            if(err) res.send({status: false, message: err});
            res.send(rows);
        });
    }else{
        var sql = 'select distinct m.type_code, m.type_name, m.type_desc, t.type_order from device_data_type t join device_data_type_mas m on m.type_id = t.type_id join device_cat_mas c on c.cat_id = t.cat_id join device_mas d on d.cat_id = c.cat_id order by t.type_order';
        conn.connector.query(sql, function(err, rows){
            if(err) res.send({status: false, message: err});
            res.send(rows);
        });
    }
});

router.get('/value', function(req, res){
    var device_data = app.models.device_data;
    var device_data_type_mas = app.models.device_data_type_mas;
    var device_mas = app.models.device_mas;
    var device_mas_ext = app.models.device_mas_ext;
    var serial_no = req.query.serial_no;
    var data_type = req.query.data_type;
    var date_from = req.query.date_from;
    var date_to = req.query.date_to;
    var days = req.query.days;

    changeDateByDays(days, date_from, date_to);

    device_data.find({
        where: {
            serial_no: serial_no,
            data_type: data_type,
            data_record_datetime: {between: [date_from, date_to]}
        },
        fields: {serial_no: true, data_type: true, data_record_datetime: true, data_value: true},
        order: ['data_type ASC', 'data_record_datetime ASC']
    }, function(err, d){
        if(err) throw err;

        var d_count = d.length;
        d.forEach(function(item_d){
            var arr_serial_no = [];
            var arr_data_type = [];
            var arr_data_record_datetime = [];
            var arr_data_value = [];
            arr_serial_no.push(item_d.serial_no);
            arr_data_type.push(item_d.data_type);
            arr_data_record_datetime.push(item_d.data_record_datetime);
            arr_data_value.push(item_d.data_value);
            item_d.dev_base = null;
            item_d.dev_adj = null;
            item_d.dev_adjfactor = null;
            item_d.dev_formula = null;
            
            d_count--;
            if(d_count <= 0){
                _.sortedUniq(arr_data_record_datetime);
                _.uniq(arr_data_type);
                _.sortedUniq(arr_data_value);

                device_mas.find({
                    where: {serial_no: {inq: arr_serial_no}}
                }, function(err, m){
                    if(err) throw err;

                    var m_count = m.length;
                    m.forEach(function(item_m){
                        var arr_dev_id = [];
                        arr_dev_id.push(item_m.dev_id);

                        m_count--;
                        if(m_count <= 0){
                            device_mas_ext.find({
                                where: {dev_id: {inq: arr_dev_id}, type_code: {inq: arr_data_type}}
                            }, function(err, me){
                                if(err) throw err;

                                for(var i=0; i<me.length; i++){
                                    for(var j=0; j<d.length; j++){
                                        if(me[i].type_code == d[j].data_type){
                                            d[j].dev_base = me[i].dev_base;
                                            d[j].dev_adj = me[i].dev_adj;
                                            d[j].dev_adjfactor = me[i].dev_adjfactor;
                                            d[j].dev_formula = me[i].dev_formula;

                                            exec_formula(d[j]);
                                        }
                                    }
                                }
                                var rangeVal = {};
                                if(d.length > 0){
                                    rangeVal = {
                                        min_date: val[0],
                                        max_data: allValues[allValues.length-1],
                                        min_data: allValues[0],
                                        data_type_count: arr_data_type.length
                                    };
                                }else{
                                    rangeVal = {
                                        min_date: '',
                                        max_data: '',
                                        min_data: '',
                                        data_type_count: 1
                                    };
                                }
                                device_data_type_mas.find({
                                    where: {type_code: data_type},
                                    fields: {type_code: true, type_name: true},
                                    order: 'type_code ASC'
                                }, function(err, types){
                                    if (err) throw err;

                                    var datas = {
                                        data: d,
                                        RangeVal: rangeVal,
                                        date: arr_data_record_datetime,
                                        data_type: types
                                    };
                                    res.send(datas);
                                });
                            });
                        }
                    })
                });
            }
        })
    });
});

router.get('/visitor', function(req, res){
    var visitor_log = app.models.visitor_log;
    var uuid = req.query.uuid;
    var visit_date = req.query.visit_date;
    var serial_no = req.query.serial_no;
    var serial_no_array = [];

    if(serial_no){
        serial_no_array = serial_no.split(',');
    }

    if(uuid && visit_date && serial_no){
        visitor_log.find({
            where: {
                uuid: uuid,
                start_date: {gte: visit_date},
                end_date: {lte: visit_date},
                serial_no: {inq: serial_no_array},//和一組數據匹配
            },
            fields: ['serial_no', 'visitor_company', 'visitor_name'],
        }, function(err, data){
            if (err){
                res.send({status: false, message: err});
            }
            else{
                res.send(data);
            }
        });
    }else{
        visitor_log.find({
            fields: ['serial_no', 'visitor_company', 'visitor_name'],
        }, function(err, data){
            if (err){
                res.send({status: false, message: err});
            }
            else{
                res.send(data);
            }
        });
    }
    
});

router.get('/list', function(req, res){
    var device_data = app.models.device_data;
    var serial_no = req.query.serial_no;
    var data_type = req.query.data_type;
    var date_from = req.query.date_from;
    var date_to = req.query.date_to;
    var days = req.query.days;
    var page = req.query.page;
    var rows = req.query.rows;
    var serial_no_array = [];
    var data_type_array = [];

    changeDateByDays(days, date_from, date_to);

    if(serial_no){
        serial_no_array = serial_no.split(',');
    }
    if(data_type){
        data_type_array = data_type.split(',');
    }

    device_data.find({
        where: {
            serial_no: {inq: serial_no_array},//和一組數據匹配
            data_type: {inq: data_type_array},
            data_record_datetime: {between: [date_from, date_to]}//gte:大於等於 lte:小於等於
        },
        fields: {original_data: false},
        limit: rows,
        skip: (parseInt(page)-1)*rows,//分頁
        order:'create_date DESC'
    }, function(err, d){
        if (err) throw err;

        var d_count = d.length;
        d.forEach(function(item){
            device_mas.findOne({
                where: {serial_no: item.serial_no}
            }, function(err, m){
                if (err) throw err;
                if(m){
                    item.dev_name = m.dev_name;

                    device_mas_ext.findOne({
                        where: {dev_id: m.dev_id, type_code: item.data_type}
                    }, function(err, me){
                        if (err) throw err;
                        item.dev_base = me ? me.dev_base : null;
                        item.dev_adj = me ? me.dev_adj : null;
                        item.dev_adjfactor = me ? me.dev_adjfactor : null;
                        item.dev_formula = me ? me.dev_formula : null;
                        exec_formula(item);

                        device_data_type_mas.findOne({
                            where: {type_code: item.data_type}
                        }, function(err, t){
                            if (err) throw err;

                            if (t){
                                item.type_name = t.type_name;
                            }

                            d_count--;
                            if(d_count <= 0){
                                for(var i = d.length; i>=0; i--){
                                    if(Object.getOwnPropertyNames(d[i]).length < 12){
                                        d.splice(i, 1);
                                    }
                                }
                                var jsonArray = {total: d.length, rows: d};
                                res.send(jsonArray);
                            }
                        });
                    });
                }
            });
        })
    });
});

function changeDateByDays(days, date_from, date_to){
    if(days){
        var day = parseInt(days)*-1;
        date_from = moment().add(day,'days').format('YYYY-MM-DD');
        date_to = moment().format('YYYY-MM-DD');
    }
    else{
        if(date_from){
            date_from = moment(date_from, 'YYYY-MM-DD HH:mm:ss');
        }
        if(date_to){
            if(date_to.length < 12){
                date_to = moment(date_to, 'YYYY-MM-DD 23:59:59');
            }
            else{
                date_to = moment(date_to, 'YYYY-MM-DD HH:mm:ss');
            }
        }
        else{
            date_to = moment().format('YYYY-MM-DD HH:mm:ss');
        }
    }
}

function exec_formula(item){
    if(item.dev_formula){
        item.dev_formula.replace('data_value', item.data_value);
        item.dev_formula.replace('dev_adjfactor', item.dev_adjfactor);
        item.dev_formula.replace('dev_adj', item.dev_adj);
        item.dev_formula.replace('dev_base', item.dev_base);
        item.dev_formula.replace('fn_max_num', 'max');
        item.dev_formula.replace('fn_min_num', 'min');
        item.data_value = item.dev_formula;
    }
}