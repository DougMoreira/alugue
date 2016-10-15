const mongoose = require('mongoose');
const express = require('express');
var app = express();
mongoose.connect('mongodb://doug:123@ds019796.mlab.com:19796/doug');

var db = mongoose.connection;
db.on('error', (err) => {console.error(err)});

db.once('open', () => console.log("Connected in database " + db.name + "!"));

var userSchema = mongoose.Schema({
    name: String
    , age: Number
    , email: String
    , registrationDate: { type: Date, default: Date.now },
});

var User = mongoose.model('pec', userSchema);

// var newUser = new User({
//      name: 'Caio'
//     , age: 20
//     , email: 'caio@gmail.com'
// });

//newUser.save(fnSave); /* Persiste a nova instâcia de User */
//User.find({age: {$eq: 20}},fnSave);
function fnSave(err, obj) {
    if(err) return console.error(err);
    console.log(obj);
};

app.get('/api/gets', function (req, res, next) {
    User.findOne(function(err, obj) {
        if(err) return console.error(err);
        console.log(obj);
        //var x = JSON.stringify(obj);
        res.send(obj);
        next();
    });
});

app.listen(3000);
