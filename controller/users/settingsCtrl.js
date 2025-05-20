const User = require('../../models/userDb');
const Product = require('../../models/productDb');
const nodemailer = require('nodemailer');
require('dotenv').config();


// Nodemailer configuration
const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: process.env.NODEMAILER_EMAIL,
    pass: process.env.NODEMAILER_PASSWORD,
  },
});

const settingsPage = async (req, res) => {
  try {
    const userId = req.session.userId;
    if (!userId) {
      return res.redirect('/login');
    }

    const userData = await User.findById(userId).lean();
    if (!userData) {
      return res.redirect('/pageNotFound');
    }

    const editAddressId = req.query.editAddressId;
    let editModalData = null;

    if (editAddressId) {
      editModalData = userData.addresses.find(addr => addr._id.toString() === editAddressId);
      console.log('Found editModalData:', editModalData); // Debug
    }

    res.render('settings', {
      user: userData,
      csrfToken: req.csrfToken ? req.csrfToken() : '',
      editModalData,
    });
  } catch (error) {
    console.error('Error loading settings page:', error);
    res.redirect('/pageNotFound');
  }
};

const addAddress = async (req, res) => {
  try {
    const userId = req.session.userId;
    const newAddress = {
      street: req.body.street,
      city: req.body.city,
      state: req.body.state,
      postalCode: req.body.postalCode,
      country: req.body.country,
      isDefault: req.body.isDefault === 'on' || false,
    };

    console.log('Adding address:', newAddress); // Debug

    const user = await User.findById(userId);

    // If the new address is default, mark others as non-default
    if (newAddress.isDefault) {
      user.addresses.forEach(addr => (addr.isDefault = false));
    }

    user.addresses.push(newAddress);
    await user.save();

    res.status(200).json({ message: 'Address added successfully' });
  } catch (err) {
    console.error('Error adding address:', err);
    res.status(500).json({ message: 'Failed to add address' });
  }
};

const editAddress = async (req, res) => {
  try {
    const userId = req.session.userId;
    const addressId = req.body.addressId;
    const updatedData = {
      street: req.body.street,
      city: req.body.city,
      state: req.body.state,
      postalCode: req.body.postalCode,
      country: req.body.country,
      isDefault: req.body.isDefault === true || req.body.isDefault === 'on' || false,
    };

    console.log('Received addressId:', addressId); // Debug
    console.log('Updated data:', updatedData); // Debug

    // Validate required fields
    if (!updatedData.street || !updatedData.city) {
      return res.status(400).json({ message: 'Street and City are required' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const addressIndex = user.addresses.findIndex(addr => addr._id.toString() === addressId);
    if (addressIndex === -1) {
      return res.status(404).json({ message: 'Address not found' });
    }

    // If the updated address is set as default, mark others as non-default
    if (updatedData.isDefault) {
      user.addresses.forEach((addr, index) => {
        if (index !== addressIndex) addr.isDefault = false;
      });
    }

    // Update the address
    user.addresses[addressIndex] = { ...user.addresses[addressIndex], ...updatedData };
    await user.save();

    console.log('Updated user addresses:', user.addresses); // Debug

    res.status(200).json({ message: 'Address updated successfully' });
  } catch (error) {
    console.error('Error updating address:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};






const deleteAddress = async (req, res) => {
  try {
    const userId = req.session.userId;
    const addressId = req.params.id;

    console.log('Deleting addressId:', addressId); // Debug

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Initialize addresses if undefined
    if (!user.addresses) {
      user.addresses = [];
    }

    const addressIndex = user.addresses.findIndex(addr => addr._id.toString() === addressId);
    if (addressIndex === -1) {
      return res.status(404).json({ message: 'Address not found' });
    }

    // Prevent deletion of default address if it's the only address
    if (user.addresses[addressIndex].isDefault && user.addresses.length === 1) {
      return res.status(400).json({ message: 'Cannot delete the only address, which is set as default.' });
    }

    // Remove the address
    user.addresses.splice(addressIndex, 1);

    // If no addresses remain, no default is needed; otherwise, set first address as default if no default exists
    if (user.addresses.length > 0 && !user.addresses.some(addr => addr.isDefault)) {
      user.addresses[0].isDefault = true;
    }

    await user.save();

    console.log('Updated user addresses after deletion:', user.addresses); // Debug

    res.status(200).json({ message: 'Address deleted successfully' });
  } catch (error) {
    console.error('Error deleting address:', error);
    res.status(500).json({ message: 'Failed to delete address' });
  }
};





const setDefaultAddress = async (req, res) => {
  try {
    const userId = req.session.userId;
    const addressId = req.params.id;

    console.log('Setting default addressId:', addressId); // Debug

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const addressIndex = user.addresses.findIndex(addr => addr._id.toString() === addressId);
    if (addressIndex === -1) {
      return res.status(404).json({ message: 'Address not found' });
    }

    // Mark all addresses as non-default
    user.addresses.forEach(addr => (addr.isDefault = false));

    // Set the selected address as default
    user.addresses[addressIndex].isDefault = true;

    await user.save();

    console.log('Updated user addresses after setting default:', user.addresses); // Debug

    res.status(200).json({ message: 'Default address updated successfully' });
  } catch (error) {
    console.error('Error setting default address:', error);
    res.status(500).json({ message: 'Failed to set default address' });
  }
};




const updateName = async (req, res) => {
  try {
    const userId = req.session.userId;
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Name is required' });
    }

    if (name.length < 2) {
      return res.status(400).json({ message: 'Name must be at least 2 characters' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.name = name;
    await user.save();

    res.status(200).json({ message: 'Name updated successfully' });
  } catch (error) {
    console.error('Error updating name:', error);
    res.status(500).json({ message: 'Failed to update name' });
  }
};

const updateEmail = async (req, res) => {
  try {
    const userId = req.session.userId;
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Invalid email address' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (email === user.email) {
      return res.status(400).json({ message: 'New email must be different from current email' });
    }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.otp = otp;
    user.otpExpires = Date.now() + 10 * 60 * 1000; // OTP valid for 10 minutes
    user.pendingEmail = email;
    await user.save();

    // Send OTP email
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Email Verification OTP',
      text: `Your OTP for email verification is: ${otp}. It is valid for 10 minutes.`,
    };

    await transporter.sendMail(mailOptions);
    console.log(`OTP sent to ${email}: ${otp}`); // Debug

    res.status(200).json({ message: 'OTP sent to new email for verification' });
  } catch (error) {
    console.error('Error updating email:', error);
    res.status(500).json({ message: 'Failed to update email' });
  }
};

const verifyEmailOtp = async (req, res) => {
  try {
    const userId = req.session.userId;
    const { otp, newEmail } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.otp || !user.otpExpires || !user.pendingEmail) {
      return res.status(400).json({ message: 'No pending email verification' });
    }

    if (user.pendingEmail !== newEmail) {
      return res.status(400).json({ message: 'Pending email does not match' });
    }

    if (user.otpExpires < Date.now()) {
      user.otp = undefined;
      user.otpExpires = undefined;
      user.pendingEmail = undefined;
      await user.save();
      return res.status(400).json({ message: 'OTP has expired' });
    }

    if (user.otp !== otp) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    // Update email and clear OTP
    user.email = user.pendingEmail;
    user.otp = undefined;
    user.otpExpires = undefined;
    user.pendingEmail = undefined;
    await user.save();

    res.status(200).json({ message: 'Email updated successfully' });
  } catch (error) {
    console.error('Error verifying OTP:', error);
    res.status(500).json({ message: 'Failed to verify OTP' });
  }
};




module.exports = {
  settingsPage,
  addAddress,
  editAddress,
  deleteAddress,
  setDefaultAddress,
  verifyEmailOtp,
  updateEmail,
  updateName,


};