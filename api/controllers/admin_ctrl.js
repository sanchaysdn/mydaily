    'use strict';

    var mongoose = require('mongoose'),
        Job = mongoose.model('Job'),
        Role = mongoose.model('Role'),
        User = mongoose.model('User'),
        formidable = require('formidable'),
        constantsObj = require('./../../constants'),
        Response = require('../lib/response.js'),
        util = require('util'),
        fs = require('fs-extra'),
        path = require('path'),
        async = require('async'),
        validator = require('validator'),
        _ = require('underscore'),
        co = require('co'),
        common = require('../../config/common.js'),
        utility = require('../lib/utility.js'),
        config = require('../../config/config.js');

    module.exports = {
        productStatusChange: productStatusChange,
        deleteProduct: deleteProduct,
        getUserByIdAdmin: getUserByIdAdmin
    };

    /**
     * Function is use to change status of the product
     * @access private
     * @return json
     * Created by Udit
     * @smartData Enterprises (I) Ltd
     * Created Date 9-Feb-2017
     */
    function productStatusChange(req, res) {
        if (!req.body.product_id || !req.body.status) {
            return res.json(Response(402, "failed", constantsObj.validationMessages.requiredFieldsMissing));
        } else {
            Product.findById(req.body.product_id).exec(function (err, prod) {
                if (err) {
                    return res.json(Response(500, "failed", constantsObj.validationMessages.internalError, err));
                } else {
                    if (!prod) {
                        return res.json(Response(402, "failed", constantsObj.validationMessages.productNotFound));
                    } else {
                        prod.status = parseInt(req.body.status);
                        prod.save(function (err, savedData) {
                            if (err) {
                                return res.json(Response(500, "failed", constantsObj.validationMessages.internalError, {}));
                            } else {
                                return res.json(Response(200, "success", constantsObj.messages.productStatusChangeSuccess, {}));
                            }
                        });
                    }
                }
            });
        }
    }

    /**
     * Function is use to delete product
     * @access private
     * @return json
     * Created by Udit
     * @smartData Enterprises (I) Ltd
     * Created Date 9-Feb-2017
     */
    function deleteProduct(req, res) {
        if (!req.body.product_id) {
            return res.json(Response(402, "failed", constantsObj.validationMessages.requiredFieldsMissing));
        } else {
            Product.findById(req.body.product_id).exec(function (err, prod) {
                if (err) {
                    return res.json(Response(500, "failed", constantsObj.validationMessages.internalError, err));
                } else {
                    if (!prod) {
                        return res.json(Response(402, "failed", constantsObj.validationMessages.productNotFound));
                    } else {
                        prod.deleted = true;
                        prod.save(function (err, savedData) {
                            if (err) {
                                return res.json(Response(500, "failed", constantsObj.validationMessages.internalError, {}));
                            } else {
                                ProductAttribute.findOne({
                                    product_id: req.body.product_id
                                }).exec(function (err, data) {
                                    if (!err && data) {
                                        data.deleted = true;
                                        data.save();
                                    }
                                });
                                return res.json(Response(200, "success", constantsObj.messages.productDeleteSuccess, {}));
                            }
                        });
                    }
                }
            });
        }
    }



    function fileExistCheck(images, callback) {
        if (images) {
            var split = images.split('assets/uploads/');
            utility.fileExistCheck('./public/assets/uploads/' + split[1], function (exist) {
                if (!exist) {
                    images = 'assets/images/default-image.png';
                }
                callback(images);
            });
        } else {
            images = 'assets/images/default-image.png';
            callback(images);
        }
    }

    /**
     * Function is use to get User by id
     * @access private
     * @return json
     * Created by Udit
     * @smartData Enterprises (I) Ltd
     * Created Date 27-Jan-2017
     */
    function getUserByIdAdmin(req, res) {
        var id = req.swagger.params.id.value;
        User.findOne({
                _id: id
            }, 'firstname lastname email role')
            .lean()
            .exec(function (err, data) {
                if (err) {
                    return res.json(Response(500, "failed", constantsObj.validationMessages.internalError, err));
                } else {
                    if (data) {
                        Role.aggregate([{
                            $match: {
                                _id: data.role
                            }
                        }], function (err, role) {
                            var code = '';
                            if (role[0]) {
                                if (role[0].code) {
                                    code = role[0].code;

                                }
                            }
                            // console.log('code',code);
                            data.role_code = code;
                            return res.json({
                                'code': 200,
                                status: 'success',
                                "message": constantsObj.messages.dataRetrievedSuccess,
                                "data": data
                            });
                        });
                    } else {
                        return res.json(Response(402, "failed", constantsObj.validationMessages.userNotFound, {}));
                    }
                }
            });
    }