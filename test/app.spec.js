const app = require('../src/app');
const store = require('../src/store');
const { API_TOKEN } = require('../src/config');

describe('App', () => {
  it('GET /bookmarks fails without proper token', () => {
    supertest(app)
      .get('/bookmarks')
      .set('Authorization', 'Bearer ' + 'fake_token_' + Math.random())
      .end((err, res) => {
        expect(res.status).to.equal(401);
        expect(res.body.error).to.be.a('string');
      });
  });
  it('GET /bookmarks responds with list of bookmarks', () => {
    supertest(app)
      .get('/bookmarks')
      .set('Authorization', 'Bearer ' + API_TOKEN)
      .end((err, res) => {
        expect(res.status).to.equal(200);
        expect(res.body).to.be.a('array');
        expect(res.body).to.not.be.empty;
      });
  });
  it('POST /bookmarks adds a bookmark and response with id', () => {
    const initialLength = store.bookmarks.length;
    const bookmark = {
      title: 'test title',
      description: 'test description',
      rating: 1,
      url: 'test.com'
    };
    supertest(app)
      .post('/bookmarks')
      .set('Authorization', 'Bearer ' + API_TOKEN)
      .send(bookmark)
      .end((err, res) => {
        expect(res.status).to.equal(201);
        expect(res.body.id).to.be.a('string');
        expect(store.bookmarks.length).to.equal(initialLength + 1);
      });
  });
  it('POST /bookmarks fails with a malformed bookmark', () => {
    const initialLength = store.bookmarks.length;
    const bookmark = {
      title: '<script>test title',
      description: '<script>test description',
      rating: 0,
      url: 'bla'
    };
    supertest(app)
      .post('/bookmarks')
      .set('Authorization', 'Bearer ' + API_TOKEN)
      .send(bookmark)
      .expect(400)
      .end((err, res) => {
        expect(res.status).to.equal(400);
        expect(res.body.error).to.be.a('string');
        expect(store.bookmarks.length).to.equal(initialLength);
      });
  });
  it('GET /bookmarks/id responds with bookmark', () => {
    const bookmark = store.bookmarks[0];
    supertest(app)
      .get(`/bookmarks/${bookmark.id}`)
      .set('Authorization', 'Bearer ' + API_TOKEN)
      .end((err, res) => {
        expect(res.status).to.equal(200);
        expect(res.body).to.deep.equal(bookmark);
      });
  });
  it('DELETE /bookmarks/id deletes bookmark', () => {
    const bookmark = store.bookmarks[0];
    supertest(app)
      .delete(`/bookmarks/${bookmark.id}`)
      .set('Authorization', 'Bearer ' + API_TOKEN)
      .end((err, res) => {
        expect(res.status).to.equal(204);
        expect(store.bookmarks.findIndex(b => b.id === bookmark.id)).to.equal(
          -1
        );
      });
  });
});
