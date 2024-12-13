const ErrorHander = require("../utils/errorhandler");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const User = require("../models/userModel");
const sendToken = require("../utils/jwtToken");

exports.create = catchAsyncErrors(async (req, res, next) => {

  const { name, email, password } = req.body;
  const newUser = new User({ name, email, password });
  await newUser.save();
  sendToken(newUser, 201, res);

});

exports.get = catchAsyncErrors(async (req, res, next) => {

  const user = await User.findById(req.user.id);
  res.status(200).json({success: true, user});

});

exports.getAll = catchAsyncErrors(async (req, res, next) => {

  const users = await User.find();
  res.status(200).json({success: true, users});

});

exports.updatePassword = catchAsyncErrors(async (req, res, next) => {

  const user = await User.findById(req.user.id).select("+password");
  const isPasswordMatched = await user.comparePassword(req.body.oldPassword);

  if (!isPasswordMatched) {
    return next(new ErrorHander("Old password is incorrect", 400));
  }

  user.password = req.body.newPassword;
  await user.save();

  sendToken(user, 200, res);

});

exports.login = catchAsyncErrors(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new ErrorHander("Please Enter Email & Password", 400));
  }

  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    return next(new ErrorHander("Invalid email or password", 401));
  }

  const isPasswordMatched = await user.comparePassword(password);

  if (!isPasswordMatched) {
    return next(new ErrorHander("Invalid email or password", 401));
  }

  sendToken(user, 200, res);
});

exports.logout = catchAsyncErrors(async (req, res, next) => {

  res.clearCookie('token');
  res.status(200).json({success: true, message: "Logged Out"});

});