module.exports = (sequelize, Sequelize) => {
    const Fixture = sequelize.define("fixture", {
      id: {
        type: Sequelize.DataTypes.INTEGER,
        primaryKey: true,
      },
      reference: {
        type: Sequelize.DataTypes.STRING,
      },
      timezone: {
        type: Sequelize.DataTypes.STRING,
      },
      date: {
        type: Sequelize.DataTypes.DATE,
      },
      start: {
        type: Sequelize.DataTypes.DATE,
      },
      end: {
        type: Sequelize.DataTypes.DATE,
      },
      status: {
        type: Sequelize.DataTypes.STRING,
      },
      statusCode: {
        type: Sequelize.DataTypes.STRING,
      },
      elapsed: {
        type: Sequelize.DataTypes.INTEGER,
      },
      venueId: {
        type: Sequelize.DataTypes.INTEGER,
      }
    });
  
    return Fixture;
  };
  