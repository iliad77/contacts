import { Router } from "express";
import { resolveIDmiddleware } from "../middlewares/middlewares.mjs";
import { Clients } from "../db.js";




const router = Router()


router.get("/api/like_blog",async (request,response)=>{
    const like_blog = await Clients.query(`SELECT * FROM person_like_blog 
                                           JOIN blogs ON person_like_blog.blog_id = blogs.id
                                           JOIN users ON users.username = person_like_blog.userev`)
    if (like_blog.rows.length !== 0) {
        return response.status(200).json(like_blog.rows)
    }
    return response.status(404).send("there is no liked blog!")
})

router.post("/api/like_blog/:id",resolveIDmiddleware, async (request,response)=>{
    const blog = await Clients.query("SELECT * FROM blogs WHERE id = $1",[request.parsedID]);
    const bloglike = await Clients.query("SELECT * FROM person_like_blog WHERE blog_id = $1",[request.parsedID])
    if (request.session.user===undefined) return response.status(401).json({msg:"you must loggin first!"})
    if (blog.rows.length===0) return response.status(404).json({msg:"there is no blog with this id"})
    const{body:{like}} = request;
    if (bloglike.rows.length === 0) {
        if (like === true){
            const userve = request.session.user[0].username
            await Clients.query(`INSERT INTO person_like_blog(userev,blog_id,is_liked)
                                VALUES ($1 , $2 , $3)`,[userve,request.parsedID,like]);
            return response.status(200).json({msg:`you liked ${request.params.id}th blog`});
        }
        else if (like === false) {
            const userve = request.session.user[0].username
            await Clients.query(`INSERT INTO person_like_blog(userev,blog_id,is_liked)
                                VALUES ($1 , $2 , $3)`,[userve,request.parsedID,like]);
            return response.status(200).json({msg:`you disliked ${request.params.id}th blog`});
        }
        else return response.status(404).send("bad request")
    }
    else {
        if (like === true){
            const userve = request.session.user[0].username
            await Clients.query("UPDATE person_like_blog SET is_liked = $1 WHERE blog_id = $2",[like,request.parsedID])
            return response.status(200).json({msg:`you update liked ${request.params.id}th blog`});
        }
        else if (like === false) {
            const userve = request.session.user[0].username
            await Clients.query("UPDATE person_like_blog SET is_liked = $1 WHERE blog_id = $2",[like,request.parsedID])
            return response.status(200).json({msg:`you update disliked ${request.params.id}th blog`});
        }
        else return response.status(404).send("bad request") 
    }

});

export default router;