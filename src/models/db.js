const { MongoClient } = require('mongodb');


// MongoDB URI and options
const uri = 'mongodb+srv://24560002:Info123@csbu103.q3boj.mongodb.net/?retryWrites=true&w=majority&appName=CSBU103'; // Replace with your MongoDB connection string
const dbName = 'demo'; // Replace with your database name

let dbInstance;

async function connectToDb() {
  if (dbInstance) return dbInstance; // Return existing instance if already connected

  try {
    



    const client = new MongoClient(uri, { 
      socketTimeoutMS: 60000,  
      connectTimeoutMS: 60000,
     });
    await client.connect();
    console.log('Connected to MongoDB');
    dbInstance = client.db(dbName);
    return dbInstance;
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    throw error;
  }
}

module.exports = { connectToDb };