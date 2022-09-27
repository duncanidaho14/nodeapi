require('@babel/register');
const Twig = require('twig');
const bodyParser = require("body-parser");
const express = require('express');
const app = express();
const PORT = 8080;
const morgan = require('morgan');
const config = require('../config.json');
let functions = require('./functions/functions');
let membres = [
    {
        id: 1,
        name: 'Snoop',
        age: 50
    },
    {
        id: 2,
        name: 'Roni',
        age: 42
    },
    {
        id: 3,
        name: 'Lino',
        age: 47
    },
    {
        id: 4,
        name: 'Zinedine',
        age: 44
    }
];

let MembersRouter = express.Router();

// Middleware
// app.use((req, res, next) => {
//     next.arguments()
//     console.log('URL : ' + req.url);
// });

app.use(morgan('dev'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
twig = Twig.twig;


app.get('/api/v5/members/all', (req, res) => {
    if (req.query.max != undefined && req.query.max > 0) {
        res.json((functions.success(membres.slice(0, req.query.max))));
    } else if (req.query.max != undefined) {
        res.json(functions.error('Wrong max value'))
    } else {
        res.json((functions.success(membres)));
    }
})

MembersRouter.route('/:id')
    // Récupére un membre avec son id
    .get( (req, res) => {
        let index = getIndex(req.params.id); // Affiche sous format json l'id présent dans l'objet  
        if(typeof(index) == 'string') {
            res.json(functions.error(index));
        } else {
            res.json(functions.success(membres[index]))
        }
    })
 
    .post( (req, res) => {
        
        if (req.body.name) {
            let same = false;
            for (let i = 0; i < membres.length; i++) {
                if(membres[i].name = req.body.name) {
                    res.json(functions.error('name already taken'));
                    same = true;
                    break;
                }
            }
            let membre = {
                id: createID,
                name: req.body.name,
                age: req.body.age
            };
            
            membres.push(membre);
            res.json(functions.success(membre));
        } else {
            res.json(functions.error("Pas de valeurs qu'est ce que tu fou ? "))
        }
    })



    .put( (req, res) => {
        let index = getIndex(req.params.id);

        if (typeof(index) == 'string') {
            res.json(functions.error(index));
        } else {
            let same = false;
            for (let i = 0; i < membres.length; i++) {
                if (req.body.name == membres[i].name && req.params.id != membres[i].id) {
                    same = true;
                    break;
                }
                
            }

            if(same) {
                res.json(functions.error('le même'))
            } else {
                membres[index].name = req.body.name;
                res.json(functions.success(true));
            }
        }
    })

    .delete( (req, res) => {
        let index = getIndex(req.params.id);

        if(typeof(index) == 'string') {
            res.json(functions.error('same name'))
        } else {
            membres.splice(index, 1);
            res.json(functions.success(membres));
        }
    })

app.use(config.rootApi, MembersRouter)

app.listen(config.port, () => {
        console.log('serveur démarré sur le port ' + config.port);
    });

function getIndex(id) {
    for (let i = 0; i < membres.length; i++) {
        if (membres[i].id == id) {
            return i;
        } 
    }
    return 'mauvais id';
}

function createID() {
    return membres[membres.length - 1 ].id + 1;
}