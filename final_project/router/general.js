const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req,res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (username && password) {
    if (isValid(username)) {
      users.push({username: username, password: password});
      return res.status(200).json({"message": "User registered successfully"});
    } else {
      return res.status(400).json({"message": "User already exists"});
    }
  }

  return res.status(400).json({message: "Unable to register user"});
});

// Get the book list available in the shop
public_users.get('/', async (req, res) => {
  const bookList = await books;
  return res.send(JSON.stringify(bookList,null,4));
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', async (req, res) => {
  const book = await req.params.isbn;
  return res.send(books[book]);
 });
  
// Get book details based on author
public_users.get('/author/:author', async (req, res) => {
  const author = await req.params.author;
  let booksByAuthor = []
  for (const [key, value] of Object.entries(books)) {
  if(value.author === author) {
    const book = { ...value, isbn: key };
    booksByAuthor.push(book);
  }
}

  if (booksByAuthor.length > 0) {
    return res.send(booksByAuthor)
  } else {
    return res.status(404).json({message: "Author not found"});
  } 
});

// Get all books based on title
public_users.get('/title/:title', async (req, res) => {
  const title = await req.params.title;
  let booksByTitle = []
  for (const [key, value] of Object.entries(books)) {
  if(value.title === title) {
    const book = { ...value, isbn: key };
    booksByTitle.push(book);
  }
}

  if (booksByTitle.length > 0) {
    return res.send(booksByTitle);
  } else {
    return res.status(404).json({message: "Title not found"});
  }
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  const book = req.params.isbn;
  return res.send(books[book].reviews);
});

module.exports.general = public_users;
