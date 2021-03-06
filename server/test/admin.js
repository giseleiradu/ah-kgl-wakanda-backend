import chai from 'chai';
import chaiHttp from 'chai-http';
import app from '../../app';
import dummyUsers from './config/users';

// Chai configuration
const { expect } = chai;
chai.use(chaiHttp);

let adminToken;

describe('Admin', () => {
  describe('signin the admin', () => {
    it('should login the admin', (done) => {
      chai.request(app)
        .post('/api/auth/login')
        .send({
          email: 'hadadus@gmail.com',
          password: 'My_password12',
        })
        .end((err, res) => {
          adminToken = `Bearer ${res.body.user.token}`;
          done();
        });
    });
  });
  describe('when creating a user', () => {
    it('should not succeed without firstname and lastname', (done) => {
      chai.request(app)
        .post('/api/admin/account')
        .send(dummyUsers.adminCreateWithoutFnameLname)
        .end((err, res) => {
          expect(res.status).to.equal(400);
          expect(res.body.message[0]).to.equal('firstname is required');
          expect(res.body.message[1]).to.equal('lastname is required');
          done();
        });
    });
    it('should not succeed with an existing username', (done) => {
      chai.request(app)
        .post('/api/admin/account')
        .set('Authorization', adminToken)
        .send(dummyUsers.adminCreateWrongUsername)
        .end((err, res) => {
          expect(res.status).to.equal(400);
          expect(res.body.message).to.equal('username must be unique');
          done();
        });
    });
    it('should create a user successfully', (done) => {
      chai.request(app)
        .post('/api/admin/account')
        .set('Authorization', adminToken)
        .send(dummyUsers.adminCreateUser)
        .end((err, res) => {
          expect(res.status).to.equal(200);
          expect(res.body.message).to.equal(`An email has been sent to ${dummyUsers.adminCreateUser.email} for verification`);
          done();
        });
    });
  });
  describe('when updating a user', () => {
    it('should not succeed when user is not found', (done) => {
      chai.request(app)
        .put('/api/admin/account/papbita')
        .set('Authorization', adminToken)
        .send(dummyUsers.adminUpdate)
        .end((err, res) => {
          expect(res.status).to.equal(404);
          expect(res.body.message).to.equal('User not found');
          done();
        });
    });
    it('should not succeed when changed email to an existing one', (done) => {
      chai.request(app)
        .put('/api/admin/account/hadadus')
        .set('Authorization', adminToken)
        .send(dummyUsers.adminUpdateWrongEmail)
        .end((err, res) => {
          expect(res.status).to.equal(409);
          expect(res.body.message).to.equal('Email already exists');
          done();
        });
    });
    it('should not succeed when image url is not an valid url', (done) => {
      chai.request(app)
        .put('/api/admin/account/dusmel111')
        .set('Authorization', adminToken)
        .send(dummyUsers.adminUpdateWrongImageurl)
        .end((err, res) => {
          expect(res.status).to.equal(400);
          expect(res.body.message[0]).to.equal('image must be a valid uri');
          done();
        });
    });
    it('should update the user when changing the email', (done) => {
      chai.request(app)
        .put('/api/admin/account/hadadus')
        .set('Authorization', adminToken)
        .send(dummyUsers.adminUpdate)
        .end((err, res) => {
          expect(res.status).to.equal(200);
          expect(res.body.user).to.be.an('object');
          expect(res.body.message).to.equal('A token has been sent to the new email (hadad.bwenge@andela.com) for verification');
          done();
        });
    });
    it('should update the user', (done) => {
      chai.request(app)
        .put('/api/admin/account/hadadus')
        .set('Authorization', adminToken)
        .send(dummyUsers.adminUpdateSameEmail)
        .end((err, res) => {
          expect(res.status).to.equal(200);
          expect(res.body.user).to.be.an('object');
          done();
        });
    });
  });
  describe('when deleting a user', () => {
    it('should not succeed when user is not found', (done) => {
      chai.request(app)
        .delete('/api/admin/account/papbita')
        .set('Authorization', adminToken)
        .send(dummyUsers.adminUpdate)
        .end((err, res) => {
          expect(res.status).to.equal(404);
          expect(res.body.message).to.equal('User not found');
          done();
        });
    });
    it('should succeed when deleting a user', (done) => {
      chai.request(app)
        .delete('/api/admin/account/hadadus')
        .set('Authorization', adminToken)
        .send(dummyUsers.adminUpdate)
        .end((err, res) => {
          expect(res.status).to.equal(200);
          expect(res.body.message).to.equal('User hadadus has been disabled');
          done();
        });
    });
    it('should not login disabled users', (done) => {
      chai.request(app)
        .post('/api/auth/login')
        .send({
          email: 'hadadus2@gmail.com',
          password: process.env.USER_PASSWORD,
        })
        .end((err, res) => {
          expect(res.status).to.equal(403);
          expect(res.body.message).to.equal('This account has been disabled');
          done();
        });
    });
  });
  describe('when making a user an admin', () => {
    it('should not succeed when user is not found', (done) => {
      chai.request(app)
        .post('/api/admin/account/papbita/isadmin')
        .set('Authorization', adminToken)
        .end((err, res) => {
          expect(res.status).to.equal(404);
          expect(res.body.message).to.equal('User not found');
          done();
        });
    });
    it('should succeed making a user an admin', (done) => {
      chai.request(app)
        .post('/api/admin/account/hadadus1/isadmin')
        .set('Authorization', adminToken)
        .end((err, res) => {
          expect(res.status).to.equal(200);
          expect(res.body.message).to.equal('hadadus1 is now an admin');
          done();
        });
    });
    it('should not succeed when user is already an admin', (done) => {
      chai.request(app)
        .post('/api/admin/account/hadadus1/isadmin')
        .set('Authorization', adminToken)
        .end((err, res) => {
          expect(res.status).to.equal(400);
          expect(res.body.message).to.equal('hadadus1 is already an admin');
          done();
        });
    });
  });
  describe('when making an admin a normal user', () => {
    it('should not succeed when user is not found', (done) => {
      chai.request(app)
        .delete('/api/admin/account/papbita/isadmin')
        .set('Authorization', adminToken)
        .end((err, res) => {
          expect(res.status).to.equal(404);
          expect(res.body.message).to.equal('User not found');
          done();
        });
    });
    it('should succeed making an admin a normal user', (done) => {
      chai.request(app)
        .delete('/api/admin/account/hadadus1/isadmin')
        .set('Authorization', adminToken)
        .end((err, res) => {
          expect(res.status).to.equal(200);
          expect(res.body.message).to.equal('hadadus1 is now a normal user');
          done();
        });
    });
    it('should not succeed when user is already an admin', (done) => {
      chai.request(app)
        .delete('/api/admin/account/hadadus1/isadmin')
        .set('Authorization', adminToken)
        .end((err, res) => {
          expect(res.status).to.equal(400);
          expect(res.body.message).to.equal('hadadus1 is already a normal user');
          done();
        });
    });
  });
});
