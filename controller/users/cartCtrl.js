const Product=require('../../models/productDb')
const User=require('../../models/userDb')



const cartPage = async (req, res) => {
    try {
      const userId = req.session.userId;
        const user = await User.findById(userId).lean();
  
      if (!user) {
        return res.render('cart', {
          user: null,
          product: [],
          userCart: [],
          error: 'User not found.'
        });
      }
  
      const product = await Product.find({ 
        _id: { $in: user.cart }, 
        isListed: true 
      })
      .select('_id name poster salesPrice regularPrice isFree')
      .lean();
  
      res.render('cart', {
        user,
        product,
        userCart: user.cart.map(id => id.toString()),
        error: null
      });
  
    } catch (error) {
      console.error('Error loading cart:', error);
      res.render('cart', {
        user: null,
        product: [],
        userCart: [],
        error: 'Failed to load cart. Please try again later.'
      });
    }
  };
  



  const addToCart = async (req, res) => {
    try {
        const userId = req.session.userId;
        const { productId } = req.params;

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found', success: false });
        }

        // Check if the product is already in the cart
        if (!user.cart.includes(productId)) {
            user.cart.push(productId); // Add product to cart

            // If the product is in the wishlist, remove it
            const wishlistIndex = user.wishlist.indexOf(productId);
            if (wishlistIndex > -1) {
                user.wishlist.splice(wishlistIndex, 1); // Remove product from wishlist
            }

            await user.save(); // Save the updated user document

            res.json({ message: 'Product added to cart', success: true });
        } else {
            res.json({ message: 'Product is already in the cart', success: false });
        }
    } catch (error) {
        console.error('Error adding to cart:', error);
        res.status(500).json({ message: 'Failed to add product to cart', success: false });
    }
};





const removeFromCart = async (req, res) => {
  try {
      const userId = req.session.userId;
      const { productId } = req.params;
      const user = await User.findById(userId);

      if (user.cart.includes(productId)) {
          user.cart.pull(productId); 
          await user.save(); 
          res.json({ message: 'Product removed from cart', success: true });
      } else {
          res.json({ message: 'Product not found in the cart', success: false });
      }
  } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Failed to remove product from cart', success: false });
  }
};














module.exports={
    cartPage,
    addToCart,
    removeFromCart,

  }