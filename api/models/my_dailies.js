'use strict';
var mongoose = require('mongoose'),

    constantsObj = require('./../../constants');

var Schema = mongoose.Schema;

var MyDailiesSchema = new mongoose.Schema({
    daily_number: {
        type: String
    },
    job_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Job'
    },
    crews_id: {
        type: Schema.Types.ObjectId,
        ref: 'Foremen_crew'
    },
    sub_job: { type: Schema.Types.ObjectId, ref: 'Subjob' },
    user_id: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    }, //this is foreman ID
    supervisor_id: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    up_stream_supervisor_id: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    last_action: {
        type: Schema.Types.ObjectId,
        ref: 'User'   //*****foremen/Supervisor ID *******//
    },
    current_action: {
     type: Schema.Types.ObjectId
    },               //****foremen/SuperVisor Id *****////
    parent_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }, //this is contractor ID
    job_na: {
        type: String
    },
    job_map: {
        type: String
    },
    job_location: {
        type: String
    },
    dailies_location: {
        type: String
    },
    latitude: {
        type: String
    },
    longitude: {
        type: String
    },
    is_valid_superVisor:{
      default: false
    },
    job_layer: {
        type: Number, enum: [1,2], default: 1, required: false   //1 Upstream     2 Downstream
    },
    foreman_layer: {
        type: Number, enum: [1,2], default: 1, required: false   //1 Upstream     2 Downstream
    },
    supervisor_layer: {
        type: Number, enum: [1,2], default: 1, required: false   //1 Upstream     2 Downstream
    },
    geo_loc: {
        type: [Number],
        index: "2dsphere"
    }, //geoJSON type object
    from_date: {
        type: Date,
        default: Date.now
    },
    to_date: {
        type: Date,
        default: Date.now
    },
    no_production: {
        type: Boolean
    },
    notes: {
        type: String
    },
    reject_notes: {
        type: String
    },
    is_draft: {
        type: Boolean,
        default: false
    }, // True= is drafts, False= not allow
    status: {
        type: String
    }, //Active,Accepted,Rejected
    status_by_supervisor :{
        type: String,
        default: 'Pending'
    },//true,Pending,Active,Accepted,Rejected
    deleted: {
        type: Boolean,
        default: false
    }, // True= Active, False= Reject
    is_archive: {
         type: Boolean,
         default: false 
    },
    rejected_by: {
       type: Schema.Types.ObjectId,
       ref: 'User'
    },
    reject_Notes2: {
        type: String
    }

}, {
    timestamps: true
});

MyDailiesSchema.statics.existCheck = function (job_na, jobid, id, callback) {
    var where = {};
    if (id) {
        where = {
            $or: [{
                id: new RegExp('^' + id + '$', "i")
            }],
            deleted: {
                $ne: true
            },
            _id: {
                $ne: id
            }
        };
    } else {
        where = {
            $or: [{
                job_na: new RegExp('^' + job_na + '$', "i")
            }],
            deleted: {
                $ne: true
            }
        };
    }
    MyDailies.findOne(where, function (err, dailiesData) {

        if (err) {
            callback(err)
        } else {
            if (dailiesData) {

                callback(null, constantsObj.validationMessages.dailiesAlreadyExist);
            } else {

                callback(null, true);
            }
        }
    });
};

MyDailiesSchema.statics.getAllMyDailies = function (searchText, skip, limit, sort) {
    return new Promise(function (resolve, reject) {
        var condition = {
            deleted: false
        };
        if (searchText != undefined && searchText != 'undefined') {
            condition.$or = [{
                'jobs.clientp': new RegExp(searchText, 'gi')
            }];
        }

        /*if (usersID) {
            condition.job_assign_to = mongoose.Types.ObjectId(usersID);
        }*/

        //console.log('condition',condition); return false;
        MyDailies.aggregate([{
                    $lookup: {
                        from: "jobs",
                        localField: "job_id",
                        foreignField: "_id",
                        as: "jobs"
                    }
                },
                {
                    $unwind: {
                        path: "$jobs"
                    }
                },
                {
                    $match: condition
                }, {
                    $project: {
                        _id: 1,
                        no_production: 1,
                        notes: 1,
                        work_date: {
                            $ifNull: ["$work_date", ""]
                        },
                        status: {
                            $ifNull: ["$status", ""]
                        },
                        job_na: {
                            $ifNull: ["$job_na", ""]
                        },
                        job_map: {
                            $ifNull: ["$job_map", ""]
                        },
                        job_location: {
                            $ifNull: ["$job_location", ""]
                        },
                        latitude: {
                            $ifNull: ["$latitude", ""]
                        },
                        longitude: {
                            $ifNull: ["$longitude", ""]
                        },
                        job_detail: {
                            _id: {
                                $ifNull: ["$jobs._id", ""]
                            },
                            job_id: {
                                $ifNull: ["$jobs.job_id", ""]
                            },
                            client: {
                                $ifNull: ["$jobs.client", ""]
                            }
                        },

                    }
                },
                {
                    $sort: sort
                },
                {
                    $skip: skip
                },
                {
                    "$limit": limit
                },
            ],
            function (err, data) {
                if (err) {
                    reject(err);
                } else {
                    resolve(data);
                }
            });
    });
};
var MyDailies = mongoose.model('My_dailies', MyDailiesSchema);
module.exports = MyDailies;