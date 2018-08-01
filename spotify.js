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

// authenticate with spotify
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
  let url = `https://api.spotify.com/v1/search?q=${req.params.artistName}&type=artist&limit=50`;

  let artistItems = [];

  lookupArtists(url);


  function lookupArtists(searchUrl){

    opts.url = searchUrl;

    axios(opts)
      .then((response) => {
        if(response.data.artists.items.length === 0){
          let err = new Error('oops! No artists matched your search');
          next(err);
        } else {
            artistItems = artistItems.concat(response.data.artists.items);
            if(response.data.artists.next === null) {
              res.json({status: response.status, artists: artistItems});
            } else {
              lookupArtists(response.data.artists.next);
            }
          }
      }).catch((err) => {
        let error = err.response.data.error;
        reset(error, lookupArtists, url, next);
      });
  }

}

// find selected artist's collaborators
function getFeatures(req, res, next){

  let opts = baseOpts;
  url = `https://api.spotify.com/v1/artists/${req.params.artistId}/albums?include_groups=appears_on&limit=50&market=US`;
  let albums = [];
  lookupFeatures(url);

  function lookupFeatures(searchUrl){

    opts.url = searchUrl;

    axios(opts)
      .then((response) => {
        if(response.data.items.length === 0){
          let err = new Error('oops! No artists matched your search');
          next(err);
        } else {
            albums = albums.concat(response.data.items);
            if(response.data.next === null) {
              res.json({status: response.status, albums: albums});
            } else {
              lookupFeatures(response.data.next);
            }
          }
      }).catch((err) => {
        let error = err.response.data.error;
        reset(error, lookupFeatures, searchUrl, next)
      });
  }
}

// re-authenticate with spotify if token was expired/invalid
function reset(err, ogCall, url, nextFunc){
  if(err.message === 'Only valid bearer authentication supported'){
    setAuth().then(() => {
      ogCall(url);
    }).catch((err) => {
      nextFunc(err);
    });
  } else {
    console.log(err);
    nextFunc(err);
  }
}

module.exports = {
  authOpts,
  baseOpts,
  setAuth,
  searchArtists,
  getFeatures
};
