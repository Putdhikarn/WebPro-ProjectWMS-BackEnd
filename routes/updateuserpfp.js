import express from 'express';
import * as Auth from '../auth/auth.js';
import { dbQuery, dbClientQuery } from '../database/db.js';

export const router = express.Router();

router.put('/', Auth.authVerifyJWT, async (req, res, next) => {
    const reqBody = req.body;
    try{

        if (reqBody.img == null){
            res.status(400).send({msg: "Bad Image File"});
            return;
        }

        const query = {
            text:"UPDATE users SET pfp=decode($1, 'base64'), updated_at=NOW() WHERE email=$2",
            values:[reqBody.img.replace("data:image/png;base64,",""), reqBody.email],
        }

        const respone = await dbClientQuery(query);
        // res.status(200).send({msg: respone.rows[0]});
        res.status(200).send({msg: "Profile Image Changed."});
        return;
    } 
    catch (err){
        console.log(err);
        res.status(500).send(err);
        return;
    }
});
