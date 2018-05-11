'use strict';

module.exports = function(Ouser) {
    Ouser.afterRemote('login', function (context, result, next) {
        var res = context.res;
        if ( result && result.id ) {
            res.cookie('admin', result.id, { maxAge: 1000*60*60*24*14*6, httpOnly: true
                    ,signed: true});
        }
        return next();
      });
};
