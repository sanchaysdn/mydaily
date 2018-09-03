'use strict';

var mongoose = require('mongoose'),
constantsObj = require('./../../constants');
var Schema = mongoose.Schema;

var SubscribeAmountSchema = new mongoose.Schema({
    users_id:{type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    charge_id: { type: String },
    amount: { type: String },
    payment_date: { type: Date},
    currency: { type: String},
    status: { type: String},
    deleted: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

var SubscribeAmount = mongoose.model('Subscribe_amount', SubscribeAmountSchema);
module.exports = SubscribeAmount;
    