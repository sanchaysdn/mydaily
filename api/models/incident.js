'use strict';

var mongoose = require('mongoose'),
    constantsObj = require('./../../constants');
var Schema = mongoose.Schema;

var IncidentSchema = new mongoose.Schema({
    job_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Job'
    },
    user_id: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    }, //this is foreman id
    supervisor_id: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    sub_job: { type: Schema.Types.ObjectId, ref: 'Subjob' },
    parent_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }, //this is contractor ID
    damage_Report: {
        type: String
    },
    own_It: {
        type: String
    },
    latitude: {
        type: String
    },
    longitude: {
        type: String,

    },
       geo_loc: {
        type: [Number],
        index: "2dsphere"
    }, //geoJSON type object

    ticket_No: {
        type: String
    },
    address: {
        type: String
    },
    fault: {
        type: String
    },
    incident_number: {
        type: String
    },
    mark_Was_It: {
        type: String
    },
    did_It_Happen: {
        type: Date
    },
    description: {
        type: String
    },

    is_draft: {
        type: Boolean,
        default: false
    }, // True= is drafts, False= not allow
    status: {
        type: String,
        enum: ['Activate', 'Deactivate'],
        default: 'Deactivate'
    },

    deleted: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});
IncidentSchema.statics.existCheck = function (incident_AddedBy, jobid, id, callback) {

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
                incident_AddedBy: new RegExp('^' + incident_AddedBy + '$', "i")
            }],
            deleted: {
                $ne: true
            }
        };
    }
    Incident.findOne(where, function (err, incidentData) {

        if (err) {
            callback(err)
        } else {
            if (incidentData) {

                callback(null, constantsObj.validationMessages.incidentAlreadyExist);
            } else {

                callback(null, true);
            }
        }
    });
};

var Incident = mongoose.model('Incident', IncidentSchema);
module.exports = Incident;