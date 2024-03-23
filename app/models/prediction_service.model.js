module.exports = (sequelize, Sequelize) => {
	const PredictionServicess = sequelize.define('prediction_services', {
		version: {
			type: Sequelize.DataTypes.STRING,
		},
		enabled: {
			type: Sequelize.DataTypes.BOOLEAN,
		},
		serviceUrl: {
			type: Sequelize.DataTypes.STRING,
		},
	});

	return PredictionServicess;
};
