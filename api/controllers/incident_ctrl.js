// import {
//     func
// } from '../../../../../../../.cache/typescript/2.6/node_modules/@types/joi';

'use strict';

var mongoose = require('mongoose'),
    Job = mongoose.model('Job'),
    User = mongoose.model('User'),

    incidentschema = mongoose.model('Incident'),
    incidentImageschema = mongoose.model('Incident_Image'),
    formidable = require('formidable'),
    constantsObj = require('./../../constants'),
    Response = require('../lib/response.js'),
    util = require('util'),
    fs = require('fs-extra'),
    fss = require('fs'),
    path = require('path'),
    async = require('async'),
    randomstring = require("randomstring"),
    validator = require('validator'),
    moment = require('moment'),
    _ = require('underscore'),
    common = require('../../config/common.js'),
    utility = require('../lib/utility.js'),
    // stripeLib = require('../lib/stripe.js'),
    co = require('co'),
    scheduler = require('../lib/schedule.js'),
    config = require('../../config/config.js'),
    pdf = require('html-pdf');


module.exports = {
    getIncidentList: getIncidentList,
    addUpdateincident: addUpdateincident,
    deleteIncidentId: deleteIncidentId,
    getIncidentImage: getIncidentImage,
    getIncidentById: getIncidentById,
    addIncidentImages: addIncidentImages,
    getIncidentListByAdmin: getIncidentListByAdmin,
    downloadIncidentPdf: downloadIncidentPdf,
    updateIncidentStatus: updateIncidentStatus,
    saveViewEditIncident: saveViewEditIncident,
    getIncidentByDate: getIncidentByDate
}

/**
 * Function is use to get subscription list
 * @access private
 * @return json
 * Created by Rahul
 * @smartData Enterprises (I) Ltd
 * Created Date 10-Aug-2017
 */

function getIncidentList(req, res) {
    if (!req.body.user_id) {
        return res.json(Response(402, "failed", constantsObj.validationMessages.requiredFieldsMissing));
    } else {
        var count = req.body.count ? req.body.count : 0;
        var skip = req.body.count * (req.body.page - 1);
        var sorting = req.body.sorting ? req.body.sorting : {
            _id: -1
        };
        var condition = {
            deleted: false,
            "user_id": mongoose.Types.ObjectId(req.body.user_id)
        };
        var searchText = decodeURIComponent(req.body.searchText).replace(/[[\]{}()*+?,\\^$|#\s]/g, "\\s+");
        if (req.body.searchText) {
            condition.$or = [{
                    'ticket_No': new RegExp(searchText, 'gi')
                }, {
                    'address': new RegExp(searchText, 'gi')
                },
                {
                    'incident_number': new RegExp(searchText, 'gi')
                },
            ];
        }

        for (let key in sorting) {
            sorting[key] = ((sorting[key] == '-1') ? -1 : 1);
        }
        co(function* () {
            let aggregate = [{
                    $lookup: {
                        from: "jobs",
                        localField: "job_id",
                        foreignField: "_id",
                        as: "job"
                    }
                },
                {
                    $unwind: {
                        path: "$job",
                        preserveNullAndEmptyArrays: true
                    }
                },
            {
                $lookup: {
                    from: "subjobs",
                    localField: "sub_job",
                    foreignField: "_id",
                    as: "subjob"
                }
            },
            {
                $unwind: {
                    path: "$subjob",
                    preserveNullAndEmptyArrays: true
                }
            },

                {
                    $match: condition
                },
                {
                    $project: {
                        damage_Report: 1,
                        own_It: 1,
                        ticket_No: 1,
                        address: 1,
                        fault: 1,
                        mark_Was_It: 1,
                        did_It_Happen: 1,
                        description: 1,
                        is_draft: 1,
                        incident_number: 1,
                        job_details: {
                            _id: '$job._id',
                            job_id: '$job.job_id',
                            client: '$job.client'
                        },

                        crews_details: {
                            _id: '$crews._id',
                            firstname: '$crews.firstname',
                            lastname: '$crews.lastname'
                        },
                        foremen_details: {
                            _id: '$foreman._id',
                            firstname: '$foreman.firstname',
                            lastname: '$foreman.lastname'
                        },
                        supervisor_details: {
                            _id: '$supervisor._id',
                            firstname: '$supervisor.firstname',
                            lastname: '$supervisor.lastname'
                        },
                         subjob_details: {
                          _id: '$subjob._id',
                        subJob: '$subjob.subJob',
                 
                    },

                    }
                }
            ]
            if (parseInt(skip) > 0) {
                aggregate.push({
                    $skip: parseInt(skip)
                });
            }
            if (parseInt(count) > 0) {
                aggregate.push({
                    $limit: parseInt(count)
                });
            }
            if (sorting) {
                aggregate.push({
                    $sort: sorting
                });
            }
            let incidentData = yield incidentschema.aggregate(aggregate);

            async.each(incidentData, function (item, callback) { 
        if(item.subjob_details){
                    item.subjob_details
                }else{
                    item.subjob_details={
                        _id:'',
                        subJob:''
                    };
                }         
                // console.log("item>>>>",item) 
                incidentImageschema.find({
                    incident_id: item._id
                }).exec(function (err, incidentInfoData) {
                    item.incident_image = incidentInfoData;
                    callback();
                });

            }, function (err) {
                if (err) {
                    return res.json(Response(500, "failed", constantsObj.validationMessages.internalError, {}));
                } else {
                    return res.json({
                        'code': 200,
                        status: 'success',
                        "message": constantsObj.messages.dataRetrievedSuccess,
                        "data": incidentData
                    });
                }

            });

        }).catch(function (err) {

            return res.json(Response(402, "failed", utility.validationErrorHandler(err), {}));
        });
    }
}

function addUpdateincident(req, res) {
    console.log("req.body>>>>",req.body);
    if (!req.body.job_id) {
        return res.json(Response(402, "failed", constantsObj.validationMessages.requiredFieldsMissing));
    } else {
        incidentschema.findById(req.body._id).exec(function (err, incidentInfoData) {
            if (err) {
                return res.json(Response(500, "failed", constantsObj.validationMessages.internalError, err));
            } else {
                incidentschema.existCheck(req.body.incident_AddedBy, req.body.job_id, ((incidentInfoData) ? incidentInfoData._id : ''), function (err, exist) {

                    if (err) {
                        return res.json(Response(500, "failed", constantsObj.validationMessages.internalError, err));
                    } else {
                        if (exist != true) {
                            return res.json(Response(402, "failed", exist));
                        } else {
                            incidentschema.count().exec(function (err, countInfoData) {
                                var date = new Date();
                                var model = new incidentschema();
                                if (incidentInfoData) {
                                    model = incidentInfoData;
                                }
                                if (!incidentInfoData) {
                                    model.incident_number = (parseInt(countInfoData) + 1);
                                }

                                model.job_id = req.body.job_id;
                                if(req.body.subjob_id !='')
                                model.sub_job = req.body.subjob_id;  
                            // model.sub_job = req.body.subjob_id
                                model.incident_AddedBy = req.body.incident_AddedBy;
                                model.damage_Report = req.body.damage_Report;
                                model.own_It = req.body.own_It;
                                model.parent_id = req.body.parent_id;
                                model.user_id = req.body.user_id;
                                model.crews_id = req.body.crews_id;
                                model.supervisor_id = req.body.supervisor_id;
                                model.ticket_No = req.body.ticket_No;
                                model.address = req.body.address;
                                model.fault = req.body.fault;
                                model.geo_loc = [req.body.latitude ? req.body.latitude : '48.8589507', req.body.longitude ? req.body.longitude : '2.2770201']; //add geoJSON
                                model.longitude = req.body.longitude;
                                model.latitude = req.body.latitude;
                                model.mark_Was_It = req.body.mark_Was_It;
                                model.did_It_Happen = req.body.did_It_Happen;
                                model.job_location = req.body.job_location
                                model.description = req.body.description;
                                model.is_draft = req.body.is_draft;

                                model.save(function (err, incidentData) {
                                    if (err) {
                                        return res.json(Response(500, "failed", utility.validationErrorHandler(err), {}));
                                    } else {
                                        if (req.body.is_draft == false) {
                                            return res.json(Response(200, "success", ((incidentInfoData) ? constantsObj.messages.incidentUpdatedSuccess : constantsObj.messages.incidentAddedSuccess), {
                                                _id: incidentData._id
                                            }));
                                        } else {
                                            return res.json(Response(200, "success", ((incidentInfoData) ? constantsObj.messages.incidentdraftmessage : constantsObj.messages.incidentdraftmessage), {
                                                _id: incidentData._id
                                            }));
                                        }

                                    }
                                });
                            });
                        }
                    }
                });
            }
        });
    }
}

/**
 * Function is use to delete Incident by id
 * @access private
 * @return json
 * Created by Rahul
 * @smartData Enterprises (I) Ltd
 * Created Date 10-Aug-2017
 */
function deleteIncidentId(req, res) {
    if (!req.swagger.params.id.value) {
        return res.json(Response(402, "failed", constantsObj.validationMessages.requiredFieldsMissing));
    } else {
        var id = req.swagger.params.id.value;
        incidentschema.findById(id).exec(function (err, data) {
            if (err) {
                return res.json(Response(500, "failed", constantsObj.validationMessages.internalError, err));
            } else {
                if (!data) {
                    return res.json(Response(402, "failed", constantsObj.validationMessages.userNotFound, {}));
                } else {
                    data.deleted = true;
                    data.save(function (err, incidentData) {
                        if (err)
                            return res.json(Response(500, "failed", constantsObj.validationMessages.internalError, err));
                        else {
                            return res.json({
                                'code': 200,
                                status: 'success',
                                "message": constantsObj.messages.incidentDeleteSuccess,
                                "data": {}
                            });
                        }
                    });
                }
            }
        })
    }
}


function updateIncidentStatus(req, res) {
    //console.log(req.body)
    var inputData = req.body;
    //var roleLength = inputData.data.length;

    // var bulk = User.collection.initializeUnorderedBulkOp();

    // for (var i = 0; i < roleLength; i++) {
    async.each(inputData.data, function (incidentData, callback) {
        //console.log(incidentData, 'dsfdsf');
        var id = mongoose.Types.ObjectId(incidentData.id);
        //console.log(id, 'dfdsfsdf')
        incidentschema.findOneAndUpdate({
            _id: id
        }, {
            $set: incidentData
        }, function (err, updatedata) {
            if (err) {
                console.log("sdfsdfds")
            } else {
                callback();
            }
        });
    }, function (err) {
        if (err) {
            console.log('A file failed to process');
        } else {
            return res.json(Response(200, "success", constantsObj.messages.userUpdatedSuccess));
        }
        //console.log('A email sent successfully');

    });
    // res.jsonp({
    //     'status': 'success',
    //     'messageId': 200,
    //     'message': "User updated successfully."
    // });

}

// function saveViewEditIncident(req, res) {
//     console.log(req.body, "saveViewEditIncident>>>>>>>>>>>>>>>>>>>>>>>>>>>>>")
//     if (!req.body.job_detail && !req.body.address && !req.body.foremen_details && !req.body.daily_number) {
//         return res.json(Response(402, "failed", constantsObj.validationMessages.requiredFieldsMissing));
//     } else {
//         saveViewEditIncident.findById(req.body).exec(function (err, IncidentInfoData) {
//             if (err) {
//                 return res.json(Response(500, "failed", constantsObj.validationMessages.internalError, err));
//             } else {
//                 console.log(IncidentInfoData, "DailyInfoData")
//                 var date = new Date();
//                 var model = new saveViewEditIncident();
//                 if (IncidentInfoData) {
//                     model = IncidentInfoData;
//                 }
//                 model.address = req.body.address;
//                 model.damage_Report = req.body.damage_Report;
//                 model.did_It_Happen = req.body.did_It_Happen;
//                 model.save(function (err, IncidentInfoData) {

//                     console.log(IncidentInfoData, "DailyInfoData>>>>>>>>>>>>>>>>>>>>>>>>", IncidentInfoData)
//                     if (err) {
//                         console.log(err, "inside errroororeprererererere")
//                         return res.json(Response(500, "failed", utility.validationErrorHandler(err), {}));
//                     } else {
//                         console.log(err, "inside elseeeeeeeee")

//                         return res.json(Response(200, "success", ((IncidentInfoData) ? constantsObj.messages.userUpdatedSuccess : constantsObj.messages.userAddedSuccess), {

//                         }));
//                     }
//                 })
//             }

//         })


//     }




// }






function saveViewEditIncident(req, res) {

    //console.log('***********', req.body, "saveViewEdit insdie bod")
    if (!req.body.job_detail && !req.body.foremen_details && !req.body.incident_number) {
        return res.json(Response(402, "failed", constantsObj.validationMessages.requiredFieldsMissing));
    } else {

        incidentschema.findById(req.body._id)
            // .populate('user_id')
            // .populate('crews_id')
            .exec(function (err, IncidentInfoData) {
                if (err) {
                    return res.json(Response(500, "failed", constantsObj.validationMessages.internalError, err));
                } else {
                    //console.log('############', IncidentInfoData, "DailyInfoData")
                    // MyDailies.findById(req.body._id)
                    incidentschema.update({
                            _id: IncidentInfoData._id
                        }, {
                            own_It: req.body.own_It,
                            address: req.body.address,
                            mark_Was_It: req.body.mark_Was_It,
                            damage_Report: req.body.damage_Report,
                            ticket_No: req.body.ticket_No,
                            fault: req.body.fault
                        }, {
                            upsert: true
                        })
                        .exec(function (err, UserData) {
                            if (err) console.log('ERR', err)
                            else{
                                 console.log(UserData, "userdata is hererrerererrerewrewrewrewrrewrwrwerwrewrwrwrwrewree")
                        User.update({
                            _id: req.body.foremen_detail._id
                        },{
                           firstname: req.body.foremen_detail.firstname
                             
                        }
                    ).exec(function(err,UserData){
                        if(err){
                            console.log(err)
                        }
                        else{
                             res.json({
                                code: 200,
                                message: constantsObj.messages.dailiesUpdatedSuccess,
                                data: UserData
                            });

                        }
                    })
                
                }
                    
                          


                        })
                }

            })


    }
}



function downloadIncidentPdf(req, res) {
    console.log("insdieeeeeeeeeeee bodyyyy",req.body )
    if (!req.body.parent_id && !req.body.user_id && !req.body.supervisor_id) {

        return res.json(Response(402, "failed", constantsObj.validationMessages.requiredFieldsMissing));
    } else {
        console.log("sadsad")
        if (req.body.from_date && req.body.to_date) {
            var condition = {
                deleted: false,
                "parent_id": mongoose.Types.ObjectId(req.body.parent_id),
                "from_date": {
                    $gte: new Date(req.body.from_date)
                },
                "to_date": {
                    $lte: new Date(req.body.to_date)
                }
            }

        } else if (!req.body.from_date && !req.body.to_date) {
            var condition = {
                deleted: false,
                "parent_id": mongoose.Types.ObjectId(req.body.parent_id)
            };
            if (req.body._id) {
                var condition = {
                    "_id": mongoose.Types.ObjectId(req.body._id),
                    deleted: false,
                    "parent_id": mongoose.Types.ObjectId(req.body.parent_id)
                };
            }

        } else if (req.body.user_id) {
            var condition = {
                deleted: false,
                "user_id": mongoose.Types.ObjectId(req.body.user_id)
            };
        } else if (req.body.supervisor_id) {
            var condition = {
                deleted: false,
                "supervisor_id": mongoose.Types.ObjectId(req.body.supervisor_id)
            };
        }
        co(function* () {
            console.log('insideco')
            let aggregate = [{
                    $lookup: {
                        from: "foremen_crews",
                        localField: "crews_id",
                        foreignField: "_id",
                        as: "crews"
                    }
                },
                {
                    $unwind: {
                        path: "$crews",
                        preserveNullAndEmptyArrays: true
                    }
                }, {
                    $lookup: {
                        from: "users",
                        localField: "user_id",
                        foreignField: "_id",
                        as: "foreman"
                    }
                },
                {
                    $unwind: {
                        path: "$foreman",
                        preserveNullAndEmptyArrays: true
                    }
                },
                 {
                    $lookup: {
                        from: "users",
                        localField: "parent_id",
                        foreignField: "_id",
                        as: "contractor"
                    }
                },
                {
                    $unwind: {
                        path: "$contractor",
                        preserveNullAndEmptyArrays: true
                    }
                },

                {
                    $lookup: {
                        from: "users",
                        localField: "_id",
                        foreignField: "_id",
                        as: "supervisor"
                    }
                },
                {
                    $unwind: {
                        path: "$supervisor",
                        preserveNullAndEmptyArrays: true
                    }
                },
                 {
                    $lookup: {
                        from: "jobs",
                        localField: "job_id",
                        foreignField: "_id",
                        as: "job"
                    }
                },
                {
                    $unwind: {
                        path: "$job",
                        preserveNullAndEmptyArrays: true
                    }
                },
                {
                    $match: condition
                },
                {
                    $project: {
                        createdAt: 1,
                        job_na: 1,
                        job_map: 1,
                        incident_number: 1,
                        job_location: 1,
                        latitude: 1,
                        ticket_No: 1,
                        fault: 1,
                        address: 1,
                        mark_Was_It: 1,
                        longitude: 1,
                        own_It: 1,
                        description: 1,
                        to_date: 1,
                        did_It_Happen: 1,
                        from_date: 1,
                        no_production: 1,
                        notes: 1,
                        geo_loc: 1,
                        status: 1,
                        damage_Report: 1,
                        is_draft: 1,
                        job_detail: {
                            _id: '$job._id',
                            job_id: '$job.job_id',
                            client: '$job.client',
                            address: '$job.address'
                        },
                        supervisor_details: {
                            _id: '$supervisor._id',
                            firstname: '$supervisor.firstname',
                            lastname: '$supervisor.lastname'
                        },
                        foremen_details: {
                            _id: '$foreman._id',
                            firstname: '$foreman.firstname',
                            lastname: '$foreman.lastname'
                          },
                           contractor_details: {
                            _id: '$contractor._id',
                            firstname: '$contractor.firstname',
                            lastname: '$contractor.lastname'
                        },
                        crews_details: {
                            _id: '$crews._id',
                            firstname: '$crews.firstname',
                            lastname: '$crews.lastname'
                        },
                    }
                }
            ]
            //console.log('inside each', "incidentData")
            let incidentData = yield incidentschema.aggregate(aggregate);
            //console.log('inside each', incidentData)
            async.each(incidentData, function (item, callback) {
                incidentImageschema.find({
                    incident_id: item._id
                }).exec(function (err, incidentData) {
                    item.IncidentImage = incidentData;
                    callback();
                    // myDailies_Billable_items.find({
                    //     my_dailies_id: item._id
                    // }).exec(function (err, dailiesBillableData) {
                    //     item.billable_items = dailiesBillableData;
                    //     callback();
                    // });
                });
            }, function (err) {
                if (err) {
                    return res.json(Response(500, "failed", constantsObj.validationMessages.internalError, {}));
                } else {
                    var incidentFileData = [];
                    // _.each(myDailiesData, function (dailies,index) {
                    for (var r = 0; r < incidentData.length; r++) {
                        var incident = randomstring.generate({
                            length: 12,
                            charset: 'alphabetic'
                        }).toString();
                        var pdfFormData = "";
                        var filePath = "./public/assets/uploads/incident/" + incident + '.pdf';
                        var logoUrl= config.webUrl+"/assets/images/logo.png";                        

                        var downloadPath = "assets/uploads/incident/" + incident + '.pdf';
                        var options = {
                     phantomArgs : ['--ignore-ssl-errors=true', '--ssl-protocol=any'],

                            border: {
                                "top": "30px", // default is 0, units: mm, cm, in, px 
                                "right": "20px",
                                "bottom": "30px",
                                "left": "20px"
                            }
                        };


                        pdfFormData += ' <table width="100%" cellpadding="0" cellspacing="0" style="font-family: Arial, sans-serif">'
                        pdfFormData += '<tbody>'
                        pdfFormData += '<caption>'
                        pdfFormData += '<h2>UNDERGROUND DAILY INCIDENT SHEET</h2> <h3>WESTERN BOONE COUNTY - PROJECT 5100</h3>'
                        pdfFormData += '</caption>'
                        pdfFormData += '<tr>'
                        pdfFormData += '<td>'
                        pdfFormData += ' <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 15px">'
                        pdfFormData += '  <tbody>'
                        pdfFormData += '   <tr>'
                        if (incidentData[r].foremen_details) {
                            pdfFormData += '    <td align="left"  style="font-size: 18px; font-weight:400 ; padding-bottom: 20px;">FOREMAN:' + incidentData[r].foremen_details.firstname + ' ' + incidentData[r].foremen_details.lastname + '</td>'
                        } else {
                            pdfFormData += '    <td align="left"  style="font-size: 18px; font-weight:400 ; padding-bottom: 20px;">FOREMAN:' + '-' + '</td>'
                        }
                        if (incidentData[r].supervisor_details) {
                            pdfFormData += '    <td align="right" style="font-size: 18px; font-weight:400 ; padding-bottom: 20px;">SUPERVISOR:' + incidentData[r].supervisor_details.firstname + ' ' + incidentData[r].supervisor_details.lastname + '</td>'
                        } else {
                            pdfFormData += '    <td align="right" style="font-size: 18px; font-weight:400 ; padding-bottom: 20px;">SUPERVISOR:' + '-' + '</td>'
                        }
                        pdfFormData += '     </tr>'
                        pdfFormData += '      <tr>'
                        if (incidentData[r].job_map) {
                            pdfFormData += '       <td align="left"  style="font-size: 18px; font-weight:400">MAP#' + incidentData[r].job_map + '</td>'
                        } else {
                            pdfFormData += '       <td align="left"  style="font-size: 18px; font-weight:400">MAP#' + '-' + '</td>'
                        }
                        pdfFormData += '       <td align="right"  style="font-size: 18px; font-weight:400">DATE:' + moment(incidentData[r].createdAt).format('ll') + '</td>'
                        pdfFormData += '      </tr>'
                        pdfFormData += '     </tbody>'
                        pdfFormData += '    </table>'
                        pdfFormData += '     </td>'
                        pdfFormData += '  </tr>'





                        // pdfFormData += ' <tr><td>'
                        pdfFormData += '  <table width="100%" cellpadding="5" cellspacing="0"  style=" border-collapse: collapse; margin-bottom: 15px;" border="1">'
                        // pdfFormData += '  <tbody>'
                        pdfFormData += '  <tr>'
                        pdfFormData += '  <th colspan="10" style="padding: 10px; background-color:#ffe9da;text-align: center;color:#000; font-size: 20px;">INFORMATION about incident</th>'
                        pdfFormData += '        </tr>'
                        pdfFormData += '    <tr>'
                        pdfFormData += '           <td style="font-size: 18px; font-weight:400; ">Incident number:<span style="font-size: 18px; font-weight: 600">' + incidentData[r].incident_number + '</span></td>'
                        pdfFormData += '          <td style="font-size: 18px; font-weight:400;  ">from_date: <span style="font-size: 18px; font-weight: 600">' + moment(incidentData[r].from_date).format('ll') + '</span></td>'
                        pdfFormData += '          <td style="font-size: 18px; font-weight:400; ">to_date: <span style="font-size: 18px; font-weight: 600">' + moment(incidentData[r].to_date).format('ll') + '</span></td>'
                        // pdfFormData += '        </tr>'
                        // pdfFormData += '       <tr>'
                        pdfFormData += '          <td style="font-size: 18px; font-weight:400; ">job_id: <span style="font-size: 18px; font-weight: 600">' + incidentData[r].job_detail.job_id + '</td>'
                        pdfFormData += '           <td style="font-size: 18px; font-weight:400;">client  <span style="font-size: 18px; font-weight: 600">' + incidentData[r].job_detail.client + '</td>'
                        
                        pdfFormData += '        </tr>'
                        pdfFormData += '       <tr>'
                        
                        
                        if (incidentData[r].damage_Report) {
                            pdfFormData += '          <td style="font-size: 18px; font-weight:400; ">What was Damaged  <span style="font-size: 18px; font-weight: 600">' + incidentData[r].damage_Report + '</td>'
                        } else {
                            pdfFormData += '          <td style="font-size: 18px; font-weight:400; ">What was Damaged   <span style="font-size: 18px; font-weight: 600">' + '-' + '</td>'
                        }
                        // pdfFormData += '       </tr>'
                        // pdfFormData += '        <tr>'
                        if (incidentData[r].job_na) {
                            pdfFormData += '          <td style="font-size: 18px; font-weight:400;">job na:  <span style="font-size: 18px; font-weight: 600">' + incidentData[r].job_na + '</td>'
                        } else {
                            pdfFormData += '          <td style="font-size: 18px; font-weight:400;">job_na:  <span style="font-size: 18px; font-weight: 600">' + '-' + '</td>'

                        }
                        if (incidentData[r].ticket_No) {
                            pdfFormData += '          <td style="font-size: 18px; font-weight:400;">Ticket Number:  <span style="font-size: 18px; font-weight: 600">' + incidentData[r].ticket_No + '</td>'
                        } else {
                            pdfFormData += '          <td style="font-size: 18px; font-weight:400;">Ticket Number:  <span style="font-size: 18px; font-weight: 600">' + '-' + '</td>'
                        }

                        if (incidentData[r].own_It) {
                            pdfFormData += '          <td style="font-size: 18px; font-weight:400;">Address:  <span style="font-size: 18px; font-weight: 600">' + incidentData[r].address + '</td>'
                        } else {
                            pdfFormData += '          <td style="font-size: 18px; font-weight:400;">Address:  <span style="font-size: 18px; font-weight: 600">' + '-' + '</td>'
                        }





                        // if (incidentData[r].notes) {
                        //     pdfFormData += '          <td style="font-size: 18px; font-weight:400;border-right: none; border-left: none;border-top: none;">Notes:  <span style="font-size: 18px; font-weight: 600">' + incidentData[r].notes + '</td>'
                        // } else {
                        //     pdfFormData += '          <td style="font-size: 18px; font-weight:400;border-right: none; border-left: none;border-top: none;">Notes:  <span style="font-size: 18px; font-weight: 600">' + '-' + '</td>'
                        // }






                        if (incidentData[r].own_It) {
                            pdfFormData += '          <td style="font-size: 18px; font-weight:400;">Owner:  <span style="font-size: 18px; font-weight: 600">' + incidentData[r].own_It + '</td>'
                        } else {
                            pdfFormData += '          <td style="font-size: 18px; font-weight:400;">Owner:  <span style="font-size: 18px; font-weight: 600">' + '-' + '</td>'
                        }


                                pdfFormData += '        </tr>'
                                pdfFormData += '       <tr>'
                        


                        if (incidentData[r].description) {
                            pdfFormData += '          <td style="font-size: 18px; font-weight:400;">Description:  <span style="font-size: 18px; font-weight: 600">' + incidentData[r].description + '</td>'
                        } else {
                            pdfFormData += '          <td style="font-size: 18px; font-weight:400;">Description:  <span style="font-size: 18px; font-weight: 600">' + '-' + '</td>'
                        }





                        pdfFormData += '          <td style="font-size: 18px; font-weight:400;">Status:  <span style="font-size: 18px; font-weight: 600">' + incidentData[r].status + '</td>'
                        pdfFormData += '       </tr>'
                        // pdfFormData += '     </tbody>'
                        pdfFormData += '   </table>'
                        // pdfFormData += ' </td>'
                        // pdfFormData += '</tr>'
                        // pdfFormData += '<tr style="padding-bottom: 10px; margin-top:60px;">'
                        // pdfFormData += ' <td>'
                        // pdfFormData += ' <table margin-top:60px; width="100%" cellpadding="15" cellspacing="0" border="1";style="font-size: 18px;border-collapse: collapse; text-align: center">'
                        // pdfFormData += ' <tbody>'
                        // pdfFormData += '  <tr>'
                        // pdfFormData += '   <th colspan="3" style="padding: 10px; background-color:#ffe9da;color:#000; font-size: 20px;">Billable item</th>'
                        // pdfFormData += ' </tr>'
                        // pdfFormData += '  <tr>'
                        // pdfFormData += ' <th width="20%">Name #</th>'
                        // pdfFormData += ' <th>Description</th>'
                        // pdfFormData += '  <th width="20%">Quantity</th>'
                        // pdfFormData += ' </tr>'
                        // for (var i = 0; i < myDailiesData[r].billable_items.length; i++) {
                        //     pdfFormData += ' <tr>'
                        //     if (myDailiesData[r].billable_items[i].name) {
                        //         pdfFormData += ' <td style="font-size: 18px; font-weight: 600">' + myDailiesData[r].billable_items[i].name + '</td>'
                        //     } else {
                        //         pdfFormData += ' <td style="font-size: 18px; font-weight: 600">' + '-' + '</td>'
                        //     }
                        //     if (myDailiesData[r].billable_items[i].description) {
                        //         pdfFormData += '  <td>' + myDailiesData[r].billable_items[i].description + '</td>'
                        //     } else {
                        //         pdfFormData += '  <td>' + '-' + '</td>'
                        //     }
                        //     if (myDailiesData[r].billable_items[i].description) {
                        //         pdfFormData += '  <td>' + myDailiesData[r].billable_items[i].quantity + '</td>'
                        //     } else {
                        //         pdfFormData += '  <td>' + '-' + '</td>'
                        //     }
                        //     pdfFormData += '  </tr>'
                        //     pdfFormData += ' <tr>'
                        // }
                        if (incidentData[r].reject_notes) {
                            pdfFormData += '    <td colspan="3" align="left"><span style="font-size: 16px; font-weight: 600;height: 30%;">Notes' + incidentData[r].reject_notes + '</span></td>'
                        } else {
                            pdfFormData += '    <td colspan="3" align="left"><span style="font-size: 16px; font-weight: 600;height: 30%;">Notes' + '-' + '</span></td>'
                        }

                        // pdfFormData += '  </tr>'
                        // pdfFormData += ' </tbody>'
                        // pdfFormData += '  </table>'
                        // pdfFormData += ' </td>'
                        // pdfFormData += ' </tr>'incidentData[r].incident_number
                        for (var i = 0; i < incidentData[r].IncidentImage.length; i++) {
                            var image_path = 'http://getmydaily.com/' + incidentData[r].IncidentImage[i].image_path;
                            pdfFormData += ' <tr>'
                            pdfFormData += '  <td>'
                            pdfFormData += ' <table>'
                            pdfFormData += '   <tbody>'
                            pdfFormData += '    <tr>'
                            pdfFormData += '  <td><img src="' + image_path + '"  width="300px" height="300px;"></td>'
                            pdfFormData += '  </tr>'
                            pdfFormData += ' </tbody>'
                            pdfFormData += ' </table>'

                            pdfFormData += ' </td>'
                            pdfFormData += '</tr>'
                        }

                        pdfFormData += ' </tbody>'
                        pdfFormData += '  </table>'
                        // generatePDf(pdfFormData, incident);


var incidentPdf = `<!doctype html>
<html>
<head>
<meta charset="utf-8">
<title>Untitled Document</title>
<link href="https://fonts.googleapis.com/css?family=Roboto" rel="stylesheet">

</head>

<body>
<table width="100%" style="font-family: Gotham, 'Helvetica Neue', Helvetica, Arial, 'sans-serif'" align="center">
	<tr>
		<td valign="bottom" style="background-color: #4199db; height: 50px; padding-bottom: 10px;">
			<table width="100%">
				<tr>
					<td width="50%">
						<h1 style="padding-left: 20px; color: #ffffff; font-weight: lighter; font-size: 17px; font-family: 'Roboto', sans-serif; line-height: 0;">Incident Details</h1>
					</td>
					<td width="50%" align="right" style="padding-right: 20px; color: #ffffff; font-size: 15px; font-family: Gotham, 'Helvetica Neue', Helvetica, Arial, 'sans-serif'; font-weight: 400;">Incident # ` + incidentData[r].incident_number +`</td>
				</tr>
			</table>
		</td>
	</tr>
	<tr>
		<td style="padding: 20px; font-weight: 500;font-size: small" valign="middle">
			<table width="100%">
				<tr>
					<td width="28%" style="font-size: 10px; font-family: Gotham, 'Helvetica Neue', Helvetica, Arial, 'sans-serif'; color: #9f9f9f;">JOB ID <font color="#000000">`+ incidentData[r].job_detail.job_id +`</font></td>
					<td width="30%" align="right" style="font-size: 10px; font-family: Gotham, 'Helvetica Neue', Helvetica, Arial, 'sans-serif'; color: #9f9f9f">SUBMITTED <font color="#000000">`+ moment(incidentData[r].createdAt).format('ll') +`</font></td>
					<td width="42%" align="right" style="font-size: 10px; font-family: Gotham, 'Helvetica Neue', Helvetica, Arial, 'sans-serif'; color: #9f9f9f">INCIDENT DATE <font color="#000000">` + moment(incidentData[r].did_It_Happen).format('ll') +`</font></td>
				</tr>
			</table>
		</td>
	</tr>
	<tr>
		<td style="background-color: #f2f6f7; padding: 20px;">
			<table width="100%">
				<tr>
					<td width="33%" style="font-size: 10px; padding-right: 20px; font-family: Gotham, 'Helvetica Neue', Helvetica, Arial, 'sans-serif'; color: #000000;">
                        SUBCONTRACTOR<br>`
                        if (incidentData[r].contractor_details) {
                            incidentPdf += `<input value="`+incidentData[r].contractor_details.firstname+` `+incidentData[r].contractor_details.lastname+`" style="width: 100%; border: 1px solid #ccc; padding-left: 10px; color: #000000; font-weight: 600; height: 25px;">`
                        } else {
                            incidentPdf += `<input value="-" style="width: 100%; border: 1px solid #ccc; padding-left: 10px; color: #000000; font-weight: 600; height: 25px;">`
                        }
                        

                    incidentPdf += `</td>
					<td width="33%" style="font-size: 10px; padding-right: 20px; font-family: Gotham, 'Helvetica Neue', Helvetica, Arial, 'sans-serif'; color: #000000;">
                        FOREMAN<br>
                        `
                        if (incidentData[r].foremen_details) {
                            incidentPdf += `<input value="`+incidentData[r].foremen_details.firstname+` `+incidentData[r].foremen_details.lastname+`" style="width: 100%; border: 1px solid #ccc; padding-left: 10px; color: #000000; font-weight: 600; height: 25px;">`
                        } else {
                            incidentPdf += `<input value="-" style="width: 100%; border: 1px solid #ccc; padding-left: 10px; color: #000000; font-weight: 600; height: 25px;">`
                        }
                        

                    incidentPdf += `</td>
					<td width="33%" style="font-size: 10px; padding-right: 20px; font-family: Gotham, 'Helvetica Neue', Helvetica, Arial, 'sans-serif'; color: #000000;">
                        CLIENT NAME<br>
                          `
                        if (incidentData[r].job_detail) {
                            incidentPdf += `<input value="`+incidentData[r].job_detail.client +`" style="width: 100%; border: 1px solid #ccc; padding-left: 10px; color: #000000; font-weight: 600; height: 25px;">`
                        } else {
                            incidentPdf += `<input value="-" style="width: 100%; border: 1px solid #ccc; padding-left: 10px; color: #000000; font-weight: 600; height: 25px;">`
                        }
                        

                    incidentPdf += `</td>
				</tr>
				<tr>
					<td width="33%" style="font-size: 10px; padding-top: 20px; padding-right: 20px; font-family: Gotham, 'Helvetica Neue', Helvetica, Arial, 'sans-serif'; color: #000000;">
						SUPERVISOR<br>`
                        if (incidentData[r].supervisor_details) {
                            incidentPdf += `<input value="`+incidentData[r].supervisor_details.firstname+` `+incidentData[r].supervisor_details.lastname+`" style="width: 100%; border: 1px solid #ccc; padding-left: 10px; color: #000000; font-weight: 600; height: 25px;">`
                        } else {
                            incidentPdf += `<input value="-" style="width: 100%; border: 1px solid #ccc; padding-left: 10px; color: #000000; font-weight: 600; height: 25px;">`
                        }
                        

                    incidentPdf += `</td>
					<td width="33%" style="font-size: 10px; padding-top: 20px; padding-right: 20px; font-family: Gotham, 'Helvetica Neue', Helvetica, Arial, 'sans-serif'; color: #000000;">
                        OWNER<br>`
                        if (incidentData[r].own_It) {
                            incidentPdf += `<input value="`+incidentData[r].own_It +`" style="width: 100%; border: 1px solid #ccc; padding-left: 10px; color: #000000; font-weight: 600; height: 25px;">`
                        } else {
                            incidentPdf += `<input value="-" style="width: 100%; border: 1px solid #ccc; padding-left: 10px; color: #000000; font-weight: 600; height: 25px;">`
                        }
                        
                   
                    incidentPdf += `</td>
					<td width="33%" style="font-size: 10px; padding-top: 20px; padding-right: 20px; font-family: Gotham, 'Helvetica Neue', Helvetica, Arial, 'sans-serif'; color: #000000;">
                        TICKET #<br>
                        `
                        if (incidentData[r].ticket_No) {
                            incidentPdf += `<input value="`+incidentData[r].ticket_No +`" style="width: 100%; border: 1px solid #ccc; padding-left: 10px; color: #000000; font-weight: 600; height: 25px;">`
                        } else {
                            incidentPdf += `<input value="-" style="width: 100%; border: 1px solid #ccc; padding-left: 10px; color: #000000; font-weight: 600; height: 25px;">`
                        }
                        
                   
                    incidentPdf += `</td>


                </tr>
                
<tr>
	<td width="33%" style="font-size: 10px; padding-top: 20px; padding-right: 20px; font-family: Gotham, 'Helvetica Neue', Helvetica, Arial, 'sans-serif'; color: #000000;">
                       ADDRESS<br>`
                        if (incidentData[r].address) {
                            incidentPdf += `<input value="`+incidentData[r].address +`" style="width: 100%; border: 1px solid #ccc; padding-left: 10px; color: #000000; font-weight: 600; height: 25px;">`
                        } else {
                            incidentPdf += `<input value="-" style="width: 100%; border: 1px solid #ccc; padding-left: 10px; color: #000000; font-weight: 600; height: 25px;">`
                        }
                        
                   
                    incidentPdf += `</td>

<td width="33%" style="font-size: 10px; padding-top: 20px; padding-right: 20px; font-family: Gotham, 'Helvetica Neue', Helvetica, Arial, 'sans-serif'; color: #000000;">
                       WHAT WAS DAMAGED<br>`
                        if (incidentData[r].damage_Report) {
                            incidentPdf += `<input value="`+incidentData[r].damage_Report +`" style="width: 100%; border: 1px solid #ccc; padding-left: 10px; color: #000000; font-weight: 600; height: 25px;">`
                        } else {
                            incidentPdf += `<input value="-" style="width: 100%; border: 1px solid #ccc; padding-left: 10px; color: #000000; font-weight: 600; height: 25px;">`
                        }
                        
                   
                    incidentPdf += `</td>

<td width="33%" style="font-size: 10px; padding-top: 20px; padding-right: 20px; font-family: Gotham, 'Helvetica Neue', Helvetica, Arial, 'sans-serif'; color: #000000;">
                       OUR FAULT?<br>`
                        if (incidentData[r].fault) {
                            incidentPdf += `<input value="`+incidentData[r].fault +`" style="width: 100%; border: 1px solid #ccc; padding-left: 10px; color: #000000; font-weight: 600; height: 25px;">`
                        } else {
                            incidentPdf += `<input value="-" style="width: 100%; border: 1px solid #ccc; padding-left: 10px; color: #000000; font-weight: 600; height: 25px;">`
                        }
                        
                   
                    incidentPdf += `</td>







</tr>
			</table>
		</td>
	</tr>
	
	
	<tr>
		<td style="padding: 20px 20px 0 20px;">
			<h2 style="font-size: 11px; font-weight: 400; padding-top: 0px; padding-bottom: 0; font-family: Gotham, 'Helvetica Neue', Helvetica, Arial, 'sans-serif'; color: #000000; line-height: 0;">DESCRIPTION</h2>
		</td>
	</tr>
   <tr>
        <td style="padding: 0px 20px;">
            <table width="100%" cellspacing="5">
                <tr>`

                 if (incidentData[r].description) {
                            incidentPdf += `<td style="border: 1px solid #ccc; padding-left: 10px; color: #000000; font-weight: 400; height: 25px; font-size: 10px; font-family: Gotham, 'Helvetica Neue', Helvetica, Arial, 'sans-serif';">`+ incidentData[r].description +`</td>`
                        } else {
                            incidentPdf += `<td style="border: 1px solid #ccc; padding-left: 10px; color: #000000; font-weight: 400; height: 25px; font-size: 10px; font-family: Gotham, 'Helvetica Neue', Helvetica, Arial, 'sans-serif';">-</td>`
                        }
                
                incidentPdf +=`</tr>
            </table>
        </td>
    </tr>
  <tr>
        <td style="padding: 20px 20px 0 20px;">
            <table width="100%">
                <tr>
                   

		<td height="1px" style="padding: 10px 20px;">
			<hr color="#adadad">
		</td>
	</tr>
	<tr>
		<td style="padding: 0px 20px 20px 20px;">
			<table width="100%">
				<tr>
					<td valign="top">
              <img  src=`+logoUrl+` style = "height: 12px" >                    
					</td>
					<td align="right" valign="top" style="font-size: 10px; font-weight: 400; font-family: Gotham, 'Helvetica Neue', Helvetica, Arial, 'sans-serif'; color: #9f9f9f;">
                        Approved by:<br>
                        `
                          if (incidentData[r].supervisor_details) {
                            incidentPdf += `<font color="#000000">` + incidentData[r].supervisor_details.firstname + ` ` + incidentData[r].supervisor_details.lastname + ` (`+moment(incidentData[r].createdAt).format('MMMM Do YYYY')`)</font>`;
                        } else {
        incidentPdf += `<font color="#000000">` + 'N/A'  + `</font>`;
                        

                            // dailyPdf += `<input value="-" style="width: 100%; border: 1px solid #ccc; padding-left: 10px; color: #000000; font-weight: 600; height: 25px;">`
                        }

                        incidentPdf += `
                </tr>
            </table>
        </td>
    </tr>
`
for (var i = 0; i < incidentData[r].IncidentImage.length; i++) {
                            var image_path = config.webUrl + '/' + incidentData[r].IncidentImage[i].image_path;

                            incidentPdf += `<tr>
	                        	<td style="padding: 0px 20px;">
	                        		<table width="100%" cellspacing="5">
	                        			<tr>
	                        				<td><img src="`+ image_path + `"height="550" style="max-width: 100%;  width:100%; margin-top:25px;" alt=""/></td>
	                        			</tr>
	                        		</table>
	                        	</td>
	                        </tr>`
                        }


                        incidentPdf += `
					</td>
				</tr>
			</table>
		</td>
	</tr>
</table>
</body>
</html>`

                    }


generatePDf(incidentPdf, incident);

                    function generatePDf(TestData, dailys) {
                        incidentFileData.push('assets/uploads/incident/' + dailys + '.pdf');
                        pdf.create(TestData, options).toFile(filePath, function (err, pdfinfo) {
                            if (err) {
                                console.log(err)
                            } else {
                                console.log("1111")
                                //var dailiesMailData = { email: req.body.email, firstname: req.body.firstname, lastname: req.body.lastname, download_token: downloadPath };
                                //utility.readTemplateSendMail(dailiesMailData.email, constantsObj.emailSubjects.verify_email, dailiesMailData, 'download_mydailies', function (err, resp) { });                              
                                return res.json({
                                    'code': 200,
                                    status: 'success',
                                    "message": constantsObj.messages.dataRetrievedSuccess,
                                    "data": incidentFileData
                                });

                            }

                        })

                    }

                }

            });

        }).catch(function (err) {

            return res.json(Response(402, "failed", utility.validationErrorHandler(err), {}));
        });
    }
}






























/**
 * Function is use to fetch all incident image data
 * @access private
 * @return json
 * Created by sarvesh
 * @smartData Enterprises (I) Ltd
 * Created Date 13-Jan-2017
 */
function getIncidentImage(req, res) {
    if (!req.body.incidentId) {
        return res.json(Response(402, "failed", constantsObj.validationMessages.requiredFieldsMissing));
    } else {
        incidentImageschema.find({
            _id: req.body.incidentId,
            deleted: false
        }, function (err, incidentImage) {
            if (err) {
                res.json({
                    code: 402,
                    message: 'Request could not be processed. Please try again.'
                });
            } else {
                res.json({
                    code: 200,
                    message: 'Incident images fetched successfully.',
                    data: incidentImage
                });
            }
        });
    }
}

/**
 * Function is use to fetch add incident image
 * @access private
 * @return json
 * Created by rahul
 * @smartData Enterprises (I) Ltd
 * Created Date 13-Jan-2017
 */
function addIncidentImages(req, res) {
    if (!req.swagger.params.file.value) {
        return res.json(Response(402, "failed", constantsObj.validationMessages.requiredFieldsMissing));
    } else {
        var timestamp = Number(new Date());
        var form = new formidable.IncomingForm();
        var file = req.swagger.params.file.value;
        var productId = req.swagger.params.id.value;
        var splitFile = file.originalname.split('.');
        var filename = +timestamp + '_' + common.randomToken(6) + '.' + ((splitFile.length > 0) ? splitFile[splitFile.length - 1] : file.originalname);
        var imagePath = "./public/assets/uploads/incident/" + filename;

        fs.writeFile(path.resolve(imagePath), file.buffer, function (err) {
            if (err) {
                res.json({
                    code: 402,
                    'message': 'Request could not be processed. Please try again.',
                    data: {}
                });
            } else {
                var IncidentImage = {
                    incident_id: req.body.id,
                    image_name: file.originalname,
                    image_path: "assets/uploads/incident/" + filename
                };

                var incidentImages = new incidentImageschema(IncidentImage);
                incidentImages.save(function (err, IncidentImage) {
                    if (err) {

                        return res.json(Response(500, "failed", constantsObj.validationMessages.internalError, {}));
                    } else {
                        return res.json({
                            code: 200,
                            'message': 'Incident image added successfully.',
                            data: {}
                        });
                    }
                });
            }
        });
    }
}

/**
 * Function is use to get incident list for web end
 * @access private
 * @return json
 * Created by Rahul
 * @smartData Enterprises (I) Ltd
 * Created Date 10-Aug-2017
 */
function getIncidentListByAdmin(req, res) {
    // var startDate = moment(req.body.startDate).format();
    // var endDate = moment(req.body.endDate).format();
     var startDate = moment(req.body.startDate).format();
    var endDate = moment(req.body.endDate).format();
    if (!req.body.parent_id && !req.body.startDate && !req.body.endDate) {
        return res.json(Response(402, "failed", constantsObj.validationMessages.requiredFieldsMissing));
    } else {
        var count = req.body.count ? req.body.count : 0;
        var skip = req.body.count * (req.body.page - 1);
         var sorting = req.body.sorting ? req.body.sorting : {
            _id: 1
        };
               for (let key in req.body) {
             if (key.match(/^sorting.*$/gi)) {
                  var sKey = key.split('[')[1].split(']')[0]; 
                  var sortt = {}; sortt[sKey] = (req.body[key] == 'asc') ? 1 : -1; 
                  sorting = sortt 
                } 
            }

        //console.log('asdasd', req.body);
        var sorting = utility.getSortObj(req.body);
        //var sorting = req.body.sorting ? req.body.sorting : { _id: -1 };
        var condition = {
            deleted: false,
            "parent_id": mongoose.Types.ObjectId(req.body.parent_id)
        };
        var searchText = decodeURIComponent(req.body.searchText).replace(/[[\]{}()*+?,\\^$|#\s]/g, "\\s+");
        if (req.body.searchText) {
console.log("req.body.searchText",req.body.searchText)
            condition.$or = [{
                    'ticket_No': new RegExp(searchText, 'gi')
                },
                {
                    'damage_Report': new RegExp(searchText, 'gi')
                },
                {
                    'own_It': new RegExp(searchText, 'gi')
                },
                {
                    'job.job_id': new RegExp(searchText, 'gi')
                },
                {
                    'incident_number': new RegExp(searchText, 'gi')
                },

            ];
        }

        for (let key in sorting) {
            sorting[key] = ((sorting[key] == '-1') ? -1 : 1);
        }

        // if (req.body.startDate && req.body.endDate) {
        //     if (!condition.$and)
        //         condition.$and = [];
        //     console.log("inside req.body.startdate", req.body.startDate, req.body.endDate)
        //     // var start_date1 = moment().format(req.body.startDate);
        //     // var stdate = new Date(start_date1)
        //     // console.log(start_date1, "start_date1>>>>>>>>>>><<<<<<<<<<<<<<<<<")
        //     // db.posts.find($and({"from": {"$gte": startDate}}, {"to": {"$lte": endDate}})
        //     // MyDailies.find(condition)
        //     condition.$and.push({
        //         'did_It_Happen': {
        //             $gte: new Date(startDate)
        //         }
        //     })
        //     condition.$and.push({
        //         'did_It_Happen': {
        //             $lte: new Date(endDate)
        //         }
        //     })
        // }



        if (req.body.filterFlag) {
            if (!condition.$and)
                condition.$and = [];
            //console.log("req.body.filterFlag", req.body.filterFlag)
            if (req.body.filterFlag.ticket_No && req.body.filterFlag.ticket_No != '') {
                condition.$and.push({
                    'ticket_No': req.body.filterFlag.ticket_No
                })

            }
            if (req.body.filterFlag.address && req.body.filterFlag.address != '') {
                condition.$and.push({
                    'address': new RegExp(req.body.filterFlag.address, 'gi')
                })
            }
            if (req.body.filterFlag.job_id && req.body.filterFlag.job_id != '') {
                condition.$and.push({
                    'job.job_id': new RegExp(req.body.filterFlag.job_id, 'gi')
                })
            }
            if (req.body.filterFlag.own_It && req.body.filterFlag.own_It != '') {
                condition.$and.push({
                    'own_It': new RegExp(req.body.filterFlag.own_It, 'gi')
                })
            }
            if (req.body.filterFlag.incident_number && req.body.filterFlag.incident_number != '') {
                condition.$and.push({
                    'incident_number': new RegExp(req.body.filterFlag.incident_number, 'gi')
                })
            }

            if (req.body.filterFlag.damage_Report && req.body.filterFlag.damage_Report != '') {
                condition.$and.push({
                    'damage_Report': new RegExp(req.body.filterFlag.damage_Report, 'gi')
                })
            }








        }


    if (req.body.startDate && req.body.endDate) {
        //console.log("inside req.body.startdate")

// db.inventory.find( { qty: { $gt: 20 } } )


        incidentschema.find({
                did_It_Happen: {
                    $gte:req.body.startDate,
                     $lte: req.body.endDate// "2017-08-25T00:00:00.000Z"//
                },
                // did_It_Happen: {
                //     $lte: req.body.endDate
                // },
                deleted: false
            })
            // .populate('job_id')
            // .populate('crews_id')
            // .populate('user_id')
            // .populate('supervisor_id')
         

    }


























        co(function* () {
            let aggregate = [{
                    $lookup: {
                        from: "jobs",
                        localField: "job_id",
                        foreignField: "_id",
                        as: "job"
                    }
                },
                {
                    $unwind: {
                        path: "$job",
                        preserveNullAndEmptyArrays: true
                    }
                },
                {
                    $lookup: {
                        from: "users",
                        localField: "user_id",
                        foreignField: "_id",
                        as: "foremen"
                    }
                },
                {
                    $unwind: {
                        path: "$foremen",
                        preserveNullAndEmptyArrays: true
                    }
                },

                {
                    $match: condition
                },
                {
                    $project: {
                        createdAt: 1,
                        damage_Report: 1,
                        own_It: 1,
                        ticket_No: 1,
                        address: 1,
                        fault: 1,
                        mark_Was_It: 1,
                        did_It_Happen: 1,
                        description: 1,
                        crews_id: 1,
                        supervisor_id: 1,
                        is_draft: 1,
                        incident_number: 1,
                        job_details: {
                            _id: '$job._id',
                            job_id: '$job.job_id',
                            client: '$job.client'
                        },
                        foremen_detail: {
                            _id: '$foremen._id',
                            firstname: '$foremen.firstname',
                            lastname: '$foremen.lastname'
                        },
                        supervisor_detail: {
                            _id: '$supervisor._id',
                            firstname: '$supervisor.firstname',
                            lastname: '$supervisor.lastname'
                        },
                        crews_details: {
                            _id: '$crews._id',
                            firstname: '$crews.firstname',
                            lastname: '$crews.lastname'
                        },

                    }
                }
            ]
            if (parseInt(skip) > 0) {
                aggregate.push({
                    $skip: parseInt(skip)
                });
            }
            if (parseInt(count) > 0) {
                aggregate.push({
                    $limit: parseInt(count)
                });
            }
            if (sorting) {
                //console.log('Hello', sorting);
                aggregate.push({
                    $sort: sorting
                });
            }
            //return false;
            let incidentData = yield incidentschema.aggregate(aggregate);
            async.each(incidentData, function (item, callback) {
                incidentImageschema.find({
                    incident_id: item._id
                }).exec(function (err, incidentInfoData) {

                    item.incident_image = incidentInfoData;
                    callback();
                });

            }, function (err) {
                if (err) {
                    return res.json(Response(500, "failed", constantsObj.validationMessages.internalError, {}));
                } else {
                    return res.json({
                        'code': 200,
                        status: 'success',
                        "message": constantsObj.messages.dataRetrievedSuccess,
                        "data": incidentData
                    });
                }

            });

        }).catch(function (err) {

            return res.json(Response(402, "failed", utility.validationErrorHandler(err), {}));
        });
    }
}


/**
 * Function is use to get Single incident for web end 
 * @access private
 * @return json
 * Created by Rahul
 * @smartData Enterprises (I) Ltd
 * Created Date 30-Aug-2017
 */
function getIncidentById(req, res) {
    if (!req.swagger.params.id.value) {
        return res.json(Response(402, "failed", constantsObj.validationMessages.requiredFieldsMissing));
    } else {
        var id = req.swagger.params.id.value;
        incidentschema.findOne({
                _id: id
            })
            .lean()
            .exec(function (err, IncidentInfo) {
                if (err) {
                    return res.json(Response(500, "failed", constantsObj.validationMessages.internalError, err));
                } else {
                    return res.json({
                        'code': 200,
                        status: 'success',
                        "message": constantsObj.messages.dataRetrievedSuccess,
                        "data": IncidentInfo
                    });
                }
            });
    }
}

function getIncidentByDate(req, res) {
    //console.log("getIncidentByDate", req.body)
    var startDate = moment(req.body.startDate).format();
    var endDate = moment(req.body.endDate).format();

// console.log(" startDate :-",startDate," endDate :-",endDate)

    if (req.body.startDate && req.body.endDate) {

// db.inventory.find( { qty: { $gt: 20 } } )


        incidentschema.find({
                did_It_Happen: {
                    $gte:req.body.startDate,
                     $lte: req.body.endDate// "2017-08-25T00:00:00.000Z"//
                },
                // did_It_Happen: {
                //     $lte: req.body.endDate
                // },
                deleted: false
            })
            // .populate('job_id')
            // .populate('crews_id')
            // .populate('user_id')
            // .populate('supervisor_id')
            .exec(function (err, data) {
                //console.log("data is here", data)
                if (err) {
                    return res.json(Response(500, "failed", constantsObj.validationMessages.internalError, {}));
                } else {
                    // console.log(data, "data retrived successfully");
                    return res.json({
                        'code': 200,
                        status: 'success',
                        "message": constantsObj.messages.dataRetrievedSuccess,
                        "data": data,
                        "myResponse": "true"
                    });
                }
            })

    }


}