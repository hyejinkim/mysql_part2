var express = require('express');
var cors = require('cors');
var mysqlx = require('@mysql/xdevapi');

var app = express();

var bodyParser = require('body-parser');
const Schema = require('@mysql/xdevapi/lib/DevAPI/Schema');

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(cors());

var schema;

async function prepareMysql()
{
    var config = {
        host: 'localhost',
        port: 33060,
        password: 'root',
        user: 'root',
        schema: '3SP'
    };

    var session = await mysqlx.getSession(config);
    await session.sql('DROP TABLE 3SP.user').execute();
    await session.sql('CREATE TABLE 3SP.user (username CHAR(20), password INT)').execute();

    await session.sql('DROP TABLE 3SP.gradebook').execute();
    await session.sql('CREATE TABLE 3SP.gradebook (name CHAR(20), id INT, grade CHAR(5))').execute();

    schema = await session.getSchema('3SP');
    await schema.getTable('user').insert('username', 'password').values('gradebook', 1892).execute();
    await schema.getTable('user').insert('username', 'password').values('StudentInfoDB', 2931).execute();
    await schema.getTable('user').insert('username', 'password').values('ProfessorInfoDB', 3831).execute();
    console.log("prepared user");

    await schema.getTable('gradebook').insert('name','id','grade').values('BARRY A. DIAZ', 0829312, 'A').execute();
    await schema.getTable('gradebook').insert('name','id','grade').values('CRYSTAL YOO', 0824541, 'A').execute();
    await schema.getTable('gradebook').insert('name','id','grade').values('HYEJIN KIM', 0827093, 'A').execute();
    await schema.getTable('gradebook').insert('name','id','grade').values('JIYUN WON', 0828531, 'A').execute();
    await schema.getTable('gradebook').insert('name','id','grade').values('NALBY KADKOUI', 0826413, 'A').execute();
    await schema.getTable('gradebook').insert('name','id','grade').values('RAYMOND YOON', 0824210, 'A').execute();
    await schema.getTable('gradebook').insert('name','id','grade').values('STEVEN KORVIN', 0828032, 'A').execute();
    console.log("prepare transcript");
}

prepareMysql();

app.post("/login", async (req, res) => {
    var result = await schema.getTable('user').select('password').where(`username='${req.body.username}'`).execute();
    result = result.fetchOne();
    var password = result[0];

    var loginSuccess = req.body.password === password;
    var grades;
    if (loginSuccess)
    {
        console.log("login successful");
        grades = await schema.getTable('gradebook').select().execute();
        grades = grades.fetchAll();
    }
    res.send({
        login: loginSuccess,
        grades: grades
    });

});

app.post("/update", async (req, res) => {
    await schema.getTable('gradebook').delete().where('true').execute();
    for (var i = 0; i < req.body.grades.length; ++i)
    {
        await schema.getTable('gradebook').insert('name','id','grade').values(req.body.grades[i][0].trim(), req.body.grades[i][1], req.body.grades[i][2].trim()).execute();  
    }
    
    res.send({update: true});
});

app.listen(3000, "localhost", () => {
    console.log("server started");
});
