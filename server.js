const path = require('path');
const express = require('express');
const env = require('dotenv').config();
const connectDB = require('./config/connectDb')
const userRoute=require('./routes/userRoute')
const adminRoute=require('./routes/adminRoute')
const app = express();
const session = require('express-session')
const PORT = process.env.PORT;
connectDB() 
const passport=require('./config/passport')




app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,  
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      maxAge: 72 * 60 * 60 * 1000
    }
  }));



app.use(passport.initialize())
app.use(passport.session())



// Set EJS as the view engine
app.set('view engine', 'ejs');

// Set correct views directory
app.set('views', [path.join(__dirname, 'views/user'),path.join(__dirname, 'views/admin')]);
// Serve static files
app.use(express.static('public'));3


app.use('/',userRoute);
app.use('/admin',adminRoute);

app.listen(PORT,'0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
});





