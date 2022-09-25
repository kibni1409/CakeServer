const express = require('express');
const jsonBodyMW = express.json();

const app = express();
const port = 3000;
app.use(jsonBodyMW)

let dbHost = "127.0.0.1";
let dbPort = 5984;
let dbName = "cakedb";
let couchdb = require('felix-couchdb');
let client = couchdb.createClient(dbPort, dbHost, 'admin', 'admin');
let db = client.db(dbName);

app.get('/', (req, res) => {
    db.getDoc('2609', function (err, doc) {
        res.send(doc);
    })
})
//Получение всех записей разом
app.get('/all', (req, res) => {
    // db.allDocs({include_docs: 'false'},function (err, doc) {
    //         res.send(doc);
    // })
    db.view('age', 'new-view', function (err, doc) {
        res.send(doc);
    })
    // client.request('get', '/cakedb/', {age: "12"}, function (err, doc){
    //         res.send(doc);
    // })
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
        // db.view('age','new-view',{
        //         // limit: +req.params.page,
        //         // skip: +req.params.page * +req.params.size
        // },function (err, doc) {
        //         res.send(doc);
        //
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
        res.send(doc)
    }
})


app.listen(port, () => {
    console.log(`started on port ${port}`)
})

