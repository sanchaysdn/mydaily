'use strict';

var mongoose = require('mongoose'),
constantsObj = require('./../../constants');
var Schema = mongoose.Schema;

var SubscriptionSchema = new mongoose.Schema({
    name: { type: String},
    feature: { type: String},
    amount: { type: String},
    //parent_id: {type: mongoose.Schema.Types.ObjectId, ref: 'User'}, // Foremen ID
    status: { type: String, enum: ['Activate', 'Deactivate'], default: 'Deactivate' },
    
    deleted: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

SubscriptionSchema.statics.existCheck = function(name,id, callback) {
   var where = {};
    if (id) {
        where = {
            $or: [ { name: new RegExp('^' + name + '$', "i") }], deleted: { $ne: true }, _id: { $ne: id }};
    } else {
        where = {$or: [ { name: new RegExp('^' + name + '$', "i") }], deleted: { $ne: true }};
    }
    Subscription.findOne(where, function(err, userdata) {
        console.log("userdata",userdata)
        if (err) {
            callback(err)
        } else {
            if (userdata) {
                callback(null, constantsObj.validationMessages.subscriptionAlreadyExist);
            } else {
                callback(null, true);
            }
        }
    });
};
var Subscription = mongoose.model('Subscription', SubscriptionSchema);
module.exports = Subscription;