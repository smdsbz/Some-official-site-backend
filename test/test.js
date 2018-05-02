const chai = require('chai');
const assert = chai.assert;
const expect = chai.expect;
const should = chai.should();
const chaiAsPromised = require('chai-as-promised');

chai.use(chaiAsPromised);

describe('Test module loading', () => {
  it('should be true', () => {
    assert.equal([1, 2, 3].indexOf(4), -1);
  });
});


/******* logic/articles.js *******/

const Articles = require('../logic/articles.js');

describe('Articles', () => {

  let g_created_article_time = new Date(new Date().getTime() + 42222 * 23333);
  g_created_article_time.setHours(0, 0, 0, 0);

  describe('#getArticle()', () => {
    it('getting article that should be in database', async () => {
      let ret = await Articles.getArticle({ publish_time: '2018-05-02' });
      ret.should.have.property('code').which.is.equal(200);
    });
    it('getting article that is bound to NOT be in database', async () => {
      let ret = await Articles.getArticle({ publish_time: '8102-12-12' });
      ret.should.have.property('code').which.is.equal(900);
    });
  });

  describe('#list()', () => {
    it('listing articles', async () => {
      let ret = await Articles.list({});
      ret.should.have.property('code').which.is.equal(200);
      ret.should.have.property('data').which.is.a('Array').that.is.not.empty;
    });
    it('listing empty', async () => {
      let ret = await Articles.list({ start_time: new Date(new Date().getTime() + 1000) });
      ret.should.have.property('code').which.is.equal(200);
      ret.should.have.property('data').which.is.a('Array').that.is.empty;
    });
  });

  describe('#newArticle()', () => {
    it('creating new record', async () => {
      let ret = await Articles.newArticle({
          title: 'test title [just created at '
                 + g_created_article_time.toString() + ']',
          publish_time: g_created_article_time,
          content: '≈≈≈[,_,]:3'
        });
      ret.should.have.property('code').which.is.equal(200);
      ret.should.have.property('data').which.include('test title');
    });
    it('creating duplicated article', async () => {
      let ret = await Articles.newArticle({
          title: 'test title',
          publish_time: new Date(1970, 0, 1),
          content: '≈≈≈[,_,]:3'
        });
      ret.should.have.property('code').which.is.equal(999);
    });
  });

  describe('#updateArticle()', () => {
    it('updating existing article', async () => {
      let ret = await Articles.updateArticle({
          title: 'BREAKING NEWS!!!',
          content: 'nyaaaaaaaaaaaaaaaaaan ≈≈≈[,_,]:3' + new Date().toString()
        });
      ret.should.have.property('code').which.is.equal(200);
      ret.should.have.property('data').which.is.a('Date');
    });
    it('updating article bount to NOT be in database', async () => {
      let ret = await Articles.updateArticle({
          title: 'uvuvwevwev',
          content: 'ovuvwevosas'
        });
      ret.should.have.property('code').which.is.equal(900);
    });
    it('break when found multiple update objectives', async () => {
      let ret = await Articles.updateArticle({
          title: 'test title',
          content: 'kdlfajklsf'
        });
      ret.should.have.property('code').which.is.equal(901);
    });
  });

  describe('#deleteAricle()', () => {
    it('deleting article', async () => {
      let ret = await Articles.deleteAricle({ publish_time: g_created_article_time });
      ret.should.have.property('code').which.is.equal(200);
      ret.data.getTime().should.be.equal(g_created_article_time.getTime());
    });
  });


});


