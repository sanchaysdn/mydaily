'use strict';

var mongoose = require('mongoose'),
    User = mongoose.model('User'),
    Subscriptions = mongoose.model('Subscription'),
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
    common = require('../../config/common.js');
var stripe = require("stripe")(config.STRIPEKEY);

module.exports = {
    getSubscriptionList:getSubscriptionList,
    addUpdateSubscriptionData: addUpdateSubscriptionData,
    getSubscriptionById:getSubscriptionById,
    deleteSubscriptionById:deleteSubscriptionById,
    enableDisableSubscription:enableDisableSubscription,
    getActivePlan:getActivePlan,
    subscriptionCount:subscriptionCount
};


/**
 *
*/
function getActivePlan(req,res){
    co(function*() {
       // console.log('asdasd',req.body.subscription_mode);
        let subscriptionData = yield Subscriptions.findOne({status: req.body.subscription_mode}, 'name amount feature').exec();
         return res.json({ 'code': 200, status: 'success', "message": constantsObj.messages.dataRetrievedSuccess, "data": subscriptionData});
    }).catch(function(err) {
       // console.log(err, 'errrr');
        return res.json(Response(402, "failed", utility.validationErrorHandler(err), {}));
    });
}


/**
 * Function is use to get subscription list
 * @access private
 * @return json
 * Created by Rahul
 * @smartData Enterprises (I) Ltd
 * Created Date 10-Aug-2017
 */
function getSubscriptionList(req, res) {
   
    var count = req.body.count ? req.body.count : 0;
    var skip = req.body.count * (req.body.page - 1);
    var sorting = req.body.sorting ? req.body.sorting : { _id: -1 };
    var condition = { deleted: false};
    var searchText = decodeURIComponent(req.body.searchText).replace(/[[\]{}()*+?,\\^$|#\s]/g, "\\s+");
    if (req.body.searchText) {
        condition.$or = [{ 'name': new RegExp(searchText, 'gi') }, { 'feature': new RegExp(searchText, 'gi') }];
    }
    for(let key in sorting) {
     sorting[key] = ((sorting[key] == '-1') ? -1: 1);   
    }
    
    co(function*() {
    let aggregate = [
            { $match: condition },
            {
                $project: {
                    name: 1,
                    feature: 1,
                    amount:1,    
                    status: 1
                   
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
        let subscriptionData = yield Subscriptions.aggregate(aggregate);
        async.each(subscriptionData, function(result, callback) {
             return res.json({ 'code': 200, status: 'success', "message": constantsObj.messages.dataRetrievedSuccess, "data": subscriptionData});
           
        }, function(err) {

            return res.json({ 'code': 200, status: 'success', "message": constantsObj.messages.dataRetrievedSuccess, "data": subscriptionData});
        });       
       
    }).catch(function(err) {
      
        return res.json(Response(402, "failed", utility.validationErrorHandler(err), {}));
    });
}

/**
 * Function is use to update subscription
 * @access private
 * @return json
 * Created by Rahul
 * @smartData Enterprises (I) Ltd
 * Created Date 10-Aug-2017
 */
function addUpdateSubscriptionData(req, res) {

    if (!req.body.name || !req.body.feature || !req.body.amount) {
        return res.json(Response(402, "failed", constantsObj.validationMessages.requiredFieldsMissing));
    }  else {
        Subscriptions.findById(req.body._id).exec(function(err, userInfoData) {
           // console.log("userInfoData",userInfoData)
            if (err) {
                return res.json(Response(500, "failed", constantsObj.validationMessages.internalError, err));
            } else {
                Subscriptions.existCheck(req.body.name, ((userInfoData) ? userInfoData._id : ''), function(err, exist) {
                   // console.log("exist",exist)
                    if (err) {
                        return res.json(Response(500, "failed", constantsObj.validationMessages.internalError, err));
                    } else {
                        if (exist != true) {
                            return res.json(Response(402, "failed", exist));
                        } else {
                            var date = new Date();
                            var model = new Subscriptions();
                            if (userInfoData) {
                                model = userInfoData;
                            }
                           
                            model.name = req.body.name;
                            model.feature = req.body.feature;
                            model.amount = req.body.amount;
                            model.save(function(err, userData) {
                               // console.log("userData",userData)
                                if (err) {
                                    return res.json(Response(500, "failed", utility.validationErrorHandler(err), {}));
                                } else {
                                    return res.json(Response(200, "success", ((userInfoData) ? constantsObj.messages.subscriptionUpdatedSuccess : constantsObj.messages.subscriptionAddedSuccess), {_id: userData.parent_id}));
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
 * Function is use to get Subscription by id
 * @access private
 * @return json
 * Created by Rahul
 * @smartData Enterprises (I) Ltd
 * Created Date 10-Aug-2017
 */
function getSubscriptionById(req, res) {
    var id = req.swagger.params.id.value;
    Subscriptions.findOne({ _id: id }, 'name feature amount') .lean().exec(function(err, data) {
                if (err) {
                    return res.json(Response(500, "failed", constantsObj.validationMessages.internalError, err));
                } else {
                    return res.json({ 'code': 200, status: 'success', "message": constantsObj.messages.dataRetrievedSuccess, "data": data });
                }
            })
        }

/**
 * Function is use to delete Subscription by id
 * @access private
 * @return json
 * Created by Rahul
 * @smartData Enterprises (I) Ltd
 * Created Date 10-Aug-2017
 */
function deleteSubscriptionById(req, res) {
    var id = req.swagger.params.id.value;
    Subscriptions.findById(id).exec(function(err, data) {
        if (err) {
            return res.json(Response(500, "failed", constantsObj.validationMessages.internalError, err));
        } else {
            if (!data) {
                return res.json(Response(402, "failed", constantsObj.validationMessages.userNotFound, {}));
            } else {
                data.deleted = true;
                data.save(function(err, subscriptionData) {
                    if (err)
                        return res.json(Response(500, "failed", constantsObj.validationMessages.internalError, err));
                    else {
                        return res.json({ 'code': 200, status: 'success', "message": constantsObj.messages.subscriptionDeleteSuccess, "data": {} });
                    }
                });
            }
        }
    })
}

/**
 * Function is use to enable disable subscription
 * @access private
 * @return json
 * Created by rahul
 * @smartData Enterprises (I) Ltd
 * Created Date 27-Jan-2017
 */
function enableDisableSubscription(req, res) {
    if (!req.body.subscriptionId || !req.body.status) {
        return res.json(Response(402, "failed", constantsObj.validationMessages.requiredFieldsMissing));;
    } else {

        if (req.body.status === 'Deactivate') {

            Subscriptions.findById(req.body.subscriptionId).exec(function(err, data) {
                if (err) {
                    return res.json(Response(500, "failed", constantsObj.validationMessages.internalError, err));
                } else {
                    if (!data) {
                        return res.json(Response(402, "failed", constantsObj.validationMessages.userNotFound, {}));
                    } else {
                        data.status = req.body.status;
                        data.save(function(err, userData) {
                            if (err) {
                                return res.json(Response(500, "failed", constantsObj.validationMessages.internalError, err));
                            } else {
                                return res.json({ 'code': 200, status: 'success', "message": 'Subscription ' + ((req.body.status == 'Active') ? 'activited' : 'deactivated') + ' successfully', "data": userData });
                            }
                        });
                    }
                }
            });
        }else{
            Subscriptions.find({ "status": 'Activate' }).exec(function(err, status) {
                if (err) {
                    return res.json(Response(500, "failed", constantsObj.validationMessages.internalError, err));
                } else {
                     
                    if (status.length > 0) {
                        return res.json(Response(500, "failed", constantsObj.validationMessages.subscriptionActivation));
                    } else {
                        Subscriptions.findById(req.body.subscriptionId).exec(function(err, data) {
                            if (err) {
                                return res.json(Response(500, "failed", constantsObj.validationMessages.internalError, err));
                            } else {
                                if (!data) {     
                                    return res.json(Response(402, "failed", constantsObj.validationMessages.userNotFound, {}));
                                } else {
                                    data.status = req.body.status;
                                    data.save(function(err, userData) {
                                        if (err) {
                                            return res.json(Response(500, "failed", constantsObj.validationMessages.internalError, err));
                                        } else {
                                            return res.json({ 'code': 200, status: 'success', "message": 'Subscription ' + ((req.body.status == 'Active') ? 'activited' : 'deactivated') + ' successfully', "data": userData });
                                        }
                                    });
                                }
                            }
                        });
                    }
                }
            })
        }
    }
}
function subscriptionCount(req,res){
 var condition = { deleted: false ,parent_id:null, trial_period: true};
    co(function*() {
        var getCount = User.find(condition).count().exec();
        getCount.then(function(totalLength) {
             return res.json({ 'code': 200, status: 'success', "message": constantsObj.messages.dataRetrievedSuccess,"totalLength": totalLength });
        }).catch(function(err) {
            console.log(err);
            return res.json({ 'code': 500, status: 'failure', "message": constantsObj.messages.errorRetreivingData, "data": err });
        });
    }).catch(function(err) {
        console.log(err);
        return res.json(Response(402, "failed", utility.validationErrorHandler(err), {}));
    });
}