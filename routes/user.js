const express = require('express');
const Router = express.Router();
const bcrypt = require('bcrypt');
const cloudinary = require('cloudinary').v2;
require('dotenv').config();
const User = require('../models/User');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const checkAuth = require('../middleware/checkAuth');


// Configuration for logo storage
cloudinary.config({ 
    cloud_name: process.env.CLOUD_NAME, 
    api_key: process.env.API_KEY, 
    api_secret: process.env.API_SECRET
});

//signup
Router.post('/signup', async(req, res) => {
    try {
        const users = await User.find({email: req.body.email});
        if(users.length > 0) {
            return res.status(500).json({
                message: 'Email already in use'
            });
        }    

        const hashCode = await bcrypt.hash(req.body.password, 10);
        const uploadedImage = await cloudinary.uploader.upload(req.files.logo.tempFilePath);
        const newUser = new User({
            _id: new mongoose.Types.ObjectId(),
            channelName: req.body.channelName,
            email: req.body.email,
            phone: req.body.phone,
            password: hashCode,
            logoURL: uploadedImage.secure_url,
            logoId: uploadedImage.public_id
        });

        const user = await newUser.save();
        res.status(200).json({
            newUser: user
        });

    } catch(err) {
        console.log(err);
        res.status(500).json({
            error: err
        });
    }
});

//login
Router.post('/login', async(req, res) => {
    try {
        const users = await User.find({email: req.body.email});
        if(users.length == 0) {
            return res.status(500).json({
                message: 'Email not found'
            });
        }

        const isValid = await bcrypt.compare(req.body.password, users[0].password);
        if(!isValid) {
            return res.status(500).json({
                message: 'Invalid password'
            });
        }

        const token = jwt.sign({
            _id: users[0]._id,
            channelName: users[0].channelName,
            email: users[0].email,
            phone: users[0].phone,
            logoId: users[0].logoId
        },'Yoravers Project', {expiresIn: '365d'});

        res.status(200).json({
            _id: users[0]._id,
            channelName: users[0].channelName,
            email: users[0].email,
            phone: users[0].phone,
            logoId: users[0].logoId,
            logoURL: users[0].logoURL,
            token: token,
            subscribers: users[0].subscribers,
            subscribedChannels: users[0].subscribedChannels
        });

    } catch(err) {
        console.log(err);
        res.status(500).json({
            error: 'something is wrong'
        });
    }
});

// subscribe
Router.put('/subscribe/:userBid',checkAuth, async(req,res)=>{
    try{
        const userA = await jwt.verify(req.headers.authorization.split(" ")[1], 'Yoravers Project');
    console.log(userA);
    const userB = await User.findById(req.params.userBid);
    console.log(userB);
    if(userB.subscribedBy.includes(userA._id))
    {
        return res.status(500).json({
            error:'You have already subscribed this channel'
        })
    }    

    //console.log('Not subscribed yet');

    userB.subscribers += 1;
    userB.subscribedBy.push(userA._id);
    await userB.save();
    const userAFullInformation = await User.findById(userA._id);
    userAFullInformation.subscribedChannels.push(userB._id);
    await userAFullInformation.save();
    res.status(200).json({
        msg:'Subscribed..'
        
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

// unsubscribe
Router.put('/unsubscribe/:userBid',checkAuth, async(req,res)=>{
    try{
        const userA = await jwt.verify(req.headers.authorization.split(" ")[1], 'Yoravers Project');
        const userB = await User.findById(req.params.userBid);
        console.log(userA);
        console.log(userB);
        
        if(userB.subscribedBy.includes(userA._id))
        {
            userB.subscribers -= 1;
            userB.subscribedBy = userB.subscribedBy.filter(userId=>userId.toString() != userA._id);
            await userB.save();
            const userAFullInformation = await User.findById(userA._id);
            userAFullInformation.subscribedChannels = userAFullInformation.subscribedChannels.filter(userId=>userId.toString() != userB._id);
            await userAFullInformation.save();

            res.status(200).json({
                msg:'Unsubscribed..'
            })
        }
        else
            {
            return res.status(500).json({
                error:'You have not subscribed this channel yet'
            })
        }
    }
    catch(err)
    {

    }
})

module.exports = Router;