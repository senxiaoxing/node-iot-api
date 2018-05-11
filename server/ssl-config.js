// Copyright IBM Corp. 2014,2016. All Rights Reserved.
// Node module: loopback-example-ssl
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

var path = require('path');
var fs = require('fs');

// exports.privateKey = fs.readFileSync(path.join(__dirname, './private/ca_nopass.key')).toString();
// exports.certificate = fs.readFileSync(path.join(__dirname, './private/ca.crt')).toString();
exports.privateKey = fs.readFileSync(path.join(__dirname, './private/server.pem')).toString();
exports.certificate = fs.readFileSync(path.join(__dirname, './private/server.cer')).toString();
exports.ca = fs.readFileSync(path.join(__dirname, './private/ca.cer')).toString();