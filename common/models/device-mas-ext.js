'use strict';

module.exports = function(Devicemasext) {
    Devicemasext.disableRemoteMethodByName('exists',true);
    Devicemasext.disableRemoteMethodByName('replaceById',true);
    Devicemasext.disableRemoteMethodByName('createChangeStream',true);
    Devicemasext.disableRemoteMethodByName('count',true);
};
