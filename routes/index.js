var express = require('express');

var router = express.Router();

/* GET home page. */
router.get('/', function (req, res) {
  res.render('main' //{title: 'Express', year: new Date().getFullYear()},            
    //  function(err, html) {
    //    // ...
    //  }
  );
});

router.get('/listing', function (req, res) {
  res.render('listing');
});

router.get('/notify', function (req, res) {
  res.render('notify');
});

module.exports = router;