require('dotenv').config();
const express = require('express');
const cors = require('cors');
const trendsRoute = require('./routes/trends');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/trends', trendsRoute);
app.get('/', (req, res) => {
    res.send('Welcome to the server!');
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
