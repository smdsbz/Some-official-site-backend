var express = require('express');
var router = express.Router();


router.get('/', (req, res, next) => {
  if (req.signedCookies.user) { // signed user
    res.render('admin/index');
  } else {                      // unsigned user
    res.clearCookie('user');
    res.redirect('/admin/login');
  }
});


router.get('/logout', (req, res, next) => {
  res.clearCookie('user');
  res.redirect('/admin');
});


router.get('/login', (req, res, next) => {
  res.clearCookie('user');
  res.render('admin/login');
});

router.post('/login', (req, res, next) => {
  console.log(req.body);
  if (req.body.username && req.body.password) {

    /******************************************
     * TODO: Add actual database queries here *
     ******************************************/

    // stay logged-in, in milliseconds, setting to 30 days / 1 hour
    req.body.rememberme = (req.body.rememberme ?
        30 * 24 * 3600 * 1000 : 3600 * 1000);
    res.cookie('user', req.body.username,
        { signed: true, maxAge: req.body.rememberme });
  } else {  // validation failed
    // TODO: Toast message
  }
  res.redirect('/admin');
});

module.exports = router;

