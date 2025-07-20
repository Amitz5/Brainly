import express from "express";

import mongoose from "mongoose";
import jwt from "jsonwebtoken";

import { JWT_PASSWORD } from './config';

import { UserModel, ContentModel } from "./db" ;
import { userMiddleware } from "./middleware";

const app = express();
app.use(express.json());

app.post("/api/v1/signup", async(req, res) => {
    //TODO :  zod validation  ,  hash the password
    //if same username exist error status
    const username = req.body.username;
    const password = req.body.password; 

    try{
        await UserModel.create({
            username: username,
            password: password
        })

        res.json({
            message : "user signed up",
        })
    } catch(e) {
        res.status(411).json({
            message:"username already exists"
        })
    }
}) 

app.post("/api/v1/signin", async(req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    const existinguser = await UserModel.findOne({
        username,
        password
    })
    if (existinguser) {
        const token = jwt.sign({
            id: existinguser._id
        }, JWT_PASSWORD) 

        res.json({
            token
        })   
    } else {
        res.status(403).json({
            message: "Incorrect Credentials"
        })
    }
}) 

app.post("/api/v1/content", userMiddleware, async(req, res) => {
    const link = req.body.link;
    const type = req.body.type;
    await ContentModel.create({
        link,
        type,
        //@ts-ignore
        userId: req.userId,
        tags: []
    })
     res.json({
        message:"Content added"
    })

}) 

app.get("/api/v1/content", userMiddleware, async(req, res) => {
    //@ts-ignore
    const userId = req.userId;
    const content = await ContentModel.find({
        userId: userId
    }).populate("userId","username")
    res.json({
        content
    })
}) 

app.delete("/api/v1/content",userMiddleware, async(req, res) => {
    const contentId = req.body.contentId;

    await ContentModel.deleteMany({
        contentId,
        //@ts-ignore
        userId: req.user.Id
    })
    res.json({
        message: "deleted"
    })
}) 

app.post("/api/v1/brain/share", (req, res) => {
    
}) 

app.get("/api/v1/brain/:sharelink", (req, res) => {
    
}) 
app.listen(5001);