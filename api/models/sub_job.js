'use strict';
var mongoose = require('mongoose'),
constantsObj = require('./../../constants');
var Schema = mongoose.Schema;

var SubJobSchema = new mongoose.Schema({
    JobRefrence: { type: Schema.Types.ObjectId, ref: 'Job' },
    subJob : String,
    deleted: {
        type: Boolean,
        default: false
    } // True= Deleted, False= Not Deleted
}, {
    timestamps: true
});


var SubJob = mongoose.model('SubJob', SubJobSchema);
module.exports = SubJob;