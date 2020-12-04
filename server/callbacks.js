import Empirica from "meteor/empirica:core";
import { Mongo } from 'meteor/mongo'
FitnessFunctions = new Mongo.Collection('fitness_functions');
// onGameStart is triggered opnce per game before the game starts, and before
// the first onRoundStart. It receives the game and list of all the players in
// the game.
Empirica.onGameStart(game => {});

// onRoundStart is triggered before each round starts, and before onStageStart.
// It receives the same options as onGameStart, and the round that is starting.
Empirica.onRoundStart((game, round) => {
  const num_shapes = 10;

  game.players.forEach(player => {
    player.round.set("submissions",[])
    player.round.set("curScore",0)
    player.round.set("totalScore", 0);
    
    var functionFactor = "functionGame"+(round.index+1)
    var functionName = game.treatment[functionFactor]
    var fitness_function = FitnessFunctions.find({"name":functionName}).fetch();
    var curSelection = Array.from(fitness_function[0]['lowest_location'].slice(1,-1).split(",").map(Number))
    
    player.round.set("curSelection",curSelection)


    //Generate Random
    var random = [];
    _.times(num_shapes, i => { 
      var left = Math.random()*30;
      var bottom = Math.random()*100;
      const rand = {
        position: `absolute`,
        left: `${left+20}%`,
        bottom: `${bottom}%`
      };
      random.push(rand)
    } );

    player.round.set("random",random)
    
  })
	var timestamp = Date.now()/1000.0;
	round.set("started", timestamp)
});

// onStageStart is triggered before each stage starts.
// It receives the same options as onRoundStart, and the stage that is starting.
Empirica.onStageStart((game, round, stage) => {
  game.players.forEach(player => {
    player.stage.set("score", 0);
  })
});

// onStageEnd is triggered after each stage.
// It receives the same options as onRoundEnd, and the stage that just ended.
Empirica.onStageEnd((game, round, stage) => {
  const rewardScale = game.treatment["rewardScale"]
  game.players.forEach(player => {
    var curSelection = player.round.get("curSelection")
    var binary_curSelection = curSelection.reduce((res, x) => res << 1 | x)

    var functionFactor = "functionGame"+(round.index+1)
    var functionName = game.treatment[functionFactor]
    var fitness_function = FitnessFunctions.find({"name":functionName}).fetch();
    var score = fitness_function[0]['function'][binary_curSelection]*rewardScale
    const totalScore = player.round.get("totalScore")
    player.stage.set("score",score)
    player.round.set("curScore",score)
    player.round.set("totalScore",score+totalScore)
    const submission = {"curSelection":curSelection,
                        "score":score};
    player.round.append("submissions",submission)
    
    player.stage.set("submission",submission)

    var timestamp = Date.now()/1000.0;

    // Append to Round History (in the single player case, the round history will feature just one player's data so player-round and round are the same)
    var histData = { playerid: player._id, // MongoDB ID of player
                     timestamp: timestamp,
                     action: 'submit', // could be submit, window blur/focus
                     stateClicked: player.stage.get("selection"), // which shapes were clicked
                     currScore: player.stage.get("score"), // the score of the shape combination
                   };
    
    round.append("history",histData);
  })
});

// onRoundEnd is triggered after each round.
// It receives the same options as onGameEnd, and the round that just ended.
Empirica.onRoundEnd((game, round) => {
  game.players.forEach(player => {
    const value = player.round.get("value") || 0;
    const prevScore = player.get("score") || 0;
    player.stage.set("score", prevScore + value);
  });
});

// onGameEnd is triggered when the game ends.
// It receives the same options as onGameStart.
Empirica.onGameEnd(game => {});

// ===========================================================================
// => onSet, onAppend and onChange ==========================================
// ===========================================================================

// onSet, onAppend and onChange are called on every single update made by all
// players in each game, so they can rapidly become quite expensive and have
// the potential to slow down the app. Use wisely.
//
// It is very useful to be able to react to each update a user makes. Try
// nontheless to limit the amount of computations and database saves (.set)
// done in these callbacks. You can also try to limit the amount of calls to
// set() and append() you make (avoid calling them on a continuous drag of a
// slider for example) and inside these callbacks use the `key` argument at the
// very beginning of the callback to filter out which keys your need to run
// logic against.
//
// If you are not using these callbacks, comment them out so the system does
// not call them for nothing.

// // onSet is called when the experiment code call the .set() method
// // on games, rounds, stages, players, playerRounds or playerStages.
Empirica.onSet((
  game,
  round,
  stage,
  player, // Player who made the change
  target, // Object on which the change was made (eg. player.set() => player)
  targetType, // Type of object on which the change was made (eg. player.set() => "player")
  key, // Key of changed value (e.g. player.set("score", 1) => "score")
  value, // New value
  prevValue // Previous value
) => {
  // // Example filtering
  // if (key == "currscore") {
  // 	game.players.forEach(player => {
	 //    const totalScore = player.get("score") || 0;
	 //    player.set("score", totalScore + value);
	 //  });
  // };
});

// // onAppend is called when the experiment code call the `.append()` method
// // on games, rounds, stages, players, playerRounds or playerStages.
Empirica.onAppend((
  game,
  round,
  stage,
  player, // Player who made the change
  target, // Object on which the change was made (eg. player.set() => player)
  targetType, // Type of object on which the change was made (eg. player.set() => "player")
  key, // Key of changed value (e.g. player.set("score", 1) => "score")
  value, // New value
  prevValue // Previous value
) => {
  // Note: `value` is the single last value (e.g 0.2), while `prevValue` will
  //       be an array of the previsous valued (e.g. [0.3, 0.4, 0.65]).
});

// // onChange is called when the experiment code call the `.set()` or the
// // `.append()` method on games, rounds, stages, players, playerRounds or
// // playerStages.
// Empirica.onChange((
//   game,
//   round,
//   stage,
//   player, // Player who made the change
//   target, // Object on which the change was made (eg. player.set() => player)
//   targetType, // Type of object on which the change was made (eg. player.set() => "player")
//   key, // Key of changed value (e.g. player.set("score", 1) => "score")
//   value, // New value
//   prevValue, // Previous value
//   isAppend // True if the change was an append, false if it was a set
// ) => {
//   // `onChange` is useful to run server-side logic for any user interaction.
//   // Note the extra isAppend boolean that will allow to differenciate sets and
//   // appends.
//    Game.set("lastChangeAt", new Date().toString())
// });

// // onSubmit is called when the player submits a stage.
// Empirica.onSubmit((
//   game,
//   round,
//   stage,
//   player // Player who submitted
// ) => {
// });