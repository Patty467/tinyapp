const express = require("express");
const cookieParser = require('cookie-parser');
const app = express();
app.use(cookieParser());
const PORT = 8080; // default port 8080
const bcrypt = require("bcryptjs");
const { generateRandomString, findUserByEmail, urlsForUser } = require("./functions.js");

const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW",
  },
};

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

//Pass the url data into our template
app.get("/urls", (req, res) => {
  const user = users[req.cookies.user_id];
  const userId = req.cookies.user_id
  userUrls = urlsForUser(userId, urlDatabase);
  const templateVars = { user, urls: userUrls, };
  if (!user) { // If user is not logged in, send an error message
    return res.status(400).send('Please login to access your URLs'); 
  }
  res.render("urls_index", templateVars);
});

//Get request for new URL's page
app.get("/urls/new", (req, res) => {
  const user = users[req.cookies.user_id];
  const templateVars = { user };
  if (!user) { // If user is not logged in, redirect to /login
    res.redirect(`/login`);
  }
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  const user = users[req.cookies.user_id];
  const userId = req.cookies.user_id;
  const urlUserId = urlDatabase[req.params.id].userID;
  const templateVars = {
    id: req.params.id,
    longURL: urlDatabase[req.params.id].longURL,
    user, 
  };
  if (!user) { // If user is not logged in, send an error message
    return res.status(400).send('Please login to access your URLs'); 
  } if (userId !== urlUserId) {
    return res.status(400).send('You did not create this URL');
  }
  res.render("urls_show", templateVars);
});

//get request to access a shortened url
app.get("/u/:id", (req, res) => {
  const id = req.params.id;
  const urlId = urlDatabase[id];
  const longURL = urlDatabase[req.params.id].longURL;
  if (!urlId) {//Error if URL does not exist
    return res.status(400).send('This URL ID does not exist'); 
  }
  res.redirect(longURL);
});

//get request for a new register page
app.get('/register', (req, res) => {
  const user = users[req.cookies.user_id];
  const templateVars = { user };
  if (user) { // If user is logged in, redirect to /urls
    res.redirect(`/urls`);
  }
  res.render('register', templateVars);
});

//get request for a new login page
app.get('/login', (req, res) => {
  const user = users[req.cookies.user_id];
  if (user) {
    res.redirect(`/urls`);
  };
  const templateVars = {user: null};
  res.render("login", templateVars);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

//Creates new TinyURL's
app.post("/urls", (req, res) => {
  const longURL = req.body.longURL;
  const user = users[req.cookies.user_id];
  const id = generateRandomString();
  const userID = req.cookies.user_id;
  urlDatabase[id] = {
    longURL,
    userID,
  };
  if(!user) {//If user is not logged in, send error message
    return res.status(400).send('You are not logged in, so you can not shorten URLs'); 
  }
  res.redirect(`/urls/${id}`);
});

app.post('/urls/:id/delete', (req, res) => {
  const user = users[req.cookies.user_id];
  const userId = req.cookies.user_id;
  const urlUserId = urlDatabase[req.params.id].userID;
  if (!urlUserId) {//If URL doesn't exist
    return res.status(400).send('URL ID does not exist');
  } if (!user) {//If the user isn't logged in
    return res.status(400).send('You are not logged in');
  } if (userId !== urlUserId) {//If the user doesn't own the URL
    return res.status(400).send('You did not create this URL');
  }
  delete urlDatabase[req.params.id];
  res.redirect('/urls');
});

app.post('/urls/:id', (req, res) => {
  const user = users[req.cookies.user_id];
  const userId = req.cookies.user_id;
  const urlUserId = urlDatabase[req.params.id].userID;
  urlDatabase[req.params.id].longURL = req.body.longURL;
  if (!urlUserId) {//If URL doesn't exist
    return res.status(400).send('URL ID does not exist');
  } if (!user) {//If the user isn't logged in
    return res.status(400).send('You are not logged in');
  } if (userId !== urlUserId) {//If the user doesn't own the URL
    return res.status(400).send('You did not create this URL');
  }
  res.redirect('/urls');
});

//Handles the login process
app.post('/login', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const user = findUserByEmail(email, users);
  if (user && bcrypt.compareSync(password, user.password)) { //Successful login
    res.cookie('user_id', user.id);
    res.redirect('/urls');
  } else { //Unsuccessful login
    res.status(403).send('403 error - Invalid email or password');
  }
});

//Handles the account creation process
app.post("/register", (req, res) => {
  const id = generateRandomString();
  const email = req.body.email;
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10)
  const user = { email, password: hashedPassword, id};
  if (email.length === 0 || password.length === 0) { //If user and password are zero return error
    return res.status(400).send(`400 error - Missing E-mail or Password`);
  } if (findUserByEmail(email, users)) { //If emailmatch is true then error
    return res.status(400).send(`400 error - A new email is required.`);
  } else {//Sucessful login
    users[id] = user;
    res.cookie('user_id', id);
    res.redirect('/urls');
  }
});

//Clears the user cookie on logout
app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect('/login');
});

module.exports = { urlDatabase };