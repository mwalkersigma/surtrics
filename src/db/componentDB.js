import pg from "pg";
const {Pool} = pg;
const {CONNECTION_STRING} = process.env;


const pool = new Pool();

export const componentDB = {
    query(text, params){
        return pool.query(text, params);
    },
};
