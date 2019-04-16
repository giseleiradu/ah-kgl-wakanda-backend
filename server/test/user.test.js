import chai from 'chai';
import chaiHttp from 'chai-http';
import Database from './config';
import dummyUsers from './config/users';
import app from '../../app';

const { expect } = chai;
chai.use(chaiHttp);


describe('User ', () => {
  before(async () => {
    try {
      await Database.testDbConnection();
    } catch (error) {
      console.log('>>>>>># Connection Error', error);
    }
  });

  after(async () => {
    try {
      await Database.truncateUser();
    } catch (error) {
      console.log('>>>>>># Truncate Error', error);
    }
  });

  describe('when signing up a new user', () => {
    it('should not create a new user when username is missing', (done) => {
      chai.request(app)
        .post('/api/auth/signup')
        .send(dummyUsers.withoutUsername)
        .end((err, res) => {
          expect(res.status).to.equal(400);
          expect(res).to.be.an('object');
          done();
        });
    });

    it('should not create a new user when email is missing', (done) => {
      chai.request(app)
        .post('/api/auth/signup')
        .send(dummyUsers.withoutEmail)
        .end((err, res) => {
          expect(res.status).to.equal(400);
          expect(res.body.message).to.equal('email is required');
          expect(res).to.be.an('object');
          done();
        });
    });

    it('should not create a new user when email have bad email format', (done) => {
      chai.request(app)
        .post('/api/auth/signup')
        .send(dummyUsers.wrongEmailFormat)
        .end((err, res) => {
          expect(res.status).to.equal(400);
          expect(res.body.message).to.equal('email must be a valid email');
          expect(res).to.be.an('object');
          done();
        });
    });

    it('should not create a new user when password doesnt fill requirement', (done) => {
      chai.request(app)
        .post('/api/auth/signup')
        .send(dummyUsers.wrongPasswordFormat)
        .end((err, res) => {
          expect(res.status).to.equal(400);
          expect(res.body.message).to.equal('Your password must have at least 6 digits and contain 1 Uppercase, 1 Lowercase, 1 number');
          expect(res).to.be.an('object');
          done();
        });
    });

    it('should be able to signup', (done) => {
      chai.request(app)
        .post('/api/auth/signup')
        .send(dummyUsers.correct)
        .end((err, res) => {
          expect(res.status).to.equal(200);
          expect(res).to.be.an('object');
          expect(res.body).to.have.property('user');
          done();
        });
    });
  });

  describe('when logging a new user', () => {
    it('should not log in the user if credential are wrong', (done) => {
      chai.request(app)
        .post('/api/auth/login')
        .send(dummyUsers.wrongLogInfo)
        .end((err, res) => {
          expect(res.status).to.equal(401);
          expect(res).to.be.an('object');
          expect(res.body.message).to.equal('The credentials you provided is incorrect');
          done();
        });
    });

    it('should be able to login', (done) => {
      chai.request(app)
        .post('/api/auth/login')
        .send(dummyUsers.correctLogInfo)
        .end((err, res) => {
          expect(res.status).to.equal(200);
          expect(res).to.be.an('object');
          expect(res.body).to.have.property('user');
          done();
        });
    });
  });
});
