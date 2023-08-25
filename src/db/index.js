import pg from "pg";
const {Pool} = pg;
const {CONNECTION_STRING} = process.env;


const pool = new Pool({
    connectionString:CONNECTION_STRING
});

const db = {
    query(text, params){
        return pool.query(text, params);
    },
};
export default db;