require('dotenv').load();

// Load the Cloudant library.
var Cloudant = require('cloudant');

// Initialize Cloudant with settings from .env
var username = process.env.cloudant_username || "nodejs";
var password = process.env.cloudant_password;
var cloudant = Cloudant({account:username, password:password});
cloudant.db.create('test', function(err, body) {
  
  if(!err){
    console.log(body);
  }
});
