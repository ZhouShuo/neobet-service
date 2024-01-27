module.exports = (sequelize, Sequelize) => {
    const Bookmaker = sequelize.define("bookmaker", {
      id: {
        type: Sequelize.DataTypes.INTEGER,
        primaryKey: true,
      },
      name: {
        type: Sequelize.DataTypes.STRING,
      },
    });
  
    return Bookmaker;
  };
  