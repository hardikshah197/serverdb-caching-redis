const express = require('express');
const path = require('path');
const redis = require('redis');
const bodyParser = require('body-parser');
const swaggerUi = require('swagger-ui-express');
const swaggerJsDoc = require("swagger-jsdoc");
const methodOverride = require('method-override');
const expressHandleBars = require('express-handlebars');

const port = process.env.PORT || 4000;
const app = express();

// swagger setup
const swaggerOptions = {
    definition: {
        info: {
            title: 'NodeRedis API',
            description: "NodeRedis API Information",
            contact: {
                name: "hardik sharma"
            },
            servers: ["http://localhost:4000"]
        }
    },
    // [* routes/*.js]
    apis: ["index.js"]
}

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

//Creating a client
let client = redis.createClient();
client.on('connect', function(){
    console.log('Connected to Redis');
})

// Setting View Engine
app.engine('handlebars', expressHandleBars({defaultLayout:'main'}));
app.set('view engine', 'handlebars');

// setting body-parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));

// Setting methodOverride
app.use(methodOverride('_method'));

//Search Page
/**
 * @openapi
 * /home:
 *   get:
 *     description: Welcome to NodeRedis APIs!
 *     responses:
 *       200:
 *         description: Returns a User string.
 */
app.get('/', function(req,res){
    res.render('searchusers');
});

// Delete user

app.delete('/user/delete/:id', function(req, res){
    client.del(req.params.id);
    res.redirect('/');
})

// Add user page
app.get('/user/add', function(req,res){
    res.render('adduser');
});

// Process add user Page
/**
 * @swagger
 * /user/add:
 *    post:
 *      description: Use to return all customers
 *    parameters:
 *      - name: addUser
 *        in: body
 *        description: Name of user
 *        required: true
 *        schema:
 *          type: string
 *          format: string
 *    responses:
 *      '201':
 *        description: Successfully created user
 */
app.post('/user/add', function(req,res){
    let id=req.body.id;
    let first_name=req.body.first_name;
    let last_name=req.body.last_name;
    let email=req.body.email;
    let phone=req.body.phone;

    client.hmset(id, [
        'first_name', first_name,
        'last_name', last_name,
        'email', email,
        'phone', phone,
    ], function(err, reply){
        if(err){
            console.log(err);
        }
        console.log(reply);
        res.redirect('/');
    });
    
});


//Search Processing
app.post('/user/search', function(req,res){
    let id=req.body.id;

    client.hgetall(id, function(err, obj){
        if(!obj){
            res.render('searchusers', {
                error: 'User does not exist'
            });
        }
        else{
            obj.id = id;
            res.render('details', {
                user: obj,
            });
        }
    })
})
app.listen(port, function(){
    console.log('Server started on port '+port);
})