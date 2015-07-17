var mongo = require('mongodb').MongoClient;

mongo.connect('mongodb://localhost:27017/football_world',function(err,db){

    if(err) throw err;

    var league = db.collection('league');
    league.find({

    }).toArray(function(err,documents){
    if (err) throw err;
      console.log(documents);
      db.close();
  })
})
