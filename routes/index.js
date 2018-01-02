/**
 * Created by dolly on 28/9/17.
 */
/**
 * Created by dolly on 20/3/17.
 */
const express = require('express');
const router = express.Router();
const url = require('url');
const db = require('../db');
const uuid = require('uuid');
const secretKey = uuid.v4();
const Cookies = require('cookies');
const njwt = require('njwt');

router.get('/', function (req, res, next) {
    const token = new Cookies(req, res).get('access_token');
    njwt.verify(token, secretKey, function (err, result) {
        if (err) {
            res.render('index');
        } else {
            res.redirect('/profile');
        }
    });
});

router.get('/signup', function (req, res) {
    res.render('signup', {

    });
});

router.get('/flights', function (req, res) {
    res.render('flights', {

    });
});

router.get('/hotels', function (req, res) {
    res.render('hotels', {

    });
});

router.get('/buses', function (req, res) {
    res.render('buses', {

    });
});

router.get('/trains', function (req, res) {
    res.render('trains', {

    });
});

router.get('/nodata', function (req, res) {
    res.render('nodata', {

    });
});


router.get('/profile',function (req, res) {

    const token = new Cookies(req, res).get('access_token');
    // console.log(secretKey)

    njwt.verify(token, secretKey, function (err1, result1) {
        if (err1) {
            // console.log(err1);
            res.render('nodata');
        }
        else {
            const loggedperson = {
                e1 : req.query.f,
                p1 : req.query.l
            };
            db.check(loggedperson,function (rows) {
                if(rows === "NotExist"){
                    res.send({
                        success : false,
                        message : "Invalid"
                    });
                }
                else {
                    console.log(secretKey);
                    const claims = {
                        sub: rows.emailid,
                        iss: 'http://gotravel.com',
                        permission: 'uploads, search, message'
                    };
                    const jwt = njwt.create(claims, secretKey);
                    jwt.setExpiration(new Date().getTime() + (24 * 60 * 60 * 1000));
                    const token = jwt.compact();
                    new cookies(req, res).set('access_token', token, {
                        httpOnly: true,
                        // secure: true
                    });
                    // res.redirect('/profile?e=' + rows.emailid + "&f=" + rows.firstname + "&l=" + rows.lastname);
                    req.session.name = rows.firstname + rows.lastname;
                    req.session.email = rows.emailid;
                    req.session.uid = rows.emailid;
                    res.send({
                        success : true,
                        e : rows.emailid,
                        f : rows.firstname,
                        l : rows.lastname
                    });
                }
            })



            res.render('login', {
                firstname : req.query.f,
                lastname : req.query.l,
            });
        }
    });
});

module.exports = {

    router:router,
    secretKey : secretKey
};