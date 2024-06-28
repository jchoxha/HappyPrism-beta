// server.js
const express = require('express');
const path = require('path');

const app = express();
const _dirname = __dirname;

app.use(express.static(path.join(_dirname, 'public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(_dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
