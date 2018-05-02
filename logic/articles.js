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
Articles.sync()
  .then(() => {
    console.log('`Articles` model synced');
  });


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
     *      resolve =>  code: 200
     *                  data: `article` asking for
     *
     *      reject  =>  code: 900
     *                  data: no satisfying data record message
     *
     *                  code: 901
     *                  data: unkown error object
     */
    return new Promise((resolve, reject) => {
      // align `params.publish_time`
      params.publish_time = new Date(params.publish_time);
      params.publish_time.setHours(0, 0, 0, 0);     // NOTE: consider timezone
      let publish_time_strict_end = new Date(params.publish_time.getTime()
                                             + 24 * 3600 * 1000);
      publish_time_strict_end.setHours(0, 0, 0, 0); // start of next day
      Articles
        .findOne({
          where: {
            publish_time: {
              [Op.gte]: params.publish_time,
              [Op.lt]: publish_time_strict_end
            }
          }
        })
        .then((record) => {
          if (record) {
            resolve({
              code: 200,
              data: record
            });
          } else {        // no satisfying record found
            resolve({
              code: 900,
              data: `no data found with \`publish_time\` of ` +
                    `${params.publish_time}`
            });
          }
        })
        .catch((err) => { // unexpected error
          reject({
            code: 901,
            data: err
          });
        });
      });
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
     *      resolve =>  code: 200
     *                  data: `article` asking for
     *
     *      reject  =>  code: 901
     *                  data: unkown error object
     */
    return new Promise((resolve, reject) => {
      // pre-porcess input time vars
      if (params.start_time) {
        params.start_time = new Date(params.start_time);
      } else {
        params.start_time = new Date('1970-01-01');   // HACK: should be early enough
      }
      if (params.end_time) {
        params.end_time = new Date(params.end_time);
      } else {
        params.end_time = new Date();     // now is the latest you can get
      }
      // do finding jobs
      Articles
        .findAll({
          where: {
            publish_time: {
              [Op.gte]: params.start_time,
              [Op.lte]: params.end_time
            }
          },
          limit: params.limit || 25
        })
        .then((record) => {
          resolve({
            code: 200,
            data: record
          });
        })
        .catch((err) => {   // unexpected errors
          reject({
            code: 901,
            data: err
          })
        })
      });
  },

  newArticle: (record) => {
    /**
     * insert into `Dian_officialsite`.`articles`
     *
     * Args:
     *      title           - [string]
     *      publish_time    - [string] NOTE: will be converted to
     *                                 [Date], so make sure the
     *                                 string format is correct!
     *      content         - [string]
     *
     * Return:
     *      resolve =>  code: 200
     *                  data: `.title` of the new article
     *
     *      reject  =>  code: 999
     *                  data: same title message
     *
     *                  code: 901
     *                  data: unkown error object
     */
    return new Promise((resolve, reject) => {
      Articles
        // first look for existing record, one would be sufficient
        .findOne({ where: { title: record.title } })
        .then((article) => {
          if (article) {  // existing record
            resolve({
              code: 999,
              data: `Exsisting article "${article.title}" inserted at ` +
                    `"${article.publish_time}"!`
            });
          } else {
            Articles.create(record);
            resolve({
              code: 200,
              data: record.title
            });
          }
        })
        .catch((err) => {
          reject({
            code: 998,
            data: err
          });
        });
      });
  },

  updateArticle: (params) => {
    /**
     * update article in `Dian_officialsite`.`articles`
     *
     * Args:
     *      title           - [string]
     *      publish_time    - [string] [optional] updated article's
     *                        `publish_time` will be set to this, or today if
     *                        not given
     *      content         - [string] new contents
     *
     * Return:
     *      resolve =>  code: 200
     *                  data: updated `publish_time`
     *
     *      reject  =>  code: 900
     *                  data: article does not exist message
     */
    return new Promise((resolve, reject) => {
      Articles
        .findAll({ where: { title: params.title } })
        .then((query) => {
          if (!query.length) {  // no existing article with `title` as `params.title`
            resolve({
              code: 900,
              data: `no existing article named "${params.title}"`
            });
          } else if (query.length !== 1) {  // multiple article with `params.title`
            resolve({
              code: 901,
              data: `multiple article named "${params.title}"`
            });
          } else {  // legit query - only 1 found with this title
            return query[0];
          }
        })
        .then((article) => {
          // legitify `params`
          params.publish_time = params.publish_time || new Date();
          return article.update({
            publish_time: params.publish_time,
            content: params.content
          });
        })
        .then(() => {
          resolve({
            code: 200,
            data: params.publish_time   // legitified already
          });
        })
        .catch((err) => {
          reject({
            code: 999,
            data: err
          });
        });
    });
  },

  deleteAricle: (params) => {
    return new Promise((resolve, reject) => {
      // params validation
      if (!params.publish_time) {   // required param not provided
        reject({
          code: 903,
          data: '`params.publish_time` should NOT be undefined!'
        });
      }
      params.publish_time = new Date(params.publish_time);
      params.publish_time.setHours(0, 0, 0, 0);
      // set find range - end of this day
      let publish_time_strict_end = new Date(params.publish_time.getTime()
                                             + 24 * 3600 * 1000);   // one day in milliseconds
      publish_time_strict_end.setHours(0, 0, 0, 0); // align to start of day
      // validation OK
      Articles
        .findAll({
          where: {
            publish_time: {
              [Op.gte]: new Date(params.publish_time),
              [Op.lt]: publish_time_strict_end
            }
          }
        })
        .then((query) => {
          if (!query.length) {  // no existing article with `title` as `params.title`
            resolve({
              code: 900,
              data: `no existing article updated at "${params.publish_time}"`
            });
          } else if (query.length !== 1) {  // multiple article with `params.title`
            resolve({
              code: 901,
              data: `multiple article updated at "${params.publish_time}"`
            });
          } else {  // legit query - only 1 found with this title
            return query[0];
          }
        })
        .then((article) => {
          return article.destroy();
        })
        .then(() => {
          resolve({
            code: 200,
            data: params.publish_time   // legitified already
          });
        })
        .catch((err) => {
          reject({
            code: 999,
            data: err
          });
        });
    });
  }


};


// Test
let test = true;
if (test) {
  module.exports.newArticle({
      title: 'BREAKING NEWS!!!',
      publish_time: '1970-01-01',
      content: 'A big news made by Mr.口-口'
    })
    .then((retval) => {
      if (retval.code === 200) {
        console.log(`article "${retval.data}" inserted!`);
      } else {
        console.log(`In Articles.newArticle[${retval.code}]: ${retval.data}`);
      }
    })
    .catch((err) => {
      console.log(err.data);
    });

  module.exports.newArticle({
      title: 'ANOTHER BREAKING NEWS!!!',
      publish_time: '1980-01-01',
      content: 'uvuvwevwev'
    })
    .then((retval) => {
      if (retval.code === 200) {
        console.log(`article "${retval.data}" inserted!`);
      } else {
        console.log(`In Articles.newArticle[${retval.code}]: ${retval.data}`);
      }
    })
    .catch((err) => {
      console.log(err.data);
    });

  module.exports.updateArticle({
      // title: 'BREAKING NEWS!!!',
      title: 'BEAKING NEWS!!!',     // false title
      content: `plus one second to ${new Date()} ==> ` +
          `${new Date(new Date().getTime() + 1)}`
    })
    .then((retval) => {
      if (retval.code === 200) {
        console.log(`updated article at ${retval.data}`);
      } else {
        console.log(`In Articles.updateArticle[${retval.code}]: ` +
            `${retval.data}`);
      }
    })
    .catch((err) => {
      console.log(err.data);
    })

  module.exports.getArticle({publish_time: '1970-01-02'})
    .then((retval) => {
      if (retval.code === 200) {
        console.log(`Found "${retval.data.title}" in records!`);
      } else {
        console.log(`No data found!`);
      }
    })
    .catch((err) => {
      console.log(`Error occured in ` +
          `\`Articles.getArticle\`: ${err.data}`);
    });

  module.exports.list({start_time: '1970-01-01'})
    .then((retval) => {
      if (retval.code === 200) {
        console.log(`Found ${retval.data.length} records!`);
      } else {
        console.log(`This should not appear: retcode ${retval.code}`);
      }
    })
    .catch((err) => {
      /* pass */
    });

  module.exports.deleteAricle({ publish_time: '1980-01-01' })
    .then((retval) => {
      if (retval.code === 200) {
        console.log(`article successfully deleted!`);
      } else {
        console.log(`In Articles.deleteAricle[${retval.code}]: ${retval.data}`);
      }
    })
    .catch((err) => {
      console.log(err);
    });

}

