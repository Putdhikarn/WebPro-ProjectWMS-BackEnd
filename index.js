import 'dotenv/config'

import express from 'express';
import cors from 'cors'
import http from 'http'
import https from 'https'
// import { dbQuery, dbClientQuery } from './database/db.js';
import * as Auth from './auth/auth.js';
import fs from 'fs'

import { fileURLToPath } from 'url'
import * as Path from 'path'

import * as ViewUserInfo from './routes/viewuserinfo.js';
import * as UpdateUserPFP from './routes/updateuserpfp.js';
import * as GetInventory from './routes/getinventory.js';
import * as GetProducts from './routes/getproducts.js';
import * as RegisUser from './routes/regisuser.js';
import * as Login from './routes/login.js';
import * as AddWarehouse from './routes/addwarehouse.js';
import * as AddProduct from './routes/addproduct.js';
import * as DeleteProduct from './routes/deleteproduct.js';

const app = express();

const options = {
    key: fs.readFileSync('./cert/key.pem'),
    cert: fs.readFileSync('./cert/cert.pem')
};

// Redirect to  HTTPS
app.use((req, res, next) => {
    if (!req.secure) {
        return res.redirect(`https://${req.headers.host}${req.url}`);
    }
    next();
});
// Cross Origin Resource Sharing
app.use(cors())
app.use(express.static('public'));
app.use(express.json({ limit: "10mb" }));


app.post('/api/echo/:msg', (req, res) => {
    const { msg } = req.params;

    res.status(200).send({
        msg: msg
    });
});

app.use('/api/viewuserinfo', ViewUserInfo.router);
app.use('/api/updateuserpfp', UpdateUserPFP.router);
app.use('/api/getinventory', GetInventory.router);
app.use('/api/getproducts', GetProducts.router);
app.use('/api/regisuser', RegisUser.router);
app.use('/api/login', Login.router);
app.use('/api/addwarehouse', AddWarehouse.router);
app.use('/api/addproduct', AddProduct.router);
app.use('/api/deleteproduct', DeleteProduct.router);

// This Should Always be at the bottom!
app.get('/{*splat}', (req, res, next) => {
     //res.status(200).send({msg: "The REST Back End Actually works!!!"});
	 res.status(200).sendFile(Path.join(Path.dirname(fileURLToPath(import.meta.url)), 'public/index.html'));
});

const httpServer = http.createServer(options, app);
const httpsServer = https.createServer(options, app);

httpServer.listen(
    process.env.HTTP_SERVER_PORT,
    () => {
        console.log(`Backend Running on : https://localhost:${process.env.HTTP_SERVER_PORT}`);
    }
);

httpsServer.listen(
    process.env.HTTPS_SERVER_PORT,
    () => {
        console.log(`Backend Running on : https://localhost:${process.env.HTTPS_SERVER_PORT}`);
    }
);
