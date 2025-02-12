const { default: mongoose } = require('mongoose')

// Mongo DB y mongoose, conexion y validacion //
const mongoConnection = (stringConnection) => {
    mongoose.connect(stringConnection);

    const connection = mongoose.connection;

    connection.once('open', () => {
        console.log('DB CONNECTION SUCCESFULL')
    })

    connection.on('error', (err) => {
        console.log('DB CONNECTION FAILED', err)
    })
}

////////////////////////////////////////////////////

module.exports = { mongoConnection }