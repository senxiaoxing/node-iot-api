'use strict';

module.exports = function(Visitorlog) {
    Visitorlog.disableRemoteMethodByName('exists',true);
    Visitorlog.disableRemoteMethodByName('replaceById',true);
    Visitorlog.disableRemoteMethodByName('createChangeStream',true);
    Visitorlog.disableRemoteMethodByName('count',true);

    //post-> Visitor Log
    Visitorlog.log_post = function(data, cb){
        var log_data = JSON.parse(data);

        if(log_data){
            for(let item of log_data){
                Visitorlog.upsertWithWhere({
                    log_id: item['log_id']
                }, {
                    log_id: item["log_id"],
                    serial_no: item['serial_no'],
                    start_date: item['start_date'],
                    end_date: item['end_date'],
                    visitor_company: item['visitor_company'],
                    visitor_name: item['visitor_name']
                }, cb);
            }
        }else{
            res.send({status: false, message: 'Parameter error'});
        }
    }

    Visitorlog.remoteMethod('log_post', {
        description: 'visitor_log錄入接口',
        accepts:[{arg: 'data',type: 'string'}],
        returns: {arg: 'model',type: 'object'},
        http:{path: '/',verb: 'post'}
    });
};
