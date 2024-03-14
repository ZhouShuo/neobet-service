module.exports = (sequelize, Sequelize) => {
	const Predictions = sequelize.define('predictions', {
		version: {
			type: Sequelize.DataTypes.STRING
		},
		update: { 
			type: Sequelize.DataTypes.DATE 
		},
		rateHome: {
			type: Sequelize.DataTypes.DECIMAL,
		},
		scoreHome: {
			type: Sequelize.DataTypes.DECIMAL,
		},
		rateDraw: {
			type: Sequelize.DataTypes.DECIMAL,
		},
		scoreDraw: {
			type: Sequelize.DataTypes.DECIMAL,
		},
		rateAway: {
			type: Sequelize.DataTypes.DECIMAL,
		},
		scoreAway: {
			type: Sequelize.DataTypes.DECIMAL,
		},
		rateToWin: {
			type: Sequelize.DataTypes.DECIMAL,
		},
		rateToLost: {
			type: Sequelize.DataTypes.DECIMAL,
		},
		oddMedianHome: {
			type: Sequelize.DataTypes.DECIMAL,
		},
		oddMedianDraw: {
			type: Sequelize.DataTypes.DECIMAL,
		},
		oddMedianAway: {
			type: Sequelize.DataTypes.DECIMAL,
		},
		isReverse: {
			type: Sequelize.DataTypes.BOOLEAN,
		},
		betHome: {
			type: Sequelize.DataTypes.BOOLEAN,
		},
		betDraw: {
			type: Sequelize.DataTypes.BOOLEAN,
		},
		betAway: {
			type: Sequelize.DataTypes.BOOLEAN,
		},
		betHomeWinGreater: {
			type: Sequelize.DataTypes.BOOLEAN,
		},
	});

	return Predictions;
};
