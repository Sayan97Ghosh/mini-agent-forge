import express from 'express';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import router from './api/routes';

dotenv.config();

const app = express();
app.use(bodyParser.json());

app.use('/api/v1/query', router);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});