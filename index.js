const express = require('express');
const jsonBodyMW = express.json();
const cors = require('cors');


const app = express();
const port = 3003;
app.use(jsonBodyMW)
app.use(cors());

let dbHost = "127.0.0.1";
let dbPort = 5984;
let dbName = "cakedb";
let couchdb = require('felix-couchdb');
let client = couchdb.createClient(dbPort, dbHost, 'admin', 'admin');
let db = client.db(dbName);

//Получение всех записей разом
app.get('/all', (req, res) => {
    db.view('age', 'new-view', function (err, doc) {
        res.send(doc);
    })
})

//Получение часть записей по страницам
app.get('/alle', (req, res) => {
    if (!req.query.sizePage) {
        res.send('SizePage dont send');
    }
    if (!req.query.page) {
        res.send('Page dont send');
    }
    let limit = req.query.sizePage;
    let size = req.query.page * req.query.sizePage - req.query.sizePage;
    client.request('get', `http://127.0.0.1:5984/cakedb/_design/age/_view/new-view?limit=${limit}&skip=${size}`, null, function (err, doc) {
        res.send(doc);
    })
})

//Добавление записи
app.post('/save', (req, res) => {
    if (!req.body.name) {
        res.send('Name dont send')
    } else if (!req.body.age) {
        res.send('Age dont send')
    } else {
        let doc = {
            name: req.body.name,
            age: req.body.age
        }
        db.saveDoc(doc);
        res.send(200)
    }
})


app.listen(port, () => {
    console.log(`started on port ${port}`)
})

