const express = require('express');
const couchdb = require('felix-couchdb');
const cors = require('cors');


//Настройки APP
const app = express();
const jsonBodyMW = express.json();
app.use(jsonBodyMW);
app.use(cors());


//Объявление ключевый переменных
const dbHost = "127.0.0.1";
const port = 3003;
const dbPort = 5984;
const dbOrders = "cakedb";
const dbUsers = "usersdb";
const client = couchdb.createClient(dbPort, dbHost, 'admin', 'admin');

//Роутинг запросов
//Получение всех записей разом
app.get('/all', (req, res) => {
    let db = client.db(dbOrders);
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
    let db = client.db(dbOrders);
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

//Регистрация пользователя
app.post('/register', (req, res) => {
    let db = client.db(dbUsers);
    if (!req.body.login) {
        res.send('Name dont login')
    } else if (!req.body.password) {
        res.send('Age dont password')
    } else {
        let doc = {
            login: req.body.login,
            password: req.body.password
        }
        db.saveDoc(doc);
        res.send(200)
    }
})

//Авторизация пользователя
app.get('/login', (req, res) => {
    let login = req.query.login;
    client.request('get', `http://127.0.0.1:5984/usersdb/_design/users/_view/login?key="${login}"`, null, function (err, doc) {
        let result = JSON.stringify(doc);
        if(doc.rows.length > 0){
            res.send(doc);
        }
        else{
            res.send('Not found');
        }
    })
})




//Запуск сервера
app.listen(port, () => {
    console.log(`started on port ${port}`)
})

