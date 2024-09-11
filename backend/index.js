import cookieParser from 'cookie-parser';
import express from 'express';
import cors from 'cors'
import dotenv from 'dotenv';
import connectDb from './utils/db.js';
import userRoute from './routes/user.routes.js'
import companyRoute from './routes/company.routes.js'
import jobRoute from './routes/job.routes.js'
import applicationRoute from './routes/application.routes.js'
dotenv.config({});
const app= express();
const PORT = process.env.PORT ||3000;

//middleware
app.use(express.json());
app.use(express.urlencoded({extended:true
}))
app.use(cookieParser());
const corsOptions={
    origin:'http//localhost:5173',
    Credentials:true
}
app.use(cors(corsOptions))

//apis
app.use('/api/v1/user',userRoute)
app.use('/api/v1/company',companyRoute)
app.use('/api/v1/job',jobRoute)
app.use('/api/v1/application',applicationRoute )

app.listen(PORT,()=>{
    connectDb();
    console.log(`server listning on ${PORT}`);
    
})