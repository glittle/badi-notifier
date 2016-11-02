var express = require('express');
var router = express.Router();
var verses = require('../verses');
const notifications = require('../notifications');

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
  res.render('notify', notifications);
});


router.get('/verse', function (req, res) {
  res.render('verse', verses);
});



module.exports = router;