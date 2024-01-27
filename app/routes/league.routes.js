module.exports = app => {
    const leagues = require("../controllers/league.controller.js");
  
    var router = require("express").Router();
      
    // Retrieve all Leagues
    router.get("/", leagues.findAll);
  
    // Retrieve a single League with id
    router.get("/:id", leagues.findOne);
  
    // Retrieve all Leagues from data service
    router.put("/all", leagues.retrieveAll);
  
    app.use('/api/leagues', router);
  };