// ********************** Initialize server **********************************

const server = require('../index.js'); //TODO: Make sure the path to your index.js is correctly added

// ********************** Import Libraries ***********************************

const chai = require('chai'); // Chai HTTP provides an interface for live integration testing of the API's.
const chaiHttp = require('chai-http');
chai.should();
chai.use(chaiHttp);
const {assert, expect} = chai;

// ********************** DEFAULT WELCOME TESTCASE ****************************

describe('Server!', () => {
  // Sample test case given to test / endpoint.
  it('Returns the default welcome message', done => {
    chai
      .request(server)
      .get('/welcome')
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body.status).to.equals('success');
        assert.strictEqual(res.body.message, 'Welcome!');
        done();
      });
  });
});

// *********************** TODO: WRITE 2 UNIT TESTCASES **************************

describe('Testing Register API', () => {
    it('positive : /register', done => {
      chai
        .request(server)
        .post('/register')
        .send({username: 'John', password: '2020'})
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body.message).to.equals('Success');
          done();
        });
    });

    it('Negative : /register. Checking invalid name', done => {
    chai
      .request(server)
      .post('/register')
      .send({username: 20, password: '2020'})
      .end((err, res) => {
        expect(res).to.have.status(400);
        expect(res.body.message).to.equals('Invalid input');
        done();
      });
    });
});
// ******************** TODO: WRITE ADDITIONAL 2 UNIT TESTCASES ********************

describe('Testing Login API', () => {
  it('positive : /login', done => {
    chai
      // register user
      .request(server)
      .post('/login')
      .send({username: 'John', password: '2020'})


      // check log-in credentials
      .request(server)
      .post('/login')
      .send({username: 'John', password: '2020'})
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body.message).to.equals('Success');
        done();
      });
  });

  it('Negative : /login. Checking invalid username or password.', done => {
  chai
    .request(server)
    .post('/login')
    .send({username: 20, password: '2020'})
    .end((err, res) => {
      expect(res).to.have.status(400);
      expect(res.body.message).to.equals('Invalid input');
      done();
    });
  });
});