const express=require('express');
const route=express.Router();
const userCtrl=require('../controller/users/userCtrl');
const profileCtrl=require('../controller/users/profileCtrl')
const wishlistCtrl=require('../controller/users/wishlistCtrl')
const cartCtrl=require('../controller/users/cartCtrl')
const settingsCtrl=require('../controller/users/settingsCtrl')
const passport = require('passport');
const {userAuth} = require('../middlewares/auth');

route.get('/',userCtrl.loadHome);
route.get('/pageNotFount',userCtrl.pageNotFount)
route.post('/signup',userCtrl.signUp)
route.post('/verify-Otp',userCtrl.verifyOtp)
route.get('/verify-Otp', userCtrl.loadOtpPage)
route.post('/resend-Otp', userCtrl.resendOtp);
route.get('/auth/google',passport.authenticate('google',{scope:['profile','email']}))
route.get('/auth/google/callback',
     passport.authenticate('google', { failureRedirect: '/signup' }),
    (req, res) => {
      req.session.userId = req.user._id;
      res.redirect('/home');

    }
  );
route.get('/login',userCtrl.loadLogin)
route.post('/login',userCtrl.login)
route.get('/home',userCtrl.loadHomepage)
route.get('/logout',userCtrl.logout)

// forgotPassword
route.post('/forgotPassword',profileCtrl.forgotPassword)
route.post('/resendOtp',profileCtrl.resendOtp)
route.post('/verifyOtp',profileCtrl.verifyOtp)
route.post('/resetPassword',profileCtrl.resetPassword)
route.get('/games',userAuth,userCtrl.gamesPage)
route.get('/product-details/:id',userAuth, userCtrl.productDetails)

// remove and addToWishlist
route.get('/wishlistPage',userAuth,wishlistCtrl.wishlistPage)
route.post('/addwishlist/:productId', userAuth, wishlistCtrl.addToWishlist);
route.delete('/removefromwishlist/:productId', userAuth, wishlistCtrl.removeFromWishlist);
route.get('/wishlist/status/:productId', userAuth, wishlistCtrl.checkWishlistStatus);

// remove and addToCart
route.get('/cart',userAuth,cartCtrl.cartPage)
route.post('/cart/add/:productId',userAuth,cartCtrl.addToCart)
route.delete('/cart/remove/:productId',userAuth,cartCtrl.removeFromCart)

// support
route.get('/support',userAuth,userCtrl.supportPage)

// user settings
route.get('/settings', userAuth, settingsCtrl.settingsPage);
route.post('/add-address', userAuth, settingsCtrl.addAddress);
route.put('/edit-address', userAuth, settingsCtrl.editAddress);
route.delete('/delete-address/:id', userAuth, settingsCtrl.deleteAddress);
route.put('/address-default/:id', userAuth, settingsCtrl.setDefaultAddress);


module.exports=route;
