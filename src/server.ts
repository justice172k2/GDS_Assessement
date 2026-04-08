import 'reflect-metadata';
import 'dotenv/config';
import app from './app';
import { dataSource } from './config/db';

const port = process.env.PORT ? Number(process.env.PORT) : 3000;

const bootstrap = async (): Promise<void> => {
  try {
    await dataSource.initialize();

    app.listen(port, () => {
      // eslint-disable-next-line no-console
      console.log(`Server is running on port ${port}`);
    });
  } catch (error: unknown) {
    // eslint-disable-next-line no-console
    console.error('Failed to initialize application', error);
    process.exit(1);
  }
};

void bootstrap();
