import express from 'express';
import * as Auth from '../auth/auth.js';
import { dbQuery, dbClientQuery, dbCreateAuditQuery } from '../database/db.js';

export const router = express.Router();

router.post('/', Auth.authVerifyJWT, async (req, res, next) => {
    const reqBody = req.body;

    if (reqBody.warehouse_name == null || reqBody.warehouse_name == ""){
        res.status(400).send({msg: "Missing or Invalid Warehouse Name."});
        return;
    }
    if (reqBody.warehouse_code == null || reqBody.warehouse_code == ""){
        res.status(400).send({msg: "Missing or Invalid Warehouse Code."});
        return;
    }

    try{
        const add = {
            text:"INSERT INTO warehouse(warehouse_name, warehouse_code, created_at, updated_at) VALUES ($1, $2, NOW(), NOW());",
            values:[reqBody.warehouse_name, reqBody.warehouse_code],
        };
        const userCheck = {
            text:"SELECT id FROM users WHERE email=$1",
            values:[reqBody.email],
        };
        const check = {
            text:"SELECT id FROM warehouse WHERE warehouse_code=$1",
            values:[reqBody.warehouse_code],
        };
        

        await dbClientQuery('BEGIN');
        await dbClientQuery(add);
        const userRes = await dbClientQuery(userCheck);
        const checkRes = await dbClientQuery(check);
        const audit = dbCreateAuditQuery(userRes.rows[0].id, 'ADD', 'WAREHOUSE', checkRes.rows[0].id, {}, {warehouse_name: reqBody.warehouse_name, warehouse_code: reqBody.warehouse_code});
        await dbClientQuery(audit);
        await dbClientQuery('COMMIT');
        res.status(201).send({msg: "Successfully Added the warehouse."});
        return;
    } 
    catch (err){
        dbClientQuery("ROLLBACK");
        console.log(err);
        res.status(500).send(err);
        return;
    }
});
