import pkg from 'pg';


const { Pool } = pkg;

const pool = new Pool({
  user: "postgres",
  password: "postgrespass",
  host: "localhost",
  port: 5433,
  database: "moviemuse"
});

export default pool;