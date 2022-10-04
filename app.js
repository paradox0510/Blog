//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require('mongoose');
const _ = require('lodash');

const app = express();
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/blogDB", {
  useNewUrlParser: true
});

const postSchema = {
  title: String,
  content: String
};

const Post = mongoose.model("Post", postSchema);

const revSchema = {
  id_d: String,
  pername: String,
  perrev: String
};

const Personrev = mongoose.model("Personrev", revSchema);

app.get("/", function(req, res) {

  Post.find({}, function(err, posts) {
    res.render("home", {
      posts: posts
    });
  });
});

app.post("/", function(req, res) {
  Post.find({}, (err, elements) => {
    if (err) {
      console.log("err");
      res.send("BLOG DOES NOT EXIST");
    } else {
      var url = ""
      const srcharr = [];
      elements.forEach(function(element) {
        const str = _.lowerCase(element.title);
        if (str.includes(_.lowerCase(req.body.queryname))) {
          const postele = {
            blogTitle: element.title,
            blogContent: element.content,
            blogId: element._id,
          };
          srcharr.push(postele);
        }
      })
      if (srcharr.length === 0) {
        res.send("BLOG DOES NOT EXIST");
      } else {
        res.render("search", {
          blogarrays: srcharr,
        });
      }
    }
  });
});

app.get("/compose", function(req, res) {
  res.render("compose");
});

app.post("/compose", function(req, res) {
  const post = new Post({
    title: req.body.postTitle,
    content: req.body.postBody
  });

  Post.find({}, (err, elements) => {
    if (err) {
      console.log("err");
    } else {
      var flag = 0;
      elements.forEach(function(element) {
        if (_.toLower(element.title) === _.toLower(req.body.postTitle)) {
          flag = 1;
        }
      })
      if (flag === 1) {
        res.send("BLOG ALREADY EXIST WITH THIS TITLE");
      } else {
        post.save(function(err) {
          if (!err) {
            res.redirect("/");
          }
        });
      }
    }
  });

});

app.get("/posts/:postId", function(req, res) {

  const requestedPostId = req.params.postId;
  Post.findOne({
    _id: requestedPostId
  }, function(err, post) {
    if (!err) {
      Personrev.find({
        id_d: requestedPostId
      }, (err, elements) => {
        if (!err) {
          res.render("post", {
            idd: requestedPostId,
            title: post.title,
            content: post.content,
            revs: elements
          });
        } else {
          res.send(err);
        }
      });

    } else {
      res.send(err);
    }
  });
});

app.post("/posts/:postId", function(req, res) {
  const requestedPostId = req.params.postId;
  const personrev = new Personrev({
    id_d: requestedPostId,
    pername: req.body.commentTitle,
    perrev: req.body.commentBody
  });

  const url = "/posts/" + requestedPostId;
  personrev.save(function(err) {
    if (!err) {
      res.redirect(url);
    }
  });
});

app.get("/update/:postId", function(req, res) {

  const requestedPostId = req.params.postId;
  Post.findOne({
    _id: requestedPostId
  }, function(err, post) {
    res.render("update", {
      idd: requestedPostId,
      atitle: post.title,
      acontent: post.content
    });
  });
});

app.post("/update/:postId", function(req, res) {

  const requestedPostId = req.params.postId;
  Post.findOneAndUpdate({
      _id: requestedPostId
    }, {
      title: req.body.updateTitle,
      content: req.body.updateBody
    }, {
      overwrite: true
    },
    function(err) {
      if (!err) {
        res.redirect("/");
      } else {
        res.send(err);
      }
    }
  );
});

app.get("/delete/:postId", function(req, res) {

  const requestedPostId = req.params.postId;
  Post.deleteOne({
      _id: requestedPostId
    },
    function(err) {
      if (!err) {
        Personrev.deleteMany({
            id_d: requestedPostId
          },
          function(err) {
            if (!err) {
              res.redirect("/");
            } else {
              res.send(err);
            }
          }
        )
      } else {
        res.send(err);
      }
    }
  );
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
