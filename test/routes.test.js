require('dotenv').load();

const chai = require('chai');
const expect = chai.expect;
const chaiHTTP = require('chai-http');
const app = require('../index.js');

chai.use(chaiHTTP);

describe('Routes', function(){
  describe('Rendering Views', function(){
    it(`'/' should return the homepage`, function(done){
      chai.request(app)
        .get('/')
        .end(function(err, res){
          expect(err).to.be.null;
          expect(res).to.be.html;
          expect(res).to.have.status(200);
          done();
        });
    })
  })
});
