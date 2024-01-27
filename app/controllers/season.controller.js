const db = require("../models");
const Season = db.seasons;
const Op = db.Sequelize.Op;

const dataService = require("../services/data.service.js");



// Create and Save a new Season
exports.create = (req, res) => {
  // Create a Season
  const season = {
    year: req.body.year,
  };

  // Save Season in the database
  Season.create(season)
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while creating the Season.",
      });
    });
};

function createSeason(year) {
  // Create a Season
  const season = {
    year: year,
  };

  // Save Season in the database
  Season.create(season)
    .then((data) => {
      console.log("create a season " + data.id + " which year is " + year);
    })
    .catch((err) => {
      return err.message || "Some error occurred while creating the Season.";
      
    });
}

// Retrieve all Seasons from the database.
exports.findAll = (req, res) => {
  Season.findAll()
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message || "Some error occurred while retrieving seasons.",
      });
    });
};

// Find a single Season with an id
exports.findOne = (req, res) => {
  const id = req.params.id;

  Season.findByPk(id)
    .then((data) => {
      if (data) {
        res.send(data);
      } else {
        res.status(404).send({
          message: `Cannot find Season with id=${id}.`,
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: "Error retrieving Season with id=" + id,
      });
    });
};


// Delete all Seasons from the database.
exports.deleteAll = (req, res) => {
  Season.destroy({
    where: {},
    truncate: false,
  })
    .then((nums) => {
      res.send({ message: `${nums} Seasons were deleted successfully!` });
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while removing all seasons.",
      });
    });
};

// Retrieve all from data service
exports.retrieveAll = (req, res) => {
  console.log('get all seasons from data service');
  dataService.getSeasons().then((seasons) => {
    console.log('already get all seasons '+ seasons);
    seasons.forEach(season => {
      createSeason(season);
    });
    res.send(seasons);
  });
  
  
  
  
};

