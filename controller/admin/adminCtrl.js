const User = require('../../models/userDb');
const Product = require('../../models/productDb');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');




const loadLogin = (req, res) => {
    if (req.session.admin) {
        return res.redirect('/admin/dashboard');
    }
    res.render('adminLogin', { message: null });
};



const pageError=async(req,res)=>{
    res.render('pageError')
}



const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const admin = await User.findOne({ email, isAdmin: true });
        
        if (admin) {
            const passwordMatch = await bcrypt.compare(password, admin.password);
            
            if (passwordMatch) {
                req.session.admin = true;
                req.session.adminId = admin._id; // Store admin ID in session
                return res.redirect('/admin/dashboard');
            }
        }
        
        // If login fails
        res.render('adminLogin', { 
            message: 'Invalid email or password' 
        });
        
    } catch (error) {
        console.error('Login error:', error);
        res.redirect('/pageError');
    }
};

const loadDashboard = async (req, res) => {
    if (req.session.admin) {
        try {
            const userCount = await User.countDocuments();
            const productsCount = await Product.countDocuments();
            res.render('dashboard', {  
                title: 'Dashboard',
                currentPage: 'dashboard'
                , userCount: userCount,
                productsCount: productsCount,
            });
        } catch (error) {
            console.error('Dashboard error:', error);
            res.redirect('/pageError');
        }
    } else {
        res.redirect('/admin/login');
    }
};


const logoutAdmin = async (req, res) => {
    try {
        req.session.destroy(err => {
            if (err) {
                console.log('Error destroying session:', err);
                return res.redirect('/pageError');
            }
            res.redirect('/admin/login');
        });
    } catch (error) {
        console.log('Unexpected error during logout:', error);
        res.redirect('/pageError');
    }
};




module.exports = {
    loadLogin,
    login,
    loadDashboard,
    pageError,
    logoutAdmin,
};
