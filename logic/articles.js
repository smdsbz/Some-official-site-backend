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
sequelize.sync();   // auto sync via middleware


// Define user logic level methods
module.exports = {

  getArticle: async (params) => {
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
     *                  code: 900
     *                  data: no satisfying data record message
     *
     *      reject  =>  code: 901
     *                  data: unkown error object
     */
    return new Promise((resolve, reject) => {
      // align `params.publish_time`
      if (!params.publish_time) {
        reject({
          code: 902,
          data: 'parameter `publish_time` needed!'
        });
      }
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

  list: async (params) => {
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
     *                  data: `article` asking for, could be empty Array
     *
     *      reject  =>  code: 901
     *                  data: unkown error object
     */
    return new Promise((resolve, reject) => {
      // pre-porcess input time vars
      // HACK: 1970-01-01 should be early enough
      params.start_time = params.start_time ?
          new Date(params.start_time) : new Date('1970-01-01');
      // HACK: manually +1s considering async does not promise you sequential
      params.end_time = params.end_time ?
          new Date(params.end_time) : new Date(new Date().getTime() + 1);
      // do finding jobs
      Articles
        .findAll({
          where: {
            publish_time: {
              [Op.gte]: params.start_time,
              [Op.lte]: params.end_time
            }
          },
          limit: Number(params.limit) || 25
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

  newArticle: async (record) => {
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
     *                  code: 999
     *                  data: same title message
     *
     *      reject  =>  code: 901
     *                  data: unkown error object
     */
    // legitify params
    record.publish_time = record.publish_time ?
        new Date(record.publish_time) : new Date();
    // NOTE: uncomment the line below, if the final API suggests that
    //       `publish_time` could be unique
    // record.publish_time.setHours(0, 0, 0, 0);

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

  updateArticle: async (params) => {
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
     *                  code: 900
     *                  data: title not found message
     *
     *                  code: 901
     *                  data: multiple title found message
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
          params.publish_time = params.publish_time ?
              new Date(params.publish_time) : new Date();
          // NOTE: uncomment the line below, if the final API suggests that
          //       `publish_time` could be unique
          // params.publish_time.setHours(0, 0, 0, 0);
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

  deleteAricle: async (params) => {
    /**
     * delete article in `Dian_officialsite`.`articles`
     *
     * Args:
     *      publish_time    - [string] article's updated `publish_time`
     *
     * Return:
     *      resolve =>  code: 200
     *                  data: deleted `publish_time`
     *
     *                  code: 900
     *                  data: target article not found
     *
     *                  code: 901
     *                  data: multiple target articles found
     *
     *      reject  =>  code: 903
     *                  data: insufficient parameter message
     *
     *                  code: 999
     *                  data: unkown error object
     */
    return new Promise((resolve, reject) => {
      // params validation
      // if (!params.publish_time) {   // required param not provided
      //   reject({
      //     code: 903,
      //     data: '`params.publish_time` should NOT be undefined!'
      //   });
      // }
      params.publish_time = new Date(params.publish_time);
      params.publish_time.setHours(0, 0, 0, 0);
      // set find range - end of this day
      let publish_time_strict_end = new Date(params.publish_time.getTime()
                                             + 24 * 3600 * 1000);   // a day in ms
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


