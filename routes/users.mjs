import { response, Router } from "express";
import { query, validationResult, body, matchedData, checkSchema } from "express-validator";
//import {users} from "./constants.mjs";
import { resolveIDmiddleware } from "../middlewares/middlewares.mjs";
import { validateUserData,UserValidation,validateUserUpdate } from "../utils/validationSchema.mjs";
import { Clients } from "../db.js";



const router = Router();

router.get("/api/users",query('method').optional().isInt().withMessage("most be an interger!"), async (request, response) => {
    const result = validationResult(request)
    const dbresult = await Clients.query("SELECT * FROM users")
    const user = dbresult.rows
    let {query : {method}} = request
    if (!result.isEmpty()) return response.status(400).send(result.array()[0].msg)
    if (method){
        if (method%2 === 1){
            let new_users = user.filter((user) => user.id%2===1)
            return response.json(new_users)
        }
        if (method%2 === 0){
            var new_users = user.filter((user) => user.id%2===0)
            return response.json(new_users)
        }
    }
    else {
        console.log(request)
        return response.json(user);
    }

})

router.post("/api/users",
    body('username')
        .notEmpty()
        .withMessage('cannot be empty!')
        .isLength({min:5 ,max:35})
        .withMessage('must be between 5 and 35'),
    body('name')
        .notEmpty()
        .withMessage('cannot be empty'),
    body('email')
        .notEmpty()
        .isEmail(),
    async (request,response)=>{
    const result = validationResult(request)
    //console.log(result)
    if (!result.isEmpty()) return response.send(result.array()[0].msg);

    const { username, email,gender, password, name } = request.body;

    const userExists = await Clients.query(
        'SELECT * FROM users WHERE username = $1 OR email = $2',
        [username, email]
      );
      if (userExists.rows.length !== 0) {
        console.log(userExists.rows)
        return response.status(409).json({ 
          error: 'User already exists',
          details: 'Username or email already in use'
        });
      }

    const new_user = await Clients.query(`INSERT INTO users (username, email, gender, password, name)
    VALUES ($1, $2, $3, $4, $5)`,[username, email, gender, password, name]);

    return response.status(201).json(`user ${username} created successfully`)
});


router.get("/api/users/:id", async (request,response) => {
    let Id = parseInt(request.params.id)
    if (isNaN(Id)){
        response.status(400).send({message : "invalid ID"})
    }
    else {
        const user = await Clients.query('SELECT username , name, email ,gender FROM users WHERE id = $1',[Id]);
        console.log(user.rows)
        if (user.rows.length === 0) return response.status(404).json({message : "user does not exist"})
        return response.status(404).json(user.rows[0])
        
    }
    
});

router.patch("/api/users/:id", validateUserUpdate, async (request, response) => {
    try {
        await Clients.query('BEGIN');
        
        const userId = parseInt(request.params.id);
        if (isNaN(userId)) {
            return response.status(400).json({ error: "Invalid user ID" });
        }

        const { username, name, email, gender } = request.body;
        
        if (!username && !name && !email && !gender) {
            return response.status(400).json({ error: "At least one field must be provided for update" });
        }

        const updateFields = [];
        const values = [userId];
        let paramIndex = 2;

        if (username) {
            updateFields.push(`username = $${paramIndex++}`);
            values.push(username);
        }
        if (name) {
            updateFields.push(`name = $${paramIndex++}`);
            values.push(name);
        }
        if (email) {
            updateFields.push(`email = $${paramIndex++}`);
            values.push(email);
        }
        if (gender) {
            updateFields.push(`gender = $${paramIndex++}`);
            values.push(gender);
        }

        const queryText = `
            UPDATE users 
            SET ${updateFields.join(', ')}
            WHERE id = $1
            RETURNING id, username, name, email, gender
        `;

        const result = await Clients.query(queryText, values);

        if (result.rows.length === 0) {
            await Clients.query('ROLLBACK');
            return response.status(404).json({ error: "User not found" });
        }

        await Clients.query('COMMIT');
        return response.json({
            message: "User updated successfully",
            user: result.rows[0]
        });

    } catch (error) {
        await Clients.query('ROLLBACK');
        console.error("Update error:", error);
        
        if (error.code === '23505') {
            return response.status(409).json({ 
                error: "Database conflict",
                detail: error.detail
            });
        }
        
        return response.status(500).json({ error: "Internal server error" });
    }
  
});


// router.patch("/api/users/:id",resolveIDmiddleware, (request,response) => {
//     users[request.findIndex]={...users[request.findIndex],...request.body};
//     return response.send(users[users.findIndex((user)=>user.id===request.findIndex)+1]).sendStatus(200);
// });


router.delete("/api/users/:id",resolveIDmiddleware, async (request,response) => {
    await Clients.query("DELETE FROM users WHERE id = $1",[request.userData.id]);
    return response.status(200).send("item deleted successfully ");
});


router.post("/api/login", async (request,response) => {
    const {body:{username,password}} = request;
    const user = await Clients.query(`SELECT * FROM users WHERE username=$1 `,[username])
    if (!username || !password) {
        return response.status(400).json({ 
            message: "Username and password are required" 
        });
    }
    //const finduser = users.find( user => user.username === username);
    if (user.rows.length===0 || user.rows[0].password!==password) {
        return response.status(401).send({message : "BAD CREDENTIALS"});
    }
    request.session.user = user.rows;
    console.log(request.session.user)
    response.status(200).send({message : `hello ${user.rows[0].name}`})
});


export default router;