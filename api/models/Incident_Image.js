var mongoose = require('mongoose'),
constantsObj = require('./../../constants');
var Schema = mongoose.Schema;

var IncidentImageSchema = new mongoose.Schema({
   incident_id :{type: mongoose.Schema.Types.ObjectId, ref: 'Incident'}, //this is incident id
   image_name :{type:String},
   image_path :{type:String},
   deleted: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

var IncidentImage = mongoose.model('Incident_Image', IncidentImageSchema);
module.exports = IncidentImage;