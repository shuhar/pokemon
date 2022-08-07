
var express = require('express');
var bodyParser = require('body-parser')
var app = express();

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
// parse application/json
app.use(bodyParser.json());
 

const fetch = require('node-fetch');
const router = express.Router();
const PORT= 8080;

let api = "https://raw.githubusercontent.com/Biuni/PokemonGO-Pokedex/master/pokedex.json";
let pokemons = [{}];
fetchPokemon(api);

// returns list of pokemon names || returns image, element type, spawn chance
app.get(`/`, async (req, res) => {
  let pokemonNames = [{}];
  let pokemonNameURL = req.query.pokemonName;
  if(!pokemonNameURL){
    pokemonNames = pokemons.map( pokemon =>{
      return {"name":pokemon.name};
      })
    res.send(pokemonNames)
  }else{
    try{
    let pokemon = pokemons.find(pokemon => pokemon.name === pokemonNameURL);
       res.send( {
        "img":pokemon.img,
        "type": pokemon.type,
        "name":pokemon.name,
        "spawn_chance":pokemon.spawn_chance
      });
    }catch(error){
      res.end("pokemonName not found!");
    }
  }  
});

//returns all pokemons that are WEEK to those element type
app.get(`/weak`, async (req, res) => {
  let typeNameURL = req.query.typeName;
  try{
    pokemonsWeak = pokemons.filter(pokemon => pokemon.weaknesses.includes(typeNameURL) )
       res.send({
        pokemonsWeak
      });
    }catch(error){
      res.end("pokemon not found!");
      console.log(error);
    }
});


// returns all pokemons that are STRONG to those element type
app.get(`/strong`, async (req, res) => {
    let typeNameURL = req.query.typeName;

    try{
      pokemonsWeak = pokemons.filter(pokemon => !pokemon.weaknesses.includes(typeNameURL) )
        res.send({
          pokemonsWeak
        });
      }catch(error){
        res.end("pokemon not found!");
        console.log(error);
      }
});

// returns win / draw / lose
app.post(`/figth/`, async ( req,res) => {
    let message=[];
    let error=false;
    let mypokemonName = req.body.myPokemon;
    let enemypokemonName = req.body.enemyPokemon;
    if( !enemypokemonName){
      error=true;
      message.push({msg1:"please enter enemy pokemon!"});
    }
    if( !mypokemonName){
      error=true;
      message.push({msg:"please enter pokemon!"});
    }
    if(mypokemonName && enemypokemonName){
      let myPokemon= pokemons.find(p => p.name === mypokemonName);
      let enemyPokemon= pokemons.find(p => p.name === enemypokemonName);
      if(!myPokemon){
        error=true;
        message.push({msg:"pokemon not found!"});
      }
      if(!enemyPokemon){
        error=true;
        message.push({msg1:"enemypokemon not found!"});
      }
      if(myPokemon && enemyPokemon){
        if(equalsIgnoreOrder(myPokemon.weaknesses,enemyPokemon.weaknesses)){
          return res.end(JSON.stringify({
            result:"draw"
          }))
        }
        let win=0;
        let lose=0;
        myPokemon.type.forEach(t => {
            if(enemyPokemon.weaknesses.includes(t)){
              win++;
            }
        });

        myPokemon.weaknesses.forEach(w => {
          if(enemyPokemon.type.includes(w)){
            lose++;
          }
      });
      if(win>lose){
        return res.end(JSON.stringify({
          result:"win"
        })) 
      }else{
        return res.end(JSON.stringify({
          result:"lose"
        }))
      }
    }
  }
  if (error){
      return res.end(JSON.stringify(message))
  }
});


// fetch pokemons list 
function fetchPokemon(api){
  fetch(api)
  .then(function(res) {
      return res.json()
  })
  .then(function(json) {
    pokemons = json.pokemon;
  });
}
// function to compare weaknesses 
function equalsIgnoreOrder (a, b) {
  if (a.length !== b.length) return false;
  const uniqueValues = new Set([...a, ...b]);
  for (const v of uniqueValues) {
    const aCount = a.filter(e => e === v).length;
    const bCount = b.filter(e => e === v).length;
    if (aCount !== bCount) return false;
  }
  return true;
}

app.listen(PORT, () => console.log(`Server runnin on port ${PORT}`));
