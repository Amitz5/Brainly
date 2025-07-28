import express from "express";

import mongoose from "mongoose";
import jwt from "jsonwebtoken";

import { JWT_PASSWORD } from './config';

import { UserModel, ContentModel, LinkModel } from "./db" ;
import { userMiddleware } from "./middleware";

import { random } from "./utils";

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
        userId: req.userId,
        tags: []
    })
     res.json({
        message:"Content added"
    })

}) 

app.get("/api/v1/content", userMiddleware, async(req, res) => {
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
        userId: req.userId
    })
    res.json({
        message: "deleted"
    })
}) 

app.post("/api/v1/brain/share",userMiddleware, async (req, res) => {
    const share = req.body.share;
        if(share) {
            const existingLink =  await LinkModel.findOne({
                userId: req.userId
            });

            if(existingLink){
                res.json({
                    hash: existingLink.hash
                })
                return;
            }

        const hash = random(10);
        await LinkModel.create({
            userId: req.userId,
            hash: hash
        })
        
        res.json({
            message:"/share/" + hash
        })
    } else {
        await LinkModel.deleteOne({
            //@ts-ignore
            userId: req.userId
        })
    }
    res.json({
        message: "Removed Link"
    })

}) 

app.get("/api/v1/brain/:sharelink", async(req, res) => {
    const hash  = req.params.sharelink;
    const Link = await LinkModel.findOne({
        hash
    });

    if(!Link) {
        res.status(411).json ({
            message:"sorry incorrect input"
        })
        return;
    }

    const content = await ContentModel.find({
        userId: Link.userId
    })

    const user = await UserModel.findOne({
        _Id: Link.userId
    })
    if(!user){
        res.status(411).json({
            message: "user not found"
        })
        return;
    }

    res.json({
        username: user.username,
        content: content
    })
}) 
app.listen(5001);