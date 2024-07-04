const express = require('express');
const app = express();
const routes = require('./routes/routes');


app.use(express.json()); // Middleware to parse JSON bodies
app.use(routes);

const PORT = 8082;
app.listen(PORT, () => {
    console.log(`Book service running on http://localhost:${PORT}`);
});


module.exports=app