const express = require('express');
const path = require('path');
const app = express();

app.use(express.static(path.join(__dirname, 'public')));
app.use('/src', express.static(path.join(__dirname, 'src')));

app.get('*', (req, res) => {
  const filePath = path.join(__dirname, 'public', 'index.html');
  console.log(`Serving file: ${filePath}`);
  res.sendFile(filePath);
});

const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
