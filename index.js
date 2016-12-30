// Load the Cloudant library.
require('dotenv').load()
var Cloudant = require('cloudant');

var me = process.env.cloadant_username; // Set this to your own account
var password = process.env.cloudant_password;
// Initialize the library with my account.
var cloudant = Cloudant({account:me, password:password});

cloudant.db.list(function(err, allDbs) {
  console.log('All my databases: %s', allDbs.join(', '))
});
