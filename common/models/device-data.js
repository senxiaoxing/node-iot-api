'use strict';

module.exports = function(Devicedata) {
    Devicedata.disableRemoteMethodByName('exists',true);
    Devicedata.disableRemoteMethodByName('replaceById',true);
    Devicedata.disableRemoteMethodByName('createChangeStream',true);
    Devicedata.disableRemoteMethodByName('count',true);
    
};
