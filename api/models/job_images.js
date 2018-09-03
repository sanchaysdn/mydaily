'use strict';

var mongoose = require('mongoose');

var ProductImageSchema = new mongoose.Schema({
    product_id: {type: mongoose.Schema.Types.ObjectId, ref: 'Product'},
    product_image:{type: String},
    deleted: {
        type: Boolean,
        default: false
    }  // True= Deleted, False= Not Deleted
}, {
    timestamps: true
});

var ProductImage = mongoose.model('Product_image', ProductImageSchema);
module.exports = ProductImage;