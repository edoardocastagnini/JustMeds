const express = require('express');
const passport = require('./authGoogle'); 
const router = express.Router();

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback', 
  passport.authenticate('google', { failureRedirect: '/loginFail.html' }),
  function(req, res) {
    req.session.user = {
      id: req.user._id,
      email: req.user.email,
      type: req.user.type,
      farmaciaID: req.user.type === 'farmacia' ? req.user._id : undefined
    };
    req.session.save(err => {
      if (err) {
        console.error('Error saving session:', err);
        return res.status(500).json({ message: 'Internal server error' });
      }
      if (req.session.user.type === 'farmacia') {
        return res.redirect('/farmacia/farmacia.html');
      }
      if (req.session.user.type === 'admin') {
        return res.redirect('/admin/admin.html');
      }
      if (req.session.user.type === 'ricevente') {
        return res.redirect('/order/order.html');
      }
      if (req.session.user.type === 'rider') {
        return res.redirect('/delivery/delivery.html');
      }
    });
  }
);

module.exports = router;
