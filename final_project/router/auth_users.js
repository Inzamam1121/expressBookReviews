const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValidISBN = (isbn) => {
  return !!books[isbn];
};

// Function to add a review for a book with the given ISBN and username
const addReview = (isbn, username, review) => {
  if (!books[isbn].reviews) {
    books[isbn].reviews = {};
  }

  books[isbn].reviews[username] = review;
};

const deleteReview = (isbn, username) => {
  if (books[isbn].reviews) {
    books[isbn].reviews = {};
  }
};

const isValid = (username)=>{ 
  return !!username;
}

const authenticatedUser = (username,password)=>{ 
  console.log(users);
  return users.some((user) => user.username === username && user.password === password);
}

//only registered users can login
regd_users.post("/login", (req,res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: "Username and password are required." });
  }

  if (!isValid(username)) {
    return res.status(400).json({ error: "Invalid username." });
  }

  if (authenticatedUser(username, password)) {
    const token = jwt.sign({ username: username }, "YOUR_SECRET_KEY", { expiresIn: "1h" });
    return res.status(200).json({ message: "Login successful.", token: token });
  } else {
    return res.status(401).json({ error: "Invalid username or password." });
  }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const { isbn } = req.params.isbn;
  const { review } = req.body;

  console.log(isbn);
  console.log(review);

  const token = req.headers.authorization;
  console.log(token);
  if (!token) {
    return res.status(401).json({ error: "Unauthorized: Please log in." });
  }

  try {
    const decodedToken = jwt.verify(token, "YOUR_SECRET_KEY");
    const username = decodedToken.username;

    if (!username) {
      return res.status(400).json({ error: "Invalid username." });
    }

    if (!isValidISBN(isbn)) {
      return res.status(404).json({ error: "Invalid ISBN." });
    }

    if (!review) {
      return res.status(400).json({ error: "Review text is required." });
    }

    addReview(isbn, username, review);

    return res.status(200).json({ message: "Review added/updated successfully." });
  } catch (err) {
    return res.status(401).json({ error: "Unauthorized: Please log in." });
  }
});

regd_users.delete('/auth/review/:isbn', (req, res) => {
  const { isbn } = req.params;

  const token = req.headers.authorization;
  console.log(token);
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized: Please log in.' });
  }

  try {
    const decodedToken = jwt.verify(token, 'YOUR_SECRET_KEY');
    const username = decodedToken.username;

    if (!username) {
      return res.status(400).json({ error: 'Invalid username.' });
    }

    if (!isValidISBN(isbn)) {
      return res.status(404).json({ error: 'Invalid ISBN.' });
    }
    deleteReview(isbn, username);
    return res.status(200).json({ message: 'Review deleted successfully.' });
  } catch (err) {
    return res.status(401).json({ error: 'Unauthorized: Please log in.' });
  }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
