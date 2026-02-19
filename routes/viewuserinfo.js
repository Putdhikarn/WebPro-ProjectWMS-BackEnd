import express from 'express';
import * as Auth from '../auth/auth.js';
import { dbQuery, dbClientQuery } from '../database/db.js';

export const router = express.Router();

router.post('/', Auth.authVerifyJWT, async (req, res, next) => {
    const reqBody = req.body;
    try{
        const query = {
            text:"SELECT email, role, pfp FROM users WHERE email=$1",
            values:[reqBody.email],
        }
        const respone = await dbClientQuery(query);
        let pfpb = "";
        if (respone.rows[0].pfp == null){
            pfpb = "";
        } else {
            pfpb = respone.rows[0].pfp.toString('base64');
        }
        const resp = {
            email: respone.rows[0].email,
            role: respone.rows[0].role,
            pfp: pfpb,
        };
        res.status(200).send({msg: resp});
        return;
    } 
    catch (err){
        console.log(err);
        res.status(500).send(err);
        return;
    }
});
