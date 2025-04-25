import { response, Router } from "express";
import { resolveIDmiddleware } from "../middlewares/middlewares.mjs";
import { Clients } from "../db.js";
import { query, validationResult, body, matchedData, checkSchema } from "express-validator";


const router = Router()

router.get("/api/blog",async (request, response)=>{
    const blogs = await Clients.query(`SELECT 
                                        blogs.title,
                                        blogs.description,
                                        blogs.author,
                                        users.name,
                                        users.email,
                                        users.gender FROM blogs JOIN users ON blogs.author=users.username`);
    if (blogs.rows.length===0) return response.status(404).send("there is no blog")
    return response.status(200).json(blogs.rows)
});

router.get("/api/blog/:id", async (request,response)=>{
    const userId = parseInt(request.params.id);
    if (isNaN(userId)) return response.status(400).json({ error: "Invalid user ID" });
    const user = request.session.user;
    if (user === undefined) return response.status(400).send({msg : "you dont have access!"})
    console.log(user);
    const blog = await Clients.query("SELECT * FROM blogs WHERE id = $1",[userId])
    return response.status(200).json(blog.rows);
});

router.post("/api/blog", async (request,response)=>{
    const user = request.session.user;
    if (user === undefined) return response.status(400).send({msg : "you dont have access!"});

    const {body:{title,description}} = request
    if (!title || !description ) return response.status(400).send({msg:"all field must be provided"})
    
    const blog = await Clients.query(`INSERT INTO blogs (title , description , author) 
    VALUES ($1,$2,$3)`,[title , description,request.session.user[0].username]);
    
    return response.status(200).send({msg : "blog created successfully!"})
});

router.patch("/api/blog/:id",resolveIDmiddleware, async (request,response)=>{
    if (request.session.user===undefined) return response.status(404).json({msg:"you must loggin first!"});
    const blog = await Clients.query("SELECT * FROM blogs WHERE id=$1",[request.parsedID]);
    if (blog.rows.length === 0) return response.status(400).json({msg:'blog does not exist!'});
    if (blog.rows[0].author!==request.session.user[0].username) return response.status(400).json({msg:"you dont have access to this blog"})
    const {body:{title , description}} = request
    if (title || description) {
        if (title) {
            await Clients.query("UPDATE blogs SET title=$1  WHERE id = $2",[title,request.parsedID])
        }
        else if (description) {
            Clients.query("UPDATE blogs SET description=$1  WHERE id = $2",[description,request.parsedID])
        }

        return response.status(200).json({msg:"item updated successfully!"});
    }
    else return response.status(400).json({msg:"at least one field must be provided!"});

    
});

router.delete("/api/blog/:id",resolveIDmiddleware, async (request,response)=>{
    if (request.session.user===undefined) return response.status(404).json({msg:"you must loggin first!"});
    const blog = await Clients.query("SELECT * FROM blogs WHERE id=$1",[request.parsedID]);
    if (blog.rows.length === 0) return response.status(400).json({msg:'blog does not exist!'});
    if (blog.rows[0].author!==request.session.user[0].username) return response.status(400).json({msg:"you dont have access to this blog"})
    await Clients.query("DELETE FROM blogs WHERE id = $1",[request.parsedID])
    return response.status(200).json({msg:"item deleted successfully!"});
});

export default router;