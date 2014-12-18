/*******************************************************************************
 * @license
 * Copyright (c) 2012-2013 VMware, Inc. All Rights Reserved.
 * THIS FILE IS PROVIDED UNDER THE TERMS OF THE ECLIPSE PUBLIC LICENSE
 * ("AGREEMENT"). ANY USE, REPRODUCTION OR DISTRIBUTION OF THIS FILE
 * CONSTITUTES RECIPIENTS ACCEPTANCE OF THE AGREEMENT.
 * You can obtain a current copy of the Eclipse Public License from
 * http://www.opensource.org/licenses/eclipse-1.0.php
 *
 * Contributors:
 *     Scott Andrews
 *     Andrew Eisenberg
 *     Kris De Volder
 ******************************************************************************/

var fs = require('fs');
//var path = require('path');
var pathResolve = require('../jsdepend/utils').pathResolve;

var EDITOR_HTML = pathResolve(__dirname, '../../client/editor.html');

exports.install = function (app, filesystem) {
	var async = require('async');
	global.state = false;

	var getUserHome = filesystem.getUserHome;

	app.get('/', function (req, res) {
		res.redirect('/editor'+getUserHome());
	});

	function sendEditor(req, res) {
        check_token(function(){
                if ( global.state != true ){
                        res.statusCode= 401;
                        res.end('Unauthorized');
                }
                else{
                        next();
                }
        });
        function check_token(fnCallback) {
                async.series([
                function(callback) {
                      var token = req.query.token;
                      var request = require('request-json');
                      var client = request.newClient('http://10.91.11.19:8000/');
                      var user=req.query.user + ".json"
                      var auth=client.get('token/'+ token + '/' + user, function (err, res, body) {
                              global.state = body.success;
                      });

                      callback();
                    },

                    function(callback) {
                      setTimeout(callback, 1000);
                    },
                ], function(err, results) {
                    fnCallback();
                });
        }

		res.header('Content-Type', 'text/html');
		fs.createReadStream(EDITOR_HTML).pipe(res); //Yes, ok to use node 'fs' directly here.
													// Not serving user content!
	}

	app.get('/editor', sendEditor);
	app.get('/editor/:path(*)', sendEditor);

	app.get('/', function (req, res) {
		res.redirect('/editor'+getUserHome());
	});
};
