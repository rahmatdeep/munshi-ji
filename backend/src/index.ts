import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import authRouter from './routes/auth';
import casesRouter from './routes/cases';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRouter);
app.use('/api/cases', casesRouter);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
