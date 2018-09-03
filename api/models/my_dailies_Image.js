var mongoose = require('mongoose'),
constantsObj = require('./../../constants');
var Schema = mongoose.Schema;

var DailiesImageSchema = new mongoose.Schema({
   mydailies_id :{type: mongoose.Schema.Types.ObjectId, ref: 'My_dailies'},
   image_name :{type:String},
   image_path :{type:String},
   deleted: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

var DailiesImage = mongoose.model('Dailies_Image', DailiesImageSchema);
module.exports = DailiesImage;