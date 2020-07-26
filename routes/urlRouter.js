const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const config = require('../config');
const shortid = require('shortid');
const validUrl = require('valid-url');
const Url = require('../models/url');

const urlRouter = express.Router();

urlRouter.use(bodyParser.json());

urlRouter.post('/', async (req,res,next) => {
    var longUrl = req.body.longUrl.trim();
    var baseUrl = config.baseUrl;
    if(!validUrl.isWebUri(longUrl)) {
        var err = new Error('Long Url not valid');
        err.status = 400;
        return next(err);
    }
    if(req.body.shortCode && req.body.shortCode.trim() !== "") {
        var shortCode = req.body.shortCode.trim();
        var regex = /[^A-Za-z0-9\-\_]+/g;
        if(regex.test(shortCode)) {
            var err = new Error('ShortCode can contain only letters (A-Z),(a-z),(1-9),(-),(_)');
            err.status = 400;
            return next(err);
        }
    }
    else {         
        var shortCode = shortid.generate();
    }

    await Url.findOne({"shortCode": shortCode})
        .then(async (url) => {
            if(url) {
                var err = new Error('shortCode already exists.');
                err.status = 500;
                return next(err); 
            }
            else {
                var url = new Url({
                    "longUrl": longUrl,
                    "shortCode": shortCode 
                });
                await Url.create(url)
                .then((url) => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    var shortUrl = baseUrl + url.shortCode;
                    res.json({"shortUrl": shortUrl });
                },(err) => next(err))
                .catch((err) => next(err));
            }
    },(err) => next(err))
    .catch((err) => next(err));
});

module.exports = urlRouter;
