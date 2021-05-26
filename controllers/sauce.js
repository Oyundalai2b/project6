const Sauce = require("../models/sauce");
const fs = require("fs");

exports.createSauce = (req, res, next) => {
  const url = req.protocol + "://" + req.get("host");
  req.body.sauce = JSON.parse(req.body.sauce);
  const sauce = new Sauce({
    userId: req.body.sauce.userId,
    name: req.body.sauce.name,
    manufacturer: req.body.sauce.manufacturer,
    description: req.body.sauce.description,
    mainPepper: req.body.sauce.mainPepper,
    imageUrl: url + "/images/" + req.file.filename,
    heat: req.body.sauce.heat,
    likes: 0,
    dislikes: 0,
    usersLiked: [],
    usersDisliked: [],
  });
  sauce
    .save()
    .then(() => {
      res.status(201).json({
        message: "Post saved successfully",
      });
    })
    .catch((error) => {
      res.status(400).json({
        error: error,
      });
    });
};

exports.getOneSauce = (req, res, next) => {
  Sauce.findOne({
    _id: req.params.id,
  })
    .then((sauce) => {
      res.status(200).json(sauce);
    })
    .catch((error) => {
      res.status(404).json({
        error: error,
      });
    });
};

exports.modifyingSauce = (req, res, next) => {
  let sauce = new Sauce({ _id: req.params._id });
  if (req.file) {
    const url = req.protocol + "://" + req.get("host");
    req.body.sauce = JSON.parse(req.body.sauce);
    sauce = {
      _id: req.params.id,
      userId: req.body.sauce.userId,
      name: req.body.sauce.name,
      manufacturer: req.body.sauce.manufacturer,
      description: req.body.sauce.description,
      mainPepper: req.body.sauce.mainPepper,
      imageUrl: url + "/images/" + req.file.filename,
      heat: req.body.sauce.heat,
      likes: 0,
      dislikes: 0,
      usersLiked: [],
      usersDisliked: [],
      //   _id: req.params.id,
      //   title: req.body.thing.title,
      //   description: req.body.thing.description,
      //   imageUrl: url + "/images/" + req.file.filename,
      //   price: req.body.thing.price,
      //   userId: req.body.thing.userId,
    };
  } else {
    sauce = {
      _id: req.params.id,
      name: req.body.name,
      manufacturer: req.body.manufacturer,
      description: req.body.description,
      mainPepper: req.body.mainPepper,
      heat: req.body.heat,
      likes: 0,
      dislikes: 0,
      usersLiked: [],
      usersDisliked: [],
      userId: req.body.userId,
      //   _id: req.params.id,
      //   title: req.body.title,
      //   description: req.body.description,
      //   imageUrl: req.body.imageUrl,
      //   price: req.body.price,
      //   userId: req.body.userId,
    };
  }

  Sauce.updateOne({ _id: req.params.id }, sauce)
    .then(() => {
      res.status(201).json({
        message: "Sauce updated successfully!",
      });
    })
    .catch((error) => {
      res.status(400).json({
        error: error,
      });
    });
};

exports.deleteSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id }).then((sauce) => {
    const filename = sauce.imageUrl.split("/images/")[1];
    fs.unlink("images/" + filename, () => {
      Sauce.deleteOne({ _id: req.params.id })
        .then(() => {
          res.status(200).json({
            message: "Deleted!",
          });
        })
        .catch((error) => {
          res.status(400).json({
            error: error,
          });
        });
    });
  });
};

exports.getAllSauce = (req, res, next) => {
  Sauce.find()
    .then((sauces) => {
      res.status(200).json(sauces);
    })
    .catch((error) => {
      res.status(400).json({
        error: error,
      });
    });
};

function arrayRemove(arr, value) {
  return arr.filter(function (ele) {
    return ele != value;
  });
}

exports.like = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id }).then((sauce) => {
    const likedUserId = req.body.userId;
    if (req.body.like === 1) {
      if (!sauce.usersLiked.includes(likedUserId)) {
        sauce.usersLiked.push(likedUserId);
        sauce.likes += 1;
      }
      if (sauce.usersDisliked.includes(likedUserId)) {
        sauce.usersDisliked = arrayRemove(sauce.usersDisliked, likedUserId);
        sauce.likes += 1;
        sauce.dislikes -= 1;
      }
    } else if (req.body.like === -1) {
      if (!sauce.usersDisliked.includes(likedUserId)) {
        sauce.usersDisliked.push(likedUserId);
        sauce.dislikes += 1;
      }
      if (sauce.usersLiked.includes(likedUserId)) {
        sauce.usersLiked = arrayRemove(sauce.usersLiked, likedUserId);
        sauce.likes -= 1;
        sauce.dislikes += 1;
      }
    } else if (req.body.like === 0) {
      if (sauce.usersLiked.includes(likedUserId)) {
        sauce.usersLiked = arrayRemove(sauce.usersLiked, likedUserId);
        sauce.likes -= 1;
      }
      if (sauce.usersDisliked.includes(likedUserId)) {
        sauce.usersDisliked = arrayRemove(sauce.usersDisliked, likedUserId);
        sauce.dislikes -= 1;
      }
    }

    Sauce.updateOne({ _id: req.params.id }, sauce)
      .then(() => {
        res.status(200).json({
          message: "Sauce likes updated successfully!",
        });
      })
      .catch((error) => {
        res.status(400).json({
          error: error,
        });
      });
  });
};
