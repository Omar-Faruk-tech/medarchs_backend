module.exports = (sequelize, dataType) => {

    const booking = sequelize.define('booking', {
        date: {
            type: dataType.DATE, 
            allowNull: false
        },
        time: {
            type: dataType.STRING,
            allowNull: false
        },
        doctorId: {
            type: dataType.STRING,
            allowNull: false
        },
        status: {
            type: dataType.STRING,
            allowNull: false
        },
        doctorName: {
            type: dataType.STRING,
            allowNull: false
        },
        patientName: {
            type: dataType.STRING,
            allowNull: false
        },
        doctorContact: {
            type: dataType.STRING,
        },
        patientContact: {
            type: dataType.STRING,
        }
    });
    return booking;
};