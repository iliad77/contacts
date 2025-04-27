import { response } from "express";
import {Clients} from "../db.js"
import { request } from "http";
import jwt from "jsonwebtoken";
import dotenv from "dotenv"
dotenv.config()

export const resolveIDmiddleware = async (request, response, next) => {
    try {
        const { params: { id }, } = request;
        const parsedID = parseInt(id);
        
        if (isNaN(parsedID)) {
            return response.status(400).json({ message: "ID is not valid" });
        }

        request.parsedID = parsedID
        next();
    } catch (error) {
        console.error("Middleware error:", error);
        return response.status(500).json({ message: "Internal server error" });
    }
};

export const importedmiddleware = (request,response,next) => {
    console.log("imported middleware is working correctlly");
    next();
}

export const authenticateMiddleware = (request,response,next) => {
    const authheader = request.session.token;
    
    if (authheader == null) return response.status(401).send("you dont have access!");

    jwt.verify(authheader , process.env.JWT_SECRET,(err,jwtuser)=>{
        if(err) return response.status(403).send("you dont have access!");
        request.user = jwtuser
        next()
    })
    
}