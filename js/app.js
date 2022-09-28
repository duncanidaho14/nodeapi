require('@babel/register');
const mysql = require('mysql')
const Twig = require('twig');
const bodyParser = require("body-parser");
const express = require('express');
const PORT = 8080;
const morgan = require('morgan');
const config = require('../config.json');
let functions = require('./functions/functions');


const db = mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: '',
    database : 'nodejs'
})

// Middleware
// app.use((req, res, next) => {
//     next.arguments()
//     console.log('URL : ' + req.url);
// });

db.connect((err) => {
    
    if (err) {
        console.log(err.message)
    } else {
        const app = express();
        let MembersRouter = express.Router();

        app.use(morgan('dev'));
        app.use(bodyParser.urlencoded({ extended: false }));
        app.use(bodyParser.json());
        twig = Twig.twig;

        console.log('Connect to mysql')

        MembersRouter.route('/')

            //Récupère tous les membres
            .get((req, res) => {
                if(req.query.max != undefined && req.query.max > 0) {
                    db.query('SELECT * FROM members LIMIT 0, ?', [req.query.max], (err, result) => {
                        if(err) {
                            res.json(functions.error(err.message))
                        } else {
                            res.json(functions.success(result))
                        }
                    })
                    
                } else if (req.query.max != undefined) {
                    res.json(functions.error('Wrong max value'))
                } else {
                    db.query('SELECT * FROM members', (err, result) => {
                        if(err) {
                            res.json(functions.error(err.message))
                        } else {
                            res.json(functions.success(result))
                        }
                    })
                }
            })

        MembersRouter.route('/:id')
            // Récupére un membre avec son id
            .get( (req, res) => {
                db.query('SELECT * FROM members WHERE id=?', [req.params.id], (err, result) => {
                    if(err) {
                        res.json(functions.error(err.message))
                    } else {
                        if(result[0] != undefined) {
                            res.json( functions.success(result))
                        } else {
                            res.json(functions.error('wrong id value'))
                        }
                    }
                })
            })
        
            .post( (req, res) => {
                
                if (req.body.name) {
                    db.query('SELECT * FROM members WHERE name=? AND email=? AND age=?', [req.body.name, req.body.email, req.body.age], (err, result) => {
                        if (err) {
                            res.json(functions.error('name already taken'))
                        } else {
                            if(result[0] != undefined) {
                                res.json(functions.error('name already taken'))
                            } else {
                                db.query('INSERT INTO members(name, email, age) VALUES(?, ?, ?)', [req.body.name, req.body.email, req.body.age], (err, result) => {
                                    if (err) {
                                        res.json(functions.error(err.message))
                                    } else {
                                        db.query('SELECT * FROM members WHERE name=?', [req.body.name, req.body.email, req.body.age], (err, result) => {
                                            if(err) {
                                                res.json(functions.error(err.message))
                                            } else {
                                                res.json(functions.success({
                                                    id: result[0].id,
                                                    name: result[0].name
                                                }))
                                            }
                                        })
                                    }
                                })
                            }
                        }
                    })
                } else {
                    res.json(functions.error("Pas de valeurs qu'est ce que tu fou ? "))
                }
            })

            .put( (req, res) => {

                if (req.body.name) {
                    db.query('SELECT * FROM members WHERE id=?', [req.params.id], (err, result) => {
                        if (err) {
                            res.json(functions.error(err.message))
                        } else {
                            if (result[0] != undefined) {
                                db.query('SELECT * FROM members WHERE name=? AND id != ?', [req.body.name, req.params.id], (err, result) => {
                                   if (err) {
                                        res.json(functions.error(err.message))
                                   } else {
                                        if (result[0] != undefined) {
                                            res.json(functions.error('kiff kiff'))
                                        } else {
                                            db.query('UPDATE members SET name=?, email=?, age=? WHERE id=?', [req.body.name, req.body.email, req.body.age, req.params.id], (err, result) => {
                                                if (err) {
                                                    res.json(functions.error(err.message))
                                                } else {
                                                    res.json(functions.success(true))
                                                }
                                            })
                                        }
                                   }
                                })
                            } else {
                                res.json(functions.error('Mauvais id'))
                            }
                        }
                    })
                } else {
                    res.json(functions.error('pas de nom de valeur bordel'))
                }
                
            })

            .delete( (req, res) => {
                db.query('SELECT * FROM members WHERE id=?', [req.params.id], (err, result) => {
                    if(err) {
                        res.json(functions.error(err.message))
                    } else {
                        if(result[0] != undefined) {
                            db.query('DELETE FROM members WHERE id=?', [req.params.id], (err, result) => {
                                if(err) {
                                    res.json(functions.error(err.message))
                                } else {
                                    res.json(functions.success(true))
                                }
                            })
                        } else {
                            res.json(functions.error('wrong id value'))
                        }
                    }
                })
            })

            app.use(config.rootApi, MembersRouter)

    app.listen(config.port, () => {
        console.log('serveur démarré sur le port ' + config.port);
    });

    // app.get('/index', (req, res) => {
    //     res.sendFile(__dirname+'/../public/index.html')
    // })
    }    
})



