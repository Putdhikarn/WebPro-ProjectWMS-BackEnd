import express from 'express';
import * as Auth from '../auth/auth.js';
import { dbQuery, dbClientQuery, dbCreateAuditQuery } from '../database/db.js';

export const router = express.Router();

router.post('/', Auth.authVerifyJWT, async (req, res, next) => {
    const reqBody = req.body;

    if (reqBody.product_sku == null || reqBody.product_sku == ""){
        res.status(400).send({msg: "Missing or Invalid Product SKU."});
        return;
    }
    if (reqBody.product_name == null || reqBody.product_name == ""){
        res.status(400).send({msg: "Missing or Invalid Product Name."});
        return;
    }

    try{
        const add = {
            text:"INSERT INTO products(product_sku, product_name, product_desc, unit, is_active, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, NOW(), NOW());",
            values:[reqBody.product_sku, reqBody.product_name, reqBody.product_desc, reqBody.product_unit, true],
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
        const audit = dbCreateAuditQuery(userRes.rows[0].id, 'ADD', 'PRODUCT', checkRes.rows[0].id, {}, {product_name: reqBody.product_name, product_sku: reqBody.product_sku, product_desc: reqBody.product_desc, product_unit:reqBody.product_unit, is_active: true});
        await dbClientQuery(audit);
        await dbClientQuery('COMMIT');
        res.status(201).send({msg: "Successfully Added the Product."});
        return;
    } 
    catch (err){
        dbClientQuery("ROLLBACK");
        console.log(err);
        res.status(500).send(err);
        return;
    }
});
