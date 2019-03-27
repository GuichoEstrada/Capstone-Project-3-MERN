const express = require('express');
const mongoose = require('mongoose');
const users = require('./routes/api/users');
const profiles = require('./routes/api/profiles');
const posts = require('./routes/api/posts');

const app = express();

// Database connection
const db = require("./config/keys").mongoURI;
mongoose.connect(db, { useNewUrlParser: true })
  .then(() => console.log("MongoDB successfully connected."))
  .catch(err => console.log(err));

// Routes
app.get('/', (req, res) => res.send('Hello World'));
app.use('/api/users', users);
app.use('/api/profiles', profiles);
app.use('/api/posts', posts);

// Port connection
const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Server listens on port ${port}.`));