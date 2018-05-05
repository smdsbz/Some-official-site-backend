var express = require("express");
var router = express.Router();
var articles = require("../logic/articles");
/* GET users listing. */
// 'http://localhost:3000/articles/list'
router.get("/", function(req, res, next) {
  res.send("respond with a resource");
});


//查询已有文章信息列表
router.get("/list", (req, res, next) => {
    articles.list({start_time: res.body.start_time})
    .then((data) => {
      if (data) {
        console.log(`Found ${data.length} records!`);
      } else {
        console.log('No data found!');
      }
    })
    .catch(err => {
        res.json(err);
        });

console.log('No data found!');
});

//查询某个文章信息
router.get("/article_list/get_article?publish_time=<publish_time>", (req, res, next) => {
  /*let params = {
    phone: "123456",
    HDAS: "kDLSAKD"
  };*/
  // console.log(
  //   `[entryForm] userlist params => ${JSON.stringify(params, null, 4)}`
  // );

  /*module.exports.getArticle({publish_time: '1970-01-01'})
  .then((data) => {
    if (data) {
      console.log(`Found ${data.title} in records!`);
    } else {
      console.log(`No data found!`);
    }
  });*/
  articles.getArticle({publish_time:req.body.publish_time})
  .then((data) => {
      if (data) {
        console.log('Found ${data.title} in records!');
      } else {
        console.log('No data found!');
      }
    })
  .catch(err => {
  res.json(err);
  });
});   
  
  

//新增文章信息
router.post("/article_list/new_article", (req, res, next) => {
let params = {
  ID:req.body.ID,
  title:req.body.title,
  publish_time:req.body.publish_time,
  content: req.body.content,
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
router.delete("/article_list/delete_article?publish_time=<publish_time>", (req, res, next) => {
  /*let params = {
  phone: "123456"
  };
  enrty_logic.createUser(params)
  .then(result => {
  console.log(
      `[entryForm] userlist params => ${JSON.stringify(params, null, 4)}`
  );
  res.json(result);
  })
  .catch(err => {
  res.json(err);

  .then((data) => {
      if (data) {
        console.log(`Found ${data.title} in records!`);
      } else {
        console.log(`No data found!`);
      }
    })
  .catch(err => {
  res.json(err);
  });

  })*/

  /*let ret = await Articles.deleteAricle({ publish_time: new Date() });
      ret.should.have.property('code').which.is.equal(200);
      ret.data.getTime().should.be.equal(new Date().setHours(0, 0, 0, 0)); */

  articles.deleteAricle({ publish_time: res.body.publish_time })
  .then((retval) => {                         //?????????????????????
    if (retval.code === 200) {
      console.log(`article successfully deleted!`);
    } else {
      console.log(`In Articles.deleteAricle[${retval.code}]: ${retval.data}`);
    }
  })
  .catch((err) => {
    console.log(err);
  });

});


module.exports = router;
