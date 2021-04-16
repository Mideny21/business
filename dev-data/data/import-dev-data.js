
const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

const Business = require('./../../models/businessModel');


dotenv.config({ path: './config.env' });

const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD);


mongoose.connect(DB, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false
}).then(() => {
    // console.log(con.connections);
    console.log('DB connection succesfully');
});

// READ JSON FILE
const business = JSON.parse(fs.readFileSync(`${__dirname}/tours-simple.json`, 'utf-8'));

//IMPORT DATA INTO DB
const importData = async () => {
    try {
        await Business.create(business);
        console.log('Data successfully');
        process.exit();

    } catch (error) {
        console.log(error);
    }
}


const deleteData = async () => {
    try {
        await Business.deleteMany();
        console.log('Data successfully');
        process.exit();
    } catch (error) {
        console.log(error);
    }
};


if (process.argv[2] === '--import') {
    importData();
} else if (process.argv[2] === '--delete') {
    deleteData();
}

console.log(process.argv);