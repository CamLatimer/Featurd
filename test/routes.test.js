require('dotenv').load();

const chai = require('chai');
const expect = chai.expect;
const axios = require('axios');
const chaiHTTP = require('chai-http');
const app = require('../index').app;
const spotify = require('../spotify');

chai.use(chaiHTTP);


describe('Routes', function() {

    before(async function() {
      // runs before all tests in this block

      // authenticate with spotify
      await spotify.setAuth();
    });

    it(`'/' should return the homepage`, function(done) {
      chai.request(app)
        .get('/')
        .end(function(err, res) {
          expect(err).to.be.null;
          expect(res).to.be.html;
          expect(res).to.have.status(200);
          done();
        });
    })

    it('/search/:artistName', function(done) {

      chai.request(app)
        .get('/search/Frank+Ocean')
          .end(function(err, res) {
            expect(err).to.be.null;
            expect(res.body.status).to.equal(200);
            done();
          });

    })

    it('/features/:artistId', function(done) {

      chai.request(app)
        .get(`/features/3TVXtAsR1Inumwj472S9r4`)
          .end(function(err, res) {
            expect(err).to.be.null;
            expect(res.body.status).to.equal(200);
            done();
          });
    })

    describe('Should handle errors', function() {

      it('Has a bad url', function(done){
        chai.request(app)
          .get(`/searc`)
            .end(function(err, res) {
              expect(res).to.be.json;
              expect(res.error.status).to.equal(404);
              done();
            });
      })

    })

});
