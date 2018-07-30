require('dotenv').load();

const chai = require('chai');
const expect = chai.expect;
const chaiHTTP = require('chai-http');
const app = require('../index').app;
const spotify = require('../spotify');

chai.use(chaiHTTP);

describe('Auth', function() {

  it('setAuth() should return a bearer token', function(done) {

  spotify.setAuth()
    .then((token) => {
      expect(spotify.baseOpts.headers.Authorization).to.not.be.undefined;
      done();
    })
    .catch((err) => {
      done();
    })

  })

  it('Should still get 200 status with wrong/expired token', function(done){
    spotify.baseOpts.headers.Authorization = '12345678910abcd';
    chai.request(app)
      .get('/search/Frank+Ocean')
        .end(function(err, res) {
          expect(err).to.be.null;
          expect(res).to.be.json;
          expect(res).to.have.status(200);
          done();
        });
  })

});
