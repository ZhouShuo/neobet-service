module.exports = app => {
    const seasons = require("../controllers/season.controller.js");
  
    var router = require("express").Router();
      
    // Retrieve all Seasons
    router.get("/", seasons.findAll);
  
    // Retrieve a single Season with id
    router.get("/:id", seasons.findOne);
  
    // Retrieve all Seasons from data service
    router.put("/all", seasons.retrieveAll);
  
    app.use('/api/seasons', router);
  };