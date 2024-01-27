module.exports = (sequelize, Sequelize) => {
  const Country = sequelize.define("country", {
    code: {
      type: Sequelize.DataTypes.STRING,
    },
    flag: {
      type: Sequelize.DataTypes.STRING,
    },
    name: {
      type: Sequelize.DataTypes.STRING,
    },
  });

  return Country;
};
