'use strict';

var mongoose = require('mongoose'),
    CMS = mongoose.model('cms'),
    Response = require('../lib/response.js'),
    constantsObj = require('./../../constants'),
    config = require('../../config/config.js'),
    validator = require('validator'),
    utility = require('../lib/utility.js'),
    async = require('async'),
    co = require('co');


module.exports = {
    getAllCmsList: getAllCmsList,
    getCmsByID: getCmsByID,
    updateCms: updateCms,
    getCmsPageByName: getCmsPageByName
};

/**
 * Function is use to get all cms page list
 * @access private
 * @return json
 * Created by Udit
 * @smartData Enterprises (I) Ltd
 * Created Date 15-March-2017
 */
function getAllCmsList(req, res) {
    co(function*() {
        let count = parseInt(req.body.count ? req.body.count : 0);
        let skip = parseInt(req.body.count * (req.body.page - 1));
        let sorting = utility.getSortObj(req.body);
        let searchText = decodeURIComponent(req.body.searchText).replace(/[[\]{}()*+?,\\^$|#\s]/g, "\\s+");
        let condition = {deleted: false};
         if (searchText != undefined && searchText != 'undefined') {
            condition.$or = [
                { 'title': new RegExp(searchText, 'gi') }
            ];
        }
        let cmsList = yield CMS.find(condition).skip(skip).limit(count).sort(sorting).exec();
        let cmsListCount = yield CMS.find(condition).count();
        return res.json({ 'code': 200, status: 'success', "message": constantsObj.messages.dataRetrievedSuccess, "data": cmsList, "totalLength": cmsListCount });
    }).catch(function(err) {
        console.log(err, 'errrr');
        return res.json(Response(402, "failed", utility.validationErrorHandler(err), {}));
    });
}

/**
 * Function is use to get cms page by ID
 * @access private
 * @return json
 * Created by Udit
 * @smartData Enterprises (I) Ltd
 * Created Date 15-March-2017
 */
function getCmsByID(req, res) {
    co(function*() {
        let cmsPage = yield CMS.findById(req.body.id).exec();
        return res.json({ 'code': 200, status: 'success', "message": constantsObj.messages.dataRetrievedSuccess, "data": cmsPage});
    }).catch(function(err) {
        console.log(err, 'errrr');
        return res.json(Response(402, "failed", utility.validationErrorHandler(err), {}));
    });
}

/**
 * Function is use to get cms page by name
 * @access private
 * @return json
 * Created by Udit
 * @smartData Enterprises (I) Ltd
 * Created Date 15-March-2017
 */
function getCmsPageByName(req, res) {
    co(function*() {
        let cmsPage = yield CMS.findOne({name: req.body.name}, 'description').exec();
        return res.json({ 'code': 200, status: 'success', "message": constantsObj.messages.dataRetrievedSuccess, "data": cmsPage});
    }).catch(function(err) {
        console.log(err, 'errrr');
        return res.json(Response(402, "failed", utility.validationErrorHandler(err), {}));
    });
}

/**
 * Function is use to update cms 
 * @access private
 * @return json
 * Created by Udit
 * @smartData Enterprises (I) Ltd
 * Created Date 15-March-2017
 */
function updateCms(req, res) {
    co(function*() {
        let cmsData = yield CMS.findById(req.body._id);
        if (cmsData) {
            cmsData.title = req.body.title;
            cmsData.description = req.body.description;
            let savedData = yield cmsData.save();
            return res.json(Response(200, "success", constantsObj.messages.pageUpdatedSuccess, {}));
        } else {
            return res.json(Response(402, "failed", constantsObj.validationMessages.pageNotFound, err));    
        }
    }).catch(function(err) {
        console.log(err, 'errrrrr');
        return res.json(Response(402, "failed", utility.validationErrorHandler(err), err));
    });
}
