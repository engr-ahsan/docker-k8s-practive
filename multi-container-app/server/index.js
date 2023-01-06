const keys = require('./keys');

const express = require('express');
const cors = require('cors');


const app = express();
app.use(cors());
app.use(express.json());

const {Pool} = require('pg');
const pgClient = new Pool({
    user: keys.pgUser,
    host: keys.pgHost,
    database: keys.pgDatabase,
    password: keys.pgPassword,
    port: keys.pgPort
});

pgClient.on('error', () => console.log('Lost PG Connection'));

pgClient.on('connect', (client) => {
    client.query('CREATE TABLE IF NOT EXISTS values (number INT)')
    .catch((err) => console.error('Error creating table ', err));
})

const redis = require('redis');

const redisClient = redis.createClient({
    host: keys.redisHost,
    port: keys.redisPort,
    retry_strategy: () => 1000
})

const redisPublisher = redisClient.duplicate();


// Routes

app.get('/', (req,res) => {
    res.send('Connected');
})


app.get('/values/all', async (req,res) => {
    const values = await pgClient.query('SELECT * FROM values');

    return res.send({
        count: values.rowCount,
        list: values.rows
    });
})


app.get('/values/current', async(req,res) => {
   
   const values =  await redisClient.hGetAll('values');
    
   return res.send({values});

})

app.post('/values', async (req,res) => {
    const index = req.body.index;

    if(parseInt(index) > 42) {
        return res.status(422).send('Index too high');
    }

    redisClient.hSet('values', index , 'Nothing Yet!');
    redisPublisher.publish('insert', index);

    pgClient.query(`INSERT INTO values(number) VALUES($1)`, [index]);

    res.send({working: true});

});


app.listen(5000, err => {
    console.log('Listening on 5000');
})
