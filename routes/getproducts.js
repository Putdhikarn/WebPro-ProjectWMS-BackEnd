import express from 'express';
import * as Auth from '../auth/auth.js';
import { dbQuery, dbClientQuery } from '../database/db.js';

export const router = express.Router();

router.get('/', Auth.authVerifyJWT, async (req, res, next) => {
    try {
        const respond = await dbQuery("SELECT * FROM products");
        res.status(200).send({
            msg: respond.rows
        });

    } catch (error){
        next(error);
    }
});
