const passport = require('passport');
const GoogleStrategy=require('passport-google-oauth20').Strategy;
const User = require('../models/userDb'); 
const env=require('dotenv').config();



passport.use(new GoogleStrategy({
    clientID:process.env.GOOGLE_CLIENT_ID,
    clientSecret:process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:5252/auth/google/callback"
},

async (accessToken, refreshToken, profile, done) => {
    try {
        let user = await User.findOne({ googleId: profile.id });
        if (user) {
            return done(null, user); // Return immediately if user exists
        } else {
            user = new User({
                name: profile.displayName,
                email: profile.emails[0].value,
                googleId: profile.id
            });
            await user.save();
            return done(null, user); // Return immediately after saving a new user
        }
    } catch (error) {
        return done(error, null); // Use the correct variable name `error` instead of `err`
    }
}


));


passport.serializeUser((user,done)=>{
    done(null,user.id)
});

passport.deserializeUser((id,done)=>{
    User.findById(id)
    .then(user=>{
        done(null,user)
    })
    .catch(err=>{
        done(err,null)
    })
})


module.exports=passport;