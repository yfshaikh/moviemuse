import express from 'express'
import cors from 'cors'
import pool from './db.js'
import bcrypt from 'bcrypt'

const app = express()
const PORT = 8000

//middleware
app.use(cors());
app.use(express.json()); //req.body

app.post("/users", async (req, res) => {
    try {
        // get informarion from client-side request
        const {username, password, email, first_name, last_name} = req.body;

        // make sure all info is given
        if (!username || !email || !password || !first_name || !last_name) {
            return res.status(400).json({ error: "All fields are required" });
        }
    
        // hash the password using bcrypt
        const saltRounds = 10;
        const passwordHash = await bcrypt.hash(password, saltRounds);
    
        // Insert the new user into the database
        const newUser = await pool.query(
            `INSERT INTO users (username, email, password_hash, first_name, last_name)
            VALUES ($1, $2, $3, $4, $5) RETURNING *`,
            [username, email, passwordHash, first_name, last_name]
        );
    
        // return the created user (without password_hash)
        const { password_hash, ...userWithoutPassword } = newUser.rows[0];
        res.status(201).json(userWithoutPassword);
  
    } catch (err) {
      console.error(err.message);
      res.status(500).json({ error: "Internal Server Error" });
    }

});

app.listen(PORT, () => {
    console.log(`server started on port ${PORT}`)
})