var express = require("express");
var router = express.Router();
var articles = require("../logic/articles");
/* GET users listing. */
// 'http://localhost:3000/articles/list'
router.get("/", function(req, res, next) {
  res.send("respond with a resource");
});


//查询已有文章信息列表
router.get("/list", async (req, res, next) => {
  articles.list(req.query)
    .then((retval) => {
      res.json(retval);
    })
    .catch((err) => {
      res.json(err);
    });
});


//查询某个文章信息
router.get("/get_article", async (req, res, next) => {
  let retval = await articles.getArticle(req.query);
  if (retval.code === 200) {
    res.send( retval );
  } else {
    res.send({ code: retval.code });
  }
});


//新增文章信息
router.post("/article_list/new_article", (req, res, next) => {
  let params = {
    ID: req.body.ID,
    title: req.body.title,
    publish_time: req.body.publish_time,
    content: req.body.content
  };
  articles.create(params)
  .then(result => {
    console.log(
      `[entryForm] userlist params => ${JSON.stringify(params, null, 4)}`
    );
    res.json(result);
  })
  .catch(err => {
    res.json(err);
  })
});

//修改文章信息信息
/*Articles.updateArticle({
          title: g_created_article_title,
          content: 'nyaaaaaaaaaaaaaaaaaan ≈≈≈[,_,]:3' + new Date().toString()
        }); */
router.post("/article_list/update_article", (req, res, next) => {
  let params = {
    title: req.body.title,
    content:req.body.content
  };
  articles.updateArticle(params)
  .then(result => {
    console.log(
      `[entryForm] userlist params => ${JSON.stringify(params, null, 4)}`
    );
    res.json(result);
  })
  .catch(err => {
    res.json(err);
  })
});

//删除文章信息
router.post("/delete_article", async (req, res, next) => {
  if (!req.signedCookies.user) {    // not logged admin user
    res.json({ code: 998, data: 'user not logged-in' });
  } else {
    articles.deleteAricle({ publish_time: req.body.publish_time })
    .then((retval) => {                         //?????????????????????
      if (retval.code === 200) {
        res.json(retval);
      } else {
        console.log(`In Articles.deleteAricle[${retval.code}]: ${retval.data}`);
        res.json(retval);
      }
    })
    .catch((err) => {
      res.json(err);
    });
  }
});


module.exports = router;
