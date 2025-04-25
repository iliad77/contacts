import pkg from 'pg';
import dotenv from 'dotenv'

dotenv.config()
const { Client } = pkg;

export const Clients = new Client({
    host: 'localhost',
    user: process.env.USER,
    port: process.env.PORT,
    password: process.env.PASSWORD,
    database: process.env.DATABASE
});




