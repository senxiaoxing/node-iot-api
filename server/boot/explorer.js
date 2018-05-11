'use strict';

var log = require('../log-config').Logger;

module.exports = function mountLoopBackExplorer(server){
    var explorer;
    try{
        explorer = require('loopback-component-explorer');        
    }catch(err){
        // Print the message only when the app was started via 'server.listen()'
        // Do not print any message whe the project is used as a component.
        server.once('started', function(baseUrl){
            console.error("Run 'npm install loopback-component-explorer' to enable the LoopBack explorer");
        });
    return;
    }

    // user: iot   pwd:iot
    server.use('/InTech', require('node-basicauth')({'iot':'iot'}));
    
    server.use('/InTech',explorer.routes(server,{basePath:server.get('restApiRoot')}));

    server.once('started',function(){
        
        //var baseUrl = server.get('url').replace(/\/$/, '');
        //var baseUrl = server.get('url').replace(/\/$/, '');
        var baseUrl = 'http://' + server.get('host') + ':' + server.get('port');
       // console.log('Browse your REST API at %s%s', baseUrl, '/InTech');
        log.info('Browse your REST API at %s%s', baseUrl, '/InTech');
    });
};