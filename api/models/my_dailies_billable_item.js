'use strict';
var mongoose = require('mongoose'),
  constantsObj = require('./../../constants');
var Schema = mongoose.Schema;

var myDailiesBillableItemsSchema = new mongoose.Schema({
    my_dailies_id: {type: mongoose.Schema.Types.ObjectId, ref: 'My_dailies'},
    name: { type: String},
    description: { type: String },
    quantity : { type: String },
    // status: {
    //     type: String,
    //     default: 1
    // }, // 1-Activate, 2- Deactivate, 3- Sold
    deleted: {
        type: Boolean,
        default: false
    } // True= Deleted, False= Not Deleted
}, {
    timestamps: true
});


  myDailiesBillableItemsSchema.statics.existCheck = function(name, id, callback) {
    var where = {};
    if (id) {
        where = {
            $or: [ { name: new RegExp('^' + name + '$', "i") }], deleted: { $ne: true }, _id: { $ne: id }};
    } else {
        where = {$or: [ { name: new RegExp('^' + name + '$', "i") }], deleted: { $ne: true }};
    }
    myDailiesBillableItem.findOne(where, function(err, userdata) {
        if (err) {
            callback(err)
        } else {
            if (userdata) {
                callback(null, constantsObj.validationMessages.MyDailiesItemAlreadyExist);
            } else {
                callback(null, true);
            }
        }
    });
}; 

var myDailiesBillableItem = mongoose.model('myDailies_Billable_item', myDailiesBillableItemsSchema);
module.exports = myDailiesBillableItem;