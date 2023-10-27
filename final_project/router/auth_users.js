const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
  let userswithsamename = users.filter((user)=>{
    return user.username === username;
  })
  if (userswithsamename.length > 0) {
    return false
  } else {
    return true
  }
}

const authenticatedUser = (username, password) => {
  let validUsers = users.filter((user) => {
    return user.username === username && user.password === password;
  });
  if (validUsers.length > 0) {
    return true;
  } else {
    return false;
  }
};

//only registered users can login
regd_users.post("/login", (req,res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) {
    return res.status(400).json({message: "Error logging in"});
  }
  if (authenticatedUser(username, password)) {
    let accessToken = jwt.sign({
      data: password
    }, 'access', {expiresIn: 60 * 60})

    req.session.authorization = {
      accessToken,username
    }
    return res.status(200).send("User successfully logged in");
  } else {
    return res.status(403).json({message: "Invalid credentials"});
  }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const book = req.params.isbn;
  if (!req.query.review) {
    return res.status(400).json({message: "Review not provided"});
  } else {
    books[book].reviews[req.session.authorization.username] = req.query.review;
    return res.status(300).json({message: `The review for the book with ISBN ${book} has been added or updated`});
  }

});

regd_users.delete("/auth/review/:isbn", (req, res) => {
  const book = req.params.isbn;
  const user = req.session.authorization.username;
  if (books[book].reviews[user]) {
    delete books[book].reviews[user];
    return res.status(200).json({message: `The review for the book with ISBN ${book} posted by the user ${user} has been deleted`});
  } else {
    return res.status(404).json({message: "Review not found"});
  }
})

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
