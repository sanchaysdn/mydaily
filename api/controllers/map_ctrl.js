'use strict';

var mongoose = require('mongoose'),
    Job = mongoose.model('Job'),
    ForemenAssignJob = mongoose.model('Foremen_assign_jobs'),
    SupervisorJob = mongoose.model('Supervisor_jobs'),
    BillableItem = mongoose.model('Billable_item'),
    JobInvities = mongoose.model('Job_invites'),
    User = mongoose.model('User'),
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
    
    getJobmapdata:getJobmapdata,
    getjobMapById:getjobMapById
};




/**
 * Function is use to fetch all job for current user job
 * @access private
 * @return json
 * Created by Rahul
 * @smartData Enterprises (I) Ltd
 * Created Date 29-Jul-2017
 */
function getJobmapdata(req, res) {
    if (!req.body.users_id) {
        return res.json(Response(402, "failed", constantsObj.validationMessages.requiredFieldsMissing));
    }else {
        var condition ={};
            if(req.body.job_id){
                condition ={ _id: req.body.job_id, $and: [ {"job_added_by" : req.body.users_id},{ longitude: { $ne: "" } }, { latitude: { $ne: "" } }] };
            }else{
                condition = { "job_added_by": req.body.users_id, $and: [{ longitude: { $ne: "" } }, { latitude: { $ne: "" } }] };
            }  
            Job.find(condition).exec(function(err, userJob) {
                if (err) {
                    return res.json(Response(500, "failed", constantsObj.validationMessages.internalError, err));
                }else{
                  
                return res.json({ 'code': 200, status: 'success', "message": constantsObj.messages.dataRetrievedSuccess, "data": userJob, "totalLength": userJob.count });
                }
            })
        }
   
    }


/**
 * Function is use to fetch One job for current user job
 * @access private
 * @return json
 * Created by Rahul
 * @smartData Enterprises (I) Ltd
 * Created Date 29-Jul-2017
 */
function getjobMapById(req, res) {

    if (!req.body.users_id) {
        return res.json(Response(402, "failed", constantsObj.validationMessages.requiredFieldsMissing));
    }else {
            Job.find({"job_added_by" : req.body.users_id }).exec(function(err, userJob) {
                if (err) {
                    return res.json(Response(500, "failed", constantsObj.validationMessages.internalError, err));
                }else{

               return res.json({ 'code': 200, status: 'success', "message": constantsObj.messages.dataRetrievedSuccess, "data": userJob });
                }
            })
        }
   
    }

