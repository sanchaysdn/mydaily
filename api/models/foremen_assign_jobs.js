'use strict';

var mongoose = require('mongoose'),
        constantsObj = require('./../../constants');
var Schema = mongoose.Schema;

var ForemenAssignJobSchema = new mongoose.Schema({
    job_created_by: {type: mongoose.Schema.Types.ObjectId, ref: 'User'}, // Newly Added Field Contractor ID
    job_assign_by: {type: mongoose.Schema.Types.ObjectId, ref: 'User'}, // Supervisor ID
    job_assign_to: {type: mongoose.Schema.Types.ObjectId, ref: 'User'}, // Foremen ID
    job_id: {type: mongoose.Schema.Types.ObjectId, ref: 'Job'},
    status: {
        type: String,
        default: 1
    }, // 1-Activate, 2- Deactivate, 3- Sold
    foreman_layer : {
        type: Number, enum: [1,2], default: 1, required: false  // 1 =>up stream foreman , 2=> down stream foreman
    },


    deleted: {
        type: Boolean,
        default: false
    } // True= Deleted, False= Not Deleted
}, {
    timestamps: true
});


ForemenAssignJobSchema.statics.getAllAssignJobList = function(usersID,jobStatus, searchText, skip, limit, sort) {
    return new Promise(function(resolve, reject) {
        var condition = { deleted: false ,'jobs.status': jobStatus,'jobs.deleted': false};
        if (searchText != undefined && searchText != 'undefined') {
            condition.$or = [
                { 'jobs.client': new RegExp(searchText, 'gi') }
            ];
        }

        if (usersID) {
            condition.job_assign_to =  mongoose.Types.ObjectId(usersID)
        }
        //console.log('condition',condition); return false;
        ForemenAssignJob.aggregate([{
                    $lookup: {
                        from: "jobs",
                        localField: "job_id",
                        foreignField: "_id",
                        as: "jobs"
                    }
                },
                {$unwind: { path: "$jobs", preserveNullAndEmptyArrays: true }},
                { $match: condition }, {
                    $project: {
                        _id: 1, job_assign_to: 1,
                         job_detail: { _id: '$jobs._id', job_id: '$jobs.job_id', job_location: '$jobs.job_location', start_date: '$jobs.start_date', deleted: '$jobs.deleted', billing_info: '$jobs.billing_info',projected_end_date: '$jobs.projected_end_date',actual_end_date: '$jobs.actual_end_date',latitude: '$jobs.latitude',longitude: '$jobs.longitude',address: '$jobs.address',job_unique_id: '$jobs.job_unique_id',client: '$jobs.client',description: '$jobs.description',daily_sumbission_report: { $ifNull: ["$jobs.daily_sumbission_report", ""] }},
                     
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
var ForemenAssignJob = mongoose.model('Foremen_assign_jobs', ForemenAssignJobSchema);
module.exports = ForemenAssignJob;