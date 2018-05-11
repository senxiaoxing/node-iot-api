'use strict';
const uuidv4 = require('uuid/v4');

module.exports = function(Devicecatmas) {
    Devicecatmas.disableRemoteMethodByName('exists',true);
    Devicecatmas.disableRemoteMethodByName('replaceById',true);
    Devicecatmas.disableRemoteMethodByName('createChangeStream',true);
    Devicecatmas.disableRemoteMethodByName('count',true);

    //post-> Device Categories
    Devicecatmas.devicecat_post = function(cat_id, cat_type, cat_name, cat_order, cat_desc, data_type, cb){
        if (!cat_id){
            cat_id = uuidv4();
            if(!cat_order){
                Devicecatmas.findOne({
                    order: 'cat_order DESC'
                }, function(err, dev){
                    if(err) return cb(err);
                    Devicecatmas.create({
                        cat_id : cat_id,
                        cat_type : cat_type,
                        cat_name : cat_name,
                        cat_order : dev.cat_order+1,//找出最大的cat_order, 然後加1
                        cat_desc : cat_desc
                    }, function(err, m){
                        if (err) return cb(err);
        
                        linkDeviceDataType(data_type, cat_id, m, cb);
                    });
                });
            }else{
                Devicecatmas.create({
                    cat_id : cat_id,
                    cat_type : cat_type,
                    cat_name : cat_name,
                    cat_order : cat_order,
                    cat_desc : cat_desc
                }, function(err, m){
                    if (err) return cb(err);
    
                    linkDeviceDataType(data_type, cat_id, m, cb);
                });
            }
        }else{
            Devicecatmas.updateAll({cat_id: cat_id}, {
                cat_id : cat_id,
                cat_type : cat_type,
                cat_name : cat_name,
                cat_order : cat_order,
                cat_desc : cat_desc
            }, function(err, update_info, count){
                if (err) return cb(err);
                var device_data_type = Devicecatmas.app.models.device_data_type;
                device_data_type.destroyAll({cat_id: cat_id}, function(err, destroy_info, count){
                    if (err) return cb(err);

                    linkDeviceDataType(data_type, cat_id, update_info, cb);
                });
            })
        }
    };

    Devicecatmas.remoteMethod('devicecat_post', {
        description: '',
        accepts:[{arg: 'cat_id', type: 'string'},
                {arg: 'cat_type', type: 'string'},
                {arg: 'cat_name', type: 'string'},
                {arg: 'cat_order', type: 'number'},
                {arg: 'cat_desc', type: 'string'},
                {arg: 'data_type', type: 'array'}
            ],
        returns: {arg: 'model', type: 'object'
        },
        http:{path: '/', verb: 'post'
        }
    });

    //關聯模型device_data_type
    function linkDeviceDataType(data_type, cat_id, obj, cb){
        if(data_type){
            var idx = 1;
            var device_data_type_2 = Devicecatmas.app.models.device_data_type;
            data_type.forEach(function(item){
                device_data_type_2.create({
                    cat_id: cat_id,
                    type_id: item,
                    type_order: idx
                }, function(err, model){
                    if (err) return cb(err);
                    idx++;
                    if(idx > data_type.length){
                        cb(null, obj);
                    }
                });
            });
        }else{cb(null, obj);}
    }
};
