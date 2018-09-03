'use strict';
var mongoose = require('mongoose'),
constantsObj = require('./../../constants');
var Schema = mongoose.Schema;

var JobSchema = new mongoose.Schema({
    client: { type: String},
    job_unique_id: { type: String},
    job_id: { type: String,required: true},
    address: { type: String},
    description: { type: String},
    start_date: {type: Date},
    projected_end_date: {type: Date},
    actual_end_date: {type: Date},
    job_location: {type: String},
    job_added_by: { type: Schema.Types.ObjectId, ref: 'User' },
    latitude:{type:String},
    longitude:{type:String},
    billing_info : {
        client_billing_contact : {type: String},
        billing_email : {type: String},
        billable_items:[{
        _id :  { type: Schema.Types.ObjectId, ref: 'Billable_item' },
        name :  { type: String },
        description :  { type: String }
        }
        ]
    },
    daily_sumbission_report:{type:String}, // 1=> Internal 2=> External 3=> None
    status: {
        type: String,
        default: 'Progress'
    }, // 1-Activate, 2- Deactivate, 3- Sold
    hassubstream :{Boolean,
            default: false},
    job_shared_to : 
    { type: Schema.Types.ObjectId, ref: 'User' },    
    deleted: {
        type: Boolean,
        default: false
    } // True= Deleted, False= Not Deleted,
    ,
invitesupervisor : {
    type:String,
    default:'First'
},// Active,accepted,rejected
invited : {
    type:String,
    default:false
}// Active,accepted,rejected
},
 {
    timestamps: true
});


JobSchema.statics.addJobAttr = function(body, callback) {
    var jobAttr = new Job();
    jobAttr.name = body.name;
    jobAttr.job_added_by = body.job_added_by;
    jobAttr.supervisor_mode = body.supervisor_mode;
    jobAttr.job_assign_to = body.job_assign_to;
    jobAttr.price = body.price;
    jobAttr.billable_items = body.billable_items;
    jobAttr.save(function(err, data) {
    if (err)
        callback(err);
    else
        callback(null, data);
    });
};

   

JobSchema.statics.getAllJobListAdmin = function(usersID, searchText, skip, limit, sort) {
    return new Promise(function(resolve, reject) {
        var condition = { deleted: false };
        if (searchText != undefined && searchText != 'undefined') {
            condition.$or = [
                { 'job_id': new RegExp(searchText, 'gi') },
                { 'client': new RegExp(searchText, 'gi') }
            ];
        }

        if (usersID) {
            condition.job_added_by = mongoose.Types.ObjectId(usersID);
        }
        Job.aggregate([
                { $match: condition }, {
                    $project: {
                        _id: 1,
                        client: 1,
                        job_unique_id: 1,
                        job_id: 1,
                        address:1,
                        start_date:1,
                        projected_end_date:1,
                        actual_end_date:1,
                        job_location:1,
                        supervisor_mode:1,
                        billing_info:1,
                        status:1,
                        //job_assign_to: { _id: '$users._id', firstname: '$users.firstname', lastname: '$users.lastname', email: '$users.email', deleted: '$users.deleted', status: '$users.status', profile_image: '$users.profile_image' },
                        //billable_items: 1,
                    }
                },
                { $sort: sort },
                { $skip: skip },
                { "$limit": limit },

            ],
            function(err, data) {
                if (err) {
                    reject(err);
                } else {
                    resolve(data);
                }
            });
    });
};
function generateJobID() {
    return new Promise(function(resolve, reject) {
        var jobId = shortid.generate();
        Job.findOne({ job_unique_id: jobId }).exec(function(err, job) {
            if (err) {
                reject(err);
            } else {
                if (job) {
                    generateProduct();
                } else {
                    resolve(jobId);
                }
            }
        });
    });
}

JobSchema.statics.existCheck = function(job_id, id, callback) {
    var where = {};
    if (id) {
        where = {
            $or: [ { job_id: new RegExp('^' + job_id + '$', "i") }], deleted: { $ne: true }, _id: { $ne: id }};
    } else {
        where = {$or: [ { job_id: new RegExp('^' + job_id + '$', "i") }], deleted: { $ne: true }};
    }
    Job.findOne(where, function(err, jobdata) {
        if (err) {
            callback(err)
        } else {
            if (jobdata) {
                callback(null, constantsObj.validationMessages.jobAlreadyExist);
            } else {
                callback(null, true);
            }
        }
    });
};

var Job = mongoose.model('Job', JobSchema);
module.exports = Job;