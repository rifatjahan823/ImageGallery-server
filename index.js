require('dotenv').config();
const express = require('express');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;

const cors = require('cors');

app.use(cors());
app.use(express.json());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.qwlvmct.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    const db = client.db('Image-Gallery');
    const imageCollection = db.collection('image');

    // -------------Get-Image---------------
    app.get('/image', async (req, res) => {
        const cursor = imageCollection.find({});
        const images = await cursor.toArray();
  
        res.send({ status: true, data: images });
      });
  
      app.post('/image', async (req, res) => {
        const images = req.body;
        const result = await imageCollection.insertOne(images);
        res.send(result);
      })

      app.delete('/delete-selected-images', async (req, res) => {
        const { selectedImageIds } = req.body;
      
        try {
          // Iterate through the selectedImageIds array and delete each image by its ID
          const deletionPromises = selectedImageIds.map(async (imageId) => {
            const result = await imageCollection.deleteOne({ _id: new ObjectId(imageId) });
            return result.deletedCount === 1;
          });
      
          const deletionResults = await Promise.all(deletionPromises);
      
          if (deletionResults.every((result) => result)) {
            // All selected images were deleted successfully
            res.status(200).json({ status: true, message: 'Selected images deleted successfully.' });
          } else {
            // Some or all images failed to delete
            res.status(400).json({ status: false, message: 'Failed to delete selected images.' });
          }
        } catch (error) {
          console.error(error);
          res.status(500).json({ status: false, message: 'Internal server error.' });
        }
      });

  } finally {

  }
}


run().catch((err) => console.log(err));

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});