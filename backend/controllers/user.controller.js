import { User } from "../models/user.model.js";
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
export const register = async (req,res)=>{
    try {
        const {fullname, email, phoneNumber, password, role}= req.body;
        if(!fullname||! email ||!phoneNumber || !password || !role ){
            return res.status(400).json({
                message:'Something is missing',
                success:false
            })

        }
        const user= await User.findOne({email});
        if(user){
            return res.status(400).json({
                message:'User already exist with email',
                success:false
            })
        }
        const hashedPassword=await  bcrypt.hash(password, 10);

        await User.create({
            fullname,
            email,
            phoneNumber,
            password:hashedPassword,
            role,
        })
        return res.status(201).json({
            message:'Account created successfully',
            success:true
        })
    } catch (error) {
        console.log(error);
        
    }

}

export const login= async(req,res)=>{
    try {
        const {email , password, role}= req.body;

        if(!email || !password || !role){
            return res.status(400).json({
                message:'Something is missing',
                success:false
            })
        }

        let user= await User.findOne({email});
        if(!user){
            return res.status(501).json({
                message:'Incorrect email or password',
                success:false
            })
        }

        const isPasswordMatch= await bcrypt.compare(password, user.password)

        if(!isPasswordMatch){
            return res.status(501).json({
                message:'Incorrect email or password',
                success:false
            })
        }
        //check if role is correct or not
        if(role !== user.role){
            return res.status(400).json({
                message:"Account dosen't exist with current role",
                success:false
            })
        }

        const tokenData={
            userId:user._id
        }
        const token= await jwt.sign(tokenData,process.env.SECRET_KEY, {expiresIn:'1d'})
        
        user={
            _id:user._id,
            fullname:user.fullname,
            email:user.email,
            phoneNumber:user.phoneNumber,
            role:user.role,
            profile:user.profile
        }
        //will store token in cookies
        return res.status(200).cookie('token', token, {maxAge:1*24*60*60*1000 , httpsOnly:true, sameSite:'strict'}).json({
            messsage:`welcome back ${user.fullname}`,
            user,
            success:true
        })
    } catch (error) {
        console.log(error);
        
    }
}

export const logout = async (req,res)=>{
    try {
        return res.status(200).cookie('token','',{maxAge:0}).json({
            message:'Logout successfully',
            success:true
        })
    } catch (error) {
        
    }
}

export const updateProfile= async (req,res)=>{

    //work needed 
    try {
        const {fullname, email, phoneNumber, bio, skills}= req.body;

        const file=req.file;
        // if(!fullname || !email || !phoneNumber ||!bio || !skills){
        //     return res.status(400).json({
        //         message:'Something is missing',
        //         success:false
        //     })
        // }
        let skillsArray;
        if(skills){

             skillsArray= skills?.split(",");
        }
        const userId= req.id //middleware auth
        let User= await User.findById(userId);
        if(!User){
            return res.status(400).json({
                message:'user not found',
                success:false
            })
        }
        if(fullname) User.fullname= fullname
        if(email) User.email= email
        if(bio) User.profile.bio=bio
        if(phoneNumber) User.phoneNumber= phoneNumber
        if(skills)User.profile.skills=skillsArray
        
        // User.phoneNumber=phoneNumber,
        // User.profile.bio=bio,
        // User.profile.skills=skillsArray

        await User.save();

        User={
            _id:User._id,
            fullname:User.fullname,
            email:User.email,
            phoneNumber:User.phoneNumber,
            role:User.role,
            profile:User.profile
        }
        return res.status(201).json({
            message:'User Updated Successfully',
            User,
            success:true
        })
    } catch (error) {
        console.log(error);
        
        
    }
}