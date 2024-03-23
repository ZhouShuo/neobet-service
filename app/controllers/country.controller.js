const db = require('../models');
const Country = db.countries;
const Op = db.Sequelize.Op;

const dataService = require('../services/data.service.js');

// Find a single Country by name
exports.findByName = (req, res) => {
	const name = req.params.name;

	Country.findOne({ where: { name: name } })
		.then((data) => {
			if (data) {
				res.send(data);
			} else {
				res.status(404).send({
					message: `Cannot find Country by name=${name}.`,
				});
			}
		})
		.catch((err) => {
			res.status(500).send({
				message: 'Error retrieving Country with name=' + name,
			});
		});
};

// Find a single Country by id
exports.findById = (req, res) => {
	const id = req.params.id;

	Country.findById(id)
		.then((data) => {
			if (data) {
				res.send(data);
			} else {
				res.status(404).send({
					message: `Cannot find Country by id= ${id}.`,
				});
			}
		})
		.catch((err) => {
			res.status(500).send({
				message: `Error retrieving Country with id= ${id}.`,
			});
		});
};

// Retrieve all from data service
exports.findAll = (req, res) => {
	Country.findAll({order: [['name', 'ASC']],})
		.then((data) => {
			if (data) {
				res.send(data);
			} else {
				res.status(404).send({
					message: `Cannot find all Countries.`,
				});
			}
		})
		.catch((err) => {
			res.status(500).send({
				message: 'Error retrieving All Countries',
			});
		});
};
