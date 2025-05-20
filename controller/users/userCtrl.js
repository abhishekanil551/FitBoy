const nodeMailer=require('nodemailer')
const bcrypt = require('bcrypt')
const user = require('../../models/userDb')
const Category=require('../../models/categoryDb')
const Product=require('../../models/productDb')
const category = require('../../models/categoryDb')
const { json } = require('body-parser')
const Company=require('../../models/companyDb')
const wishlist=require('../../models/wishlistDb')




const loadHome = async (req,res)=>{
    try{
        return res.render('welcomeHome')
    }catch(error){
        console.log('home page not fount')
        res.status(500).send('server error',error)
    }
}



const loadHomepage = async (req, res) => {
  try {
    // Fetch categories (for header or /games)
    const categories = await Category.find({ isListed: true }).lean();

    // Fetch recommended games
    const recommendedGames = await Product.find({ isRecommended: true, isListed: true })
      .select('_id name poster salesPrice isFree availability banners')
      .limit(4)
      .lean();

    // Fetch free games
    const freeGames = await Product.find({ isBlocked: false, isFree: true, isListed: true })
      .select('_id name poster')
      .limit(4)
      .lean();

    // Fetch popular games (example: based on sales or views)
    const popularGames = await Product.find({ isListed: true })
      .sort({ salesCount: -1 }) // Assuming a salesCount field; adjust as needed
      .select('_id name poster')
      .limit(4)
      .lean();

    // Empty array for upcoming games
    const upcomingGames = [];

    const userId = req.session.userId;
    const renderData = {
      recommendedGames,
      freeGames,
      upcomingGames,
      popularGames,
      categories,
      userData: null,
      userWishlist: [], 
      error: null,
    };

    if (userId) {
      const userData = await User.findById(userId).lean();
      renderData.userData = userData || null;
      renderData.userWishlist = userData?.wishlist?.map(id => id.toString()) || [];
      res.render('home', renderData);
    } else {
      res.render('welcomeHome', renderData);
    }
  } catch (error) {
    console.error('Homepage error:', error);
    res.render('welcomeHome', {
      recommendedGames: [],
      freeGames: [],
      upcomingGames: [],
      popularGames: [],
      categories: [],
      userData: null,
      userWishlist: [],
      error: 'Failed to load homepage. Please try again later.',
    });
  }
};





const pageNotFount= async(req,res)=>{
    try{
        res.render('pageNotFount')
    }catch(error){
        res.redirect('/pageNotFount')
    }    // clear OTP from session
    req.session.userOtp = null;
    req.session.userData = null;
    
}




const supportPage=async(reqq,res)=>{
  try {
    res.render('Support')
  } catch (error) {
   res.redirect('/pageNotFount') 
  }
}



const signUp=async (req,res)=>{
    try{
        const{name,email,password,cPassword,googleId}=req.body;
        if(password != cPassword){
            return res.status(400).json({ success: false, message: 'Passwords do not match' }); 
        }

        const findUser=await User.findOne({email})
        if(findUser){
            return res.status(400).json({ success: false, message: 'user already exists' }); 
        }
        

        const otp = generateOtp();
        console.log('otp :',otp)
        const sendOtp=await sendVerificationEmail(email,otp);
        console.log('Email sented');

        if(!sendOtp){
            return res.status(403).json('email-error')
        }

        req.session.userOtp=otp;
        req.session.userData={name,email,password,googleId: googleId || null};
        return res.status(200).json({ success: true, redirectUrl: '/verify-Otp' });
        }catch(error){
        console.error('signup error',error)
        res.redirect('/pageNotFount')
    }
}
  

const securePassword=async (password)=>{
    try {
        const passwordHash=await bcrypt.hash(password,10)

        return passwordHash
    } catch (error) {
        
    }
}




function generateOtp(){
    return Math.floor(100000+Math.random()*900000).toString();
}

async function sendVerificationEmail(email,otp) {
    try {
        const transporter=nodeMailer.createTransport({
        service:'gmail',
        port:587,
        secure:false,
        requireTLS:true,
        auth:{
            user:process.env.NODEMAILER_EMAIL,
            pass:process.env.NODEMAILER_PASSWORD
        }
        })


        const info=await transporter.sendMail({
            from:process.env.NODEMAILER_EMAIL,
            to:email,
            subject:'verify your account',
            text:`your otp is ${otp}`,
            html: `<h>Your OTP: ${otp}</h>`,
        })

        return info.accepted.length>0
    } catch (error) {
        console.error('error sending email',error)
        return false
    }
}





const verifyOtp = async (req, res) => {
  try {
    const { otp } = req.body;
    console.log(otp);
    if (otp == req.session.userOtp) {
      const user = req.session.userData;
      const passwordHash = await securePassword(user.password);
      const saveUserData = new User({
        name: user.name,
        email: user.email,
        password: passwordHash,
        googleId: req.session.userData.googleId || null,
      });
      await saveUserData.save();
      req.session.user = saveUserData._id;

      res.json({ success: true, redirectUrl: '/home' });
    } else {
      res.status(400).json({ success: false, message: 'Invalid OTP' });
    }
  } catch (error) {
    console.error('Error verifying OTP:', error);
    res.status(500).json({ success: false, message: 'An error occurred' });
  }
};




const loadOtpPage=(req,res)=>{
    if(!req.session.userData)return res.redirect('/home');
    res.render('verify-Otp')
}


const resendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }

    const otp = generateOtp();
    req.session.userOtp = otp;

    const emailSend = await sendVerificationEmail(email, otp);
    if (emailSend) {
      console.log('Resend OTP:', otp);
      res.status(200).json({ success: true, message: 'OTP sent successfully' });
    } else {
      res.status(500).json({ success: false, message: 'Failed to resend OTP' });
    }
  } catch (error) {
    console.error('Error resending OTP:', error);
    res.status(500).json({ success: false, message: 'Failed to resend OTP' });
  }
};




const loadLogin=async(req,res)=>{
    try {
        if(!req.session.user){
            return res.redirect('/login')
        }else{
            res.redirect('/home')
        }
    } catch (error) {
        res.redirect('/pageNotFount')
    }
}


const login = async (req, res) => {
    try {
      const { loginEmail, loginPassword } = req.body;
      const findUser = await User.findOne({ isAdmin: 0, email: loginEmail });
  
      if (!findUser) {
        return res.status(401).json({ success: false, message: 'User not found' });
      }
  
      if (findUser.isBlocked) {
        return res.status(403).json({ success: false, message: 'User is blocked' });
      }
  
      const passwordMatch = await bcrypt.compare(loginPassword, findUser.password);
      if (!passwordMatch) {
        return res.status(401).json({ success: false, message: 'Incorrect password' });
      }
      
      req.session.userId = findUser._id;

      res.status(200).json({ success: true, redirectUrl: '/home' });
  
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ success: false, message: 'Login failed. Try again.' });
    }
  };




  const logout=async (req,res)=>{
    try {
        req.session.destroy((err)=>{
            if(err){
                console.log('session destruction error',err.message)
                return res.redirect('/pageNotFount')
            }
            res.render('welcomeHome')
        })
    } catch (error) {
        console.log('logout error',error);
        res.redirect('/pageNotFount')
        
    }
  }
  


  const gamesPage = async (req, res) => {
    try {
      const userId = req.session.userId;
      let userData = null;
      let userWishlist = [];
  
      if (userId) {
        userData = await User.findOne({ _id: userId });
        userWishlist = userData ? userData.wishlist.map(id => id.toString()) : [];
      }
  
      const categories = await Category.find({ isListed: true });
      const companys = await Company.find({ isBlocked: false });
  
      const page = parseInt(req.query.page) || 1;
      const limit = 9;
      const skip = (page - 1) * limit;
  
      // Build filtro query
      let query = { isListed: true };
  
      // Search functionality
      if (req.query.search) {
        query.name = { $regex: new RegExp(req.query.search, 'i') };
      }
  
      // Category filter
      if (req.query.category && req.query.category.length > 0) {
        if (Array.isArray(req.query.category)) {
          query.categoryId = { $in: req.query.category };
        } else {
          query.categoryId = req.query.category;
        }
      } else {
        const categoryIds = categories.map(cat => cat._id);
        query.categoryId = { $in: categoryIds };
      }
  
      // Free games filter
      if (req.query.isFree === 'true') {
        query.isFree = true;
      }
  
      // Price range filter
      if (req.query.maxPrice) {
        query.salesPrice = { $lte: parseInt(req.query.maxPrice) };
      }
  
      // Determine sort order
      let sortOption = { createdAt: -1 }; // Default sort
      console.log('Sort parameter:', req.query.sort);
      if (req.query.sort) {
        switch (req.query.sort) {
          case 'name-asc':
            sortOption = { name: 1 };
            break;
          case 'name-desc':
            sortOption = { name: -1 };
            break;
          case 'price-asc':
            sortOption = { salesPrice: 1 };
            break;
          case 'price-desc':
            sortOption = { salesPrice: -1 };
            break;
          case 'createdAt-desc':
            sortOption = { createdAt: -1 };
            break;
        }
      }
  
      // Execute query with all filters
      const products = await Product.find(query)
        .sort(sortOption)
        .collation({ locale: 'en', strength: 2 })
        .skip(skip)
        .limit(limit)
        .populate('categoryId')
        .populate('company');
  
      console.log('Sorted products:', products.map(p => p.name));
  
      // Count total filtered products for pagination
      const totalProducts = await Product.countDocuments(query);
      const totalPages = Math.ceil(totalProducts / limit);
  
      // Create query string without page parameter
      const queryObj = { ...req.query };
      delete queryObj.page;
      const queryString = new URLSearchParams(queryObj).toString();
  
      // Render page with all data
      res.render('games', {
        user: userData,
        products: products,
        category: categories,
        company: companys,
        totalProducts: totalProducts,
        currentPage: page,
        totalPages: totalPages,
        queryString: queryString,
        userWishlist: userWishlist, // Pass wishlist to template
        filters: {
          search: req.query.search || '',
          category: req.query.category || [],
          company: req.query.company || [],
          isFree: req.query.isFree === 'true' || false,
          maxPrice: req.query.maxPrice || 5000,
          sort: req.query.sort || 'createdAt-desc',
        },
      });
    } catch (error) {
      console.error('Error loading games page:', error);
      res.redirect('/pageNotFound');
    }
  };
  










 const productDetails = async (req, res) => {
  try {
    const productId = req.params.id;
    const userId = req.session.userId;

    // Get product details
    const product = await Product.findById(productId)
      .populate('categoryId')
      .populate('company');

    if (!product) {
      return res.redirect('/pageNotFound');
    }

    // Get user data if logged in
    const userData = userId ? await user.findById(userId) : null;

    // Get related products (based on category)
    const relatedProducts = await Product.find({
      categoryId: { $in: product.categoryId },
      _id: { $ne: product._id },
      isListed: true
    }).limit(4);

    // Get products from the same publisher
    const publisherProducts = await Product.find({
      company: product.company._id,
      _id: { $ne: product._id },
      isListed: true
    }).limit(4);

    // Render the page
    res.render('productDetials', {
      user: userData,
      product: product,
      relatedProducts: relatedProducts,
      publisherProducts: publisherProducts
    });

  } catch (error) {
    console.error('Error loading product details:', error);
    res.redirect('/pageNotFound');
  }
};






 


module.exports={
    loadHome,
    loadHomepage,
    pageNotFount,
    signUp,
    verifyOtp,
    loadOtpPage,
    resendOtp,
    loadLogin,
    login,
    logout,
    gamesPage,
    productDetails,
    supportPage,
    
}
