import express from 'express';
import * as Auth from '../auth/auth.js';
import { dbQuery, dbClientQuery } from '../database/db.js';

export const router = express.Router();

router.post('/', async (req, res, next) => {
    const reqBody = req.body;
    let hash = ""
    try {
        hash = await Auth.authMakePassword(reqBody.password);
    } catch (err) {
        res.status(500).send(err);
    }
    const query = {
        text: "INSERT INTO users(email, password_hash, role, created_at, updated_at) VALUES ($1, $2, $3, NOW(), NOW())",
        values: [reqBody.email, hash, 0],
    };
    try {
        const respone = await dbClientQuery(query);
        res.status(200).send({respone});
    } catch (err) {
        res.status(500).send(err);
    }
});