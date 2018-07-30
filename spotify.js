require('dotenv').load();

const express = require('express');
const app = express();
const router = express.Router();
const axios = require('axios');
const queryString = require('querystring');
const client_id = process.env.SPOTIFY_CLIENT_ID;
const client_secret = process.env.SPOTIFY_CLIENT_SECRET;

// set options for first call to spotify to get auth token
const authOpts = {
  method: 'post',
  baseURL: `https://accounts.spotify.com/api/token`,
  headers: {
      'Authorization': 'Basic ' + new Buffer(client_id + ':' + client_secret).toString('base64'),
      'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'},
      data: 'grant_type=client_credentials'
};

// set base options for subsequent spotify api calls
let baseOpts = {
      method: 'get',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
};


function setAuth(){
  return new Promise((resolve, reject) => {
    axios(authOpts)
      .then((res) => {
        baseOpts.headers.Authorization = `Bearer ${res.data.access_token}`;
        resolve(baseOpts.headers.Authorization);
      })
      .catch((err) => {
        reject(err);
      })
  })
}

// initial user search for artists
function searchArtists(req, res, next){


  let opts = baseOpts;
  let url = `https://api.spotify.com/v1/search?q=${req.params.artistName}&type=artist`;
  opts.url = url;

  function lookupArtists(){
    axios(opts)
      .then((response) => {
        res.json(response.data);
      }).catch((err) => {
        console.log(err.message + ' from searchArtists');
        if(err.status === 401 || 400){
          setAuth().then(() => {
            lookupArtists();
          })
        } else {
          next(err);
        }
      });
  }

  lookupArtists();

}

// find selected artist's collaborators
function getFeatures(req, res, next){

  let opts = baseOpts;
  opts.url = `https://api.spotify.com/v1/search?q=${req.params.artistName}&type=track`;

  function lookupFeatures(){
    axios(opts)
      .then((response) => {
        res.json(response.data);
      }).catch((err) => {
        console.log(err.message + ' from searchArtists');
        if(err.status === 401 || 400){
          setAuth().then(() => {
            lookupArtists();
          })
        } else {
          next(err);
        }
      });
  }

  lookupFeatures();
}


module.exports = {
  authOpts,
  baseOpts,
  setAuth,
  searchArtists,
  getFeatures
};
