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
     * +--------------+-------------------------------------+-----------+
     * | Field        | Description                         | Required? |
     * +--------------+-------------------------------------+-----------|
     * | publish_time | the article's publish_time querying | yes       |
     * +--------------+-------------------------------------+-----------+
     *
     * Return:
     *     Record in database table.
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
     * +------------+---------------------------+-----------+
     * | Field      | Description               | Required? |
     * +------------+---------------------------+-----------|
     * | limit      | count of articles to show | no        |
     * | start_time | starting time             | no        |
     * | end_time   | ending time               | no        |
     * +------------+---------------------------+-----------+
     *
     * Return:
     *     An `Array` of records.
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
          reject(err);
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

