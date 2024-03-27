module.exports = (sequelize, Sequelize) => {
	const FixtureEvent = sequelize.define('fixture_event', {
		timeElapsed: {
			type: Sequelize.DataTypes.INTEGER,
		},
		timeExtra: {
			type: Sequelize.DataTypes.INTEGER,
		},
		type: {
			type: Sequelize.DataTypes.STRING,
		},
		detail: {
			type: Sequelize.DataTypes.STRING,
		},
		comments: {
			type: Sequelize.DataTypes.STRING,
		},
	});

	return FixtureEvent;
};
