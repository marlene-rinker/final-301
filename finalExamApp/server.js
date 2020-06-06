/* eslint-disable no-trailing-spaces */
'use strict';

//packages
require('dotenv').config();
const express = require('express');
const pg = require('pg');
const superagent = require('superagent');

const app = express();
const PORT = process.env.PORT;

//set up app

app.use(express.static('./public'));
app.set('view engine', 'ejs');
app.use(express.urlencoded( {extended: true}));

//set up pg

const client = new pg.Client(process.env.DATABASE_URL);
client.on('error', console.error);
client.connect();

// routes
app.get('/', getPokemon);
app.post('/add', addPokemon);
app.get('/favorites', showFavorites);

// functions
function Pokemon(obj){
  this.name = obj.name;
}

function getPokemon(req, res){
  const url = 'https://pokeapi.co/api/v2/pokemon/';
  superagent.get(url)
    .query()
    .then(result => {
      const characters = [];
      
      for (let i = 0; i <result.body.results.length; i++){
        let pokemon = new Pokemon(result.body.results[i]);
        characters.push(pokemon.name);
      }
      res.render('pages/searches/show', {arrayOfPokemon : characters.sort()})  
    })

}

function addPokemon(req, res){
  const sqlQuery = 'INSERT INTO pokemon (name) VALUES ($1)';
  const sqlValues = [req.body.pokemon];
  client.query(sqlQuery, sqlValues)
    .then(() => {
      res.redirect('/')
    })
    .catch(error => {
      console.log(error);
    })

}

function showFavorites(req, res){
  const sqlQuery = 'SELECT * FROM pokemon';
  client.query(sqlQuery)
    .then (resultFromSql => {
      res.render('pages/searches/favorites', { list: resultFromSql.rows});
    })
    .catch(error => {
      console.log(error)
    })

}

// start the app
app.listen(PORT, () => console.log(`App is up on PORT:  ${PORT}`));
