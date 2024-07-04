const express = require('express');
const app = express();
const bookRoutes = require('./routes/routes');


app.use(express.json()); // Middleware to parse JSON bodies
app.use('/books', bookRoutes);

const PORT = 8082;
app.listen(PORT, () => {
    console.log(`Book service running on http://localhost:${PORT}`);
});


module.exports=app