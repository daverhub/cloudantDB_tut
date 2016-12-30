require('dotenv').load();

// Load the Cloudant library.
var Cloudant = require('cloudant');

// Initialize Cloudant with settings from .env
var username = process.env.cloudant_username || "nodejs";
var password = process.env.cloudant_password;
var cloudant = Cloudant({account:username, password:password});


var db = cloudant.use('test');

const oIncidentGeoJson ={

  "properties": {
    "address" : "780 3rd Ave, New York, NY 10017, USA",
    "cityCode" : "nyc",
    "hasVod" : true,
    "level" : 1,
    "liveStreamers" : {
      "de8bb371f14d4bdc80d5" : {
        "cs" : 1477496059721,
        "hlsDone" : true,
        "ts" : 1477496917025,
        "username" : "JR",
        "videoStreamId" : "747392c4-15ae-492b-b732-eca3b4015e8b"
      }
    },
    "location" : "780 3rd Avenue",
    "neighborhood" : "Midtown East",
    "placeName" : "780 3rd Ave",
    "raw" : "Large Group of Protesters at 780 3rd Ave, New York, NY 10017, USA",
    "rawLocation" : "780 3rd Ave, New York, NY 10017, USA",
    "sessionId" : "lucho",
    "status" : "active",
    "title" : "Large Group of Protesters Outside Senator's Office, Arrests Made",
    "type": "Feature"
  }
};

const NItems = 50000;

const center    = [-73.993549, 40.727248];
const lowerLeft = [-74.009180, 40.716425];
const deltaLon  = 2 * Math.abs(lowerLeft[0] - (-73.97725));
const deltaLat  = 2 * Math.abs(lowerLeft[1] - (40.7518692));

let aItems = { docs:[] };
// let aPromises = [];
for (let i=0;i < NItems;i++) {
  const ll = [lowerLeft[1] + Math.random() * deltaLat,lowerLeft[0] + Math.random() * deltaLon];
  const tNow = Date.now();
  const oItemBase = Object.assign({}, oIncidentGeoJson);
  const oItem = Object.assign( {
    geometry    : {
      coordinates : [ll[1], ll[0]],
      type        : "Point"
    },
    cs          : tNow - 10 * 60 * 1000,
    ts          : tNow,
  }, oItemBase);
  // aPromises.push(r.table(sTable).insert(oItem, { conflict: 'update'}).run(conn));    
  aItems['docs'].push(oItem);
}


const batchUpsertPromise = (aSubItems) => {
// return r.table(sTable).insert(aSubItems).run(conn);     
  return new Promise( (resolve,reject) =>{
    return db.bulk(aSubItems, 'POST', (err, body) => {
      if (!err){
        resolve(body);
      } 
    });   
  });
}
  

const batchUpsert = (aAllItems,iOffset) => {
  debugger;
  const NBatch  = 1000;
  iOffset       = iOffset  || 0;
  let iStart    = iOffset;
  let iEnd      = iStart + NBatch;
  let iLast     = aAllItems.docs.length - 1;
  iEnd          = iEnd > iLast ? iLast : iEnd;
  const aSubArray = {docs:aAllItems['docs'].slice(iStart,iEnd)};
  console.log({ action: 'batchUpsert', iStart: iStart, iEnd: iEnd, length: aSubArray.docs.length });
  return batchUpsertPromise(aSubArray).then( (result) => {
    console.log({ action: 'batchUpsert.success', iStart: iStart, iEnd: iEnd })
    if (iEnd < aItems.docs.length - 1) {
      return batchUpsert(aAllItems,iEnd)
    }
    else {
      let msg = `${aAllItems.docs.length} inserted`;
      return msg;
    }
  });
}

batchUpsert(aItems).then( (result) => {
  console.log({ action: 'batchUpsert.success', result: result})
  process.exit(0);
})
.catch( (err) => {
  throw err;
})


