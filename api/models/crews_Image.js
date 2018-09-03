var mongoose = require('mongoose'),
constantsObj = require('./../../constants');
var Schema = mongoose.Schema;

var CrewsImageSchema = new mongoose.Schema({
   crews_id :{type: mongoose.Schema.Types.ObjectId, ref: 'Foremen_crew'},
   image_name :{type:String},
   image_path :{type:String},
   deleted: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

var CrewsImage = mongoose.model('Crews_Image', CrewsImageSchema);
module.exports = CrewsImage;