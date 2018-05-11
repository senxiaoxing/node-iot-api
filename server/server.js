'use strict';

var loopback = require('loopback');
var boot = require('loopback-boot');
var path = require('path');
var http = require('http');
var https = require('https');
var sslConfig = require('./ssl-config');
var log = require('./log-config').Logger;
const cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
// app 是express的实例


var app = module.exports = loopback();

app.use(cookieParser('lifeissimpebutyoumadeitcomplicated'));
//for parsing application/json
app.use(bodyParser.json());
//for parsing application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));
app.start = function() {

  var opt = {
    key:sslConfig.privateKey,
    cert:sslConfig.certificate,
    ca:sslConfig.ca,
    requestCert:        true,  
    rejectUnauthorized: false 
  };
  //var server = https.createServer(opt,app);
  var server = http.createServer(app);
  // start the web server
  return server.listen(app.get('port'),function() {

    var baseUrl = 'http://' + app.get('host') + ':' + app.get('port');
    app.emit('started');
    //var baseUrl = app.get('url').replace(/\/$/, '');
   // console.log('Web server listening at: %s', baseUrl);
    log.info('Web server listening at: %s', baseUrl);
    if (app.get('loopback-component-explorer')) {
      var explorerPath = app.get('loopback-component-explorer').mountPath;
    
      //console.log('Browse your REST API at %s%s', baseUrl, explorerPath);
      log.info('Browse your REST API at %s%s', baseUrl, explorerPath);
    }
  });
};

//加入驗證器控制路由權限
app.use('/', require(path.resolve(__dirname, './bin/authChecker.js')).auth_router);

//加入路由
app.use('/api/data', require(path.resolve(__dirname, './routes/data.js')).data_router);
app.use('/api/save', require(path.resolve(__dirname, './routes/save.js')).save_router);
app.use('/api/download/firmware', require(path.resolve(__dirname, './routes/download.js')).download_router);

// Bootstrap the application, configure models, datasources and middleware.
// Sub-apps like REST API are mounted via boot scripts.
boot(app, __dirname, function(err) {
  if (err) throw err;

  // start the server if `$ node server.js`
  if (require.main === module)
    app.start();
});

process.on('uncaughtException', function (err){
  console.error('uncaughtException: %s', err.message);
});
