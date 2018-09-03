'use strict';
/*
 * Utility - utility.js
 * Author: smartData Enterprises
 * Date: 3rd Jan 2017
 */
var constantsObj = require('./../../constants');
var mongoose = require('mongoose');
var crypto = require('crypto'),
    algorithm = constantsObj.config.cryptoAlgorithm,
    password = constantsObj.config.cryptoPassword;
var nodemailer = require('nodemailer');
var fs = require("fs");
var path = require('path');
var config = require('../../config/config.js')
var nodemailer = require('nodemailer');
var ProductImage = require('../models/job_images.js');
var async = require('async');
var FCM = require('fcm-node');
var apn = require('apn');
process.env.DEBUG = 'apn';
var shortid = require('shortid');
var User = require('../models/users');
var co = require("co");
var jwt = require('jsonwebtoken');

var utility = {};

utility.getEncryptText = function(text) {
    var cipher = crypto.createCipher(algorithm, password);
    text = cipher.update(text, 'utf8', 'hex');
    text += cipher.final('hex');
    return text;
}

utility.getDecryptText = function(text) {
    var decipher = crypto.createDecipher(algorithm, password)
    var text = decipher.update(text, 'hex', 'utf8')
    text += decipher.final('utf8');
    return text;
}

utility.readTemplateSendMail = function(to, subject, userData, templateFile, callback) {
    var filePath = path.join(__dirname, '/email_templates/' + templateFile + '.html');
    fs.readFile(filePath, {
        encoding: 'utf-8'
    }, function(err, data) {
        if (!err) {
            var template = data
                .replace(/{baseUrl}/g, config.webUrl)
                .replace(/{email}/g, userData.email)
                .replace(/{firstname}/g, utility.capitalize(userData.firstname))
                .replace(/{lastname}/g, utility.capitalize(userData.lastname))
                .replace(/{password}/g, userData.password)
                .replace(/{verifying_token}/g, userData.verifying_token)
                .replace(/{download_token}/g, userData.download_token)
               
console.log(" subject -------",subject," template ---------", template)
            utility.sendmail(userData.email, subject, template, function(mailErr, resp) {
                if (err)
                    callback(mailErr);
                else
                    callback(null, true);
            });
        } else {
            callback(err);
        }
    });
}

utility.readTemplateSendMailSubscribe = function(to, subject, userData, templateFile, callback) {
    var filePath = path.join(__dirname, '/email_templates/' + templateFile + '.html');
    fs.readFile(filePath, {
        encoding: 'utf-8'
    }, function(err, data) {
        if (!err) {
            var template = data
                .replace(/{baseUrl}/g, config.webUrl)
                .replace(/{email}/g, userData.email)

            utility.sendmail(userData.email, subject, template, function(mailErr, resp) {
                if (err)
                    callback(mailErr);
                else
                    callback(null, true);
            });
        } else {
            callback(err);
        }
    });
}

//Feedback
utility.readTemplateSendFeedback = function(to, subject, userData, templateFile, callback) {
    var filePath = path.join(__dirname, '/email_templates/' + templateFile + '.html');
    fs.readFile(filePath, {
        encoding: 'utf-8'
    }, function(err, data) {
        if (!err) {
            var template = data
                .replace(/{baseUrl}/g, config.webUrl)
                .replace(/{email}/g, userData.email)
                .replace(/{firstname}/g, utility.capitalize(userData.firstname))
                .replace(/{lastname}/g, utility.capitalize(userData.lastname))
                .replace(/{message}/g, utility.capitalize(userData.message))
                
            utility.sendFeedbackmail(userData.email, subject, template, function(mailErr, resp) {
                if (err)
                    callback(mailErr);
                else
                    callback(null, true);
            });
        } else {
            callback(err);
        }
    });
}


utility.sendmail = function(to, subject, message, callback) {
    var smtpTransport = nodemailer.createTransport("SMTP", {
        service: 'GMAIL',
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
            user: 'info@getmydaily.com',
            pass: 'Smartdata1'
        }
    });

    var mailOptions = {
        to: to,
        from: 'info@getmydaily.com',
        cc: 'info@getmydaily.com',
        replyTo : 'info@getmydaily.com.',
        subject: subject,
        html: message
    };
    smtpTransport.sendMail(mailOptions, function(err) {
        if (err) {
            console.log(err, 'mail send Error');
            callback(err);
        } else {
            console.log('info', 'An e-mail has been sent to  with further instructions.');
            callback(null, true);
        }
    });
}

//Feedback...................

utility.sendFeedbackmail = function(to, subject, message, callback) {

    var smtpTransport = nodemailer.createTransport("SMTP", {
        service: 'GMAIL',
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
            user: 'info@getmydaily.com',
            pass: 'Smartdata1'
        }
    });

    var mailOptions = {
        to: to,
        from: 'info@getmydaily.com',
        cc: 'info@getmydaily.com',
        bcc:'admin.ryan@yopmail.com',
        replyTo : 'info@getmydaily.com.',
        subject: subject,
        html: message
    };
    smtpTransport.sendMail(mailOptions, function(err) {
        if (err) {
            console.log(err, 'mail send Error');
            callback(err);
        } else {
            console.log('info', 'An e-mail has been sent to  with further instructions.');
            callback(null, true);
        }
    });
}

utility.uploadImage = function(imageBase64, imageName, callback) {
    if (imageBase64 && imageName) {
        var timestamp = Number(new Date()); // current time as number
        var filename = +timestamp + '_' + imageName;
        var imagePath = "./public/assets/uploads/" + filename;
        fs.writeFile(path.resolve(imagePath), imageBase64, 'base64', function(err) {
            if (!err) {
                callback(config.webUrl + "/assets/uploads/" + filename);
            } else {
                callback(config.webUrl + "/assets/images/default-image.png");
            }
        });
    } else {
        callback(false);
    }
}
utility.fileExistCheck = function(path, callback) {
    fs.exists(path, function(err) {
        if (err) {
            callback(true);
        } else {
            callback(false);
        }
    });
}

utility.validationErrorHandler = function(err) {
    var errMessage = constantsObj.validationMessages.internalError;
    if (err.errors) {
        for (var i in err.errors) {
            errMessage = err.errors[i].message;
        }
    }
    return errMessage;
}

utility.filterProductData = function(listArr, status, callback) {
    var mainArr = [];
    async.eachSeries(listArr,
        function(result, callback) {
            if (result.product_id) {
                var prodStatus = status || 1;
                // if (status == 'sold/listing') {
                //     var condition = (result.product_id.status == 3 || result.product_id.status == 1) && (result.product_id.deleted == false);
                // } else {
                    var condition = (result.product_id.status == prodStatus) && (result.product_id.deleted == false);
                // }
                if (condition) {
                    delete result.product_id.deleted;
                    result.product_image = [];
                    ProductImage.find({ product_id: result.product_id._id, deleted: false }, 'product_image').exec(function(err, prodImage) {
                        if (err)
                            callback(err);
                        else {
                            if (prodImage.length > 0) {
                                /*async.eachSeries(prodImage,
                                    function(result1, callback) {
                                        // var split = result1.product_image.split('assets/uploads/products/');
                                        // utility.fileExistCheck('./public/assets/uploads/products/' + split[1], function(exist) {
                                        //     if (exist) {
                                                result.product_image.push(result1.product_image);
                                            // }
                                            callback(null);
                                        // });
                                    },
                                    function(err) {
                                        mainArr.push(result);
                                        callback(null);
                                    });*/
                                    for(var i in prodImage) {
                                        result.product_image.push(prodImage[i].product_image);
                                    }
                                    mainArr.push(result);
                                    callback(null);
                            } else {
                                // setTimeout(function() {
                                    // result.product_image.push('assets/images/no-image-available.jpg');
                                    mainArr.push(result);
                                    callback(null);
                                // }, 0);
                            }
                        }
                    });
                } else {
                    callback(null);
                }
            } else {
                callback(null);
            }
        },
        function(err) {
            if (err)
                callback(err);
            else
                callback(null, mainArr);
        });
}

utility.sendNotificationTOAndroid = function(to, body, title, sendData) {
    return new Promise(function(resolve, reject) {
        var serverKey = 'AIzaSyARFNY551JjwD82vHexT6XH3F5bueUSvZM';
        var fcm = new FCM(serverKey);
        async.eachSeries(to, 
            function(result, callback) {
                var message = { //this may vary according to the message type (single recipient, multicast, topic, et cetera)
                    to: result,
                    collapse_key: 'mydaily-dev',
                    notification: {
                        title: title,
                        body: body
                    }
                };
                if (sendData) {
                    message.data = sendData;
                }
                fcm.send(message, function(err, response) {
                    if (err) {
                        console.log("Something went wrong!");
                        callback(err);
                    } else {
                        console.log("Successfully sent with response: ", response);
                        callback(null);
                    }
                });
            }, function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve(true);
                }
        });
    });
}
// utility.sendNotificationTOAndroid(['e9ZLS0QACFw:APA91bHq3o4Jhf98kUB_QEGflcr6aBPcsCs111cUDBq-pJTA3JeoqpFPzz8fnUaXoXviOUBsLzBAVx2OivXKlh3CnCdbDd14Bs1A7Wn1sfg73hyq2zpRgpoXYliGewJIh_3b0a7x3MYH'], 'test notification', 'test title', '5sa4d5sa4d54sa5d45');
var apnError = function(err) {
    console.log("APN Error:", err);
}

try{
    var options = {
        // "cert": path.resolve(__dirname + "/../../config/pem/prod/NeoBookCertR.pem"),//Production
        // "key": path.resolve(__dirname + "/../../config/pem/prod/NeoBookKeyR.pem"),//Production
        "cert": path.resolve(__dirname + "/../../config/pem/dev/NeoBookCertR.pem"),//Development
        "key": path.resolve(__dirname + "/../../config/pem/dev/NeoBookKeyR.pem"),//Development
        "passphrase": "123456",
        "gateway": "gateway.sandbox.push.apple.com",//Development
        // "gateway": "gateway.push.apple.com",//Production
        "port": 2195,
        "enhanced": true,
        "cacheLength": 5
    };
    options.errorCallback = apnError;
} catch(e){
    console.log('error', e);
}
  
utility.sendNotificationToIphone = function(message, recipents, sendData) {
    return new Promise(function(resolve, reject) {
        try {
            var productId = sendData || '';
            var type = type || '';
            var apnConnection = new apn.Connection(options);
            var note = new apn.Notification();
   
            note.expiry = Math.floor(Date.now() / 1000) + 3600; // Expires 1 hour from now.
            note.badge = 1;
            note.sound = "ping.aiff";
            note.alert = message;
            note.payload = { 'messageFrom': sendData}; 
            async.eachSeries(recipents,  
                function(result, callback) {
                    var myDevice = new apn.Device(result);
                    if (apnConnection) {
                        console.log('Notification sent', result);
                        apnConnection.pushNotification(note, myDevice);
                    }
                    callback(null);
                }, function(err) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(true);
                    }
            });
        } catch (e) {
            console.log('errrrrrrrr', e);
            reject(e);
        }
    });
}
       
// utility.sendNotificationToIphone('Test message', ['fef09b8ac4776664d0f980da9d4b06baa4dcd1bf165d12201e5e7cb92c3715e2'], {product_id: '545d4f5sd4f545sd4fd56', type: 'Offer', product_category_id: '56s64dgf5d4fg5gdf'});

utility.sendNotificationByUserId = (userId, message, body, DailiesData) => {
    return new Promise(function(resolve, reject) {
        User.findById(userId).exec((err, user) => {
            if (err) {
                reject(err);
            } else {
                if (user) {
                    try{
                        var sendData = {daily_number: DailiesData.daily_number, type: body, job_map: DailiesData.job_map};
                        if (user.deviceInfo.length > 0) {
                            async.eachSeries(user.deviceInfo, 
                                function(result, callback) {
                                    if (result.deviceType == 'Android') {
                                        utility.sendNotificationTOAndroid([result.deviceToken], message, body, sendData).then((res) => {
                                            // callback(null);
                                        }).catch((err) => {
                                            console.log('Android error', err);
                                            // callback(err);
                                        });
                                        callback(null);
                                    } else if (result.deviceType == 'iOS') {
                                        utility.sendNotificationToIphone(message, [result.deviceToken], sendData).then((res) => {
                                            // callback(null);
                                        }).catch((err) => {
                                            console.log('IOS error', err);
                                            // callback(err);
                                        });                      
                                        callback(null);  
                                    } else {
                                        callback('Device type not found');    
                                    }
                                },
                                    function(err) {
                                        if (err) 
                                            reject(err);
                                        else
                                            resolve(true);
                                });
                        } else {
                            reject('No device found');     
                        }
                    } catch(err) {
                        console.log('Catch error', err);
                        reject(err);
                    }
                } else {
                    reject('User not found');
                }
            }
        });
    });
}

utility.generateCustomerID = function(){
   var customerID = Math.floor(1000 + Math.random() * 9000);
   return customerID;
}

utility.generateJobID = function(){
    var orderId = shortid.generate();
    return orderId;
}

utility.generateOrderID = function() {
    return new Promise(function(resolve, reject) {
        var orderId = shortid.generate();
        Order.findOne({ order_id: orderId }).exec(function(err, order) {
            if (err) {
                reject(err);
            } else {
                if (order) {
                    utility.generateProduct();
                } else {
                    resolve(orderId);
                }
            }
        });
    });
}

utility.checkIsbnBookCount = (isbn) => {
   return new Promise((resolve, reject) => {
        var condition = { deleted: false };
        condition.$or = [
            { 'isbn_1': new RegExp(isbn, 'gi') },
            { 'isbn_2': new RegExp(isbn, 'gi') }
        ];
        ProductAttribute.find(condition).populate('product_id', { updatedAt: 0, createdAt: 0, __v: 0 }).exec((err, product) => {
            if (err)
                reject(err);
            else {
                var listArr = [];
                if (product.length > 0) {
                    for(var i in product) {
                        if (product[i].product_id.status == 1 && product[i].product_id.deleted == false) {
                            listArr.push(product[i]);
                        }
                    }
                }
                resolve(listArr.length);
            }
        });
    });
}

utility.sendNotificationToWishlistISBN = (bookTitle, isbn1, isbn2, sendData) => {
    Wishlist.find({status: 'active', deleted: false, $or :  [
            { 'isbn_1': new RegExp(isbn1, 'gi') },
            { 'isbn_1': new RegExp(isbn2, 'gi') }
        ]}).exec(function(err, wishlistData){
            if (wishlistData.length > 0) {
                async.eachSeries(wishlistData, 
                    function(result, callback) {
                        result.is_read = false;
                        result.save();
                        utility.sendNotificationByUserId(result.added_by, bookTitle+' is available for sale', 'Match found', sendData).then(function(res){
                            console.log('message sent successfully', res);
                            callback(null);
                        }).catch(function(err){
                            console.log('Error in push notification', err);
                            callback(null);
                        });        
                }, function(err) {
                    console.log('Notification sent');
                });
            }
        });
}

utility.fileUpload = function(imagePath, buffer) {
    return new Promise(function(resolve, reject) {
        fs.writeFile(path.resolve(imagePath), buffer, function(err) {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
}


utility.parseProductAdmin = function(productDetails) {
    var newProdArr = [];
    async.eachSeries(productDetails, function(result, callback) {
        var obj = {title: result.title, author: result.author, edition: result.edition, isbn_1: result.isbn_1, isbn_2: result.isbn_2,
         condition: result.condition,  product_unique_id: result.product_unique_id};
         obj.product_id = {};
         obj.product_id.name = result.products.name;
         obj.product_id.price = result.products.price;
         obj.product_id.status = result.products.status;
         obj.product_id._id = result.products._id;
         // obj.product_category_id = {};
         obj.product_image = [];
         for (var i in result.product_images) {
            obj.product_image.push(product_image);
         }
         newProdArr.push(obj);
    }, function(err) {

    });
}

utility.getUserAvgRating = function(id, callback) {
    Rating.aggregate([
        {$match: {rating_to: id}},
        { "$group": {
            "_id": '$rating_to',
            "avgRating": { "$avg": { "$ifNull": ["$rating",0 ] } }    
        }}
    ], function (err, rating) {
        if (err) {
            callback(err);
        } else {
            var rate = 0;
            if (rating[0]) {
                if (rating[0].avgRating) {
                    rate = rating[0].avgRating;
                }
            }
            callback(null, rate);
        }
    });
}

utility.getSortObj = function(body) {
    var sorting = {_id: -1};
    for (var key in body) {
            var reg = new RegExp("sorting", 'gi');
            if (reg.test(key)) {
                var value = body[key];
                key = key.replace(/sorting/g, '').replace(/\[/g, '').replace(/\]/g, '');
                var sorting = {};
                 if (value == 1 || value == -1) {
                    sorting[key] = value;
                } else {
                    sorting[key] = (value == 'desc') ? -1 : 1;
                }
            }
    }
    return sorting;
}

utility.validateArray = function(array) {
    if (!array) {
        return false;
    } else {
        if (Array.isArray(array)) {
            return ((array.length) ? true : false);            
        } else {
            return false;
        }
    }
}
utility.removeExpiredTokenOfUser = function(user) {
    if (user.deviceInfo.length > 0) {
        var deviceArr = [];
        async.eachSeries(user.deviceInfo, function(result, callback) {
            try {
                var decoded = jwt.verify(result.access_token, constantsObj.config.secret);
                deviceArr.push(result);
                callback(null);
            } catch (err) {
                callback(null);
            }
        }, function(err) {
            user.deviceInfo = deviceArr;
            user.save();
        });
    }
}

utility.capitalize = function(input){
    return input.charAt(0).toUpperCase() + input.substr(1).toLowerCase();
}

// utility.bodyCheck = function(body, bodyCheck) {
//     for ()
//     return input.charAt(0).toUpperCase() + input.substr(1).toLowerCase();
// }
utility.markAsReaded = function(req) {
    try{
            Chat.find({ 
                deleted: false, 
                status: 'Pending', 
                '$or': [{'buyer_id': mongoose.Types.ObjectId(req.user._id)}, {'seller_id': mongoose.Types.ObjectId(req.user._id)}] 
            })
            .then(function(data) {
                if (data.length > 0) {
                    async.eachSeries(data, function(result, callback) {
                        if (!result.readedBy) {
                            result.readedBy = [];
                        }
                        if (result.readedBy.length > 0 && result.readedBy.length < 2) {
                            var exist = false;
                            for (var i = 0; i < result.readedBy.length; i++) {
                                if (result.readedBy[i].toString() == req.user._id.toString()) {
                                    exist = true;
                                }
                                if (!exist) {
                                    result.readedBy.push(req.user._id.toString());
                                    result.save();
                                }
                            }
                        } else {
                            if (result.readedBy.length == 0) {
                                result.readedBy.push(req.user._id.toString());
                                result.save();
                            }
                        }
                        callback(null);
                    }, function(err) {

                    });
                }
            }).catch(function(err){

            });
    } catch(e) {
        console.log('Error', e);
    }
}
module.exports = utility;
