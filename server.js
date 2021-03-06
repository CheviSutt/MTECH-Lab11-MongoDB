const express = require('express');
const path = require('path');
const mongoose = require('mongoose');

// const jsonFile = __dirname + '/clients.json'; // not used

mongoose.connect('mongodb://localhost/userManagement', {useNewUrlParser: true}); // userManagement is the db name
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => console.log('db connected'));

const userSchema = new mongoose.Schema({
    firstName: String,
    lastName: String,
    email: String,
    address: String,
    age: String
});

const monUser = mongoose.model('userCollection', userSchema); // userCollection is the db collection name

const app = express();
const port = process.env.PORT || 5000;
app.use(express.urlencoded({ extended: true}));
app.use(express.static(path.join(__dirname,'public')));
app.set('view engine', 'pug');

app.get('/', (req, res) => {  // pulls back all docs in the userCollection
    monUser.find({}, (err, docs) => {
        if (err) console.log(err);
        res.render('clientTable', {monUser: docs});
    });
});

app.get('/newClient', (req, res) => { // Renders the new client form
    res.render('newClient');
});

app.post('/newClient', (req, res) => {
    const newUser = new monUser();

    newUser.firstName = req.body.firstName;
    newUser.lastName = req.body.lastName;
    newUser.email = req.body.email;
    newUser.address = req.body.address;
    newUser.age = req.body.age;

    newUser.save((err, data) => {  // *Submit button newClient
        if (err) console.error(err);
        res.redirect('/');
    });
});

app.get('/edit/:clientId', (req, res) => { // /edit/*clientID* Page
    //since this is a get request, all we need to get is the user data
    //so first, we grab the clientId from the params
    const clientId = req.params.clientId;
    //after that, we can then search the mongo data base to find the user
    //we use the 'findOne()' method to search until found model
    //that way we dont search the entire thing, just what we need
    monUser.findOne({_id:clientId}, (err, doc) => {
        if (err) console.log(err);
        res.render('edit', {user:doc}); // *sends the current user to be edited
    });
});

app.post('/updateUser/:clientId', (req, res) => {  // *Updates edited User
    //first, lets grab the clientId that we passed through:
    const clientId = req.params.clientId;
    //to make our lives easier, and not have to define variables for each field
    //we can just make an object to pass through
    //we can also define body so we don't have to type 'req.body' so many times
    const body = req.body;
    const updatedUserData = {
        firstName: body.firstName,
        lastName: body.lastName,
        email: body.email,
        address: body.address,
        age: body.age
    };
    //so instead of doing multiple fields and guessing to find the correct user,
    //you can use the clientId we passed through to search the database.
    monUser.findOneAndUpdate({_id:clientId}, updatedUserData, {new: true}, (err, data) => {
        if (err) console.log(err);
        res.redirect('/'); // *Loads the updated edited User to the clientTable
    });
});

app.get('/delete/:clientId', (req, res) => {
    const clientId = req.params.clientId;
    monUser.findOneAndDelete({'_id': clientId}, (err, data) => {
        if (err) return console.log(`Oops! ${err}`);
        res.redirect('/');
    });
});

app.post('/search', (req, res) => {
    const body = req.body;
    console.log(body);
    monUser.find({ $text:{$search: body.search} }, (err, data) => {
        if (err) return console.log(`Oops! ${err}`);
        // let result = JSON.parse(data);
        //console.log(data);
        res.render('search', {monUser: data});
    });
});

app.get('/sortA-Z', (req, res) => {
    monUser.find({}).sort({firstName: 1}).exec((err, data) => { // ascending
        if (err) return console.log(`Oops! ${err}`);
        // res.send(data);
        res.render('clientTable', {monUser: data});
    });
});

app.get('/sortZ-A', (req, res) => { // sort test
    monUser.find({}).sort({firstName: -1}).exec((err, data) => { // descending
        if (err) return console.log(`Oops! ${err}`);
        // res.send(data);
        res.render('clientTable', {monUser: data});
    });
});

app.listen(5000, () => {
    console.log(`Listening on port: ${port}`);
});


