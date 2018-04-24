const __author__ = 'smdsbz@GitHub.com';

const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const sequelize = new Sequelize(
  /*database=*/'Dian_officialsite',
  /*username=*/'dian-super-user',
  /*password=*/'wishDianlongliveandprosper',
  {
    host:       'localhost',
    dialect:    'mysql',
    operatorsAliases: false,
    define: {
      timestamps: false
    }
  });
const Articles = sequelize.import('../models/articles.js'); // import model


// Define user logic level methods
module.exports = {

  getArticle: (params) => {
    /**
     * query `Dian_officialsite`.`articles` via time
     *
     * Args:
     *      publish_time    - [string] legal `Date` string
     *
     * Return:
     *     [articles]
     */
    if (params.publish_time) {
      return Articles.findOne({
        where: {
          publish_time: new Date(params.publish_time)
        }
      });
    }
    return null;
  },

  list: (params) => {
    /**
     * get list of articles in `Dian_officialsite`.`articles`
     *
     * Args:
     *      limit       - [number] [optional]
     *      start_time  - [string] [optional] legal `Date` string
     *      end_time    - [string] [optional] legal `Date` string
     *
     * Return:
     *     [Array] of [articles]
     */
    if (params.start_time) {
      params.start_time = new Date(params.start_time);
    } else {
      params.start_time = new Date('1970-01-01');   // should be early enough
    }
    if (params.end_time) {
      params.end_time = new Date(params.end_time);
    } else {
      params.end_time = new Date();     // now is the latest you can get
    }
    return Articles.findAll({
      where: {
        publish_time: {
          [Op.gte]: params.start_time,
          [Op.lte]: params.end_time
        }
      },
      limit: params.limit || 25
    });
  },

  create: (record) => {
    /**
     * insert into `Dian_officialsite`.`articles`
     *
     * Args:
     *     record   - [Object] containing:
     *                  title           - [string]
     *                  publish_time    - [string] NOTE: will be converted to
     *                                              [Date], so make sure the
     *                                              string format is correct!
     *                  content         - [string]
     *
     * Return:
     *     [Promise]
     *      on fail, `reject` with an [Object] containing:
     *          status  - [number] error code:
     *                              999 - article with this title already exist
     *                              998 - database internal error,
     *                                      inform the author if this occur!
     *          msg     - [UNKNOWN] supplementary error message
     */
    return new Promise((resolve, reject) => {
      Articles
        // look for existing record, one would be sufficient
        .findOne({ where: { title: record.title } })
        .then((article) => {
          if (article) {  // existing record
            reject({
              status: 999,
              msg: `Exsisting article "${article.title}" inserted at "${article.publish_time}"!`
            });
          } else {
            Articles.create(record);
          }
        })
        .catch((err) => {
          reject({
            status: 998,
            msg: err
          });
        });
    });
  }


};


// Test
let test = true;
if (test) {
  module.exports.create({
      title: 'BREAKING NEWS!!!',
      publish_time: '1970-01-01',
      content: 'A big news made by Mr.口-口'
    })
    .catch((err) => {
      console.log(`Error occured: ${err.msg}`);
    });

  module.exports.create({
      title: 'ANOTHER BREAKING NEWS!!!',
      publish_time: '1980-01-01',
      content: 'uvuvwevwev'
    })
    .catch((err) => {
      console.log(`Error occured: ${err.msg}`);
    });

  module.exports.getArticle({publish_time: '1970-01-01'})
    .then((data) => {
      if (data) {
        console.log(`Found ${data.title} in records!`);
      } else {
        console.log(`No data found!`);
      }
    });

  module.exports.list({start_time: '1970-01-01'})
    .then((data) => {
      if (data) {
        console.log(`Found ${data.length} records!`);
      } else {
        console.log(`No data found!`);
      }
    });
}

