import { dbQuery, dbClientQuery } from '../database/db.js';
import jwt from 'jsonwebtoken';
import argon2 from 'argon2';

// import passport from 'passport';
// import { ExtractJwt, Strategy } from 'passport-jwt';

const jwt_private_key = process.env.JWT_SECRET;
const jwt_iss = process.env.JWT_ISSUER;

// const jwt_option = {
//     jwtFromRequest: ExtractJwt.fromBodyField("authorization"),
//     secretOrKey: jwt_private_key,
// }

// passport.use(
//     new Strategy(jwt_option, (payload, done) => {
//         console.log(payload);
//         if (payload.sub == 'admin@admin.com'){
//             return done(null, true);
//         } else {
//             return done(null, false);
//         }
//     })
// );

export const authMakePassword = async (password) => {
    try {
        const hash = await argon2.hash(password);
        return hash;
    } catch (err) {
        console.log(err);
        return "error : " + err
    }
    
};

export const authLogin = async (req, res, next) => {
    const { email, password} = req.body;
    
    const query = {
        text:"SELECT email, password_hash FROM users WHERE email=$1",
        values:[email],
    }

    const dbRes = await dbQuery(query);
    const dbData = dbRes.rows[0]
    if (dbData == null){
        res.status(400).send({msg: "Can't Find User with that email."});
        return;
    }

    try {
        if (await argon2.verify(dbData.password_hash, password)){
            const token = jwt.sign(
                {
                    sub: email,
                    iat: Math.floor(Date.now() / 1000.0),
                    iss: jwt_iss,
                },
                jwt_private_key,
                {
                    expiresIn: "1d",
                }
            )
            res.locals.token = token;
            next();
        } else {
            res.status(401).send({
                msg: "Incorrect Login Credential"
            });
            return;
        }
    } catch (error) {
        console.log(error);
        res.status(500).send({
                msg: error
        });
        return;
    }   
}

export const decodeJWT = (token) => {
    return jwt.verify(token, jwt_private_key)
}

export const authVerifyJWT = (req, res, next) => {
    const reqBody = req.body;
    if (reqBody == null){
        res.status(401).send({msg: "Invalid Request Body"});
        return;
    }
    if (reqBody.token == null){
        res.status(401).send({msg: "Invalid Request Token"});
        return;
    }
    const options = {
        subject: reqBody.email,
        issuer: jwt_iss,
    };
    jwt.verify(reqBody.token, jwt_private_key, options,(err, decoded) =>{
        if (err) {
            res.status(401).send({msg: err});
            return;
        }
    });
    next();
}

// export const authJWT = passport.authenticate("jwt", {session: false});
