'use strict';

var mongoose = require('mongoose'),
        constantsObj = require('./../../constants');
var Schema = mongoose.Schema;

var ForemenAssignSchema = new mongoose.Schema({
    supervisor_id: { type: String, required: [true, 'First name is required'], maxlength: [50, 'First name length should be less than or equal to 50 character'] },
    foremen_id: { type: String, required: [true, 'Last name is required'], maxlength: [50, 'Last name length should be less than or equal to 50 character'] },
    email: { type: String, required: [true, 'Email name is required'], maxlength: [50, 'Email length should be less than or equal to 50 character'] },
    parent_id: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    status: { type: String, enum: ['Activate', 'Deactivate'], default: 'Deactivate' },
    deleted: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});
var ForemenAssign = mongoose.model('Foremen_crew', ForemenAssignSchema);
module.exports = ForemenAssign;