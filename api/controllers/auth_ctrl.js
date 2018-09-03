'use strict';

var mongoose = require('mongoose'),
    User = mongoose.model('User'),
    Role = mongoose.model('Role'),
    Admin = require('../models/admin'),
    jwt = require('jsonwebtoken'),
    validator = require('validator'),
    Response = require('../lib/response.js'),
    utility = require('../lib/utility.js'),
    config = require('../../config/config.js'),
    common = require('../../config/common.js'),
    async = require('async'),
    constantsObj = require('./../../constants');

module.exports = {
    userRegister: userRegister,
    userLogin: userLogin,
    userActivation: userActivation,
    verifyLink: verifyLink,
    adminLogin: adminLogin,
    contractorLogin: contractorLogin,
    facebookLogin: facebookLogin,
    forgotPassword: forgotPassword,
    loggedin: loggedin,
    userLogOut: userLogOut,
    sendSubscriptionEmail:sendSubscriptionEmail,
    getUsersPermission:getUsersPermission,
    sendfeedback: sendfeedback
};


/**
 * Function is use to check admin login status
 * @access private
 * @return json
 * Created by Udit
 * @smartData Enterprises (I) Ltd
 * Created Date 30-Jan-2017
 */
function loggedin(req, res) {
    // success callback for the Authentication
    if (req.headers && req.headers.authorization) {
        var parts = req.headers.authorization.split(' ');
        if (parts.length == 2) {
            jwt.verify(parts[1], constantsObj.config.secret, function(err, user) {
                if (err) {
                    res.json(Response(402, "Failure", constantsObj.messages.authenticationFailed));
                } else {
                    if (user) {
                        Admin.findById(user.uid).populate('role').exec(function(err, admin) {
                            if (err)
                                res.json(Response(402, "Failure", constantsObj.messages.authenticationFailed));
                            else if (!admin)
                                //res.json(Response(402, "Failure", constantsObj.messages.authenticationFailed));
                                User.findById(user.uid).populate('role').exec(function(err, admin) {

                                   res.json({ "code": 200, status: "OK", user: admin }); 
                                });    
                            else
                                res.json({ "code": 200, status: "OK", user: admin });
                        });
                    } else {
                        res.json(Response(402, "Failure", constantsObj.messages.authenticationFailed));
                    }
                }
            });
        } else {
            res.json(Response(402, "Failure", constantsObj.messages.authenticationFailed));
        }
    } else {
        res.json(Response(402, "Failure", constantsObj.messages.authenticationFailed));
    }
}


/**
 * Function is use to sign up user account 
 * @access private
 * @return json
 * Created by Udit
 * @smartData Enterprises (I) Ltd
 * Created Date 24-Jan-2017
 */
function userRegister(req, res) {
    if (!req.body.firstname || !req.body.lastname || !req.body.email || !req.body.institute || !req.body.password) {
        return res.json(Response(402, "failed", constantsObj.validationMessages.requiredFieldsMissing));
    } else if (req.body.email && !validator.isEmail(req.body.email)) {
        return res.json(Response(402, "failed", constantsObj.validationMessages.invalidEmail));
    } else {
        User.existCheck(req.body.email, '', function(err, exist) {
            if (err) {
                return res.json(Response(500, "failed", constantsObj.validationMessages.internalError, err));
            } else {
                if (exist != true) {
                    return res.json(Response(402, "failed", exist));
                } else {
                    var date = new Date();
                    var verifingLink = utility.getEncryptText(Math.random().toString(4).slice(2) + date.getTime());
                    Institute.findById(req.body.institute).exec(function(err, instituteData) {
                        if (err) {
                            return res.json(Response(500, "failed", constantsObj.validationMessages.internalError, err));
                        } else {
                            if (!instituteData) {
                                return res.json(Response(402, "failed", constantsObj.validationMessages.instituteNotFound));
                            } else {
                                var obj = {
                                    firstname: req.body.firstname,
                                    lastname: req.body.lastname,
                                    email: req.body.email.toLowerCase(),
                                    password: utility.getEncryptText(req.body.password),
                                    institute: instituteData._id,
                                    verifying_token: verifingLink
                                };
                                new User(obj).save(function(err, userData) {
                                    if (err) {
                                        return res.json(Response(500, "failed", utility.validationErrorHandler(err), err));
                                    } else {
                                        var userMailData = { email: userData.email, firstname: userData.firstname, lastname: userData.lastname, verifying_token: userData.verifying_token, password: req.body.password };
                                        utility.readTemplateSendMail(userData.email, constantsObj.emailSubjects.verify_email, userMailData, 'verify_email', function(err, resp) {});
                                        return res.json(Response(200, "success", constantsObj.messages.signupSuccess, { _id: userData._id }));
                                    }
                                });
                            }
                        }
                    });
                }
            }
        });
    }
}

/**
 * Function is use to login user
 * @access private
 * @return json
 * Created by sarvesh
 * @smartData Enterprises (I) Ltd
 * Created Date 16-Jan-2017
 */
function userLogin(req, res) {
    if (!req.body.email || !req.body.password || !req.body.deviceType || !req.body.deviceId || !req.body.deviceToken) {
        return res.json(Response(402, "failed", constantsObj.validationMessages.requiredFieldsMissing));;
    } else if (req.body.email && !validator.isEmail(req.body.email)) {
        return res.json(Response(402, "failed", constantsObj.validationMessages.invalidEmail));
    } else {
       
        if (req.body.deviceType == 'Android' || req.body.deviceType == 'iOS') {
            // var splitEmail = req.body.email.split('.');
            // if (splitEmail[splitEmail.length - 1] != 'edu') {
            //     return res.json(Response(402, "failed", constantsObj.validationMessages.eduNotContain));
            // } else {
            var jwtToken = null;
            var passEnc = utility.getEncryptText(req.body.password);
            var userData = {
                email: req.body.email.toLowerCase(),
                password: passEnc,
                deleted: false
            };
            User.findOne(userData, { password: 0, updatedAt: 0, createdAt: 0, verifying_token: 0, deleted: 0,updatedAt: 0,saved_card: 0 ,is_stripe_acc_verified: 0})
                .exec(function(err, userInfo) {
                    if (err) {
                        
                        res.json({ code: 402, message: 'Request could not be processed. Please try again.', data: {} });
                    } else {
                        if (userInfo != null) {
                            if (userInfo.status == 'Deactivate') {
                                res.json({ code: 402, message: 'Your account not activated yet.', data: {} });
                            } else if (userInfo.deleted == true) {
                                res.json({ code: 402, message: 'Your account has been deleted.', data: {} });
                            } else {
                                var expirationDuration = 1000 * 60 * 60 * 48 * 2; //60 * 60 * 8 * 1; // expiration duration 8 Hours
                                //var expirationDuration = 60; // expiration duration 1 minute
                                var params = {
                                    id: userInfo._id
                                }
                                jwtToken = jwt.sign(params, constantsObj.config.secret, {
                                    expiresIn: expirationDuration
                                });
                                if (!userInfo.deviceInfo) {
                                    userInfo.deviceInfo = [];
                                }
                                var index = 'index';
                                if (userInfo.deviceInfo.length > 0) {
                                    for (var i in userInfo.deviceInfo) {
                                        if (userInfo.deviceInfo[i].deviceToken == req.body.deviceToken) {
                                            index = i;
                                        }
                                    }
                                }
                                if (index != 'index') {
                                    userInfo.deviceInfo[index].access_token = jwtToken;
                                } else {
                                    userInfo.deviceInfo.push({access_token: jwtToken, deviceType: req.body.deviceType, deviceId: req.body.deviceId, deviceToken: req.body.deviceToken});
                                }
                                userInfo.save(function(err, userInfoDataModel) {
                                    if (err) {
                                        res.json({ code: 402, message: 'Request could not be processed. Please try again.', data: {} });
                                    } else {
                                        utility.removeExpiredTokenOfUser(userInfoDataModel);
                                        var userInfoData = userInfoDataModel.toObject();
                                        delete userInfoData.deviceInfo;
                                        delete userInfoData.status;
                                        if (userInfoData.stripe_account_id) {
                                            delete userInfoData.stripe_account_id;
                                        }
                                        userInfoData.token = 'Bearer ' + jwtToken;
                                        if (!userInfoData.profile_image) {
                                            userInfoData.profile_image = '';
                                        }
                                        Role.aggregate([
                                            { $match: { _id: userInfoData.role } }
                                        ], function(err, role) {
                                            var code = '';
                                            if (role[0]) {
                                                if (role[0].code) {
                                                    code = role[0].code;

                                                }
                                            }
                                           
                                            userInfoData.role_code = code;
                                            return res.json({ code: 200, message: 'User info fetched successfully.', data: userInfoData });
                                        });
                                       
                                    }
                                });
                            }
                        } else {
                            res.json({ code: 402, message: 'User email or password are not correct.', data: {} });
                        }

                    }
                });
            // }
        } else {
            return res.json(Response(402, "failed", constantsObj.validationMessages.invalidDeviceType));
        }
    }
}

/**
 * Function is admin login
 * @access private
 * @return json
 * Created by Udit
 * @smartData Enterprises (I) Ltd
 * Created Date 24-Jan-2017
 */
function adminLogin(req, res) {
    if (validator.isNull(req.body.email) || !req.body.email) {
        return res.json(Response(402, "failed", constantsObj.validationMessages.emailRequired));
    } else if (req.body.email && !validator.isEmail(req.body.email)) {
        return res.json(Response(402, "failed", constantsObj.validationMessages.invalidEmail));
    } else if (validator.isNull(req.body.password) || !req.body.password) {
        return res.json(Response(402, "failed", constantsObj.validationMessages.passwordRequired));
    } else {
        var passEnc = utility.getEncryptText(req.body.password);
        Admin.findOne({ email: req.body.email, password: passEnc})
             .populate('role')
            .lean()
            .exec(function(err, admin) {
                if (err) {
                    return res.json(Response(500, "failed", constantsObj.validationMessages.internalError, err));
                } else {
                    if (!admin) {
                        var passEnc = utility.getEncryptText(req.body.password);
                        User.findOne({ email: req.body.email, password: passEnc})
                            .populate('role')
                            .lean()
                            .exec(function(err, admin) {
                                 
                                if (err) {
                                    return res.json(Response(500, "failed", constantsObj.validationMessages.internalError, err));
                                } else {
                                    if (!admin) {
                                        return res.json(Response(402, "failed", constantsObj.validationMessages.invalidEmailOrPassword, err));
                                    }
                                    else  {
                                            if(admin.status == "Deactivate"){
                                                 return res.json(Response(402, "failed", constantsObj.messages.verificationFailed));
                                            }else if(admin.role.code == "Contractor"){
                                            var user = {}
                                            user.uid = admin._id;
                                            var token = jwt.sign(user, constantsObj.config.secret, {
                                                expiresIn: 1000 * 60 * 60 * 24 * 2 /*ms*s*m*h*day*/
                                            });
                                            admin.token = token;
                                            return res.json(Response(200, "success", constantsObj.messages.loginSuccess, admin, token));    
                                        }else{
                                            return res.json(Response(404, "failed", constantsObj.messages.invalidAuthoriseAccess, err));
                                        }   
                                        
                                    }
                                }
                            });
                    } else {
                        
                        var user = {}
                        user.uid = admin._id;
                        var token = jwt.sign(user, constantsObj.config.secret, {
                            expiresIn: 1000 * 60 * 60 * 24 * 2 /*ms*s*m*h*day*/
                        });
                        admin.token = token;
                        return res.json(Response(200, "success", constantsObj.messages.loginSuccess, admin, token));
                    }
                }
            });
    }
}

/**
 * Function is Contractor login
 * @access private
 * @return json
 * Created by Udit
 * @smartData Enterprises (I) Ltd
 * Created Date 10-Jul-2017
 */
function contractorLogin(req, res) {
    if (validator.isNull(req.body.email) || !req.body.email) {
        return res.json(Response(402, "failed", constantsObj.validationMessages.emailRequired));
    } else if (req.body.email && !validator.isEmail(req.body.email)) {
        return res.json(Response(402, "failed", constantsObj.validationMessages.invalidEmail));
    } else if (validator.isNull(req.body.password) || !req.body.password) {
        return res.json(Response(402, "failed", constantsObj.validationMessages.passwordRequired));
    } else {
        var passEnc = utility.getEncryptText(req.body.password);
        User.findOne({ email: req.body.email, password: passEnc  })
            .lean()
            .exec(function(err, admin) {
                if (err) {
                    return res.json(Response(500, "failed", constantsObj.validationMessages.internalError, err));
                } else {
                    if (!admin) {
                        return res.json(Response(402, "failed", constantsObj.validationMessages.invalidEmailOrPassword, err));
                    } else {
                        var user = {}
                        user.uid = admin._id;
                        var token = jwt.sign(user, constantsObj.config.secret, {
                            expiresIn: 1000 * 60 * 60 * 24 * 2 /*ms*s*m*h*day*/
                        });
                        admin.token = token;
                        return res.json(Response(200, "success", constantsObj.messages.loginSuccess, admin, token));
                    }
                }
            });
    }
}



/**
 * Function is use to activate user account after sign up by user id
 * @access private
 * @return json
 * Created by sarvesh
 * @smartData Enterprises (I) Ltd
 * Created Date 16-Jan-2017
 */
function userActivation(req, res) {
    var updateUserRecord = {
        status: 1,
    }
    User.update({ _id: req.body.userId }, { $set: updateUserRecord }, function(err) {
        if (err) {
            res.json({ code: 402, message: 'Request could not be processed. Please try again.', data: {} });
        } else {
            res.json({ code: 200, message: 'Your account has been activated successfully.' });
        }
    });
}

/**
 * Function is use to activate user account after sign up by verifying Link
 * @access private
 * @return json
 * Created by Udit
 * @smartData Enterprises (I) Ltd
 * Created Date 123-Jan-2017
 */
function verifyLink(req, res) {  
    User.findOne({
        verifying_token: req.params.id,
        deleted:false
    }, function(err, user) {
        if (err || !user) {
            res.redirect("/admin/#/verifying-link?success=false");
        } else {
            if (!user) {
                res.redirect("/admin/#/verifying-link?success=verified");
            } else {
                user.status = 'Activate';
                user.verifying_token = null;
                user.save(function(err, data) {
                    if (err)
                        res.redirect("/admin/#/verifying-link?success=false");
                    else {
                        res.redirect("/admin/#/verifying-link?success=true");
                    }
                });
            }
        }

    })
}

/**
 * Function is use for login with facebook
 * @access private
 * @return json
 * Created by Udit
 * @smartData Enterprises (I) Ltd
 * Created Date 25-Jan-2017
 */
function facebookLogin(req, res) {
    if (!req.body.firstname || !req.body.lastname || !req.body.email || !req.body.institute || !req.body.fb_token || !req.body.deviceType || !req.body.deviceId || !req.body.deviceToken) {
        return res.json(Response(402, "failed", constantsObj.validationMessages.requiredFieldsMissing));;
    } else if (req.body.email && !validator.isEmail(req.body.email)) {
        return res.json(Response(402, "failed", constantsObj.validationMessages.invalidEmail));
    } else {
        var internalError = constantsObj.validationMessages.internalError;
        async.waterfall([
                function(callback) {
                    User.findOne({ fb_token: req.body.fb_token }).lean().exec(function(err, userData) {
                        if (err)
                            callback(internalError);
                        else {
                            callback(null, userData);
                        }
                    });
                },
                function(userData, callback) {
                    if (!userData) {
                        /*If fb token is not present but email is present it will update fb_token to that user*/
                        User.findOne({ email: req.body.email }).exec(function(err, userInfo) {
                            if (err)
                                callback(internalError);
                            else {
                                if (userInfo) {
                                    userInfo.fb_token = req.body.fb_token;
                                    userInfo.save(function(err, userInfoData) {
                                        if (err)
                                            callback(internalError);
                                        else {
                                            callback(null, userInfoData);
                                        }
                                    });
                                } else {
                                    /*Signup start*/
                                    var date = new Date();
                                    var verifingLink = utility.getEncryptText(Math.random().toString(4).slice(2) + date.getTime());
                                    Institute.findById(req.body.institute).exec(function(err, instituteData) {
                                        if (err) {
                                            callback(internalError);
                                        } else {
                                            if (!instituteData) {
                                                callback(constantsObj.validationMessages.instituteNotFound);
                                            } else {
                                                var password = common.randomToken(6);
                                                var obj = {
                                                    firstname: req.body.firstname,
                                                    lastname: req.body.lastname,
                                                    email: req.body.email.toLowerCase(),
                                                    profile_image: req.body.profile_image,
                                                    password: utility.getEncryptText(password),
                                                    institute: instituteData._id,
                                                    verifying_token: verifingLink,
                                                    fb_token: req.body.fb_token,
                                                    status: 'Activate'
                                                };
                                                new User(obj).save(function(err, userInfoData) {
                                                    if (err) {
                                                        callback(internalError);
                                                    } else {
                                                        var userMailData = { email: userInfoData.email, firstname: userInfoData.firstname, lastname: userInfoData.lastname, verifying_token: userInfoData.verifying_token, password: password };
                                                        utility.readTemplateSendMail(userInfoData.email, constantsObj.emailSubjects.facebookLogin, userMailData, 'facebook_login', function(err, resp) {});
                                                        callback(null, userInfoData);
                                                    }
                                                });
                                            }
                                        }
                                    });
                                    /*Signup end*/
                                }
                            }
                        });
                    } else {
                        /*This is for login already created customer*/
                        callback(null, userData)
                    }
                }
            ],
            function(err, results) {
                if (err) {
                    return res.json(Response(500, "failed", err, {}));
                } else {
                    if (req.body.deviceType == 'Android' || req.body.deviceType == 'iOS') {
                        User.findOne({ _id: results._id }, { password: 0, updatedAt: 0, createdAt: 0, verifying_token: 0, deleted: 0, status: 0 })
                            .populate('institute', 'title')
                            .exec(function(err, userInfo) {
                                if (err)
                                    return res.json(Response(500, "failed", err, {}));
                                else {
                                    if (userInfo.status == 'Deactivate') {
                                        return res.json({ code: 402, message: 'Your account not activated yet.', data: {} });
                                    } else if (userInfo.deleted == true) {
                                        return res.json({ code: 402, message: 'Your account has been deleted.', data: {} });
                                    } else if (userInfo.institute._id != req.body.institute) {
                                        return res.json({ code: 402, message: 'Your are not registered for this institute.', data: {} });
                                    } else if (userInfo.email != req.body.email) {
                                        return res.json({ code: 402, message: 'Invalid email ID.', data: {} });
                                    } else {
                                        var expirationDuration = 60 * 60 * 8 * 1; // expiration duration 8 Hours
                                        //var expirationDuration = 60; // expiration duration 1 minute
                                        var params = {
                                            id: userInfo._id
                                        }
                                        var jwtToken = jwt.sign(params, constantsObj.config.secret, {
                                            expiresIn: expirationDuration
                                        });

                                        userInfo.token = jwtToken;
                                        if (!userInfo.deviceInfo) {
                                            userInfo.deviceInfo = {};
                                        }
                                        userInfo.deviceInfo.deviceType = req.body.deviceType;
                                        userInfo.deviceInfo.deviceId = req.body.deviceId;
                                        userInfo.deviceInfo.deviceToken = req.body.deviceToken;
                                        userInfo.save(function(err, userInfoData) {
                                            if (err) {
                                                res.json({ code: 402, message: 'Request could not be processed. Please try again.', data: {} });
                                            } else {
                                                userInfoData.token = 'Bearer ' + userInfoData.token;
                                                if (!userInfoData.profile_image) {
                                                    userInfoData.profile_image = '';
                                                }
                                                return res.json({ code: 200, message: 'User info fetched successfully.', data: userInfoData });
                                            }
                                        });
                                    }
                                }

                            });
                    } else {
                        return res.json(Response(402, "failed", constantsObj.validationMessages.invalidDeviceType));
                    }
                }
            });
    }
}

/**
 * Forgot password
 * @access private
 * @return json
 * Created by Udit
 * @smartData Enterprises (I) Ltd
 * Created Date 25-Jan-2017
 */
function forgotPassword(req, res) {
    if (validator.isNull(req.body.email)) {
        return res.json(Response(402, "failed", constantsObj.validationMessages.requiredFieldsMissing));
    } else {
        Admin.findOne({ "email": req.body.email }, function(err, adminData) {
            if (err) {
                return res.json(Response(500, "failed", constantsObj.validationMessages.internalError, err));
            } else {
                if (adminData) {
                    if (req.body.email == adminData.email) {
                        var userMailData = { email: adminData.email, firstname: adminData.firstname, lastname: adminData.lastname, password: utility.getDecryptText(adminData.password)};
                        utility.readTemplateSendMail(adminData.email, constantsObj.emailSubjects.forgotPassword, userMailData, 'forgot_password', function(err, resp) {

                        });
                        return res.json(Response(200, "success", constantsObj.messages.forgotPasswordSuccess, {}));
                    }
                } else {
                    User.findOne({ "email": req.body.email }, function(err, userData) {
                        if (err) {
                            return res.json(Response(500, "failed", constantsObj.validationMessages.internalError, err));
                        } else {
                            if (!userData) {
                                 return res.json({ code: 402, message: 'No Account found.', data: {} });
                            } else {
                                if (userData.email == req.body.email) {
                                    //console.log("user", userData)
                                    if (userData.status == 'Deactivate') {
                                        //console.log("Deactivate", userData.status)
                                        return res.json({ code: 402, message: 'Your account not activated yet.', data: {} });
                                    } else if (userData.deleted == true) {
                                        //console.log(userData.deleted)
                                        return res.json({ code: 402, message: 'Your account has been deleted.', data: {} });
                                    }
                                    var userMailData = { email: userData.email, firstname: userData.firstname, lastname: userData.lastname, password: utility.getDecryptText(userData.password)};
                                    utility.readTemplateSendMail(userData.email, constantsObj.emailSubjects.forgotPassword, userMailData, 'forgot_password', function(err, resp) {

                                    });
                                    return res.json(Response(200, "success", constantsObj.messages.forgotPasswordSuccess, {}));
                                }
                            }

                        }
                    })
                }
            }
        });
    }
}

/**
 * User Log out
 * @access private
 * @return json
 * Created by Udit
 * @smartData Enterprises (I) Ltd
 * Created Date 1-Fab-2017
 */
function userLogOut(req, res) {
    if (!req.body.userId || !req.body.deviceToken) {
        return res.json(Response(402, "failed", constantsObj.validationMessages.requiredFieldsMissing));
    } else {
        var userId = req.body.userId;
        User.findById(userId).exec(function(err, user) {
            if (err) {
                return res.json(Response(500, "failed", constantsObj.validationMessages.internalError, {}));
            } else {
                if (user) {
                       var index = 'index';
                        if (user.deviceInfo.length > 0) {
                            for (var i in user.deviceInfo) {
                                if (user.deviceInfo[i].deviceToken == req.body.deviceToken) {
                                    index = i;
                                }
                            }
                        }
                        if (index != 'index') {
                            user.deviceInfo.splice(index, 1);
                        }
                    user.save(function(err, data) {
                        if (err) {
                            return res.json(Response(500, "failed", constantsObj.validationMessages.internalError, {}));
                        } else {
                            return res.json(Response(200, "success", constantsObj.messages.logoutSuccess, {}));
                        }
                    });
                } else {
                    return res.json(Response(402, "failed", constantsObj.validationMessages.userNotFound, {}));
                }
            }
        });
    }
}

/**
 * Function is use to send subscription email
 * @access private
 * @return json
 * Created by Ashish
 * @smartData Enterprises (I) Ltd
 * Created Date 12-Jul-2017
 */
function sendSubscriptionEmail(req, res) {
    if (!req.body.email) {
        return res.json(Response(402, "failed", constantsObj.validationMessages.requiredFieldsMissing));
    } else if (req.body.email && !validator.isEmail(req.body.email)) {
        return res.json(Response(402, "failed", constantsObj.validationMessages.invalidEmail));
    } else {
            var userMailData = { email: req.body.email};
            utility.readTemplateSendMailSubscribe(req.body.email, constantsObj.emailSubjects.sendSubscription, userMailData, 'subcribe_user', function(err, resp) {});
            return res.json(Response(200, "success", constantsObj.messages.subscribeSucess));
    }
}


/**
 * Function is use to send feedback to user
 * @access private
 * @return json
 * Created by Rahul Tiwari
 * @smartData Enterprises (I) Ltd
 * Created Date 08-sept-2017
 */
function sendfeedback(req,res){
  
 if(!req.body.firstname || !req.body.lastname || !req.body.email || !req.body.message){
    return res.json(Response(402, "failed", constantsObj.validationMessages.requiredFieldsMissing));;
 }else{
    var userMailData = { email: req.body.email, firstname: req.body.firstname, lastname: req.body.lastname, message: req.body.message};
    utility.readTemplateSendFeedback(req.body.email, constantsObj.emailSubjects.sendFeddback, userMailData, 'feedback', function(err, resp) {});
    return res.json(Response(200, "Feedback send successfully"));
  }
}


function getUsersPermission(req, res){

}


