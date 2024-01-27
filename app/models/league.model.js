module.exports = (sequelize, Sequelize) => {
  const League = sequelize.define("league", {
    id: {
      type: Sequelize.DataTypes.INTEGER,
      primaryKey: true,
    },
    name: {
      type: Sequelize.DataTypes.STRING,
    },
    type: {
      type: Sequelize.DataTypes.STRING,
    },
    logo: {
      type: Sequelize.DataTypes.STRING,
    },
  });

  return League;
};
