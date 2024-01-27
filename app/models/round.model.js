module.exports = (sequelize, Sequelize) => {
  const Round = sequelize.define("round", {
    name: {
      type: Sequelize.DataTypes.STRING,
    },
  });

  return Round;
};
