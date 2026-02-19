import { Pool } from 'pg';

const pool = new Pool({
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        database: process.env.DB_NAME,
});

pool.on('error', (err, client) => {
  console.error('Unexpected error on idle client', err)
  process.exit(-1)
})

export async function dbQuery(query){
    try {
        const res = await pool.query(query);
        return res;
    } catch (err){
        console.log(err);
        return null;
    }
}

export async function dbClientQuery(query){
    const client = await pool.connect();
    try {
        const res = await client.query(query);
        return res;
    } catch (err){
        throw err;
    } finally{
        client.release();
    }
}
// AFFECTED TYPE
/*
0 - USER
1 - WAREHOUSE
2 - PRODUCT
3 - STOCK MOVEMENT
*/
// ACTION TYPE
/*
0 - ADD
1 - MODIFY
2 - REMOVE
*/
export function dbCreateAuditQuery(userId, action, affectedType, affectedId, oldVal, newVal){
    const query = {
        text: `INSERT INTO audit_logs(user_id, action, affected_entity_type, affected_entity_id, old_val, new_val, created_at) VALUES ($1, $2, $3, $4, $5, $6, NOW());`,
        values: [userId, action, affectedType, affectedId, oldVal, newVal],
    };
    return query;
}