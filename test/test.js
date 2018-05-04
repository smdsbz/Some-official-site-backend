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

let g_created_article_time = new Date();
g_created_article_time.setHours(0, 0, 0, 0);    // manually align to start of day
let g_created_article_title = `test title [just created at ` +
    `${g_created_article_time.toString()}]`;
let g_created_article_content =  '≈≈≈[,_,]:3';

describe('Articles', () => {

  describe('#newArticle()', () => {
    it('creating new record', async () => {
      let ret = await Articles.newArticle({
          title: g_created_article_title,
          publish_time: g_created_article_time,
          content: g_created_article_content
        });
      ret.should.have.property('code').which.is.equal(200);
      ret.should.have.property('data').which.include('test title');
    });
    it('creating duplicated article', async () => {
      let ret = await Articles.newArticle({
          title: g_created_article_title,       // this should cause the failure
          publish_time: new Date(1970, 0, 1),   // different time
          content: g_created_article_content
        });
      ret.should.have.property('code').which.is.equal(999);
    });
  });

  describe('#getArticle()', () => {
    it('getting article that should be in database', async () => {
      let ret = await Articles.getArticle({ publish_time: g_created_article_time });
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

  describe('#updateArticle()', () => {
    it('updating existing article', async () => {
      // NOTE: `publish_time` will be set to NOW!
      let ret = await Articles.updateArticle({
          title: g_created_article_title,
          content: 'nyaaaaaaaaaaaaaaaaaan ≈≈≈[,_,]:3' + new Date().toString()
        });
      ret.should.have.property('code').which.is.equal(200);
      ret.should.have.property('data').which.is.a('Date');
    });
    it('updating article bount to NOT be in database', async () => {
      let ret = await Articles.updateArticle({
          title: 'uvuvwevwev',  // you should not find this title in database
          content: 'ovuvwevosas'
        });
      ret.should.have.property('code').which.is.equal(900);
    });
    // NOTE: The following test won't work, for you can't insert duplicated
    //       titles into database in the first place!
    // it('break when found multiple update objectives', async () => {
    //   let ret = await Articles.updateArticle({
    //       title: 'test title',
    //       content: 'kdlfajklsf'
    //     });
    //   ret.should.have.property('code').which.is.equal(901);
    // });
  });

  describe('#deleteAricle()', () => {
    it('deleting article', async () => {
      let ret = await Articles.deleteAricle({ publish_time: new Date() });
      ret.should.have.property('code').which.is.equal(200);
      ret.data.getTime().should.be.equal(new Date().setHours(0, 0, 0, 0));
    });
  });

});


