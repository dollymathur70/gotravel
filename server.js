/**
 * Created by dolly on 8/2/17.
 */
const express = require('express');
const fs = require('fs');
const db = require('./db.js');
const bodyparser = require('body-parser');
const index = require('./routes/index');
const path = require('path');
const AWS = require('aws-sdk');
const md5 = require('md5');
const url = require('url');
const uuid = require('uuid');
const njwt = require('njwt');
const cookies = require('cookies');
const secretKey = index.secretKey;
const axios = require('axios');
const passport = require('passport');
const passportLocal = require('passport-local').Strategy;
const session = require('express-session');
const app = express();

// passport.use(new passportLocal(function (username, password, callback) {
//         // console.log(111);
//         db.findOne(username,function (error, user) {
//             console.log(user);
//             if (error) {
//                 console.log(error);
//             }
//             else if (user == null) {
//                 callback(new Error("User not found"))
//             }
//             else if (user.p === password) {
//                 // console.log('User logged in');
//                 callback(null, user);
//             }
//             //else {
//             //     callback(null, false)
//             // }
//         })
//     })
// );

app.use(session({
    secret: 'key',
    resave: false,
    saveUninitialized: false
}));

app.set('views', __dirname +'/views');
app.set('view engine', 'hbs');

// app.use(passport.initialize());
// app.use(passport.session());

app.use(bodyparser.json());
app.use(bodyparser.urlencoded({extended: true}));

// passport.serializeUser(function(user, cb) {
//     // if (user.username == null ) {
//     //     cb(new Error())
//     // }
//     cb(null, user);
// });
//
// passport.deserializeUser(function(user, cb) {
//
//         cb(null, user);
// });

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use('/', index.router);
app.use('/',express.static(__dirname + '/public'));

info = [];

AWS.config.update({
    accessKeyId: "AKIAJFF4JHSUPUTYCS5A",
    secretAccessKey: "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",
    region: "us-west-2"
});

const dynamodb = new AWS.DynamoDB({endpoint: "https://dynamodb.us-west-2.amazonaws.com"});
const ses = new AWS.SES({endpoint: "https://email.us-west-2.amazonaws.com"});

app.get('/sendmail',function (req,res) {
    
    var newuser=req.query.e;
    var question=req.query.ques;

        const subject = "Account Verification";
        const params = {
            Destination: {ToAddresses: ['dollymathur70@gmail.com']},
            Message: {
                Body: {
                    Html: {
                        Data: '<html><head>'
                        + '<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />'
                        + '<title>' + subject + '</title>'
                        + '</head><body>'
                        + '<br>'
                        + question + '<br>'
                        + newuser
                        + '</body></html>',
                        Charset: "utf-8"
                    },
                    Text: {
                        Data: "Email Verification",
                        Charset: "utf-8"
                    }
                },
                Subject: {
                    Data: subject,
                    Charset: "utf-8"
                }
            },
            Source: "dollymathur70@gmail.com",
            SourceArn: "arn:aws:ses:us-west-2:672877369189:identity/dollymathur70@gmail.com"
        };
        ses.sendEmail(params, function (err, data) {
            if (err) {
                console.log(err);
            }
        });
        res.send("sent");

});

app.post('/submit', function(req, res) {

    const person = {
        f: req.body.f,
        l: req.body.l,
        g: req.body.g,
        e: req.body.e,
        p: req.body.p
    };

    info.push(person);

    console.log(info);

    db.adduser(person, function (rows) {

        res.send(rows);
    });

});

app.post('/login', function (req,res) {
    const loggedperson = {
        e1 : req.body.username,
        p1 : req.body.password
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
});

app.get('/logout', function (req,res) {
    console.log("logout");
    const claims = {
        sub : '',
        iss : 'http://gotravel.com',
        permission : ''
    };

    var newsecretKey=uuid.v4();
    console.log(newsecretKey);
    const jwt = njwt.create(claims,newsecretKey);
    jwt.setExpiration(new Date(0));
    const token = jwt.compact();
    // console.log(token + "&&");
    new cookies(req,res).set('access_token', token, {
        httpOnly : true,
        // secure : true
    });
    req.session.destroy();
    res.redirect('/');

});

// app.post('/login1', function (req,res) {
//
//     const loggedperson = {
//         e1 : req.body.e1,
//         p1 : md5(req.body.p1)
//     };
//
//     db.check(loggedperson,function (rows) {
//
//         if(rows === "NotExist"){
//
//             res.send({
//                 success : false,
//                 message : "Invalid"
//             });
//         }
//
//         else{
//
//             res.send({
//                 success : true
//             })
//
//         }
//
//     })
// });

// app.post('/login', passport.authenticate('local'),function (req, res) {
//         res.send("Successful login")
//     }
// );

app.get('/checkloggedin',function (req,res) {

    console.log(req.user);
    if(req.user){
        return res.send({success : true});
    }
    return res.send({success : false});

});
//
// app.get('/logout',function (req,res) {
//
//     req.user = null;
//     req.logout();
//     req.session.destroy(() => {
//         res.redirect('/');
//     });
// });

app.get('/presentemail', function (req, res) {
    // console.log(req.query.e)
    db.emailgiven(req.query.e,function (rows) {
        console.log(rows);
        if(rows.length == 0) {
            console.log("empty");
            res.send({
                success: true,
            });
        }
        else{
            console.log("not empty");
            res.send({
                success : false,
            })
        }
    })

});

app.get('/showbuses', function (req, res) {
    console.log("server me hai tu");
    businfo = {

        o : req.query.o,
        d : req.query.d,
        ci : req.query.ci,
        co : req.query.co

    };

    console.log(businfo.o + "  " + businfo.d + " " + businfo.ci + " " + businfo.co + "*");

    if(businfo.co === ""){
        console.log("yes");

        axios.get('http://developer.goibibo.com/api/bus/search/?app_id=1cdc3748&app_key=10f35e3d91b1afa806476960a98a484c&format=json&source=' + businfo.o +
            "&destination=" + businfo.d +
            "&dateofdeparture=" + businfo.ci)
            .then(function (response) {
                console.log(response.data.data);

                if(response.data.data.onwardflights.length == 0){
                    res.redirect('/nodata');
                }
                else {
                    res.render('showbuses', {
                        source: businfo.o,
                        destination: businfo.d,
                        info_onward: response.data.data.onwardflights,
                    });
                }

            })
            .catch(function (error) {

                console.log(error);
                res.end(error);

            });

    }

    else {
        console.log("no");

        axios.get('http://developer.goibibo.com/api/bus/search/?app_id=1cdc3748&app_key=10f35e3d91b1afa806476960a98a484c&format=json&source=' + businfo.o +
            "&destination=" + businfo.d +
            "&dateofdeparture=" + businfo.ci +
            "&dateofarrival=" + businfo.co)
            .then(function (response) {

                console.log(response.data.data);
                console.log(response.data.data.onwardflights);
                console.log(response.data.data.onwardflights.length);

                if(response.data.data.onwardflights.length == 0 && response.data.data.returnflights.length == 0){
                    res.redirect('/nodata');
                }
                else {
                    res.render('showbusesboth', {
                        source: businfo.o,
                        destination: businfo.d,
                        info_onward: response.data.data.onwardflights,
                        info_return: response.data.data.returnflights
                    });
                }

            })
            .catch(function (error) {

                console.log(2);
                console.log(error);
                res.end(error);

            });

    }


});

app.get('/showflights', function (req, res) {
    flightinfo = {

        o : req.query.o,
        on : req.query.on,
        d : req.query.d,
        dn : req.query.dn,
        ci : req.query.ci,
        co : req.query.co,
        ad : req.query.ad,
        ch : req.query.ch

    };

    if(flightinfo.co == ""){

        if(flightinfo.ch != 0) {

            axios.get("http://developer.goibibo.com/api/search/?app_id=1cdc3748&app_key=10f35e3d91b1afa806476960a98a484c&format=json&source=" + flightinfo.o +
                "&destination=" + flightinfo.d +
                "&dateofdeparture=" + flightinfo.ci +
                "&seatingclass=E&adults=" + flightinfo.ad +
                "&children=" + flightinfo.ch +
                "&infants=0&counter=100")
                .then(function (response) {

                    console.log(response.data.data);
                    console.log(response.data.data.onwardflights);

                    if(response.data.data.Error == 'Booking can not be made for a past date, Try current or future dates.' || response.data.data.onwardflights.length == 0){
                        res.redirect("/nodata");
                    }

                    else {
                        res.render('showflights', {
                            source: flightinfo.on,
                            destination: flightinfo.dn,
                            info_onward: response.data.data.onwardflights
                        });
                    }

                })
                .catch(function (error) {
                    console.log(2);
                    console.log(error);
                    res.end(error);

                });
        }
        else{

            console.log("no children")

            axios.get("http://developer.goibibo.com/api/search/?app_id=1cdc3748&app_key=10f35e3d91b1afa806476960a98a484c&format=json&source=" + flightinfo.o +
                "&destination=" + flightinfo.d +
                "&dateofdeparture=" + flightinfo.ci +
                "&seatingclass=E&adults=" + flightinfo.ad +
                "&children=0" +
                "&infants=0&counter=100")
                .then(function (response) {
                    // console.log("response aa gya");
                    // console.log(response.data.data);
                    // console.log(response.data.data.onwardflights);

                    if(response.data.data.Error == 'Booking can not be made for a past date, Try current or future dates.' || response.data.data.onwardflights.length == 0){
                        res.redirect("/nodata");
                    }
                    else {
                        res.render('showflights', {
                            source: flightinfo.on,
                            destination: flightinfo.dn,
                            info_onward: response.data.data.onwardflights
                        });
                    }

                })
                .catch(function (error) {

                    console.log(2);
                    console.log(error);
                    res.end(error);

                });

        }

    }

    else {

        if(flightinfo.ch != 0) {

            axios.get("http://developer.goibibo.com/api/search/?app_id=1cdc3748&app_key=10f35e3d91b1afa806476960a98a484c&format=json&source=" + flightinfo.o +
                "&destination=" + flightinfo.d +
                "&dateofdeparture=" + flightinfo.ci +
                "&dateofarrival=" + flightinfo.co +
                "&seatingclass=E&adults=" + flightinfo.ad +
                "&children=" + flightinfo.ch +
                "&infants=0&counter=100")
                .then(function (response) {
                    console.log("response aa gya");
                    console.log(response);
                    if(response.data.data.Error == 'Booking can not be made for a past date, Try current or future dates.' || (response.data.data.onwardflights.length == 0 && response.data.data.returnflights.length == 0)){
                        res.redirect("/nodata");
                    }

                    else {
                        res.render('showflightsboth', {
                            source: flightinfo.on,
                            destination: flightinfo.dn,
                            info_onward: response.data.data.onwardflights,
                            info_return: response.data.data.returnflights
                        });
                    }
                })
                .catch(function (error) {

                    console.log(2);
                    console.log(error);
                    res.end(error);

                });
        }
        else{

            axios.get("http://developer.goibibo.com/api/search/?app_id=1cdc3748&app_key=10f35e3d91b1afa806476960a98a484c&format=json&source=" + flightinfo.o +
                "&destination=" + flightinfo.d +
                "&dateofdeparture=" + flightinfo.ci +
                "&dateofarrival=" + flightinfo.co +
                "&seatingclass=E&adults=" + flightinfo.ad +
                "&children=0" +
                "&infants=0&counter=100")
                .then(function (response) {
                    console.log("response aa gya");
                    console.log(response);
                    if(response.data.data.Error == 'Booking can not be made for a past date, Try current or future dates.' || (response.data.data.onwardflights.length == 0 && response.data.data.returnflights.length == 0)){
                        res.redirect("/nodata");
                    }

                    else {
                        res.render('showflightsboth', {
                            source: flightinfo.on,
                            destination: flightinfo.dn,
                            info_onward: response.data.data.onwardflights,
                            info_return: response.data.data.returnflights
                        });
                    }

                })
                .catch(function (error) {

                    console.log(2);
                    console.log(error);
                    res.end(error);

                });

        }

    }


});

app.get('/showhotels', function (req, res) {
    console.log("server me hai tu");
    hotelinfo = {

        o : req.query.o,
        ci : req.query.ci,
        co : req.query.co,

    };

        console.log(hotelinfo.o + " " + hotelinfo.ci + " " + hotelinfo.co);

        axios.get("http://developer.goibibo.com/api/cyclone/?app_id=1cdc3748&app_key=10f35e3d91b1afa806476960a98a484c&format=json&city_id=" + hotelinfo.o +
        "&check_in=" + hotelinfo.ci +
        "&check_out=" + hotelinfo.co)
            .then(function (response) {
                console.log("response aa gya");
                console.log(response);

                // res.render('showhotels', {
                //     source : hotelinfo.o,
                //     info_onward : response.data.data.onwardflights
                // });

            })
            .catch(function (error) {

                console.log(2);
                console.log(error);
                res.end(error);

            });


});

app.get('/show', (req, res) => {

    db.showusers(function (rows) {
        res.send(rows)
    });

});

// app.post('/loginPP', passport.authenticate('local'), function (req, res) {
//     // console.log("whts up");
//     // console.log(req.user);
//
//     res.send({url: "/profile"});
// });

app.listen(5000, () => {

    console.log("server is running on port 5000");

});

