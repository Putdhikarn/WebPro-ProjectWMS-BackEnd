import express from 'express';
import * as Auth from '../auth/auth.js';

export const router = express.Router();

router.post('/', Auth.authLogin, async (req, res, next) => {
    if (res.locals.err == 1){
        return;
    }
    try {
        const reqBody = req.body;
        res.status(200).send({
            msg: "login success",
            email: reqBody.email,
            token: res.locals.token,
        });
    } catch (error) {
        next(error);
    }
});