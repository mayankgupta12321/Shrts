var express = require('express');
var router = express.Router();

const Url = require('../models/url');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/:shortCode', async (req, res, next) => {
  var shortCode = req.params.shortCode;
  await Url.findOneAndUpdate({"shortCode": shortCode},{
    $set: {
    "lastAccessed": new Date()
    }
  },{
    new: true
  })
  .then((url) => {
    if(url)
      res.redirect(url.longUrl);
    else {
      res.end("INVALID URL");
    }
    },(err) => next(err))  
  .catch((err) => next(err));
});

module.exports = router;
