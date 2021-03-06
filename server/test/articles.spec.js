import chai from 'chai';
import chaiHttp from 'chai-http';
import { Article } from '../models';
import readTime from '../helpers/readTime';

import app from '../../app';
import Articles from '../controllers/articles';

// Chai configuration
const { expect } = chai;
chai.use(chaiHttp);

const article = {
  title: 'How to train your dragon',
  description: 'Ever wonder how?',
  body: 'It takes a Jacobian',
  Tags: ['dragons', 'training']
};

const badArticle = {
  title: 'How to train your dragon',
  description: 'Ever wonder how?',
  body: 'It takes a Jacobian',
  images: ['image.jpg'],
  Tags: ['dragons', 'training']
};

const user = [{
  username: 'vera',
  email: 'vera.iradu@andela.com',
  password: 'Hadad12@'
},
{
  email: 'vera.iradu@andela.com',
  password: 'Hadad12@'
}];

let userToken;
const slug = ['how-to-train-your-dragon', 'how-to-train-your-cat'];
let slug1;

const lorem = 'Lorem ipsum dolor sit amet'.repeat(100);
const title = 'How to train your dog';
const author = 'mutombo';
const keyword = 'Ever wonder how';
const tags = {
  cat: 'cat',
  dog: 'dog'
};

after(() => {
  Article.destroy({ truncate: { cascade: true } });
});

describe('Signing up a new user', () => {
  it('should be able to signup', (done) => {
    chai.request(app)
      .post('/api/auth/signup')
      .send(user[0])
      .end((err, res) => {
        userToken = `Bearer ${res.body.user.token}`;
        expect(res.status).to.equal(200);
        expect(res).to.be.an('object');
        expect(res.body).to.have.property('user');
        done();
      });
  });
});

describe('Article endpoints', () => {
  describe('The endpoint to create an article', () => {
    it('Should create an article', (done) => {
      chai.request(app)
        .post('/api/articles')
        .set('Authorization', userToken)
        .send({ article })
        .end((error, res) => {
          slug1 = res.body.data.article.slug;
          expect(res.body.status).to.be.equal(201);
          expect(res.body).to.have.property('data');
          expect(res.body.data).to.have.property('article');
          expect(res.body.data.article).to.have.property('title');
          expect(res.body.data.article.title).equals('How to train your dragon');
          done();
        });
    });

    it('Should return a sequelize validation error', (done) => {
      chai.request(app)
        .post('/api/articles')
        .set('Authorization', userToken)
        .send({ article: badArticle })
        .end((error, res) => {
          expect(res.body.status).to.be.equal(400);
          expect(res.body.message).to.equals('Validation error: Validation is on images failed');
          done();
        });
    });

    it('Should return a validation error', (done) => {
      chai.request(app)
        .post('/api/articles')
        .set('Authorization', userToken)
        .send({ bad: 'request' })
        .end((error, res) => {
          expect(res.body.status).to.be.equal(400);
          expect(res.body.message).equals('bad is not allowed');
          done();
        });
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
          done();
        });
    });

    it('Should return offset must be a number', (done) => {
      chai.request(app)
        .get('/api/articles?offset=')
        .set('Authorization', 'Bearer <token>')
        .send({ article })
        .end((error, res) => {
          expect(res.status).to.be.equal(400);
          expect(res.status).to.be.a('number');
          expect(res.body).to.be.an('object');
          expect(res.body).to.have.property('message');
          expect(res.body.message).to.be.a('string');
          expect(res.body.message).equals('offset must be a number');
          done();
        });
    });

    it('Should return offset must be an integer', (done) => {
      chai.request(app)
        .get('/api/articles?offset=1.2')
        .set('Authorization', 'Bearer <token>')
        .send({ article })
        .end((error, res) => {
          expect(res.status).to.be.equal(400);
          expect(res.status).to.be.a('number');
          expect(res.body).to.be.an('object');
          expect(res.body).to.have.property('message');
          expect(res.body.message).to.be.a('string');
          expect(res.body.message).equals('offset must be an integer');
          done();
        });
    });

    it('Should validate offset minimum', (done) => {
      chai.request(app)
        .get('/api/articles?offset=-1')
        .set('Authorization', 'Bearer <token>')
        .send({ article })
        .end((error, res) => {
          expect(res.status).to.be.equal(400);
          expect(res.status).to.be.a('number');
          expect(res.body).to.be.an('object');
          expect(res.body).to.have.property('message');
          expect(res.body.message).to.be.a('string');
          expect(res.body.message).equals('offset must be larger than or equal to 0');
          done();
        });
    });

    it('Should return limit must be a number', (done) => {
      chai.request(app)
        .get('/api/articles?limit=')
        .set('Authorization', 'Bearer <token>')
        .send({ article })
        .end((error, res) => {
          expect(res.status).to.be.equal(400);
          expect(res.status).to.be.a('number');
          expect(res.body).to.be.an('object');
          expect(res.body).to.have.property('message');
          expect(res.body.message).to.be.a('string');
          expect(res.body.message).equals('limit must be a number');
          done();
        });
    });

    it('Should return limit must be an integer', (done) => {
      chai.request(app)
        .get('/api/articles?limit=1.2')
        .set('Authorization', 'Bearer <token>')
        .send({ article })
        .end((error, res) => {
          expect(res.status).to.be.equal(400);
          expect(res.status).to.be.a('number');
          expect(res.body).to.be.an('object');
          expect(res.body).to.have.property('message');
          expect(res.body.message).to.be.a('string');
          expect(res.body.message).equals('limit must be an integer');
          done();
        });
    });

    it('Should validate limit minimum', (done) => {
      chai.request(app)
        .get('/api/articles?limit=0')
        .set('Authorization', 'Bearer <token>')
        .send({ article })
        .end((error, res) => {
          expect(res.status).to.be.equal(400);
          expect(res.status).to.be.a('number');
          expect(res.body).to.be.an('object');
          expect(res.body).to.have.property('message');
          expect(res.body.message).to.be.a('string');
          expect(res.body.message).equals('limit must be larger than or equal to 1');
          done();
        });
    });

    it('Should validate limit maximum', (done) => {
      chai.request(app)
        .get('/api/articles?limit=40')
        .set('Authorization', 'Bearer <token>')
        .send({ article })
        .end((error, res) => {
          expect(res.status).to.be.equal(400);
          expect(res.status).to.be.a('number');
          expect(res.body).to.be.an('object');
          expect(res.body).to.have.property('message');
          expect(res.body.message).to.be.a('string');
          expect(res.body.message).equals('limit must be less than or equal to 20');
          done();
        });
    });

    it('Should display one article only', (done) => {
      chai.request(app)
        .get('/api/articles?limit=1')
        .set('Authorization', 'Bearer <token>')
        .send({ article })
        .end((error, res) => {
          expect(res.body.status).to.be.equal(200);
          expect(res.body).to.have.property('data');
          expect(res.body.data).to.have.property('articles');
          expect(res.body.data.articles).to.be.an('array');
          expect(res.body.data.articles).lengthOf(1);
          done();
        });
    });
  });

  describe('The endpoint to get a single article', () => {
    it('Should get a single article ', (done) => {
      chai.request(app)
        .get(`/api/articles/${slug1}`)
        .set('Authorization', 'Bearer <token>')
        .send({ article })
        .end((error, res) => {
          expect(res.body.status).to.be.equal(200);
          expect(res.body).to.have.property('data');
          expect(res.body.data).to.have.property('article');
          expect(res.body.data.article).to.be.an('object');
          done();
        });
    });

    it('Should fail to get an article that does not exist ', (done) => {
      chai.request(app)
        .get('/api/articles/wrong_slug')
        .set('Authorization', 'Bearer <token>')
        .send({ article })
        .end((error, res) => {
          expect(res.body.status).to.be.equal(404);
          expect(res.body.message).to.be.equals('Article not found');
          done();
        });
    });

    it('Should return article not found', (done) => {
      chai.request(app)
        .get('/api/articles/slug-doesnt-exist')
        .set('Authorization', 'Bearer <token>')
        .send({ article })
        .end((error, res) => {
          expect(res.body.status).to.be.equal(404);
          expect(res.body).to.have.property('message');
          expect(res.body.message).to.be.an('string');
          expect(res.body.message).to.be.equals('Article not found');
          done();
        });
    });
  });

  describe('The endpoint to get private articles', () => {
    it('Should get private articles ', (done) => {
      chai.request(app)
        .get(`/api/articles/${user[0].username}/private`)
        .end((error, res) => {
          expect(res.body.status).to.be.equal(200);
          expect(res.body).to.have.property('data');
          expect(res.body.data).to.have.property('articles');
          done();
        });
    });

    it('Should fail when the user is not found ', (done) => {
      chai.request(app)
        .get('/api/articles/fake-user/private')
        .end((error, res) => {
          expect(res.body.status).to.be.equal(404);
          expect(res.body.message).to.be.equal('User not found');
          done();
        });
    });
  });

  describe('The endpoint to update an article', () => {
    it('Should update an article ', (done) => {
      chai.request(app)
        .put(`/api/articles/${slug1}`)
        .set('Authorization', userToken)
        .send({ article: { title: 'new title' } })
        .end((error, res) => {
          slug1 = res.body.data.article.slug;
          expect(res.body.status).to.be.equal(200);
          expect(res.body).to.have.property('data');
          expect(res.body.data).to.have.property('article');
          expect(res.body.data.article).to.be.an('object');
          expect(res.body.data.article.title).equals('new title');
          done();
        });
    });
    // Updating an unexisting article

    it('Should fail to update an article ', (done) => {
      chai.request(app)
        .put('/api/articles/wrong-slug')
        .set('Authorization', userToken)
        .send({ article: { title: 'My article', description: 'new description' } })
        .end((error, res) => {
          expect(res.body.status).to.be.equal(404);
          expect(res.body).to.have.property('message');
          expect(res.body.message).to.equals('Article not found');
          done();
        });
    });
  });

  // Bookmarking an article
  describe('Bookmarking', () => {
    // Bookmarking without token

    it('Should not bookmark the article', (done) => {
      chai.request(app)
        .post(`/api/articles/${slug[0]}/bookmark`)
        .send({})
        .end((err, res) => {
          expect(res.status).to.equal(401);
          expect(res.body.message).to.equal('Authorization is missing');
          done();
        });
    });

    // Bookmarking the right article

    it('Should successfully bookmark an article', (done) => {
      chai.request(app)
        .post(`/api/articles/${slug[0]}/bookmark`)
        .set('Content-Type', 'application/json')
        .set('Authorization', userToken)
        .end((err, res) => {
          expect(res.status).to.equal(200);
          expect(res.body.message).to.equal('Successfully bookmarked the article');
          expect(res.body).to.have.property('article');
          expect(res.body.article).to.have.property('slug');
          done();
        });
    });
    // User view of bookmarks

    it('Should allow the user to view all the article bookmarked', (done) => {
      chai.request(app)
        .get('/api/articles/bookmark')
        .set('Content-Type', 'application/json')
        .set('Authorization', userToken)
        .end((err, res) => {
          expect(res.status).to.equal(200);
          expect(res.body).to.have.property('articles').be.an('array');
          done();
        });
    });

    // Should not bookmark the article for the second time

    it('Should not bookmark the article for the second time', (done) => {
      chai.request(app)
        .post(`/api/articles/${slug[0]}/bookmark`)
        .set('Content-Type', 'application/json')
        .set('Authorization', userToken)
        .end((err, res) => {
          expect(res.status).to.equal(400);
          expect(res.body.message).to.equal('The article is already bookmarked');
          done();
        });
    });

    // Test of unfound bookmark

    it('Should not find the article to bookmark', (done) => {
      chai.request(app)
        .post('/api/articles/non-existing-article/bookmark')
        .set('Content-Type', 'application/json')
        .set('Authorization', userToken)
        .end((err, res) => {
          expect(res.status).to.equal(404);
          expect(res.body.message).to.equal('Article is not found.');
          done();
        });
    });

    // Unbookmark the bookmarked article

    it('Should successfully unbookmark the article', (done) => {
      chai.request(app)
        .delete(`/api/articles/${slug[0]}/bookmark`)
        .set('Content-Type', 'application/json')
        .set('Authorization', userToken)
        .end((err, res) => {
          expect(res.status).to.equal(200);
          expect(res.body.message).to.equal('Successfully unbookmarked the article');
          expect(res.body).to.have.property('article');
          done();
        });
    });

    // Unbookmark the unbookmarked article

    it('Should not unbookmark the unbookmarked article', (done) => {
      chai.request(app)
        .delete(`/api/articles/${slug[0]}/bookmark`)
        .set('Content-Type', 'application/json')
        .set('Authorization', userToken)
        .end((err, res) => {
          expect(res.status).to.equal(404);
          expect(res.body.message).to.equal('This article is not bookmarked');
          done();
        });
    });
    it('should not share if the article is not found', (done) => {
      chai.request(app)
        .post(`/api/articles/${slug[2]}/share/facebook`)
        .set('Authorization', userToken)
        .end((error, res) => {
          expect(res.body.status).to.be.equal(404);
          expect(res.body.message).to.equals('We didn\'t find that article would you like to write one?');
          done();
        });
    });
    it('should  share to facebook', (done) => {
      chai.request(app)
        .post(`/api/articles/${slug[0]}-177804958/share/facebook`)
        .set('Authorization', userToken)
        .end((error, res) => {
          expect(res.body.status).to.be.equal(200);
          expect(res.body.message).to.equals('Article shared to facebook');
          done();
        });
    });
    it('should  share to twitter', (done) => {
      chai.request(app)
        .post(`/api/articles/${slug[0]}-177804958/share/twitter`)
        .set('Authorization', userToken)
        .end((error, res) => {
          expect(res.body.status).to.be.equal(200);
          expect(res.body.message).to.equals('Article shared to twitter');
          done();
        });
    });
    it('should  share to mail', (done) => {
      chai.request(app)
        .post(`/api/articles/${slug[0]}-177804958/share/mail`)
        .set('Authorization', userToken)
        .end((error, res) => {
          expect(res.body.status).to.be.equal(200);
          expect(res.body.message).to.equals('Article shared to mail');
          done();
        });
    });
  });
  describe('Deleting', () => {
    describe('The endpoint to delete an article', () => {
      it('Should delete an article ', (done) => {
        chai.request(app)
          .delete(`/api/articles/${slug1}`)
          .set('Authorization', userToken)
          .end((error, res) => {
            expect(res.body.status).to.be.equal(200);
            expect(res.body.message).to.equals('Article successfully deleted');
            done();
          });
      });

      it('Should fail to delete an article ', (done) => {
        chai.request(app)
          .delete('/api/articles/wrong-slug')
          .set('Authorization', userToken)
          .end((error, res) => {
            expect(res.body.status).to.be.equal(404);
            expect(res.body.message).to.equals('Article not found');
            done();
          });
      });
    });
  });

  describe('Sharing', () => {
    it('should not share if the the channel is not the ones predefined', (done) => {
      chai.request(app)
        .post(`/api/articles/${slug[2]}/share/maily`)
        .set('Authorization', userToken)
        .end((error, res) => {
          expect(res.body.status).to.be.equal(400);
          expect(res.body.message).to.equals('channel must be one of facebook twitter mail');
          done();
        });
    });
  });
  describe('Function to get the read time of an article', () => {
    it('Should return the read time', () => {
      expect(readTime).to.be.a('function');
      expect(readTime('', '', '')).to.be.equals('Less than a minute');
      expect(readTime(article.title, article.description, article.body)).to.be.equals('Less than a minute');
      expect(readTime(article.title, article.description, lorem)).to.be.equals('2 min');
    });
  });

  describe('The endpoint for article search', () => {
    describe('Filter by article title', () => {
      it('should search article by title', (done) => {
        chai.request(app)
          .get(`/api/search?title=${title}`)
          .end((error, res) => {
            expect(res.status).to.be.equal(200);
            expect(res.body).to.have.property('data');
            expect(res.body.data).to.have.property('articles');
            done();
          });
      });

      it('should fail if title not provided', (done) => {
        chai.request(app)
          .get('/api/search?title=')
          .end((error, res) => {
            expect(res.status).to.be.equal(400);
            expect(res.body).to.have.property('message');
            expect(res.body.message).to.have.equals('title is not allowed to be empty');
            done();
          });
      });
    });

    describe('Filter by article author', () => {
      it('Should search article by author', (done) => {
        chai.request(app)
          .get(`/api/search?author=${author}`)
          .end((error, res) => {
            expect(res.status).to.be.equal(200);
            expect(res.body).to.have.property('data');
            expect(res.body.data).to.have.property('articles');
            done();
          });
      });

      it('should fail if author not provided', (done) => {
        chai.request(app)
          .get('/api/search?author=')
          .end((error, res) => {
            expect(res.status).to.be.equal(400);
            expect(res.body).to.have.property('message');
            expect(res.body.message).to.have.equals('author is not allowed to be empty');
            done();
          });
      });
    });

    describe('Filter by article keywords', () => {
      it('should search article by keyword', (done) => {
        chai.request(app)
          .get(`/api/search?keyword=${keyword}`)
          .end((error, res) => {
            expect(res.status).to.be.equal(200);
            expect(res.body).to.have.property('data');
            expect(res.body.data).to.have.property('articles');
            done();
          });
      });

      it('should search keyword inside the tagList', (done) => {
        chai.request(app)
          .get('/api/search?keyword=keyword_not_exist')
          .end((error, res) => {
            expect(res.status).to.be.equal(200);
            expect(res.body).to.have.property('data');
            expect(res.body.data).to.have.property('articles');
            done();
          });
      });

      it('should fail if keyword not provided', (done) => {
        chai.request(app)
          .get('/api/search?keyword=')
          .end((error, res) => {
            expect(res.status).to.be.equal(400);
            expect(res.body).to.have.property('message');
            expect(res.body.message).to.have.equals('keyword is not allowed to be empty');
            done();
          });
      });
    });

    describe('Filter by article tags', () => {
      it('should search article by tags = cat', (done) => {
        chai.request(app)
          .get(`/api/search?tag=${tags.cat}`)
          .end((error, res) => {
            expect(res.status).to.be.equal(200);
            expect(res.body).to.have.property('data');
            expect(res.body.data).to.have.property('articles');
            done();
          });
      });

      it('should search article by multiple tags = cat,dog', (done) => {
        chai.request(app)
          .get(`/api/search?tag=${tags.cat},${tags.dog}`)
          .end((error, res) => {
            expect(res.status).to.be.equal(200);
            expect(res.body).to.have.property('data');
            expect(res.body.data).to.have.property('articles');
            done();
          });
      });

      it('should fail if tag not provided', (done) => {
        chai.request(app)
          .get('/api/search?tag=')
          .end((error, res) => {
            expect(res.status).to.be.equal(400);
            expect(res.body).to.have.property('message');
            expect(res.body.message).to.have.equals('tag is not allowed to be empty');
            done();
          });
      });
    });

    it('should respond search paramater are required', (done) => {
      chai.request(app)
        .get('/api/search')
        .end((error, res) => {
          expect(res.status).to.be.equal(400);
          expect(res.body).to.have.property('message');
          expect(res.body.message).to.have.equals('search paramater are required');
          done();
        });
    });
  });

  describe('The Article controller structure', () => {
    it('should be a function', () => {
      expect(Articles.createSlug).to.be.a('function');
      expect(Articles.create).to.be.a('function');
      expect(Articles.getAll).to.be.a('function');
      expect(Articles.get).to.be.a('function');
      expect(Articles.update).to.be.a('function');
      expect(Articles.delete).to.be.a('function');
      expect(Articles.like).to.be.a('function');
      expect(Articles.unlike).to.be.a('function');
      expect(Articles.tagsToArray).to.be.a('function');
      expect(Articles.search).to.be.a('function');
      expect(Articles.filterByAuthor).to.be.a('function');
      expect(Articles.filterByTitle).to.be.a('function');
      expect(Articles.filterByKeywords).to.be.a('function');
      expect(Articles.filterByTags).to.be.a('function');
    });
  });
});
