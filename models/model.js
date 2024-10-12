const mongoose=require("mongoose");
const {ObjectId} = mongoose.Schema.Types

const replySchema = new mongoose.Schema({
    commentId:{
        type:ObjectId,
        ref:'comment'
    },
   replyData:[{
    replyTo:{
        type:ObjectId,
        ref:'user'
    },
    replyBy:{
        type:ObjectId,
        ref:'user'
    },
    reply:{
        type:String,
        require:false,
        default:''
    }
   }]
})

const commentSchema = new mongoose.Schema({
    postedby:{
     type:ObjectId,
     ref:'user'
    },
    postId:{
     type:ObjectId,
     ref:'posts'
    },
    comment:{
     type:String
    },
    createdAt: {
     type: Date,
     default: Date.now
    },
    likes:[{
        type:ObjectId,
        ref:'user'
    }],
    unlikes:[{
         type:ObjectId,
        ref:'user'
    }]
 })

const userSchema=new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    username:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    followers:[{
        type:ObjectId,
        ref:"user"
    }],
    following:[{
        type:ObjectId,
        ref:'user'
    }],
    links:[{
        name:{type:String},
        link:{type:String}
    }],
    gender:{
        type:String
    },
    dob:{
        type:String
    },
    bio:{
        type:String
    },
    profilepic:{
        type:String
    },
    coverpic:{
        type:String
    }
})

const postSchema=new mongoose.Schema({
    body:{
        type:String,
        required:true
    },
    picture:{
        type:String,
        default:""
    },
    postedby:{
        type:ObjectId,
        ref:"user"
    },
    likes:[{
        type:ObjectId,
        ref:'user'
    }],
    unlikes:[{
         type:ObjectId,
        ref:'user'
    }],
    createdAt: {
        type: Date,
        default: Date.now
    },
})




mongoose.model("user",userSchema) 
mongoose.model("post",postSchema)
mongoose.model('comment',commentSchema)
mongoose.model('reply',replySchema)