var mongo = require('mongodb').MongoClient;
var parseMatches = require('./parser');
var path = require('path');
var fs= require('fs');
var DATA_PATH = path.join(__dirname, 'csv', process.argv[2]);
var NEWLINE = '\r\n';
var COMMA = ',';
var DASH = '-';
var POINTS_WIN = 3;
var POINTS_DRAW = 1;
var POINTS_LOSS = 0;
// mongo.connect('mongodb://localhost:27017/football_world',function(err,db){

//     parseMatches(DATA_PATH, function (error, games) {
//         if (error){
//           console.error(error.stack);
//           throw error;
//         }
//       // return callback(error);
//       games.forEach(function(game){
//        var league_table = db.collection('d6dq');
//        league_table.insert(game,function(err,data){
//         if(err) throw err;
//              })
//        })
//     db.close();
//   })

// })
var generateLeagueTable = function (currentDate) {
  currentDate = currentDate || new Date();

  if (typeof(currentDate) === 'string') {
    currentDate = new Date(currentDate);
  }
 mongo.connect('mongodb://localhost:27017/football_world',function(err,db){

  parseMatches(DATA_PATH, function (error, games) {
    if (error) {
      console.error(error.stack);
      throw error;
    }

    var teams = {};
    games.forEach(function (game) {
      // Initialize teams if they don't exist
      [ game.homeTeam, game.awayTeam ].forEach(function (team) {
        if (!teams[team]) {
          teams[team] = {
            name: team,
            season:0,
             total_points: 0,
             half_point: 0,
             jump_diff: 0
            games: {
              played: 0,
              won: 0,
              drawn: 0,
              lost: 0,
              points: 0,
            },
            goals: {
              scored: 0,
              conceded: 0,
              diff: 0,
            },
          };
        }
      });

      // Process games only if they've been played on or before specified date
      if (new Date(game.date) <= currentDate) {
        var homeWon = game.score.fullTime.home > game.score.fullTime.away;
        var draw = game.score.fullTime.home === game.score.fullTime.away;

        // Increment both teams' play count
        teams[game.homeTeam].games.played += 1;
        teams[game.awayTeam].games.played += 1;

        // Set game result
        if (homeWon) {
          teams[game.homeTeam].games.won += 1;
          teams[game.homeTeam].games.points += POINTS_WIN;

          teams[game.awayTeam].games.lost += 1;
          teams[game.awayTeam].games.points += POINTS_LOSS;
        } else if (draw) {
          teams[game.homeTeam].games.drawn += 1;
          teams[game.homeTeam].games.points += POINTS_DRAW;

          teams[game.awayTeam].games.drawn += 1;
          teams[game.awayTeam].games.points += POINTS_DRAW;
        } else {
          teams[game.homeTeam].games.lost += 1;
          teams[game.homeTeam].games.points += POINTS_LOSS;

          teams[game.awayTeam].games.won += 1;
          teams[game.awayTeam].games.points += POINTS_WIN;
        }

        // Set Goal Stats
        teams[game.homeTeam].goals.scored += game.score.fullTime.home;
        teams[game.homeTeam].goals.conceded += game.score.fullTime.away;
        teams[game.homeTeam].goals.diff = teams[game.homeTeam].goals.scored - teams[game.homeTeam].goals.conceded;

        teams[game.awayTeam].goals.scored += game.score.fullTime.away;
        teams[game.awayTeam].goals.conceded += game.score.fullTime.home;
        teams[game.awayTeam].goals.diff = teams[game.awayTeam].goals.scored - teams[game.awayTeam].goals.conceded;
      }


    });

        var table = Object.keys(teams).map(function(k) { return teams[k] });
        table.forEach(function(name){
          var league_table = db.collection('tempo123');
         league_table.insert(name,function(err,data){
          if(err) throw err;
          db.close();
      });
        })
      })

    });

}
generateLeagueTable();

assert.ok(process.argv.length > 2, 'Choose output by command line (1/2)');

if (process.argv[2] === '1') {
  lostHomeMatches();
} else if (process.argv[2] === '2') {
  generateLeagueTable(process.argv[3]);
} else {
  console.log('Invalid output');
}
