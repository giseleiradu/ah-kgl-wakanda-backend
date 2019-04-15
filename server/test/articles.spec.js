import chai from 'chai';
import chaiHttp from 'chai-http';

import app from '../../app';

// Chai configuration
const { expect } = chai;
chai.use(chaiHttp);

const article = {
  title: 'How to train your dragon',
  description: 'Ever wonder how?',
  body: 'It takes a Jacobian',
  Tags: ['dragons', 'training']
};

describe('Article endpoints', () => {
  describe('The endpoint to create an article', () => {
    it('Should create an article', (done) => {
      chai.request(app)
        .post('/api/articles')
        .set('Authorization', 'Bearer <token>')
        .send({ article })
        .end((error, res) => {
          expect(res.body.status).to.be.equal(201);
          expect(res.body).to.have.property('data');
          expect(res.body.data).to.have.property('article');
          expect(res.body.data.article).to.have.property('title');
          expect(res.body.data.article.title).equals('How to train your dragon');
          chai.slug = res.body.data.article.slug;
        });
      done();
    });

    it('Should return a validation error', (done) => {
      chai.request(app)
        .post('/api/articles')
        .set('Authorization', 'Bearer <token>')
        .send({ bad: 'request' })
        .end((error, res) => {
          expect(res.body.status).to.be.equal(400);
          expect(res.body.message).equals('bad is not allowed');
        });
      done();
    });
  });

  describe('The endpoint to get articles', () => {
    it('Should get articles', (done) => {
      chai.request(app)
        .get('/api/articles')
        .set('Authorization', 'Bearer <token>')
        .send({ article })
        .end((error, res) => {
          expect(res.body.status).to.be.equal(200);
          expect(res.body).to.have.property('data');
          expect(res.body.data).to.have.property('articles');
          expect(res.body.data.articles).to.be.an('array');
        });
      done();
    });
  });

  describe('The endpoint to get a single article', () => {
    it('Should get a single article ', (done) => {
      chai.request(app)
        .post('/api/articles')
        .set('Authorization', 'Bearer <token>')
        .send({ article })
        .end((e, response) => {
          const { slug } = response.body.data.article;

          chai.request(app)
            .get(`/api/articles/${slug}`)
            .set('Authorization', 'Bearer <token>')
            .send({ article })
            .end((error, res) => {
              expect(res.body.status).to.be.equal(200);
              expect(res.body).to.have.property('data');
              expect(res.body.data).to.have.property('article');
              expect(res.body.data.article).to.be.an('object');
            });
          done();
        });
    });
  });

  describe('The endpoint to update an article', () => {
    it('Should update an article ', (done) => {
      chai.request(app)
        .post('/api/articles')
        .send({ article })
        .set('Authorization', 'Bearer <token>')
        .end((e, response) => {
          const { slug } = response.body.data.article;

          chai.request(app)
            .put(`/api/articles/${slug}`)
            .set('Authorization', 'Bearer <token>')
            .send({ article: { title: 'new title' } })
            .end((error, res) => {
              expect(res.body.status).to.be.equal(200);
              expect(res.body).to.have.property('data');
              expect(res.body.data).to.have.property('article');
              expect(res.body.data.article).to.be.an('object');
              expect(res.body.data.article.title).equals('new title');
            });
        });
      done();
    });

    it('Should fail to update an article ', (done) => {
      chai.request(app)
        .put('/api/articles/wrong-slug')
        .set('Authorization', 'Bearer <token>')
        .send({ article: { title: 'My article', description: 'new description' } })
        .end((error, res) => {
          expect(res.body.status).to.be.equal(404);
          expect(res.body).to.have.property('message');
          expect(res.body.message).to.equals('Article not found');
        });
      done();
    });
  });

  describe('The endpoint to delete an article', () => {
    it('Should delete an article ', (done) => {
      chai.request(app)
        .post('/api/articles')
        .send({ article })
        .set('Authorization', 'Bearer <token>')
        .end((e, response) => {
          const { slug } = response.body.data.article;

          chai.request(app)
            .delete(`/api/articles/${slug}`)
            .set('Authorization', 'Bearer <token>')
            .end((error, res) => {
              expect(res.body.status).to.be.equal(200);
              expect(res.body.message).to.equals('Article successfully deleted');
            });
          done();
        });
    });

    it('Should fail to delete an article ', (done) => {
      chai.request(app)
        .delete('/api/articles/wrong-slug')
        .set('Authorization', 'Bearer <token>')
        .end((error, res) => {
          expect(res.body.status).to.be.equal(404);
          expect(res.body.message).to.equals('Article not found');
        });
      done();
    });
  });
});