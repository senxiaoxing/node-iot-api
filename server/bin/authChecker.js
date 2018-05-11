'use strict';
var app = require('../server');
var moment = require('moment');
var router = module.exports.auth_router = require('loopback').Router();
//驗證器控制路由權限
router.get('/api/data/list', function(req, res, next){ validat(req, res, next); });
router.get('/api/data/device', function(req, res, next){ validat(req, res, next); });
router.get('/api/data/type', function(req, res, next){ validat(req, res, next); });
router.get('/api/data/value', function(req, res, next){ validat(req, res, next); });
router.post('/api/save/device', function(req, res, next){ validat(req, res, next); });
router.post('/api/save/value', function(req, res, next){ validat(req, res, next); });
router.get('/download/firmware', function(req, res, next){ validat(req, res, next);} )

function validat(req, res, next){
    var access_token = app.models.AccessToken;
    var user = app.models.Ouser;
    user.findOne({
        where: {username: 'admin'}
    }, function(err, admin){
        if (err) throw err;
        if(admin && admin.id){
            access_token.findOne({
                where: {userId: admin.id}
            }, function(err, token){
                if (err) throw err;
                if(moment(token.created).add(token.ttl, 'seconds').isBefore(moment())){
                    res.statusCode = 401
                    res.send({status: false, message: '認證時間已過期，請重新登錄!'})
                }else{
                    if(req.query.access_token === token.id){
                        console.log(token.id);
                        next();
                    }
                    else{
                        res.statusCode = 401;
                        res.send({status: false, message: '認證無效，請重新登錄!'});
                    }
                }
            });
        }
    });
}