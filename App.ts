import express = require('express');

const app = express();

app.get('/', (req: express.Request, res: express.Response) => {
    res.send('hello!');
})

app.listen(3000, () => {
    console.log('Server listening on port 3000');
});