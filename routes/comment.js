const express = require('express');
const Router = express.Router();
const Comment = require('../models/Comment');
const checkAuth = require('../middleware/checkAuth');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

// new comment
Router.post('/new-comment/:videoId', checkAuth, async (req, res) => {
    try {
        const verifiedUser = await jwt.verify(req.headers.authorization.split(" ")[1], 'Yoravers Project');
        console.log(verifiedUser);
        const newComment = new Comment({
            _id: new mongoose.Types.ObjectId(),
            videoId: req.params.videoId,
            userId: verifiedUser._id,
            commentText: req.body.commentText
        });
        
        const comment = await newComment.save();
        res.status(200).json({
            newComment: comment
        });

    } catch (err) {
        console.log(err);
        res.status(500).json({
            error: err
        });
    }
});

// get all comments for a video
Router.get('/:videoId',async(req,res)=>{
   try
   {
    const comments = await Comment.find({videoId:req.params.videoId}).populate('userId','channelName logoUrl');
    res.status(200).json({
         commentList:comments
    })
   }
   catch(err)
   {
    console.log(err);
    res.status(500).json({
        error:err
    })
   } 
});

// update comment
Router.put('/:commentId',checkAuth,async(req,res)=>{
    try
    {
        const verifiedUser = await jwt.verify(req.headers.authorization.split(" ")[1], 'Yoravers Project');
        console.log(verifiedUser);

        const comment = await Comment.findById(req.params.commentId);
        console.log(comment)
        
        if(comment.userId != verifiedUser._id)
        {
            return res.status(500).json({
                error:'You are not authorized to update this comment'
            })
        }

        comment.commentText = req.body.commentText;
        const updatedComment = await comment.save();
        res.status(200).json({
            updatedComment:updatedComment
        })

    }
    catch(err)
    {
        console.log(err);
        res.status(500).json({
            error:err
        })
    }

});

// delete comment
Router.delete('/:commentId',checkAuth,async(req,res)=>{
    try
    {
        const verifiedUser = await jwt.verify(req.headers.authorization.split(" ")[1], 'Yoravers Project');
        console.log(verifiedUser);

        const comment = await Comment.findById(req.params.commentId);
        console.log(comment)
        
        if(comment.userId != verifiedUser._id)
        {
            return res.status(500).json({
                error:'You are not authorized to delete this comment'
            })
        }

        await Comment.findByIdAndDelete(req.params.commentId);
        res.status(200).json({
            deletedData:'Successfully deleted'
        })

    }
    catch(err)
    {
        console.log(err);
        res.status(500).json({
            error:err
        })
    }

});


module.exports = Router;