var express = require('express')
var router = express.Router()
var mongoose = require('mongoose')
const requireLogin = require('../middlewares/requireLogin')
const jwt = require("jsonwebtoken");
const { jwt_secret } = require('../keys');
const { post, param } = require('.');
const posts = mongoose.model('post')
const comments = mongoose.model('comment')

router.post('/createpost',requireLogin,function(req,res,next){
    console.log("body",req.body)
    const {body,picture} = req.body

    if(!body||!picture){
    return  res.status(422).json({ error: "pls add all the fields" })
    }
   // req.user

    console.log("ok") 

//    const post = new posts({
//     body,
//     picture,  
//     postedby:req.user
//    })
 
   posts.insertMany({body:body,picture:picture,postedby:req.user}).then((post)=>{
    // console.log("post hooo gyiiiii",post)
    return  res.status(200).json({status:true,message:'submit successfully'})
   })
   .catch(err => { console.log(err) })

})

router.post('/fetchpost',requireLogin,async function(req,res,next){
    // console.log("jjjjjjjjjjjjjjjjjjjjjjjjjjjj")
try{

    const {user} = req.body
    // console.log("user : ",user)
    if(!user){
     return  res.status(422).json({ error: "please login" })
    }

        let savedData = await posts.find({})
                                .populate('postedby')
        if(savedData){
            // console.log(savedData)
            res.status(200).json({data:savedData,status:true,message:"Fetch succussfully"})
        }else{
            res.status(200).json({data:[],status:false,message:"Fetch Unsuccussfully"})
        }
}
catch(e){
    console.log(e)
    res.status(200).json({data:[],status:false,message:"server error"})
}
})

router.post('/fetchPostsByUserid',requireLogin,function(req,res,next){
    try{
        let userId = req.body.userid
        posts.find({postedby:req.body.userid})
        .populate('postedby')
        .then((savedData)=>{
            if(savedData){
                // console.log("xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",savedData)
                res.status(200).json({data:savedData,status:true,message:"Fetch succussfully"})
            }else{
                res.status(200).json({data:[],status:false,message:"Fetch Unsuccussfully"})
            }
        })
    }catch(e){
        console.log(e)
        res.status(200).json({data:[],status:false,message:"server error"})
    }
})

router.post('/addlikes',requireLogin,function(req,res,next){
    try{
    posts.updateOne({_id:{$eq:req.body.id}},{$addToSet:{likes:req.user._id}}).then((savedData)=>{
        if(savedData){
            console.log(savedData)
            res.status(200).json({data:savedData,status:true,message:"update like succussfully"})
        }else{
            res.status(200).json({data:[],status:false,message:"update like Unsuccussfully"})
        }
    })
    }catch(e){
        console.log(e)
        res.status(200).json({data:[],status:false,message:"server error"})
    }
})

router.post('/removelikes',requireLogin,function(req,res,next){
    try{
        posts.updateOne({_id:{$eq:req.body.id}},{$pull:{likes:req.user._id}}).then((savedData)=>{
            if(savedData){
                console.log(savedData)
                res.status(200).json({data:savedData,status:true,message:"update like succussfully"})
            }else{
                res.status(200).json({data:[],status:false,message:"update like Unsuccussfully"})
            }
        })
        }catch(e){
            console.log(e)
            res.status(200).json({data:[],status:false,message:"server error"})
        }
})

router.post('/addcomments',requireLogin,async function(req,res,next){
    try{
        // posts.updateOne({_id:req.body.id},{$push:{comments:{postedby:req.user,comment:req.body.comment,username:req.body.username}}}).then((savedData)=>{
        //     if(savedData){
        //         console.log(savedData)
        //         res.status(200).json({data:savedData,status:true,message:"update comment succussfully"})
        //     }else{
        //         res.status(200).json({data:[],status:false,message:"update comment Unsuccussfully"})
        //     }
        // })
        let result = await comments.create({...req.body,postedby:req.user._id})
        if(result){
            return res.status(200).json({data:[],status:true,message:"Add Comment succussfully"})
        }else{
            return res.status(200).json({data:[],status:false,message:"Failed to Add Comment"})
        }
    }catch(e){
        console.log(e)
        res.status(200).json({data:[],status:false,message:"server error"})
    }
})

router.post('/fetch-comment-by-post',requireLogin,async function(req,res,next){
    try{
        const { postId } = req.body;
        const {pageNumber} = req.query;

        let result = await comments.find({postId:postId})
                            .sort({createdAt:-1})
                            .skip((pageNumber - 1) * 15)
                            .limit(15)
                            .populate('postedby');

        if(result){
            return res.status(200).json({data:result,status:true,message:"Fetch Comment succussfully"})
        }else{
            return res.status(200).json({data:[],status:false,message:"Failed to Fetch Comment"})
        }

    }catch(e){
        console.log(e)
        res.status(200).json({data:[],status:false,message:"server error"})
    }
})

router.get('/fetchAllPosts',requireLogin,async function(req,res,next){
    try{
        let result = await posts.find({})
        .sort({createdAt:-1})
        .populate('postedby')

        return res.status(200).json({data:result,status:true,message:"Fetch succussfully"})
    }catch(e){
        console.log(e)
        res.status(200).json({data:[],status:false,message:"server error"})
    }
})

router.delete('/deletePost/:postId',requireLogin,async function(req,res,next){
    try{
        const postId = req.params.postId

        let findPost = await posts.find({_id:postId})

        if(!findPost){
            return res.status(200).json({data:[],status:false,message:"Post Doesn't Exist"})
        }

        if(!(findPost[0]?.postedby?.toString() == req.user._id?.toString())){
            return res.status(200).json({data:[],status:false,message:"User Not Autherized"})
        }

        let result = await posts.deleteOne({_id:postId})
        // console.log(result)
        if(result){
            return res.status(200).json({data:[],status:true,message:"Delete Post succussfully"})
        }else{
            return res.status(200).json({data:[],status:false,message:"Failed To Delete Post"})
        }

    }catch(e){
        console.log(e)
        res.status(200).json({data:[],status:false,message:"server error"})
    }
})

router.post('/like-comment',requireLogin,async function(req,res,next){
    try{
        const {commentId} = req.body

        let findComment = await comments.find({_id:commentId})
 
        if(!findComment){
             return res.status(200).json({data:[],status:false,message:"comment Doesn't Exist"})
        }

        let result = await comments.updateOne({_id:commentId},{$addToSet:{likes:req.user._id}})
      
        if(result){
            return res.status(200).json({data:[],status:true,message:"like comment succussfully"})
        }else{
            return res.status(200).json({data:[],status:false,message:"Failed To Like Comment"})
        }

    }catch(e){
        console.log(e)
        res.status(200).json({data:[],status:false,message:"server error"})
    }
})

router.post('/unlike-comment',requireLogin,async function(req,res,next){
    try{
        const {commentId} = req.body

        let findComment = await comments.findOne({_id:commentId})

        if(!findComment){
             return res.status(200).json({data:[],status:false,message:"comment Doesn't Exist"})
        }

        let result = await comments.updateOne({_id:commentId},{$pull:{likes:req.user._id}})

        if(result){
            return res.status(200).json({data:[],status:true,message:"Unlike comment succussfully"})
        }else{
            return res.status(200).json({data:[],status:false,message:"Failed To UnLike Comment"})
        }

    }catch(e){
        console.log(e)
        res.status(200).json({data:[],status:false,message:"server error"})
    }
})

router.post('add-reply-on-comment',requireLogin,async function(){
    try{
       const {commentId} = req.body

       
    } catch(e){
        console.log(e)
        res.status(200).json({data:[],status:false,message:"server error"})
    }
})


module.exports = router