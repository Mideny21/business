const mongoose = require('mongoose');
const dotenv = require('dotenv');

process.on('uncaughtException', err => {
  console.log(err.name, err.message); 
  console.log('UNCAUGHT EXCEPTION SHUTTING DOWN')
  
    process.exit(1); // 0 success 1 uncaught exception
  
});

dotenv.config({ path: './config.env' });

const app = require('./app');

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

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});

process.on('unhandledRejection', err => {
  console.log(err.name, err.message); 
  console.log('UNHANDLED REJECTION')
  server.close(() => {
    process.exit(1); // 0 success 1 uncaught exception
  });
});

