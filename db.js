/**
 * Created by dolly on 28/9/17.
 */
const mysql = require('mysql');

const dbconf = {
    host: "localhost",
    user: "users",
    password: "users",
    database: "project"
};

function showusers(done) {

    let conn = mysql.createConnection(dbconf);
    conn.connect();

    conn.query("select * from loggedinusers", function (err, rows, fields) {
        if (err) throw err;

        done(rows);
    })
}

function adduser(person,done) {

    let conn = mysql.createConnection(dbconf);
    conn.connect();

    conn.query("insert into loggedinusers (firstname, lastname, emailid, password) values('" + person.f + "','" + person.l + "','" + person.e + "','" + person.p + "');",
        function (err, rows, fields) {

            if (err) {

                done("NotExist");
                throw err;

            }

            done(rows);
        })
}

function check(loggedperson,done) {

    let conn = mysql.createConnection(dbconf);
    conn.connect();

    conn.query("select * from loggedinusers where emailid = '" + loggedperson.e1 + "' and password = '" + loggedperson.p1 +"';",
        function (err, rows, fields) {

            if (err) {
                done("NotExist");
                throw  err;
            }
            else {
                // console.log(rows[0]);
                // console.log("*")
                done(rows[0]);
            }
        });

}

function emailgiven(email,done) {
    // console.log(email + "hey");
    let conn = mysql.createConnection(dbconf);
    conn.connect();

    conn.query("select * from loggedinusers where emailid = '" + email + "';",
        function (err, rows, fields) {

            if (err) {

                // done("NotExist");
                throw  err;
            }
            else{
                // console.log(rows);
                done(rows);
            }
        });

}

function findOne(email, cb) {
    let conn = mysql.createConnection(dbconf);
    conn.connect();

    conn.query("select * from loggedinusers where emailid = '" + email + "';",
        function (err, rows, fields) {

            if (err) {
                cb(err,null);
            }

            else{
                ob = {
                    f : rows[0].firstname,
                    l : rows[0].lastname,
                    p : rows[0].password,
                    e : rows[0].emailid

                };
                return cb(null, ob);
            }
        });

}

module.exports = {
    showusers,
    adduser,
    check,
    emailgiven,
    findOne
};