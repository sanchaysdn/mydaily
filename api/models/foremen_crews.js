'use strict';

var mongoose = require('mongoose'),
        constantsObj = require('./../../constants');
var Schema = mongoose.Schema;

var ForemenCrewsSchema = new mongoose.Schema({
    firstname: { type: String, required: [true, 'First name is required'], maxlength: [50, 'First name length should be less than or equal to 50 character'] },
    lastname: { type: String, required: [true, 'Last name is required'], maxlength: [50, 'Last name length should be less than or equal to 50 character'] },
    email: { type: String, maxlength: [50, 'Email length should be less than or equal to 50 character'] },
    parent_id: {type: mongoose.Schema.Types.ObjectId, ref: 'User'}, // Foremen ID
    status: { type: String, enum: ['Activate', 'Deactivate'], default: 'Activate' },
    profile_image: { type: String},
    deleted: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

ForemenCrewsSchema.statics.existCheck = function(email, id, callback) {
    var where = {};
    if (id) {
        where = {
            $or: [ { email: new RegExp('^' + email + '$', "i") }], deleted: { $ne: true }, _id: { $ne: id }};
    } else {
        where = {$or: [ { email: new RegExp('^' + email + '$', "i") }], deleted: { $ne: true }};
    }
    ForemenCrew.findOne(where, function(err, userdata) {
        if (err) {
            callback(err)
        } else {
            if (userdata) {
                callback(null, constantsObj.validationMessages.emailAlreadyExist);
            } else {
                callback(null, true);
            }
        }
    });
};
var ForemenCrew = mongoose.model('Foremen_crew', ForemenCrewsSchema);
module.exports = ForemenCrew;