module.exports = (sequelize, Sequelize) => {
	const Player = sequelize.define('player', {
		id: {
			type: Sequelize.DataTypes.INTEGER,
			primaryKey: true,
		},
		name: {
			type: Sequelize.DataTypes.STRING,
		},
		age: {
			type: Sequelize.DataTypes.INTEGER,
		},
		number: {
			type: Sequelize.DataTypes.INTEGER,
		},
		position: {
			type: Sequelize.DataTypes.STRING,
		},
		photo: {
			type: Sequelize.DataTypes.STRING,
		},
	});

	return Player;
};
