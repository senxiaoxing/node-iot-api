'use strict';

var path = require('path');
var app = require(path.resolve(__dirname, '../server'));

var admin = [
    {
        username: 'admin', 
        email: 'admin@admin.com', 
        password: '123456', 
        emailVerified: true
    }
];

var mysqlDs = app.dataSources.mysqlDs;
mysqlDs.automigrate('AccessToken', function(err){
    if(err) throw err;
    });
mysqlDs.automigrate('Ouser', function(err){
    if(err) throw err;

    var Ouser = app.models.Ouser;
    Ouser.create([
        {username: 'admin', email: 'admin@admin.com', password: '123456', emailVerified: true}
        ], function(err, users) {
        if (err) throw err;
        mysqlDs.automigrate('Role', function(err){
            if(err) throw err;
            var Role = app.models.Role;
            mysqlDs.automigrate('RoleMapping', function(err){
                if(err) throw err;
                var RoleMapping = app.models.RoleMapping;
                var userid = users[0].id;
                Role.create({
                name: 'admin'
                }, function(err, role) {
                    console.log('Created role:', role);

                    role.principals.create({
                    principalType: RoleMapping.USER
                    , principalId: userid
                    }, function(err, principal) {
                    if (err) throw err;
                        console.log('Created principal:', principal);
                    });
                });
            });
        });
    });
});

mysqlDs.automigrate('User', function(err){
    if(err) throw err;
});

mysqlDs.automigrate('ACL', function(err){
    if(err) throw err;
    console.log('over');
    //mysqlDs.disconnect();
});
