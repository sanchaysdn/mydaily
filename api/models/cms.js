'use strict';
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var cmsSchema = new mongoose.Schema({
    title: { type: String, required: [true, 'Title is required'], maxlength: [200, 'Title length should be less than or equal to 200 character'] },
    description: { type: String, required: [true, 'Description is required'] },
    name: { type: String, required: [true, 'Name is required'] },
    status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
    deleted: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

var CMS = mongoose.model('cms', cmsSchema);
module.exports = CMS;
CMS.find({}).exec(function(err, data) {
    if (data.length == 0) { 
        CMS({ title: 'Term & Condition', description: 'Term & Condition', name: 'terms-and-condition'}).save();
        CMS({ title: 'Privacy', description: 'Privacy', name: 'privacy'}).save();
        CMS({ title: 'Help Center', description: 'Help Center', name: 'help-center'}).save();
    }
});