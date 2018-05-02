const assert = require('chai').assert;
const expect = require('chai').expect;
const chai = require('chai');
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

  describe('#getArticle()', () => {
    it('getting article that should be in database', () => {
      expect(Articles.getArticle({ publish_time: '2018-05-02' }))
        .to.eventually.have.property('code').with.equal(200);
    });
    it('getting article that is bound to NOT be in database', () => {
      expect(Articles.getArticle({ publish_time: '8102-12-12' }))
        .to.eventually.have.property('code').with.equal(900);
    });
  });


});


