const User=require('../../models/userDb');
const Product=require('../../models/productDb')



const settingsPage = async (req, res) => {
    try {
      const userId = req.session.userId;
      console.log("User ID:", userId);
      const userData = await User.findById(userId);
      if (!userData) {
        return res.redirect('/pageNotFound');
      }
      return res.render('settings', {
        user: userData
      });
    } catch (error) {
      console.log('Setting page not found:', error);
      res.redirect('/pageNotFound');
    }
  };




module.exports={
    settingsPage,

}