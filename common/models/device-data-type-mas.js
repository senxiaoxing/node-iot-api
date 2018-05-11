'use strict';
const uuidv4 = require('uuid/v4');

module.exports = function(Devicedatatypemas) {
    Devicedatatypemas.disableRemoteMethodByName('exists',true);
    Devicedatatypemas.disableRemoteMethodByName('replaceById',true);
    Devicedatatypemas.disableRemoteMethodByName('createChangeStream',true);
    Devicedatatypemas.disableRemoteMethodByName('count',true);
    
    Devicedatatypemas.type_post = function(type_id, type_code, type_name, type_order, type_desc, cb){
        if (!type_id){
            type_id = uuidv4();
        }
        if(!type_order){
            Devicedatatypemas.findOne({
                order: 'type_order DESC'
            }, function(err, dev){
                if(err) return cb(err);
                type_order = dev.type_order+1;//最大的type_order加1
                upsertWithWhere(type_id, type_code, type_name, type_order, type_desc, cb);
            });
        }else{upsertWithWhere(type_id, type_code, type_name, type_order, type_desc, cb);}
    };
    
    Devicedatatypemas.remoteMethod('type_post', {
        description: '',
        accepts:[{arg: 'type_id', type: 'string'},
                {arg: 'type_code', type: 'string'},
                {arg: 'type_name', type: 'string'},
                {arg: 'type_order', type: 'number'},
                {arg: 'type_desc', type: 'string'}],
        returns: {arg: 'model', type: 'object'},
        http:{path: '/', verb: 'post'}
    });

    function upsertWithWhere(type_id, type_code, type_name, type_order, type_desc, cb){
        Devicedatatypemas.upsertWithWhere(
            {type_id: type_id},
            {type_id: type_id,
            type_code: type_code,
            type_name: type_name,
            type_order: type_order,
            type_desc: type_desc
        }, cb);
    }
};
