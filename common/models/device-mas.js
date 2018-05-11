'use strict';
const uuidv4 = require('uuid/v4');

module.exports = function(Devicemas) {
    Devicemas.disableRemoteMethodByName('exists',true);
    Devicemas.disableRemoteMethodByName('replaceById',true);
    Devicemas.disableRemoteMethodByName('createChangeStream',true);
    Devicemas.disableRemoteMethodByName('count',true);

    Devicemas.dev_post = function(dev_id, cat_id, serial_no, dev_name, dev_order, dev_desc, cb){
        if (!dev_id){
            dev_id = uuidv4();
        }
        if(!dev_order){
            Devicemas.findOne({
                order: 'dev_order DESC'
            }, function(err, dev){
                if(err) return cb(err);
                dev_order = dev.dev_order+1;//最大的dev_order加1
                upsertWithWhere(dev_id, cat_id, serial_no, dev_name, dev_order, dev_desc, cb);
            });
        }else{upsertWithWhere(dev_id, cat_id, serial_no, dev_name, dev_order, dev_desc, cb);}
    };
    
    Devicemas.remoteMethod('dev_post', {
        description: '',
        accepts:[{arg: 'dev_id',type: 'string'},
                {arg: 'cat_id',type: 'string'},
                {arg: 'serial_no',type: 'string'},
                {arg: 'dev_name',type: 'string'},
                {arg: 'dev_order',type: 'number'},
                {arg: 'dev_desc',type: 'string'}],
        returns: {arg: 'model',type: 'object'},
        http:{path: '/',verb: 'post'}
    });
/*
    Devicemas.observe('after save', function(ctx, next){
        if (ctx.instance){
            var Ouser = Devicemas.app.models.Ouser;
            var Role = Devicemas.app.models.Role;
            var RoleMapping = app.models.RoleMapping;
            Ouser.create({username: ctx.instance.dev_id, password: '123456'}, function(err, user){
                if(err) throw err;
                var userId = user.id;
                Role.findOne({where: {name: 'admin'}}, function(err, role){
                    role.principal.create({principalType: RoleMapping.USER, principalId: userId}, function(err, principal) {
                        if (err) throw err;
                        Ouser.login({username: ctx.instance.dev_id, password: '123456'}, function(err, token){
                            if (err) throw err;
                            
                        });
                    });
                });
            });
        }
        next();
    });
*/
    function upsertWithWhere(dev_id, cat_id, serial_no, dev_name, dev_order, dev_desc, cb){
        Devicemas.upsertWithWhere(
            {dev_id: dev_id},
            {dev_id: dev_id,
            cat_id: cat_id,
            serial_no: serial_no,
            dev_name: dev_name,
            dev_order: dev_order,
            dev_desc: dev_desc
        }, cb);
    }
};
