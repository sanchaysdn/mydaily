'use strict';

var mongoose = require('mongoose'),
    User = mongoose.model('User'),
    ForemenCrew = mongoose.model('Foremen_crew'),
    Foremen_assignJob = mongoose.model('Foremen_assign_jobs'),
    SupervisorJob = mongoose.model('Supervisor_jobs'),
    Role = mongoose.model('Role'),
    Admin = mongoose.model('Admin'),
    Job = mongoose.model('Job'),
    Response = require('../lib/response.js'),
    formidable = require('formidable'),
    util = require('util'),
    fs = require('fs-extra'),
    path = require('path'),
    utility = require('../lib/utility.js'),
    constantsObj = require('./../../constants'),
    config = require('../../config/config.js'),
    validator = require('validator'),
    async = require('async'),
    co = require('co'),
    moment = require('moment'),
    common = require('../../config/common.js');
var stripe = require("stripe")(config.STRIPEKEY);

module.exports = {
    updateUserData: updateUserData,
    addContractor: addContractor,
    addSupervisor: addSupervisor,
    addForemen: addForemen,
    addSubcontractor: addSubcontractor,
    updateUserPic: updateUserPic,
    changePassword: changePassword,
    getUserList: getUserList,
    getSupervisorList: getSupervisorList,
    getForemenDetail: getForemenDetail,
    getForemenList: getForemenList,
    getAllForemenList: getAllForemenList,
    getAllSupervisor: getAllSupervisor,
    getRoleList: getRoleList,
    getUserById: getUserById,
    deleteUserById: deleteUserById,
    enableDisableUser: enableDisableUser,
    adminProfileUpdate: adminProfileUpdate,
    dashboardCount: dashboardCount,
    updateUser: updateUser,
    updateQuickBloxDetails: updateQuickBloxDetails,
    deleteSavedCard: deleteSavedCard,
    addCard: addCard,
    contractorCount: contractorCount,
    uploadImage: uploadImage,
    updateUserStatus: updateUserStatus,
    extendUserTrial: extendUserTrial,
    purchaseDailies:purchaseDailies
     
};

/**
 * Function is use to update user
 * @access private
 * @return json
 * Created by Ashish
 * @smartData Enterprises (I) Ltd
 * Created Date 14-Jul-2017
 */
function updateUserData(req, res) {
    if (!req.body.firstname || !req.body.lastname || !req.body.email) {
        return res.json(Response(402, "failed", constantsObj.validationMessages.requiredFieldsMissing));
    } else if (req.body.email && !validator.isEmail(req.body.email)) {
        return res.json(Response(402, "failed", constantsObj.validationMessages.invalidEmail));
    } else {
        User.findById(req.body._id).exec(function (err, userInfoData) {
            if (err) {
                return res.json(Response(500, "failed", constantsObj.validationMessages.internalError, err));
            } else {
                User.existCheck(req.body.email, ((userInfoData) ? userInfoData._id : ''), function (err, exist) {
                    if (err) {
                        return res.json(Response(500, "failed", constantsObj.validationMessages.internalError, err));
                    } else {
                        if (exist != true) {
                            return res.json(Response(402, "failed", exist));
                        } else {
                            var date = new Date();
                            var verifingLink = utility.getEncryptText(Math.random().toString(4).slice(2) + date.getTime());
                            var model = new User();
                            if (userInfoData) {
                                model = userInfoData;
                            }
                            model.firstname = req.body.firstname;
                            model.lastname = req.body.lastname;
                            model.email = req.body.email;
                            model.save(function (err, userData) {
                                if (err) {
                                    return res.json(Response(500, "failed", utility.validationErrorHandler(err), {}));
                                } else {
                                    return res.json(Response(200, "success", ((userInfoData) ? constantsObj.messages.userUpdatedSuccess : constantsObj.messages.userAddedSuccess), {
                                        _id: userData._id,
                                        role_code: req.body.role_code
                                    }));
                                }
                            });
                        }
                    }
                });
            }
        });
    }
}


/**
 * Function is use to add and update contrcator
 * @access private
 * @return json
 * Created by Ashish T
 * @smartData Enterprises (I) Ltd
 * Created Date 14-Jul-2017
 */
function addContractor(req, res) {

    if (!req.body.company_name || !req.body.firstname || !req.body.lastname || !req.body.email) {
        return res.json(Response(402, "failed", constantsObj.validationMessages.requiredFieldsMissing));;
    } else if (req.body.email && !validator.isEmail(req.body.email)) {
        return res.json(Response(402, "failed", constantsObj.validationMessages.invalidEmail));
    } else {
        User.findById(req.body._id).exec(function (err, userInfoData) {
            if (err) {
                return res.json(Response(500, "failed", constantsObj.validationMessages.internalError, err));
            } else {
                User.existCheck(req.body.email.toLowerCase(), ((userInfoData) ? userInfoData._id : ''), function (err, exist) {
                    if (err) {
                        return res.json(Response(500, "failed", constantsObj.validationMessages.internalError, err));
                    } else {
                        if (exist != true) {
                            return res.json(Response(402, "failed", exist));
                        } else {
                            var date = new Date();
                            var verifingLink = utility.getEncryptText(Math.random().toString(4).slice(2) + date.getTime());
                            Role.findOne({
                                'code': 'Contractor'
                            }, function (err, role) {
                                var password = common.randomToken(6);
                                var model = new User();
                                if (userInfoData) {
                                    model = userInfoData;
                                }
                                model.company_name = req.body.company_name;
                                model.firstname = req.body.firstname;
                                model.lastname = req.body.lastname;
                                model.email = req.body.email.toLowerCase();
                                model.role = mongoose.Types.ObjectId(role._id);
                                model.parent_id = null;
                                if (!userInfoData) {
                                    model.password = utility.getEncryptText(req.body.newPassword);
                                    model.verifying_token = verifingLink;
                                    model.customer_id = utility.generateCustomerID();
                                }
                                //console.log('asdasd',req.body.token);return
                                if (req.body.trial_period == true) {
                                    stripe.customers.create({
                                        email: req.body.email,
                                        source: req.body.token
                                    }).then(function (customer) {
                                        model.stripe_customer_id = customer.id;
                                        model.saved_card.push({
                                            customer_id: customer.id,
                                            last4: customer.sources.data[0].last4,
                                            brand: customer.sources.data[0].brand
                                        });
                                        // model.trial_period = true;
                                        model.trial_period = false;
                                        model.paid_status=true;
                                          
                                        // CalCulating Payment for five users
                                        var now = moment();
                                        var days = moment(now).daysInMonth();
                                        var currentDate = now.date();

                                        var subPrice = (days - currentDate);
                                        var divPrice = (subPrice / days);
                                        var actualAmount = parseFloat((parseInt(req.body.initialAmount) * divPrice));
                                        model.bill_amount = actualAmount;
                                        model.initial_user = req.body.userCount;
                                        // YOUR CODE: Save the customer ID and other info in a database for later.
                                        model.save(function (err, userData) {
                                            if (err) {
                                                return res.json(Response(500, "failed", utility.validationErrorHandler(err), {}));
                                            } else {
                                                if (!userInfoData) {
                                                    var userMailData = {
                                                        email: userData.email,
                                                        firstname: userData.firstname,
                                                        lastname: userData.lastname,
                                                        verifying_token: userData.verifying_token,
                                                        password: req.body.newPassword
                                                    };
                                                    utility.readTemplateSendMail(userData.email, constantsObj.emailSubjects.verify_email, userMailData, 'verify_email', function (err, resp) {});
                                                }
                                                return res.json(Response(200, "success", ((userInfoData) ? constantsObj.messages.contractorUpdatedSuccess : constantsObj.messages.contractorAddedSuccess), {
                                                    _id: userData._id
                                                }));
                                            }
                                        });
                                    });
                                } else {
                                    model.expiry_date = moment().add(30, 'days');
                                    model.reminder_date = moment().add(25, 'days');
                                        model.trial_period=true;

                                    model.save(function (err, userData) {
                                        if (err) {
                                            return res.json(Response(500, "failed", utility.validationErrorHandler(err), {}));
                                        } else {
                                            if (!userInfoData) {
                                                var userMailData = {
                                                    email: userData.email,
                                                    firstname: userData.firstname,
                                                    lastname: userData.lastname,
                                                    verifying_token: userData.verifying_token,
                                                    password: req.body.newPassword
                                                };
                                                utility.readTemplateSendMail(userData.email, constantsObj.emailSubjects.verify_email, userMailData, 'verify_email', function (err, resp) {});
                                            }
                                            return res.json(Response(200, "success", ((userInfoData) ? constantsObj.messages.contractorUpdatedSuccess : constantsObj.messages.contractorAddedSuccess), {
                                                _id: userData._id
                                            }));
                                        }
                                    });
                                }
                            });
                        }
                    }
                });
            }
        });
    }
}


// function updateUserStatus1(req, res) {
//     console.log("updateUserStatus===============>>>>>>.", req.body)
//     var arrayOfId = new Array
//     console.log(arrayOfId, "arrayOfId>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>")
//     req.body.data.map(x => arrayOfId.push(x.id))
//     // console.log(req.body.data[0].id, req.body.data[0].deleted, "JSON EXTRACTED")
//     //console.log(req, "inside backend");
//     // if (!req.body._id) {
//     //     return res.json(Response(402,
//     //         "failed",
//     //         constantsObj.validationMessages.requiredFieldsMissing))

//     // }
//     // if (req.body) {
//     //     console.log(req.body, "inside backend");
//     // }
//     if (req.body.data[0].deleted) {
//         // User.update(req.body.email, ((userInfoData) ? userInfoData._id : ''), function (err, exist) {

//         // });

//         User.update({
//             _id: {
//                 $in: arrayOfId
//             }
//         }, {
//             $set: {
//                 deleted: true
//             }
//         }, function (err, data) {
//             if (err) {
//                 // console.log(err)
//                 return res.json(Response(500, "failed", utility.validationErrorHandler(err), {}));
//             } else {
//                 console.log(data, "dataaaaaaaaaaaaaaaaaaaa");
//                 return res.json(Response(402, "Success", constantsObj.message.userUpdatedSuccess));
//             }
//         })
//     }
// }

function updateUserStatus(req, res) {
    console.log(req.body)
    var inputData = req.body;
    //var roleLength = inputData.data.length;

    // var bulk = User.collection.initializeUnorderedBulkOp();

    // for (var i = 0; i < roleLength; i++) {
    async.each(inputData.data, function (userData, callback) {
        var id = mongoose.Types.ObjectId(userData.id);
        User.findOneAndUpdate({
            _id: id
        }, {
            $set: userData
        }, function (err, updatedata) {
            if (err) {
                console.log("sdfsdfds")
            } else {
                callback();
            }
        });
    }, function (err) {
        if (err) {
            console.log('A file failed to process');
        } else {
            return res.json(Response(200, "success", constantsObj.messages.userUpdatedSuccess));
        }
        //console.log('A email sent successfully');

    });
    // res.jsonp({
    //     'status': 'success',
    //     'messageId': 200,
    //     'message': "User updated successfully."
    // });

}


/**
 * Function is use to add and update spervisor
 * @access private
 * @return json
 * Created by Ashish T
 * @smartData Enterprises (I) Ltd
 * Created Date 14-Jul-2017
 */
function addSupervisor(req, res) {
    if (!req.body.firstname || !req.body.lastname || !req.body.email) {
        return res.json(Response(402, "failed", constantsObj.validationMessages.requiredFieldsMissing));;
    } else if (req.body.email && !validator.isEmail(req.body.email)) {
        return res.json(Response(402, "failed", constantsObj.validationMessages.invalidEmail));
    } else {
        User.findById(req.body._id).exec(function (err, userInfoData) {
            if (err) {
                return res.json(Response(500, "failed", constantsObj.validationMessages.internalError, err));
            } else {
                User.existCheck(req.body.email.toLowerCase(), ((userInfoData) ? userInfoData._id : ''), function (err, exist) {
                    if (err) {
                        return res.json(Response(500, "failed", constantsObj.validationMessages.internalError, err));
                    } else {
                        if (exist != true) {
                            return res.json(Response(402, "failed", exist));
                        } else {

                            User.count({
                                parent_id: mongoose.Types.ObjectId(req.body.parent_id),
                                trial_period: true,
                                deleted: false
                            }, function (err, count) {
                                if (count >= 5) {
                                    User.findOne({
                                        '_id': mongoose.Types.ObjectId(req.body.parent_id)
                                    }, function (err, parentUser) {
                                        var model = new User();
                                        // CalCulating Payment for five users
                                        var now = moment();
                                        var days = moment(now).daysInMonth();
                                        var currentDate = now.date();
                                        if (parentUser) {
                                            model = parentUser;
                                        }
                                        var subPrice = (days - currentDate);
                                        var divPrice = (subPrice / days);
                                        var actualAmount = parseFloat((100 * divPrice));
                                        parentUser.bill_amount = (parseFloat(parentUser.bill_amount) + parseFloat(actualAmount));
                                        parentUser.initial_user = (parseInt(parentUser.initial_user) + parseInt(1));
                                        // YOUR CODE: Save the customer ID and other info in a database for later.
                                        model.save(function (err, userData) {
                                            if (err) {
                                                return res.json(Response(500, "failed", utility.validationErrorHandler(err), {}));
                                            } else {
                                                var date = new Date();
                                                var verifingLink = utility.getEncryptText(Math.random().toString(4).slice(2) + date.getTime());
                                                Role.findOne({
                                                    'code': 'SV'
                                                }, function (err, role) {
                                                    var password = common.randomToken(6);
                                                    var model = new User();
                                                    if (userInfoData) {
                                                        model = userInfoData;
                                                    }
                                                    model.firstname = req.body.firstname;
                                                    model.lastname = req.body.lastname;
                                                    model.email = req.body.email.toLowerCase();
                                                    model.role = mongoose.Types.ObjectId(role._id);
                                                    model.parent_id = mongoose.Types.ObjectId(req.body.parent_id);
                                                    if (!userInfoData) {
                                                        model.password = utility.getEncryptText(req.body.newPassword);
                                                        model.verifying_token = verifingLink;
                                                    }
                                                    model.save(function (err, userData) {
                                                        if (err) {
                                                            return res.json(Response(500, "failed", utility.validationErrorHandler(err), {}));
                                                        } else {
                                                            if (!userInfoData) {
                                                                var userMailData = {
                                                                    email: userData.email,
                                                                    firstname: userData.firstname,
                                                                    lastname: userData.lastname,
                                                                    verifying_token: userData.verifying_token,
                                                                    password: req.body.newPassword
                                                                };
                                                                utility.readTemplateSendMail(userData.email, constantsObj.emailSubjects.verify_email, userMailData, 'verify_email', function (err, resp) {});
                                                            }
                                                            return res.json(Response(200, "success", ((userInfoData) ? constantsObj.messages.supervisorUpdatedSuccess : constantsObj.messages.supervisorAddedSuccess), {
                                                                _id: userData._id
                                                            }));
                                                        }
                                                    });
                                                });
                                            }
                                        });
                                    });
                                } else {
                                    var date = new Date();
                                    var verifingLink = utility.getEncryptText(Math.random().toString(4).slice(2) + date.getTime());
                                    Role.findOne({
                                        'code': 'SV'
                                    }, function (err, role) {
                                        var password = common.randomToken(6);
                                        var model = new User();
                                        if (userInfoData) {
                                            model = userInfoData;
                                        }
                                        model.firstname = req.body.firstname;
                                        model.lastname = req.body.lastname;
                                        model.email = req.body.email.toLowerCase();
                                        model.role = mongoose.Types.ObjectId(role._id);
                                        model.parent_id = mongoose.Types.ObjectId(req.body.parent_id);
                                        if (!userInfoData) {
                                            model.password = utility.getEncryptText(req.body.newPassword);
                                            model.verifying_token = verifingLink;
                                        }
                                        model.save(function (err, userData) {
                                            if (err) {
                                                return res.json(Response(500, "failed", utility.validationErrorHandler(err), {}));
                                            } else {
                                                if (!userInfoData) {
                                                    var userMailData = {
                                                        email: userData.email,
                                                        firstname: userData.firstname,
                                                        lastname: userData.lastname,
                                                        verifying_token: userData.verifying_token,
                                                        password: req.body.newPassword
                                                    };
                                                    utility.readTemplateSendMail(userData.email, constantsObj.emailSubjects.verify_email, userMailData, 'verify_email', function (err, resp) {});
                                                }
                                                return res.json(Response(200, "success", ((userInfoData) ? constantsObj.messages.supervisorUpdatedSuccess : constantsObj.messages.supervisorAddedSuccess), {
                                                    _id: userData._id
                                                }));
                                            }
                                        });
                                    });
                                }
                            });

                        }
                    }
                });
            }
        });
    }
}


/**
 * Function is use to add and update foremen
 * @access private
 * @return json
 * Created by Ashish T
 * @smartData Enterprises (I) Ltd
 * Created Date 14-Jul-2017
 */
function addForemen(req, res) {
    if (!req.body.firstname || !req.body.lastname || !req.body.email) {
        return res.json(Response(402, "failed", constantsObj.validationMessages.requiredFieldsMissing));;
    } else if (req.body.email && !validator.isEmail(req.body.email)) {
        return res.json(Response(402, "failed", constantsObj.validationMessages.invalidEmail));
    } else {
        User.findById(req.body._id).exec(function (err, userInfoData) {
            if (err) {
                return res.json(Response(500, "failed", constantsObj.validationMessages.internalError, err));
            } else {
                User.existCheck(req.body.email.toLowerCase(), ((userInfoData) ? userInfoData._id : ''), function (err, exist) {
                    if (err) {
                        return res.json(Response(500, "failed", constantsObj.validationMessages.internalError, err));
                    } else {
                        if (exist != true) {
                            return res.json(Response(402, "failed", exist));
                        } else {
                            User.count({
                                parent_id: mongoose.Types.ObjectId(req.body.parent_id),
                                trial_period: true,
                                deleted: false
                            }, function (err, count) {
                                if (count >= 5) {
                                    User.findOne({
                                        '_id': mongoose.Types.ObjectId(req.body.parent_id)
                                    }, function (err, parentUser) {
                                        var model = new User();
                                        // CalCulating Payment for five users
                                        var now = moment();
                                        var days = moment(now).daysInMonth();
                                        var currentDate = now.date();
                                        if (parentUser) {
                                            model = parentUser;
                                        }
                                        var subPrice = (days - currentDate);
                                        var divPrice = (subPrice / days);
                                        var actualAmount = parseFloat((100 * divPrice));
                                        parentUser.bill_amount = (parseFloat(parentUser.bill_amount) + parseFloat(actualAmount));
                                        parentUser.initial_user = (parseInt(parentUser.initial_user) + parseInt(1));
                                        // YOUR CODE: Save the customer ID and other info in a database for later.
                                        model.save(function (err, userData) {
                                            if (err) {
                                                return res.json(Response(500, "failed", utility.validationErrorHandler(err), {}));
                                            } else {
                                                var date = new Date();
                                                var verifingLink = utility.getEncryptText(Math.random().toString(4).slice(2) + date.getTime());
                                                Role.findOne({
                                                    'code': 'FM'
                                                }, function (err, role) {
                                                    var password = common.randomToken(6);
                                                    var model = new User();
                                                    if (userInfoData) {
                                                        model = userInfoData;
                                                    }
                                                    model.firstname = req.body.firstname;
                                                    model.lastname = req.body.lastname;
                                                    model.email = req.body.email.toLowerCase();
                                                    model.role = mongoose.Types.ObjectId(role._id);
                                                    model.parent_id = mongoose.Types.ObjectId(req.body.parent_id);
                                                    if (!userInfoData) {
                                                        model.password = utility.getEncryptText(req.body.newPassword);
                                                        model.verifying_token = verifingLink;
                                                    }
                                                    model.save(function (err, userData) {
                                                        if (err) {
                                                            return res.json(Response(500, "failed", utility.validationErrorHandler(err), {}));
                                                        } else {
                                                            if (!userInfoData) {
                                                                var userMailData = {
                                                                    email: userData.email,
                                                                    firstname: userData.firstname,
                                                                    lastname: userData.lastname,
                                                                    verifying_token: userData.verifying_token,
                                                                    password: req.body.newPassword
                                                                };
                                                                utility.readTemplateSendMail(userData.email, constantsObj.emailSubjects.verify_email, userMailData, 'verify_email', function (err, resp) {});
                                                            }
                                                            return res.json(Response(200, "success", ((userInfoData) ? constantsObj.messages.foremanUpdatedSuccess : constantsObj.messages.foremanAddedSuccess), {
                                                                _id: userData._id
                                                            }));
                                                        }
                                                    });
                                                });
                                            }
                                        });
                                    });
                                } else {
                                    var date = new Date();
                                    var verifingLink = utility.getEncryptText(Math.random().toString(4).slice(2) + date.getTime());
                                    Role.findOne({
                                        'code': 'FM'
                                    }, function (err, role) {
                                        var password = common.randomToken(6);
                                        var model = new User();
                                        if (userInfoData) {
                                            model = userInfoData;
                                        }
                                        model.firstname = req.body.firstname;
                                        model.lastname = req.body.lastname;
                                        model.email = req.body.email.toLowerCase();
                                        model.role = mongoose.Types.ObjectId(role._id);
                                        model.parent_id = mongoose.Types.ObjectId(req.body.parent_id);
                                        if (!userInfoData) {
                                            model.password = utility.getEncryptText(req.body.newPassword);
                                            model.verifying_token = verifingLink;
                                        }
                                        model.save(function (err, userData) {
                                            if (err) {
                                                return res.json(Response(500, "failed", utility.validationErrorHandler(err), {}));
                                            } else {
                                                if (!userInfoData) {
                                                    var userMailData = {
                                                        email: userData.email,
                                                        firstname: userData.firstname,
                                                        lastname: userData.lastname,
                                                        verifying_token: userData.verifying_token,
                                                        password: req.body.newPassword
                                                    };
                                                    utility.readTemplateSendMail(userData.email, constantsObj.emailSubjects.verify_email, userMailData, 'verify_email', function (err, resp) {});
                                                }
                                                return res.json(Response(200, "success", ((userInfoData) ? constantsObj.messages.foremanUpdatedSuccess : constantsObj.messages.foremanAddedSuccess), {
                                                    _id: userData._id
                                                }));
                                            }
                                        });
                                    });
                                }
                            });
                        }
                    }
                });
            }
        });
    }
}






/**
 * Function is use to update user
 * @access private
 * @return json
 * Created by udit
 * @smartData Enterprises (I) Ltd
 * Created Date 16-Jan-2017
 */
function updateUser(req, res) {
    if (!req.body.firstname || !req.body.lastname || !req.body._id) {
        return res.json(Response(402, "failed", constantsObj.validationMessages.requiredFieldsMissing));;
    } else {
        User.findById(req.body._id).exec(function (err, userInfoData) {
            if (err || !userInfoData) {
                return res.json(Response(500, "failed", constantsObj.validationMessages.internalError, err));
            } else {
                userInfoData.firstname = req.body.firstname;
                userInfoData.lastname = req.body.lastname;
                userInfoData.save(function (err, userData) {
                    if (err) {
                        return res.json(Response(500, "failed", utility.validationErrorHandler(err), {}));
                    } else {
                        return res.json(Response(200, "success", constantsObj.messages.userUpdatedSuccess, {
                            _id: userData._id
                        }));
                    }
                });
            }
        });
    }
}

/**
 * Function is use to update user profile pic
 * @access private
 * @return json
 * Created by sarvesh
 * @smartData Enterprises (I) Ltd
 * Created Date 16-Jan-2017
 */
function updateUserPic(req, res) {
    co(function* () {
        var timestamp = Number(new Date()); // current time as number
        var form = new formidable.IncomingForm();
        var file = req.swagger.params.file.value;
        var userId = req.swagger.params.id.value;
        var splitFile = file.originalname.split('.');
        var filename = +timestamp + '_' + common.randomToken(6) + '.' + ((splitFile.length > 0) ? splitFile[splitFile.length - 1] : file.originalname);
        var imagePath = "./public/assets/uploads/" + filename;
        let imageUploaded = yield utility.fileUpload(imagePath, file.buffer);
        let userData = yield User.findById(userId);
        if (userData) {
            let oldFileName = userData.profile_image;
            userData.profile_image = "assets/uploads/" + filename;
            let userUpdated = yield userData.save();
            if (oldFileName) {
                var fs = require('fs');
                var filePath = __dirname + '/../../public/' + oldFileName;
                fs.unlinkSync(filePath);
            }
            return res.json({
                code: 200,
                message: 'User profile pic updated successfully.',
                data: {
                    profile_image: "assets/uploads/" + filename
                }
            });
        } else {
            return res.json({
                code: 402,
                message: 'User not found',
                data: {}
            });
        }
    }).catch(function (err) {
        console.log(err);
        res.json({
            code: 402,
            'message': 'Request could not be processed. Please try again.',
            data: {}
        });
    });
}


/**
 * Function is use to change user password by user id
 * @access private
 * @return json
 * Created by sarvesh
 * @smartData Enterprises (I) Ltd
 * Created Date 16-Jan-2017
 */
function changePassword(req, res) {
    if (!req.body.userId || !req.body.oldPassword || !req.body.newPassword) {
        return res.json(Response(402, "failed", constantsObj.validationMessages.requiredFieldsMissing));;
    } else if (req.body.oldPassword == req.body.newPassword) {
        return res.json(Response(402, "failed", constantsObj.validationMessages.passwordNotMatch));;
    } else {
        var model = User;
        if (req.body.level === "ADMIN") {
            model = Admin;
        }
        model.findOne({
            _id: req.body.userId
        }, {
            password: 1
        }, function (err, users) {
            if (err) {
                res.json({
                    code: 402,
                    message: 'Request could not be processed. Please try again.',
                    data: {}
                });
            } else {
                if (users) {
                    if (users.password == utility.getEncryptText(req.body.oldPassword)) {
                        var updateUserRecord = {
                            password: utility.getEncryptText(req.body.newPassword)
                        }
                        model.update({
                            _id: req.body.userId
                        }, {
                            $set: updateUserRecord
                        }, function (err) {
                            if (err) {
                                res.json({
                                    code: 402,
                                    message: 'Request could not be processed. Please try again.',
                                    data: {}
                                });
                            } else {
                                res.json({
                                    code: 200,
                                    message: 'Password has been reset.',
                                    data: {}
                                });
                            }
                        });
                    } else {
                        res.json({
                            code: 402,
                            message: 'Please provide correct current password.',
                            data: {}
                        });
                    }
                } else {
                    return res.json(Response(402, "failed", constantsObj.validationMessages.userNotFound, {}));
                }
            }
        });
    }
}

/**
 * Function is use to update admin profile
 * @access private
 * @return json
 * Created by Udit
 * @smartData Enterprises (I) Ltd
 * Created Date 30-Jan-2017
 */
function adminProfileUpdate(req, res) {
    if (req.body.level === "Contractor") {
        if (!req.body.userId || !req.body.email) {
            return res.json(Response(402, "failed", constantsObj.validationMessages.requiredFieldsMissing));;
        } else {
            User.findOne({
                _id: req.body.userId
            }, {
                email: 1
            }, function (err, users) {
                if (err) {
                    res.json({
                        code: 402,
                        message: 'Request could not be processed. Please try again.',
                        data: {}
                    });
                } else {
                    if (users) {
                        var updateUserRecord = {
                            email: req.body.email,
                            firstname: req.body.firstname,
                            lastname: req.body.lastname
                        }
                        User.update({
                            _id: req.body.userId
                        }, {
                            $set: updateUserRecord
                        }, function (err) {
                            if (err) {
                                res.json({
                                    code: 402,
                                    message: 'Request could not be processed. Please try again.',
                                    data: {}
                                });
                            } else {
                                res.json({
                                    code: 200,
                                    message: 'Profile updated successfully.',
                                    data: {
                                        id: req.body.userId
                                    }
                                });
                            }
                        });
                    } else {
                        return res.json(Response(402, "failed", constantsObj.validationMessages.userNotFound, {}));
                    }
                }
            });
        }
    } else {
        if (!req.body.userId || !req.body.email) {
            return res.json(Response(402, "failed", constantsObj.validationMessages.requiredFieldsMissing));;
        } else {
            Admin.findOne({
                _id: req.body.userId
            }, {
                email: 1
            }, function (err, users) {
                if (err) {
                    res.json({
                        code: 402,
                        message: 'Request could not be processed. Please try again.',
                        data: {}
                    });
                } else {
                    if (users) {
                        var updateUserRecord = {
                            email: req.body.email,
                            firstname: req.body.firstname,
                            lastname: req.body.lastname
                        }
                        Admin.update({
                            _id: req.body.userId
                        }, {
                            $set: updateUserRecord
                        }, function (err) {
                            if (err) {
                                res.json({
                                    code: 402,
                                    message: 'Request could not be processed. Please try again.',
                                    data: {}
                                });
                            } else {
                                res.json({
                                    code: 200,
                                    message: 'Profile updated successfully.',
                                    data: {
                                        id: req.body.userId
                                    }
                                });
                            }
                        });
                    } else {
                        return res.json(Response(402, "failed", constantsObj.validationMessages.userNotFound, {}));
                    }
                }
            });
        }
    }

}


function uploadImage(req, res) {
    var timestamp = Number(new Date()); // current time as number
    var form = new formidable.IncomingForm();
    var file = req.swagger.params.file.value;
    var userId = req.swagger.params.id.value;
    var splitFile = file.originalname.split('.');
    var filename = +timestamp + '_' + common.randomToken(6) + '.' + ((splitFile.length > 0) ? splitFile[splitFile.length - 1] : file.originalname);
    var imagePath = "./public/assets/uploads/users/" + filename;

    // utility.fileUpload(imagePath, file.buffer).then(function() {
    fs.writeFile(path.resolve(imagePath), file.buffer, function (err) {
        if (err) {
            res.json({
                code: 402,
                'message': 'Request could not be processed. Please try again.',
                data: {}
            });
        } else {
            if (req.body.level === "Contractor") {
                User.findOne({
                    _id: userId
                }, function (err, users) {
                    if (err) {
                        res.json({
                            code: 402,
                            message: 'Request could not be processed. Please try again.',
                            data: {}
                        });
                    } else {
                        if (users) {
                            var updateUserRecord = {
                                profile_image: "/assets/uploads/users/" + filename,
                            }
                            User.update({
                                _id: userId
                            }, {
                                $set: updateUserRecord
                            }, function (err) {
                                if (err) {
                                    res.json({
                                        code: 402,
                                        message: 'Request could not be processed. Please try again.',
                                        data: {}
                                    });
                                } else {
                                    res.json({
                                        code: 200,
                                        message: 'User image added successfully.',
                                        data: {
                                            profile_image: "/assets/uploads/users/" + filename
                                        }
                                    });
                                }
                            });
                        } else {
                            return res.json(Response(402, "failed", constantsObj.validationMessages.userNotFound, {}));
                        }
                    }
                });
            } else {
                Admin.findOne({
                    _id: userId
                }, function (err, users) {
                    if (err) {
                        res.json({
                            code: 402,
                            message: 'Request could not be processed. Please try again.',
                            data: {}
                        });
                    } else {
                        if (users) {
                            var updateUserRecord = {
                                profile_image: "/assets/uploads/users/" + filename,
                            }
                            Admin.update({
                                _id: userId
                            }, {
                                $set: updateUserRecord
                            }, function (err) {
                                if (err) {
                                    res.json({
                                        code: 402,
                                        message: 'Request could not be processed. Please try again.',
                                        data: {}
                                    });
                                } else {
                                    res.json({
                                        code: 200,
                                        message: 'User image added successfully.',
                                        data: {
                                            profile_image: "/assets/uploads/users/" + filename
                                        }
                                    });
                                }
                            });
                        } else {
                            return res.json(Response(402, "failed", constantsObj.validationMessages.userNotFound, {}));
                        }
                    }
                });
            }

        }
    });
}

/**
 * Function is use to get contractor list
 * @access private
 * @return json
 * Created by Ashish
 * @smartData Enterprises (I) Ltd
 * Created Date 11-Jul-2017
 */
function getUserList(req, res) {
    var currentuser = req.query.user;
    var count = req.query.count ? req.query.count : 0;
    var skip = req.query.count * (req.query.page - 1);
    var sorting = req.query.sorting ? req.query.sorting : {
        _id: -1
    };
    var condition = {};

    if (req.query.trial_period) {
        condition = {
            deleted: false,
            _id: {
                $ne: mongoose.Types.ObjectId(currentuser)
            },
            trial_period: true,
            parent_id: null
        };
    } else if(req.query.paid_status) {
        condition = {
            deleted: false,
            _id: {
                $ne: mongoose.Types.ObjectId(currentuser)
            },
            parent_id: null,
            paid_status:true//*****/
        };
    }
    else {
        condition = {
            deleted: false,
            _id: {
                $ne: mongoose.Types.ObjectId(currentuser)
            },
            parent_id: null,
        };
    }
    var searchText = decodeURIComponent(req.query.searchText).replace(/[[\]{}()*+?,\\^$|#\s]/g, "\\s+");
    if (req.query.searchText) {
        condition.$or = [{
            'company_name': new RegExp(searchText, 'gi')
        }, {
            'firstname': new RegExp(searchText, 'gi')
        }, {
            'lastname': new RegExp(searchText, 'gi')
        }, {
            'email': new RegExp(searchText, 'gi')
        }, {
            'customer_id': new RegExp(searchText, 'gi')
        }];
    }
    for (let key in sorting) {
        sorting[key] = ((sorting[key] == '-1') ? -1 : 1);
    }
    co(function* () {
        console.log("co")
        let aggregate = [{
                $match: condition
            },
            // Do the lookup matching
            {
                $lookup: {
                    from: 'roles',
                    localField: "role",
                    foreignField: "_id",
                    as: "roleInfo"
                }
            },
            {
                $unwind: "$roleInfo"
            },
            {
                $match: {
                    "roleInfo.code": 'Contractor'
                }
            },
            {
                $project: {
                    company_name: 1,
                    firstname: 1,
                    lastname: 1,
                    email: 1,
                    status: 1,
                    userInfo: '$userInfo',
                    createdAt: 1,
                    trial_period:1,
                    paid_status:1,
                }
            }
        ]
        if (parseInt(skip) > 0) {
            aggregate.push({
                $skip: parseInt(skip)
            });
        }
        if (parseInt(count) > 0) {
            aggregate.push({
                $limit: parseInt(count)
            });
        }
        if (sorting) {
            aggregate.push({
                $sort: sorting
            });
        }

        let userData = yield User.aggregate(aggregate);

        async.each(userData, function (item, callback) {
            User.count({
                    deleted: false,
                    status: 'Activate',
                    "parent_id": item._id
                })
                .exec(function (err, otherUserCount) {
                    item.otherUserCount = otherUserCount;
                    callback();
                });

        }, function (err) {
            if (err) {
                return res.json(Response(500, "failed", constantsObj.validationMessages.internalError, {}));
            } else {
                var getCount = User.find(condition).count().exec();
                getCount.then(function (totalLength) {
                    return res.json({
                        'code': 200,
                        status: 'success',
                        "message": constantsObj.messages.dataRetrievedSuccess,
                        "data": userData,
                        "totalLength": totalLength
                    });
                }).catch(function (err) {

                    return res.json({
                        'code': 500,
                        status: 'failure',
                        "message": constantsObj.messages.errorRetreivingData,
                        "data": err
                    });
                });
            }
        });

    }).catch(function (err) {

        return res.json(Response(402, "failed", utility.validationErrorHandler(err), {}));
    });
}


/**
 * Function is use to get supervisor list
 * @access private
 * @return json
 * Created by Ashish
 * @smartData Enterprises (I) Ltd
 * Created Date 11-Jul-2017
 */
function getSupervisorList(req, res) {
    console.log("getSuperVisorList",req.body)
    var supervisorData = [];
    var count = req.query.count ? req.query.count : 0;
    var skip = req.query.count * (req.query.page - 1);
    var sorting = req.query.sorting ? req.query.sorting : {
        _id: -1
    };
    var condition = {
        deleted: false,
        parent_id: mongoose.Types.ObjectId(req.query.id)
    };
    var searchText = decodeURIComponent(req.query.searchText).replace(/[[\]{}()*+?,\\^$|#\s]/g, "\\s+");
    if (req.query.searchText) {
        condition.$or = [{
            'firstname': new RegExp(searchText, 'gi')
        }, {
            'lastname': new RegExp(searchText, 'gi')
        }, {
            'email': new RegExp(searchText, 'gi')
        }];
    }
    for (let key in sorting) {
        sorting[key] = ((sorting[key] == 'asc') ? -1 : 1);
    }

    co(function* () {
        let aggregate = [{
                $match: condition
            },
            {
                $lookup: {
                    from: 'roles',
                    localField: "role",
                    foreignField: "_id",
                    as: "roleInfo"
                }
            },
            {
                $unwind: "$roleInfo"
            },
            {
                $lookup: {
                    from: 'supervisor_jobs',
                    localField: "_id",
                    foreignField: "job_assign_to",
                    as: "jobInfo"
                }
            },
            
            {
                $match: {
                    'roleInfo.code': {
                        $in: ['SV']
                    }
                }
            },
            {
                $project: {
                    firstname: 1,
                    lastname: 1,
                    email: 1,
                    status: 1,
                    availability: 1,
                    userInfo: '$userInfo',
                    jobInfo: '$jobInfo'
                }
            }
        ]
        if (parseInt(skip) > 0) {
            aggregate.push({
                $skip: parseInt(skip)
            });
        }
        if (parseInt(count) > 0) {
            aggregate.push({
                $limit: parseInt(count)
            });
        }
        if (sorting) {
            aggregate.push({
                $sort: sorting
            });
        }
        let userData = yield User.aggregate(aggregate);
        var i = 0;
        
                return res.json({
                    'code': 200,
                    status: 'success',
                    "message": constantsObj.messages.dataRetrievedSuccess,
                    "data": userData,
                    "totalLength": userData.length
                });
        
    }).catch(function (err) {
        return res.json(Response(402, "failed", utility.validationErrorHandler(err), {}));
    });
}

/**
 * Function is use to get foremen list with job
 * @access private
 * @return json
 * Created by Ashish
 * @smartData Enterprises (I) Ltd
 * Created Date 11-Jul-2017
 */
function getForemenDetail(req, res) {
    var count = req.body.count ? req.body.count : 0;
    var skip = req.body.count * (req.body.page - 1);
    var sorting = req.body.sorting ? req.body.sorting : {
        _id: -1
    };

for (let key in req.body) {
             if (key.match(/^sorting.*$/gi)) {
                  var sKey = key.split('[')[1].split(']')[0]; 
                  var sortt = {}; sortt[sKey] = (req.body[key] == 'asc') ? 1 : -1; 
                  sorting = sortt 
                } 
            }   

    var condition = {
        deleted: false,
        parent_id: mongoose.Types.ObjectId(req.body.parent_id)
    };
    var searchText = decodeURIComponent(req.body.searchText).replace(/[[\]{}()*+?,\\^$|#\s]/g, "\\s+");
    if (req.body.searchText) {
        condition.$or = [{
            'firstname': new RegExp(searchText, 'gi')
        }, {
            'lastname': new RegExp(searchText, 'gi')
        }, {
            'email': new RegExp(searchText, 'gi')
        }];
    }
    for (let key in sorting) {
        sorting[key] = ((sorting[key] == '-1') ? -1 : 1);
    }

    co(function* () {
        let aggregate = [{
                $match: condition
            },
            {
                $lookup: {
                    from: 'roles',
                    localField: "role",
                    foreignField: "_id",
                    as: "roleInfo"
                }
            },
            {
                $unwind: "$roleInfo"
            },
            {
                $match: {
                    'roleInfo.code': {
                        $in: ['FM']
                    }
                }
            },
            {
                $project: {
                    firstname: 1,
                    lastname: 1,
                    email: 1,
                    status: 1,
                    availability: 1,
                    userInfo: '$userInfo'
                }
            }
        ]
        if (parseInt(skip) > 0) {
            aggregate.push({
                $skip: parseInt(skip)
            });
        }
        if (parseInt(count) > 0) {
            aggregate.push({
                $limit: parseInt(count)
            });
        }
        if (sorting) {
            aggregate.push({
                $sort: sorting
            });
        }
        let userData = yield User.aggregate(aggregate);
        var foremenData = [];
        async.each(userData, function (item, callback) {
            Foremen_assignJob.find({
                    "job_assign_to": item._id
                }, {
                    job_id: 1
                }).sort({
                    _id: -1
                })
                .populate('job_id', '_id job_id client')
                .exec(function (err, formenAssignJobInfo) {
                    if (formenAssignJobInfo) {
                        item.job = formenAssignJobInfo;
                        foremenData.push(item);
                    }

                    callback();
                })
        }, function (err) {
            if (err) {
                return res.json(Response(500, "failed", constantsObj.validationMessages.internalError, {}));
            } else {
                return res.json({
                    'code': 200,
                    status: 'success',
                    "message": constantsObj.messages.dataRetrievedSuccess,
                    "data": foremenData,
                    "totalLength": userData.length
                });
            }

        })

    }).catch(function (err) {
        return res.json(Response(402, "failed", utility.validationErrorHandler(err), {}));
    });
}

/**
 * Function is use to get supervisor list
 * @access private
 * @return json
 * Created by Ashish
 * @smartData Enterprises (I) Ltd
 * Created Date 11-Jul-2017
 */
function getForemenList(req, res) {
    var condition = {
        deleted: false,
        parent_id: mongoose.Types.ObjectId(req.body.parent_id)
    };
    co(function* () {
        let aggregate = [{
                $match: condition
            },
            // Do the lookup matching
            {
                $lookup: {
                    from: 'roles',
                    localField: "role",
                    foreignField: "_id",
                    as: "roleInfo"
                }
            },
            {
                $unwind: "$roleInfo"
            },
            {
                $match: {
                    'roleInfo.code': {
                        $in: ['FM']
                    }
                }
            },
            {
                $project: {
                    firstname: 1,
                    lastname: 1
                }
            }
        ]
        let userData = yield User.aggregate(aggregate);
        //console.log(userData)
        return res.json({
            'code': 200,
            status: 'success',
            "message": constantsObj.messages.dataRetrievedSuccess,
            "data": userData
        });
    }).catch(function (err) {
        console.log(err);
        return res.json(Response(402, "failed", utility.validationErrorHandler(err), {}));
    });
}

/**
 * Function is use to get Forement list for iOS
 * @access private
 * @return json
 * Created by Ashish
 * @smartData Enterprises (I) Ltd
 * Created Date 07-Sept-2017
 */
function getAllForemenList(req, res) {
    var count = req.body.count ? req.body.count : 0;
    var skip = req.body.count * (req.body.page - 1);
    var sorting = req.body.sorting ? req.body.sorting : {
        _id: -1
    };


    var condition = {
        deleted: false,
        parent_id: mongoose.Types.ObjectId(req.body.parent_id)
    };
    var searchText = decodeURIComponent(req.body.searchText).replace(/[[\]{}()*+?,\\^$|#\s]/g, "\\s+");
    if (req.body.searchText) {
        condition.$or = [{
            'firstname': new RegExp(searchText, 'gi')
        }, {
            'lastname': new RegExp(searchText, 'gi')
        }, {
            'email': new RegExp(searchText, 'gi')
        }];
    }




    for (let key in sorting) {
        sorting[key] = ((sorting[key] == '-1') ? -1 : 1);
    }

    co(function* () {
        let aggregate = [{
                $match: condition
            },
            {
                $lookup: {
                    from: 'roles',
                    localField: "role",
                    foreignField: "_id",
                    as: "roleInfo"
                }
            },
            {
                $unwind: "$roleInfo"
            },
            {
                $match: {
                    'roleInfo.code': {
                        $in: ['FM']
                    }
                }
            },
            {
                $project: {
                    firstname: 1,
                    lastname: 1,
                    email: 1,
                    status: 1,
                    availability: 1,
                    userInfo: '$userInfo'
                }
            }
        ]
        if (parseInt(skip) > 0) {
            aggregate.push({
                $skip: parseInt(skip)
            });
        }
        if (parseInt(count) > 0) {
            aggregate.push({
                $limit: parseInt(count)
            });
        }
        if (sorting) {
            aggregate.push({
                $sort: sorting
            });
        }
        let userData = yield User.aggregate(aggregate);
        if (userData) {
            return res.json({
                'code': 200,
                status: 'success',
                "message": constantsObj.messages.dataRetrievedSuccess,
                "data": userData,
                "totalLength": userData.length
            });
        } else {
            return res.json(Response(500, "failed", constantsObj.validationMessages.internalError, {}));

        }

    }).catch(function (err) {
        return res.json(Response(402, "failed", utility.validationErrorHandler(err), {}));
    });
}

/**
 * Function is use to get User by id
 * @access private
 * @return json
 * Created by Udit
 * @smartData Enterprises (I) Ltd
 * Created Date 27-Jan-2017
 */
function getUserById(req, res) {
    var id = req.swagger.params.id.value;
    User.findOne({
            _id: req.user._id
        }, 'firstname lastname email institute profile_image QB_username QB_password QB_id is_stripe_acc_verified saved_card stripe_status')
        .populate('institute', 'title')
        .lean()
        .exec(function (err, data) {
            if (err) {
                return res.json(Response(500, "failed", constantsObj.validationMessages.internalError, err));
            } else {
                if (data) {
                    Rating.aggregate([{
                            $match: {
                                rating_to: data._id
                            }
                        },
                        {
                            "$group": {
                                "_id": '$rating_to',
                                "avgRating": {
                                    "$avg": {
                                        "$ifNull": ["$rating", 0]
                                    }
                                }
                            }
                        }
                    ], function (err, rating) {
                        var rate = 0;
                        if (rating[0]) {
                            if (rating[0].avgRating) {
                                rate = rating[0].avgRating;
                            }
                        }
                        data.avg_rating = rate;
                        if (!data.profile_image) {
                            data.profile_image = '';
                        }
                        if (!data.is_stripe_acc_verified) {
                            data.is_stripe_acc_verified = false;
                        }
                        if (!data.stripe_status) {
                            data.stripe_status = '';
                        }
                        if (data.profile_image) {
                            var split = data.profile_image.split('assets/uploads/');
                            utility.fileExistCheck('./public/assets/uploads/' + split[1], function (exist) {
                                if (!exist) {
                                    data.profile_image = 'assets/images/default-image.png';
                                }
                                return res.json({
                                    'code': 200,
                                    status: 'success',
                                    "message": constantsObj.messages.dataRetrievedSuccess,
                                    "data": data
                                });
                            });
                        } else {
                            return res.json({
                                'code': 200,
                                status: 'success',
                                "message": constantsObj.messages.dataRetrievedSuccess,
                                "data": data
                            });
                        }
                    });
                } else {
                    return res.json(Response(402, "failed", constantsObj.validationMessages.userNotFound, {}));
                }
            }
        });
}

/**
 * Function is use to delete User by id
 * @access private
 * @return json
 * Created by Udit
 * @smartData Enterprises (I) Ltd
 * Created Date 27-Jan-2017
 */
function deleteUserById(req, res) {
    var id = req.swagger.params.id.value;
    User.findById(id).exec(function (err, data) {
        if (err) {
            return res.json(Response(500, "failed", constantsObj.validationMessages.internalError, err));
        } else {
            if (!data) {
                return res.json(Response(402, "failed", constantsObj.validationMessages.userNotFound, {}));
            } else {


                data.deleted = true;
                data.save(function (err, userData) {
                    if (err)
                        return res.json(Response(500, "failed", constantsObj.validationMessages.internalError, err));
                    else {
                        return res.json({
                            'code': 200,
                            status: 'success',
                            "message": constantsObj.messages.userDeleteSuccess,
                            "data": {}
                        });
                    }
                });
            }
        }
    })
}


/**
 * Function is use to enable disable user
 * @access private
 * @return json
 * Created by Udit
 * @smartData Enterprises (I) Ltd
 * Created Date 27-Jan-2017
 */
function enableDisableUser(req, res) {
    if (!req.body.userId || !req.body.status) {
        return res.json(Response(402, "failed", constantsObj.validationMessages.requiredFieldsMissing));;
    } else {
        User.findById(req.body.userId).exec(function (err, data) {
            if (err) {
                return res.json(Response(500, "failed", constantsObj.validationMessages.internalError, err));
            } else {
                if (!data) {
                    return res.json(Response(402, "failed", constantsObj.validationMessages.userNotFound, {}));
                } else {
                    data.status = req.body.status;
                    data.save(function (err, userData) {
                        if (err) {
                            return res.json(Response(500, "failed", constantsObj.validationMessages.internalError, err));
                        } else {
                            return res.json({
                                'code': 200,
                                status: 'success',
                                "message": 'User ' + ((req.body.status == 'Activate') ? 'Activate' : 'Deactivate') + ' successfully',
                                "data": userData
                            });
                        }
                    });
                }
            }
        });
    }
}

/**
 * Function is use to enable disable user
 * @access private
 * @return json
 * Created by Udit
 * @smartData Enterprises (I) Ltd
 * Created Date 27-Jan-2017
 */
function getRoleList(req, res) {

    Role.find({
        code: {
            $nin: ['Contractor', 'ADMIN']
        }
    }, {
        code: 1,
        type: 1
    }).exec(function (err, data) {
        //console.log('data',data);
        if (err) {
            return res.json(Response(500, "failed", constantsObj.validationMessages.internalError, err));
        } else {
            if (!data) {
                return res.json(Response(402, "failed", constantsObj.validationMessages.userNotFound, {}));
            } else {
                return res.json({
                    'code': 200,
                    status: 'success',
                    "message": constantsObj.messages.dataRetrievedSuccess,
                    "data": data
                });
            }
        }
    });

}

/**
 * Function is use to enable disable user
 * @access private
 * @return json
 * Created by Ashish
 * @smartData Enterprises (I) Ltd
 * Created Date 25-Jan-2017
 */
function getAllSupervisor(req, res) {
    console.log("getAllSupervisor",req.body)
    var condition = {
        deleted: false,
        status: 'Activate',
        parent_id: mongoose.Types.ObjectId(req.swagger.params.id.value)
    };
    co(function* () {
        let aggregate = [{
                $match: condition
            },
            // Do the lookup matching
            {
                $lookup: {
                    from: 'roles',
                    localField: "role",
                    foreignField: "_id",
                    as: "roleInfo"
                }
            },
            {
                $unwind: "$roleInfo"
            },
            {
                $match: {
                    'roleInfo.code': {
                        $in: ['SV']
                    }
                }
            },
            {
                $project: {
                    firstname: 1,
                    lastname: 1
                }
            }
        ]
        let userData = yield User.aggregate(aggregate);
        //console.log(userData)
        return res.json({
            'code': 200,
            status: 'success',
            "message": constantsObj.messages.dataRetrievedSuccess,
            "data": userData
        });
    }).catch(function (err) {
        console.log(err);
        return res.json(Response(402, "failed", utility.validationErrorHandler(err), {}));
    });

}




/**
 * Function is use to dashboard count
 * @access private
 * @return json
 * Created by Udit
 * @smartData Enterprises (I) Ltd
 * Created Date 27-Jan-2017
 */
function dashboardCount(req, res) {
    async.parallel({
        user: function (callback) {
            User.find({
                deleted: false
            }).count(function (err, count) {
                if (err)
                    callback(err);
                else
                    callback(null, count);
            });
        }
    }, function (err, results) {
        if (err) {
            return res.json(Response(500, "failed", constantsObj.validationMessages.internalError, err));
        } else {
            return res.json({
                'code': 200,
                status: 'success',
                "message": constantsObj.messages.dataRetrievedSuccess,
                "data": results
            });
        }
    });
}

/**
 * Function is use to update quick blox details
 * @access private
 * @return json
 * Created by Udit
 * @smartData Enterprises (I) Ltd
 * Created Date 15-March-2017
 */
function updateQuickBloxDetails(req, res) {
    co(function* () {
        if (!req.body.QB_username || !req.body.QB_password || !req.body.QB_id || !req.body.user_id) {
            return res.json(Response(402, "failed", constantsObj.validationMessages.requiredFieldsMissing));;
        } else {
            let user = yield User.findById(req.body.user_id);
            if (user) {
                user.QB_username = req.body.QB_username;
                user.QB_password = req.body.QB_password;
                user.QB_id = req.body.QB_id;
                yield user.save();
                return res.json(Response(200, "success", constantsObj.messages.userUpdatedSuccess, {}));
            } else {
                return res.json(Response(402, "failed", constantsObj.validationMessages.userNotFound, {}));
            }
        }
    }).catch(function (err) {
        return res.json(Response(402, "failed", utility.validationErrorHandler(err), {}));
    });
}

/**
 * Function is use to remove saved card
 * @access private
 * @return json
 * Created by Udit
 * @smartData Enterprises (I) Ltd
 * Created Date 06-May-2017
 */
function deleteSavedCard(req, res) {
    co(function* () {
        if (!req.body.customer_id) {
            return res.json(Response(402, "failed", constantsObj.validationMessages.requiredFieldsMissing));
        } else {

            let user = yield User.findOne({
                _id: req.user._id
            });
            if (user) {
                let index = 'blank';
                if (user.saved_card) {
                    if (user.saved_card.length > 0) {

                        for (let i in user.saved_card) {
                            if (user.saved_card[i].customer_id == req.body.customer_id) {
                                index = i;
                            }
                        }
                    }
                }
                if (index == 'blank') {
                    return res.json(Response(402, "failed", constantsObj.validationMessages.cardNotFound));
                } else {
                    user.saved_card.splice(index, 1);
                    yield user.save();
                    stripe.customers.del(req.body.customer_id,
                        function (err, confirmation) {
                            // console.log(confirmation);
                        });
                    return res.json(Response(200, "success", constantsObj.messages.cardDeletedSuccess, {}));
                }
            } else {
                return res.json(Response(402, "failed", constantsObj.validationMessages.userNotFound, {}));
            }
        }
    }).catch(function (err) {
        return res.json(Response(402, "failed", utility.validationErrorHandler(err), {}));
    });
}

/**
 * Function is use to add card
 * @access private
 * @return json
 * Created by Udit
 * @smartData Enterprises (I) Ltd
 * Created Date 12-Jun-2017
 */
function addCard(req, res) {
    co(function* () {
        if (!req.body.card_token) {
            return res.json(Response(402, "failed", constantsObj.validationMessages.requiredFieldsMissing));
        } else {
            let user = yield User.findOne({
                _id: req.user._id
            });
            if (user) {
                if (!user.saved_card) {
                    user.saved_card = [];
                }
                if (user.saved_card.length == 3) {
                    return res.json(Response(402, "failed", 'You can not add more than three cards, please delete old card'));
                } else {
                    var cardSaved = yield stripe.customers.create({
                        email: user.email,
                        source: req.body.card_token
                    });
                    if (cardSaved.id) {
                        user.saved_card.push({
                            customer_id: cardSaved.id,
                            last4: cardSaved.sources.data[0].last4,
                            brand: cardSaved.sources.data[0].brand
                        });
                        yield user.save();
                        return res.json(Response(200, "success", 'Card added successfully', {}));
                    } else {
                        return res.json(Response(402, "failed", 'Error while saving card'));
                    }
                }
            } else {
                return res.json(Response(402, "failed", constantsObj.validationMessages.userNotFound, {}));
            }
        }
    }).catch(function (err) {
        console.log(err, '---------------');
        var errMsg = utility.validationErrorHandler(err);
        if (err) {
            if (err.raw) {
                errMsg = err && err.raw && err.raw.message ? err.raw.message : "Something went wrong, Please try again";
            }
        }
        return res.json({
            code: 402,
            message: errMsg,
            data: {}
        });
    });
}



/**
 * Function is use to add and update sub contractor
 * @access private
 * @return json
 * Created by Rahul Tiwari
 * @smartData Enterprises (I) Ltd
 * Created Date 25-Jul-2017
 */
function addSubcontractor(req, res) {
    console.log("req.body", req.body)
    if (!req.body.firstname || !req.body.lastname || !req.body.email) {
        return res.json(Response(402, "failed", constantsObj.validationMessages.requiredFieldsMissing));;
    } else if (req.body.email && !validator.isEmail(req.body.email)) {
        return res.json(Response(402, "failed", constantsObj.validationMessages.invalidEmail));
    } else {
        User.findById(req.body._id).exec(function (err, userInfoData) {
            if (err) {
                return res.json(Response(500, "failed", constantsObj.validationMessages.internalError, err));
            } else {
                console.log("userInfoData>>>",userInfoData)
                User.existCheck(req.body.email, ((userInfoData) ? userInfoData._id : ''), function (err, exist) {
                    if (err) {
                        return res.json(Response(500, "failed", constantsObj.validationMessages.internalError, err));
                    } else {
                        if (exist != true) {
                            return res.json(Response(402, "failed", exist));
                        } else {
                            var date = new Date();
                            var verifingLink = utility.getEncryptText(Math.random().toString(4).slice(2) + date.getTime());
                            Role.findOne({
                                'code': 'SC'
                            }, function (err, role) {

                                var password = common.randomToken(6);
                                var model = new User();
                                if (userInfoData) {
                                    model = userInfoData;
                                }
                                model.firstname = req.body.firstname;
                                model.lastname = req.body.lastname;
                                model.email = req.body.email;
                                model.role = mongoose.Types.ObjectId(role._id);
                                model.parent_id = mongoose.Types.ObjectId(req.body.parent_id);
                                if (!userInfoData) {
                                    model.password = utility.getEncryptText(req.body.newPassword);
                                    model.verifying_token = verifingLink;
                                }
                                model.save(function (err, userData) {
                                    console.log("userData",us)
                                    if (err) {
                                        return res.json(Response(500, "failed", utility.validationErrorHandler(err), {}));
                                    } else {
                                        if (!userInfoData) {
                                            var userMailData = {
                                                email: userData.email,
                                                firstname: userData.firstname,
                                                lastname: userData.lastname,
                                                verifying_token: userData.verifying_token,
                                                password: req.body.newPassword
                                            };
                                            utility.readTemplateSendMail(userData.email, constantsObj.emailSubjects.verify_email, userMailData, 'verify_email_subcon', function (err, resp) {});
                                        }
                                        return res.json(Response(200, "success", ((userInfoData) ? constantsObj.messages.subcontractorUpdatedSuccess : constantsObj.messages.subcontractorAddedSuccess), {
                                            _id: userData._id
                                        }));
                                    }
                                });
                            });
                        }
                    }
                });
            }
        });
    }
}





























function contractorCount(req, res) {

    var condition = {
        deleted: false,
        parent_id: null
    };
    if (req.body.year == true) {
        var group = {
            _id: {
                $year: "$createdAt"
            },
            count: {
                $sum: 1
            }
        };
    } else {
        if (req.body.month == true) {
            var group = {
                _id: {
                    $month: "$createdAt"
                },
                count: {
                    $sum: 1
                }
            };
        }
    }
    co(function* () {
        let aggregate = [{
                $match: condition
            },

            {
                $lookup: {
                    from: 'roles',
                    localField: "role",
                    foreignField: "_id",
                    as: "roleInfo"
                }
            },

            {
                $unwind: "$roleInfo"
            },
            {
                $match: {
                    "roleInfo.code": 'Contractor'
                }
            },

            {
                $group: group
            },



            {
                $sort: {
                    _id: 1
                }
            },

        ]
        let userData = yield User.aggregate(aggregate);
        var getCount = User.find(condition).count().exec();
        getCount.then(function (totalLength) {
            return res.json({
                'code': 200,
                status: 'success',
                "message": constantsObj.messages.dataRetrievedSuccess,
                "data": userData,
                "totalLength": totalLength
            });
        }).catch(function (err) {
            console.log(err);
            return res.json({
                'code': 500,
                status: 'failure',
                "message": constantsObj.messages.errorRetreivingData,
                "data": err
            });
        });
    }).catch(function (err) {
        console.log(err);
        return res.json(Response(402, "failed", utility.validationErrorHandler(err), {}));
    });

}


function extendUserTrial(req, res) {

    if(req.body.userId && req.body.extend_time){
        User.findOne({_id : req.body.userId, paid_status : false }).exec(function(err1,doc){
            if (err1) return res.json(Response(500, "Cannot find User", {}));
            
            else{
                User.update(
                    {_id : req.body.userId, paid_status : false  }
                    , { $set : { expiry_date : new Date(doc.expiry_date.getTime() + (86400000*req.body.extend_time)) }})
                    .exec(function(err2,updatedoc){
                    if (err2) res.json(Response(500, "Cannot update user", {}));
                    else{
                        return res.json({
                            code: 200,
                            message: 'Trial period extended successfully by' + req.body.extend_time + ' day(s)',
                            data: {}
                        });
                    }
                })
            }
        })
    }else{
        return res.json({
                            code: 500,
                            message: 'Invalid request',
                            
                        });;
    }
}


// function purchaseDailies(req,res){
// console.log("purchaseDailies", req.body)
                               
//                                 var model = new User();
                                 
//       if (req.body.trial_period == true) {
//                                     stripe.customers.create({
                                       
//                                         source: req.body.token
//                                     }).then(function (customer) {
//                                         model.stripe_customer_id = customer.id;
//                                         model.saved_card.push({
//                                             customer_id: customer.id,
//                                             last4: customer.sources.data[0].last4,
//                                             brand: customer.sources.data[0].brand
//                                         });
//                                         model.trial_period = true;
//                                         // CalCulating Payment for five users
//                                         var now = moment();
//                                         var days = moment(now).daysInMonth();
//                                         var currentDate = now.date();

//                                         var subPrice = (days - currentDate);
//                                         var divPrice = (subPrice / days);
//                                         var actualAmount = parseFloat((parseInt(req.body.initialAmount) * divPrice));
//                                         model.bill_amount = actualAmount;
//                                         model.initial_user = req.body.userCount;
//                                         // YOUR CODE: Save the customer ID and other info in a database for later.
//                                         model.save(function (err, userData) {
//                                             if (err) {
//                                                 console.log("userdata error>>>>>>>>>>",err)
//                                                 return res.json(Response(500, "failed", utility.validationErrorHandler(err), {}));
//                                             } else {
//                                                 console.log("insde else>>>>>>>")
//                                                 if (!userInfoData) {
//                                                     var userMailData = {
//                                                         email: userData.email,
//                                                         firstname: userData.firstname,
//                                                         lastname: userData.lastname,
//                                                         verifying_token: userData.verifying_token,
//                                                         password: req.body.newPassword
//                                                     };
//                                                     utility.readTemplateSendMail(userData.email, constantsObj.emailSubjects.verify_email, userMailData, 'verify_email', function (err, resp) {});
//                                                 }
//                                                 return res.json(Response(200, "success", ((userInfoData) ? constantsObj.messages.contractorUpdatedSuccess : constantsObj.messages.contractorAddedSuccess), {
//                                                     _id: userData._id
//                                                 }));
//                                             }
//                                         });
//                                     });
//                                 } else {
//                                     model.expiry_date = moment().add(30, 'days');
//                                     model.reminder_date = moment().add(25, 'days');
//                                     model.save(function (err, userData) {
//                                         if (err) {
//                                             return res.json(Response(500, "failed", utility.validationErrorHandler(err), {}));
//                                         } else {
//                                             if (!userInfoData) {
//                                                 var userMailData = {
//                                                     email: userData.email,
//                                                     firstname: userData.firstname,
//                                                     lastname: userData.lastname,
//                                                     verifying_token: userData.verifying_token,
//                                                     password: req.body.newPassword
//                                                 };
//                                                 utility.readTemplateSendMail(userData.email, constantsObj.emailSubjects.verify_email, userMailData, 'verify_email', function (err, resp) {});
//                                             }
//                                             return res.json(Response(200, "success", ((userInfoData) ? constantsObj.messages.contractorUpdatedSuccess : constantsObj.messages.contractorAddedSuccess), {
//                                                 _id: userData._id
//                                             }));
//                                         }
//                                     });
//                                 }

//                                  }                               







function purchaseDailies(req, res) {

    if (!req.body.company_name || !req.body.firstname || !req.body.lastname || !req.body.email) {
        
        return res.json(Response(402, "failed", constantsObj.validationMessages.requiredFieldsMissing));;
    } else if (req.body.email && !validator.isEmail(req.body.email)) {
        
        return res.json(Response(402, "failed", constantsObj.validationMessages.invalidEmail));
    } 
    // if (err) {
    //             return res.json(Response(500, "failed", constantsObj.validationMessages.internalError, err));
    //         }  
                         else {
                             
                            var date = new Date();
                            // var verifingLink = utility.getEncryptText(Math.random().toString(4).slice(2) + date.getTime());
                            Role.findOne({
                                'code': 'Contractor'
                            }, function (err, role) {
                                var password = common.randomToken(6);
                                var model = new User();
                                // if (userInfoData) {
                                //     model = userInfoData;
                                // }
                                model.company_name = req.body.company_name;
                                model.firstname = req.body.firstname;
                                model.lastname = req.body.lastname;
                                model.email = req.body.email.toLowerCase();
                                model.role = mongoose.Types.ObjectId(role._id);
                                model.parent_id = null;
                                // if (!userInfoData) {    
                                //     // model.verifying_token = verifingLink;
                                //     model.customer_id = utility.generateCustomerID();
                                // }
                                //console.log('asdasd',req.body.token);return
                                if (req.body.trial_period == true) {
console.log(" 55")
                                    
                                    stripe.customers.create({
                                        email: req.body.email,
                                        source: req.body.token
                                    }).then(function (customer) {
                                        model.stripe_customer_id = customer.id;
                                        model.saved_card.push({
                                            customer_id: customer.id,
                                            last4: customer.sources.data[0].last4,
                                            brand: customer.sources.data[0].brand
                                        });
                                        model.trial_period = false;
                                        model.paid_status = true;
                                        model.status= 'Activate'
                                        // CalCulating Payment for five users
                                        var now = moment();
                                        var days = moment(now).daysInMonth();
                                        var currentDate = now.date();

                                        var subPrice = (days - currentDate);
                                        var divPrice = (subPrice / days);
                                        var actualAmount = parseFloat((parseInt(req.body.initialAmount) * divPrice));
                                        model.bill_amount = actualAmount;
                                        model.initial_user = req.body.userCount;
console.log(" 66")

                                 User.update({
                                    _id: req.body._id
                                }, {
                                    $set: {
                                       trial_period: false,
                                       paid_status: true,
                                       bill_amount:actualAmount,
                                      initial_user:req.body.userCount,
                                      status:'Activate',
                                      saved_card:{ customer_id: customer.id,
                                            last4: customer.sources.data[0].last4,
                                            brand: customer.sources.data[0].brand
                                        },
                                        stripe_customer_id :customer.id
                                       
                                    }
                                }).exec(function (err, update) {
                                        console.log("err :",err," UPadted data :-",update);
                                        return res.json({
                            code: 200,
                            message: 'You are Now a Paid Contractor',
                            data: update
                        });
                                });

                                        // YOUR CODE: Save the customer ID and other info in a database for later.
                                    
                        //                 model.save(function (err, purchaseData) {
                        //                     console.log("userdata<<<<<<<<<",purchaseData)
                        //                     if (err) {
                        //                         return res.json(Response(500, "failed", utility.validationErrorHandler(err), {}));
                        //                     } else {
                        //                         // console.log("userData>>>>>>>>>",userData)
                        //                         // if (!userInfoData) {
                        //                         //     var userMailData = {
                        //                         //         email: userData.email,
                        //                         //         firstname: userData.firstname,
                        //                         //         lastname: userData.lastname,
                        //                         //         // verifying_token: userData.verifying_token,
                        //                         //         password: req.body.newPassword
                        //                         //     };
                        //                         //     utility.readTemplateSendMail(userData.email, constantsObj.emailSubjects.verify_email, userMailData, 'verify_email', function (err, resp) {});
                        //                         // }
                        //                           return res.json({
                        //     code: 200,
                        //     message: 'You are Now a Paid Contractor',
                        //     data: purchaseData
                        // });
                        //                     }
                        //                 });
                                    });
                                } 
                            });
                        }
                    
             
      
}