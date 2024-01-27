const db = require("../models");
const League = db.leagues;
const Country = db.countries;
const Season = db.seasons;
const Op = db.Sequelize.Op;

const dataService = require("../services/data.service.js");

function createLeague(jsonLeague) {
  country = Country.findOne({ where: { code: jsonLeague.country.code } })
    .then((country) => {
      // Create a League
      const newLeague =
        {
          id: jsonLeague.league.id,
          name: jsonLeague.league.name,
          type: jsonLeague.league.type,
          logo: jsonLeague.league.logo,
          countryId: country.id,
        };

      // Save League in the database
      League.create(newLeague)
        .then((league) => {
          console.log(
            "create a league " + league.id + " which name is " + league.name + " country is " + country.name
          );
          jsonLeague.seasons.forEach(jsonSeason => {
            Season.findOne({ where: { year: jsonSeason.year } }).then((season) => {
              league.addSeason(season, { through: { start: jsonSeason.start, end: jsonSeason.end, current: jsonSeason.current } });
            })
          });
        })
        .catch((err) => {
          return (
            err.message || "Some error occurred while creating the League."
          );
        });
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message ||
          "Some error occurred while retrieving Country with code." ||
          lea.country.code,
      });
    });
}

// Retrieve all Leagues from the database.
exports.findAll = (req, res) => {
  League.findAll()
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message || "Some error occurred while retrieving leagues.",
      });
    });
};

// Find a single League with an id
exports.findOne = (req, res) => {
  const id = req.params.id;

  League.findByPk(id)
    .then((data) => {
      if (data) {
        res.send(data);
      } else {
        res.status(404).send({
          message: `Cannot find League with id=${id}.`,
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: "Error retrieving League with id=" + id,
      });
    });
};

// Delete all Leagues from the database.
exports.deleteAll = (req, res) => {
  Country.destroy({
    where: {},
    truncate: false,
  })
    .then((nums) => {
      res.send({ message: `${nums} Leagues were deleted successfully!` });
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while removing all Leagues.",
      });
    });
};

// Retrieve all from data service
exports.retrieveAll = (req, res) => {
  console.log("get all leagues from data service");
  dataService.getLeagues().then((leagues) => {
    console.log("already get all leagues " + leagues.length);
    leagues.forEach((league) => {
      createLeague(league);
    });
    res.send(leagues);
  });
};
