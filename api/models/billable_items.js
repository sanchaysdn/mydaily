'use strict';
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var BillableItemsSchema = new mongoose.Schema({
    name: { type: String},
    description: { type: String },
    user_id : { type: String },
    popup_flag:{type: Boolean,default:false},
    status: {
        type: String,
        default: 1
    }, // 1-Activate, 2- Deactivate, 3- Sold
    deleted: {
        type: Boolean,
        default: false
    } // True= Deleted, False= Not Deleted
}, {
    timestamps: true
});


   

BillableItemsSchema.statics.getAllBillableItem = function(userId,searchText, skip, limit, sort) {
    return new Promise(function(resolve, reject) {
        var condition = { deleted: false , user_id : userId};
        if (searchText != undefined && searchText != 'undefined') {
            condition.$or = [
                { 'name': new RegExp(searchText, 'gi') }
            ];
        }
        BillableItem.aggregate([
                { $match: condition }, {
                    $project: {
                        _id: 1,
                        name: 1,
                        description:1,
                        status:1
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


BillableItemsSchema.statics.getAllBillableCount = function(userId,searchText) {
    return new Promise(function(resolve, reject) {
        var condition = { deleted: false , user_id : userId};
        if (searchText != undefined && searchText != 'undefined') {
            condition.$or = [
                { 'name': new RegExp(searchText, 'gi') }
            ];
        }
        BillableItem.aggregate([
                  { $match: condition },
                  { $group: { _id: null, count: { $sum: 1 } } } 

            ],
            function(err, data) {
                if (err) {
                    reject(err);
                } else {
                    var cnt = (data[0]) ? data[0].count : 0;
                    resolve(cnt);
                }
            });
    });
};
var BillableItem = mongoose.model('Billable_item', BillableItemsSchema);
module.exports = BillableItem;