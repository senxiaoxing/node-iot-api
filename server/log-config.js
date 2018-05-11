var log4js = require("log4js");
var path = require('path');

var log4jsConfig ={ 
    appenders: {
      out: { 
            type: 'console' 
        }, 
      default: { 
            type: 'dateFile', 
            filename: path.join(__dirname, '../logs/') ,
            "pattern": "yyyy-MM-dd-hh.log", 
            alwaysIncludePattern: true 
        }, 
    },
    categories: {
      default: { 
            appenders: ['out','default'], 
            level: 'info' 
        }
    }
  } 

log4js.configure(log4jsConfig);

exports.Logger = log4js.getLogger();
