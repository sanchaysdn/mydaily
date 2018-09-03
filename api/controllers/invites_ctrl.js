'use strict';

var mongoose = require('mongoose'),
    Job = mongoose.model('Job'),
    User = mongoose.model('User'),
    JobInvities = mongoose.model('Job_invites'),
    SupervisorJob = mongoose.model('Supervisor_jobs'),
    BillableItem = mongoose.model('Billable_item'),
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

module.exports = {
    getInvitiesList: getInvitiesList,
    jobInvites: jobInvites,
    getjobInvites: getjobInvites,
    acceptJobInvite: acceptJobInvite,
    rejectJobInvite: rejectJobInvite,
    shareJobAcceptence: shareJobAcceptence,
    getInvite_Supervisor_Id: getInvite_Supervisor_Id
};

/**
 * Function is use to fetch all Invities List
 * @access private
 * @return json
 * Created by Ashish
 * @smartData Enterprises (I) Ltd
 * Created Date 27-Jul-2017
 */
function getInvitiesList(req, res) {
    if (!req.body.users_id) {
        return res.json(Response(402, "failed", constantsObj.validationMessages.requiredFieldsMissing));
    } else {
        var count = parseInt(req.body.count ? req.body.count : 0);
        var skip = parseInt(req.body.count * (req.body.page - 1));
        var sorting = utility.getSortObj(req.body);
        var user_id = req.body.users_id;
        var job_id = req.body.job_id;
        var searchText = decodeURIComponent(req.body.searchText).replace(/[[\]{}()*+?,\\^$|#\s]/g, "\\s+");;
        async.waterfall([
            function (callback) {
                JobInvities.getAllInvitesList(user_id, job_id, searchText, skip, count, sorting).then(function (listArr) {
                    callback(null, listArr);
                }).catch(function (err) {
                    callback(err)
                });
            }
        ], function (err, mainArr) {
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
}


function jobInvites(req, res) {
    console.log("request.body<<<<<",req.body)
    if (!req.body.invite_assign_by || !req.body.invite_assign_to || !req.body.job_id) {
        return res.json(Response(402, "failed", constantsObj.validationMessages.requiredFieldsMissing));
    } else {
        JobInvities.findOne({
            job_id: req.body.job_id
        }).exec(function (err, invitejobdata) {
            if (err) {
                return res.json(Response(500, "failed", constantsObj.validationMessages.internalError, err));
            } else {
                if (invitejobdata) {

                    return res.json({
                        'code': 402,
                        "message": constantsObj.validationMessages.JobAlreadyExist
                    });
                } else {

                    var invitejob = new JobInvities();
                    invitejob.invities_assign_by = req.body.invite_assign_by;
                    invitejob.invities_assign_to = req.body.invite_assign_to;
                    invitejob.job_id = req.body.job_id
                    // invitejob.invitesupervisor = invitejob.invitesupervisor == 'First'?'Invited':'Second Invited';

                    invitejob.save(function (err, inviteData) {

                        if (err) {
                            return res.json(Response(500, "failed", utility.validationErrorHandler(err), {}));
                        } else {

                            return res.json({
                                'code': 200,
                                status: 'success',
                                "message": constantsObj.messages.jobinvitesuccess,
                                "data": inviteData
                            });
                        }

                    });
                }
            }
        });
    }
}


function getjobInvites(req, res) {
    if (!req.body.users_id) {
        return res.json(Response(402, "failed", constantsObj.validationMessages.requiredFieldsMissing));
    } else {
        var count = parseInt(req.body.count ? req.body.count : 0);
        var skip = parseInt(req.body.count * (req.body.page - 1));
        var sorting = utility.getSortObj(req.body);
        var user_id = req.body.users_id;
        var searchText = decodeURIComponent(req.body.searchText).replace(/[[\]{}()*+?,\\^$|#\s]/g, "\\s+");;
        async.waterfall([
            function (callback) {
                JobInvities.getAllAssignInvitesList(user_id, searchText, skip, count, sorting).then(function (listArr) {
                    callback(null, listArr);
                }).catch(function (err) {
                    callback(err)
                });
            }
        ], function (err, mainArr) {
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
}


/**
 * Function is use to Accept job 
 * @access private
 * @return json
 * Created by Ashish
 * @smartData Enterprises (I) Ltd
 * Created Date 1-Aug-2017
 */
function acceptJobInvite(req, res) {
    console.log("fdafad",req.body)
    if (!req.body.option) {
        return res.json(Response(402, "failed", constantsObj.validationMessages.requiredFieldsMissing));
    } else {
        JobInvities.findById(req.body.option.invite_job_id).exec(function (err, invitiesInfoData) {
            console.log("inviteiesinfodata",invitiesInfoData)
            if (err) {

                return res.json(Response(500, "failed", constantsObj.validationMessages.internalError, err));
            } else {
                var model = new JobInvities();
                if (invitiesInfoData) {
                    model = invitiesInfoData;
                }
                if (req.body.option.merge_status) {
                    model.merge_status = true;
                } else {
                    delete req.body.option.job_details.billing_info.billable_items;
                    model.merge_status = false;
                }

                model.status = "Accepted";
                model.save(function (err, invitiesAttr) {
                    if (err) {
                        // console.log('Helloooooo');
                        return res.json({
                            code: 402,
                            'message': utility.validationErrorHandler(err),
                            data: {}
                        });
                    } else {
                        async.each(req.body.option.job_assign_to, function (supervisorItem, callback) {
                            console.log("supewervisorItem",supervisorItem)
                            var model = new SupervisorJob();
                            model.job_assign_to = supervisorItem;
                            model.job_id = req.body.option.job_details._id;
                            model.daily_sumbission_report = "Internal";
                            model.approval_status = req.body.option.approval_status;
                            model.invities_status = true;

                            model.save(function (err, supervisorData) {
                                console.log("supervisorData>>>",supervisorData)
                                if (err) {
                                    //return res.json({ code: 402, 'message': utility.validationErrorHandler(err), data: {} });
                                } else {
                                    var newBillable = [];
                                    var billableItem = req.body.option.job_details.billing_info.billable_items;
                                    if (billableItem) {
                                        billableItem.forEach(function (v) {
                                            delete v._id
                                        });
                                        billableItem.forEach(function (obj) {
                                            obj.user_id = req.body.option.job_assign_by;
                                        });
                                        async.each(billableItem, function (item, callback) {
                                            console.log("item is here",item)
                                            var billable_data = new BillableItem(item);
                                            billable_data.save(function (err, newbillItem) {
                                                if (err) {
                                                    callback(err);
                                                } else {
                                                    var tmp = JSON.parse(JSON.stringify(newbillItem));
                                                    newBillable.push(tmp);
                                                    callback();
                                                }
                                            });
                                        }, function (err) {
                                            // if any of the file processing produced an error, err would equal that error
                                            if (err) {
                                                //return res.json({ code: 402, 'message': utility.validationErrorHandler(err), data: {} });
                                            } else {
                                                newBillable.forEach(function (v) {
                                                    delete v.updatedAt
                                                });
                                                newBillable.forEach(function (v) {
                                                    delete v.createdAt
                                                });
                                                newBillable.forEach(function (v) {
                                                    delete v.user_id
                                                });
                                                newBillable.forEach(function (v) {
                                                    delete v.deleted
                                                });
                                                newBillable.forEach(function (v) {
                                                    delete v.__v
                                                });
                                                newBillable.forEach(function (v) {
                                                    delete v.status
                                                });
                                                Job.findOne({
                                                    "_id": req.body.option.user_job_id,
                                                    "deleted": false
                                                }).then(function (jobData) {
                                                    console.log("jobdata is here bro",jobData)
                                                    if (jobData) {
                                                        jobData.billing_info.billable_items = newBillable;
                                                        jobData.job_id = req.body.option.job_details.job_id;
                                                            console.log("savedata584991515",savedData)                                                        
                                                        jobData.job_shared_to=invitiesInfoData.invities_assign_to;
                                                        jobData.save(function (err, savedData) {
                                                            console.log("savedata",savedData)
                                                            // if (err) {
                                                            //     return res.json({ code: 402, 'message': utility.validationErrorHandler(err), data: {} });
                                                            // } else {
                                                            //     return res.json({ code: 200, 'message': 'Job Accepted successfully.', data: { _id: jobData._id } });
                                                            // }
                                                        });
                                                    } else {
                                                        // return res.json({ code: 402, 'message': utility.validationErrorHandler(err), data: {} });
                                                    }
                                                }).catch(function (err) {
                                                    res.json({
                                                        code: 402,
                                                        message: utility.validationErrorHandler(err),
                                                        data: {}
                                                    });
                                                });

                                            }
                                        });
                                    }
                                    // else {
                                    //     return res.json({ code: 200, "message": constantsObj.messages.jobAcceptSuccess});
                                    // }

                                }

                            })
                            callback();

                        }, function (err) {
                            if (err) {
                                return res.json({
                                    code: 402,
                                    'message': utility.validationErrorHandler(err),
                                    data: {}
                                });

                            } else {
                                return res.json({
                                    code: 200,
                                    "message": constantsObj.messages.jobAcceptSuccess
                                });
                            }
                        })

                    }

                })
            }
        }).catch(function (err) {
            res.json({
                code: 402,
                message: utility.validationErrorHandler(err),
                data: {}
            });
        });
    }
}

function rejectJobInvite(req, res) {
    if (!req.body.job._id) {
        return res.json(Response(402, "failed", constantsObj.validationMessages.requiredFieldsMissing));
    } else {
        JobInvities.findById(req.body.job._id).exec(function (err, invitiesInfoData) {
            if (err) {
                return res.json(Response(500, "failed", constantsObj.validationMessages.internalError, err));
            } else {
                var model = new JobInvities();
                if (invitiesInfoData) {
                    model = invitiesInfoData;
                }
                model.status = "Rejected";
                model.save(function (err, invitiesAttr) {
                    if (err) {
                        return res.json({
                            code: 402,
                            'message': utility.validationErrorHandler(err),
                            data: {}
                        });
                    } else {
                        return res.json({
                            code: 200,
                            'message': constantsObj.messages.jobrejectSuccess,
                            data: {
                                _id: invitiesAttr._id
                            }
                        });
                    }
                });
            }
        }).catch(function (err) {
            res.json({
                code: 402,
                message: utility.validationErrorHandler(err),
                data: {}
            });
        });
    }
}


/**
 * Function is use to Assign Share job to supervisor 
 * @access private
 * @return json
 * Created by Ashish
 * @smartData Enterprises (I) Ltd
 * Created Date 1-Aug-2017
 */
function shareJobAcceptence(req, res) {

    if (!req.body.job_id || !req.body.job_assign_to) {
        return res.json(Response(402, "failed", constantsObj.validationMessages.requiredFieldsMissing));
    } else {
        SupervisorJob.find({
            job_id: req.body.job_id,
            job_assign_to: req.body.job_assign_to
        }).exec(function (err, job) {
            if (err) {
                return res.json(Response(500, "failed", constantsObj.validationMessages.internalError, err));
            } else {

                if (job.length != 0) {
                    return res.json({
                        code: 402,
                        'message': constantsObj.messages.jobAlreadyAssign,
                        data: {
                            _id: job._id
                        }
                    });

                } else {
                    var model = new SupervisorJob();
                    model.job_assign_to = req.body.job_assign_to;
                    model.job_id = req.body.job_id;
                    model.daily_sumbission_report = "Internal";
                    model.approval_status = true;
                    model.invities_status = true;

                    model.save(function (err, supervisorData) {
                        if (err) {
                            return res.json({
                                code: 402,
                                'message': utility.validationErrorHandler(err),
                                data: {}
                            });
                        } else {
                            return res.json({
                                code: 200,
                                'message': constantsObj.messages.supervisorAssignJob,
                                data: {
                                    _id: supervisorData._id
                                }
                            });
                        }
                    }).catch(function (err) {
                        res.json({
                            code: 402,
                            message: utility.validationErrorHandler(err),
                            data: {}
                        });
                    });
                }


            }
        })
    }
}

function getInvite_Supervisor_Id(req, res) {
    console.log("getInvite_Supervisor_Id",req.body)
    if (!req.body.job_id) {
        return res.json(Response(402, "failed", constantsObj.validationMessages.requiredFieldsMissing));
    } else {
        SupervisorJob.findOne({
            'job_id': req.body.job_id,
            'invities_status': true,
            'approval_status': true
        }, function (err, jobdata) {
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
}