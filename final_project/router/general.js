const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


function isUsernameTaken(username) {
  return users.hasOwnProperty(username);
}

async function getBooks() {
  return Promise.resolve(books);
}

async function getisbnbook(isbn)
{
  return Object.values(books).find((book) => book.isbn === isbn);
}

async function getauthorbook(author)
{
  return Object.values(books).find((book) => book.author === author);
}

async function gettitlebook(title)
{
  return Object.values(books).find((book) => book.title === title);
}

public_users.post("/register", (req, res) => {
  const  username = req.body.username;
  const password = req.body.password;
  if (!username || !password) {
    return res.status(400).json({ error: "Username and password are required." });
  }

  if (isUsernameTaken(username)) {
    return res.status(409).json({ error: "Username already exists." });
  }

  users.push({ username: username, password: password });
  return res.status(200).json({ message: "User registered successfully." });
});

// Get the book list available in the shop
public_users.get('/', async function (req, res) {
  try {
    
    const books1 = await getBooks(); 
    res.write(JSON.stringify(books1));
    res.end();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


// Get book details based on ISBN
public_users.get('/isbn/:isbn', async function (req, res) {
  try{
    const isbn = req.params.isbn;
    console.log(isbn);
    const book = await getisbnbook(isbn)
    console.log(book);
    if (book) {
    res.json(book);
    } else {
    res.status(404).json({ error: 'Book not found.' });
    }
  }
  catch(error)
  {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Get book details based on author
public_users.get('/author/:author',async function (req, res) {
  try{
    const author = req.params.author;
    const book = await getauthorbook(author)
    if (book) {
      res.json(book);
    } else {
      res.status(404).json({ error: 'Book not found.' });
    }
  }
  catch(error)
  {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Get all books based on title
public_users.get('/title/:title', async function (req, res) {
  try{
    const title = req.params.title;
    const book = await gettitlebook(title);
    if (book) {
    res.json(book);
    } else {
      res.status(404).json({ error: 'Book not found.' });
    }
  }
  catch(error)
  {
    console.log(error);
    res.status(500).json({error: 'Internal Server Error'})
  }
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  const isbn = req.params.isbn;
  const book = Object.values(books).find((book) => book.isbn === isbn);
  review = book.reviews;
  if (review) {
    res.json(review);
  } else {
    res.status(404).json({ error: 'Book not found.' });
  }
});

module.exports.general = public_users;
