require('dotenv').load();

// Load the Cloudant library.
var Cloudant = require('cloudant');

// Initialize Cloudant with settings from .env
var username = process.env.cloudant_username || "nodejs";
var password = process.env.cloudant_password;
var cloudant = Cloudant({account:username, password:password});


var db = cloudant.use('test');

var geodd ={
  "_id": "_design/geodd",
  "views": {
    
  },
  "language": "javascript",
  "st_indexes": {
    "geoidx": {
      "index": "function(doc){ if (doc.geometry && doc.geometry.coordinates && doc.geometry.coordinates.length > 0) { st_index(doc.geometry); }}"
    }
  }
};

db.insert(geodd, (err, body) =>{
  if(!err){
    console.log(body);
  }
});
