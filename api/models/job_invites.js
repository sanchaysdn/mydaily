'use strict';

var mongoose = require('mongoose'),
        constantsObj = require('./../../constants');
var Schema = mongoose.Schema;

var JobInvitesSchema = new mongoose.Schema({
    invities_assign_by: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    invities_assign_to: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    job_id: {type: mongoose.Schema.Types.ObjectId, ref: 'Job'},
    merge_status: {
        type: Boolean,
        default: false
    },// 1-Yes, 2- No
    status: {
        type: String,
        default: 'Pending'
    }, // 1-Accept, 2- Pending , 3- Reject
    deleted: {
        type: Boolean,
        default: false
    } // True= Deleted, False= Not Deleted
}, {
    timestamps: true
});


JobInvitesSchema.statics.getAllInvitesList = function(usersID, jobId, searchText, skip, limit, sort) {
    return new Promise(function(resolve, reject) {
        var condition = {deleted: false, 'users.deleted': false,'users.status':'Activate'};
        if (searchText != undefined && searchText != 'undefined') {
            condition.$or = [
                { 'job.client': new RegExp(searchText, 'gi') },
                { 'users.firstname': new RegExp(searchText, 'gi') },
                { 'users.lastname': new RegExp(searchText, 'gi') }
            ];
        }

        if (usersID) {
            condition.invities_assign_by = mongoose.Types.ObjectId(usersID);
           
        }
        if(jobId){
            condition.invities_assign_by = mongoose.Types.ObjectId(usersID);
            condition.job_id =  mongoose.Types.ObjectId(jobId); 
        }

        JobInvites.aggregate([{
                    $lookup: {
                        from: "users",
                        localField: "invities_assign_to",
                        foreignField: "_id",
                        as: "users"
                    }
                },
                {$unwind: { path: "$users", preserveNullAndEmptyArrays: true }},
                {
                    $lookup: {
                        from: "jobs",
                        localField: "job_id",
                        foreignField: "_id",
                        as: "job"
                    }
                },
                {$unwind: { path: "$job", preserveNullAndEmptyArrays: true }},
                { $match: condition }, {
                    $project: {
                        _id: 1,
                        merge_status :1,
                        status:1,
                        invites_assign_to: { _id: '$users._id', firstname: '$users.firstname', lastname: '$users.lastname', deleted: '$users.deleted',status: '$users.status'},
                        job_details: { _id: '$job._id', job_id: '$job.job_id', client: '$job.client'},
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

JobInvitesSchema.statics.getAllAssignInvitesList = function(usersID, searchText, skip, limit, sort) {
    console.log(" usersID, searchText, skip, limit, sort  :-",usersID, searchText, skip, limit, sort)
    return new Promise(function(resolve, reject) {
        var condition = {deleted: false,'users.deleted': false,'users.status':'Activate',status: 'Pending'};
        if (searchText != undefined && searchText != 'undefined') {
            condition.$or = [
                { 'job.client': new RegExp(searchText, 'gi') },
                { 'users.firstname': new RegExp(searchText, 'gi') },
                { 'users.lastname': new RegExp(searchText, 'gi') }
            ];
        }

        if (usersID) {
            condition.invities_assign_to = mongoose.Types.ObjectId(usersID);
        }

        JobInvites.aggregate([{
                    $lookup: {
                        from: "users",
                        localField: "invities_assign_by",
                        foreignField: "_id",
                        as: "users"
                    }
                },
                {$unwind: { path: "$users", preserveNullAndEmptyArrays: true }},
                {
                    $lookup: {
                        from: "jobs",
                        localField: "job_id",
                        foreignField: "_id",
                        as: "job"
                    }
                },
                {$unwind: { path: "$job", preserveNullAndEmptyArrays: true }},
                { $match: condition }, {
                    $project: {
                        _id: 1,
                        merge_status :1,
                        status:1,
                        invites_assign_by: { _id: '$users._id', firstname: '$users.firstname', lastname: '$users.lastname', deleted: '$users.deleted',status: '$users.status'},
                        job_details: { _id: '$job._id', job_id: '$job.job_id', client: '$job.client',start_date: '$job.start_date',billing_info: '$job.billing_info',job_unique_id: '$job.job_unique_id',actual_end_date: '$job.actual_end_date',projected_end_date: '$job.projected_end_date'},
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


var JobInvites = mongoose.model('Job_invites', JobInvitesSchema);
module.exports = JobInvites;