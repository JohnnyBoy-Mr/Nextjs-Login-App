import {connect} from "@/dbConfig/dbConfig";
import User from "@/models/userModel";
import { NextRequest, NextResponse } from "next/server";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";

export async function POST(request: NextRequest){
    try {
        await connect();
        console.log("DB connected");
        const reqBody = await request.json();
        const {email, password} = reqBody
        console.log(reqBody);

         //check if user already exists
        const user = await User.findOne({email})
        if(!user){
            return NextResponse.json({error: "User does not exists"}, {status: 400})
        }
        

        //check if password is correct
        const vaildPassword = await bcryptjs.compare(password, user.password)
        if(!vaildPassword){
            return NextResponse.json({error: "Invaild Password"}, {status: 400})
        }


        //create Token Data
        const tokenData ={
            id: user._id,
            username: user.username,
            email: user.email
        }

        //create Token
        const token = await jwt.sign(tokenData, process.env.TOKEN_SECRET!, {expiresIn: "1d"})
        

        const response = NextResponse.json({
            message: "Login Successfull",
            success: true
        })

        response.cookies.set("token", token, {
            httpOnly: true
        })

        return response;

    } catch (error: any) {
        return NextResponse.json({error: error.message}, {status: 500})
    }
}