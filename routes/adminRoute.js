const express = require('express');
const route = express.Router();
const adminCtrl = require('../controller/admin/adminCtrl');
const { userAuth, adminAuth } = require('../middlewares/auth');
const customerController = require('../controller/admin/customerController');
const categoryController = require('../controller/admin/categoryController');
const companyController = require('../controller/admin/companyController');
const productController = require('../controller/admin/productController');
const category = require('../models/categoryDb');
const fs = require('fs');
const path = require('path');


// login management
route.get('/pageError', adminCtrl.pageError);
route.get('/login', adminCtrl.loadLogin);
route.post('/login', adminCtrl.login);
route.get('/dashboard', adminCtrl.loadDashboard);
route.get('/logout', adminCtrl.logoutAdmin);



// customer management
route.get('/customer-management', adminAuth, customerController.customerInfo);
route.get('/block-customer', adminAuth, customerController.customerBlocked);
route.get('/unblock-customer', adminAuth, customerController.customerUnblocked);



// category management
route.get('/category-management', adminAuth, categoryController.categoryInfo);
route.post('/add-category', adminAuth, categoryController.addCategory);
route.put('/edit-category/:id', adminAuth, categoryController.editCategory);
route.get('/list-category', adminAuth, categoryController.listCategory);
route.get('/unlist-category', adminAuth, categoryController.unlistCategory);




// company controller
route.get('/company-management', adminAuth, companyController.companypage);
route.post('/addCompany', adminAuth, companyController.addCompany);
route.put('/editCompany/:id',adminAuth,companyController.editCompany)
route.get('/block-company', adminAuth, companyController.blockCompany);
route.get('/unblock-company', adminAuth, companyController.unblockCompany);
route.get('/delete-company', adminAuth, companyController.deleteCompany);




// product management
route.get('/product-management',adminAuth, productController.productpage);
route.get("/addproduct", adminAuth, productController.addProductPage)
route.post('/addProduct/add',adminAuth,productController.addProduct)
route.get('/list-products', adminAuth, productController.listProducts);
route.get('/editproductpage',adminAuth,productController.editProductPage);
route.put('/edit-product/:id',adminAuth,productController.editProduct);
route.get('/toggle-recommended',adminAuth,productController.toggleRecommended);
route.get('/free-product',adminAuth, productController.FreeProduct);









module.exports = route;

