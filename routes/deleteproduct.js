import express from 'express';
import * as Auth from '../auth/auth.js';
import { dbQuery, dbClientQuery, dbCreateAuditQuery } from '../database/db.js';

export const router = express.Router();

router.put('/', Auth.authVerifyJWT, async (req, res, next) => {
    const reqBody = req.body;

    if (reqBody.product_sku == null || reqBody.product_sku == ""){
        res.status(400).send({msg: "Missing or Invalid Product SKU."});
        return;
    }

    try{
        const add = {
            text:"UPDATE products SET is_active=false, updated_at=NOW()  WHERE product_sku=$1;",
            values:[reqBody.product_sku],
        };
        const userCheck = {
            text:"SELECT id FROM users WHERE email=$1",
            values:[reqBody.email],
        };
        const check = {
            text:"SELECT id FROM products WHERE product_sku=$1",
            values:[reqBody.product_sku],
        };
        

        await dbClientQuery('BEGIN');
        await dbClientQuery(add);
        const userRes = await dbClientQuery(userCheck);
        const checkRes = await dbClientQuery(check);
        const audit = dbCreateAuditQuery(userRes.rows[0].id, 'DELETE', 'PRODUCT', checkRes.rows[0].id, {is_active:true}, {is_active:false});
        await dbClientQuery(audit);
        await dbClientQuery('COMMIT');
        res.status(201).send({msg: "Successfully Deleted the Product."});
        return;
    } 
    catch (err){
        dbClientQuery("ROLLBACK");
        console.log(err);
        res.status(500).send(err);
        return;
    }
});
