'use strict';
var mongoose = require('mongoose'),
constantsObj = require('./../../constants');
var Schema = mongoose.Schema;

var AssignUpstreamDownstream = new mongoose.Schema({
    job_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Job'
    },
    supervisor_job_id:{
        type: Schema.Types.ObjectId,
        ref: 'Supervisor_jobs'
    },
    assigned_by:{
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
     submitted_by: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    }, //this is foreman id
     submitted_to: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    created_by : {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    is_upstream: {
        type: Boolean,
        default: false
    },
    status: {
        type: String,
        enum: ['Active', 'Accepted', 'Rejected','Complete','Pending'],
        default: 'Pending'
    },

}, {
    timestamps: true
   });



var AssignUpstreamDownstream = mongoose.model('AssignUpstreamDownstream', AssignUpstreamDownstream);
module.exports = AssignUpstreamDownstream;