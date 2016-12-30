require('dotenv').load();

// Load the Cloudant library.
var Cloudant = require('cloudant');

// Initialize Cloudant with settings from .env
var username = process.env.cloudant_username || "nodejs";
var password = process.env.cloudant_password;
var cloudant = Cloudant({account:username, password:password});


var db = cloudant.use('test');
//var query = {
  //lat:42.447222, lon:-71.225,
  //radius:25000,
  //include_docs:true
//};
const bboxQuery = (options) =>{
  return new Promise( (resolve, reject) =>{
    db.geo('geodd','geoidx',options, (err,body) => {
      if (err){
        reject(err);
      }
      else{
        let aResults = body.rows;
        //let aResults = [];
        //if (Array.isArray(body.rows)){
          //aResults = body.rows.sort( (a,b) => {return b.ts = a.ts} );
        //}
        resolve(aResults);
      }
    } );
  
  });
};

let aPromises = [];

const center    = [-73.99815559387207,40.73727487527729];
const lowerLeft = [-73.9857530593872,40.74468842545076];
const deltaLon  = 2 * Math.abs(center[0] - lowerLeft[0]);
const deltaLat  = 2 * Math.abs(center[1] - lowerLeft[1]);

const NQueries  = 50;

let t0 = Date.now();

for( let i=0; i < NQueries; i++ ){
  const searchLon      = lowerLeft[0] + Math.random() * deltaLon;
  const searchLat      = lowerLeft[1] + Math.random() * deltaLat;
  const halfWinLon     = Math.random() * 0.04;
  const halfWinLat     = Math.random() * 0.04;

  const lowerLatitude  = searchLat - halfWinLat;
  const lowerLongitude = searchLon - halfWinLon;
  const upperLatitude  = searchLat + halfWinLat;
  const upperLongitude = searchLon + halfWinLon;
 
  let oQuery = {
    bbox: [lowerLongitude,lowerLatitude,upperLongitude,upperLatitude].toString(),
    //bbox: [-73.99815559387207,40.73727487527729,-73.9857530593872,40.74468842545076].toString(),
    limit: 40,
    relation: 'contains',
    include_docs:true,
  };
  aPromises.push(bboxQuery(oQuery));

}


Promise.all(aPromises).then( (aResults) =>{
  debugger; 
  let t1 = Date.now();
  console.log({queriesTimeMS: t1-t0, queriesPerSecond: NQueries / ( (t1-t0)/1000 )});
} ).catch( (err) =>{
  console.log({action: 'query.err', err:err});
  process.exit(1);
} );




