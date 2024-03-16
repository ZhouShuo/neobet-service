const db = require('../models');
const Team = db.teams;
const Op = db.Sequelize.Op;

// Find a single Team by id
exports.findById = (req, res) => {
	const id = req.params.id;

	Country.findById(id)
		.then((data) => {
			if (data) {
				res.send(data);
			} else {
				res.status(404).send({
					message: `Cannot find Team by id= ${id}.`,
				});
			}
		})
		.catch((err) => {
			res.status(500).send({
				message: `Error retrieving Team with id= ${id}.`,
			});
		});
};