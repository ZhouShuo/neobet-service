module.exports = (sequelize, Sequelize) => {
  const Team = sequelize.define("team", {
    id: {
      type: Sequelize.DataTypes.INTEGER,
      primaryKey: true,
    },
    name: {
      type: Sequelize.DataTypes.STRING,
    },
    code: {
      type: Sequelize.DataTypes.STRING,
    },
    founded: {
      type: Sequelize.DataTypes.INTEGER,
    },
    national: {
      type: Sequelize.DataTypes.BOOLEAN,
    },
    logo: {
      type: Sequelize.DataTypes.STRING,
    },
  });

  return Team;
};
