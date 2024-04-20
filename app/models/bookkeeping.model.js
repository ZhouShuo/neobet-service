module.exports = (sequelize, Sequelize) => {
	const Bookkeeping = sequelize.define('bookkeeping', {
		name: {
			type: Sequelize.DataTypes.STRING,
		},
		initialAmount: {
			type: Sequelize.DataTypes.DECIMAL,
		},
		currentAmount: {
			type: Sequelize.DataTypes.DECIMAL,
		},
		type: {
			type: Sequelize.DataTypes.STRING,
		},
		percentage: {
			type: Sequelize.DataTypes.DECIMAL,
		},
		currency: {
			type: Sequelize.DataTypes.STRING,
		},
	});

	return Bookkeeping;
};
