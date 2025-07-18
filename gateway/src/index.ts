// ===============================
// gateway/src/index.ts
// ===============================
import express, { Request, Response, NextFunction } from 'express';
import proxy from 'express-http-proxy';
import cors from 'cors';

const app = express();
app.use((req: Request, _res: Response, next: NextFunction) => {
  console.log(`[${req.method}] ${req.originalUrl}`);
  next();
});
app.use(cors());
app.use('/api/auth', proxy('http://auth-service:3001'));
app.use('/posts', proxy('http://post-service:3002'));

app.listen(3000, () => console.log('API Gateway on port 3000'));
