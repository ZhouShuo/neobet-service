module.exports = (sequelize, Sequelize) => {
	const SchedulerLogs = sequelize.define('scheduler_logs', {
		type: {
			type: Sequelize.DataTypes.STRING,
		},
		success: {
			type: Sequelize.DataTypes.BOOLEAN,
		},
		message: {
			type: Sequelize.DataTypes.STRING,
		},
		start: {
			type: Sequelize.DataTypes.DATE,
		},
		end: {
			type: Sequelize.DataTypes.DATE,
		},
	});

	return SchedulerLogs;
};
