import express from 'express';
import routes from './routes';
import { errorHandler } from './middleware/errorHandler';

const app = express();

app.use(express.json());
app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});
app.use('/api', routes);
app.use(errorHandler);

export default app;
