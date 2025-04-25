import express, { response } from "express";
import { request } from "http";
import { availableMemory, nextTick } from "process";
import cookieParser from "cookie-parser";
import session from "express-session";
import userRouter from "./routes/users.mjs";
import blogRouter from "./routes/blogs.js";
import likeRouter from "./routes/like_blog.js";
import {importedmiddleware } from "./middlewares/middlewares.mjs";
import passport from 'passport';
import {Clients} from "./db.js";

const app = express();

async function testConnection() {
    try {
      await Clients.connect();
      console.log('✅ Connected to PostgreSQL database');
      
      // Verify with a simple query
      const res = await Clients.query('SELECT NOW()');
      console.log('📅 Database time:', res.rows[0].now);
      
      return true;
    } catch (err) {
      console.error('❌ Connection error:', err.stack);
      return false;
    }
  };

  testConnection().then(success => {
    if (success) {
      app.listen(3000, () => {
        console.log('🚀 Express server running on port 3000');
      });
    } else {
      console.error('Failed to start server due to database connection issues');
      process.exit(1);
    }
  });

app.use(express.json());
app.use(cookieParser('secret'));
app.use(session({secret:"ali",saveUninitialized:false,resave:false,cookie:{maxAge:60000*60}}));

app.use(passport.initialize());
app.use(passport.session());

const PORT = process.env.PORT || 3000;

const testmiddleware = (request,response,next) => {
    console.log("middleware is running ...");
    next();
};

app.use(testmiddleware);
app.use(importedmiddleware);

app.use(userRouter);
app.use(blogRouter);
app.use(likeRouter);

app.get("/", (request , response) => {
    response.cookie("new_cookie","my cookie",{signed:true});
    request.session.visited = true;
    console.log(request.headers.cookie);
    console.log(request.cookies);
    console.log(request.signedCookies);
    console.log(request.session);
    console.log(request.session.id);
    response.status(201).send({msg:"hello"});
});

// app.listen(PORT, () => {
//     console.log(`running on port ${PORT}`)
// });

