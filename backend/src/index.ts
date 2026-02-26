import express from 'express';
import cors from 'cors';
import authRouter from './routes/auth';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use('/', authRouter);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
