'use strict';

var mongoose = require('mongoose'),
    User = mongoose.model('User'),
    ForemenCrew = mongoose.model('Foremen_crew'),
    crewImage = mongoose.model('Crews_Image'),
    Role = mongoose.model('Role'),
    Admin = mongoose.model('Admin'),
    Job = mongoose.model('Job'),
    Response = require('../lib/response.js'),
    formidable = require('formidable'),
    util = require('util'),
    fs = require('fs-extra'),
    fss = require('fs'),
    path = require('path'),
    utility = require('../lib/utility.js'),
    constantsObj = require('./../../constants'),
    config = require('../../config/config.js'),
    validator = require('validator'), 
    async = require('async'), 
    co = require('co'), 
    common = require('../../config/common.js');
var stripe = require("stripe")(config.STRIPEKEY);

module.exports = {
    getCrewList:getCrewList,
    addUpdateCrewsData: addUpdateCrewsData,
    getCrewById:getCrewById,
    deleteCrewsById:deleteCrewsById,
    addCrewsImages:addCrewsImages
};


/**
 * Function is use to get crew list
 * @access private
 * @return json
 * Created by Ashish
 * @smartData Enterprises (I) Ltd
 * Created Date 11-Jul-2017
 */
function getCrewList(req, res) {
    if(!req.body.parent_id){
         return res.json(Response(402, "failed", constantsObj.validationMessages.requiredFieldsMissing));
    }else{
    var count = req.body.count ? req.body.count : 0;
    var skip = req.body.count * (req.body.page - 1);
    var sorting = req.body.sorting ? req.body.sorting : { _id: -1 };
    var condition = { deleted: false, parent_id:  mongoose.Types.ObjectId(req.body.parent_id)};
    var searchText = decodeURIComponent(req.body.searchText).replace(/[[\]{}()*+?,\\^$|#\s]/g, "\\s+");
    if (req.body.searchText) {
        condition.$or = [{ 'firstname': new RegExp(searchText, 'gi') }, { 'lastname': new RegExp(searchText, 'gi') }, { 'email': new RegExp(searchText, 'gi') }];
    }
    for(let key in sorting) {
     sorting[key] = ((sorting[key] == '-1') ? -1: 1);   
    }
    co(function*() {
    let aggregate = [
            { $match: condition },
            {
                $project: {
                    firstname: 1,
                    lastname: 1,
                    email: 1,
                    status: 1
                   
                }
            }
        ]
        if (parseInt(skip) > 0) {
                aggregate.push({ $skip: parseInt(skip) });
        }
        if (parseInt(count) > 0) {
            aggregate.push({ $limit: parseInt(count) });
        }
        if (sorting) {
            aggregate.push({ $sort: sorting});
        }
        let crewData = yield ForemenCrew.aggregate(aggregate);
        async.each(crewData, function(item, callback) {
            crewImage.findOne({crews_id: item._id }).exec(function(err, crewsImageData) {
                if(crewsImageData){
                    item.crewsImage = crewsImageData;    
                }else{
                    item.crewsImage = {};  
                }
                
                callback();
            });
        }, function(err) {
            if(err){
               return res.json({ 'code': 400, status: 'failed'});
            }else{
               return res.json({ 'code': 200, status: 'success', "message": constantsObj.messages.dataRetrievedSuccess, "data": crewData});
            }
            
        });
    }).catch(function(err) {
        console.log(err);
        return res.json(Response(402, "failed", utility.validationErrorHandler(err), {}));
    });
  }
}

/**
 * Function is use to update user
 * @access private
 * @return json
 * Created by Ashish
 * @smartData Enterprises (I) Ltd
 * Created Date 14-Jul-2017
 */
function addUpdateCrewsData(req, res) {
    if (!req.body.firstname || !req.body.lastname) {
        return res.json(Response(402, "failed", constantsObj.validationMessages.requiredFieldsMissing));
    } else if (req.body.email && !validator.isEmail(req.body.email)) {
        return res.json(Response(402, "failed", constantsObj.validationMessages.invalidEmail));
    } else {
        ForemenCrew.findById(req.body._id).exec(function(err, userInfoData) {
            if (err) {
                return res.json(Response(500, "failed", constantsObj.validationMessages.internalError, err));
            } else {
                ForemenCrew.existCheck(req.body.email, ((userInfoData) ? userInfoData._id : ''), function(err, exist) {
                    if (err) {
                        return res.json(Response(500, "failed", constantsObj.validationMessages.internalError, err));
                    } else {
                        if (exist != true) {
                            return res.json(Response(402, "failed", exist));
                        } else {
                            var date = new Date();
                            var model = new ForemenCrew();
                            if (userInfoData) {
                                model = userInfoData;
                            }
                            if (!userInfoData) {
                                model.parent_id = req.body.parent_id;

                            }
                            model.firstname = req.body.firstname;
                            model.lastname = req.body.lastname;
                            model.email = req.body.email;
                            model.save(function(err, userData) {
                                if (err) {
                                    return res.json(Response(500, "failed", utility.validationErrorHandler(err), {}));
                                } else {
                                    return res.json(Response(200, "success", ((userInfoData) ? constantsObj.messages.crewUpdatedSuccess : constantsObj.messages.crewAddedSuccess), {_id: userData.parent_id,crew_id: userData._id}));
                                }
                            });   
                        }
                    }
                });
            }
        });
    }
}

/**
 * Function is use to get Crews by id
 * @access private
 * @return json
 * Created by Udit
 * @smartData Enterprises (I) Ltd
 * Created Date 27-Jan-2017
 */
function getCrewById(req, res) {
    var id = req.swagger.params.id.value;
    ForemenCrew.findOne({_id: id}, 'firstname lastname email')
    .lean()
    .exec(function(err, data) {
        if (err) {
            return res.json(Response(500, "failed", constantsObj.validationMessages.internalError, err));
        } else {
            if (data) {
              if (data.profile_image) {
                    var split = data.profile_image.split('assets/uploads/');
                    utility.fileExistCheck('./public/assets/uploads/'+split[1], function(exist) {
                        if (!exist) {
                              data.profile_image = 'assets/images/default-image.png';  
                        }
                        return res.json({ 'code': 200, status: 'success', "message": constantsObj.messages.dataRetrievedSuccess, "data": data });
                    });
                } else {
                    return res.json({ 'code': 200, status: 'success', "message": constantsObj.messages.dataRetrievedSuccess, "data": data });        
                }
            } else {
                return res.json(Response(402, "failed", constantsObj.validationMessages.userNotFound, {}));
            }
        }
    });
}


/**
 * Function is use to delete Crew by id
 * @access private
 * @return json
 * Created by Udit
 * @smartData Enterprises (I) Ltd
 * Created Date 27-Jan-2017
 */
function deleteCrewsById(req, res) {
    var id = req.swagger.params.id.value;
    ForemenCrew.findById(id).exec(function(err, data) {
        if (err) {
            return res.json(Response(500, "failed", constantsObj.validationMessages.internalError, err));
        } else {
            if (!data) {
                return res.json(Response(402, "failed", constantsObj.validationMessages.userNotFound, {}));
            } else {
                data.deleted = true;
                data.save(function(err, userData) {
                    if (err)
                        return res.json(Response(500, "failed", constantsObj.validationMessages.internalError, err));
                    else {
                        return res.json({ 'code': 200, status: 'success', "message": constantsObj.messages.crewDeleteSuccess, "data": {} });
                    }
                });
            }
        }
    })
}

/**
 * Function is use to add crews image
 * @access private
 * @return json
 * Created by rahul tiwari
 * @smartData Enterprises (I) Ltd
 * Created Date 17-Aug-2017
 */
function addCrewsImages(req, res) {
    if (!req.swagger.params.id.value) {
        return res.json(Response(402, "failed", constantsObj.validationMessages.requiredFieldsMissing));
    } else {
        co(function*() {
            var timestamp = Number(new Date()); // current time as number
            var form = new formidable.IncomingForm();
            var file = req.swagger.params.file.value;
            var incidentId = req.swagger.params.id.value;
            var splitFile = file.originalname.split('.');
            var filename = +timestamp + '_' + common.randomToken(6) + '.' + ((splitFile.length > 0) ? splitFile[splitFile.length - 1] : file.originalname);
            var imagePath = "./public/assets/uploads/crews/" + filename;
            crewImage.find({ "crews_id": req.body.id }, function(err, crewsImageData) {
               
                if (err) {
                    res.json({ code: 402, 'message': 'Request could not be processed. Please try again.', data: err });
                } else {
                    if (crewsImageData.length > 0) {
                 
                        async.each(crewsImageData, function(imageData, callback) {
                            var filePath = __dirname + '/../../public/' + imageData.image_path;
                             fss.unlinkSync(filePath);

                                imageData.crews_id = req.body.id;
                                imageData.image_name = file.originalname;
                                imageData.image_path = "assets/uploads/crews/" + filename;
                            
                            imageData.save(function(err, CrewsImages) {
                                if (err) {
                                    return res.json(Response(500, "failed", constantsObj.validationMessages.internalError, {}));
                                }else{
                                    fs.writeFile(path.resolve(imagePath), file.buffer, function(err) {
                                        callback()
                                    })

                                }
                            });

                        },function(err) {

                            if (err) {
                                return res.json(Response(500, "failed", constantsObj.validationMessages.internalError, {}));
                            } else {
                                return res.json({ code: 200, 'message': 'Crews image update successfully.'});
                            }
                        });

                    }else{

                        fs.writeFile(path.resolve(imagePath), file.buffer, function(err) {
                            if (err) {

                                res.json({ code: 402, 'message': 'Request could not be processed. Please try again.', data: err });
                            } else {
                                var CrewImage = {
                                    crews_id: req.body.id,
                                    image_name: file.originalname,
                                    image_path: "assets/uploads/crews/" + filename
                                };
                                var crewsImages = new crewImage(CrewImage);

                                crewsImages.save(function(err, CrewsImage) {
                                    if (err) {
                                        return res.json(Response(500, "failed", constantsObj.validationMessages.internalError, {}));
                                    } else {
                                        return res.json({ code: 200, 'message': 'Crews image added successfully.', data: CrewsImage });
                                    }
                                });
                            }
                        });
                    }
                }

            });
        }).catch(function(err) {
            console.log(err);
            res.json({ code: 402, 'message': 'Request could not be processed. Please try again.', data: {} });
        });

    }
}