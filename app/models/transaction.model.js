module.exports = (sequelize, Sequelize) => {
	const Transaction = sequelize.define('transaction', {
		bookmakerOdd: {
			type: Sequelize.DataTypes.DECIMAL,
		},
		betOdd: {
			type: Sequelize.DataTypes.DECIMAL,
		},
		betAmount: {
			type: Sequelize.DataTypes.DECIMAL,
		},
		winAmount: {
			type: Sequelize.DataTypes.DECIMAL,
		},
	});

	return Transaction;
};
