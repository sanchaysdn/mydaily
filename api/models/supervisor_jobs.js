'use strict';

var mongoose = require('mongoose'),
        constantsObj = require('./../../constants');
var Schema = mongoose.Schema;

var SupervisorAssignJobSchema = new mongoose.Schema({
    job_created_by: {type: mongoose.Schema.Types.ObjectId, ref: 'User'}, // Contractor ID
    job_assign_by: {type: mongoose.Schema.Types.ObjectId, ref: 'User'}, // Contractor ID
    job_assign_to: {type: mongoose.Schema.Types.ObjectId, ref: 'User'}, // Supervisor ID
    job_id: {type: mongoose.Schema.Types.ObjectId, ref: 'Job'},
    approval_status: {
        type: Boolean,
        default: false
    }, // 1-true, 2- false
    invities_status: {
        type: Boolean,
        default: false
    }, // 1-true, 2- false
    role_status : {
        type: String
    },
    supervisor_layer : {
        type: Number, enum: [1,2], default: 1, required: false  // 1 =>up stream contractor , 2=> down stream contractor
    },
    deleted: {
        type: Boolean,
        default: false
    } // True= Deleted, False= Not Deleted
}, {
    timestamps: true
});

SupervisorAssignJobSchema.statics.getAllJobList = function(usersID, searchText, skip, limit, sort) {
    return new Promise(function(resolve, reject) {
        var condition = { deleted: false,'jobs.deleted':false };
        if (searchText != undefined && searchText != 'undefined') {
            condition.$or = [
                { 'jobs.client': new RegExp(searchText, 'gi') }
            ];
        }

        if (usersID) {
            condition.job_assign_to = mongoose.Types.ObjectId(usersID);
        }

        //console.log('condition',condition); return false;
        SupervisorJob.aggregate([{
                    $lookup: {
                        from: "jobs",
                        localField: "job_id",
                        foreignField: "_id",
                        as: "jobs"
                    }
                },
                {$unwind: { path: "$jobs"}},
                { $match: condition }, {
                    $project: {
                        _id: 1,
                        job_assign_to: { _id: { $ifNull: ["$jobs._id", ""] }, job_id: { $ifNull: ["$jobs.job_id", ""] }, job_location: { $ifNull: ["$jobs.job_location", ""] }, start_date: { $ifNull: ["$jobs.start_date", ""] }, deleted: { $ifNull: ["$jobs.deleted", ""] }, billing_info: { $ifNull: ["$jobs.billing_info", ""] }, projected_end_date: { $ifNull: ["$jobs.projected_end_date", ""] }, actual_end_date: { $ifNull: ["$jobs.actual_end_date", ""] }, latitude: { $ifNull: ["$jobs.latitude", ""] }, longitude: { $ifNull: ["$jobs.longitude", ""] }, address: { $ifNull: ["$jobs.address", ""] }, job_unique_id: { $ifNull: ["$jobs.job_unique_id", ""] }, client: { $ifNull: ["$jobs.client", ""] }, description: { $ifNull: ["$jobs.description", ""] } },
                     
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


SupervisorAssignJobSchema.statics.getAllAssignSupervisor = function(obj) {
// console.log("supervisorLayer",obj);
    return new Promise(function(resolve, reject) {
    
        var condition = { deleted: false};
        if(obj.layer){
          condition.supervisor_layer = obj.layer
        }
        if (obj.jobId) {
            condition.job_id = mongoose.Types.ObjectId(obj.jobId);
        }
                        console.log("data cond", condition)

        SupervisorJob.aggregate([{
                    $lookup: {
                        from: "users",
                        localField: "job_assign_to",
                        foreignField: "_id",
                        as: "users"
                    }
                },
                {$unwind: { path: "$users"}},
                { $match: condition }, {
                    $project: {
                       job_assign_to: { _id: { $ifNull: [ "$users._id", "" ] },firstname: { $ifNull: [ "$users.firstname", "" ] }, lastname: { $ifNull: [ "$users.lastname", "" ] }},
                     
                    }
                }
            ],
            function(err, data) {
                // console.log("data is here><><><", data)
                if (err) {
                    reject(err);
                } else {
                    resolve(data);
                }
            });
    });

}
var SupervisorJob = mongoose.model('Supervisor_jobs', SupervisorAssignJobSchema);
module.exports = SupervisorJob;