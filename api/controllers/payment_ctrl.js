'use strict';

var mongoose = require('mongoose'),
    User = mongoose.model('User'),
    Subscribe_amount = mongoose.model('Subscribe_amount'),
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
    getPaymentList: getPaymentList,
    addSubscription:addSubscription
};


function addSubscription(req,res){
    User.findOne({email: req.body.email}).exec(function(err, userInfoData) {
        if(userInfoData){
            var model = new User();
            if (userInfoData) {
                model = userInfoData;
            }
             User.count({parent_id :userInfoData._id,trial_period : false}, function(err, count) {
                if(count>0){
                            stripe.customers.create({
                                  email: req.body.email,
                                  source: req.body.token
                            }).then(function(customer) {
                                model.stripe_customer_id = customer.id;
                                model.saved_card.push({
                                    customer_id: customer.id,
                                    last4: customer.sources.data[0].last4,
                                    brand: customer.sources.data[0].brand
                                });
                                model.trial_period =true;
                                // CalCulating Payment for depending on the user
                                var now = moment();
                                var days = moment(now).daysInMonth();
                                var currentDate = now.date();

                                var subPrice = (days - currentDate);
                                var divPrice = (subPrice / days);
                                var countUserAmount = (parseINT(count) * divPrice);
                                var actualAmount  =  parseFloat((100 * divPrice));
                                model.bill_amount = actualAmount;
                                model.status = 'Activate';
                                model.initial_user = count;
                                // YOUR CODE: Save the customer ID and other info in a database for later.
                                model.save(function(err, userData) {
                                    if (err) {
                                        return res.json(Response(500, "failed", utility.validationErrorHandler(err), {}));
                                    } else {
                                        /*if  (!userInfoData) {
                                            var userMailData = { email: userData.email, firstname: userData.firstname, lastname: userData.lastname, verifying_token: userData.verifying_token, password: req.body.newPassword };
                                            utility.readTemplateSendMail(userData.email, constantsObj.emailSubjects.verify_email, userMailData, 'verify_email', function(err, resp) {});
                                        }*/
                                        return res.json(Response(200, "success", ((userInfoData) ? constantsObj.messages.contractorUpdatedSuccess : constantsObj.messages.contractorAddedSuccess), {_id: userData._id}));
                                    }
                                });
                            })
                       
                }else{
                    stripe.tokens.create({
                        card: {
                            "number": req.body.cardInfo.number,
                            "exp_month": req.body.cardInfo.expire_month,
                            "exp_year": req.body.cardInfo.expire_year,
                            "cvc": req.body.cardInfo.cvv2
                        }
                        }).then(function(data) {
                            stripe.customers.create({
                                  email: req.body.email,
                                  source: data.id,
                            }).then(function(customer) {
                                model.stripe_customer_id = customer.id;
                                model.saved_card.push({
                                    customer_id: customer.id,
                                    last4: customer.sources.data[0].last4,
                                    brand: customer.sources.data[0].brand
                                });
                                model.trial_period =true;
                                // CalCulating Payment for five users
                                var now = moment();
                                var days = moment(now).daysInMonth();
                                var currentDate = now.date();

                                var subPrice = (days - currentDate);
                                var divPrice = (subPrice / days);
                                var actualAmount  =  parseFloat((100 * divPrice));
                                model.bill_amount = actualAmount;
                                model.initial_user = 5;
                                model.status = 'Activate';
                                // YOUR CODE: Save the customer ID and other info in a database for later.
                                model.save(function(err, userData) {
                                    if (err) {
                                        return res.json(Response(500, "failed", utility.validationErrorHandler(err), {}));
                                    } else {
                                        /*if  (!userInfoData) {
                                            var userMailData = { email: userData.email, firstname: userData.firstname, lastname: userData.lastname, verifying_token: userData.verifying_token, password: req.body.newPassword };
                                            utility.readTemplateSendMail(userData.email, constantsObj.emailSubjects.verify_email, userMailData, 'verify_email', function(err, resp) {});
                                        }*/
                                        return res.json(Response(200, "success", ((userInfoData) ? constantsObj.messages.contractorUpdatedSuccess : constantsObj.messages.contractorAddedSuccess), {_id: userData._id}));
                                        
                                    }
                                });
                            })
                        });
                }
             });  
        }else{
           return res.json(Response(500, "failed", constantsObj.validationMessages.internalError, err));
        }
        
    });    
}

/**
 * Function is use to payment list
 * @access private
 * @return json
 * Created by Ashish
 * @smartData Enterprises (I) Ltd
 * Created Date 11-Jul-2017
 */
function getPaymentList(req, res) {
    console.log("req.queryyyyyyyyyyyy",req.query);
        console.log("req.queryyyyyyyyyyyy",req.body);
    var currentuser = req.query.user;
    var count = req.query.count ? req.query.count : 0;
    var skip = req.query.count * (req.query.page - 1);
    var sorting = req.query.sorting ? req.query.sorting : { _id: -1 };
    var condition = {deleted:false};
    // var condition = { deleted: false};
    //   if (req.query.paid_status) {
    //     condition = {
    //         deleted: false,
    //         _id: {
    //             $ne: mongoose.Types.ObjectId(currentuser)
    //         },
    //         paid_status: true,
    //         parent_id: null
    //     };
    // }

    /*var searchText = decodeURIComponent(req.query.searchText).replace(/[[\]{}()*+?,\\^$|#\s]/g, "\\s+");
    if (req.query.searchText) {
        condition.$or = [{ 'firstname': new RegExp(searchText, 'gi') }, { 'lastname': new RegExp(searchText, 'gi') }, { 'email': new RegExp(searchText, 'gi') },{ 'customer_id': new RegExp(searchText, 'gi') }];
    }*/
    for(let key in sorting) {
     sorting[key] = ((sorting[key] == '-1') ? -1: 1);   
    }
    co(function*() {
    let aggregate = [
    {
    $lookup: {
                        from: "users",
                        localField: "users_id",
                        foreignField: "_id",
                        as: "fir"
                    }

},
{$unwind:"$fir"}
,

            { $match: condition },
            {
                $project: {
                    amount: 1,
                    charge_id:1, 
                    createdAt:1,
                    currency:1,
                    firstname:"$fir.firstname",
                    lastname:"$fir.lastname",
                    company_name: "$fir.company_name",

                }
            }
        ]
        if (parseInt(skip) > 0) {
                aggregate.push({ $skip: parseInt(skip) });
        }
        if (parseInt(count) > 0) {
            aggregate.push({ $limit: parseInt(count) });
        }
        if (sorting) {
            aggregate.push({ $sort: sorting});
        }
        let paymentData = yield Subscribe_amount.aggregate(aggregate);
        var getCount = Subscribe_amount.find(condition).count().exec();
        getCount.then(function(totalLength) {
             return res.json({ 'code': 200, status: 'success', "message": constantsObj.messages.dataRetrievedSuccess, "data": paymentData, "totalLength": totalLength });
        }).catch(function(err) {
           // console.log(err);
            return res.json({ 'code': 500, status: 'failure', "message": constantsObj.messages.errorRetreivingData, "data": err });
        });
    }).catch(function(err) {
        console.log(err);
        return res.json(Response(402, "failed", utility.validationErrorHandler(err), {}));
    });
}
// function getPaymentList(req, res) {
//     var currentuser = req.query.user;
//     var count = req.query.count ? req.query.count : 0;
//     var skip = req.query.count * (req.query.page - 1);
//     var sorting = req.query.sorting ? req.query.sorting : { _id: -1 };
//     var condition = { deleted: false};

//     /*var searchText = decodeURIComponent(req.query.searchText).replace(/[[\]{}()*+?,\\^$|#\s]/g, "\\s+");
//     if (req.query.searchText) {
//         condition.$or = [{ 'firstname': new RegExp(searchText, 'gi') }, { 'lastname': new RegExp(searchText, 'gi') }, { 'email': new RegExp(searchText, 'gi') },{ 'customer_id': new RegExp(searchText, 'gi') }];
//     }*/
//     for(let key in sorting) {
//      sorting[key] = ((sorting[key] == '-1') ? -1: 1);   
//     }
//     co(function*() {
//     let aggregate = [
//             { $match: condition },
//             {
//                 $project: {
//                     amount: 1,
//                     charge_id:1,
//                     createdAt:1,
//                     currency:1
//                 }
//             }
//         ]
//         if (parseInt(skip) > 0) {
//                 aggregate.push({ $skip: parseInt(skip) });
//         }
//         if (parseInt(count) > 0) {
//             aggregate.push({ $limit: parseInt(count) });
//         }
//         if (sorting) {
//             aggregate.push({ $sort: sorting});
//         }
//         let paymentData = yield Subscribe_amount.aggregate(aggregate);
//         var getCount = Subscribe_amount.find(condition).count().exec();
//         getCount.then(function(totalLength) {
//              return res.json({ 'code': 200, status: 'success', "message": constantsObj.messages.dataRetrievedSuccess, "data": paymentData, "totalLength": totalLength });
//         }).catch(function(err) {
//            // console.log(err);
//             return res.json({ 'code': 500, status: 'failure', "message": constantsObj.messages.errorRetreivingData, "data": err });
//         });
//     }).catch(function(err) {
//         console.log(err);
//         return res.json(Response(402, "failed", utility.validationErrorHandler(err), {}));
//     });
// }