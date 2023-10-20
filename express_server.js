const express = require("express");
const cookieParser = require('cookie-parser');
const app = express();
app.use(cookieParser());
const PORT = 8080; // default port 8080
const { generateRandomString, findUserByEmail } = require("./functions.js");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
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
  const templateVars = {
    user,
    urls: urlDatabase,
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const user = users[req.cookies.user_id];
  const templateVars = {
    user,
  };
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  const user = users[req.cookies.user_id];
  const templateVars = {
    id: req.params.id,
    longURL: urlDatabase[req.params.id],
    user,
  };
  res.render("urls_show", templateVars);
});

app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id];
  res.redirect(longURL);
});

//get request for a new register page
app.get('/register', (req, res) => {
  const user = users[req.cookies.user_id];
  const templateVars = {
    user,
  };
  res.render('register', templateVars);
});

//get request for a new login page
app.get('/login', (req, res) => {
  const templateVars = {user: null};
  res.render("login", templateVars);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.post("/urls", (req, res) => {
  const longURL = req.body.longURL;
  const id = generateRandomString();
  urlDatabase[id] = {
    longURL,
  };
  res.redirect(`/urls/${id}`);
});

app.post('/urls/:id/delete', (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect('/urls');
});

app.post('/urls/:id', (req, res) => {
  urlDatabase[req.params.id].longURL = req.body.longURL;
  res.redirect('/urls');
});

//Handles the login process
app.post('/login', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const user = findUserByEmail(email, users);

  if (user && user.password === password) { //Sucessful login
    res.cookie('user_id', user.id);
    res.redirect('/urls');
  } else { //Unsucessful login
    res.status(403).send('403 error - Invalid email or password');
  }
});

//Handles the account creation process
app.post("/register", (req, res) => {
  const id = generateRandomString();
  const email = req.body.email;
  const password = req.body.password;
  const user = { email, password, id};

  if (email.length === 0 || password.length === 0) { //If user and password are zero return error
    return res.status(400).send(`400 error - Missing E-mail or Password`);
  } if (findUserByEmail(email, users)) { //If emailmatch is true then error
    return res.status(400).send(`400 error - A new email is required.`);
  } else {//Sucessful login
    users[id] = user;
    res.cookie('user_id', id);
    res.redirect('/urls');
    console.log(users);
  }
});

//Clears the user cookie on logout
app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect('/login');
});

