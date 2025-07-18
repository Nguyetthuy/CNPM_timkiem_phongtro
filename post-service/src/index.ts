import express from 'express';
import mongoose from 'mongoose';
import postRoutes from './routes/post.routes';

const app = express();
app.use(express.json());
app.use('/posts', postRoutes);

mongoose
  .connect('mongodb://mongo:27017/posts')
  .then(() => {
    app.listen(3002, () => console.log('Post-service running on port 3002'));
  })
  .catch(err => console.error(err));
