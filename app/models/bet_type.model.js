module.exports = (sequelize, Sequelize) => {
	const BetType = sequelize.define('bet_type', {
		type: {
			type: Sequelize.DataTypes.STRING,
		},
		targetWinningPercentage: {
			type: Sequelize.DataTypes.DECIMAL,
		},
	});

	return BetType;
};
