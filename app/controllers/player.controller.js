const db = require('../models');
const Players = db.players;
const Op = db.Sequelize.Op;

// find play by id
exports.findById = (req, res) => {
	const id = req.params.id;

	Country.findById(id)
		.then((data) => {
			if (data) {
				res.send(data);
			} else {
				res.status(404).send({
					message: `Cannot find Player by id= ${id}.`,
				});
			}
		})
		.catch((err) => {
			res.status(500).send({
				message: `Error retrieving Player with id= ${id}.`,
			});
		});
};

// update players by team id
exports.UpdateByTeamId = (req, res) => {
	const teamId = req.params.teamId;
};