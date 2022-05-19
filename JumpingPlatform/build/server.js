const path = require('path');
const express = require('express');

const app = express();
const DIST_DIR = path.join(__dirname, '/dist');
const ASSETS_DIR = path.join(__dirname, '/assets');
const HTML_FILE = path.join(__dirname, 'index.html');

app.use(express.static(ASSETS_DIR));
app.use(express.static(DIST_DIR));
app.get('/', (req, res) => {
  res.sendFile(HTML_FILE);
});

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {

});