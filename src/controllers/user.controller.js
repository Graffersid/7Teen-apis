const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { userService } = require('../services');
var multer  =   require('multer');
var bodyParser = require('body-parser');
var express = require('express');
var app         =   express();
const path = require('path');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


const createUser = catchAsync(async (req, res) => {
  const user = await userService.createUser(req.body);
  res.status(httpStatus.CREATED).send(user);
});

const getUsers = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['name', 'role']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const result = await userService.queryUsers(filter, options);
  res.send(result);
});

const getUser = catchAsync(async (req, res) => {
  const user = await userService.getUserById(req.params.userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  res.send(user);
});

const getUserName = catchAsync(async (req, res) => {
	var parent_name=req.body.parent_name;
  	var parent_number=req.body.parent_number;

  if (parent_name && parent_number) {
    var username = parent_name.substring(0, 4)+""+parent_number.substr(parent_number.length - 4);
  
  }
	res.send(username);
  });

  
const updateUser = catchAsync(async (req, res) => {
  const user = await userService.updateUserById(req.params.userId, req.body);
  
  if(typeof user.parent_name !== 'undefined')
  {
    //prent created already
  }
  else
  {
    const data = {
      name: req.body.parent_name,
      phone: req.body.parent_number,
      role: 'parent',
    };
    const parent = await userService.createParent(data);
  }
  res.send(user);
});

const deleteUser = catchAsync(async (req, res) => {
  await userService.deleteUserById(req.params.userId);
  res.status(httpStatus.NO_CONTENT).send();
});

const uploadPic = catchAsync(async (req, res) => {
		var storage =   multer.diskStorage({
	  destination: function (req, file, callback) {
		callback(null, './public/uploads');
	  },
	  filename: function (req, file, callback) {
		  //console.log(file);
		filename1=file.originalname;
		var ext = filename1.substring(filename1.indexOf('.')); 
	  
		callback(null, file.fieldname + '-' + Date.now()+ext);
	  }

	});

	const fileFilter = (req, file, callback) => {
	  if (file.mimetype === "image/jpeg" || file.mimetype === "image/png") {
		  callback(null, true);
	  } else {
		  res.status(401).send({ "message":"Jpeg, Png allowed only" });
		  return;
	  }
	};

	const maxSize = 25 * 1000;

	var upload = multer({ storage : storage,
						  limits: { fileSize: maxSize },
						  fileFilter }).single('avatar');
		upload(req,res,function(err) {
			let imgPath= req.hostname +'/' + req.file.path;
			console.log(req.file);
			if(err) {
			  console.log(err);
				res.status(401).send({ "message":"Error uploading file." });
				return;
			}
		  const user = userService.updateImageById(req.params.userId, imgPath);
			res.status(200).send({ "message":"Profile pic is uploaded." ,"user":user});
			return;
		});
});


module.exports = {
  createUser,
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  uploadPic,
  getUserName,
};
