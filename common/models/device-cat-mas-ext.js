'use strict';

module.exports = function(Devicecatmasext) {
    Devicecatmasext.disableRemoteMethodByName('exists',true);
    Devicecatmasext.disableRemoteMethodByName('replaceById',true);
    Devicecatmasext.disableRemoteMethodByName('createChangeStream',true);
    Devicecatmasext.disableRemoteMethodByName('count',true);
};
