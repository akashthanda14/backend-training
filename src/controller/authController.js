import authService from "../service/authService.js";

export async function signup(req,res){
    try{
        const {username , email , password} = req.body;

        if(!username || !email || !password){
            return res.status(400).json({
                success : false,
                error:"Username , email , and  password are required"
            });
        }

        const result = await authService.registerUser({
            username,
            email,
            password
        });

        res.status(201).json({
            success:true,
            message:"User registered Successfully",
            data:{
                user:result.user,
                token:result.token
            }
        });
    }catch(error){
        console.log("Error in sign up ",error);

        if(error.message.includes('already exists')|| error.message.includes("Duplicate entry")){
            return res.status(409).json({
                success:false,
                error:"User with this email or username already exists"
            });
        }

        if(error.message.includes('Invalid email') || error.message.includes('username can only contain') || error.message.includes('Password must be ')){
            return res.status(400).json({
                success:false,
                error: error.message
            });
        }
        
        res.status(500).json({
            success:false,
            error:"Failed to Register the user",
            message: error.message
        });
    }
}


export async function signin(req,res){
    try{
        const {login , password} = req.body;

        if(!login || !password){
            return res.status(400).json({
                success:false,
                error:"Email and Password is Required"
            });
        }

        const result = await authService.loginUser({
            login,
            password
        })

        res.json({
            success:true,
            message:"Login Successful",
            data:{
                user:result.user,
                token: result.token
            }
        });

    }catch(error){
        console.error("Error in signin", error);

        if(error.message === "Invalid credentials"){
            return res.status(401).json({
                success:false,
                error: "Invalid email or password"
            });
        }

        res.status(500).json({
            success:false,
            error:"Failed to login",
            message:error.message
        })
    }
}

export async function getProfile(req,res){
    try{
        res.json({
            success:true,
            data:{
                user:req.user
            }
        });
    }catch(error){
        console.error('Error in getProfile',error);
        res.status(500).json({
            success:false,
            error:'Failed to get the Profile',
            message:error.message
        });
    }
}

export async function refreshToken(req,res) {
    try{
        const{token} = req.body;
    if(!token){
        return res.status(400).json({
            success:false,
            error:"Token is Required"
            
        });
    }

    const result = await authService.refreshToken(token);

    res.json({
        success:true,
        message:"Token refreshed Successfully",
        data:{
            user:result.user,
            token:result.token
        }

    });
}catch(error){
    console.error("error in refreshToken",error);

    if(error.message.includes('Invalid Token') || error.message.includes('Token expired')){
        return res.status(401).json({
            success:false,
            error:error.message
        });
    }

    res.status(500).json({
        success:false,
        error:"Failed to refresh Token",
        message:error.message
    });
}
}


export async function logout(req,res) {
    // For JWT, logout is typically handled on client-side by removing the token
    // Here we just send a success response
    try{
        res.json({
            success:true,
            message:"Logout Succesful"
        });
    }catch(error){
        console.error("error in logout",error);
        res.status(500).json({
            success:false,
            error:"Failed to logout",
            message:error.message
        });
    }
}