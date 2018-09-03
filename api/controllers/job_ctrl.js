'use strict';

var mongoose = require('mongoose'),
    Job = mongoose.model('Job'),
    SubJob = mongoose.model('SubJob'),
    MyDailies = mongoose.model('My_dailies'),
    ForemenAssignJob = mongoose.model('Foremen_assign_jobs'),
    myDailies_Billable_items = mongoose.model('myDailies_Billable_item'),
    SupervisorJob = mongoose.model('Supervisor_jobs'),
    BillableItem = mongoose.model('Billable_item'),
    JobInvities = mongoose.model('Job_invites'),
    User = mongoose.model('User'),
    Role = mongoose.model('Role'),
    AssignUpstreamDownstream = mongoose.model('AssignUpstreamDownstream'),
    formidable = require('formidable'),
    constantsObj = require('./../../constants'),
    Response = require('../lib/response.js'),
    util = require('util'),
    fs = require('fs-extra'),
    path = require('path'),
    async = require('async'),
    validator = require('validator'),
    _ = require('underscore'),
    common = require('../../config/common.js'),
    utility = require('../lib/utility.js'),
    // stripeLib = require('../lib/stripe.js'),
    co = require('co'),
    scheduler = require('../lib/schedule.js'),
    config = require('../../config/config.js');

// var stripe = require("stripe")("sk_test_3cqt1vfQLQaqXe8DT9MSQoeH"); /*test account Smartdata*/
// var stripe = require("stripe")("sk_test_p4T492k0DwwT9t7leL26eOAo"); /*test account client's*/
var stripe = require("stripe")(config.STRIPEKEY); /*Live account client's*/


module.exports = {
    getJobListAdmin: getJobListAdmin,
    getJobList: getJobList,
    getItemList: getItemList,
    addUpdateGeneralData: addUpdateGeneralData,
    addUpdateBillingInfoData: addUpdateBillingInfoData,
    addUpdateDailyPathData: addUpdateDailyPathData,
    getJobInfoById: getJobInfoById,
    addBillableItem: addBillableItem,
    getBillableItem: getBillableItem,
    getbillableList: getbillableList,
    getItemInfoById: getItemInfoById,
    deleteItemById: deleteItemById,
    getForemenAssignJob: getForemenAssignJob,
    deleteJobById: deleteJobById,
    addNewJob: addNewJob,
    getJobId: getJobId,
    getAssignSupervisorList: getAssignSupervisorList,
    getSupervisorJobInfoById: getSupervisorJobInfoById,
    getForemenReport: getForemenReport,
    getUpStreamSupervisorList: getUpStreamSupervisorList,
    getUpstreamAssignSupervisorList: getUpstreamAssignSupervisorList,
    matchToken: matchToken,
    addSubJobs: addSubJobs,
    getAllSubjob: getAllSubjob,
    insertJobAddedBy: insertJobAddedBy,
    callUpstreamSuperVisorList: callUpstreamSuperVisorList,
    submitJobToContractor: submitJobToContractor,
    changeAllStatus : changeAllStatus,
    rejectAllStatus: rejectAllStatus,
    resubmit: resubmit,
    getAllUpstreamSupervisorList: getAllUpstreamSupervisorList


};


/**
 * Function is use to fetch all billable items
 * @access private
 * @return json
 * Created by Ashish
 * @smartData Enterprises (I) Ltd
 * Created Date 24-Jul-2017
 */
function getbillableList(req, res) {
    var count = parseInt(req.body.count ? req.body.count : 0);
    var skip = parseInt(req.body.count * (req.body.page - 1));
    var sorting = utility.getSortObj(req.body);
    var user_id = req.body.users_id;

    var searchText = decodeURIComponent(req.body.searchText).replace(/[[\]{}()*+?,\\^$|#\s]/g, "\\s+");;
    async.waterfall([
        function(callback) {
            BillableItem.getAllBillableItem(user_id, searchText, skip, count, sorting).then(function(listArr) {
                callback(null, listArr);
            }).catch(function(err) {
                callback(err)
            });
        },
        function(listArr, callback) {
            BillableItem.getAllBillableCount(user_id, searchText).then(function(count) {
                callback(null, listArr, count);
            }).catch(function(err) {
                callback(err)
            });
        },
    ], function(err, mainArr, count) {
        if (err) {
            return res.json(Response(500, "failed", constantsObj.validationMessages.internalError, err));
        } else {
            return res.json({
                'code': 200,
                status: 'success',
                "message": constantsObj.messages.dataRetrievedSuccess,
                "data": mainArr,
                "totalLength": count
            });
        }
    });
}



/**
 * Function is use to fetch all job for admin
 * @access private
 * @return json
 * Created by Ashish
 * @smartData Enterprises (I) Ltd
 * Created Date 18-Jul-2017
 */
function getJobListAdmin(req, res) {
    console.log("getJobListAdmin", req.body)
    var count = parseInt(req.body.count ? req.body.count : 0);
    var skip = parseInt(req.body.count * (req.body.page - 1));
    var sorting = utility.getSortObj(req.body);
    var user_id = req.body.users_id;
    var searchText = decodeURIComponent(req.body.searchText).replace(/[[\]{}()*+?,\\^$|#\s]/g, "\\s+");;

    async.waterfall([
        function(callback) {
            Job.getAllJobListAdmin(user_id, searchText, skip, count, sorting).then(function(listArr) {

                var condition = {
                    'invities_assign_to': req.body.users_id,
                    'status': 'Accepted',
                    'merge_status': false
                }
                JobInvities.find(condition)
                    .populate('job_id')
                    .lean()
                    .exec(function(err, data) {
                        for (var i = 0; i < data.length; i++) {
                            data[i].job_id.share_status = true;
                            listArr.push(data[i].job_id);
                        }
                        callback(null, listArr);
                    });

            }).catch(function(err) {
                callback(err)
            });
        },
        function(listArr, callback) {
            var condition = {
                'job_added_by': mongoose.Types.ObjectId(user_id),
                'deleted': false
            }
            var getCount = Job.find(condition).count().exec();
            getCount.then(function(totalLength) {
                callback(null, listArr, totalLength);
            }).catch(function(err) {
                callback(err)
            });
        },
        function(listArr, totalLength, callback) {
            var condition = {
                'invities_assign_to': req.body.users_id,
                'status': 'Pending'
            }
            var getCount = JobInvities.find(condition).count().exec();
            getCount.then(function(totalInvities) {
                callback(null, listArr, totalLength, totalInvities);
            }).catch(function(err) {
                callback(err)
            });
        }

    ], function(err, mainArr, count, totalInvities) {
        if (err) {
            return res.json(Response(500, "failed", constantsObj.validationMessages.internalError, err));
        } else {
            return res.json({
                'code': 200,
                status: 'success',
                "message": constantsObj.messages.dataRetrievedSuccess,
                "data": mainArr,
                "today": moment().format(),
                "totalLength": count,
                "totalInvities": totalInvities
            });
        }
    });
}

/**
 * Function is use to fetch all job for supervisor through Andriod
 * @access private
 * @return json
 * Created by Ashish
 * @smartData Enterprises (I) Ltd
 * Created Date 18-Jusl-2017
 */
function getJobList(req, res) {
    console.log("getJoblistFromSuperVisorMode", req.body)
    var count = parseInt(req.body.count ? req.body.count : 0);
    var skip = parseInt(req.body.count * (req.body.page - 1));
    var sorting = utility.getSortObj(req.body);
    var user_id = req.body.users_id;
    var searchText = decodeURIComponent(req.body.searchText).replace(/[[\]{}()*+?,\\^$|#\s]/g, "\\s+");
    async.waterfall([
        function(callback) {
            SupervisorJob.getAllJobList(user_id, searchText, skip, count, sorting).then(function(listArr) {
                callback(null, listArr);
            }).catch(function(err) {
                callback(err)
            });
        }
    ], function(err, mainArr) {
        if (err) {
            return res.json(Response(500, "failed", constantsObj.validationMessages.internalError, err));
        } else {
            return res.json({
                'code': 200,
                status: 'success',
                "message": constantsObj.messages.dataRetrievedSuccess,
                "data": mainArr
            });
        }
    });
}

/**
 * Function is use to fetch add job data through mobile app
 * @return json
 * Created by Ashish
 * @smartData Enterprises (I) Ltd
 * Created Date 27-Jul-2017
 */
function addNewJob(req, res) {
    console.log("addJob", req.body)
    if (!req.body.job_id) {
        return res.json(Response(402, "failed", constantsObj.validationMessages.requiredFieldsMissing));
    } else {
        Job.findById(req.body._id).exec(function(err, jobInfoData) {
            if (err) {
                return res.json(Response(500, "failed", constantsObj.validationMessages.internalError, err));
            } else {
                Job.existCheck(req.body.job_id, ((jobInfoData) ? jobInfoData._id : ''), function(err, exist) {
                    if (err) {
                        return res.json(Response(500, "failed", constantsObj.validationMessages.internalError, err));
                    } else {
                        if (exist != true) {
                            return res.json({
                                code: 402,
                                'message': 'That Job ID already exists',
                                data: {}
                            });
                        } else {
                            var model = new Job();
                            if (jobInfoData) {
                                model = jobInfoData;
                            }
                            if (!jobInfoData) {
                                model.job_unique_id = utility.generateJobID();
                                model.job_added_by = req.body.job_assign_by;
                            }
                            model.client = req.body.client;
                            model.job_id = req.body.job_id;
                            // model.invitesupervisor = 'First'
                            model.start_date = req.body.start_date;
                            model.projected_end_date = new Date();
                            model.actual_end_date = new Date();
                            model.description = req.body.description;
                            model.job_location = req.body.job_location;
                            model.latitude = req.body.latitude;
                            model.longitude = req.body.longitude;
                            model.daily_sumbission_report = req.body.daily_sumbission_report;
                            //model.job_added_by = req.body.job_assign_by;

                            model.billing_info.billable_items = req.body.billable_items;
                            model.save(function(err, jobAttr) {
                                if (err) {
                                    return res.json({
                                        code: 402,
                                        'message': utility.validationErrorHandler(err),
                                        data: {}
                                    });
                                } else {
                                    SupervisorJob.findOne({
                                        "job_id": jobAttr._id,
                                        "deleted": false
                                    }).then(function(jobData) {
                                        var model = new SupervisorJob();
                                        if (jobData) {
                                            model = jobData;
                                        }
                                        model.job_assign_to = req.body.job_assign_to;
                                        model.job_id = jobAttr._id;
                                        model.save(function(err, supervisorData) {
                                            if (err) {
                                                return res.json({
                                                    code: 402,
                                                    'message': utility.validationErrorHandler(err),
                                                    data: {}
                                                });
                                            } else {
                                                ForemenAssignJob.findOne({
                                                    "job_id": jobAttr._id,
                                                    "deleted": false
                                                }).then(function(jobForemenData) {
                                                    async.each(req.body.foremens, function(foremenItem, callback) {
                                                        //console.log("foremenItem", foremenItem);
                                                        var formenModel = new ForemenAssignJob();
                                                        if (jobForemenData) {

                                                            ForemenAssignJob.remove({
                                                                "job_id": jobAttr._id,
                                                                "deleted": false
                                                            }, function(err, res) {});

                                                        }

                                                        formenModel.job_assign_by = req.body.job_assign_by;
                                                        formenModel.job_assign_to = foremenItem._id;
                                                        formenModel.job_id = jobAttr._id;
                                                        formenModel.save(function(err, ForemenData) {
                                                            callback();
                                                        });


                                                    }, function(err) {
                                                        if (err) {
                                                            return res.json({
                                                                code: 402,
                                                                'message': utility.validationErrorHandler(err),
                                                                data: {}
                                                            });
                                                        } else {
                                                            return res.json({
                                                                code: 200,
                                                                'message': 'Job Created!'
                                                            });
                                                        }
                                                    })
                                                })
                                            }
                                        });
                                    })
                                }
                            });
                        }
                    }
                })
            }
        })
    }
}



/**
 * Function is use to fetch add job
 * @return json
 * Created by Ashish
 * @smartData Enterprises (I) Ltd
 * Created Date 19-Jul-2017
 */
function addUpdateGeneralData(req, res) {
    if (!req.body.job_id) {
        return res.json(Response(402, "failed", constantsObj.validationMessages.requiredFieldsMissing));
    } else {
        Job.findById(req.body._id).exec(function(err, jobInfoData) {
            if (err) {
                return res.json(Response(500, "failed", constantsObj.validationMessages.internalError, err));
            } else {
                Job.existCheck(req.body.job_id, ((jobInfoData) ? jobInfoData._id : ''), function(err, exist) {
                    if (err) {
                        return res.json(Response(500, "failed", constantsObj.validationMessages.internalError, err));
                    } else {
                        if (exist != true) {
                            return res.json({
                                code: 402,
                                'message': 'That Job ID already exists',
                                data: {}
                            });
                        } else {
                            var model = new Job();
                            if (jobInfoData) {
                                model = jobInfoData;
                            }
                            if (!jobInfoData) {
                                model.job_unique_id = utility.generateJobID();
                                model.job_added_by = req.body.job_added_by;
                            }
                            if (req.body.actual_end_date) {
                                model.actual_end_date = req.body.actual_end_date;
                            }
                            if (req.body.projected_end_date) {
                                model.projected_end_date = req.body.projected_end_date;
                            }
                            if (req.body.start_date) {
                                model.start_date = req.body.start_date;
                            }
                            model.job_id = req.body.job_id;
                            model.client = req.body.client;
                            model.address = req.body.address;
                            model.job_location = req.body.job_location;
                            model.latitude = req.body.latitude;
                            model.longitude = req.body.longitude;
                            model.save(function(err, jobAttr) {
                                if (err) {
                                    return res.json({
                                        code: 402,
                                        'message': utility.validationErrorHandler(err),
                                        data: {}
                                    });
                                } else {
                                    return res.json({
                                        code: 200,
                                        'message': 'Job General Info added successfully.',
                                        data: {
                                            _id: jobAttr._id,
                                            job_id: jobAttr.job_id
                                        }
                                    });
                                }
                            });
                        }
                    }
                })
            }
        })
    }
}


/**
 * Function is use to add billing info job
 * @return json
 * Created by Ashish
 * @smartData Enterprises (I) Ltd
 * Created Date 19-Jul-2017
 */
function addUpdateBillingInfoData(req, res) {
    if (!req.body.job_id) {
        return res.json(Response(402, "failed", constantsObj.validationMessages.requiredFieldsMissing));
    } else {
        Job.findOne({
            "_id": req.body.job_id,
            "deleted": false
        }).then(function(jobData) {
            if (jobData) {
                jobData.billing_info.client_billing_contact = req.body.client_billing_contact;
                jobData.billing_info.billing_email = req.body.billing_email;
                jobData.billing_info.billable_items = req.body.billable_items;

                jobData.save(function(err, savedData) {
                    if (err) {
                        return res.json({
                            code: 402,
                            'message': utility.validationErrorHandler(err),
                            data: {}
                        });
                    } else {
                        return res.json({
                            code: 200,
                            'message': 'Job Billing Info added successfully.',
                            data: {
                                _id: jobData._id,
                                job_id: jobData.job_id
                            }
                        });
                    }
                });
            } else {
                return res.json({
                    code: 402,
                    'message': utility.validationErrorHandler(err),
                    data: {}
                });
            }
        }).catch(function(err) {
            res.json({
                code: 402,
                message: utility.validationErrorHandler(err),
                data: {}
            });
        });
    }
}

/**
 * Function is use to add daily path info job
 * @return json
 * Created by Ashish
 * @smartData Enterprises (I) Ltd
 * Created Date 19-Jul-2017
 */
/**
 * Function is use to add daily path info job
 * @return json
 * Created by Ashish
 * @smartData Enterprises (I) Ltd
 * Created Date 19-Jul-2017
 */
function addUpdateDailyPathData(req, res) {
    console.log("addupdatedailypathdata", req.body);
    var finalResponse = {};
    async.waterfall([
        function(callback) {
            if (!req.body.daily_sumbission_report) {
                return res.json(Response(402, "failed", constantsObj.validationMessages.requiredFieldsMissing));
            } else {
                callback(null, finalResponse);
            }
        },
        function(finalResponse, callback) {
            Job.findOne({
                _id: req.body.job_id
            }).lean().exec(function(err, jobInfo) {
                if (err)
                    callback(err, null);
                else {
                    finalResponse.jobInfo = jobInfo;
                    callback(null, finalResponse);
                }
            });
        },
        function(finalResponse, callback) {
            JobInvities.findOne({
                job_id: req.body.job_id,
                deleted: false
            }, function(err, inviteInfo) {
                if (err) {
                    callback(err, null);
                } else {
                    finalResponse.inviteInfo = inviteInfo;
                    callback(null, finalResponse);
                }
            });
        },
        function(finalResponse, callback) {
            SupervisorJob.find({
                job_id: req.body.job_id,
                deleted: false
            }, function(err, UpstreamSupervisorList) {
                if (err) {
                    callback(err, null);
                } else {
                    finalResponse.UpstreamSupervisorList = UpstreamSupervisorList;
                    callback(null, finalResponse);
                }
            });
        },
        function(finalResponse, callback) {
            ForemenAssignJob.find({
                job_id: req.body.job_id,
                deleted: false
            }, function(err, UpstreamForemenList) {
                if (err) {
                    callback(err, null);
                } else {
                    finalResponse.UpstreamForemenList = UpstreamForemenList;
                    callback(null, finalResponse);
                }
            });
        },
        function(finalResponse, callback) {
            var downStreamList = {
                job_created_by: finalResponse.jobInfo.job_added_by,
                job_assigned_by: req.user.uid,
                job_id: finalResponse.jobInfo._id
            }
            if (req.user.uid == finalResponse.jobInfo.job_added_by) {
                downStreamList.supervisor_layer = 1;
            } else {
                downStreamList.supervisor_layer = 2;
            }
            if (req.user.uid == finalResponse.jobInfo.job_added_by) {
                downStreamList.foreman_layer = 1;
            } else {
                downStreamList.foreman_layer = 2;
            }

            if (finalResponse.inviteInfo) {
                downStreamList.invities_status = true;
            } else {
                downStreamList.invities_status = false;
            }
            Job.findById(req.body.job_id).exec(function(err, jobData) {
                var model = new Job();
                if (jobData) {
                    // delete jobData._id;
                    // console.log('sdfsdfdsf',jobData,'sdfsdfsdfdsf')
                    model = jobData;
                }
                model.daily_sumbission_report = req.body.daily_sumbission_report;
                model.save(function(err, savedData) {
                    if (err) {
                        return res.json({
                            code: 402,
                            'message': utility.validationErrorHandler(err),
                            data: {}
                        });
                    } else {
                        var role;
                        if (req.body.daily_sumbission_report) {
                            JobInvities.findOne({
                                "invities_assign_by": req.user.uid
                            }).exec(function(err, jobaddData) {
                                role = jobaddData ? "upstream" : "downstream";
                            })
                            SupervisorJob.find({
                                "job_id": req.body.job_id,
                                "deleted": false
                            }).then(function(jobData) {
                                SupervisorJob.remove({
                                    job_assign_to: {
                                        $in: req.body.SupervisordeleteIdarray
                                    }
                                }, function(err, resp) {})
                                if (req.body.SupervisoraddIdarray.length > 0) {
                                    async.each(req.body.SupervisoraddIdarray, function(supervisorItem, innerCallback) {
                                        // if (jobData) {
                                        //     SupervisorJob.remove({
                                        //         "job_id": req.body.job_id,
                                        //         "deleted": false
                                        //     }, function (err, res) {

                                        //     });
                                        // }
                                        // if(req.body.SupervisoraddIdarray.indexOf(supervisorItem._id)!=-1){

                                        var model = new SupervisorJob();
                                        model.job_added_by = downStreamList.job_added_by;
                                        model.job_created_by = downStreamList.job_created_by;
                                        model.supervisor_layer = downStreamList.supervisor_layer;
                                        model.invities_status = downStreamList.invities_status;
                                        model.job_assigned_by = downStreamList.job_assigned_by;

                                        if (req.body.daily_sumbission_report == '1') {
                                            model.job_assign_to = supervisorItem;
                                        }
                                        model.job_id = req.body.job_id;
                                        // if(req.body.sharedjob)
                                        //     model.invities_status=true;
                                        model.save(function(err, supervisorData) {

                                            innerCallback();
                                        });
                                        // }
                                        // else{
                                        //         innerCallback();
                                        //     }
                                    }, function(err) {
                                        if (err) {
                                            return res.json(Response(500, "failed", constantsObj.validationMessages.internalError, {}));
                                        } else {
                                            ForemenAssignJob.find({
                                                "job_id": req.body.job_id,
                                                "deleted": false
                                            }).then(function(foremanData) {
                                                ForemenAssignJob.remove({
                                                    job_assign_to: {
                                                        $in: req.body.ForemendeleteIdarray
                                                    }
                                                }, function(err, resp) {})
                                                if (req.body.ForemenaddIdarray.length > 0) {
                                                    async.each(req.body.ForemenaddIdarray, function(foremenItem, innerCallback) {
                                                        // if (foremanData) {
                                                        //     ForemenAssignJob.remove({ "job_id": req.body.job_id, "deleted": false }, function (err, res) { });
                                                        //     if (req.body.daily_sumbission_report == '3') {
                                                        //         SupervisorJob.remove({ "job_id": req.body.job_id, "deleted": false }, function (err, res) { });
                                                        //     }
                                                        // }
                                                        //   if(req.body.ForemenaddIdarray.indexOf(foremenItem._id)!=-1){
                                                        var model = new ForemenAssignJob();
                                                        // model.job_added_by = downStreamList.job_added_by;
                                                        // model.job_created_by = downStreamList.job_created_by;
                                                        // model.supervisor_layer = downStreamList.supervisor_layer;
                                                        // model.invities_status = downStreamList.invities_status;
                                                        // model.job_assigned_by = downStreamList.job_assigned_by;
                                                        model.job_id = req.body.job_id;
                                                        model.job_assign_to = foremenItem;
                                                        model.foreman_layer = downStreamList.foreman_layer;

                                                        // if(req.body.sharedjob)
                                                        // model.invities_status=true;
                                                        //foremen
                                                        //model.job_assign_by = supervisorData.job_assign_to; //supervisor
                                                        model.save(function(err, foremanData) {
                                                            innerCallback();

                                                        });
                                                        //       }else
                                                        // innerCallback();
                                                    })
                                                } else
                                                    innerCallback();
                                            })
                                        }
                                        callback(null, finalResponse);
                                    })
                                } else {
                                    ForemenAssignJob.find({
                                        "job_id": req.body.job_id,
                                        "deleted": false
                                    }).then(function(foremanData) {
                                        ForemenAssignJob.remove({
                                            job_assign_to: {
                                                $in: req.body.ForemendeleteIdarray
                                            }
                                        }, function(err, resp) {})
                                        if (req.body.foremen.length > 0) {
                                            async.each(req.body.foremen, function(foremenItem, innerCallback) {
                                                // if (foremanData) {
                                                //     ForemenAssignJob.remove({ "job_id": req.body.job_id, "deleted": false }, function (err, res) { });
                                                //     if (req.body.daily_sumbission_report == '3') {
                                                //         SupervisorJob.remove({ "job_id": req.body.job_id, "deleted": false }, function (err, res) { });
                                                //     }
                                                // }
                                                if (req.body.ForemenaddIdarray.indexOf(foremenItem._id) != -1) {
                                                    var model = new ForemenAssignJob();
                                                    // model.job_added_by = downStreamList.job_added_by;
                                                    // model.job_created_by = downStreamList.job_created_by;
                                                    // model.supervisor_layer = downStreamList.supervisor_layer;
                                                    // model.invities_status = downStreamList.invities_status;
                                                    // model.job_assigned_by = downStreamList.job_assigned_by;
                                                    model.job_id = req.body.job_id;
                                                    model.job_assign_to = foremenItem._id;
                                                    // if(req.body.sharedjob)
                                                    // model.invities_status=true;
                                                    //foremen
                                                    //model.job_assign_by = supervisorData.job_assign_to; //supervisor
                                                    model.save(function(err, foremanData) {
                                                        innerCallback();

                                                    });
                                                }
                                            })
                                        } else
                                            innerCallback();
                                    })
                                    callback(null, finalResponse);
                                }
                            })
                        }
                    }
                });

            });
        }
    ], function(err, results) {
        if (err) {
            return res.json({
                code: 402,
                'message': utility.validationErrorHandler(err),
                data: {}
            });
        } else {
            return res.json({
                code: 200,
                'message': 'Job Billing Info added successfully.'
            });
        }
    });
}

function addUpdateDailyPathData_bk(req, res) {
    console.log("addupdatedailypathdata", req.body);
    if (!req.body.daily_sumbission_report) {
        return res.json(Response(402, "failed", constantsObj.validationMessages.requiredFieldsMissing));
    } else {
        Job.findById(req.body.job_id).exec(function(err, jobData) {
            var model = new Job();
            if (jobData) {
                // delete jobData._id;
                // console.log('sdfsdfdsf',jobData,'sdfsdfsdfdsf')
                model = jobData;
            }
            model.daily_sumbission_report = req.body.daily_sumbission_report;
            model.save(function(err, savedData) {
                if (err) {
                    return res.json({
                        code: 402,
                        'message': utility.validationErrorHandler(err),
                        data: {}
                    });
                } else {
                    var role;
                    if (req.body.daily_sumbission_report) {
                        JobInvities.findOne({
                            "invities_assign_by": req.user.uid
                        }).exec(function(err, jobaddData) {
                            role = jobaddData ? "upstream" : "downstream";
                        })
                        SupervisorJob.find({
                            "job_id": req.body.job_id,
                            "deleted": false
                        }).then(function(jobData) {
                            SupervisorJob.remove({
                                job_assign_to: {
                                    $in: req.body.SupervisordeleteIdarray
                                }
                            }, function(err, resp) {})
                            if (req.body.SupervisoraddIdarray.length > 0) {
                                async.each(req.body.SupervisoraddIdarray, function(supervisorItem, callback) {
                                    // if (jobData) {
                                    //     SupervisorJob.remove({
                                    //         "job_id": req.body.job_id,
                                    //         "deleted": false
                                    //     }, function (err, res) {

                                    //     });
                                    // }
                                    // if(req.body.SupervisoraddIdarray.indexOf(supervisorItem._id)!=-1){
                                    var model = new SupervisorJob();
                                    if (req.body.daily_sumbission_report == '1') {
                                        model.job_assign_to = supervisorItem;
                                    }
                                    model.job_id = req.body.job_id;
                                    // if(req.body.sharedjob)
                                    //     model.invities_status=true;
                                    model.save(function(err, supervisorData) {

                                        callback();
                                    });
                                    // }
                                    // else{
                                    //         callback();
                                    //     }
                                }, function(err) {
                                    if (err) {
                                        return res.json(Response(500, "failed", constantsObj.validationMessages.internalError, {}));
                                    } else {
                                        ForemenAssignJob.find({
                                            "job_id": req.body.job_id,
                                            "deleted": false
                                        }).then(function(foremanData) {
                                            ForemenAssignJob.remove({
                                                job_assign_to: {
                                                    $in: req.body.ForemendeleteIdarray
                                                }
                                            }, function(err, resp) {})
                                            if (req.body.ForemenaddIdarray.length > 0) {
                                                async.each(req.body.ForemenaddIdarray, function(foremenItem, callback) {
                                                    // if (foremanData) {
                                                    //     ForemenAssignJob.remove({ "job_id": req.body.job_id, "deleted": false }, function (err, res) { });
                                                    //     if (req.body.daily_sumbission_report == '3') {
                                                    //         SupervisorJob.remove({ "job_id": req.body.job_id, "deleted": false }, function (err, res) { });
                                                    //     }
                                                    // }
                                                    //   if(req.body.ForemenaddIdarray.indexOf(foremenItem._id)!=-1){
                                                    var model = new ForemenAssignJob();
                                                    model.job_id = req.body.job_id;
                                                    model.job_assign_to = foremenItem;
                                                    // if(req.body.sharedjob)
                                                    // model.invities_status=true;
                                                    //foremen
                                                    //model.job_assign_by = supervisorData.job_assign_to; //supervisor
                                                    model.save(function(err, foremanData) {
                                                        callback();

                                                    });
                                                    //       }else
                                                    // callback();
                                                })
                                            } else
                                                callback();
                                        })
                                    }
                                    return res.json({
                                        code: 200,
                                        'message': 'Job Billing Info added successfully.'
                                    });
                                })
                            } else {
                                ForemenAssignJob.find({
                                    "job_id": req.body.job_id,
                                    "deleted": false
                                }).then(function(foremanData) {
                                    ForemenAssignJob.remove({
                                        job_assign_to: {
                                            $in: req.body.ForemendeleteIdarray
                                        }
                                    }, function(err, resp) {})
                                    if (req.body.foremen.length > 0) {
                                        async.each(req.body.foremen, function(foremenItem, callback) {
                                            // if (foremanData) {
                                            //     ForemenAssignJob.remove({ "job_id": req.body.job_id, "deleted": false }, function (err, res) { });
                                            //     if (req.body.daily_sumbission_report == '3') {
                                            //         SupervisorJob.remove({ "job_id": req.body.job_id, "deleted": false }, function (err, res) { });
                                            //     }
                                            // }
                                            if (req.body.ForemenaddIdarray.indexOf(foremenItem._id) != -1) {
                                                var model = new ForemenAssignJob();
                                                model.job_id = req.body.job_id;
                                                model.job_assign_to = foremenItem._id;
                                                // if(req.body.sharedjob)
                                                // model.invities_status=true;
                                                //foremen
                                                //model.job_assign_by = supervisorData.job_assign_to; //supervisor
                                                model.save(function(err, foremanData) {
                                                    callback();

                                                });
                                            }
                                        })
                                    } else
                                        callback();
                                })
                                return res.json({
                                    code: 200,
                                    'message': 'Job Billing Info added successfully.'
                                });
                            }
                        })
                    }
                }
            });

        });
    }
}




/**
 * Function is use to getting billing info job
 * @return json
 * Created by Ashish
 * @smartData Enterprises (I) Ltd
 * Created Date 19-Jul-2017
 */
function getJobInfoById(req, res) {
    console.log("getjobinfoby Id")
    var JobId = req.swagger.params.id.value;
    co(function*() {
        let jobData =
            yield Job.findOne({
                "_id": JobId,
                "deleted": false
            })
        ForemenAssignJob.find({
                "job_id": jobData._id
            }, {
                job_assign_to: 1
            })
            .populate('job_assign_to', '_id firstname lastname')
            .exec(function(err, formenAssignJobInfo) {
                var newObj = {
                    job_details: {},
                    foreman_details: []
                };
                newObj.job_details = jobData;

                if (formenAssignJobInfo) {
                    async.each(formenAssignJobInfo, function(item, callback) {
                        newObj.foreman_details.push(item.job_assign_to);
                        callback();
                    }, function(err) {
                        if (err) {
                            return res.json(Response(402, "failed", constantsObj.validationMessages.productNotFound));
                        } else {
                            return res.json({
                                code: 200,
                                message: 'Job info fetched successfully.',
                                data: newObj
                            });
                        }
                    })
                } else {
                    return res.json({
                        code: 200,
                        message: 'Job info fetched successfully.',
                        data: newObj
                    });
                }
                /*}).catch(function (err) {
                    return res.json(Response(500, "failed", constantsObj.validationMessages.internalError, {}));
                });*/
            });
    }).catch(function(err) {
        return res.json(Response(500, "failed", constantsObj.validationMessages.internalError, {}));
    });
}


function getSupervisorJobInfoById(req, res) {
    console.log(req.user.uid, 'asdsad')
    var JobId = req.swagger.params.id.value;
    console.log(JobId, 'sdfdsf')
    var supervisorJob = {
        daily_sumbission_report: {},
        supervisor: [],
        foremen: []
    };
    co(function*() {
        Job.findOne({
            _id: JobId
        }).exec(function(err, jobInfoData) {
            if (err)
                console.log('erewr')
            if (jobInfoData) {
                var condition = {
                    'invities_assign_to': req.user.uid,
                    'status': 'Accepted',
                    // 'merge_status': false,
                    'job_id': jobInfoData._id
                }
                JobInvities.findOne(condition)
                    .exec(function(err, data) {
                        console.log("data>>>", data)
                        // for (var i = 0; i < data.length; i++) {
                        // data.job_id.share_status = true;
                        if (data) {
                            supervisorJob.share_status = true
                        }
                        // listArr.push(data[i].job_id);
                        // }
                        // callback(null, listArr);
                    });
                supervisorJob.daily_sumbission_report = jobInfoData.daily_sumbission_report;
                SupervisorJob.find({
                        "job_id": JobId,
                        "deleted": false
                    })
                    .populate('job_assign_to', '_id firstname lastname parent_id')
                    .lean()
                    .exec(function(err, supervisorAssignJobInfo) {
                        if (supervisorAssignJobInfo) {
                            async.each(supervisorAssignJobInfo, function(item, callback) {
                                console.log(item, req.user)
                                if (item.job_assign_to.parent_id == req.user.uid) {
                                    delete item.job_assign_to.parent_id;
                                    supervisorJob.supervisor.push(item.job_assign_to);
                                    callback();
                                } else
                                    callback();
                            }, function(err) {
                                if (err) {
                                    return res.json({
                                        code: 402,
                                        'message': utility.validationErrorHandler(err),
                                        data: {}
                                    });
                                } else {
                                    ForemenAssignJob.find({
                                            "job_id": JobId,
                                            "deleted": false
                                        })
                                        .populate('job_assign_to', '_id firstname lastname parent_id')
                                        .lean()
                                        .exec(function(err, ForemenAssignJobInfo) {
                                            if (ForemenAssignJobInfo) {
                                                var result = ForemenAssignJobInfo.map(function(obj) {
                                                    if (obj.job_assign_to.parent_id == req.user.uid) {
                                                        delete obj.job_assign_to.parent_id;
                                                        return obj.job_assign_to;
                                                    }
                                                });
                                                supervisorJob.foremen = result;

                                                return res.json({
                                                    code: 200,
                                                    message: 'Job info fetched successfully.',
                                                    data: supervisorJob
                                                });
                                            }

                                        });
                                }
                            })
                        }

                    });
            }
        });
    }).catch(function(err) {
        return res.json(Response(500, "failed", constantsObj.validationMessages.internalError, {}));
    });

}

function getAssignSupervisorList(req, res) {
    if (!req.body.jobId) {
        return res.json(Response(402, "failed", constantsObj.validationMessages.requiredFieldsMissing));
    } else {
        ForemenAssignJob.find({
            job_assign_to: req.user._id,
            job_id: req.body.jobId
        }).exec(function(err, data) {
            // console.log("layer of foremen",data)
            if (err) {
                console.log(err)
            } else {
                var obj={
                 jobId:req.body.jobId,
                 layer:data[0].foreman_layer   
                }
                SupervisorJob.getAllAssignSupervisor(obj).then(function(superVisor, err) {
                    if (err) {
                        return res.json({
                            code: 402,
                            'message': utility.validationErrorHandler(err),
                            data: {}
                        });
                    } else {
                        return res.json({
                            code: 200,
                            message: 'Supervisor info fetched successfully.',
                            data: superVisor
                        });

                    }
                })
            }
        })

    }
}


// function getAssignSupervisorList(req, res) {
//         var layerarr = [];
//         var no = '';
//         console.log("getAssignSupervisorList>>>>", req.body);
//         if (!req.body.jobId) {
//             return res.json(Response(402, "failed", constantsObj.validationMessages.requiredFieldsMissing));
//         } else {
//             SupervisorJob.getAllAssignSupervisor(req.body.jobId).then(function(superVisor, err) {
//                 if (err) {
//                     return res.json({
//                         code: 402,
//                         'message': utility.validationErrorHandler(err),
//                         data: {}
//                     });
//                 } else {
//                     console.log("superVisor>>>>", superVisor)
//                     async.each(superVisor, function(item, callback) {
//                         SupervisorJob.find({
//                             job_id: item.job_id,
//                             job_assign_to: item.job_assign_to._id
//                         }).exec(function(err, data) {
//                             if (err) {
//                                 callback(err)
//                             } else {
//                                 console.log("data>>>>>>>>>>>>>>>>>>>>>>>>>",data)
//                                 for(var i=0;i<data.length;i++){
//                                  layerarr.push(data[i].supervisor_layer)
//                                 }
//                                 callback()
//                             }
//                         })
//                     }, function(err) {
//                         if (err) {
//                             return res.json({
//                                 code: 402,
//                                 'message': utility.validationErrorHandler(err),
//                                 data: {}
//                             });
//                         } else {
//                             ForemenAssignJob.findOne({
//                             job_assign_to:req.user._id
//                         }).exec(function(err, data) {
//                             if (err) {
//                                 console.log(err)                       
//                              } else {
//                               console.log("foreman_layer>>>>>>>>>>>>>>>>>>>>>>>>>",data.foreman_layer)
//                             }
//                         })
//                         }
//                     })
//                 }
//             })
//         }
//     }
/********************************    ********************/
function getUpstreamAssignSupervisorList(req, res) {
    // console.log("request.body", req.body)
    var user_id = req.body.user_id;
    var condition = {
        deleted: false,
        job_id: req.body.jobId,
        // job_assign_to:user_id          
    }
    var parent_id;
    if (!req.body.jobId) {
        return res.json(Response(402, "failed", constantsObj.validationMessages.requiredFieldsMissing));
    } else if (req.body.role == 'superVisor') {
        User.findOne({
            _id: user_id
        }, function(err, result) {
            if (result)
                parent_id = result.parent_id;
        })
        Job.findOne({
            _id: condition.job_id
        }, function(err, resp) {
            if (resp) {
                if (resp.job_shared_to == parent_id) {
                    SupervisorJob.find(condition).populate('job_assign_to').lean().then(function(superVisor, err) {
                        // console.log("data reached here>>>>", superVisor)
                        if (err) {
                            return res.json({
                                code: 402,
                                'message': utility.validationErrorHandler(err),
                                data: {}
                            });
                        }
                        if (superVisor.length > 0) {
                            var parent_id;
                            var supervisor_name = [];
                            superVisor.forEach(function(name, index) {
                                // console.log("supervisor name is here", name)
                                if (name.job_assign_to._id.equals(req.body.user_id))
                                    parent_id = name.job_assign_to.parent_id;
                                // console.log("request.body", parent_id, index)
                            })
                            superVisor.forEach(function(name, index) {
                                // console.log("name reached here", parent_id, name.job_assign_to.parent_id)
                                var count = 0;
                                if (name.job_assign_to.parent_id.equals(parent_id)) {
                                    count = 1;
                                    // console.log(count, 'Count>')
                                } else if (count == 0) {
                                    // console.log('xcsdfds')
                                    supervisor_name.push(name);
                                }
                                if (index + 1 == superVisor.length)
                                    return res.json({
                                        code: 200,
                                        message: 'Supervisor info fetched successfully.',
                                        data: supervisor_name
                                    });
                            })
                        }
                    })
                } else
                    return res.json({
                        code: 200,
                        message: 'Supervisor info fetched successfully.',
                        data: []
                    });

            }
        })
    } else {
        delete condition.job_assign_to;
        ForemenAssignJob.findOne({
            deleted: false,
            job_id: req.body.jobId,
            // job_assign_to:user_id            
        }).populate('job_assign_to').then(function(formen, err) {
            // console.log("data reached hereformen", formen)
            if (err) {
                return res.json({
                    code: 402,
                    'message': utility.validationErrorHandler(err),
                    data: {}
                });
            }
            if (formen != undefined) {
                var supervisor_name = [];
                // formen.forEach(function(name,index){
                var parent_id = formen.job_assign_to.parent_id;
                // console.log(condition, '>><<<<<<<<<<')
                SupervisorJob.find(condition).populate('job_assign_to').lean().then(function(superVisor, err) {
                    // console.log("data reached heresu[per2", superVisor)
                    if (err) {
                        return res.json({
                            code: 402,
                            'message': utility.validationErrorHandler(err),
                            data: {}
                        });
                    }
                    if (superVisor.length > 0) {
                        // console.log("inside supervisor length")

                        var supervisor_name = [];
                        superVisor.forEach(function(name, index) {
                            var count = 0;
                            // console.log("name is here", name)
                            if (name.job_assign_to.parent_id.equals(parent_id)) {
                                // supervisor_name.push(name);
                                count = 1;
                            } else if (count == 0)
                                supervisor_name.push(name);
                        })
                        //  if(name.job_assign_to.parent_id!=parent_id);
                        // supervisor_name.push(name.job_assign_to.firstname + ' ' + name.job_assign_to.lastname);

                    }
                    return res.json({
                        code: 200,
                        message: 'Supervisor12 info fetched successfully.',
                        data: supervisor_name
                    });
                })
            }
        })
    }
}

function getUpstreamAssignForemanList(req, res) {
    // console.log("request.body", req.body)
    var user_id = req.body.user_id;
    var condition = {
        deleted: false,
        //  is_archive: false,
        job_id: req.body.jobId,
        job_assign_to: {
            $nin: [user_id]
        }
        //  "parent_id": mongoose.Types.ObjectId(req.body.job_added_by),



    }

    if (!req.body.jobId) {
        return res.json(Response(402, "failed", constantsObj.validationMessages.requiredFieldsMissing));
    } else {
        SupervisorJob.find(condition).populate('job_assign_to').then(function(superVisor, err) {
            // console.log("data reached here", superVisor)
            if (err) {
                return res.json({
                    code: 402,
                    'message': utility.validationErrorHandler(err),
                    data: {}
                });
            } else {
                var supervisor_name = [];
                superVisor.forEach(function(name, index) {
                    // console.log("name is here>>>>", name)
                    supervisor_name.push(name.job_assign_to.firstname + ' ' + name.job_assign_to.lastname);
                })
                return res.json({
                    code: 200,
                    message: 'Supervisor info fetched successfully.',
                    data: supervisor_name
                });

            }
        })
    }
}

function matchToken(req, res) {
    console.log(req.user)
    User.findOne({
        _id: req.user.uid
    }).exec(function(err, data) {
        if (err) {
            console.log(err);
        } else {
            return res.json({
                code: 200,
                message: 'Supervisor info fetched successfully.',
                data: data
            });

        }
    })
}




/*****************************              *********************/
function getContractorName(req, res) {
    if (!req.body.jobId) {
        return res.json(Response(402, "failed", constantsObj.validationMessages.requiredFieldsMissing));
    } else {
        User.find({
            parent_id: req.body.jobId
        }).exec(function(err, data) {
            if (err) {
                return res.json({
                    code: 402,
                    'message': utility.validationErrorHandler(err),
                    data: {}
                });
            } else {
                return res.json({
                    code: 200,
                    data: superVisor
                });
            }
        })
    }
}

function getUpStreamSupervisorList(req, res) {
    if (!parent_id) {
        console.log(err);
    } else {
        var condition = {
            deleted: false,
            $or: [{
                "parent_id": mongoose.Types.ObjectId(req.swagger.params.parent_id.value),

            }, {
                "job.job_added_by": mongoose.Types.ObjectId(req.swagger.params.parent_id.value),

            }],
        }
        User.find().exec((err, data) => {
            if (err) {
                console.log(err);

            } else {
                return res.json({
                    code: 200,
                    data: data
                });

            }
        })

    }


}


/**
 * Function is use to getting billable item info
 * @return json
 * Created by Ashish
 * @smartData Enterprises (I) Ltd
 * Created Date 19-Jul-2017
 */
function getItemInfoById(req, res) {
    // console.log("getItemInfoById>>>>", req.body)
    var ItemId = req.swagger.params.id.value;
    co(function*() {
        let itemData =
            yield BillableItem.findOne({
                "_id": ItemId,
                "deleted": false
            })
        if (itemData) {
            return res.json({
                code: 200,
                message: 'Item info fetched successfully.',
                data: itemData
            });
        } else {
            return res.json(Response(402, "failed", constantsObj.validationMessages.productNotFound));
        }
    }).catch(function(err) {
        return res.json(Response(500, "failed", constantsObj.validationMessages.internalError, {}));
    });
}



/**
 * Function is use to fetch list all billable items
 * @return json
 * Created by Ashish
 * @smartData Enterprises (I) Ltd
 * Created Date 19-Jul-2017
 */
function getItemList(req, res) {
    // console.log("getItemList>>>>", req.body)
    co(function*() {
        let billableItemAttr =
            yield BillableItem.find({
                deleted: false,
                user_id: req.swagger.params.id.value
            }, {
                _id: 1,
                name: 1,
                description: 1
            })
        if (billableItemAttr) {
            return res.json({
                code: 200,
                message: 'Billable info fetched successfully.',
                data: billableItemAttr
            });
        } else {
            return res.json(Response(402, "failed", constantsObj.validationMessages.productNotFound));
        }
    }).catch(function(err) {
        console.log(err, 'rrrrrr');
        return res.json(Response(500, "failed", constantsObj.validationMessages.internalError, {}));
    });
}


/**
 * Function is use to add billable items
 * @return json
 * Created by Ashish
 * @smartData Enterprises (I) Ltd
 * Created Date 24-Jul-2017
 */

function addBillableItem(req, res) {
    BillableItem.findById(req.body._id).exec(function(err, itemInfoData) {
        // console.log("req.body>>>>>", req.body)
        if (err) {
            return res.json(Response(500, "failed", constantsObj.validationMessages.internalError, err));
        } else {
            var model = new BillableItem();
            if (itemInfoData) {
                model = itemInfoData;
            }

            model.name = req.body.name;
            model.description = req.body.description;
            model.user_id = req.body.user_id;
            model.popup_flag = req.body.popup_flag;
            model.save(function(err, billableAttr) {
                if (err) {
                    return res.json({
                        code: 402,
                        'message': utility.validationErrorHandler(err),
                        data: {}
                    });
                } else {

                    Job.find(function(err, jobdata) {
                        if (err) {
                            return res.json(Response(500, "failed", constantsObj.validationMessages.internalError, {}));
                        } else {
                            async.each(jobdata, function(jobdata, callback) {
                                if (jobdata.billing_info.billable_items.length > 0) {
                                    for (var i = 0; i <= jobdata.billing_info.billable_items.length; i++) {
                                        if (jobdata.billing_info.billable_items[i] != undefined) {
                                            if (req.body.old_name === jobdata.billing_info.billable_items[i].name) {
                                                jobdata.billing_info.billable_items[i].name = req.body.name;
                                            }
                                        }
                                    }
                                }
                                var model = new Job();
                                if (jobdata) {
                                    model = jobdata;

                                }
                                model.billing_info.billable_items = jobdata.billing_info.billable_items
                                model.save(function(err, jobAttr) {
                                    if (err) {
                                        callback(err);
                                    } else {

                                        myDailies_Billable_items.find(function(err, myDaily) {
                                            // console.log('Hello', myDaily.length);
                                            if (err) {
                                                return res.json(Response(500, "failed", constantsObj.validationMessages.internalError, {}));
                                            } else {
                                                async.each(myDaily, function(myDailyBillable, callback) {
                                                    if (req.body.old_name === myDailyBillable.name) {
                                                        var model = new myDailies_Billable_items();
                                                        if (myDailyBillable) {
                                                            model = myDailyBillable;
                                                        }
                                                        model.name = req.body.name;
                                                        model.description = req.body.description;

                                                        model.save(function(err, jobAttr) {
                                                            console.log("jobAttr>>>", jobAttr)
                                                            if (err) {
                                                                callback(err);
                                                            } else {

                                                            }
                                                        });
                                                    }
                                                }, function(err) {
                                                    if (err) {
                                                        return res.json({
                                                            code: 402,
                                                            'message': utility.validationErrorHandler(err),
                                                            data: {}
                                                        });
                                                    } else {
                                                        return res.json({
                                                            code: 200,
                                                            'message': 'Billable Item added successfully.',
                                                            data: {
                                                                _id: billableAttr._id
                                                            }
                                                        });
                                                    }
                                                })
                                            }
                                        });
                                        callback();
                                    }
                                });



                            }, function(err) {
                                if (err) {
                                    return res.json({
                                        code: 402,
                                        'message': utility.validationErrorHandler(err),
                                        data: {}
                                    });
                                } else {
                                    return res.json({
                                        code: 200,
                                        'message': 'Billable Item added successfully.',
                                        data: {
                                            _id: billableAttr._id
                                        }
                                    });
                                }
                            })
                        }
                    })


                }
            });


        }
    }).catch(function(err) {
        res.json({
            code: 402,
            message: utility.validationErrorHandler(err),
            data: {}
        });
    });
}


/**
 * Function is use to delete Item by id
 * @access private
 * @return json
 * Created by Ashish
 * @smartData Enterprises (I) Ltd
 * Created Date 24-July-2017
 */
function deleteItemById(req, res) {
    var id = req.swagger.params.id.value;
    BillableItem.findById(id).exec(function(err, data) {
        if (err) {
            return res.json(Response(500, "failed", constantsObj.validationMessages.internalError, err));
        } else {
            if (!data) {
                return res.json(Response(402, "failed", constantsObj.validationMessages.userNotFound, {}));
            } else {
                data.deleted = true;
                data.save(function(err, userData) {
                    if (err)
                        return res.json(Response(500, "failed", constantsObj.validationMessages.internalError, err));
                    else {
                        return res.json({
                            'code': 200,
                            status: 'success',
                            "message": constantsObj.messages.itemDeleteSuccess,
                            "data": {}
                        });
                    }
                });
            }
        }
    })
}


/**
 * Function is use to delete Job by id
 * @access private
 * @return json
 * Created by Ashish
 * @smartData Enterprises (I) Ltd
 * Created Date 21-Aug-2017
 */
function deleteJobById(req, res) {
    // console.log("request is here>>>>", req.body)

    var id = req.swagger.params.id.value;
    //console.log('asdasd',id);
    Job.findById(id).exec(function(err, data) {
        if (err) {
            return res.json(Response(500, "failed", constantsObj.validationMessages.internalError, err));
        } else {
            if (!data) {
                return res.json(Response(402, "failed", constantsObj.validationMessages.userNotFound, {}));
            } else {
                data.deleted = true;
                data.save(function(err, userData) {
                    if (err)
                        return res.json(Response(500, "failed", constantsObj.validationMessages.internalError, err));
                    else {
                        return res.json({
                            'code': 200,
                            status: 'success',
                            "message": constantsObj.messages.jobDeleteSuccess,
                            "data": {}
                        });
                    }
                });
            }
        }
    })
}


/**
 * Function is use to fetch all assign job for foremen
 * @access private
 * @return json
 * Created by Ashish
 * @smartData Enterprises (I) Ltd
 * Created Date 25-Jul-2017
 */
function getForemenAssignJob(req, res) {
    console.log("getForemenAssignJob>>>>>>", req.body);
    var count = parseInt(req.body.count ? req.body.count : 0);
    var skip = parseInt(req.body.count * (req.body.page - 1));
    var sorting = utility.getSortObj(req.body);
    var user_id = req.body.users_id;
    var job_status = req.body.job_status;
    var searchText = decodeURIComponent(req.body.searchText).replace(/[[\]{}()*+?,\\^$|#\s]/g, "\\s+");

    async.waterfall([
        function(callback) {
            ForemenAssignJob.getAllAssignJobList(user_id, job_status, searchText, skip, count, sorting).then(function(listArr) {

                if (listArr.length > 0) {
                    for (var i = 0; i < listArr.length; i++) {
                        // console.log("listArr.length",listArr)
                        SupervisorJob.getAllAssignSupervisor(listArr[i].job_detail._id).then(function(superVisor) {
                            listArr.forEach(function(obj, index) {
                                obj.supervisor = superVisor;
                                if (index + 1 == listArr.length)
                                    callback(null, listArr);
                            });
                            // listArr[i].supervisor = superVisor;
                            // callback(null, listArr);
                        })

                    }
                } else {
                    callback(null);
                }

            }).catch(function(err) {
                callback(err)
            });
        }
    ], function(err, mainArr) {
        // console.log("mainerrrrrrr>>>>", mainArr)
        if (err) {
            return res.json(Response(500, "failed", constantsObj.validationMessages.internalError, err));
        } else {
            return res.json({
                'code': 200,
                status: 'success',
                "message": constantsObj.messages.dataRetrievedSuccess,
                "data": mainArr
            });
        }
    });
}


/**
 * Function is use to fetch all job for admin
 * @access private
 * @return json
 * Created by Rahul
 * @smartData Enterprises (I) Ltd
 * Created Date 18-Jul-2017
 */
function getJobId(req, res) {
    // console.log("rewasdasdasd", req.body)
    Job.find({
        'job_added_by': req.body.user_id
    }, function(err, jobdata) {
        if (err) {
            return res.json(Response(500, "failed", constantsObj.validationMessages.internalError, {}));
        } else {
            return res.json({
                'code': 200,
                status: 'success',
                "message": constantsObj.messages.dataRetrievedSuccess,
                "data": jobdata
            });
        }
    })
}

/**
 * Function is use to fetch job billable item
 * @access private
 * @return json
 * Created by Rahul
 * @smartData Enterprises (I) Ltd
 * Created Date 15-sept-2017
 */
function getBillableItem(req, res) {
    if (!req.body._id) {
        return res.json(Response(402, "failed", constantsObj.validationMessages.requiredFieldsMissing));
    } else {
        Job.findById(req.body._id, {
            billing_info: 1
        }).exec(function(err, jobdata) {
            if (err) {
                return res.json(Response(500, "failed", constantsObj.validationMessages.internalError, {}));
            } else {

                return res.json({
                    'code': 200,
                    status: 'success',
                    "message": constantsObj.messages.dataRetrievedSuccess,
                    "data": jobdata.billing_info.billable_items
                });
            }
        })
    }
}



var moment = require('moment')

function getForemenReport(req, res) {
    var arrData = [];

    var aggregate = [{
            $lookup: {
                from: 'jobs',
                localField: "job_id",
                foreignField: "_id",
                as: "jobInfo"
            }
        }, {
            $unwind: "$jobInfo"
        }, {
            $lookup: {
                from: "users",
                localField: "user_id",
                foreignField: "_id",
                as: "userInfo"
            }
        }, {
            $unwind: "$userInfo"
        }, {
            $lookup: {
                from: 'foremen_assign_jobs',
                localField: "userInfo._id",
                foreignField: "job_assign_to",
                as: "foremenInfo"
            }
        }, {
            $unwind: "$foremenInfo"
        },
        //    {
        //     $lookup: {
        //         from: 'roles',
        //         localField: "userInfo.role",
        //         foreignField: "_id",
        //         as: "roleInfo"
        //     }
        // },
        // {
        //     $unwind: "$roleInfo"
        // }
    ];


    var project = {
        $project: {
            createdAt: 1,
            status: 1,
            // foremenInfo: "$foremenInfo",
            contractor: "$userInfo.parent_id",
            userName: "$userInfo.firstname",
            job_assign_to: "$foremenInfo.job_assign_to",
            // userInfo: "$userInfo",
            actualEndDate: "$jobInfo.actual_end_date",
            jobId: "$jobInfo._id",
            // roleInfo: "$roleInfo.type"
        }
    };


    // var group={
    //     $group: {
    //         // _id: "$_id",
    //         _id: "$_id"
    //     }
    // }

    // var group={
    //      $group: {
    //                         // _id: "$_id",
    //                         _id: "$_id",
    //                         //   _id: null,
    //                         job_assign_toAAAAA:"$job_assign_to"
    //                         //  "foremenInfoyu": '$job_assign_to',  
    //                         // "userOrganization": {
    //                         //     $push: '$userOrgInfo'
    //                         // },
    //                         // uniqueValues: { 
    //                         //     $addToSet: "$_id"
    //                         // }

    //                     }

    // }

    aggregate.push(project);
    // aggregate.push(group);

    MyDailies.aggregate(aggregate).then(function(newUserInfo) {
        // console.log("newuserInfo>>>>>>  ",newUserInfo,newUserInfo.length)
        // console.log(" *********** Data ----------",newUserInfo," ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^");
        var newInfo = _.values(_.groupBy(newUserInfo, 'job_assign_to'));

        //console.log("Group ******************** ",newInfo);
        var data = [];
        if (newInfo.length) {
            newInfo.map((value, key) => {
                let total = 0,
                    actualSubmission = 0,
                    delaySubmission = 0,
                    userdata = {};
                userdata["userName"] = value[0]["userName"];
                userdata["status"] = value[0]["status"];
                userdata["job_assign_to"] = value[0]["job_assign_to"];
                userdata["contractor"] = value[0]["contractor"];
                // userdata["roleInfo"] = value[0]["roleInfo"];
                userdata["assigned_job"] = {
                    actual: [],
                    delay: []
                };
                if (value.length) {
                    value.map((childValue, childKey) => {
                        var actualIndex = _.findIndex(userdata["assigned_job"]["actual"], {
                            jobId: childValue.jobId.toString()
                        });
                        var delayIndex = _.findIndex(userdata["assigned_job"]["delay"], {
                            jobId: childValue.jobId.toString()
                        });
                        if (actualIndex < 0 && delayIndex < 0) {
                            if (moment(childValue.actualEndDate).format('YYYYMMDD') >= moment(childValue.createdAt).format('YYYYMMDD')) {
                                userdata["assigned_job"]["actual"].push({
                                    jobId: childValue.jobId.toString(),
                                    createdAt: childValue.createdAt,
                                    actualEndDate: childValue.actualEndDate
                                });
                                actualSubmission++;
                            }
                            if (moment(childValue.actualEndDate).format('YYYYMMDD') < moment(childValue.createdAt).format('YYYYMMDD')) {
                                userdata["assigned_job"]["delay"].push({
                                    jobId: childValue.jobId.toString(),
                                    createdAt: childValue.createdAt,
                                    actualEndDate: childValue.actualEndDate
                                });
                                delaySubmission++;
                            }
                            total++;
                        }
                    })
                }
                userdata["total"] = total;
                userdata["actual"] = actualSubmission;
                userdata["delay"] = delaySubmission;
                data.push(userdata);
                //console.log(value[0]["userName"], '======', "total", total, "actual", actualSubmission, "delay", delaySubmission)
            })

            // console.log(JSON.stringify(data));
            if (newInfo[0][0].createdAt && newInfo[0][0].actual_end_date) {
                if (moment(newInfo[0][0].createdAt).isBefore(newInfo[0][0].actual_end_date) || moment(newInfo[0][0].createdAt).isSame(newInfo[0][0].actual_end_date)) {
                    newInfo[0][0].status = 1
                    arrData.push(newInfo)

                } else {
                    newInfo[0][0].status = 0
                    arrData.push(newInfo)
                }
            }

            return res.json({
                'code': 200,
                status: 'success',
                "message": constantsObj.messages.dataRetrievedSuccess,
                "data": data
            });

        }

    }).then(function(data) {
        //console.log("arrdata",arrData)

        // console.log(" ERRRRR --",err); 
    });



}




//     var cursor = MyDailies.find().populate('job_id').populate('user_id').cursor();
//     cursor.eachAsync(function (doc) {
//         // console.log("doc>>>>>>>>>>>>>>>>",doc)
//         var val = null
//         return new Promise((resolve) => {
//             if(doc.job_id){
//                 if(doc.createdAt && doc.job_id.actual_end_date){
//                     if(moment(doc.createdAt).isBefore(doc.job_id.actual_end_date) ||  moment(doc.createdAt).isSame(doc.job_id.actual_end_date) ){
//                         doc.job_id.longitude = 1
//                         arrData.push(doc)
//                         resolve(val)
//                     }else{
//                         doc.job_id.longitude = 0
//                         arrData.push(doc)
//                         resolve(val)
//                     }
//                 }
//                 else{
//                     resolve(val)
//                 }
//             }
//             else{
//                 resolve(val)
//             }

//         })
//     }).then(function() {
//         // console.log(_.groupBy(arrData, function(num){ return num.job_assign_to.email }));
//         // console.log(arrData,'########************')
//         var resData = _.pairs(_.groupBy(arrData, function(num){ return num.user_id.firstname }))
//         // console.log(resData)
//         // _.values({one: 1, two: 2, three: 3});  => [1, 2, 3]
//         // _.pairs({one: 1, two: 2, three: 3});   => [["one", 1], ["two", 2], ["three", 3]]
//         // _.pairs(resData);
//         return res.json({ 'code': 200, status: 'success', "message": constantsObj.messages.dataRetrievedSuccess, "data": resData});
//     });
// }

// var moment = require('moment')
// function getForemenReport(req,res){


//  // var condition = {
//  //                'job_assign_to': mongoose.Types.ObjectId(user_id),
//  //                'deleted': false
//  //            }         




//     ForemenAssignJob.find().populate('job_assign_to').populate('job_id').exec(function(err,foremendata){
//         if(err){
//             console.log(err)
//         }
//         else{

//         var count = 0;
//         var datas =[];
//         var finalCount =[];
//         for(var i=0;i<foremendata.length;i++){

//             console.log('formendata value is', foremendata[i].job_id)
//             if(foremendata[i].job_id){
//             if(foremendata[i].job_id.actual_end_date && foremendata[i].job_id.projected_end_date){
//             var actualDate = moment(foremendata[i].job_id.actual_end_date)
//             var endDate = moment(foremendata[i].job_id.projected_end_date)
//                 if((endDate).isBefore(actualDate) || ((endDate).isSame(actualDate)) ){
//                 console.log('fghdsgfvbhjsdfvdsvfbhjdsfvshjdvfhvfhjds')


//                 datas.push({
//                     id:foremendata[i].job_id._id
//                 })
//                 console.log('what is the count',count,datas.length)

//                 for(var i=0;i<datas.length;i++){
//                     for(var j=i+1;j<datas.length;j++){
//                         if(datas[i].id==datas[j].id){
//                             count = count + 1 ;
//                             finalCount.push({
//                                 id:datas[i].id,
//                                 count:count
//                             })
//                         }
//                         else{
//                         }
//                     }
//                 }

//                 }
//             }
//             else{
//                 console.log('not found date')
//             }
//             }
//             else{
//                 console.log('again not found')
//             }

//         }
//         return res.json({ 'code': 200,'defaulterCount':finalCount, status: 'success', "message": constantsObj.messages.dataRetrievedSuccess, "data": foremendata });

//         }
//     })

// }




/*


*/


// function getForemenReport(req,res){
//  let aggregate = [{
//                     $lookup: {
//                         from: "foremen_crews",
//                         localField: "crews_id",
//                         foreignField: "_id",
//                         as: "crews"
//                     }
//                 },
//                 {
//                     $unwind: {
//                         path: "$crews",
//                         preserveNullAndEmptyArrays: true
//                     }
//                 }, {
//                     $lookup: {
//                         from: "users",
//                         localField: "user_id",firstname
//                         foreignField: "_id",
//                         as: "foreman"
//                     }
//                 },
//                 {
//                     $unwind: {
//                         path: "$foreman",
//                         preserveNullAndEmptyArrays: true
//                     }
//                 }, {
//                     $lookup: {
//                         from: "users",
//                         localField: "supervisor_id",
//                         foreignField: "_id",
//                         as: "supervisor"
//                     }
//                 },
//                 {
//                     $unwind: {
//                         path: "$supervisor",
//                         preserveNullAndEmptyArrays: true
//                     }
//                 }, {
//                     $lookup: {
//                         from: "jobs",
//                         localField: "job_id",
//                         foreignField: "_id",
//                         as: "job"
//                     }
//                 },
//                 {
//                     $unwind: {
//                         path: "$job",
//                         preserveNullAndEmptyArrays: true
//                     }
//                 },
//                 {
//                     $match: condition
//                 },
//                 {
//                     $project: {
//                         job_na: 1,
//                         daily_number: 1,
//                         job_map: 1,
//                         job_location: 1,
//                         latitude: 1,
//                         longitude: 1,
//                         to_date: 1,
//                         from_date: 1,
//                         no_production: 1,
//                         notes: 1,
//                         status: 1,
//                         is_draft: 1,
//                         reject_notes: 1,
//                         job_detail: {
//                             _id: '$job._id',
//                             job_id: '$job.job_id',
//                             client: '$job.client'
//                         },
//                         supervisor_details: {
//                             _id: '$supervisor._id',
//                             firstname: '$supervisor.firstname',
//                             lastname: '$supervisor.lastname'
//                         },
//                         foremen_details: {
//                             _id: '$foreman._id',
//                             firstname: '$foreman.firstname',
//                             lastname: '$foreman.lastname'
//                         },
//                         crews_details: {
//                             _id: '$crews._id',
//                             firstname: '$crews.firstname',
//                             lastname: '$crews.lastname'
//                         },


//                     }
//                 }
//             ]




// }
// function getForemenReport(req,res){


//                 var aggregate = [{
//                     $lookup: {
//                         from: 'userorganizations',
//                         localField: "_id",
//                         foreignField: "userId",
//                         as: "userOrgInfo"
//                     }
//                 },
//                 {
//                     $unwind: "$userOrgInfo"
//                 },
//                 {
//                     $lookup: {
//                         from: 'organizations',
//                         localField: "userOrgInfo.organization",
//                         foreignField: "_id",
//                         as: "orgInfo"
//                     }
//                 },
//                 {
//                     $unwind: "$orgInfo"
//                 },

//                 {
//                     $match: condition
//                 },
//                 ];
//                 var group = {
//                     $group: {
//                         _id: "$_id",
//                         "firstname": {
//                             $first: '$firstname'
//                         },
//                         "lastname": {
//                             $first: '$lastname'
//                         },
//                         "username": {
//                             $first: '$username'
//                         },
//                         "email": {
//                             $first: '$email'
//                         },
//                         "image": {
//                             $first: '$image'
//                         },
//                         "designation": {
//                             $first: '$designation'
//                         },
//                         "status": {
//                             $first: '$status'
//                         },
//                         "isInvite": {
//                             $first: '$isInvite'
//                         },
//                         "token": {
//                             $first: '$token'
//                         },
//                         "designationInfo": {
//                             $first: '$designationInfo'
//                         },
//                         "timezone": {
//                             $first: '$timezoneInfo._id'
//                         },
//                         "tz": {
//                             $first: '$timezoneInfo.name'
//                         },
//                         // "organization": {$first: '$userOrgInfo.organization'},
//                         "userOrganization": {
//                             $push: '$userOrgInfo'
//                         },
//                         uniqueValues: {
//                             $addToSet: "$_id"
//                         }
//                     }
//                 };

//                 var project = {
//                     $project: {
//                         firstname: 1,
//                         lastname: 1,
//                         username: 1,
//                         email: 1,
//                         image: 1,
//                         designation: 1,
//                         status: 1,
//                         isInvite: 1,
//                         token: 1,
//                         designationInfo: "$designationInfo",
//                         // timezoneInfo: "$timezoneInfo",                                  
//                         timezone: "$timezoneInfo._id",
//                         tz: "$timezoneInfo.name",
//                         userOrganization: "$userOrgInfo"

//                         // userOrganization: {
//                         //     $filter: {
//                         //         input: "$userOrgInfo",
//                         //         as: "item",
//                         //         cond: { $and: [
//                         //             { $eq: ["$$item.isJoined", true] },                                    
//                         //             { $eq: ["$$item.isDelete", false ] },
//                         //           ] }
//                         //     }
//                         // }
//                     }
//                 };
//                 aggregate.push(group);
//                 // aggregate.push(project);
// login
//                 var countQuery = [].concat(aggregate);
//                 // aggregate.push(project);
//                 User.aggregate(aggregate).then(function (newUserInfo) {
//                     if (newUserInfo.length > 0) {
//                         //userData = newUserInfo[0];

//                         Organization.populate(newUserInfo, {
//                             path: 'userOrganization.organization',
//                             select: {
//                                 'orgName': 1,
//                                 'status': 1,
//                                 'isDelete': 1,
//                                 'orgLogo': 1,
//                                 'userPlanId': 1
//                             }
//                         }, function (err, userInfo) {
//                             userData = userInfo[0];
//                             var activeOrgArr = userData.userOrganization[0];
//                             for (var count = 0; count <= userData.userOrganization.length - 1; count++) {
//                                 if (userData.userOrganization[count].isDefault) {
//                                     var activeOrgArr = userData.userOrganization[count];
//                                     userData.defaultOrg = activeOrgArr;
//                                 }
//                             }
//                             Permission.findOne({
//                                 userId: userData._id,
//                                 userOrganization: activeOrgArr._id
//                             }).exec(function (err, permissionData) {
//                                 if (err)
//                                     callbackUserData(err, false);
//                                 else {
//                                     userData.permission = permissionData;
//                                     // callbackUserData(null, userData);
//                                     if (activeOrgArr.organization.userPlanId) {
//                                         plan.findOne({ _id: activeOrgArr.organization.userPlanId }).exec(function (err, planData) {
//                                             if (err)
//                                                 callbackUserData(err, false);
//                                             else {
//                                                 userData.planDetail = planData;
//                                                 callbackUserData(null, userData);
//                                             }
//                                         });
//                                     } else {
//                                         callbackUserData(null, userData);
//                                     }
//                                 }
//                             });
//                         });
//                     } else {
//                         callbackUserData(err, false);
//                     }
//                 }).catch(function (err) {
//                     callbackUserData(err, false);
//                 });




// }
// function addSubJobs(req,res){
//      var segments=req.body;
//      var job_id= req.body.job_id;
//      console.log("req.body",segments);
//     if(!req.body){
//      return res.json(Response(500, "failed", constantsObj.validationMessages.internalError, err));
//     }else{
//       console.log("inside else");
//       async.each(segments.choices, function (subjobdata, callback) {
//         Job.findOne({
//             _id: job_id
//         }, function (err, jobdata) {
//                 if (err) {
//                     console.log("sdfsdfds")
//                 } else {

//                     console.log("jobdata",jobdata)
//                     callback();
//                 }
//             }); 

//     });
//         }
//     }


function addSubJobs(req, res) {
    if (!req.body) {
        return res.json(Response(402, "failed", constantsObj.validationMessages.requiredFieldsMissing));
    } else {
        Job.findOne({
            _id: req.body.job_id
        }, function(err, jobdata) {
            if (jobdata) {
                var subjobdata = req.body.choices;
                async.each(subjobdata, function(item, callback) {
                    var obj = {
                        JobRefrence: req.body.job_id,
                        subJob: item.name
                    };
                    new SubJob(obj).save(function(err, insartData) {
                        // console.log('insartData', insartData);
                        callback();
                    });
                }, function(err) {
                    if (err) {
                        return res.json(Response(500, "failed", constantsObj.validationMessages.internalError, err));
                    } else {
                        res.json({
                            code: 200,
                            status: "success",
                            message: 'Segments added successfully'
                        });
                    }
                });
            } else {
                return res.json(Response(402, "failed", constantsObj.validationMessages.JobNotFound, {}));

            }
        });
    }

}


function getAllSubjob(req, res) {
    // console.log("req.body>>>", req.headers, req.body)
    var job_id = req.body.job_id;
    if (!job_id) {
        return res.json(Response(402, "failed", constantsObj.validationMessages.requiredFieldsMissing));
    } else {
        SubJob.find({
            JobRefrence: job_id
        }, function(err, data) {
            if (err) {
                return res.json(Response(500, "failed", constantsObj.validationMessages.internalError, err));
            } else {
                res.json({
                    code: 200,
                    status: "success",
                    message: 'subjob retrived successfully',
                    data: data
                });
            }
        })
    }
}


// {
//   "code": 200,
//   "status": "success",
//   "message": "subjob retrived successfully",
//   "data": [
//     {
//       "_id": "5b14d91e6b2afe26e6bb174b",
//       "updatedAt": "2018-06-04T06:15:58.273Z",
//       "createdAt": "2018-06-04T06:15:58.273Z",
//       "JobRefrence": "5b14d0d11f24061aadbb8524",
//       "subJob": "awdawd",
//       "__v": 0,
//       "deleted": false
//     },
//     {
//       "_id": "5b14d91e6b2afe26e6bb174a",
//       "updatedAt": "2018-06-04T06:15:58.267Z",
//       "createdAt": "2018-06-04T06:15:58.267Z",
//       "JobRefrence": "5b14d0d11f24061aadbb8524",
//       "subJob": "awdawd",
//       "__v": 0,
//       "deleted": false
//     }
//   ]
// }




function insertJobAddedBy(req, res) {
    SupervisorJob.update({}, {
        $set: {
            "job_assign_by": null
        }
    }, {
        multi: true
    }).exec(function(err, data) {
        if (err) {
            console.log(err)
        } else {
            // console.log("data is here", data)
            res.json({
                'code': 200,
                status: 'success',
                "message": constantsObj.messages.dataRetrievedSuccess,
                "data": data
            })
        }
    })
}

// function callUpstreamSuperVisorList(req,res){
//     console.log("req.body.job_id>>>>>",req.body.job_id);
// SupervisorJob.find({job_id: req.body.job_id, supervisor_layer: 1})
//    //Layer 1 for UpstreamSupervisor    //Layer 2 for DownStreamSuperVisor
// .populate('job_assign_to', 'firstname lastname email').exec(function(err, superVisorList){




//     SupervisorJob.find({job_id: req.body.job_id , supervisor_layer: 1})
//     .populate('job_assign_to', 'firstname lastname email').exec(function(err,superVisorList){
//    if(err){
//        console.log("errrr>>>",err)
//    }
//     else{
//          res.json({
//            'code': 200,
//            status: 'success',
//            "message": constantsObj.messages.dataRetrievedSuccess,
//            "data": superVisorList
//        }) 
//     }

//     })



function callUpstreamSuperVisorList(req, res) {
    console.log("request.body is here", req.body)
    let superIdArray = [];
    SupervisorJob.find({
            job_id: req.body.job_id,
            supervisor_layer: 1,
            // job_assign_to: {$ne: '5a5857c4f75c43150c4ff8d8'}
        })
        .populate('job_assign_to', 'firstname lastname email').exec(function(err, superVisorList) {
            // console.log("supervisorList>>>", superVisorList)
            if (err) {
                return res.json(Response(500, "failed", constantsObj.validationMessages.internalError, err));
            } else {
                async.each(superVisorList, function(item, callback) {
                    var newObj = {
                        supervisor_job: {},
                        supervisor_detail: {}
                    };
                    newObj.supervisor_job = item;
                    // console.log("item is herere", item)
                    User.findOne({
                        _id: item.job_assign_to._id
                    }).populate('parent_id', 'company_name').exec(function(err, supervisorData) {
                        // console.log("superVisorData>>>>", supervisorData)
                        if (err) {
                            return res.json(Response(500, "failed", constantsObj.validationMessages.internalError, err));
                        } else {
                            newObj.supervisor_detail = supervisorData;
                            superIdArray.push(newObj)
                            callback();
                        }
                    })
                }, function(err) {
                    if (err) {
                        return res.json(Response(500, "failed", constantsObj.validationMessages.internalError, err));
                    } else {
                        res.json({
                            code: 200,
                            status: "success",
                            message: 'Supervisor fetched successfully',
                            "data": superIdArray
                        });
                    }
                });
            }
        })
}


// function saveSelectedSupervisor(req,res){
//         // if(!req.body.job_id &&)
//        if(!req.body.job_id && !req.body.supervisor_id && !supervisor_layer){
//     return res.json(Response(500, "failed", constantsObj.validationMessages.internalError, err));

//        }
// else{

// }
// }
// var model = new AssignUpstreamDownstream()
// model.job_id = req.body.job_id;
// model.submitted_to = req.body.supervisor_id;
// model.submitted_by = req.body.user._id;
// model.created_by = req.body.created_by;
// if (!req.body.submitted) {
//     model.status = 'Active'
// }
// var obj = {
//     userId: '5b0e3014b4749f7e04fbaa1b',
//     jobId: '5b2b980f116a1868a20d978a',
//     submitedTo: '5b0e2ee3b4749f7e04fbaa12'
// }
// submitJobToContractor(obj)

function submitJobToContractor(req, res) {

    console.log("Submnit Req body submitJobToContractor : ", req.body)
    // var userId = '5b0e3014b4749f7e04fbaa1b',
    // jobId = '5b2b980f116a1868a20d978a',
    // submitedTo = '5b0e2ee3b4749f7e04fbaa12';
    var user_id = req.body.user_id,
        job_id = req.body.job_id,
        submitted_to = req.body.submitted_to;
    var finalResponse = {};
    async.waterfall([
        function(callback) {
            Job.findOne({
                _id: job_id
            }, function(err, jonInfo) {
                if (err) {
                    console.log("Err 1 :: ", err);
                    callback(err, null);
                } else {
                    finalResponse.jonInfo = jonInfo;
                    callback(null, finalResponse);
                }
            });
        },
        function(finalResponse, callback) {
            SupervisorJob.findOne({
                job_id: job_id,
                job_assign_to: user_id
            }, function(err, supervisiorjobInfo) {
                if (err) {
                    console.log("Err 2 :: ", err);
                    callback(err, null);
                } else {
                    finalResponse.supervisiorjobInfo = supervisiorjobInfo;
                    callback(null, finalResponse);
                }
            });
        },
        // function(finalResponse, callback) {
        //  MyDailies.findOneAndUpdate({
        //     job_id: job_id
        // }, {
        //         $set: status_by_supervisor = "Active",
        //     }, function (err, updatedata) {
        //         if (err) {
        //             console.log("sdfsdfds")
        //             callback(err, null);
                    
        //         } else {
        //             console.log("ActiveStatus", updatedata)
        //       finalResponse.updatedata = updatedata;
        //             callback(null, finalResponse);
        //         }
        //     })
        // },
        function(finalResponse, callback) {
            console.log("finalResponse", finalResponse)
            AssignUpstreamDownstream.findOne({
                job_id: job_id,
                submitted_by: user_id
            }, function(err, jobSubmitInfo) {
                console.log("jobSubmitInfo", jobSubmitInfo)
                if (err) {
                    console.log("Err 3 :: ", err);
                    callback(err, null);
                } else if (jobSubmitInfo) {
                    console.log("Inside Old Assign Fun", jobSubmitInfo);
                    if (jobSubmitInfo.status == 'Complete') {
                        return res.json({
                            code: 402,
                            message: 'Already submited',
                            data: jobSubmitInfo
                        });
                    } else if (jobSubmitInfo.status == 'Accepted') {
                        return res.json({
                            code: 402,
                            message: 'Already accepted',
                            data: jobSubmitInfo
                        });
                    } else if (jobSubmitInfo.status == 'Complete') {
                        return res.json({
                            code: 402,
                            message: 'Already accepted',
                            data: jobSubmitInfo
                        });
                    }
                } else {
                    callback(null, finalResponse);
                }
            });
        },
        function(finalResponse, callback) {
            console.log("Inside New Assign Fun");
            var submitObj = {
                job_id: job_id,
                supervisor_job_id: finalResponse.supervisiorjobInfo._id,
                assigned_by: finalResponse.supervisiorjobInfo.assigned_by,
                submitted_by: user_id,
                submitted_to: submitted_to,
                created_by: finalResponse.jonInfo.job_added_by,
                status: 'Complete',
            };
            new AssignUpstreamDownstream(submitObj).save(function(err, submitedInfo) {
                if (err) {
                  console.log("Err 4 :: ", err);
                    callback(err, null);
                } else {
                    // console.log("submitObject is here", submitObj)
                    // console.log("submitedInfo : ", submitedInfo);
                    finalResponse.submitedInfo = submitedInfo;
                    callback(null, finalResponse);
                }
            });
        },
        // function (finalResponse, callback) { //Push Notification code

        // },
    ], function(err, data) {
        if (err) {
            console.log("Err final :: ", err);
            return res.json(Response(500, "failed", constantsObj.validationMessages.internalError, err));
        } else {
            // console.log("final data : ", data);
            res.json({
                code: 200,
                status: "success",
                message: 'Submitted Successfully',
                "data": data
            });
        }
    });
}

  function changeAllStatus (req,res){
      console.log("changeAllstatus", req.body);
   var job_id =  req.body.job_id;
   var user_id = req.body.user_id;
   var up_stream_supervisor_id = req.body.up_stream_supervisor_id;
   var mydailies_id = req.body.mydailies_id;
//    var  job_id =  "5b34a3f155aedd3e785b795c";
//    var user_id = "5b0e30b3b4749f7e04fbaa1d";
//    var  mydailies_id = "5b34a4de55aedd3e785b7965";
     var finalResponse = {};
         async.waterfall([
            function(callback){
             SupervisorJob.findOne({job_assign_to: user_id, job_id: job_id }).exec(function(err,supervisorJobData){
                if (err) {
                    callback(err, false);
                   } else {
                       console.log("supervisorJobData>>>>",supervisorJobData)
                    finalResponse.supervisorJobData = supervisorJobData;
                    callback(null, finalResponse);
                }                        
                })
        },
        function(finalResponse,callback){
            console.log("finalresponse<><>,",finalResponse.supervisorJobData.supervisor_layer)
           if(finalResponse.supervisorJobData.supervisor_layer == 1){
             MyDailies.update({
                        _id: mongoose.Types.ObjectId(mydailies_id),
                    }, {
                            $set: {
                                status: "Accepted"
                            }
                        }).exec(function(err,mydailiesData){
                 if (err) {
         
                    callback(err, null);
                } else {
                    finalResponse.mydailiesData = mydailiesData;
                    callback(null, finalResponse);
                } })
        }
        else {
                    callback(null, finalResponse);
                }
            },
    function(finalResponse,callback){
        if(finalResponse.supervisorJobData.supervisor_layer == 1){
             AssignUpstreamDownstream.update({
                        job_id: job_id,
                    }, {
                            $set: {
                                status: "Accepted"
                                  }
                        }).exec(function(err,assignData){
           if (err) {
                    callback(err, null);
                } else {
                    finalResponse.assignData = assignData;
                    callback(null, finalResponse);
                }                        
                        
                        })
                        }
     
                  }
                 ],
            function(err, data) {
        if (err) {
            return res.json(Response(500, "failed", constantsObj.validationMessages.internalError, err));
        } else {
            res.json({
                code: 200,
                status: "success",
                message: 'Updated Successfully',
                "data": data
            });
        }
    })   
    
   
  }


   function rejectAllStatus(req,res){
   console.log("request is here", req.body)
   var job_id =  req.body.job_id;
   var user_id = req.body.user_id;
   var up_stream_supervisor_id = req.body.up_stream_supervisor_id;
   var reject_Notes2 = req.body.reject_Notes2;
   var mydailies_id = req.body.mydailies_id;
   var finalResponse = {};
   async.waterfall([
            function(callback){
             SupervisorJob.findOne({job_assign_to: user_id, job_id: job_id }).exec(function(err,supervisorJobData){
                if (err) {
                    callback(err, false);
                   } else {
                       console.log("supervisorJobData>>>>",supervisorJobData)
                    finalResponse.supervisorJobData = supervisorJobData;
                    callback(null, finalResponse);
                }                        
                })
        },
       function(finalResponse,callback){
            console.log("SaveREjectNotes",finalResponse)
           if(finalResponse.supervisorJobData.supervisor_layer == 1){
             MyDailies.findOneAndUpdate({
            _id: mongoose.Types.ObjectId(mydailies_id)
        }, {
            reject_Notes2 : req.body.reject_Notes2
        }, function (err, mydailiesData) {
            if (err) {
                console.log("sdfsdfds")
            } else {
                
      finalResponse.mydailiesData = mydailiesData;
                    callback(null, finalResponse);            }
        });
        }
        else {
                    callback(null, finalResponse);
                }
            },

        function(finalResponse,callback){
            console.log("finalresponse<><>,",finalResponse.supervisorJobData.supervisor_layer)
           if(finalResponse.supervisorJobData.supervisor_layer == 1){
                
             MyDailies.update({
                        _id: mydailies_id,
                    }, {
                            $set: {
                                status: "Rejected" ,
                                status_by_supervisor : "Active",
                                is_valid_superVisor: true

                            }
                        }).exec(function(err,mydailiesData){
                 if (err) {
         
                    callback(err, null);
                } else {
                    finalResponse.mydailiesData = mydailiesData;
                    callback(null, finalResponse);
                } })
        }
        else {
                    callback(null, finalResponse);
                }
            },
        function(finalResponse,callback){
        if(finalResponse.supervisorJobData.supervisor_layer == 1){
             AssignUpstreamDownstream.update({
                        job_id: job_id,
                    }, {
                            $set: {
                                status: "Rejected"
                                  }
                        }).exec(function(err,assignData){
           if (err) {
                    callback(err, null);
                } else {
                    finalResponse.assignData = assignData;
                    callback(null, finalResponse);
                }                        
                        
                        })
                        }
     
                  }
                 ],
            function(err, data) {
        if (err) {
            return res.json(Response(500, "failed", constantsObj.validationMessages.internalError, err));
        } else {
            res.json({
                code: 200,
                status: "success",
                message: 'Updated Successfully',
                "data": data
            });
        }
    })   

 }
        
 
 
 
 
 
        function resubmit(req,res)  {
            console.log("req.body>>>>",req.body)    
              let  mydailies_id = req.body.mydailies_id;
              let finalResponse = {}
               async.waterfall([
              function(callback){
              MyDailies.findOneAndUpdate({_id:mydailies_id } ,{
             up_stream_supervisor_id : req.body.up_stream_supervisor_id,
             status: "Active",
             status_by_supervisor: "Accepted"
            }).exec(function(err,mydailiesData){
                if (err) {
                    callback(err, false);
                   } else {
                       console.log("mydailiesData>>>>",mydailiesData)
                    finalResponse.mydailiesData = mydailiesData;
                    callback(null, finalResponse);
                }                        
                })
            }

             ],
         function(err, data) {
            if (err) {
            return res.json(Response(500, "failed", constantsObj.validationMessages.internalError, err));
                   } else {
            res.json({
                code: 200,
                status: "success",
                message: 'Resubmitted Successfully',
                "data": data
            });
                   }
             })
         }



function getAllUpstreamSupervisorList(req,res)  {
            // console.log("req.body>>>>",req.body)    
              let  mydailies_id = req.body.mydailies_id;
              let job_id = req.body.job_id;
              let finalResponse = {}
               async.waterfall([
              function(callback){
              Job.find({_id: job_id }).exec(function(err,jobData){
                if (err) {
                    callback(err, false);
                   } else {
                       console.log("jobData>>>>",jobData)
                    finalResponse.jobData = jobData;
                    callback(null, finalResponse);
                }                        
                })
            },
            function(finalResponse,callback){
                // console.log("finalResponse1>>>",finalResponse)
              User.find({_id: finalResponse.jobData[0].job_added_by }).exec(function(err,userData){
                if (err) {
                    callback(err, false);
                   } else {
                    //    console.log("userData>>>>",userData)
                    finalResponse.userData = userData;
                    callback(null, finalResponse);
                }                        
                })
            },
                 function(finalResponse,callback){
                // console.log("finalResponse2>>>",finalResponse)
              User.find({parent_id: finalResponse.userData[0]._id , deleted: false }).populate('role').exec(function(err,userData){
                if (err) {
                    callback(err, false);
                   } else {
                       console.log("userData>>>>2",userData)
                    finalResponse.userData = userData;
                    callback(null, finalResponse);
                }                        
                })
            }
        //         function(finalResponse,callback){
        //         console.log("finalResponse3>>>",finalResponse)
        // async.each(finalResponse.userData, function(item,callback){
        //     console.log("item is here", item)
        //     Role.find({ _id: item.role}).exec(function(err,roleData){
        //            if (err) {
        //             callback(err, false);
        //            } else {
        //                console.log("roleData>>>>4",roleData)
        //             finalResponse.roleData = roleData;
        //             callback(null, finalResponse);
        //         }       


        //     })

        // })
        //     }     

             ],
         function(err, finalResponse) {
            let data = finalResponse.userData
            if (err) {
            return res.json(Response(500, "failed", constantsObj.validationMessages.internalError, err));
                   } else {
            res.json({
                code: 200,
                status: "success",
                message: 'UpstreamSupervisorList',
                "data": data
            });
                   }
             })
            
        
        
        
            }















// var finalResponse = {};
// async.waterfall([
//         function(callback) {
//             AssignUpstreamDownstream.findOne({
//                     submitted_by: "5b0e3014b4749f7e04fbaa1b"
//                 }),
//                 function(err, jonInfo) {
//                     if (err) {
//                         console.log(err)
//                     } else {
//                         // console.log("joninfo>>>", jonInfo)
//                         finalResponse.jonInfo = jonInfo;
//                         callback(null, finalResponse);
//                     }
//                 };
//         },
//         function(finalResponse, callback) {
//             // console.log("finalresponse is here>>>>", finalResponse)
//         }

//     ],
//     function(err, data) {
//         if (err) {
//             return res.json(Response(500, "failed", constantsObj.validationMessages.internalError, err));
//         } else {
//             res.json({
//                 code: 200,
//                 status: "success",
//                 message: 'Supervisor fetched successfully',
//                 "data": data
//             });
//         }
//     })




