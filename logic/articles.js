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

  queryByTime: (startTime, endTime, limitCount) => {
    if (!startTime) {
      return Articles.findOne({ limit: 25 });
    }
    if (!endTime) {     // looking for specific article
      return Articles.findOne({ where: { publish_time: startTime } });
    } else {            // looking for multiple articles
      return Articles.findOne({
        where: {
          publish_time: {
            [Op.gte]: new Date(startTime),
            [Op.lte]: new Date(endTime)
          }
        },
        limit: limitCount || 25
      });
    }
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
      title: 'ANOTHER BREAKING NEWS!!!',
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

  module.exports.queryByTime()
    .then((data) => {
      console.log(`Found ${data.title} inserted at ${data.publish_time}`);
    });
}

