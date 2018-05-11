'use strict';

module.exports = function(app) {
    // var Ouser = app.models.Ouser;
    // app.post('/login', function(req, res){
    //   Ouser.login({
    //     nickname: req.body.nickname,
    //     email: req.body.email,
    //     password: req.body.password
    //   }, function(err, token){
    //     if(err) throw err;
    //     res.send(token.id);
    //   });
    // });
  
    // app.get('/logout', function(req, res){
    //   var AccessToken = app.models.AccessToken;
    //   var token = new AccessToken({id: req.query['access_token']});
    //   token.destroy();
    // });

    app.get('/test', function(req, res){
        var dev = app.models.device_mas;
        console.log('123');
        dev.find({
          where:{
                dev_id: '02ec7593-31ca-310b-9d5c-21076fd9b000'
              }}, function(err, dev1){
                if(err) throw err;
                res.send(dev1[0].dev_name);
        });
    });
}