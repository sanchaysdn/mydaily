"use strict";

angular.module("Home")


neoApp.controller("homeController", ['$scope', '$rootScope', '$localStorage', '$location', 'HomeService', 'CommonService', 'DailiesService', 'UserService', 'SubscriptionService', '$uibModal', '$filter', '$compile', 'logger', 'moment', '$state',
    function ($scope, $rootScope, $localStorage, $location, HomeService, CommonService, DailiesService, UserService, SubscriptionService, $uibModal, $compile, logger, moment, $state) {

// $scope.workReportList=[];
        $scope.counts = {};

        $scope.PageLocation = $location.path().split('/');

        $rootScope.locationPage = $scope.PageLocation[1];


        if (CommonService.getUser() && (Object.keys(CommonService.getUser()).length !== 0)) {
            $rootScope.user_level = CommonService.getUser().role.code;

            $rootScope.customer_id = CommonService.getUser().customer_id;
            $rootScope.user = CommonService.getUser();
            $rootScope.user.currentDate= new Date();
            if($rootScope.user.currentDate<=$rootScope.user.reminder_date){
                $scope.showButton= true;
            }
            console.log("$rootScope.user.currentDate",$rootScope.user.currentDate)
            $rootScope.username = CommonService.getUser().firstname + ' ' + CommonService.getUser().lastname;

        }

        
        $scope.activationMessage = function () {
            $scope.parmas = $location.search();
            $scope.success = $scope.parmas.success;
        }

        $scope.getCounts = function () {
            HomeService.getCounts().get(function (response) {
                if (response.code == 200) {
                    $scope.counts = response.data;
                }
            });
        }




        // $scope.getJobIDs = function (job) {
        //     $scope.users_id = {}
        //     $scope.users_id = CommonService.getUser()._id;
        //     HomeService.getjobMapById().save({ users_id: $scope.users_id }, function (response) {
        //         if (response.code == 200) {
        //             $scope.jobID = response.data;
        //         }
        //     })
        // }
        // $rootScope.initBool = ($location.url() == '/dailies') ? false : ($location.url() == '/dashboard') ? true : null
        $scope.getUserCount = function () {
            UserService.getUsersList().get(function (response) {
                if (response.code == 200) {
                    $scope.userchart = response.data;
                    $scope.userlength = response.totalLength;

                }
            });
        }

    

        // $scope.switchHtml = function (val) {
        //     //console.log(val);
        //     (val) ? $state.go('dailies'): $state.go('dashboard')
        //     // if (val == false)
        //     // 	$state.go('dailies')
        //     // if (val == true)
        //     // 	$state.go('dashboard')
        // }

        $scope.getSubscriptionCount = function () {
            SubscriptionService.subscriptionCount().save({}, function (response) {
                if (response.code == 200) {
                    $scope.subscriptionlength = response.totalLength;

                }
            });
        }

        $scope.getyearlyDetails = function (yearlist) {

        }


        $scope.getyearlychart = function () {

            var user_id = CommonService.getUser()._id;
            UserService.contractorCount().save({
                user_id: user_id,
                year: true
            }, function (response) {
                if (response.code == 200) {
                    $scope.userdata = response.data;
                    $scope.year = $scope.userdata.map(function (a, b) {
                        return a._id
                    });
                    $scope.usercount = $scope.userdata.map(function (a) {
                        return a.count;
                    });
                    Highcharts.chart('yearlyusers', {

                        title: {
                            text: ''
                        },
                        credits: {
                            enabled: false
                        },
                        xAxis: {
                            title: {
                                text: ' Years'
                            },
                            categories: $scope.year
                        },
                        yAxis: {
                            title: {
                                text: ' Number of users'
                            }
                        },
                        legend: {
                            layout: 'vertical',
                            align: 'right',
                            verticalAlign: 'middle'
                        },
                        plotOptions: {

                        },
                        series: [{
                            name: 'Yearly Users',
                            data: $scope.usercount
                        }]
                    });
                }
            });
        }


        $scope.getmonthlychart = function () {

            var user_id = CommonService.getUser()._id;
            var currentYear = new Date().getFullYear();

            UserService.contractorCount().save({
                user_id: user_id,
                month: true
            }, function (response) {
                if (response.code == 200) {
                    $scope.monthlyuserdata = response.data;
                    var monthdata = "";
                    var month = $scope.monthlyuserdata.map(function (a, b) {
                        return a._id
                    });
                    $scope.usermonthlycount = $scope.monthlyuserdata.map(function (a) {
                        return a.count;
                    });

                    Highcharts.chart('monthlyusers', {

                        title: {
                            text: ''
                        },
                        credits: {
                            enabled: false
                        },
                        xAxis: {
                            title: {
                                text: 'Monthly Jan - Dec'
                            },
                            categories: month
                        },
                        yAxis: {
                            title: {
                                text: ' Number of users'
                            }
                        },
                        legend: {
                            layout: 'vertical',
                            align: 'right',
                            verticalAlign: 'middle'
                        },
                        plotOptions: {

                        },
                        series: [{
                            name: 'Monthly Users',
                            data: $scope.usermonthlycount
                        }]
                    });
                }
            });
        }



        $scope.getCmsPage = function (name) {
            HomeService.getCmsPageByName().save({
                name: name
            }, function (response) {
                if (response.code == 200) {
                    $scope.cmsPage = response.data;
                }
            });
        }


        $scope.typeSupervisor = function () {
            $rootScope.supervisorFlag = true;
            $rootScope.foremenFlag = false;
        }


        $scope.typeForemen = function () {
            $rootScope.supervisorFlag = false;
            $rootScope.foremenFlag = true;
        }



        $scope.viewDailiesDetail = function (dailies_number) {
            $scope.dailies = {};
            $scope.dailies.dailies_number = dailies_number;
            DailiesService.getDailiesByID().save($scope.dailies, function (response) {
                if (response.code == 200) {
                    $scope.dailiesData = response.data;
                    var modalInstance = $uibModal.open({
                        animation: $scope.animationsEnabled,
                        templateUrl: '/admin/modules/my_dailies/views/dailies_view.html',
                        controller: 'dailie_detail',
                        windowClass: 'zindex',
                        // size: size,
                        resolve: {
                            dailies: $scope.dailiesData[0]
                        }
                    })
                }
            })
        }


$scope.showWorkReport = function(users){
    $rootScope.users =users
    var modalInstance = $uibModal.open({
        animation: $scope.animationsEnabled,
        templateUrl: '/admin/modules/home/views/showWorkReport.html',
        controller: 'foremanModalCtrl',
        windowClass: 'zindex',
        // size: size,
        resolve: {
            items: function () {
            return $rootScope.users
            }
        }
    }); 
}













        $scope.clearsearch = function () {
            document.getElementById('pac-input').value = "";
            $scope.getdailiesdetails();
            $scope.data_length = 0
        }

        $scope.dynamicbtn = function (keys) {
            $scope.data_length = keys.length;


        }
$scope.getForemenReport = function(){
    $scope.workReportList=[];
    HomeService.getForemenReport().get({}, function (response) {
                            // $scope.tableLoader = false;
                            // $scope.paramUrlActive = paramUrl;
                            if(response.code==200){
                                
                                // console.log('>>>>>>>>>>><<<<<<<<<',response.data)
                             $scope.workReportList = response.data;
                            //  var defaultCount = 0;
                            //  var defaulterArray = [];
                            //  var defaulterArray = response.defaulterCount
                            //  for(var i=0;i<defaulterArray.length;i++){
                            //     for(var j=i+1;j<defaulterArray.length;j++){
                            //         if(defaulterArray[i].id==defaulterArray[j].id){
                            //             defaultCount = defaultCount + 1
                            //         }
                            //         else{
                            //         }
                            //     }
                            // }
                            }
                            // console.log('count',defaultCount)
                            
                            // var data = response.data;
                            // $scope.totalLength = response.totalLength;
                            // params.total(response.totalLength);
                            // $defer.resolve(data);
                        });



}


    // $scope.cancel = function () {
    //     console.log("Cancel>>>>>>>>>>>>")
    //         $uibModalInstance.dismiss('cancel');
    //     };

    // $scope.viewDailiesDetail = function (dailies) {

    //             var modalInstance = $uibModal.open({
    //                 animation: $scope.animationsEnabled,
    //                 templateUrl: '/admin/modules/my_dailies/views/dailies_view.html',
    //                 controller: 'dailies_detail',
    //                 windowClass: 'zindex',
    //                 // size: size,
    //                 resolve: {
    //                     dailies: dailies
    //                 }
    //             });


    //         }












        $scope.getdailiesdetails = function () {
            $scope.parent_id = {}
            $scope.parent_id = CommonService.getUser()._id;
            DailiesService.getDailiesList().save({
                parent_id: $scope.parent_id
            }, function (response) {
                if (response.code == 200 && response.data.length > 0) {
                    $scope.data = response.data;
                    $scope.location = [];
                    for (var i = 0; i < $scope.data.length; i++) {
                        $scope.location.push({
                            "lng": parseFloat($scope.data[i].longitude),
                            "lat": parseFloat($scope.data[i].latitude),
                            "foreman": $scope.data[i].foremen_details.firstname + " " + $scope.data[i].foremen_details.lastname,
                            "from_date": moment($scope.data[i].from_date).format('MMMM Do YYYY, h:mm:ss a'),
                            "daily_number": $scope.data[i].daily_number,
                            "job_map": $scope.data[i].job_map,
                            "billable_items": $scope.data[i].billable_items,
                            "id": $scope.data[i]._id
                        })

                    }

                    $scope.markerfeed = [];
                    var myLatLng = {
                        lat: $scope.location[0].lat,
                        lng: $scope.location[0].lng
                    };
                    var map = new google.maps.Map(document.getElementById('map'), {
                        zoom: 12,
                        center: myLatLng
                    })
                    $scope.infowindow = new google.maps.InfoWindow({
                        content: '',
                        maxWidth: 260
                    });
                    var oms = new OverlappingMarkerSpiderfier(map, {
                        markersWontMove: true,
                        markersWontHide: true,
                        basicFormatEvents: true
                    });

                    for (var i = 0; i < $scope.location.length; i++) {

                        //var labels = '#' + $scope.location[i].daily_number;
                        var markers = new google.maps.Marker({
                            position: $scope.location[i],
                            map: map,
                            animation: google.maps.Animation.DROP,
                            icon: '/assets/images/gps.png'
                        })
                        $scope.markerfeed.push(markers);
                        oms.addMarker(markers);
                        var content = '<div id="iw-container">' +
                            '<div class="iw-content">' +
                            '<div class="list-group col col-sm-6">' +
                            '<a class="list-group-item"><span>#' + $scope.location[i].daily_number + '</span></a>' +
                            '<a class="list-group-item"><span>' + $scope.location[i].from_date + '</span></a>' +
                            '<a class="list-group-item"><span>' + $scope.location[i].foreman + '</span></a>' +
                            '</div>' +
                            '<div class="list-group col col-sm-6">';
                        if ($scope.location[i].billable_items.length > 0) {
                            content += '<a class="list-group-item"><span>' + $scope.location[i].billable_items[0].name + '</span></a>' +
                                '<a class="list-group-item"><span>' + $scope.location[i].billable_items[0].quantity + '</span></a>';
                        }
                        content += '<a class="list-group-item" ng-click="viewDailiesDetail(' + $scope.location[i].daily_number + ')"><span>more...</span></a>' +
                            '<a class="list-group-item"><span>' + $scope.location[i].job_map + '</span></a>' +
                            '</div>' +
                            '</div>' +
                            '</div>';
                        var compiledContent = $compile(content)($scope)
                        google.maps.event.addListener(markers, 'spider_click', (function (markers, content, scope) {
                            return function () {
                                scope.infowindow.setContent(content);
                                scope.infowindow.open(scope.map, markers);
                            };

                        })(markers, compiledContent[0], $scope));
                    } //FOR LOOP END,

                    var markerCluster = new MarkerClusterer(map, $scope.markerfeed, {
                        maxZoom: 15,
                        imagePath: 'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m'
                    });
                } else {
                    var uluru = {
                        lat: 30.6972563,
                        lng: -88.1910169
                    };
                    var map = new google.maps.Map(document.getElementById('map'), {
                        zoom: 12,
                        center: uluru
                    })
                }
            }) //Dailies marker on map


            //Google Map Dailies Searching 
            var input = document.getElementById('pac-input');
            var searchBox = new google.maps.places.SearchBox(input);
            var autocomplete = new google.maps.places.Autocomplete(input);
            google.maps.event.addListener(autocomplete, 'place_changed', function () {
                $scope.dailies = {};
                var geoComponents = autocomplete.getPlace();
                var location = geoComponents.formatted_address
                var latitude = geoComponents.geometry.location.lat();
                var longitude = geoComponents.geometry.location.lng();
                $scope.dailies.long = longitude;
                $scope.dailies.lat = latitude;
                $scope.dailies.location = location;
                $scope.dailies.parent_id = CommonService.getUser()._id;
                DailiesService.getDailiesList().save($scope.dailies, function (response) {
                    if (response.code == 200 && response.data.length > 0) {
                        $scope.dailiesData = response.data
                        $scope.locations = [];
                        for (var i = 0; i < $scope.dailiesData.length; i++) {
                            $scope.locations.push({
                                "lng": parseFloat($scope.dailiesData[i].longitude),
                                "lat": parseFloat($scope.dailiesData[i].latitude),
                                "foreman": $scope.dailiesData[i].user_id.firstname + " " + $scope.dailiesData[i].user_id.lastname,
                                "from_date": new Date($scope.dailiesData[i].from_date).toString("yyyy MMM dd"),
                                "daily_number": $scope.dailiesData[i].daily_number,
                                "job_map": $scope.dailiesData[i].job_map,
                                "billable_items": $scope.dailiesData[i].billable_items,
                                "id": $scope.dailiesData[i]._id
                            })

                        }

                        var map = new google.maps.Map(document.getElementById('map'), {
                            zoom: 12,
                            center: $scope.locations[0]
                        })

                        $scope.infowindow = new google.maps.InfoWindow({
                            content: '',
                            maxWidth: 260
                        });


                        for (var i = 0; i < $scope.locations.length; i++) {

                            //var labels = '#' + $scope.locations[i].daily_number;
                            var markers = new google.maps.Marker({
                                position: $scope.locations[i],
                                map: map,
                                animation: google.maps.Animation.DROP,
                                icon: '/assets/images/pin.png'
                            })
                            var content = '<div id="iw-container">' +
                                '<div class="iw-content">' +
                                '<div class="list-group col col-sm-6">' +
                                '<a class="list-group-item"><span>#' + $scope.location[i].daily_number + '</span></a>' +
                                '<a class="list-group-item"><span>' + $scope.location[i].from_date + '</span></a>' +
                                '<a class="list-group-item"><span>' + $scope.location[i].foreman + '</span></a>' +
                                '</div>' +
                                '<div class="list-group col col-sm-6">';
                            if ($scope.location[i].billable_items.length > 0) {
                                content += '<a class="list-group-item"><span>' + $scope.location[i].billable_items[0].name + '</span></a>' +
                                    '<a class="list-group-item"><span>' + $scope.location[i].billable_items[0].quantity + '</span></a>';
                            }
                            content += '<a class="list-group-item" ng-click="viewDailiesDetail(' + $scope.location[i].daily_number + ')"><span>more...</span></a>' +
                                '<a class="list-group-item"><span>' + $scope.location[i].job_map + '</span></a>' +
                                '</div>' +
                                '</div>' +
                                '</div>';
                            var compiledContent = $compile(content)($scope)
                            google.maps.event.addListener(markers, 'click', (function (markers, content, scope) {
                                return function () {
                                    scope.infowindow.setContent(content);
                                    scope.infowindow.open(scope.map, markers);
                                };
                            })(markers, compiledContent[0], $scope));

                        }
                    } else {
                        logger.logError("No search found");
                        var map = new google.maps.Map(document.getElementById('map'), {
                            zoom: 12,
                            center: {
                                lat: latitude,
                                lng: longitude
                            }
                        })
                        var myLatLng = {
                            lat: latitude,
                            lng: longitude
                        };
                        var marker = new google.maps.Marker({
                            position: myLatLng,
                            map: map

                        });
                    }
                });
            })
        }



    }
]);

neoApp.controller('dailie_detail', function ($scope, $uibModalInstance, $location, logger, dailies) {

    $scope.dailies = dailies;
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
    $scope.ok = function () {
        $uibModalInstance.dismiss('cancel');
    };


    $(document).ready(function () {
        $(".fancybox").fancybox();
    });

})


neoApp.controller('foremanModalCtrl', function ($scope, $uibModalInstance, $location, logger, items) {
    // $scope.temp = items[0]
    // $scope.dailies = dailies;
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
    $scope.ok = function () {
        $uibModalInstance.dismiss('cancel');
    };


    // $(document).ready(function () {
    //     $(".fancybox").fancybox();
    // });

})






    neoApp.controller("purhaseDailesController", ['$scope', '$rootScope', '$localStorage', 'UserService', 'ngTableParams', '$routeParams', '$route', '$location', 'logger', 'ngTableParamsService', '$state', '$stateParams', '$http', 'CommonService', '$uibModal', 'SubscriptionService', 'dataService', 'HomeService',
        function ($scope, $rootScope, $localStorage, UserService, ngTableParams, $routeParams, $route, $location, logger, ngTableParamsService, $state, $stateParams, $http, CommonService, $uibModal, SubscriptionService, dataService, HomeService) {
            $scope.crew = {};
            $scope.disabled = false;
            $scope.loader = false;
            ngTableParamsService.set('', '', '', '');
            $scope.count = 1;
            $scope.total = 20;
            $(document).ready(function () {
                $(".fancybox").fancybox();
            });

            if (CommonService.getUser() && (Object.keys(CommonService.getUser()).length !== 0)) {
                $rootScope.user_level = CommonService.getUser().role.code;

                $rootScope.customer_id = CommonService.getUser().customer_id;
                $rootScope.user = CommonService.getUser();
                $rootScope.username = CommonService.getUser().firstname + ' ' + CommonService.getUser().lastname;

            }
            console.log('$rootScope purchase', $rootScope.user);
            angular.element("#slider").slider({
                animate: true,
                value: 1,
                min: 1,
                max: 100,
                step: 1,
                slide: function (event, ui) {
                    $scope.update(1, ui.value); //changed
                }
            });
            angular.element("#count").val(1);
            angular.element("#amount").val(20);
            $(document).find("#slider").find("span").html('<label>1</label>')
            $scope.update = function (slider, val) {
                //changed. Now, directly take value from ui.value. if not set (initial, will use current value.)
                $scope.count = slider == 1 ? val : angular.element("#count").val();
                var initialPrice = 20;
                $scope.total = ($scope.count * initialPrice);
                $(document).find("#slider").find("span").html('<label>' + $scope.count + '</label>');
                $scope.$apply();
            }

            //Stripe Card init
            var stripe = Stripe('pk_test_RuDeYmoPeMI0YbwTczLeVi61'); // Stagging Server 
            // var stripe = Stripe('pk_test_2w19jETzkoOkj3syikJPMlRd');// Live Server
            // var stripe = Stripe('pk_live_b8nB0O2O86JTQsfQWwniZ7oJ'); // Live Server Org

            $scope.stripeCard = function () {
                var elements = stripe.elements();
                var style = {
                    base: {
                        color: '#333',
                        lineHeight: '24px',
                        fontSmoothing: 'antialiased',
                        fontSize: '12px',
                        '::placeholder': {
                            color: '#999'
                        }
                    },
                    invalid: {
                        color: '#a94442',
                        iconColor: '#a94442'
                    }
                };

                $scope.card = elements.create('card', {
                    hidePostalCode: true,
                    style: style
                });
                $scope.card.mount('#card-element');

                $scope.card.addEventListener('change', function (event) {
                    var displayError = document.getElementById('card-errors');
                    if (event.error) {
                        displayError.textContent = event.error.message;
                    } else {
                        displayError.textContent = '';
                    }
                });
            }

            // $scope.freeSubscription = function () {

            //     $scope.user = dataService.getData();
            //     $scope.user.trial_period = false;
            //     $scope.user.paid_status = false;
            //     UserService.addContractor().save($scope.user, function (response) {
            //         $scope.disabled = false;
            //         $scope.loader = false;
            //         if (response.code == 200) {
            //             $location.path("/contractor_signup");
            //             logger.logSuccess(response.message);
            //         } else {
            //             logger.logError(response.message);
            //         }
            //     });

            // }

            //This will hide the DIV by default.
            $scope.IsVisible = false;
            $scope.ShowHide = function () {
                //If DIV is visible it will be hidden and vice versa.
                $scope.IsVisible = $scope.IsVisible ? false : true;
            }

            var cardTypes = {
                'visa': 'Visa',
                'mastercard': 'MasterCard',
                'discover': 'Discover',
                'amex': 'American Express',
            };

            $scope.paymentInfo = {};

            $scope.tempInfo = {};
            $scope.setCardType = function (val) {
                angular.forEach(cardTypes, function (value, key) {
                    if (value == val) {
                        $scope.paymentInfo.type = key;
                    }
                });
            };

            $scope.payNow = function (form) {
                if (form.$valid) {
                    $scope.disabled = true;
                    $scope.loader = true;
                    stripe.createToken($scope.card).then(function (result) {
                        if (result.error) { // Inform the user if there was an error                    
                            $scope.loader = false;
                            var errorElement = document.getElementById('card-errors');
                            errorElement.textContent = result.error.message;
                        } else { // Send the token to your server  

                            //$scope.user = dataService.dataObj;
                            $scope.user = dataService.getData();
                             $scope.user.firstname = $rootScope.user.firstname;
                             $scope.user.lastname = $rootScope.user.lastname;
                             $scope.user.email = $rootScope.user.email;
                             $scope.user.status= $rootScope.user.status;
                             $scope.user._id= $rootScope.user._id;
                             $scope.user.company_name = $rootScope.user.company_name;
                            $scope.user.token = result.token.id;
                            $scope.user.trial_period = true;
                            $scope.user.paid_status = false;
                            $scope.user.usercount = $scope.count;
                            $scope.user.initialAmount = $scope.total;
                            $scope.user.cardInfo = $scope.paymentInfo;
                            HomeService.purchaseDailies().save($scope.user, function (response) {

                                $scope.disabled = false;
                                $scope.loader = false;
                                if (response.code == 200) {
                                    $location.path("/dailies");
                                    logger.logSuccess(response.message);
                                } else {
                                    logger.logError(response.message);
                                }
                            });
                        }
                    });

                }
            }







    }

    ]);




