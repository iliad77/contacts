import { response } from "express";
import {Clients} from "../db.js"

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