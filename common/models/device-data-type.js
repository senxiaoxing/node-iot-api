'use strict';

module.exports = function(Devicedatatype) {
    Devicedatatype.disableRemoteMethodByName('exists',true);
    Devicedatatype.disableRemoteMethodByName('replaceById',true);
    Devicedatatype.disableRemoteMethodByName('createChangeStream',true);
    Devicedatatype.disableRemoteMethodByName('count',true);
    
    Devicedatatype.link_type_get = function(cat_id, cb){
        if (cat_id){
            var device_cat_mas = Devicedatatype.app.models.device_cat_mas;
            device_cat_mas.find({
                where: {cat_id: cat_id},
                order: 'cat_order ASC'
            }, function(err, cat){
                if(err) throw err;

                Devicedatatype.find({
                    where: {cat_id: cat_id},
                    fields: ['cat_id', 'type_id', 'type_order'],
                    order: 'type_order ASC'
                }, function(err, type){
                    if (err) throw err;

                    var count = type.length;
                    var device_data_type_mas = Devicedatatype.app.models.device_data_type_mas;
                    type.forEach(function(item){
                        device_data_type_mas.findOne({
                            where: {type_id: item.type_id}
                        }, function(err, type_mas){
                            if (err) throw err;

                            if(type_mas){
                                item.type_id = type_mas.type_id;
                                item.type_code = type_mas.type_code;
                                item.type_name = type_mas.type_name;
                                item.type_icon = type_mas.type_icon;
                            }
                            count--;
                            if(count <= 0){
                                for(var i = type.length-1; i>=0; i--){
                                    if(Object.getOwnPropertyNames(type[i]).length < 6){
                                        type.splice(i, 1);
                                    }
                                }
                                var query = {cat: cat[0], type: type};
                                // res.statusCode = 200;
                                cb(null, query);
                            }
                        });
                    })
                });
            });
        }else{
            // res.statusCode = 404;
            var query = {status: false, message: 'No users were found'};
            cb(null, query);
        }
    };

    Devicedatatype.remoteMethod('link_type_get', {
        description: '',
        accepts: {arg: 'cat_id', type: 'string'},
        returns: {arg: 'model', type: 'object'},
        http: {path: '/link_type', verb: 'get'}
    });

    Devicedatatype.afterRemote('link_type_get', function (context, result, next){
        var res = context.res;
        if(result && result.model.status === false){
            res.statusCode = 404;
        }else{
            res.statusCode = 200;
        }
        return next();
    });
};
