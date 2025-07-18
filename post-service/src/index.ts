import express from 'express';
import mongoose from 'mongoose';
import postRoutes from './routes/post.routes';
import path from 'path';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
app.use('/posts', postRoutes);

mongoose
  .connect('mongodb://mongo:27017/posts')
  .then(() => {
    app.listen(3002, () => console.log('Post-service running on port 3002'));
  })
  .catch(err => console.error(err));
