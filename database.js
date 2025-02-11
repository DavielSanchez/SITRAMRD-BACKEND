const {mongoose} = require('mongoose');

const mongoConnection = (stringConnection) =>{
    mongoose.connect(stringConnection);

    const connection = mongoose.connection;

    connection.once('open', () =>{
        console.log('Db Connection Succesfull');
    })

    connection.on('error', (err) =>{
        console.log('Db connection failed', err)
    })
}

module.exports = { mongoConnection }