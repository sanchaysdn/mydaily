// import {
//     start
// } from 'repl';

// import {
//     func
// } from '../../../../../../../.cache/typescript/2.6/node_modules/@types/joi';

// import {
//     concat
// } from '../../../../../../../.cache/typescript/2.6/node_modules/@types/joi';

// import {
//     ifError
// } from 'assert';

'use strict';

var mongoose = require('mongoose'),
    User = mongoose.model('User'),
    MyDailies = mongoose.model('My_dailies'),
    ForemenCrew = mongoose.model('Foremen_crew'),
    MyDailiesImage = mongoose.model('Dailies_Image'),
    myDailies_Billable_items = mongoose.model('myDailies_Billable_item'),
    BillableItem = mongoose.model('Billable_item'),
    ForemenAssignJob = mongoose.model('Foremen_assign_jobs'),
    SupervisorJob = mongoose.model('Supervisor_jobs'),
    JobInvites = mongoose.model('Job_invites'),

    moment = require('moment'),
    moment = require('moment-timezone'),
    Role = mongoose.model('Role'),
    XlsxPopulate = require('xlsx-populate'),
    lodas = require('lodash'),
    randomstring = require("randomstring"),
    geolib = require('geolib'),
    Admin = mongoose.model('Admin'),
    Job = mongoose.model('Job'),
    Response = require('../lib/response.js'),
    formidable = require('formidable'),
    util = require('util'),
    pdf = require('html-pdf'),
    fs = require('fs-extra'),
    fss = require('fs'),
    path = require('path'),
    utility = require('../lib/utility.js'),
    constantsObj = require('./../../constants'),
    config = require('../../config/config.js'),
    validator = require('validator'),
    async = require('async'),
    co = require('co'),
    _ = require('underscore'),
    forEach = require('async-foreach').forEach,
    common = require('../../config/common.js');




module.exports = {
    updateDailiesStatus: updateDailiesStatus,
    addMyDailies: addMyDailies,
    listMyDailies: listMyDailies,
    getDailiesImage: getDailiesImage,
    addDailiesImages: addDailiesImages,
    listMyDailiesByAdmin: listMyDailiesByAdmin,
    deleteDailiesByID: deleteDailiesByID,
    getDailiesByID: getDailiesByID,
    downloadPdf: downloadPdf,
    downloadXls: downloadXls,
    updateDailyStatus: updateDailyStatus,
    saveViewEdit: saveViewEdit,
    downloadMultiplePdf: downloadMultiplePdf,
    getDailiesDate: getDailiesDate,
    getDeletedDailies: getDeletedDailies,
    archiveDailies: archiveDailies,
    insertLastAction: insertLastAction,
    insertCurrentAction: insertCurrentAction
    // insertDailies: insertDailies

};

/**
 * Function is use to update my dailies with status
 * @access private
 * @return json
 * Created by Ashish
 * @smartData Enterprises (I) Ltd
 * Created Date 08-Aug-2017 
 */

function updateDailiesStatus(req, res) {
    console.log("updateDailiesStatus>>>", req.body)
    MyDailies.findById(req.body._id).exec(function (err, myDailesInfoData) {
        //console.log("myDailesInfoData>>>>>", myDailesInfoData)
        if (err) {
            return res.json(Response(500, "failed", constantsObj.validationMessages.internalError, err));
        } else {
            // SupervisorJob.find({job_id:myDailesInfoData.job_id,job_assign_to:myDailesInfoData.supervisor_id})
            SupervisorJob.findOne({ job_id: myDailesInfoData.job_id, job_assign_to: myDailesInfoData.supervisor_id }).exec(function (err, supervisorData) {
                if (err) {
                    return res.json(Response(500, "failed", constantsObj.validationMessages.internalError, err));

                } else {
                    //console.log(supervisorData, "datadatadatadata")
                    var supervisor_layer = supervisorData.supervisor_layer;
                    var model = new MyDailies();
                    if (myDailesInfoData) {
                        model = myDailesInfoData;
                    }
                    if (!myDailesInfoData) {
                        model.daily_number = (parseInt(countInfoData) + 1);
                        model.supervisor_layer = supervisor_layer;
                    }
                    // model.status = req.body.status ? req.body.status : 'Active';
                    model.supervisor_layer = supervisor_layer;
                    if (supervisor_layer == 2 && req.body.status == 'Accepted') {
                        model.status = 'Active';
                        model.status_by_supervisor = req.body.status;
                    } else if (supervisor_layer == 2 && req.body.status == 'Rejected') {
                        model.status = 'Rejected';
                        model.status_by_supervisor = req.body.status;
                    } else if (supervisor_layer == 1 && req.body.status == 'Accepted') {
                        model.status = 'Accepted';
                        model.status_by_supervisor = req.body.status;
                    } else if (supervisor_layer == 1 && req.body.status == 'Rejected') {
                        model.status = 'Rejected';
                        model.status_by_supervisor = req.body.status;
                    }
                    // model.upstreamsupervisor_id=req.body.upstreamsupervisor_id;
                    // model.last_action = req.user.uid;
                    model.reject_notes = req.body.reject_notes;
                    model.save(function (err, dailiesData) {
                        //console.log("dailiesData>>>>", dailiesData)
                        if (err) {
                            return res.json(Response(500, "failed", utility.validationErrorHandler(err), {}));
                        } else {
                            // utility.sendNotificationByUserId(req.body.supervisor_id, 'You have an new dailies #' + (parseInt(countInfoData) + 1) + '!', 'New Dailies', model).then(function (res) {
                            //     //console.log('message sent successfully', res);
                            // }).catch(function (err) {
                            //     //console.log('Error in push notification', err);
                            // });
                            return res.json({
                                'code': 200,
                                status: 'success',
                                "message": constantsObj.messages.dataRetrievedSuccess,
                                "data": {
                                    _id: dailiesData._id
                                }
                            });
                        }
                    });
                }
            });
        }
    });
}

function updateDailiesStatus_bk(req, res) {
    //console.log("updateDailiesStatus>>>", req.body)
    MyDailies.findById(req.body._id).exec(function (err, myDailesInfoData) {
        //console.log("myDailesInfoData>>>>>", myDailesInfoData)
        if (err) {
            return res.json(Response(500, "failed", constantsObj.validationMessages.internalError, err));
        } else {
            // SupervisorJob.find({job_id:myDailesInfoData.job_id,job_assign_to:myDailesInfoData.supervisor_id})
            SupervisorJob.findOne({ job_id: myDailesInfoData.job_id, job_assign_to: myDailesInfoData.supervisor_id }).exec(function (err, supervisorData) {
                if (err) {
                    return res.json(Response(500, "failed", constantsObj.validationMessages.internalError, err));

                } else {
                    //console.log(supervisorData, "datadatadatadata")
                    var supervisor_layer = supervisorData.supervisor_layer;
                    var model = new MyDailies();
                    if (myDailesInfoData) {
                        model = myDailesInfoData;
                    }
                    if (!myDailesInfoData) {
                        model.daily_number = (parseInt(countInfoData) + 1);
                        model.supervisor_layer = supervisor_layer;
                    }
                    model.status = req.body.status ? req.body.status : 'Active';
                    model.supervisor_layer = supervisor_layer;
                    // model.upstreamsupervisor_id=req.body.upstreamsupervisor_id;
                    // model.last_action = req.user.uid;
                    model.reject_notes = req.body.reject_notes;
                    model.save(function (err, dailiesData) {
                        //console.log("dailiesData>>>>", dailiesData)
                        if (err) {
                            return res.json(Response(500, "failed", utility.validationErrorHandler(err), {}));
                        } else {
                            // utility.sendNotificationByUserId(req.body.supervisor_id, 'You have an new dailies #' + (parseInt(countInfoData) + 1) + '!', 'New Dailies', model).then(function (res) {
                            //     //console.log('message sent successfully', res);
                            // }).catch(function (err) {
                            //     //console.log('Error in push notification', err);
                            // });
                            return res.json({
                                'code': 200,
                                status: 'success',
                                "message": constantsObj.messages.dataRetrievedSuccess,
                                "data": {
                                    _id: dailiesData._id
                                }
                            });
                        }
                    });
                }
            });
        }
    });
}

/**
 * Function is use to add my Dailies
 * @access private
 * @return json
 * Created by Ashish
 * @smartData Enterprises (I) Ltd
 * Created Date 08-Aug-2017
 */
function addMyDailies(req, res) {
    //console.log("addMyDailies>>>>", req.body)
    if (!req.body.job_id || !req.body.user_id || !req.body.parent_id) {
        return res.json(Response(402, "failed", constantsObj.validationMessages.requiredFieldsMissing));
    } else {
        MyDailies.findById(req.body._id).exec(function (err, myDailesInfoData) {
            if (err) {
                return res.json(Response(500, "failed", constantsObj.validationMessages.internalError, err));
            } else {
                MyDailies.existCheck(req.body.job_na, req.body.job_id, ((myDailesInfoData) ? myDailesInfoData._id : ''), function (err, exist) {
                    if (err) {
                        return res.json(Response(500, "failed", constantsObj.validationMessages.internalError, err));
                    } else {
                        if (exist != true) {
                            return res.json(Response(402, "failed", exist));
                        } else {
                            MyDailies.count({ parent_id: req.body.parent_id }).exec(function (err, countInfoData) {
                                SupervisorJob.findOne({ supervisor_layer: 1, job_id: req.body.job_id, deleted: false })
                                    .exec(function (err, supervisorJonData) {
                                        if (err) {
                                            return res.json(Response(500, "failed", constantsObj.validationMessages.internalError, err));
                                        } else if (supervisorJonData) {
                                            var date = new Date();
                                            var model = new MyDailies();
                                            if (myDailesInfoData) {
                                                model = myDailesInfoData;
                                            }
                                            if (!myDailesInfoData) {

                                                ////console.log("NO myDailesInfoData countInfoData :-", countInfoData)

                                                model.daily_number = (parseInt(countInfoData) + 1);
                                            }
                                            // async.waterfall([function(callback){
                                            // ForemenAssignJob.find()
                                            // }],function(finalResponse,callback){
                                            //     //console.log("finalResponse>>", finalResponse)
                                            // })  
                                            ForemenAssignJob.findOne({ job_assign_to: req.body.user_id, job_id: req.body.job_id }).exec(function (err, foremendata) {
                                                if (err) {
                                                    return res.json(Response(500, "failed", constantsObj.validationMessages.internalError, err));

                                                } else {
                                                    //console.log(foremendata, "datadatadatadata")
                                                    var foreman_layer = foremendata.foreman_layer;


                                                    if (req.body.no_production == true) {
                                                        model.job_id = req.body.job_id;
                                                        model.foreman_layer = foreman_layer;
                                                        model.parent_id = req.body.parent_id; //contractor ID
                                                        model.user_id = req.body.user_id; //forman Id 
                                                        model.no_production = req.body.no_production;
                                                        model.notes = req.body.notes;
                                                        if (req.body.subjob_id != '')
                                                            model.sub_job = req.body.subjob_id;
                                                        // model.last_action = req.user.uid;
                                                        // if (req.body.use)model.current_action = req.body.user_id
                                                        model.is_draft = req.body.is_draft;
                                                        // if()
                                                        model.status = req.body.status ? req.body.status : req.body.supervisor_id ? 'Active' : 'Accepted';;
                                                        model.reject_notes = req.body.reject_notes;
                                                        model.to_date = req.body.to_date ? new Date(moment(req.body.to_date, 'DD.MM.YYYY').tz("America/New_York")) : new Date();
                                                        model.from_date = new Date(moment(req.body.from_date, 'DD.MM.YYYY').tz("America/New_York"));

                                                    } else {
                                                        model.parent_id = req.body.parent_id; //contractor ID
                                                        model.job_id = req.body.job_id;
                                                        model.crews_id = req.body.crews_id;
                                                        model.user_id = req.body.user_id; //forman Id 
                                                        if (req.body.subjob_id != '')
                                                            model.sub_job = req.body.subjob_id;

                                                        // model.sub_job = req.body.subjob_id;
                                                        model.supervisor_id = req.body.supervisor_id;
                                                        // model.upstreamsupervisor_id = req.body.upstreamsupervisor_id;                                    
                                                        model.job_na = req.body.job_na;
                                                        model.last_action = req.user.uid;
                                                        // model.current_action = req.body.user_id
                                                        model.job_map = req.body.job_map;
                                                        model.foreman_layer = foreman_layer;
                                                        model.job_location = req.body.job_location;
                                                        model.status = req.body.status ? req.body.status : req.body.supervisor_id ? 'Active' : 'Accepted';
                                                        model.dailies_location = req.body.dailies_location;
                                                        model.longitude = req.body.longitude;
                                                        model.latitude = req.body.latitude;
                                                        model.is_draft = req.body.is_draft;
                                                        model.reject_notes = req.body.reject_notes;
                                                        model.geo_loc = [req.body.latitude ? req.body.latitude : '48.8589507', req.body.longitude ? req.body.longitude : '2.2770201']; //add geoJSON
                                                        model.to_date = req.body.to_date ? new Date(moment(req.body.to_date, 'DD.MM.YYYY').tz("America/New_York")) : new Date();
                                                        model.from_date = new Date(moment(req.body.from_date, 'DD.MM.YYYY').tz("America/New_York"));
                                                        model.no_production = req.body.no_production;
                                                        model.notes = req.body.notes;
                                                    }
                                                    if (myDailesInfoData) {
                                                        ////console.log(" req.body.job_id :-", req.body.job_id, " myDailesInfoData :-", myDailesInfoData);
                                                        // model.daily_number = (parseInt(req.body.job_id) + 1);
                                                        //console.log("mydailiesInfoData>>>>>", myDailesInfoData)
                                                    }
                                                    User.findById(req.body.parent_id).exec(function (err, data) {
                                                        console.log("data>><<", data)
                                                        //console.log('err>>>>', err);
                                                        ////console.log('data>>>>', data)
                                                        if (!myDailesInfoData) {
                                                            model.daily_number += "-" + data.customer_id;
                                                        }
                                                        model.up_stream_supervisor_id = supervisorJonData.job_assign_to;
                                                        model.status_by_supervisor = 'Active';
                                                        console.log("model>>>>>", model);
                                                        model.save(function (err, dailiesData) {
                                                            //console.log("dailiesdata", dailiesData)

                                                            // //console.log("dailiesData>>>>", dailiesData.daily_number)
                                                            if (err) {
                                                                return res.json(Response(500, "failed", utility.validationErrorHandler(err), {}));
                                                            } else {
                                                                utility.sendNotificationByUserId(req.body.supervisor_id, 'You have an new dailies #' + dailiesData.daily_number + '!', 'New Dailies', model).then(function (res) {
                                                                    //console.log('message sent successfully', res);
                                                                }).catch(function (err) {
                                                                    //console.log('Error in push notification', err);
                                                                });
                                                                if (req.body.no_production == false) {
                                                                    if (req.body.billable_items) {
                                                                        req.body.billable_items.forEach(function (obj) {
                                                                            obj.my_dailies_id = dailiesData._id;
                                                                        });
                                                                        forEach(req.body.billable_items, function (item, index, arr) {
                                                                            //console.log("item>>>>>", item)
                                                                            if (item._id) {
                                                                                myDailies_Billable_items.findById(mongoose.Types.ObjectId(item._id)).exec(function (err, myDailiesItem) {
                                                                                    ////console.log("myDailiesItem>>>>>>",myDailiesItem)
                                                                                    if (myDailiesItem) {

                                                                                        //console.log("myDailiesItem>>>>", myDailiesItem)
                                                                                        delete item._id;
                                                                                        var mydailiesItems = myDailiesItem;
                                                                                        mydailiesItems.name = item.name;
                                                                                        mydailiesItems.quantity = item.quantity;
                                                                                        mydailiesItems.description = item.description;
                                                                                        mydailiesItems.my_dailies_id = item.my_dailies_id;

                                                                                        mydailiesItems.save(function (err, updatedailiesItem) {
                                                                                            //console.log("updatedailiesItem>>>", updatedailiesItem)
                                                                                            ////console.log("---->", "success");
                                                                                        })
                                                                                    } else {
                                                                                        var mydailiesItem = new myDailies_Billable_items(item);
                                                                                        ////console.log("myDailiesItem2>>>>>>",myDailiesItem)
                                                                                        mydailiesItem.save(function (err, newdailiesItem) {
                                                                                            //console.log("newdailiesItem>>>>", newdailiesItem)
                                                                                            //console.log('---->>>>>>>', err);
                                                                                        })
                                                                                    }
                                                                                })
                                                                            } else {
                                                                                var mydailiesItem = new myDailies_Billable_items(item);
                                                                                mydailiesItem.save(function (err, newdailiesItem) {
                                                                                    //console.log('---->>>>', err);
                                                                                    ////console.log('new daily item---->>', newdailiesItem);
                                                                                })
                                                                            }
                                                                        }, allDone);

                                                                        function allDone(notAborted, arr) {
                                                                            //console.log("notAborted", notAborted)
                                                                            //console.log("arrrrr>>>>", arr)
                                                                            if (req.body.is_draft == false) {
                                                                                //console.log("isdraft>>>")
                                                                                return res.json({
                                                                                    'code': 200,
                                                                                    status: 'success',
                                                                                    "message": constantsObj.messages.dailySavedSuccess,
                                                                                    "data": {
                                                                                        _id: dailiesData._id
                                                                                    }
                                                                                });
                                                                            } else {
                                                                                //console.log("draftSavedSuccess>>>")

                                                                                return res.json({
                                                                                    'code': 200,
                                                                                    status: 'success',
                                                                                    "message": constantsObj.messages.draftSavedSuccess,
                                                                                    "data": {
                                                                                        _id: dailiesData._id
                                                                                    }
                                                                                });
                                                                            }

                                                                        }
                                                                    }

                                                                } else {
                                                                    //console.log("dataRetrievedSuccess>>>")

                                                                    return res.json({
                                                                        'code': 200,
                                                                        status: 'success',
                                                                        "message": constantsObj.messages.dataRetrievedSuccess,
                                                                        "data": {
                                                                            _id: dailiesData._id
                                                                        }
                                                                    });
                                                                }

                                                            }
                                                        });
                                                    })
                                                }
                                            })
                                        } else {
                                            var date = new Date();
                                            var model = new MyDailies();
                                            if (myDailesInfoData) {
                                                model = myDailesInfoData;
                                            }
                                            if (!myDailesInfoData) {

                                                ////console.log("NO myDailesInfoData countInfoData :-", countInfoData)

                                                model.daily_number = (parseInt(countInfoData) + 1);
                                            }
                                            // async.waterfall([function(callback){
                                            // ForemenAssignJob.find()
                                            // }],function(finalResponse,callback){
                                            //     //console.log("finalResponse>>", finalResponse)
                                            // })  
                                            ForemenAssignJob.findOne({ job_assign_to: req.body.user_id, job_id: req.body.job_id }).exec(function (err, foremendata) {
                                                if (err) {
                                                    return res.json(Response(500, "failed", constantsObj.validationMessages.internalError, err));

                                                } else {
                                                    //console.log(foremendata, "datadatadatadata")
                                                    var foreman_layer = foremendata.foreman_layer;


                                                    if (req.body.no_production == true) {
                                                        model.job_id = req.body.job_id;
                                                        model.foreman_layer = foreman_layer;
                                                        model.parent_id = req.body.parent_id; //contractor ID
                                                        model.user_id = req.body.user_id; //forman Id 
                                                        model.no_production = req.body.no_production;
                                                        model.notes = req.body.notes;
                                                        if (req.body.subjob_id != '')
                                                            model.sub_job = req.body.subjob_id;
                                                        // model.last_action = req.user.uid;
                                                        // if (req.body.use)model.current_action = req.body.user_id
                                                        model.is_draft = req.body.is_draft;
                                                        // if()
                                                        model.status = req.body.status ? req.body.status : req.body.supervisor_id ? 'Active' : 'Accepted';;
                                                        model.reject_notes = req.body.reject_notes;
                                                        model.to_date = req.body.to_date ? new Date(moment(req.body.to_date, 'DD.MM.YYYY').tz("America/New_York")) : new Date();
                                                        model.from_date = new Date(moment(req.body.from_date, 'DD.MM.YYYY').tz("America/New_York"));

                                                    } else {
                                                        model.parent_id = req.body.parent_id; //contractor ID
                                                        model.job_id = req.body.job_id;
                                                        model.crews_id = req.body.crews_id;
                                                        model.user_id = req.body.user_id; //forman Id 
                                                        if (req.body.subjob_id != '')
                                                            model.sub_job = req.body.subjob_id;

                                                        // model.sub_job = req.body.subjob_id;
                                                        model.supervisor_id = req.body.supervisor_id;
                                                        // model.upstreamsupervisor_id = req.body.upstreamsupervisor_id;                                    
                                                        model.job_na = req.body.job_na;
                                                        model.last_action = req.user.uid;
                                                        // model.current_action = req.body.user_id
                                                        model.job_map = req.body.job_map;
                                                        model.foreman_layer = foreman_layer;
                                                        model.job_location = req.body.job_location;
                                                        model.status = req.body.status ? req.body.status : req.body.supervisor_id ? 'Active' : 'Accepted';
                                                        model.dailies_location = req.body.dailies_location;
                                                        model.longitude = req.body.longitude;
                                                        model.latitude = req.body.latitude;
                                                        model.is_draft = req.body.is_draft;
                                                        model.reject_notes = req.body.reject_notes;
                                                        model.geo_loc = [req.body.latitude ? req.body.latitude : '48.8589507', req.body.longitude ? req.body.longitude : '2.2770201']; //add geoJSON
                                                        model.to_date = req.body.to_date ? new Date(moment(req.body.to_date, 'DD.MM.YYYY').tz("America/New_York")) : new Date();
                                                        model.from_date = new Date(moment(req.body.from_date, 'DD.MM.YYYY').tz("America/New_York"));
                                                        model.no_production = req.body.no_production;
                                                        model.notes = req.body.notes;
                                                    }
                                                    if (myDailesInfoData) {
                                                        ////console.log(" req.body.job_id :-", req.body.job_id, " myDailesInfoData :-", myDailesInfoData);
                                                        // model.daily_number = (parseInt(req.body.job_id) + 1);
                                                        //console.log("mydailiesInfoData>>>>>", myDailesInfoData)
                                                    }
                                                    User.findById(req.body.parent_id).exec(function (err, data) {
                                                        //console.log("data>><<", data)
                                                        //console.log('err>>>>', err);
                                                        ////console.log('data>>>>', data)
                                                        if (!myDailesInfoData) {
                                                            model.daily_number += "-" + data.customer_id;
                                                        }
                                                        ////console.log("model>>>>>", model);
                                                        model.save(function (err, dailiesData) {
                                                            //console.log("dailiesdata", dailiesData)

                                                            // //console.log("dailiesData>>>>", dailiesData.daily_number)
                                                            if (err) {
                                                                return res.json(Response(500, "failed", utility.validationErrorHandler(err), {}));
                                                            } else {
                                                                utility.sendNotificationByUserId(req.body.supervisor_id, 'You have an new dailies #' + dailiesData.daily_number + '!', 'New Dailies', model).then(function (res) {
                                                                    //console.log('message sent successfully', res);
                                                                }).catch(function (err) {
                                                                    //console.log('Error in push notification', err);
                                                                });
                                                                if (req.body.no_production == false) {
                                                                    if (req.body.billable_items) {
                                                                        req.body.billable_items.forEach(function (obj) {
                                                                            obj.my_dailies_id = dailiesData._id;
                                                                        });
                                                                        forEach(req.body.billable_items, function (item, index, arr) {
                                                                            //console.log("item>>>>>", item)
                                                                            if (item._id) {
                                                                                myDailies_Billable_items.findById(mongoose.Types.ObjectId(item._id)).exec(function (err, myDailiesItem) {
                                                                                    ////console.log("myDailiesItem>>>>>>",myDailiesItem)
                                                                                    if (myDailiesItem) {

                                                                                        //console.log("myDailiesItem>>>>", myDailiesItem)
                                                                                        delete item._id;
                                                                                        var mydailiesItems = myDailiesItem;
                                                                                        mydailiesItems.name = item.name;
                                                                                        mydailiesItems.quantity = item.quantity;
                                                                                        mydailiesItems.description = item.description;
                                                                                        mydailiesItems.my_dailies_id = item.my_dailies_id;

                                                                                        mydailiesItems.save(function (err, updatedailiesItem) {
                                                                                            //console.log("updatedailiesItem>>>", updatedailiesItem)
                                                                                            ////console.log("---->", "success");
                                                                                        })
                                                                                    } else {
                                                                                        var mydailiesItem = new myDailies_Billable_items(item);
                                                                                        ////console.log("myDailiesItem2>>>>>>",myDailiesItem)
                                                                                        mydailiesItem.save(function (err, newdailiesItem) {
                                                                                            //console.log("newdailiesItem>>>>", newdailiesItem)
                                                                                            //console.log('---->>>>>>>', err);
                                                                                        })
                                                                                    }
                                                                                })
                                                                            } else {
                                                                                var mydailiesItem = new myDailies_Billable_items(item);
                                                                                mydailiesItem.save(function (err, newdailiesItem) {
                                                                                    //console.log('---->>>>', err);
                                                                                    ////console.log('new daily item---->>', newdailiesItem);
                                                                                })
                                                                            }
                                                                        }, allDone);

                                                                        function allDone(notAborted, arr) {
                                                                            //console.log("notAborted", notAborted)
                                                                            //console.log("arrrrr>>>>", arr)
                                                                            if (req.body.is_draft == false) {
                                                                                //console.log("isdraft>>>")
                                                                                return res.json({
                                                                                    'code': 200,
                                                                                    status: 'success',
                                                                                    "message": constantsObj.messages.dailySavedSuccess,
                                                                                    "data": {
                                                                                        _id: dailiesData._id
                                                                                    }
                                                                                });
                                                                            } else {
                                                                                //console.log("draftSavedSuccess>>>")

                                                                                return res.json({
                                                                                    'code': 200,
                                                                                    status: 'success',
                                                                                    "message": constantsObj.messages.draftSavedSuccess,
                                                                                    "data": {
                                                                                        _id: dailiesData._id
                                                                                    }
                                                                                });
                                                                            }

                                                                        }
                                                                    }

                                                                } else {
                                                                    //console.log("dataRetrievedSuccess>>>")

                                                                    return res.json({
                                                                        'code': 200,
                                                                        status: 'success',
                                                                        "message": constantsObj.messages.dataRetrievedSuccess,
                                                                        "data": {
                                                                            _id: dailiesData._id
                                                                        }
                                                                    });
                                                                }

                                                            }
                                                        });
                                                    })
                                                }
                                            })
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
function addMyDailies_bk(req, res) {
    var finalresponse = {};
    //console.log("addMyDailies>>>>", req.body)
    if (!req.body.job_id || !req.body.user_id || !req.body.parent_id) {
        return res.json(Response(402, "failed", constantsObj.validationMessages.requiredFieldsMissing));
    } else {
        MyDailies.findById(req.body._id).exec(function (err, myDailesInfoData) {
            if (err) {
                return res.json(Response(500, "failed", constantsObj.validationMessages.internalError, err));
            } else {
                MyDailies.existCheck(req.body.job_na, req.body.job_id, ((myDailesInfoData) ? myDailesInfoData._id : ''), function (err, exist) {
                    if (err) {
                        return res.json(Response(500, "failed", constantsObj.validationMessages.internalError, err));
                    } else {
                        if (exist != true) {
                            return res.json(Response(402, "failed", exist));
                        } else {
                            MyDailies.count({ parent_id: req.body.parent_id }).exec(function (err, countInfoData) {

                                var date = new Date();
                                var model = new MyDailies();
                                if (myDailesInfoData) {
                                    model = myDailesInfoData;
                                }
                                if (!myDailesInfoData) {

                                    ////console.log("NO myDailesInfoData countInfoData :-", countInfoData)

                                    model.daily_number = (parseInt(countInfoData) + 1);
                                }
                                // async.waterfall([function(callback){
                                // ForemenAssignJob.find()
                                // }],function(finalResponse,callback){
                                //     //console.log("finalResponse>>", finalResponse)
                                // })  
                                ForemenAssignJob.findOne({ job_assign_to: req.body.user_id, job_id: req.body.job_id }).exec(function (err, foremendata) {
                                    if (err) {
                                        return res.json(Response(500, "failed", constantsObj.validationMessages.internalError, err));

                                    } else {
                                        //console.log(foremendata, "datadatadatadata")
                                        var foreman_layer = foremendata.foreman_layer;


                                        if (req.body.no_production == true) {
                                            model.job_id = req.body.job_id;
                                            model.foreman_layer = foreman_layer;
                                            model.parent_id = req.body.parent_id; //contractor ID
                                            model.user_id = req.body.user_id; //forman Id 
                                            model.no_production = req.body.no_production;
                                            model.notes = req.body.notes;
                                            if (req.body.subjob_id != '')
                                                model.sub_job = req.body.subjob_id;
                                            // model.last_action = req.user.uid;
                                            // if (req.body.use)model.current_action = req.body.user_id
                                            model.is_draft = req.body.is_draft;
                                            // if()
                                            model.status = req.body.status ? req.body.status : req.body.supervisor_id ? 'Active' : 'Accepted';;
                                            model.reject_notes = req.body.reject_notes;
                                            model.to_date = req.body.to_date ? new Date(moment(req.body.to_date, 'DD.MM.YYYY').tz("America/New_York")) : new Date();
                                            model.from_date = new Date(moment(req.body.from_date, 'DD.MM.YYYY').tz("America/New_York"));

                                        } else {
                                            model.parent_id = req.body.parent_id; //contractor ID
                                            model.job_id = req.body.job_id;
                                            model.crews_id = req.body.crews_id;
                                            model.user_id = req.body.user_id; //forman Id 
                                            if (req.body.subjob_id != '')
                                                model.sub_job = req.body.subjob_id;

                                            // model.sub_job = req.body.subjob_id;
                                            model.supervisor_id = req.body.supervisor_id;
                                            // model.upstreamsupervisor_id = req.body.upstreamsupervisor_id;                                    
                                            model.job_na = req.body.job_na;
                                            model.last_action = req.user.uid;
                                            // model.current_action = req.body.user_id
                                            model.job_map = req.body.job_map;
                                            model.foreman_layer = foreman_layer;
                                            model.job_location = req.body.job_location;
                                            model.status = req.body.status ? req.body.status : req.body.supervisor_id ? 'Active' : 'Accepted';
                                            model.dailies_location = req.body.dailies_location;
                                            model.longitude = req.body.longitude;
                                            model.latitude = req.body.latitude;
                                            model.is_draft = req.body.is_draft;
                                            model.reject_notes = req.body.reject_notes;
                                            model.geo_loc = [req.body.latitude ? req.body.latitude : '48.8589507', req.body.longitude ? req.body.longitude : '2.2770201']; //add geoJSON
                                            model.to_date = req.body.to_date ? new Date(moment(req.body.to_date, 'DD.MM.YYYY').tz("America/New_York")) : new Date();
                                            model.from_date = new Date(moment(req.body.from_date, 'DD.MM.YYYY').tz("America/New_York"));
                                            model.no_production = req.body.no_production;
                                            model.notes = req.body.notes;
                                        }
                                        if (myDailesInfoData) {
                                            ////console.log(" req.body.job_id :-", req.body.job_id, " myDailesInfoData :-", myDailesInfoData);
                                            // model.daily_number = (parseInt(req.body.job_id) + 1);
                                            //console.log("mydailiesInfoData>>>>>", myDailesInfoData)
                                        }
                                        User.findById(req.body.parent_id).exec(function (err, data) {
                                            //console.log("data>><<", data)
                                            //console.log('err>>>>', err);
                                            ////console.log('data>>>>', data)
                                            if (!myDailesInfoData) {
                                                model.daily_number += "-" + data.customer_id;
                                            }
                                            ////console.log("model>>>>>", model);
                                            model.save(function (err, dailiesData) {
                                                //console.log("dailiesdata", dailiesData)

                                                // //console.log("dailiesData>>>>", dailiesData.daily_number)
                                                if (err) {
                                                    return res.json(Response(500, "failed", utility.validationErrorHandler(err), {}));
                                                } else {
                                                    utility.sendNotificationByUserId(req.body.supervisor_id, 'You have an new dailies #' + dailiesData.daily_number + '!', 'New Dailies', model).then(function (res) {
                                                        //console.log('message sent successfully', res);
                                                    }).catch(function (err) {
                                                        //console.log('Error in push notification', err);
                                                    });
                                                    if (req.body.no_production == false) {
                                                        if (req.body.billable_items) {
                                                            req.body.billable_items.forEach(function (obj) {
                                                                obj.my_dailies_id = dailiesData._id;
                                                            });
                                                            forEach(req.body.billable_items, function (item, index, arr) {
                                                                //console.log("item>>>>>", item)
                                                                if (item._id) {
                                                                    myDailies_Billable_items.findById(mongoose.Types.ObjectId(item._id)).exec(function (err, myDailiesItem) {
                                                                        ////console.log("myDailiesItem>>>>>>",myDailiesItem)
                                                                        if (myDailiesItem) {

                                                                            //console.log("myDailiesItem>>>>", myDailiesItem)
                                                                            delete item._id;
                                                                            var mydailiesItems = myDailiesItem;
                                                                            mydailiesItems.name = item.name;
                                                                            mydailiesItems.quantity = item.quantity;
                                                                            mydailiesItems.description = item.description;
                                                                            mydailiesItems.my_dailies_id = item.my_dailies_id;

                                                                            mydailiesItems.save(function (err, updatedailiesItem) {
                                                                                //console.log("updatedailiesItem>>>", updatedailiesItem)
                                                                                ////console.log("---->", "success");
                                                                            })
                                                                        } else {
                                                                            var mydailiesItem = new myDailies_Billable_items(item);
                                                                            ////console.log("myDailiesItem2>>>>>>",myDailiesItem)
                                                                            mydailiesItem.save(function (err, newdailiesItem) {
                                                                                //console.log("newdailiesItem>>>>", newdailiesItem)
                                                                                //console.log('---->>>>>>>', err);
                                                                            })
                                                                        }
                                                                    })
                                                                } else {
                                                                    var mydailiesItem = new myDailies_Billable_items(item);
                                                                    mydailiesItem.save(function (err, newdailiesItem) {
                                                                        //console.log('---->>>>', err);
                                                                        ////console.log('new daily item---->>', newdailiesItem);
                                                                    })
                                                                }
                                                            }, allDone);

                                                            function allDone(notAborted, arr) {
                                                                //console.log("notAborted", notAborted)
                                                                //console.log("arrrrr>>>>", arr)
                                                                if (req.body.is_draft == false) {
                                                                    //console.log("isdraft>>>")
                                                                    return res.json({
                                                                        'code': 200,
                                                                        status: 'success',
                                                                        "message": constantsObj.messages.dailySavedSuccess,
                                                                        "data": {
                                                                            _id: dailiesData._id
                                                                        }
                                                                    });
                                                                } else {
                                                                    //console.log("draftSavedSuccess>>>")

                                                                    return res.json({
                                                                        'code': 200,
                                                                        status: 'success',
                                                                        "message": constantsObj.messages.draftSavedSuccess,
                                                                        "data": {
                                                                            _id: dailiesData._id
                                                                        }
                                                                    });
                                                                }

                                                            }
                                                        }

                                                    } else {
                                                        //console.log("dataRetrievedSuccess>>>")

                                                        return res.json({
                                                            'code': 200,
                                                            status: 'success',
                                                            "message": constantsObj.messages.dataRetrievedSuccess,
                                                            "data": {
                                                                _id: dailiesData._id
                                                            }
                                                        });
                                                    }

                                                }
                                            });
                                        })
                                    }
                                })
                            });

                        }
                    }
                });
            }
        });
    }
}



/**
 * Function is use to list my Dailies
 * @access private
 * @return json
 * Created by Ashish
 * @smartData Enterprises (I) Ltdreject_notes
 * Created Date 08-Aug-2017
 */
function listMyDailies(req, res) {
    console.log("listMyDailies>>>>>>1", req.body);
    if (!req.body.user_id && !req.body.supervisor_id) {
        return res.json(Response(402, "failed", constantsObj.validationMessages.requiredFieldsMissing));
    } else {
        //console.log("listMyDailies>>>>>>1", req.body);
        // var count = req.body.count ? req.body.count : 0;
        var count = 200;
        var skip = req.body.count * (req.body.page - 1);
        var sorting = req.body.sorting ? req.body.sorting : {
            _id: -1
        };
        var searchText = decodeURIComponent(req.body.searchText).replace(/[[\]{}()*+?,\\^$|#\s]/g, "\\s+");
        if (req.body.searchText) {
            condition.$or = [{
                'notes': new RegExp(searchText, 'gi')
            }, {
                'job_location': new RegExp(searchText, 'gi')
            },
            {
                'daily_number': new RegExp(searchText, 'gi')
            }, {
                'job_id': new RegExp(searchText, gi)
            }
            ];
        }
        // if (req.body.filterFlag && req.body.filterFlag !== undefined) {
        //     //var condition = req.body.filterFlag;
        // }
        for (let key in sorting) {
            sorting[key] = ((sorting[key] == '-1') ? -1 : 1);
        }

        if (req.body.user_id) {
            var condition = {
                deleted: false,
                "user_id": mongoose.Types.ObjectId(req.body.user_id)
            };

        } else if (req.body.supervisor_id) {
            console.log('Inside supervisor');
            var condition = {
                deleted: false,
                // "up_stream_supervisor_id": mongoose.Types.ObjectId(req.body.supervisor_id),
                // status: req.body.status,
                // status_by_supervisor: req.body.status,
                // {status_by_supervisor: req.body.status}
                
            };
            condition.$or = [
                { up_stream_supervisor_id: mongoose.Types.ObjectId(req.body.supervisor_id) },
                { supervisor_id: mongoose.Types.ObjectId(req.body.supervisor_id) },
                // { status: req.body.status },
                // {status_by_supervisor: req.body.status}

            ];
            if(req.body.status == 'Active'){condition.$or = [{status : 'Active'}, {status : 'Rejected'}]}
        }

        console.log("listMyDailies condition", condition);
        co(function* () {
            let aggregate = [{
                $lookup: {
                    from: "foremen_crews",
                    localField: "crews_id",
                    foreignField: "_id",
                    as: "crews"
                }
            },
            {
                $unwind: {
                    path: "$crews",
                    preserveNullAndEmptyArrays: true
                }
            }, {
                $lookup: {
                    from: "users",
                    localField: "user_id",
                    foreignField: "_id",
                    as: "foreman"
                }
            },
            {
                $unwind: {
                    path: "$foreman",
                    preserveNullAndEmptyArrays: true
                }
            }, {
                $lookup: {
                    from: "users",
                    localField: "supervisor_id",
                    foreignField: "_id",
                    as: "supervisor"
                }
            },
            {
                $unwind: {
                    path: "$supervisor",
                    preserveNullAndEmptyArrays: true
                }
            }, {
                $lookup: {
                    from: "users",
                    localField: "up_stream_supervisor_id",
                    foreignField: "_id",
                    as: "supervisor1"
                }
            },
            {
                $unwind: {
                    path: "$supervisor1",
                    preserveNullAndEmptyArrays: true
                }
            }, {
                $lookup: {
                    from: "users",
                    localField: "parent_id",
                    foreignField: "_id",
                    as: "contractor"
                }
            },
            {
                $unwind: {
                    path: "$contractor",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $lookup: {
                    from: "jobs",
                    localField: "job_id",
                    foreignField: "_id",
                    as: "job"
                }
            },
            {
                $unwind: {
                    path: "$job",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $lookup: {
                    from: "subjobs",
                    localField: "sub_job",
                    foreignField: "_id",
                    as: "subjob"
                }
            },
            {
                $unwind: {
                    path: "$subjob",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $match: condition
            },
            {
                $project: {
                    job_na: 1,
                    daily_number: 1,
                    job_map: 1,
                    job_location: 1,
                    latitude: 1,
                    longitude: 1,
                    to_date: 1,
                    from_date: 1,
                    no_production: 1,
                    notes: 1,
                    status: 1,
                    is_draft: 1,
                    reject_notes: 1,
                    status_by_supervisor: 1,
                    supervisor_id: 1,
                    up_stream_supervisor_id: 1,
                    is_valid_superVisor: 1,
                    reject_Notes2: 1,
                    // sub_job:1,
                    contractor: "$foreman.parent_id",
                    customerId: "$customerId.customer_id",
                    job_detail: {
                        _id: '$job._id',
                        job_id: '$job.job_id',
                        client: '$job.client'
                    },
                    supervisor_details: {
                        _id: '$supervisor._id',
                        firstname: '$supervisor.firstname',
                        lastname: '$supervisor.lastname'
                    },
                    foremen_details: {
                        _id: '$foreman._id',
                        firstname: '$foreman.firstname',
                        lastname: '$foreman.lastname'
                    },
                    contractor_details: {
                        _id: '$contractor._id',
                        firstname: '$contractor.firstname',
                        lastname: '$contractor.lastname',
                    },
                    crews_details: {
                        _id: '$crews._id',
                        firstname: '$crews.firstname',
                        lastname: '$crews.lastname'
                    },
                    subjob_details: {
                        _id: '$subjob._id',
                        subJob: '$subjob.subJob',

                    },
                    up_supervisor_details: '$supervisor1',

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

            let myDailiesData = yield MyDailies.aggregate(aggregate);
            // console.log("mydailiesData>>>", myDailiesData)
            async.each(myDailiesData, function (item, callback) {
                if (item.subjob_details) {
                    item.subjob_details
                } else {
                    item.subjob_details = {
                        _id: '',
                        subJob: ''
                    };
                }
                if (!item.supervisor_details) {
                } else {
                    if (Object.keys(item.supervisor_details).length == 4) {
                        // //console.log("item ",Object.keys(item.supervisor_details).length)
                    } else {
                        item.supervisor_details.supervisor_layer = 0;
                    }
                }
                // //console.log("item>>>>>",item)        
                MyDailiesImage.find({
                    mydailies_id: item._id
                }).exec(function (err, dailiesInfosData) {
                    item.dailiesImage = dailiesInfosData;
                    myDailies_Billable_items.find({
                        my_dailies_id: item._id
                    }).exec(function (err, dailiesBillableData) {
                        item.billable_items = dailiesBillableData;
                        callback();
                    });
                });

            }, function (err) {
                if (err) {
                    return res.json(Response(500, "failed", constantsObj.validationMessages.internalError, {}));
                } else {
                    
                    if (!req.body.user_id) {
                        console.log("Insode !userId", req.body.supervisor_id)
                        var newArray = [];
                        console.log("Req Body :: ", req.body);
                        async.each(myDailiesData, function (item, callback) {
                            console.log("Job id : ", item.job_detail._id);
                            SupervisorJob.findOne({ job_id: item.job_detail._id, job_assign_to: req.body.supervisor_id })
                                // .sort({ _id: -1 })
                                .exec(function (err, supervisorData) {
                                    if (err) {
                                        callback(err, null);
                                    } else if (supervisorData) {
                                        console.log("supervisordataIshere>>>>>>")
                                        console.log("supervisorData.supervisor_layer : ", supervisorData.supervisor_layer, "Job id : ", item.job_detail._id);
                                        if (supervisorData.supervisor_layer == 1 && req.body.status == 'Accepted' && item.status == 'Accepted') {
                                            //console.log("***1***")
                                            newArray.push(item);
                                            callback(null, true);
                                        } else if (supervisorData.supervisor_layer == 1 && req.body.status == 'Active' && item.status == 'Active' && item.status_by_supervisor == 'Accepted') {
                                            console.log("***2***", item.job_detail._id);
                                            newArray.push(item);
                                            callback(null, true);

                                        }
                                   







                                        
                                    // else if (supervisorData.supervisor_layer == 1 && req.body.status == 'Active' && item.status == 'Active' && item.status_by_supervisor == 'Rejected') {
                                    //         console.log("***22**4 July*", item.job_detail._id);
                                    //         newArray.push(item);
                                    //         callback(null, true);

                                    //   }
                                    // else if (supervisorData.supervisor_layer == 1 && req.body.status == 'Rejected' && item.status == 'Active' && item.status_by_supervisor == 'Rejected') {
                                    //         console.log("***222**4 July*", item.job_detail._id);
                                    //         newArray.push(item);
                                    //         callback(null, true);

                                    //     } 
                                    // else if (supervisorData.supervisor_layer == 1  && item.status == 'Active' && item.status_by_supervisor == 'Rejected') {
                                    //         console.log("***2222**4 July*", item.job_detail._id);
                                    //         newArray.push(item);
                                    //         callback(null, true);

                                    //     }                                                               
                                    // else if (supervisorData.supervisor_layer == 1  && item.status == 'Rejected' && item.status_by_supervisor == 'Rejected') {
                                    //         console.log("***22222**4 July*", item.job_detail._id);
                                    //         newArray.push(item);
                                    //         callback(null, true);

                                    //     }    
                                    // else if (supervisorData.supervisor_layer == 1 && req.body.status == 'Active'  && item.status_by_supervisor == 'Rejected') {
                                    //         console.log("***222222**4 July*", item.job_detail._id);
                                    //         newArray.push(item);
                                    //         callback(null, true);

                                    //     }   
                                        











                                        else if (supervisorData.supervisor_layer == 1 && req.body.status == 'Active' && item.status == 'Active' && item.status_by_supervisor == 'Active') {
                                            console.log("ID --- ", item.up_stream_supervisor_id, " === ", req.body.supervisor_id);
                                            JobInvites.findOne({ job_id: item.job_detail._id }).exec(function (err, jobInviteData) {
                                                if (err) {
                                                    callback(err, null);
                                                } else if (jobInviteData) {
                                                    console.log("jobInviteData", jobInviteData);
                                                    if ((item.up_stream_supervisor_id.equals(req.body.supervisor_id)) && item.status_by_supervisor == 'Accepted') {
                                                        console.log("***2.1***")
                                                        newArray.push(item);
                                                        callback(null, true);
                                                    } 
                                                    else {
                                                        console.log("***2.2***")
                                                        callback(null, true);
                                                    }
                                                } else {
                                                    console.log("***2.3***")
                                                    if (item.up_stream_supervisor_id.equals(req.body.supervisor_id)) {
                                                        console.log("***2.3.1***")
                                                        newArray.push(item);
                                                        callback(null, true);
                                                    } else {
                                                        console.log("***2.3.2***")
                                                        callback(null, true);
                                                    }
                                                }
                                            });
                                        } else if (supervisorData.supervisor_layer == 2 && req.body.status == 'Accepted' && item.status_by_supervisor == 'Accepted') {
                                            console.log("***3***")
                                            newArray.push(item);
                                            callback(null, true);
                                        }
                                         else if (supervisorData.supervisor_layer == 2 && req.body.status == 'Active' && item.status_by_supervisor == 'Active') {
                                            console.log("***4***")
                                            newArray.push(item);
                                            callback(null, true);
                                        } else if (supervisorData.supervisor_layer == 2 && req.body.status == 'Rejected' && item.status_by_supervisor == 'Active') {
                                            console.log("***abhijit***")
                                            newArray.push(item);
                                            callback(null, true);
                                        } else {
                                            console.log("***5***")
                                            callback(null, true);
                                        }
                                        // else if(supervisor_layer == 2 && req.body.status == 'Rejected'){
                                        //     model.status = 'Rejected';
                                        //     model.status_by_supervisor = req.body.status;
                                        // }else if(supervisor_layer == 1  && req.body.status == 'Accepted'){
                                        //     model.status = 'Accepted';
                                        //     model.status_by_supervisor = req.body.status;
                                        // }else if(supervisor_layer == 1  && req.body.status == 'Rejected'){
                                        //     model.status = 'Rejected';
                                        //     model.status_by_supervisor = req.body.status;
                                        // }
                                    } else {
                                        //console.log("Supevisor Else : ", item.job_detail._id);
                                        callback(null, true)
                                    }
                                });
                        }, function (err, data) {
                            if (err) {
                                return res.json(Response(500, "failed", constantsObj.validationMessages.internalError, {}));
                            } else {
                                //console.log("Sucesssss", newArray);
                                return res.json({
                                    'code': 200,
                                    status: 'success',
                                    "message": constantsObj.messages.dataRetrievedSuccess,
                                    "data": newArray
                                });
                            }
                        });
                    } else {
                        var newArray = [];
                        console.log("Req Body :: ", req.body);
                        async.each(myDailiesData, function (item, callback) {
                            if(item.status == 'Rejected' && (item.status_by_supervisor == 'Accepted' || item.status_by_supervisor == 'Active')){
                                callback(null, true);
                            }else{
                                newArray.push(item);
                                callback(null, true);
                            }
                        }, function (err, data) {
                            if (err) {
                                return res.json(Response(500, "failed", constantsObj.validationMessages.internalError, {}));
                            } else {
                                //console.log("Sucesssss", newArray);
                                return res.json({
                                    'code': 200,
                                    status: 'success',
                                    "message": constantsObj.messages.dataRetrievedSuccess,
                                    "data": newArray
                                });
                            }
                        });
                        // console.log("Insode userId>>>>", myDailiesData)
                        // return res.json({
                        //     'code': 200,
                        //     status: 'success',
                        //     "message": constantsObj.messages.dataRetrievedSuccess,
                        //     "data": myDailiesData
                        // });
                    }
                }
            });

        }).catch(function (err) {
            return res.json(Response(402, "failed", utility.validationErrorHandler(err), {}));
        });
    }
}


/**
 * Function is use to fetch all Dailies image data
 * @access private
 * @return json
 * Created by rahul tiwari
 * @smartData Enterprises (I) Ltd
 * Created Date 10-Aug-2017
 */
function getDailiesImage(req, res) {
    if (!req.body.mydailies_id) {
        return res.json(Response(402, "failed", constantsObj.validationMessages.requiredFieldsMissing));
    } else {
        MyDailiesImage.find({
            _id: req.body.mydailies_id,
            deleted: false
        }, function (err, dailiesImage) {
            if (err) {
                res.json({
                    code: 402,
                    message: 'Request could not be processed. Please try again.'
                });
            } else {
                res.json({
                    code: 200,
                    message: 'Dailies images fetched successfully.',
                    data: dailiesImage
                });
            }
        });
    }
}






/**
 * Function is use to fetch add update Dailies image
 * @access private
 * @return json
 * Created by rahul tiwari
 * @smartData Enterprises (I) Ltd
 * Created Date 10-Aug-2017
 */
function addDailiesImages(req, res) {
    //console.log("addDailiesImages>>>>>>", addDailiesImages)
    var timestamp = Number(new Date());
    var form = new formidable.IncomingForm();
    var file = req.swagger.params.file.value;
    var productId = req.swagger.params.id.value;
    var splitFile = file.originalname.split('.');
    var filename = +timestamp + '_' + common.randomToken(6) + '.' + ((splitFile.length > 0) ? splitFile[splitFile.length - 1] : file.originalname);
    var imagePath = "./public/assets/uploads/dailies/" + filename;
    fs.writeFile(path.resolve(imagePath), file.buffer, function (err) {
        if (err) {

            res.json({
                code: 402,
                'message': 'Request could not be processed. Please try again.',
                data: {}
            });
        } else {
            var DailiesImage = {
                mydailies_id: req.body.id,
                image_name: file.originalname,
                image_path: "assets/uploads/dailies/" + filename
            };
            var dailiesImages = new MyDailiesImage(DailiesImage);
            dailiesImages.save(function (err, DailiesImage) {
                if (err) {
                    return res.json(Response(500, "failed", constantsObj.validationMessages.internalError, {}));
                } else {
                    return res.json({
                        code: 200,
                        'message': 'Dailies image added successfully.',
                        data: {}
                    });
                }
            });
        }
    });

}

/**
 * Function is use to Delete Multiple Dailies
 * @access private
 * @return json
 * Created by Akshay
 * @smartData Enterprises (I) Ltd
 * Created Date 24-01-2018
 */



function updateDailyStatus(req, res) {
    //console.log("delete>>>>", req.body);
    ////console.log(req.body)
    var inputData = req.body;
    //var roleLength = inputData.data.length;

    // var bulk = User.collection.initializeUnorderedBulkOp();

    // for (var i = 0; i < roleLength; i++) {
    async.each(inputData.data, function (dailiesData, callback) {
        // //console.log(dailiesData, 'dsfdsf');
        // //console.log("vinputData>>>>",dailiesData)
        var id = mongoose.Types.ObjectId(dailiesData.id);
        ////console.log(id, 'dfdsfsdf')
        MyDailies.findOneAndUpdate({
            _id: id
        }, {
                $set: dailiesData
            }, function (err, updatedata) {
                if (err) {
                    //console.log("sdfsdfds")
                } else {
                    callback();
                }
            });
    }, function (err) {
        if (err) {
            //console.log('A file failed to process');
        } else {
            return res.json(Response(200, "success", constantsObj.messages.dailiesDeleteSuccess));
        }
        ////console.log('A email sent successfully');

    });
    // res.jsonp({
    //     'status': 'success',
    //     'messageId': 200,
    //     'message': "User updated successfully."
    // });

}


















/**
 * Function is use to list my Dailies
 * @access private
 * @return json
 * Created by Ashish
 * @smartData Enterprises (I) Ltd
 * Created Date 08-Aug-2017
 */
function listMyDailiesByAdmin(req, res) {
    //console.log("req.body>>>>>>", req.body)
    ////console.log("req.body >>>>>>>>>", req.body)
    var startDate = moment(req.body.startDate).format();
    var endDate = moment(req.body.endDate).format();


    if (!req.body.parent_id && !req.body.startDate && !req.body.endDate) {

        return res.json(Response(402, "failed", constantsObj.validationMessages.requiredFieldsMissing));
    } else {
        var condition = {
            deleted: false,
            //  is_archive: false,

            $or: [{
                "parent_id": mongoose.Types.ObjectId(req.body.parent_id),

            }, {
                "job.job_added_by": mongoose.Types.ObjectId(req.body.parent_id),

            }],
            $and: [{
                longitude: {
                    $ne: ""
                }
            }, {
                latitude: {
                    $ne: ""
                }
            }]
        };
        // condition.deleted = false;
        // condition.parent_id = mongoose.Types.ObjectId(req.body.parent_id);
        // condition['job.job_added_by'] = mongoose.Types.ObjectId(req.body.parent_id);
        // condition.longitude = {$ne:""};
        // condition.latitude = {$ne:""};
        // condition.$or = [{
        //         "parent_id": mongoose.Types.ObjectId(req.body.parent_id),

        //     }, {
        //         "job.job_added_by": mongoose.Types.ObjectId(req.body.parent_id),

        //     }]
        // condition.$and = [{
        //         longitude: {
        //             $ne: ""
        //         }
        //     }, {
        //         latitude: {
        //             $ne: ""
        //         }
        //     }]
        //    var condition = {
        //         deleted: false,
        //         $or: [{
        //             "parent_id": mongoose.Types.ObjectId(req.body.parent_id),

        //         }, {
        //             "job.job_added_by": mongoose.Types.ObjectId(req.body.parent_id),

        //         }],
        //         $and: [{
        //             longitude: {
        //                 $ne: ""
        //             }
        //         }, {
        //             latitude: {
        //                 $ne: ""
        //             }
        //         }]
        //     };
        var count = req.body.count ? req.body.count : 0;
        var skip = req.body.count * (req.body.page - 1);
        // //console.log("req.body.sorting", req.body.sorting)
        var sorting = req.body.sorting ? req.body.sorting : {
            _id: 1
        };
        // hard coded fix applied for sorting key problem; 
        for (let key in req.body) {
            if (key.match(/^sorting.*$/gi)) {
                var sKey = key.split('[')[1].split(']')[0];
                var sortt = {}; sortt[sKey] = (req.body[key] == 'asc') ? 1 : -1;
                sorting = sortt
            }
        }

        var searchText = decodeURIComponent(req.body.searchText).replace(/[[\]{}()*+?,\\^$|#\s]/g, "\\s+");



        if (req.body.searchText) {
            // delete condition.is_archive;
            //console.log("req.body.searchText",req.body.searchText)
            condition.$and.push({
                $or: condition.$or
            });
            condition.$or = [
                {
                    'daily_number': new RegExp(searchText, 'gi')
                },
                {
                    'foreman.firstname': new RegExp(searchText, 'gi')
                },
                {
                    'foreman.lastname': new RegExp(searchText, 'gi')
                },
                {
                    'job.client': new RegExp(searchText, 'gi')
                },
                {
                    'job.job_id': new RegExp(searchText, 'gi')
                },
                {
                    'foreman.customer_id': new RegExp(searchText, 'gi')
                },
                {
                    'crews.firstname': new RegExp(searchText, 'gi')
                }
            ]; if (searchText.split('\\s+')[1]) {
                condition.$or = [
                    {
                        $and: [
                            {
                                'foreman.firstname': new RegExp(searchText.split('\\s+')[0], 'gi')
                            },
                            {
                                'foreman.lastname': new RegExp(searchText.split('\\s+')[1], 'gi')
                            }
                        ]
                    },
                    {
                        'job.job_id': new RegExp(searchText, 'gi')
                    },
                    {
                        'job.client': new RegExp(searchText, 'gi')
                    }
                ];
            }
        }


        if (req.body.startDate && req.body.endDate) {
            condition.$and.push({ $or: condition.$or });

            condition.from_date = {
                $gte: new Date(startDate)
            };
            condition.to_date = {
                $lte: new Date(endDate)
            };
            // condition.$and.push({
            //     from_date: {
            //         $gte: new Date(startDate)
            //     },
            //     to_date: {
            //         $lte: new Date(endDate)
            //     }
            // })

        }

        for (let key in sorting) {
            sorting[key] = ((sorting[key] == '-1') ? -1 : 1);
            // //console.log('sorting set key---->>>', sorting, key);
        }


        //console.log('std end--->', condition);
        if (req.body.filter) {
            // delete condition.is_archive;

            condition.$and.push({ $or: condition.$or });

            ////console.log("req.body.filterFlag",req.body.filter)
            // condition.$and = [];
            if (req.body.filter.daily_number && req.body.filter.daily_number != '') {
                // condition.$and.push({
                //     'daily_number': new RegExp(req.body.filterFlag.daily_number, 'gi')
                // })
                condition.daily_number = new RegExp(req.body.filter.daily_number, 'gi');
                // condition.$or = [            
                //     {'daily_number': new RegExp(req.body.filter.daily_number, 'gi')}
                // ];

            }
            if (req.body.filter.customer_id && req.body.filter.customer_id != '') {
                // condition.$and.push({
                //     'foreman.customerId': new RegExp(req.body.filter.customer_id, 'gi')
                // })
                condition['foreman.customerId'] = new RegExp(req.body.filter.customer_id, 'gi');

            }
            if (req.body.filter.job_id && req.body.filter.job_id != '') {
                // condition.$and.push({
                //     'job.job_id': new RegExp(req.body.filter.job_id, 'gi')
                // })
                condition['job.job_id'] = new RegExp(req.body.filter.job_id, 'gi');

            }
            if (req.body.filter.client && req.body.filter.client != '') {
                condition['job.client'] = new RegExp(req.body.filter.client, 'gi');
                // condition.$and.push({
                //     'job.client': new RegExp(req.body.filter.client, 'gi')
                // })
            }
            if (req.body.filter.foremen && req.body.filter.foremen != '') {
                if (req.body.filter.foremen.split(' ')[1]) {
                    condition['foreman.firstname'] = new RegExp(req.body.filter.foremen.split(' ')[0], 'gi');
                    condition['foreman.lastname'] = new RegExp(req.body.filter.foremen.split(' ')[1], 'gi');

                    //     condition.$and.push({
                    //         $and:[
                    //                {
                    //             'foreman.firstname': new RegExp(req.body.filter.foremen.split(' ')[0], 'gi')
                    //         },
                    //         {
                    //             'foreman.lastname': new RegExp(req.body.filter.foremen.split(' ')[1], 'gi')
                    //         }, 
                    // ]
                    //     })    
                } else {
                    // condition['foreman.firstname'] = new RegExp(req.body.filter.foremen, 'gi');
                    condition.$or = [{
                        'foreman.firstname': new RegExp(req.body.filter.foremen, 'gi')
                    },
                    {
                        'foreman.lastname': new RegExp(req.body.filter.foremen, 'gi')
                    }];
                    // condition.$and.push({
                    // 'foreman.firstname': new RegExp(req.body.filter.foremen, 'gi')
                    // })
                }
            }
            ////console.log('Condition :: ', condition);
        }


        /* if (req.body.startDate && req.body.endDate) {
            //console.log("inside req.body.startdate")
            MyDailies.find({
                from_date: {
                    $gte: new Date(startDate)
                },
                to_date: {
                    $lte: new Date(endDate)
                },
                deleted: false,
                parent_id: req.body.parent_id
            })
                .populate('job_id')
                .populate('crews_id')
                .populate('user_id')
                .populate('supervisor_id')
                .populate('parent_id')
                .exec(function (err, data) {
                    //console.log("data is here", data)
                    if (err) {
                        return res.json(Response(500, "failed", constantsObj.validationMessages.internalError, {}));
                    } else {
                        return res.json(Response(200, "success", constantsObj.messages.dataRetrievedSuccess, data));

                        // return res.json({
                        //     'code': 200,
                        //     status: 'success',
                        //     "message": constantsObj.messages.dataRetrievedSuccess,
                        //     data: data
                        // });
                    }
                })
        } */











        if (req.body.long && req.body.lat) {
            //console.log("req.body.long>>", req.body.long, "req.body.lat", req.body.lat)
            MyDailies.find({
                deleted: false,
                "parent_id": mongoose.Types.ObjectId(req.body.parent_id),
                no_production: false,
                $and: [{
                    longitude: {
                        $ne: ""
                    }
                }, {
                    latitude: {
                        $ne: ""
                    }
                }]
            }, {
                    createdAt: 1,
                    job_na: 1,
                    job_map: 1,
                    daily_number: 1,
                    job_location: 1,
                    latitude: 1,
                    longitude: 1,
                    to_date: 1,
                    from_date: 1,
                    no_production: 1,
                    notes: 1,
                    geo_loc: 1, //this is getting
                    status: 1,
                    crews_id: 1,
                    user_id: 1,
                    supervisor_id: 1,
                    job_id: 1,
                    reject_notes: 1
                })
                .populate('crews_id', '_id firstname lastname')
                .populate('user_id', '_id firstname lastname customer_id')
                .populate('supervisor_id', '_id firstname lastname')
                .populate('job_id', '_id job_id client')
                .lean()
                .exec(function (err, dailiesInfosData) {
                    ////console.log("dailiesInfosData>>>>", dailiesInfosData);
                    if (err) {
                        return res.json(Response(500, "failed", constantsObj.validationMessages.internalError, err, {}));
                    } else {
                        var dailiesLocData = [];
                        async.each(dailiesInfosData, function (item, callback) {
                            MyDailiesImage.find({
                                mydailies_id: item._id
                            }).exec(function (err, dailiesInfosData) {
                                item.dailiesImage = dailiesInfosData;
                                myDailies_Billable_items.find({
                                    my_dailies_id: item._id
                                }).exec(function (err, dailiesBillableData) {
                                    item.billable_items = dailiesBillableData;
                                    //console.log('item.latitude', item.latitude, 'item.longitude', item.latitude);
                                    if (item.latitude != undefined) {
                                        let result = geolib.isPointInCircle({
                                            latitude: item.latitude,
                                            longitude: item.longitude
                                        }, {
                                                latitude: req.body.lat,
                                                longitude: req.body.long
                                            }, 500000);
                                        if (result == true) {
                                            dailiesLocData.push(item);
                                        }
                                        callback();
                                    } else {
                                        callback()
                                    }

                                });
                            });
                        }, function (err) {
                            if (err) {
                                return res.json(Response(500, "failed", constantsObj.validationMessages.internalError, {}));
                            } else {
                                return res.json({
                                    'code': 200,
                                    status: 'success',
                                    "message": constantsObj.messages.dataRetrievedSuccess,
                                    "data": dailiesLocData
                                });
                            }

                        });
                    }
                });

        }

        if (!req.body.long && !req.body.lat) {
            //console.log(condition, 'sdfsdf>>>>>>>>>>>>>>.')
            ////console.log("inside if")
            co(function* () {
                let aggregate = [{
                    $lookup: {
                        from: "foremen_crews",
                        localField: "crews_id",
                        foreignField: "_id",
                        as: "crews"
                    }
                },
                {
                    $unwind: {
                        path: "$crews",
                        preserveNullAndEmptyArrays: true
                    }
                }, {
                    $lookup: {
                        from: "users",
                        localField: "user_id",
                        foreignField: "_id",
                        as: "foreman"
                    }
                },
                {
                    $unwind: {
                        path: "$foreman",
                        preserveNullAndEmptyArrays: true
                    }
                },
                {
                    $lookup: {
                        from: "users",
                        localField: "supervisor_id",
                        foreignField: "_id",
                        as: "supervisor"
                    }
                },
                {
                    $unwind: {
                        path: "$supervisor",
                        preserveNullAndEmptyArrays: true
                    }
                },
                {
                    $lookup: {
                        from: "users",
                        localField: "parent_id",
                        foreignField: "_id",
                        as: "contractor"
                    }
                },
                {
                    $unwind: {
                        path: "$contractor",
                        preserveNullAndEmptyArrays: true
                    }
                },
                {
                    $lookup: {
                        from: "subjob",
                        localField: "sub_job",
                        foreignField: "_id",
                        as: "subjob"
                    }
                },
                {
                    $unwind: {
                        path: "$subjob",
                        preserveNullAndEmptyArrays: true
                    }
                },
                {
                    $lookup: {
                        from: "jobs",
                        localField: "job_id",
                        foreignField: "_id",
                        as: "job"
                    }
                },
                {
                    $unwind: {
                        path: "$job",
                        preserveNullAndEmptyArrays: true
                    }
                },
                {
                    $lookup: {
                        from: "users",
                        localField: "parent_id",
                        foreignField: "_id",
                        as: "customerId"
                    }
                },
                {
                    $unwind: {
                        path: "$customerId",
                        preserveNullAndEmptyArrays: true
                    }
                },
                {
                    $lookup: {
                        from: "subjobs",
                        localField: "sub_job",
                        foreignField: "_id",
                        as: "subjob"
                    }
                },
                {
                    $unwind: {
                        path: "$subjob",
                        preserveNullAndEmptyArrays: true
                    }
                },
                {
                    $match: condition
                },
                {
                    $project: {
                        createdAt: 1,
                        job_na: 1,
                        job_map: 1,
                        daily_number: 1,
                        job_location: 1,
                        latitude: 1,
                        longitude: 1,
                        to_date: 1,
                        from_date: 1,
                        no_production: 1,
                        notes: 1,
                        geo_loc: 1,
                        status: 1,
                        is_draft: 1,
                        reject_notes: 1,
                        contractor: "$foreman.parent_id",
                        customerId: "$customerId.customer_id",
                        //  customerIdL: {
                        //     _id: '$foreman._id',
                        //     customerId: "$foreman.customer_id"
                        // },

                        job_detail: {
                            _id: '$job._id',
                            job_id: '$job.job_id',
                            client: '$job.client',
                            myDetails: '$job.billing_info.billable_items'
                        },
                        supervisor_details: {
                            _id: '$supervisor._id',
                            firstname: '$supervisor.firstname',
                            lastname: '$supervisor.lastname'
                        },
                        foremen_details: {
                            _id: '$foreman._id',
                            firstname: '$foreman.firstname',
                            lastname: '$foreman.lastname',
                        },
                        contractor_details: {
                            _id: '$contractor._id',
                            firstname: '$contractor.firstname',
                            lastname: '$contractor.lastname',
                        },
                        crews_details: {
                            _id: '$crews._id',
                            firstname: '$crews.firstname',
                            lastname: '$crews.lastname'
                        },
                        subjob_details: {
                            _id: '$subjob._id',
                            subJob: '$subjob.subJob',

                        },

                    }
                }
                ]
                var CountQuery = [].concat(aggregate);

                CountQuery.push({ $group: { _id: null, count: { $sum: 1 } } });
                // //console.log()
                if (sorting) {
                    ////console.log('sorting---->',sorting)
                    aggregate.push({
                        $sort: sorting
                    });
                }
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
                //console.log('aggregate===>', aggregate)
                let myDailiesData = yield MyDailies.aggregate(aggregate);
                //console.log("myDailiesData>>>>>", myDailiesData)
                async.each(myDailiesData, function (item, callback) {
                    // //console.log("item>>>>",item)
                    MyDailiesImage.find({
                        mydailies_id: item._id
                    }).exec(function (err, dailiesInfosData) {
                        item.dailiesImage = dailiesInfosData;
                        myDailies_Billable_items.find({
                            my_dailies_id: item._id
                        }).exec(function (err, dailiesBillableData) {
                            //console.log("dailiesBillableData", dailiesBillableData)
                            item.billable_items = dailiesBillableData;
                            callback();
                        });
                    });
                }, function (err) {
                    if (err) {
                        return res.json(Response(500, "failed", constantsObj.validationMessages.internalError, {}));
                    } else {
                        // var getCount = MyDailies.find(condition).count().exec();

                        MyDailies.aggregate(CountQuery).then((count) => {
                            return res.json({
                                'code': 200,
                                status: 'success',
                                "message": constantsObj.messages.dataRetrievedSuccess,
                                "data": reverseOrder(myDailiesData),
                                "totalLength": (count[0]) ? count[0].count : 0
                            });
                        }).catch(function (err) {

                            return res.json({
                                'code': 500,
                                status: 'failure',
                                "message": constantsObj.messages.errorRetreivingData,
                                "data": err
                            });
                        });
                        // //console.log("getCount>>>>>>",getCount)
                        // getCount.then(function (totalLength) {
                        //  //console.log("totalLength >>>>>>",totalLength)
                        //     return res.json({
                        //         'code': 200,
                        //         status: 'success',
                        //         "message": constantsObj.messages.dataRetrievedSuccess,
                        //         "data": myDailiesData,
                        //         "totalLength": totalLength
                        //     });
                        // }).catch(function (err) {

                        //     return res.json({
                        //         'code': 500,
                        //         status: 'failure',
                        //         "message": constantsObj.messages.errorRetreivingData,
                        //         "data": err
                        //     });
                        // });
                    }

                });

            }).catch(function (err) {

                return res.json(Response(402, "failed", utility.validationErrorHandler(err), {}));
            });
        }
        // if (!req.body.long && !req.body.lat) {
        //     co(function* () {
        //         let aggregate = [{
        //             $lookup: {
        //                 from: "foremen_crews",
        //                 localField: "crews_id",
        //                 foreignField: "_id",
        //                 as: "crews"
        //             }
        //         },
        //         {
        //             $unwind: {
        //                 path: "$crews",
        //                 preserveNullAndEmptyArrays: true
        //             }
        //         }, {
        //             $lookup: {
        //                 from: "users",
        //                 localField: "user_id",
        //                 foreignField: "_id",
        //                 as: "foreman"
        //             }
        //         },
        //         {
        //             $unwind: {
        //                 path: "$foreman",
        //                 preserveNullAndEmptyArrays: true
        //             }
        //         },
        //         {
        //             $lookup: {
        //                 from: "users",
        //                 localField: "supervisor_id",
        //                 foreignField: "_id",
        //                 as: "supervisor"
        //             }
        //         },
        //         {
        //             $unwind: {
        //                 path: "$supervisor",
        //                 preserveNullAndEmptyArrays: true
        //             }
        //         },
        //         {
        //             $lookup: {
        //                 from: "users",
        //                 localField: "parent_id",
        //                 foreignField: "_id",
        //                 as: "contractor"
        //             }
        //         },
        //         {
        //             $unwind: {
        //                 path: "$contractor",
        //                 preserveNullAndEmptyArrays: true
        //             }
        //         },
        //         {
        //             $lookup: {
        //                 from: "jobs",
        //                 localField: "job_id",
        //                 foreignField: "_id",
        //                 as: "job"
        //             }
        //         },
        //         {
        //             $unwind: {
        //                 path: "$job",
        //                 preserveNullAndEmptyArrays: true
        //             }
        //         },
        //         {
        //             $lookup: {
        //                 from: "users",
        //                 localField: "parent_id",
        //                 foreignField: "_id",
        //                 as: "customerId"
        //             }
        //         },
        //         {
        //             $unwind: {
        //                 path: "$customerId",
        //                 preserveNullAndEmptyArrays: true
        //             }
        //         },
        //         {
        //             $match: condition
        //         },
        //         {
        //             $project: {
        //                 createdAt: 1,
        //                 job_na: 1,
        //                 job_map: 1,
        //                 daily_number: 1,
        //                 job_location: 1,
        //                 latitude: 1,
        //                 longitude: 1,
        //                 to_date: 1,
        //                 from_date: 1,
        //                 no_production: 1,
        //                 notes: 1,
        //                 geo_loc: 1,
        //                 status: 1,
        //                 is_draft: 1,
        //                 reject_notes: 1,
        //                 contractor: "$foreman.parent_id",
        //                 customerId: "$customerId.customer_id",
        //                 //  customerIdL: {
        //                 //     _id: '$foreman._id',
        //                 //     customerId: "$foreman.customer_id"
        //                 // },

        //                 job_detail: {
        //                     _id: '$job._id',
        //                     job_id: '$job.job_id',
        //                     client: '$job.client'
        //                 },
        //                 supervisor_details: {
        //                     _id: '$supervisor._id',
        //                     firstname: '$supervisor.firstname',
        //                     lastname: '$supervisor.lastname'
        //                 },
        //                 foremen_details: {
        //                     _id: '$foreman._id',
        //                     firstname: '$foreman.firstname',
        //                     lastname: '$foreman.lastname',
        //                 },
        //                 contractor_details: {
        //                     _id: '$contractor._id',
        //                     firstname: '$contractor.firstname',
        //                     lastname: '$contractor.lastname',
        //                 },
        //                 crews_details: {
        //                     _id: '$crews._id',
        //                     firstname: '$crews.firstname',
        //                     lastname: '$crews.lastname'
        //                 },

        //             }
        //         }
        //         ]
        //         var CountQuery = [].concat(aggregate);
        //         aggregate.push({ $sort: sorting }); 
        //         aggregate.push({ $skip: parseInt(skip) }); 
        //         aggregate.push({ $limit: parseInt(count) });

        //         CountQuery.push({$group: {_id: null,count: {$sum: 1}}});
        //         // //console.log()
        //         // if (sorting) {
        //         //     // //console.log('sorting---->',sorting)
        //         //     aggregate.push({
        //         //         $sort: sorting
        //         //     });
        //         // }
        //         // if (parseInt(skip) > 0) {
        //         //     aggregate.push({
        //         //         $skip: parseInt(skip)
        //         //     });
        //         // }
        //         // if (parseInt(count) > 0) {
        //         //     aggregate.push({
        //         //         $limit: parseInt(count)
        //         //     });
        //         // }

        //        let myDailiesData = yield MyDailies.aggregate(aggregate);
        //         //console.log("myDailiesData>>>>>",myDailiesData)
        //         async.each(myDailiesData, function (item, callback) {
        //             MyDailiesImage.find({
        //                 mydailies_id: item._id
        //             }).exec(function (err, dailiesInfosData) {
        //                 item.dailiesImage = dailiesInfosData;
        //                 myDailies_Billable_items.find({
        //                     my_dailies_id: item._id
        //                 }).exec(function (err, dailiesBillableData) {
        //                     item.billable_items = dailiesBillableData;
        //                     callback();
        //                 });
        //             });
        //         }, function (err) {
        //             if (err) {
        //                 return res.json(Response(500, "failed", constantsObj.validationMessages.internalError, {}));
        //             } else {
        //                 // var getCount = MyDailies.find(condition).count().exec();
        //                 // //console.log(" myDailiesData:---",myDailiesData)
        //                 MyDailies.aggregate(CountQuery).then((count)=>{
        //                     return res.json({
        //                         'code': 200,
        //                         status: 'success',
        //                         "message": constantsObj.messages.dataRetrievedSuccess,
        //                         "data": reverseOrder(myDailiesData),
        //                         "totalLength": (count[0]) ? count[0].count : 0
        //                     });
        //                 }).catch(function (err) {

        //                     return res.json({
        //                         'code': 500,
        //                         status: 'failure',
        //                         "message": constantsObj.messages.errorRetreivingData,
        //                         "data": err
        //                     });
        //                 });
        //                 // //console.log("getCount>>>>>>",getCount)
        //                 // getCount.then(function (totalLength) {
        //                 //  //console.log("totalLength >>>>>>",totalLength)
        //                 //     return res.json({
        //                 //         'code': 200,
        //                 //         status: 'success',
        //                 //         "message": constantsObj.messages.dataRetrievedSuccess,
        //                 //         "data": myDailiesData,
        //                 //         "totalLength": totalLength
        //                 //     });
        //                 // }).catch(function (err) {

        //                 //     return res.json({
        //                 //         'code': 500,
        //                 //         status: 'failure',
        //                 //         "message": constantsObj.messages.errorRetreivingData,
        //                 //         "data": err
        //                 //     });
        //                 // });
        //             }

        //         });

        //     }).catch(function (err) {

        //         return res.json(Response(402, "failed", utility.validationErrorHandler(err), {}));
        //     });
        // }
    }
}

/**
 * Function is use to delete Dailies by id
 * @access private
 * @return json
 * Created by Rahul
 * @smartData Enterprises (I) Ltd
 * Created Date 10-Aug-2017
 */
function deleteDailiesByID(req, res) {
    //console.log("deleteDailiesById>>>>>>>", req.body)
    if (!req.swagger.params.id.value) {
        return res.json(Response(402, "failed", constantsObj.validationMessages.requiredFieldsMissing));
    } else {
        var id = req.swagger.params.id.value;
        MyDailies.findById(id).exec(function (err, data) {
            if (err) {
                return res.json(Response(500, "failed", constantsObj.validationMessages.internalError, err));
            } else {
                if (!data) {
                    return res.json(Response(402, "failed", constantsObj.validationMessages.userNotFound, {}));
                } else {
                    data.deleted = true;
                    data.save(function (err, dailiesData) {
                        if (err)
                            return res.json(Response(500, "failed", constantsObj.validationMessages.internalError, err));
                        else {
                            MyDailiesImage.findOne({
                                "mydailies_id": mongoose.Types.ObjectId(dailiesData._id)
                            }, function (err, dailiesImageInfo) {
                                if (err) {
                                    return res.json(Response(500, "failed", constantsObj.validationMessages.internalError, err));
                                } else {

                                    if (dailiesImageInfo) {
                                        var model = dailiesImageInfo;
                                        model.deleted = true;
                                        model.save(function (err, dialiesImage) {
                                            if (err) {
                                                return res.json(Response(500, "failed", constantsObj.validationMessages.internalError, err));
                                            } else {
                                                return res.json({
                                                    'code': 200,
                                                    status: 'success',
                                                    "message": constantsObj.messages.dailiesDeleteSuccess,
                                                    "data": {}
                                                });
                                            }
                                        })
                                    } else {
                                        return res.json({
                                            'code': 200,
                                            status: 'success',
                                            "message": constantsObj.messages.dailiesDeleteSuccess,
                                            "data": {}
                                        });
                                    }

                                }
                            })

                        }
                    });
                }
            }
        })
    }
}



/**
 * Function is use to get Dailies by id
 * @access private
 * @return json
 * Created by Rahul
 * @smartData Enterprises (I) Ltd
 * Created Date 29-Aug-2017
 */
function getDailiesByID(req, res) {
    if (!req.body.dailies_number) {
        return res.json(Response(402, "failed", constantsObj.validationMessages.requiredFieldsMissing));
    } else {
        ////console.log(req.body.dailies_number)
        co(function* () {
            var condition = {
                deleted: false,
                "daily_number": req.body.dailies_number.toString(),
                no_production: false
            };
            let aggregate = [{
                $lookup: {
                    from: "foremen_crews",
                    localField: "crews_id",
                    foreignField: "_id",
                    as: "crews"
                }
            },
            {
                $unwind: {
                    path: "$crews",
                    preserveNullAndEmptyArrays: true
                }
            }, {
                $lookup: {
                    from: "users",
                    localField: "user_id",
                    foreignField: "_id",
                    as: "foreman"
                }
            },
            {
                $unwind: {
                    path: "$foreman",
                    preserveNullAndEmptyArrays: true
                }
            }, {
                $lookup: {
                    from: "users",
                    localField: "supervisor_id",
                    foreignField: "_id",
                    as: "supervisor"
                }
            },
            {
                $unwind: {
                    path: "$supervisor",
                    preserveNullAndEmptyArrays: true
                }
            }, {
                $lookup: {
                    from: "jobs",
                    localField: "job_id",
                    foreignField: "_id",
                    as: "job"
                }
            },
            {
                $unwind: {
                    path: "$job",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $match: condition
            },
            {
                $project: {
                    createdAt: 1,
                    job_na: 1,
                    job_map: 1,
                    daily_number: 1,
                    job_location: 1,
                    latitude: 1,
                    longitude: 1,
                    to_date: 1,
                    from_date: 1,
                    no_production: 1,
                    notes: 1,
                    status: 1,
                    job_detail: {
                        _id: '$job._id',
                        job_id: '$job.job_id',
                        client: '$job.client'
                    },
                    supervisor_details: {
                        _id: '$supervisor._id',
                        firstname: '$supervisor.firstname',
                        lastname: '$supervisor.lastname'
                    },
                    foremen_details: {
                        _id: '$foreman._id',
                        firstname: '$foreman.firstname',
                        lastname: '$foreman.lastname'
                    },
                    crews_details: {
                        _id: '$crews._id',
                        firstname: '$crews.firstname',
                        lastname: '$crews.lastname'
                    },

                }
            }
            ]
            let myDailiesData = yield MyDailies.aggregate(aggregate);
            async.each(myDailiesData, function (item, callback) {
                MyDailiesImage.find({
                    mydailies_id: item._id
                }).exec(function (err, dailiesInfosData) {
                    item.dailiesImage = dailiesInfosData;
                    myDailies_Billable_items.find({
                        my_dailies_id: item._id
                    }).exec(function (err, dailiesBillableData) {
                        item.billable_items = dailiesBillableData;
                        callback();
                    });
                });
            }, function (err) {
                if (err) {
                    return res.json(Response(500, "failed", constantsObj.validationMessages.internalError, {}));
                } else {
                    return res.json({
                        'code': 200,
                        status: 'success',
                        "message": constantsObj.messages.dataRetrievedSuccess,
                        "data": myDailiesData
                    });
                }

            });

        }).catch(function (err) {

            return res.json(Response(402, "failed", utility.validationErrorHandler(err), {}));
        });
    }
}

/**
 * Function is use to make a pdf file of dailies
 * @access private
 * @return json
 * Created by rahul tiwari
 * @smartData Enterprises (I) Ltd
 * Created Date 07-sept-2017
 */
function downloadPdf(req, res) {
    ////console.log(req.body, 'dsfdsfdsf')
    if (!req.body.parent_id && !req.body.user_id && !req.body.supervisor_id) {
        return res.json(Response(402, "failed", constantsObj.validationMessages.requiredFieldsMissing));
    } else {
        if (req.body.from_date && req.body.to_date) {
            var condition = {
                deleted: false,
                $or: [{
                    "parent_id": mongoose.Types.ObjectId(req.body.parent_id),

                }, {
                    "job.job_added_by": mongoose.Types.ObjectId(req.body.parent_id),

                }],
                "from_date": {
                    $gte: new Date(req.body.from_date)
                },
                "to_date": {
                    $lte: new Date(req.body.to_date)
                }
            }

        } else if (!req.body.from_date && !req.body.to_date) {
            var condition = {
                deleted: false,
                $or: [{
                    "parent_id": mongoose.Types.ObjectId(req.body.parent_id),

                }, {
                    "job.job_added_by": mongoose.Types.ObjectId(req.body.parent_id),

                }],
            };
            if (req.body._id) {
                var condition = {
                    "_id": mongoose.Types.ObjectId(req.body._id),
                    deleted: false,
                    $or: [{
                        "parent_id": mongoose.Types.ObjectId(req.body.parent_id),

                    }, {
                        "job.job_added_by": mongoose.Types.ObjectId(req.body.parent_id),

                    }],
                };
            }

        } else if (req.body.user_id) {
            var condition = {
                deleted: false,
                "user_id": mongoose.Types.ObjectId(req.body.user_id)
            };
        } else if (req.body.supervisor_id) {
            var condition = {
                deleted: false,
                "supervisor_id": mongoose.Types.ObjectId(req.body.supervisor_id)
            };
        }

        co(function* () {
            ////console.log('insideco')
            let aggregate = [{
                $lookup: {
                    from: "foremen_crews",
                    localField: "crews_id",
                    foreignField: "_id",
                    as: "crews"
                }
            },
            {
                $unwind: {
                    path: "$crews",
                    preserveNullAndEmptyArrays: true
                }
            }, {
                $lookup: {
                    from: "users",
                    localField: "user_id",
                    foreignField: "_id",
                    as: "foreman"
                }
            },
            {
                $unwind: {
                    path: "$foreman",
                    preserveNullAndEmptyArrays: true
                }
            },

            {
                $lookup: {
                    from: "users",
                    localField: "supervisor_id",
                    foreignField: "_id",
                    as: "supervisor"
                }
            },
            {
                $unwind: {
                    path: "$supervisor",
                    preserveNullAndEmptyArrays: true
                }
            }, {
                $lookup: {
                    from: "jobs",
                    localField: "job_id",
                    foreignField: "_id",
                    as: "job"
                }
            },
            {
                $unwind: {
                    path: "$job",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "parent_id",
                    foreignField: "_id",
                    as: "contractor"
                }
            },
            {
                $unwind: {
                    path: "$contractor",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $lookup: {
                    from: "subjobs",
                    localField: "sub_job",
                    foreignField: "_id",
                    as: "subjob"
                }
            },
            {
                $unwind: {
                    path: "$subjob",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $match: condition
            },
            {
                $project: {
                    createdAt: 1,
                    job_na: 1,
                    job_map: 1,
                    daily_number: 1,
                    job_location: 1,
                    latitude: 1,
                    longitude: 1,
                    to_date: 1,
                    from_date: 1,
                    no_production: 1,
                    notes: 1,
                    geo_loc: 1,
                    status: 1,
                    is_draft: 1,
                    dailies_location: 1,
                    geo_loc: 1,
                    job_detail: {
                        _id: '$job._id',
                        job_id: '$job.job_id',
                        client: '$job.client',
                        address: '$job.address'
                    },
                    supervisor_details: {
                        _id: '$supervisor._id',
                        firstname: '$supervisor.firstname',
                        lastname: '$supervisor.lastname'
                    },
                    foremen_details: {
                        _id: '$foreman._id',
                        firstname: '$foreman.firstname',
                        lastname: '$foreman.lastname'
                    },
                    crews_details: {
                        _id: '$crews._id',
                        firstname: '$crews.firstname',
                        lastname: '$crews.lastname'
                    },
                    contractor_details: {
                        _id: '$contractor._id',
                        firstname: '$contractor.firstname',
                        lastname: '$contractor.lastname'
                    },
                    subjob_details: {
                        _id: '$subjob._id',
                        subJob: '$subjob.subJob',

                    },
                }
            }
            ]

            let myDailiesData = yield MyDailies.aggregate(aggregate);
            ////console.log(myDailiesData, "myDailiesData==================>>>>>>>>>>")
            async.each(myDailiesData, function (item, callback) {
                //console.log('Yessssin async')
                MyDailiesImage.find({
                    mydailies_id: item._id
                }).exec(function (err, dailiesInfosData) {
                    item.dailiesImage = dailiesInfosData;
                    myDailies_Billable_items.find({
                        my_dailies_id: item._id
                    }).exec(function (err, dailiesBillableData) {
                        item.billable_items = dailiesBillableData;
                        callback();
                    });
                });
            }, function (err) {
                if (err) {
                    return res.json(Response(500, "failed", constantsObj.validationMessages.internalError, {}));
                } else {
                    var dailiesFileData = [];
                    ////console.log("mydailiesdata>>>>>>>>>",myDailiesData)
                    // _.each(myDailiesData, function (dailies,index) {
                    for (var r = 0; r < myDailiesData.length; r++) {
                        var daily = randomstring.generate({
                            length: 12,
                            charset: 'alphabetic'
                        }).toString();
                        var pdfFormData = "";
                        //     var filePath = "./public/assets/uploads/dailies/" + daily + '.pdf';
                        //     var downloadPath = "assets/uploads/dailies/" + daily + '.pdf';
                        // //   var logoUrl= "http://localhost:5072/assets/images/logo.png";                        
                        //   var logoUrl= "https://www.getmydaily.com/assets/images/logo.png";     
                        var filePath = "./public/assets/uploads/dailies/" + daily + '.pdf';
                        var downloadPath = "assets/uploads/dailies/" + daily + '.pdf';
                        var logoUrl = config.webUrl + "/assets/images/logo.png";
                        var options = {
                            phantomArgs: ['--ignore-ssl-errors=true', '--ssl-protocol=any'],
                            border: {
                                "top": "10px", // default is 0, units: mm, cm, in, px 
                                "right": "10px",
                                "bottom": "10px",
                                "left": "10px"
                            },

                            "height": "12in",
                            "width": "8.1in",


                        };


                        // generatePDf(pdfFormData, daily);

                        var dailyPdf = `<!doctype html>
<html>
<head>
<meta charset="utf-8">
<title>Untitled Document</title>
<link href="https://fonts.googleapis.com/css?family=Roboto" rel="stylesheet">
</head>
 
<body>
<table width="100%" style="font-family: Gotham, 'Helvetica Neue', Helvetica, Arial, 'sans-serif'; page-break-after:always;" align="center">
    <tr>
        <td valign="bottom" style="background-color: #4199db; height: 50px; padding-bottom: 10px;">
            <table width="100%">
                <tr>
                    <td width="50%">
                        <h1 style="padding-left: 20px; color: #ffffff; font-weight: lighter; font-size: 17px; font-family: 'Roboto', sans-serif; line-height: 0;">Daily Details</h1>
                    </td>
                    <td width="50%" align="right" style="padding-right: 20px; color: #ffffff; font-size: 15px; font-family: Gotham, 'Helvetica Neue', Helvetica, Arial, 'sans-serif'; font-weight: 400;">Daily # ` + myDailiesData[r].daily_number + `</td>
                </tr>
            </table>
        </td>
    </tr>
    <tr>
        <td style="padding: 20px;font-weight: 500;font-size: small;" valign="middle">
            <table width="100%">
                <tr>
                    <td width="28%" style="font-size: 10px; font-family: Gotham, 'Helvetica Neue', Helvetica, Arial, 'sans-serif'; color: #9f9f9f;">JOB ID <font color="#000000">`+ myDailiesData[r].job_detail.job_id + `</font></td>
                    <td width="30%" align="right" style="font-size: 10px; font-family: Gotham, 'Helvetica Neue', Helvetica, Arial, 'sans-serif'; color: #9f9f9f">SUBMITTED <font color="#000000">`+ moment(myDailiesData[r].createdAt).format('ll') + `</font></td>
                    <td width="42%" align="right" style="font-size: 10px; font-family: Gotham, 'Helvetica Neue', Helvetica, Arial, 'sans-serif'; color: #9f9f9f">WORK DATE <font color="#000000">` + moment(myDailiesData[r].from_date).format('ll') + ` - ` + moment(myDailiesData[r].to_date).format('ll') + `</font></td>
                </tr>
            </table>
        </td>
    </tr>
    <tr>
        <td style="background-color: #f2f6f7; padding: 20px;">
            <table width="100%">
                <tr>
                    <td width="33%" style="font-size: 10px; padding-right: 20px; font-family: Gotham, 'Helvetica Neue', Helvetica, Arial, 'sans-serif'; color: #000000;">
                        SUBCONTRACTOR<br>`
                        if (myDailiesData[r].contractor_details) {
                            dailyPdf += `<input value="` + myDailiesData[r].contractor_details.firstname + ` ` + myDailiesData[r].contractor_details.lastname + `" style="width: 100%; border: 1px solid #ccc; padding-left: 10px; color: #000000; font-weight: 600; height: 25px;">`
                        } else {
                            dailyPdf += `<input value="-" style="width: 100%; border: 1px solid #ccc; padding-left: 10px; color: #000000; font-weight: 600; height: 25px;">`
                        }

                        dailyPdf += `</td>
                    <td width="33%" style="font-size: 10px; padding-right: 20px; font-family: Gotham, 'Helvetica Neue', Helvetica, Arial, 'sans-serif'; color: #000000;">
                        FOREMAN<br>`
                        if (myDailiesData[r].foremen_details) {
                            dailyPdf += `<input value="` + myDailiesData[r].foremen_details.firstname + ` ` + myDailiesData[r].foremen_details.lastname + `" style="width: 100%; border: 1px solid #ccc; padding-left: 10px; color: #000000; font-weight: 600; height: 25px;">`
                        } else {
                            dailyPdf += `<input value="-" style="width: 100%; border: 1px solid #ccc; padding-left: 10px; color: #000000; font-weight: 600; height: 25px;">`
                        }


                        dailyPdf += `</td>
                    <td width="33%" style="font-size: 10px; padding-right: 20px; font-family: Gotham, 'Helvetica Neue', Helvetica, Arial, 'sans-serif'; color: #000000;">
                        CLIENT NAME<br>`

                        if (myDailiesData[r].job_detail.client) {
                            dailyPdf += `<input value="` + myDailiesData[r].job_detail.client + `" style="width: 100%; border: 1px solid #ccc; padding-left: 10px; color: #000000; font-weight: 600; height: 25px;">`
                        } else {
                            dailyPdf += `<input value="-" style="width: 100%; border: 1px solid #ccc; padding-left: 10px; color: #000000; font-weight: 600; height: 25px;">`
                        }


                        dailyPdf += `</td>
                </tr>
                <tr>
                    <td width="33%" style="font-size: 10px; padding-top: 20px; padding-right: 20px; font-family: Gotham, 'Helvetica Neue', Helvetica, Arial, 'sans-serif'; color: #000000;">
                        SUPERVISOR<br>`

                        if (myDailiesData[r].supervisor_details) {
                            dailyPdf += `<input value="` + myDailiesData[r].supervisor_details.firstname + ` ` + myDailiesData[r].supervisor_details.lastname + `" style="width: 100%; border: 1px solid #ccc; padding-left: 10px; color: #000000; font-weight: 600; height: 25px;">`
                        } else {
                            dailyPdf += `<input value="-" style="width: 100%; border: 1px solid #ccc; padding-left: 10px; color: #000000; font-weight: 600; height: 25px;">`
                        }


                        dailyPdf += `</td>
                    <td width="33%" style="font-size: 10px; padding-top: 20px; padding-right: 20px; font-family: Gotham, 'Helvetica Neue', Helvetica, Arial, 'sans-serif'; color: #000000;">
                        MAP #<br>`

                        if (myDailiesData[r].job_map) {
                            dailyPdf += `<input value="` + myDailiesData[r].job_map + `" style="width: 100%; border: 1px solid #ccc; padding-left: 10px; color: #000000; font-weight: 600; height: 25px;">`
                        } else {
                            dailyPdf += `<input value="-" style="width: 100%; border: 1px solid #ccc; padding-left: 10px; color: #000000; font-weight: 600; height: 25px;">`
                        }


                        dailyPdf += `</td>
                    <td width="33%" style="font-size: 10px; padding-top: 20px; padding-right: 20px; font-family: Gotham, 'Helvetica Neue', Helvetica, Arial, 'sans-serif'; color: #000000;">
                        TICKET #<br>
`

                        if (myDailiesData[r].job_location) {
                            dailyPdf += `<input value="` + myDailiesData[r].job_location + `" style="width: 100%; border: 1px solid #ccc; padding-left: 10px; color: #000000; font-weight: 600; height: 25px;">`
                        } else {
                            dailyPdf += `<input value="-" style="width: 100%; border: 1px solid #ccc; padding-left: 10px; color: #000000; font-weight: 600; height: 25px;">`
                        }


                        dailyPdf += `</td>
                </tr>
            </table>
        </td>
    </tr>                   

    <tr>
        <td style="padding: 20px 20px 0 20px;">
            <h2 style="font-size: 11px; font-weight: 400; padding-top: 0px; padding-bottom: 0; font-family: Gotham, 'Helvetica Neue', Helvetica, Arial, 'sans-serif'; color: #000000; line-height: 0;">BILLABLE ITEMS</h2>
        </td>
    </tr>
    <tr>
        <td style="padding: 0px 20px;">
            <table width="100%" cellspacing="5">
                <tr>
                    <th style="text-align: left; width: 30%; font-size: 10px; font-weight: 400; font-family: Gotham, 'Helvetica Neue', Helvetica, Arial, 'sans-serif'; color: #9f9f9f;">Name</th>
                    <th style="text-align: left; width: 60%; font-size: 10px; font-weight: 400; font-family: Gotham, 'Helvetica Neue', Helvetica, Arial, 'sans-serif'; color: #9f9f9f;">Description</th>
                    <th style="text-align: center; width: 10%; font-size: 10px; font-weight: 400; font-family: Gotham, 'Helvetica Neue', Helvetica, Arial, 'sans-serif'; color: #9f9f9f;">Quantity</th>
                </tr>
				<tr>
					<td colspan="3">
						<table width="100%"  style="table-layout:fixed;">
							`

                        for (var i = 0; i < myDailiesData[r].billable_items.length; i++) {
                            dailyPdf += ` <tr>`
                            if (myDailiesData[r].billable_items[i].name) {
                                dailyPdf += `<td style="border: 1px solid #ccc; padding-left: 10px; overflow: hidden;   color: #000000; font-weight: 400; height: 2px; font-size: 10px; font-family: Gotham, 'Helvetica Neue', Helvetica, Arial, 'sans-serif';">` + myDailiesData[r].billable_items[i].name + `</td>`
                            } else {
                                dailyPdf += `<td style="border: 1px solid #ccc; padding-left: 10px; overflow: hidden; color: #000000; font-weight: 400; height: 2px; font-size: 10px; font-family: Gotham, 'Helvetica Neue', Helvetica, Arial, 'sans-serif';">-</td>`
                            }
                            if (myDailiesData[r].billable_items[i].description) {
                                dailyPdf += `<td style="border: 1px solid #ccc; padding-left: 10px; color: #000000; font-weight: 400; height: 2px; font-size: 10px; font-family: Gotham, 'Helvetica Neue', Helvetica, Arial, 'sans-serif';">` + myDailiesData[r].billable_items[i].description + `</td>`
                            } else {
                                dailyPdf += `<td style="border: 1px solid #ccc; padding-left: 10px; color: #000000; font-weight: 400; height: 2px; font-size: 10px; font-family: Gotham, 'Helvetica Neue', Helvetica, Arial, 'sans-serif';">-</td>`
                            }
                            if (myDailiesData[r].billable_items[i].quantity) {
                                dailyPdf += `<td style="border: 1px solid #ccc; color: #000000; font-weight: 400; height: 2px; font-size: 10px; font-family: Gotham, 'Helvetica Neue', Helvetica, Arial, 'sans-serif'; text-align: center">` + myDailiesData[r].billable_items[i].quantity + `</td>`
                            } else {
                                dailyPdf += `<td style="border: 1px solid #ccc; color: #000000; font-weight: 400; height: 2px; font-size: 10px; font-family: Gotham, 'Helvetica Neue', Helvetica, Arial, 'sans-serif'; text-align: center">-</td>`
                            }
                            dailyPdf += `  </tr>`

                        }

                        dailyPdf += `
						</table>
					</td>
				</tr>
                
            </table>
        </td>
    </tr>
    <tr>
        <td style="padding: 20px 20px 0 20px;">
            <h2 style="font-size: 11px; font-weight: 400; padding-top: 0px; padding-bottom: 0; font-family: Gotham, 'Helvetica Neue', Helvetica, Arial, 'sans-serif'; color: #000000; line-height: 0;">NOTES</h2>
        </td>
    </tr>
    <tr>
        <td style="padding: 0px 20px;">
            <table width="100%" cellspacing="5">
                <tr>`

                        if (myDailiesData[r].notes) {
                            dailyPdf += `<td style="border: 1px solid #ccc; padding-left: 10px; color: #000000; font-weight: 400; height: 25px; font-size: 10px; font-family: Gotham, 'Helvetica Neue', Helvetica, Arial, 'sans-serif';">` + myDailiesData[r].notes + `</td>`
                        } else {
                            dailyPdf += `<td style="border: 1px solid #ccc; padding-left: 10px; color: #000000; font-weight: 400; height: 25px; font-size: 10px; font-family: Gotham, 'Helvetica Neue', Helvetica, Arial, 'sans-serif';">-</td>`
                        }

                        dailyPdf += `</tr>
            </table>
        </td>
    </tr>
    <tr>
        <td style="padding: 20px 20px 0 20px;">
            <table width="100%">
                <tr>
                    <td>`

                        if (myDailiesData[r].latitude && myDailiesData[r].longitude) {
                            dailyPdf += `
                        <h2 style="font-size: 11px; font-weight: 400; padding-top: 0px; padding-bottom: 0; font-family: Gotham, 'Helvetica Neue', Helvetica, Arial, 'sans-serif'; color: #000000; line-height: 0;">GPS CAPTURE</h2>
                   `
                        } else {
                            dailyPdf += `
                        <h2 style="font-size: 11px; font-weight: 400; padding-top: 0px; padding-bottom: 0; font-family: Gotham, 'Helvetica Neue', Helvetica, Arial, 'sans-serif'; color: #000000; line-height: 0;">GPS CAPTURE - N/A</h2>
                   `
                        }




                        dailyPdf += `
					</td>
                </tr>
            </table>
        </td>
    </tr>
   <tr>
        <td style="padding: 0px 20px;">
            <table width="100%" cellspacing="5">
                <tr>
                    <td>`
                        if (myDailiesData[r].latitude && myDailiesData[r].longitude) {
                            dailyPdf += `<div id="map" style="max-width: 100%;width:490px;height:110px;"></div>`
                        } else {
                            `<div>N/A</div>`
                        }

                        // dailyPdf+=`<img src="map.jpg" width="1366" height="194" style="max-width: 100%;" alt=""/>`

                        dailyPdf += `<tr>
        <td height="1px" style="padding: 10px 20px;">
            <hr color="#adadad">
        </td>
    </tr>
    <tr>
        <td style="padding: 0px 20px 20px 20px;">
            <table width="100%">
                <tr>
                    <td valign="top">

              <img  src=`+ logoUrl + ` style = "height: 12px" >                    </td>
                    <td align="right" valign="top" style="font-size: 10px; font-weight: 400; font-family: Gotham, 'Helvetica Neue', Helvetica, Arial, 'sans-serif'  ; color: #9f9f9f;">
                        Approved by:<br>`
                        if (myDailiesData[r].supervisor_details && myDailiesData[r].status == 'Accepted') {
                            dailyPdf += `<font color="#000000">` + myDailiesData[r].supervisor_details.firstname + ` ` + myDailiesData[r].supervisor_details.lastname + ` (` + moment(myDailiesData[r].createdAt).format('MMMM Do YYYY') + `)</font>`;
                        } else {
                            dailyPdf += `<font color="#000000">` + `</font>`;


                            // dailyPdf += `<input value="-" style="width: 100%; border: 1px solid #ccc; padding-left: 10px; color: #000000; font-weight: 600; height: 25px;">`
                        }

                        dailyPdf += `
                </tr></td>
                    </tr>
            </table>
        </td>
    </tr>

`

                        for (var i = 0; i < myDailiesData[r].dailiesImage.length; i++) {
                            var image_path = config.webUrl + '/' + myDailiesData[r].dailiesImage[i].image_path;
                            //console.log("imagepath>>>>>>>>>>>>>>>", image_path);
                            dailyPdf += `<tr>
                                <td style="padding: 0px 20px;">
                                                            <table width="100%" height="100%" cellspacing="5">
	                        			<tr>
	                        				<td>
                                <img src="`+ image_path + `"height="550" style="max-width: 100%;  width:100%; margin-top:25px;"  alt=""/>
                                </td></tr></table>
	                        	</td>
	                        </tr>`
                        }
                        dailyPdf += `



                    
</table>`






                        if (myDailiesData[r].latitude && myDailiesData[r].longitude) {
                            dailyPdf += `<script>
function myMap() {
    var mapCanvas = document.getElementById("map");
  var myCenter = new google.maps.LatLng(`+ myDailiesData[r].latitude + `,` + myDailiesData[r].longitude + `);
  var mapOptions = {center: myCenter, zoom: 15};
  var map = new google.maps.Map(mapCanvas, mapOptions);

  
}
</script>

<script src="https://maps.googleapis.com/maps/api/js?key=AIzaSyD7PD7klmQbC57ksiGc0PyyViuqCf52_HI&callback=myMap"></script>`

                        }


                        dailyPdf += `</body></html>`;

                    }



                    generatePDf(dailyPdf, daily);
                    function generatePDf(TestData, dailys) {
                        dailiesFileData.push('assets/uploads/dailies/' + dailys + '.pdf');
                        pdf.create(TestData, options).toFile(filePath, function (err, pdfinfo) {
                            if (err) {
                                //console.log(err)
                            } else {
                                //console.log("1111")
                                //var dailiesMailData = { email: req.body.email, firstname: req.body.firstname, lastname: req.body.lastname, download_token: downloadPath };
                                //utility.readTemplateSendMail(dailiesMailData.email, constantsObj.emailSubjects.verify_email, dailiesMailData, 'download_mydailies', function (err, resp) { });                              
                                return res.json({
                                    'code': 200,
                                    status: 'success',
                                    "message": constantsObj.messages.dataRetrievedSuccess,
                                    "data": dailiesFileData
                                });

                            }

                        })

                    }

                }

            });

        }).catch(function (err) {
            //console.log("err>>>>>>>", err)

            return res.json(Response(402, "failed", utility.validationErrorHandler(err), {}));
        });
    }
}














function downloadMultiplePdf(req, res) {

    // //console.log("req.body.data", req.body)
    // var arr = [];
    // arr.push(req.body.data);
    // var arr = req.body.data.slice();
    // //console.log(arr, '*****************')
    // arr.forEach(function (data) {
    //     //console.log("check for each data", data)
    //     downloadPdf(req, res)
    // })
    async.each(arr, function (item, callback) {
        //console.log('Processing item ' + item);
        //console.log(arr, "arrrrrrrrrrrrrrrrrrrrrrr")
        // var newitem = {}
        // newitem.body = item
        downloadPdf()
        //  else {
        // Do work to process file here
        // //console.log('File processed');
        callback();
        // }
    }, function (err) {
        // if any of the file processing produced an error, err would equal that error
        if (err) {
            // One of the iterations produced an error.
            // All processing will now stop.
            //console.log('A file failed to process');
        } else {
            //console.log('All files have been processed successfully');
        }
    });
    // if (req.body.data.length > 0) {
    //     async.waterfall([
    //         function (callback) {
    //             var data = _.filter(req.body.data, function (raObj) {
    //                 if (!raObj._id && !req.body.user_id && !req.body.supervisor_id) {
    //                     return res.json(Response(402, "failed", constantsObj.validationMessages.requiredFieldsMissing));
    //                 } else {
    //                     if (req.body.from_date && req.body.to_date) {
    //                         var condition = {
    //                             deleted: false,
    //                             "parent_id": raObj._id,
    //                             "from_date": {
    //                                 $gte: new Date(req.body.from_date)
    //                             },
    //                             "to_date": {
    //                                 $lte: new Date(req.body.to_date)
    //                             }
    //                         }
    //                     } else if (!req.body.from_date && !req.body.to_date) {
    //                         var condition = {
    //                             deleted: false,
    //                             "parent_id": mongoose.Types.ObjectId(raObj._id)
    //                         };
    //                         if (req.body._id) {
    //                             var condition = {
    //                                 "_id": mongoose.Types.ObjectId(req.body._id),
    //                                 deleted: false,
    //                                 "parent_id": mongoose.Types.ObjectId(raObj._id)
    //                             };
    //                         }
    //                         //console.log("condition", condition)
    //                     } else if (req.body.user_id) {
    //                         var condition = {
    //                             deleted: false,
    //                             "user_id": mongoose.Types.ObjectId(req.body.user_id)
    //                         };
    //                     } else if (req.body.supervisor_id) {
    //                         var condition = {
    //                             deleted: false,
    //                             "supervisor_id": mongoose.Types.ObjectId(req.body.supervisor_id)
    //                         };
    //                     }
    //                 }
    //             });
    //             callback(null, );
    //         },
    //     ], function (err, result) {
    //         //console.log("raArr")
    //     });
    // } else {
    //     return res.json(Response(402, "failed", utility.validationErrorHandler(err), {}));
    // }
}























/**
 * Function is use to make a pdf file of dailies
 * @access private
 * @return json
 * Created by rahul tiwari
 * @smartData Enterprises (I) Ltd
 * Created Date 07-sept-2017
 */





function downloadXls(req, res) {
    ////console.log("req.body------>",req.body,'<----------:')
    //console.log("downlaodXLs", req.body)
    var startDate = moment(req.body.startDate).format();
    var endDate = moment(req.body.endDate).format();

    if (!req.body.parent_id && !req.body.startDate && !req.body.endDate) {

        return res.json(Response(402, "failed", constantsObj.validationMessages.requiredFieldsMissing));
    } else {
        // var condition = {
        //     deleted: false,
        //     $or: [{
        //         "parent_id": mongoose.Types.ObjectId(req.body.parent_id),

        //     }, {
        //         "job.job_added_by": mongoose.Types.ObjectId(req.body.parent_id),

        //     }],
        //     $and: [{
        //         longitude: {
        //             $ne: ""
        //         }
        //     }, {
        //         latitude: {
        //             $ne: ""
        //         }
        //     }]
        // };
        var condition = {
            deleted: false,
            $or: [{
                "parent_id": mongoose.Types.ObjectId(req.body.parent_id),

            }, {
                "job.job_added_by": mongoose.Types.ObjectId(req.body.parent_id),

            }],
            $and: [{
                longitude: {
                    $ne: ""
                }
            }, {
                latitude: {
                    $ne: ""
                }
            }]
        };
        var count = req.body.count ? req.body.count : 0;
        var skip = req.body.count * (req.body.page - 1);
        ////console.log("req.body.sorting", req.body.sorting)
        var sorting = req.body.sorting ? req.body.sorting : {
            _id: 1
        };

        // hard coded fix applied for sorting key problem; 
        for (let key in req.body) {
            if (key.match(/^sorting.*$/gi)) {
                var sKey = key.split('[')[1].split(']')[0];
                var sortt = {}; sortt[sKey] = (req.body[key] == 'asc') ? -1 : 1;
                sorting = sortt
            }
        }

        // for (let key in sorting) {
        //     sorting[key] = ((sorting[key] == 'asc') ? -1 : 1);
        // }

        var searchText = decodeURIComponent(req.body.searchText).replace(/[[\]{}()*+?,\\^$|#\s]/g, "\\s+");


        if (req.body.startDate && req.body.endDate) {
            condition.$and.push({ $or: condition.$or });

            condition.from_date = {
                $gte: new Date(startDate)
            };
            condition.to_date = {
                $lte: new Date(endDate)
            };
            // condition.$and.push({
            //     from_date: {
            //         $gte: new Date(startDate)
            //     },
            //     to_date: {
            //         $lte: new Date(endDate)
            //     }
            // })

        }






        if (req.body.searchText) {
            // //console.log('condition----->',condition);
            condition.$and.push({ $or: condition.$or });
            condition.$or = [

                { 'daily_number': new RegExp(searchText, 'gi') },
                { 'foreman.firstname': new RegExp(searchText, 'gi') },
                { 'foreman.lastname': new RegExp(searchText, 'gi') },
                { 'job.client': new RegExp(searchText, 'gi') },
                { 'job.job_id': new RegExp(searchText, 'gi') },
                { 'foreman.customer_id': new RegExp(searchText, 'gi') },
                { 'crews.firstname': new RegExp(searchText, 'gi') }
            ];

            if (searchText.split('\\s+')[1]) {

                condition.$or = [{
                    'foreman.firstname': new RegExp(searchText.split('\\s+')[0], 'gi')
                },
                {
                    'foreman.lastname': new RegExp(searchText.split('\\s+')[1], 'gi')
                },
                {
                    'job.job_id': new RegExp(searchText, 'gi')
                }];
                //     condition.$or.push({
                //     $and:[
                //        {
                //     'foreman.firstname': new RegExp(searchText.split('\\s+')[0], 'gi')
                // },
                // {
                //     'foreman.lastname': new RegExp(searchText.split('\\s+')[1], 'gi')
                // }, 
                //     ]
                // })
            } else {
                // condition.$or = [{
                //         'foreman.firstname': new RegExp(searchText, 'gi')
                //     },
                //     {
                //         'foreman.lastname': new RegExp(searchText, 'gi')
                //     }];
                //     condition.$or.push(
                //        {
                //     'foreman.firstname': new RegExp(searchText, 'gi')
                //        } ,
                //  {
                //     'foreman.lastname': new RegExp(searchText, 'gi')
                //        } 
                // )
            }

        }


        for (let key in sorting) {
            sorting[key] = ((sorting[key] == '-1') ? -1 : 1);
            // //console.log('sorting set key---->>>', sorting, key);
        }


        //console.log('std end--->', condition);
        if (req.body.filter) {
            condition.$and.push({ $or: condition.$or });

            ////console.log("req.body.filterFlag",req.body.filter)
            // condition.$and = [];
            if (req.body.filter.daily_number && req.body.filter.daily_number != '') {
                // condition.$and.push({
                //     'daily_number': new RegExp(req.body.filterFlag.daily_number, 'gi')
                // })
                condition.daily_number = new RegExp(req.body.filter.daily_number, 'gi');
                // condition.$or = [            
                //     {'daily_number': new RegExp(req.body.filter.daily_number, 'gi')}
                // ];

            }
            if (req.body.filter.customer_id && req.body.filter.customer_id != '') {
                // condition.$and.push({
                //     'foreman.customerId': new RegExp(req.body.filter.customer_id, 'gi')
                // })
                condition['foreman.customerId'] = new RegExp(req.body.filter.customer_id, 'gi');

            }
            if (req.body.filter.job_id && req.body.filter.job_id != '') {
                // condition.$and.push({
                //     'job.job_id': new RegExp(req.body.filter.job_id, 'gi')
                // })
                condition['job.job_id'] = new RegExp(req.body.filter.job_id, 'gi');

            }
            if (req.body.filter.client && req.body.filter.client != '') {
                condition['job.client'] = new RegExp(req.body.filter.client, 'gi');
                // condition.$and.push({
                //     'job.client': new RegExp(req.body.filter.client, 'gi')
                // })
            }
            if (req.body.filter.foremen && req.body.filter.foremen != '') {
                if (req.body.filter.foremen.split(' ')[1]) {
                    condition['foreman.firstname'] = new RegExp(req.body.filter.foremen.split(' ')[0], 'gi');
                    condition['foreman.lastname'] = new RegExp(req.body.filter.foremen.split(' ')[1], 'gi');

                    //     condition.$and.push({
                    //         $and:[
                    //                {
                    //             'foreman.firstname': new RegExp(req.body.filter.foremen.split(' ')[0], 'gi')
                    //         },
                    //         {
                    //             'foreman.lastname': new RegExp(req.body.filter.foremen.split(' ')[1], 'gi')
                    //         }, 
                    // ]
                    //     })    
                } else {
                    // condition['foreman.firstname'] = new RegExp(req.body.filter.foremen, 'gi');
                    condition.$or = [{
                        'foreman.firstname': new RegExp(req.body.filter.foremen, 'gi')
                    },
                    {
                        'foreman.lastname': new RegExp(req.body.filter.foremen, 'gi')
                    }];
                    // condition.$and.push({
                    // 'foreman.firstname': new RegExp(req.body.filter.foremen, 'gi')
                    // })
                }
            }
            ////console.log('Condition :: ', condition);
        }




        co(function* () {
            let aggregate = [{
                $lookup: {
                    from: "foremen_crews",
                    localField: "crews_id",
                    foreignField: "_id",
                    as: "crews"
                }
            },
            {
                $unwind: {
                    path: "$crews",
                    preserveNullAndEmptyArrays: true
                }
            }, {
                $lookup: {
                    from: "users",
                    localField: "user_id",
                    foreignField: "_id",
                    as: "foreman"
                }
            },
            {
                $unwind: {
                    path: "$foreman",
                    preserveNullAndEmptyArrays: true
                }
            }, {
                $lookup: {
                    from: "users",
                    localField: "supervisor_id",
                    foreignField: "_id",
                    as: "supervisor"
                }
            },
            {
                $unwind: {
                    path: "$supervisor",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "parent_id",
                    foreignField: "_id",
                    as: "contractor"
                }
            },
            {
                $unwind: {
                    path: "$contractor",
                    preserveNullAndEmptyArrays: true
                }
            },

            {
                $lookup: {
                    from: "jobs",
                    localField: "job_id",
                    foreignField: "_id",
                    as: "job"
                }
            },
            {
                $unwind: {
                    path: "$job",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $match: condition
            },
            {
                $project: {
                    createdAt: 1,
                    job_na: 1,
                    notes: 1,
                    no_production: 1,
                    job_map: 1,
                    //is_draft: 1,
                    daily_number: 1,
                    from_date: 1,
                    to_date: 1,
                    //status: 1,
                    job: '$job.job_id',
                    client: '$job.client',
                    supervisor_details: {
                        firstname: '$supervisor.firstname',
                        lastname: '$supervisor.lastname'
                    },
                    foremen_details: {
                        firstname: '$foreman.firstname',
                        lastname: '$foreman.lastname'
                    },
                    crews_details: {
                        firstname: '$crews.firstname',
                        lastname: '$crews.lastname'
                    },
                    contractor_details: {
                        _id: '$contractor._id',
                        firstname: '$contractor.firstname',
                        lastname: '$contractor.lastname',
                    },
                }
            }
            ]

            let myDailiesData;
            myDailiesData = yield MyDailies.aggregate(aggregate);
            // if(req.body.data.length){
            //     //console.log("req.body.data.length")
            //     myDailiesData = JSON.parse(req.body.data);
            // }else{

            // }

            // //console.log('my dailies data ------>>>>>',myDailiesData);
            //console.log("myDailiesData>>>>", myDailiesData)
            async.each(myDailiesData, function (item, callback) {
                //console.log("item>>>>", item)
                myDailies_Billable_items.find({
                    my_dailies_id: item._id
                }, {
                        _id: 0,
                        name: 1,
                        quantity: 1
                    }).exec(function (err, dailiesBillableData) {

                        item.billable_items = dailiesBillableData


                        callback();
                    })
                if (item.foremen_details) {
                    item.foremen_details = item.foremen_details.firstname + " " + item.foremen_details.lastname

                } else {
                    item.foremen_details = '-'
                }
                if (!item.notes) {
                    item.notes = '-';
                }
                if (!item.job_map) {
                    item.job_map = '-'
                }
                if (item.supervisor_details) {
                    item.supervisor_details = item.supervisor_details.firstname + " " + item.supervisor_details.lastname

                } else {
                    item.supervisor_details = '-'
                }
                if (item.crews_details) {
                    item.crews_details = item.crews_details.firstname + " " + item.crews_details.lastname

                } else {
                    item.crews_details = '-'
                }
                if (item.contractor_details) {
                    item.contractor_details = item.contractor_details.firstname + " " + item.contractor_details.lastname

                } else {
                    item.contractor_details = '-'
                }
                if (item.no_production == false) {
                    item.no_production = 'N/A';

                }
                if (item.no_production == true) {
                    item.no_production = 'Yes';

                }

                item.Submission_Date = moment(item.createdAt).format('MM-DD-YYYY');
                item.from_date = moment(item.from_date).format('MM-DD-YYYY');
                item.to_date = moment(item.to_date).format('MM-DD-YYYY');


                delete item._id;
                delete item.createdAt;

            }, function (err) {
                if (err) {
                    return res.json(Response(500, "failed", constantsObj.validationMessages.internalError, {}));
                } else {
                    var items = [];
                    items.push("notes");
                    items.push("no_production");
                    items.push("daily_number");
                    items.push("from_date");
                    items.push("to_date");
                    items.push("job");
                    items.push("client");
                    items.push("supervisor_details");
                    items.push("foremen_details");
                    items.push("crews_details");
                    items.push("Submission_Date");
                    items.push("contractor_details");
                    items.push("job_map");

                    if (myDailiesData.length) {
                        myDailiesData = myDailiesData.reverse();
                    }
                    myDailiesData.forEach(function (element) {
                        //console.log("elemnet", element)

                        element.billable_items.forEach(function (elm) {
                            items.push(elm.name);
                        });

                    }, this);

                    //to remove duplicate data from all the headers
                    var headeritems = [];
                    for (var i in items) {
                        //console.log("items>?>>", items)
                        if (headeritems.indexOf(items[i]) === -1) {
                            headeritems.push(items[i]);
                        }
                    }


                    //to get a empty xls and then make changes to it
                    XlsxPopulate.fromBlankAsync()

                        .then(workbook => {
                            //workbook.addSheet("Sheet1");


                            //to dynamically set cell name can be further incremented to AA AB AC ...
                            var cellname = 'ABCDEFGHIJKLMNOPQRSTUVWXYZAABBCCDDEEFFGGHHIIJJKKLLMMNNOOPPQQRRSSTTUUVVWWXXYYZZAAABBBCCCDDDEEEFFFGGGHHHIIIJJJKKKLLLMMMNNNOOOPPPQQQRRRSSSTTTUUUVVVWWWXXXYYYZZZAAAABBBBCCCCDDDDEEEEFFFFGGGGHHHHIIIIJJJJKKKKLLLLMMMMNNNNOOOOPPPPQQQQRRRRSSSSTTTTUUUUVVVVWWWWXXXXYYYYZZZZ';

                            //to create dynamic headers
                            for (var i = 0; i < headeritems.length; i++) {
                                workbook.sheet("Sheet1").cell(cellname[i] + '1').value(headeritems[i]).style({
                                    border: true,
                                    bold: true,
                                    horizontalAlignment: "center",
                                    verticalAlignment: "center"
                                });
                            }


                            //to put data into xls row wise
                            for (var i = 2; i < myDailiesData.length + 2; i++) {
                                var data = myDailiesData[i - 2];
                                workbook.sheet("Sheet1").cell('A' + i).value(data.notes);
                                workbook.sheet("Sheet1").cell('B' + i).value(data.no_production);
                                workbook.sheet("Sheet1").cell('C' + i).value(data.daily_number);
                                workbook.sheet("Sheet1").cell('D' + i).value(data.from_date);
                                workbook.sheet("Sheet1").cell('E' + i).value(data.to_date);
                                workbook.sheet("Sheet1").cell('F' + i).value(data.job);
                                workbook.sheet("Sheet1").cell('G' + i).value(data.client);
                                workbook.sheet("Sheet1").cell('H' + i).value(data.supervisor_details);
                                workbook.sheet("Sheet1").cell('I' + i).value(data.foremen_details);
                                workbook.sheet("Sheet1").cell('J' + i).value(data.crews_details);
                                workbook.sheet("Sheet1").cell('K' + i).value(data.Submission_Date);
                                workbook.sheet("Sheet1").cell('L' + i).value(data.contractor_details);
                                workbook.sheet("Sheet1").cell('M' + i).value(data.job_map);


                                //to add billable items quantity
                                for (var j = 0; j < data.billable_items.length; j++) {

                                    for (var k = 11; k < headeritems.length; k++) {
                                        ////console.log(data.billable_items[j].name + "==" + headeritems[k]);

                                        if (data.billable_items[j].name == headeritems[k]) {
                                            // //console.log(data.billable_items[j].name + "=======" + data.billable_items[j].quantity);
                                            var val = workbook.sheet("Sheet1").cell(cellname[k] + i).value();
                                            if (val == undefined) {
                                                val = 0;
                                            }
                                            workbook.sheet("Sheet1").cell(cellname[k] + i).value(val + parseInt(data.billable_items[j].quantity));
                                        }

                                    }

                                } //end of add billable items

                            } //end of put data into xls row wise

                            var file = randomstring.generate({
                                length: 12,
                                charset: 'alphabetic'
                            }).toString();
                            var filedata = 'assets/uploads/xlsfile/' + file + '.xlsx';

                            //Generate Output File
                            workbook.toFileAsync('public/assets/uploads/xlsfile/' + file + '.xlsx').then(function () {
                                //console.log('File Created!');
                            })

                            return res.json({
                                'code': 200,
                                status: 'success',
                                "data": filedata
                            });

                        });
                }

            })
        }).catch(function (err) {
            return res.json(Response(402, "failed", utility.validationErrorHandler(err)));
        });
    }
}

function getDailiesDate(req, res) {
    ////console.log('getDailiesDate', req.body)
    var startDate = moment(req.body.startDate).format();
    var endDate = moment(req.body.endDate).format();

    if (req.body.startDate && req.body.endDate) {
        //console.log("inside req.body.startdate")



        MyDailies.find({
            from_date: {
                $gte: new Date(startDate)
            },
            to_date: {
                $lte: new Date(endDate)
            },
            deleted: false
        })
            .populate('job_id')
            .populate('crews_id')
            .populate('user_id')
            .populate('supervisor_id')
            .populate('parent_id')
            .exec(function (err, data) {
                //console.log("data is here", data)
                if (err) {
                    return res.json(Response(500, "failed", constantsObj.validationMessages.internalError, {}));
                } else {
                    //console.log(data, "data retrived successfully");
                    return res.json({
                        'code': 200,
                        status: 'success',
                        "message": constantsObj.messages.dataRetrievedSuccess,
                        "data": data,
                        "myResponse": "true"
                    });
                }
            })
    }
}

function getDeletedDailies(req, res) {
    //console.log("getDeletedDailies>>>>", req.body)
    if (!req.body.parent_id) {
        //console.log('err>>>', err)
    }
    else {
        MyDailies.findOneAndUpdate({ deleted: true }, { $set: { deleted: false } }).exec(function (err, data) {
            if (err) {
                //console.log('err>>>', err)
            }
            else {
                //console.log("data>>>>", data)
                return res.json({
                    'code': 200,
                    status: 'success',
                    "message": constantsObj.messages.dataRetrievedSuccess,
                    "data": data,
                    "myResponse": "true"
                });
            }
        })


    }
}


function archiveDailies(req, res) {
    if (!req.body.archiveDailiesId) {
        return res.json(Response(402, "failed", constantsObj.validationMessages.requiredFieldsMissing));

    }
    else {
        MyDailies.findOneAndUpdate({ _id: req.body.archiveDailiesId },
            { $set: { is_archive: true } }).exec(function (err, data) {
                if (err) {
                    //console.log('err')
                }
                else {
                    //console.log("data>>", data)
                    res.json({
                        'code': 200,
                        status: 'success',
                        "message": 'Daily Archived Successfully',
                        "data": data,
                        "myResponse": "true"
                    })
                }
            })
    }
}


// function insertDailies(req,res){

//     MyDailies.update({}, { $set : {is_archive: false} },{multi: true}).exec(function(err,data){
//         if(err){
//         //console.log(data)

//         }
//     else{
//         //console.log("data",data)
//   res.json({
//                      'code': 200,
//                         status: 'success',
//                         "message": constantsObj.messages.dataRetrievedSuccess,
//                         "data": data,
//                         "myResponse": "true"
//                 })  
//                   }
//     })
// }
function insertLastAction(req, res) {
    // db.products.insert( { item: "card", qty: 15 } )


    MyDailies.update({}, { $unset: { "last_action": "" } }, { multi: true }).exec(function (err, data) {
        if (err) {
            //console.log(err)

        }
        else {
            //console.log("data", data)
            res.json({
                'code': 200,
                status: 'success',
                "message": constantsObj.messages.dataRetrievedSuccess,
                "data": data,
                "myResponse": "true"
            })
        }
    })
}




function insertCurrentAction(req, res) {
    MyDailies.update({}, { $unset: { "current_action": "" } }, { multi: true }).exec(function (err, data) {
        if (err) {
            //console.log(err)
        }
        else {
            //console.log("data is here", data)
            res.json({
                'code': 200,
                status: 'success',
                "message": constantsObj.messages.dataRetrievedSuccess,
                "data": data
            })
        }
    })
}




function insertCurrentAction(req, res) {
    MyDailies.update({}, { $unset: { "current_action": "" } }, { multi: true }).exec(function (err, data) {
        if (err) {
            //console.log(err)
        }
        else {
            //console.log("data is here", data)
            res.json({
                'code': 200,
                status: 'success',
                "message": constantsObj.messages.dataRetrievedSuccess,
                "data": data
            })
        }
    })
}













function saveViewEdit(req, res) {
    ////console.log("insideeeeeee bodyyyyyyyyyyyyyyyy", req.body);
    var finalResponse = {};
    if (!req.body.job_detail && !req.body.supervisor_details && !req.body.foremen_details && !req.body.daily_number) {
        return res.json(Response(402, "failed", constantsObj.validationMessages.requiredFieldsMissing));
    } else {
        ////console.log("body is hereeeeeeeeeeeeeeeeeeeeeeeeeeeee", req.body._id);
        async.parallel([
            function (callback) {
                if (req.body.job_detail) {
                    Job.update({
                        _id: req.body.job_detail._id
                    }, {
                            $set: {
                                job_id: req.body.job_detail.job_id,
                                client: req.body.job_detail.client,

                            }
                        }).exec(function (err, update) {
                            if (err) {
                                callback(err, false);
                            } else {
                                finalResponse.jobUpdate = update;
                                callback(null, finalResponse);
                            }
                        });
                }
                else {
                    callback(null, true);
                }

            },

            function (callback) {
                if (req.body._id) {
                    MyDailies.update({
                        _id: req.body._id
                    }, {
                            $set: {
                                notes: req.body.notes,

                            }
                        }).exec(function (err, update) {
                            if (err) {
                                callback(err, false);
                            } else {
                                finalResponse.notesUpdate = update;
                                callback(null, finalResponse);
                            }
                        });
                }
                else {
                    callback(null, true);
                }

            },





            function (callback) {
                if (req.body.supervisor_details) {
                    User.update({
                        _id: req.body.supervisor_details._id
                    }, {
                            $set: {
                                firstname: req.body.supervisor_details.firstname,
                                lastname: req.body.supervisor_details.lastname
                            }
                        }).exec(function (err, update) {
                            if (err) {
                                callback(err, false);
                            } else {
                                finalResponse.superviserUpdate = update;
                                callback(null, finalResponse);
                            }
                        });
                }
                else {
                    callback(null, true);
                }
            },

            function (callback) {
                if (req.body) {
                    MyDailies.update({
                        _id: req.body._id
                    }, {
                            $set: {
                                job_location: req.body.job_location,

                            }
                        }).exec(function (err, update) {
                            if (err) {
                                callback(err, false);
                            } else {
                                finalResponse.job_location = update;
                                callback(null, finalResponse);
                            }
                        });
                }
                else {
                    callback(null, true);
                }

            }, function (callback) {
                if (req.body.foremen_details) {
                    User.update({
                        _id: req.body.foremen_details._id
                    }, {
                            $set: {
                                firstname: req.body.foremen_details.firstname,
                                lastname: req.body.foremen_details.lastname
                            }
                        }).exec(function (err, update) {
                            if (err) {
                                callback(err, false);
                            } else {
                                finalResponse.foremanUpdate = update;
                                callback(null, finalResponse);
                            }
                        });
                }
                else {
                    callback(null, true);
                }
            },
            function (callback) {
                if (req.body.billable_items) {
                    myDailies_Billable_items.update({
                        _id: req.body.billable_items[0]._id
                    }, {
                            $set: {
                                name: req.body.billable_items[0].name,
                                quantity: req.body.billable_items[0].quantity,
                                description: req.body.billable_items[0].description
                            }
                        }).exec(function (err, update) {
                            if (err) {
                                callback(err, false);
                            } else {
                                finalResponse.billable_itemsdata = update;
                                callback(null, finalResponse);
                            }
                        });
                }
                else {
                    callback(null, true);
                }
            },
            function (callback) {
                if (req.body.crews_details) {
                    ForemenCrew.update({
                        _id: req.body.crews_details._id
                    }, {
                            $set: {
                                firstname: req.body.crews_details.firstname,
                                lastname: req.body.crews_details.lastname
                            }
                        }).exec(function (err, update) {
                            if (err) {
                                callback(err, false);
                            } else {
                                finalResponse.crewUpdate = update;
                                callback(null, finalResponse);
                            }
                        });
                }
                else {
                    callback(null, true);
                }
            }
        ], function (err, finalResponse) {
            if (err)
                return res.json(Response(500, "update failed try again", constantsObj.validationMessages.internalError, err));
            else {
                ////console.log(" update:-", finalResponse);
                return res.json({
                    'code': 200,
                    status: 'success',
                    "message": constantsObj.messages.dailyUpdatedSuccess,
                    "data": finalResponse
                });
            }
        });

        // MyDailies.findById(req.body._id)
        //     // .populate('user_id')
        //     // .populate('crews_id')
        //     // .populate('job_id')
        //     .exec(function (err, DailyInfoData) {
        //         if (err) {
        //             return res.json(Response(500, "failed", constantsObj.validationMessages.internalError, err));
        //         } else {
        //             // //console.log('DailyInfoData', DailyInfoData)
        //             //console.log('^^^^^^^^^^^^^^^^^^', req.body.job_detail.job_id)
        //             MyDailies.update({
        //                             _id: req.body._id
        //                         }, {
        //                             $set: {
        //                                 job_id:req.body.job_detail.job_id,
        //                                 client:req.body.job_detail.client
        //                             }
        //                         }).exec(function (err3, update) {
        //                             if (err)
        //                                 return res.json(Response(500, "update failed try again", constantsObj.validationMessages.internalError, err));
        //                             else {
        //                                 //console.log(" update:-",update);
        //                                 return res.json({
        //                                 'code': 200,
        //                                 status: 'success',
        //                                 "message": constantsObj.messages.dataRetrievedSuccess,
        //                                 "data": update
        //                                 });
        //                             }
        //                         })
        // Job.findOne({
        //     job_id: req.body.job_detail.job_id
        // }).exec(function (err2, jobdata) {
        //     if (err2){
        //               //console.log("jobdata>>>>>>>>>")
        //         return res.json(Response(500, "failed", constantsObj.validationMessages.internalError, err));
        //     }

        //     else {
        //         if (jobdata === null)
        //             return res.json(Response(500, "No such Job ID", constantsObj.validationMessages.internalError, err));
        //         else {
        //             //console.log('******', jobdata)
        //             MyDailies.update({
        //                 _id: req.body._id
        //             }, {
        //                 $set: {
        //                     job_id: jobdata._id,
        //                     client: jobdata.client
        //                 }
        //             }).exec(function (err3, update) {
        //                 if (err)
        //                     return res.json(Response(500, "update failed try again", constantsObj.validationMessages.internalError, err));
        //                 else {
        //                     return res.json({
        //                     'code': 200,
        //                     status: 'success',
        //                     "message": constantsObj.messages.dataRetrievedSuccess,
        //                     "data": update
        //                     });
        //                 }
        //             })
        //         }
        //     }
        // })
        //     }
        // })
    }
}

function reverseOrder(jsonObject) {
    if (jsonObject[0]) {
        var arrObj = []
        for (let i = (jsonObject.length - 1); i >= 0; i--) {
            arrObj.push(jsonObject[i]);
            if (i == 0) {
                return arrObj;
            }
        }
    } else {
        return jsonObject;
    }
}

