const express = require('express');
const Router = express.Router();
const checkAuth = require('../middleware/checkAuth');
const jwt = require('jsonwebtoken');
const cloudinary = require('cloudinary').v2;
const Video = require('../models/Video');
const mongoose = require('mongoose');
//const { response } = require('../app');

cloudinary.config({ 
    cloud_name: process.env.CLOUD_NAME, 
    api_key: process.env.API_KEY, 
    api_secret: process.env.API_SECRET
});

//upload video
Router.post('/upload', checkAuth, async (req, res) => {
    try {
        const token = req.headers.authorization.split(" ")[1];
        const user = await jwt.verify(token, 'Yoravers Project');
        const uploadedVideo = await cloudinary.uploader.upload(req.files.video.tempFilePath,{
            resource_type: 'video'
        });
        const uploadedThumbnail = await cloudinary.uploader.upload(req.files.thumbnail.tempFilePath);

        const newVideo = new Video({
            _id: new mongoose.Types.ObjectId(),
                title: req.body.title,
                description: req.body.description,
                user_id: user._id,
                videoURL: uploadedVideo.secure_url,
                videoId: uploadedVideo.public_id,
                thumbnailURL: uploadedThumbnail.secure_url,
                thumbnailId: uploadedThumbnail.public_id,
                category: req.body.category,
                tags: req.body.tags.split(",")      
        });

        const newUploadedVideoData = await newVideo.save();
        res.status(200).json({
            newVideo:newUploadedVideoData
        })

    } catch (err) {
        console.log(err);
        res.status(500).json({
            error: err
        });
    }
});

//update video details
Router.put('/:videoId', checkAuth, async (req, res) => {
    try {
        const verifiedUser = await jwt.verify(req.headers.authorization.split(" ")[1], 'Yoravers Project');
        const video = await Video.findById(req.params.videoId);

        if (video.user_id == verifiedUser._id) {
            let updatedData = {
                title: req.body.title,
                description: req.body.description,
                category: req.body.category,
                tags: req.body.tags.split(",")
            };

            // If a new thumbnail is uploaded
            if (req.files && req.files.thumbnail) {
                // Delete the old thumbnail from Cloudinary
                await cloudinary.uploader.destroy(video.thumbnailId);

                // Upload the new thumbnail to Cloudinary
                const updatedThumbnail = await cloudinary.uploader.upload(req.files.thumbnail.tempFilePath);

                // Update the thumbnail details
                updatedData.thumbnailURL = updatedThumbnail.secure_url;
                updatedData.thumbnailId = updatedThumbnail.public_id;
            } else {
                // Retain the existing thumbnail details
                updatedData.thumbnailURL = video.thumbnailURL;
                updatedData.thumbnailId = video.thumbnailId;
            }

            // Update the video details in the database
            const updatedVideoDetail = await Video.findByIdAndUpdate(req.params.videoId, updatedData, { new: true });

            res.status(200).json({
                updatedVideo: updatedVideoDetail
            });
        } else {
            return res.status(500).json({
                error: 'You are not authorized to update this video'
            });
        }
    } catch (err) {
        console.log(err);
        res.status(500).json({
            error: err
        });
    }
});

//delete video
Router.delete('/:videoId', checkAuth, async(req,res)=>{
    try
    {
        const verifiedUser = await jwt.verify(req.headers.authorization.split(" ")[1], 'Yoravers Project');
        console.log(verifiedUser);
        const video = await Video.findById(req.params.videoId);
        if(video.user_id == verifiedUser._id)
        {
            await cloudinary.uploader.destroy(video.videoId,{resource_type: 'video'})
            await cloudinary.uploader.destroy(video.thumbnailId)
            const deletedResponse = await Video.findByIdAndDelete(req.params.videoId)
            res.status(200).json({
                deletedResponse:deletedResponse
            })
        }
        else
        {
            return res.status(500).json({
                error:'No can do my friend'
            })
        }
    }
    catch(err)
    {
        console.log(err);
        res.status(500).json({
            error:err
        })
    }

});

//like video
Router.put('/like/:videoId',checkAuth,async(req,res)=>{
    try
    {
        const verifiedUser = await jwt.verify(req.headers.authorization.split(" ")[1], 'Yoravers Project');
        console.log(verifiedUser);
        const video = await Video.findById(req.params.videoId);
        console.log(video);
        if(video.likedBy.includes(verifiedUser._id))
        {
            return res.status(500).json({
                error:'You have already liked this video'
            })
        }
        
        if(video.dislikedBy.includes(verifiedUser._id))
        {
            video.dislike -= 1;
            video.dislikedBy = video.dislikedBy.filter(userId=>userId.toString() != verifiedUser._id);
        }

        video.likes += 1;
        video.likedBy.push(verifiedUser._id);
        await video.save();
        
        res.status(200).json({
            msg:'Video liked',
            video
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

//dislike video
Router.put('/dislike/:videoId',checkAuth,async(req,res)=>{
    try
    {
        const verifiedUser = await jwt.verify(req.headers.authorization.split(" ")[1], 'Yoravers Project');
        console.log(verifiedUser);
        const video = await Video.findById(req.params.videoId);
        console.log(video);
        if(video.dislikedBy.includes(verifiedUser._id))
        {
            return res.status(500).json({
                error:'You have already disliked this video'
            })
        }

        if(video.likedBy.includes(verifiedUser._id))
            {
                video.likes -= 1;
                video.likedBy = video.likedBy.filter(userId=>userId.toString() != verifiedUser._id);
            }

        video.dislike += 1;
        video.dislikedBy.push(verifiedUser._id);
        await video.save();
        
        res.status(200).json({
            msg:'Video disliked',
            video
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

// views
Router.put('/views/:videoId',async(req,res)=>{
    try
    {
        const video = await Video.findById(req.params.videoId);
        console.log(video);
        video.views += 1;
        await video.save();
        res.status(200).json({
            msg:'ok'
        })
    }
    catch(err)
    {
        console.log(err)
        res.status(500).json({
            error:err
        })
    }
})

module.exports = Router;