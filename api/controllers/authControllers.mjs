import User from "../models/User.mjs"
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import sendCustomEmail from "../utils/sendEmail.mjs"
import sendCustomPasswordResetEmail from '../utils/sendPasswordResetEmail.mjs'


// REGISTER
export const registerUser = async (req, res) => {
    const {username, email, password} = req.body
    
    if (!username || !email || !password) {
        return res.json({'msg': 'Username, Email and Password required!'})
    }
    // Check if duplicated username
    const usernameDuplicate =  await User.findOne({username: username}).exec()
    if (usernameDuplicate){
        return res.status(409).json({'msg': `User with username ${username} already exist!`})
    }
    // Check if duplicate email
    const emailDuplicate =  await User.findOne({email: email}).exec()
    if (emailDuplicate){
        return res.status(409).json({'msg': `User with email ${email} already exist!`})
    }

    try {
        const hashedPSWD = await bcrypt.hash(password, 10)
        const token = jwt.sign({username, email}, process.env.EMAIL_CONFIRM_SECRET, {expiresIn: '600s'})
        const newUser = await User.create({
            username: username,
            email: email,
            token: token,
            password: hashedPSWD
    })
    // Send email verification email
    const from = 'listoweladolwin@gmail.com'
    const to = email
    const subject = 'Email Verification'
    
    sendCustomEmail(from, to, subject, token)
    
    console.log(newUser.token)
    res.json({
        user: {
            username,
            email,
            id: newUser._id
        }, 
        msg: `Email verification link sent to ${newUser.email}`,
        ok: true
    })
    } catch (error) {
        console.log(error)
        res.json({'msg': 'Error saving user'})
    }

}


// RESEND EMAIL (AFTER FIRST ONE PROBABLY EXPIRES BEFORE USER VERIFIES)
export const resendEmail = async (req, res) => {
    const token = req.params.token
    const user = await User.findOne({token})

    if (!user){
        return res.json({msg: "Token not valid"})
    }
    const payload = {username: user.username, email: user.email}

    const newToken = jwt.sign(payload, process.env.EMAIL_CONFIRM_SECRET, {expiresIn: '600s'})
    console.log(newToken)
    user.token = newToken
    await user.save()

    // Resend email
    const from = 'listoweladolwin@gmail.com'
    const to = user.email
    const subject = 'Email Verification'

    sendCustomEmail(from, to, subject, newToken)

    res.json({msg: "Email resent"})
}


// VERY EMAIL
export const verifyEmail = async (req, res) => {
    const token = req.params.token
    const user = await User.findOne({token})

    if (!user){
        return res.json({msg: "Invalid verification token entered"})
    }

    jwt.verify(token, process.env.EMAIL_CONFIRM_SECRET, async (err, decoded) => {
        if (err) {
            console.log(err)
            return res.json({msg: "Token expired"})
        }

        user.isEmailVerified = true
        await user.save()

        res.json({msg: "Email successfully verified"})
        })
}


// LOGIN
export const loginUser = async (req, res) => {
    const {email, password} = req.body
    if (!email || !password) {
        return res.json({msg: 'Email and password required!'})
    }
    const foundUser = await User.findOne({email: email}).exec()
    if (!foundUser) {
        return res.json({'msg': 'Wrong credentials entered'})
    }
    if (!foundUser.isEmailVerified) {
        return res.json({msg: "Email verification required"})
    }

    try{
    const isValidated = bcrypt.compareSync(password, foundUser.password)
    if (!isValidated){
        return res.json({'msg': 'Wrong credentials entered!'})
    }

    const accessToken = jwt.sign({
            email: email,
            userId: foundUser._id
        },
        process.env.ACCESS_TOKEN_SECRET,
        {expiresIn: '900s'})

    const refreshToken = jwt.sign({
            email: email,
            userId: foundUser._id
        },
        process.env.REFRESH_TOKEN_SECRET,
        {expiresIn: '10d'})

    foundUser.set({ refreshToken: refreshToken })
    await foundUser.save()
    
    const expirationTime = new Date(Date.now() + 900 * 1000);
    res.cookie('refreshToken', refreshToken, { httpOnly: true, expires: expirationTime }).json({
        accessToken: accessToken,
        refreshToken: refreshToken,
        msg: `User ${email} successfully logged in!`,
        ok: true
    })
    }catch(error){
        console.log(error)
        return res.json({'msg': 'Error while logging in'})
    }
}


export const sendPasswordResetEmail = async (req, res) => {
    const email = req.body.email
    const user = await User.findOne({email})

    if (!user) {
        return res.json({msg: "Email not registered!"})
    }

    const resetToken = jwt.sign(
        {email},
        process.env.PASSWORD_RESET_SECRET,
        {expiresIn: '300s'}
    )
    user.token = resetToken
    await user.save()

    // send the reset password email
    const from = 'listoweladolwin@gmail.com'
    const to = user.email
    const subject = 'Password Reset'

    sendCustomPasswordResetEmail(from, to, subject, resetToken)

    res.json({msg: "Reset email sent", ok: true})
}


export const resetPassword = async (req, res) => {
    const token = req.params.token

    jwt.verify(token, process.env.PASSWORD_RESET_SECRET, async (err, decoded) => {
        if (err){
            return res.json({ok: false, msg: "Reset password token expired"})
        }

        const {email, password} = req.body

        const foundUser = await User.findOne({email})
        if (!foundUser) {
            return res.json({msg: 'No user found for this email'})
        }

        try {
            const hashedPWD = await bcrypt.hash(password, 10)
            console.log("Old user password: ", foundUser)
            foundUser.password = hashedPWD
            const result = await foundUser.save()
            console.log('New user password: ', result)

            res.status(200).json({ok: true, msg: "Password reset successful"})
        } catch (error) {
            res.json({msg: "An error occured while resetting password, please try again"})
            console.log("Password reset error: ", error)
        }
        
    })
    
}



export const verifyToken = async (req, res, next) => {
    const header = req.headers.Authorization || req.headers.authorization
    console.log(req.headers)
    if (!header?.startsWith('Bearer ')){
        return res.status(401).json({msg: 'Invalid token format'})
    }
    const token = header.split(" ")[1]
    jwt.verify(
        token,
        process.env.ACCESS_TOKEN_SECRET,
        (err, decoded) => {
            if (err){
                console.log(err)
                return res.status(401).json({expired: true, msg: 'Token expired'})
            }
            req.user = decoded.username
            next()
        }
    )
}



export const refreshToken = async (req, res) => {
    // retrieve refresh token
    const token = req.body.refreshToken
    
    //console.log(req.cookies)
    if (!token) {
        return res.json({msg: 'invalid token'})
    }
    
    const user = await User.findOne({refreshToken:token}).exec()
    if (!user) {
        return res.json({msg: 'invalid user'})
    }

    // verify refresh token
    jwt.verify(
        token,
    process.env.REFRESH_TOKEN_SECRET,
    {expiresIn: '10d'}, (err, decoded) => {
        if (err){
            return res.json({msg: 'invalid token', expired: true})
        }
        const newAccessToken = jwt.sign({
        username: decoded.username,
        userId: decoded.userId
    },
    process.env.ACCESS_TOKEN_SECRET,
    {expiresIn: '900s'}
    )
    res.json({accessToken: newAccessToken,
        msg: 'token refreshed',
    })
    })
    
}



export const logoutUser = async (req, res) => {
    const _id = req.params._id

    const user = await User.findOne({_id})

    if(!user) {
        res.json({msg: "No user logged in"})
    }

    user.refreshToken = ""
    await user.save()

    res.json({msg: `User ${user.email} successfully logged out`})
}