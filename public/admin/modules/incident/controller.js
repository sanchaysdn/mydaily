	"use strict";

	neoApp.controller("incidentController", ['$scope', '$rootScope', '$localStorage', 'ngTableParams', '$routeParams', '$route', '$location', 'logger', 'ngTableParamsService', '$state', '$stateParams', 'CommonService', '$uibModal', '$filter', 'UserService', 'IncidentService','DailiesService','$compile',
		function ($scope, $rootScope, $localStorage, ngTableParams, $routeParams, $route, $location, logger, ngTableParamsService, $state, $stateParams, CommonService, $uibModal, $filter, UserService, IncidentService, DailiesService, $compile) {

			$scope.incident = {};
			$scope.searchObj = {};
			$scope.showDiv = false;
           var pageLoaded = false;
			$scope.disabled = false;
			$scope.loader = false;
			ngTableParamsService.set('', '', '', '');

			$(document).ready(function () {
				$(".fancybox").fancybox();
			});

			$scope.getIncidentsList = function (filterFlag) {
				$scope.tableParams = new ngTableParams(ngTableParamsService.get(), {
					counts: [],
					getData: function ($defer, params) {
						// send an ajax request to your server. in my case MyResource is a $resource.
						ngTableParamsService.set(params.page(), params.count(), $scope.searchTextField, params.sorting(), filterFlag);
						$scope.paramUrl = params.url();
						$scope.paramUrl.filterFlag = filterFlag;

						$scope.paramUrl.parent_id = CommonService.getUser()._id;
						$scope.tableLoader = true;
						$scope.incidentList = [];
						IncidentService.getIncidentList().save($scope.paramUrl, function (response) {
							$scope.tableLoader = false;
							$scope.incidentList = response.data;
							$scope.simpleList = response.data;
							var data = response.data;
							$scope.totalLength = response.totalLength;
							params.total(response.totalLength);
							$defer.resolve(data);
							$scope.checkboxes = {
								checked: false,
								items: {}
							};
						});

					}
				});
			};


			$scope.switchHtml = function (val) {
				//console.log(val);
				(val) ? $state.go('dashboard'): $state.go('incident')
				// if (val == false)
				// 	$state.go('dailies')
				// if (val == true)
				// 	$state.go('dashboard')
			}













	$scope.searchDate = function () {
			if (!pageLoaded){
				$('.range_inputs .cancelBtn').on('click', function(){
					$('input[name="searchQuery"]').val("")
					$scope.getIncidentsList();
					$scope.getdailiesdetails();
				});
				pageLoaded = true;
			}
		}






			$scope.findOne = function () {
				IncidentService.getIncidentById().get({
					id: $stateParams.id
				}, function (response) {
					if (response.code == 200) {
						$scope.incidents = response.data;
					} else {
						logger.logError(response.message);
					}
				});
			}




			$scope.$watch("searchObj.dateRange", function (newValue, oldValue) {
				$scope.tableLoader = true;
				if (newValue == oldValue) {
				} else {
					IncidentService.getIncidentByDate().save(newValue, function (response) {
						if (response.code == 200) {
							$scope.tableLoader = false;
							// $scope.simpleList = response.data;

							$scope.incidentList = response.data;

						}

					})
				}
			});





















			$scope.addUpdateincidents = function (form) {
				if (form.$valid) {
					$scope.disabled = true;
					$scope.loader = true;
					$scope.incidents._id = $stateParams.id;

					IncidentService.addUpdateIncidentData().save($scope.incidents, function (response) {
						$scope.disabled = false;
						$scope.loader = false;
						if (response.code == 200) {
							logger.logSuccess(response.message);
							$state.go('incident');
						} else {
							logger.logError(response.message);
						}
					});
				}
			}


			$scope.viewIncidentDetail = function (incident) {
				var modalInstance = $uibModal.open({
					animation: $scope.animationsEnabled,
					templateUrl: '/admin/modules/incident/views/incident_viewedit.html',
					controller: 'incident_detail',
					windowClass: 'zindex',
					// size: size,
					resolve: {
						incident: incident
					}
				});
			}

			$scope.viewIncidentDetails = function (incident) {
				var modalInstance = $uibModal.open({
					animation: $scope.animationsEnabled,
					templateUrl: '/admin/modules/incident/views/incident_view.html',
					controller: 'incident_detail',
					windowClass: 'zindex',
					// size: size,
					resolve: {
						incident: incident
					}
				});
			}











			$scope.deleteIncident = function (ID) {
				bootbox.confirm('Are you sure you want to delete this Incident ?', function (r) {
					if (r) {
						IncidentService.deleteIncidentId().delete({
							id: ID
						}, function (response) {
							if (response.code == 200) {
								$scope.getIncidentsList();
								logger.logSuccess(response.message);
							} else {
								logger.logError(response.message);
							}
						});
					}
				})
			}



			$scope.noDataFlag = false;
			//Toggle multilpe checkbox selection
			$scope.selection = [];
			$scope.selectionAll;
			$scope.toggleSelection = function toggleSelection(incident) {
				$scope.incident = incident;
                   $scope.repeatflag=false;

				//Check for single checkbox selection
				if (incident) {
				if($scope.selection.length>0){
            $scope.selection.forEach(function(data,index){
                if(data.id==incident._id){
				   $scope.selection.splice(index,1);
			       $scope.repeatflag=true;
				}
					   })
					
     				if(!$scope.repeatflag){
						$scope.selection.push({
						id: incident._id,
							incident_number: incident.incident_number,
						})              
				  }


			
					} else{
					 	$scope.selection.push({
						id: incident._id,
							incident_number: incident.incident_number,
						})
					
				}
				
				
				}
				//Check for all checkbox selection
				else {
					//Check for all checked checkbox for uncheck
					if ($scope.selection.length > 0 && $scope.selectionAll) {
						$scope.selection = [];
						$scope.checkboxes = {
							checked: false,
							items: {}
						};
						$scope.selectionAll = false;
					}
					//Check for all un checked checkbox for check
					else {
						$scope.selectionAll = true
						$scope.selection = [];
						angular.forEach($scope.simpleList, function (item) {
							$scope.checkboxes.items[item._id] = $scope.checkboxes.checked;
							$scope.selection.push({
								id: item._id
							});
						});
					}
				}
			};



			$scope.performAction = function () {
				var roleLength = $scope.selection.length;
				var updatedData = [];
				$scope.selectedAction = selectedAction.value;
				var actionValue = '';
				// switch ($scope.selectedAction) {
				// 	case '1':
				// 		actionValue = 'activate';
				// 		break;
				// 	case '2':
				// 		actionValue = 'deactivate';
				// 		break;
				// 	case '3':
				// 		actionValue = 'delete';
				// 		break;
				// 	case '4':
				// 		actionValue = 'Download Pdf for ';
				// 		break;
				// 	case '5':
				// 		actionValue = 'turn off membership fee of';
				// 		break;
				// }
				if ($scope.selectedAction == 0 || $scope.selection.length == 0)
					console.log("inside if")
				else {
					swal({
						title: "Are you sure?",
						text: "Are you sure you want to delete this Incident ?",
						type: "warning",
						showCancelButton: true,
						confirmButtonColor: "#DD6B55",
						confirmButtonText: "Yes",
						cancelButtonText: "No",
						closeOnConfirm: true

					}, function () {

						for (var i = 0; i < roleLength; i++) {
							// var id = $scope.selection[i].id;
							// var email = $scope.selection[i].email;
							// var first_name = $scope.selection[i].first_name;
							// var last_name = $scope.selection[i].last_name;
							// var kids = $scope.selection[i].kids;	

							var id = $scope.selection[i].id;
							var firstname = $scope.selection[i].firstname;
							var lastname = $scope.selection[i].lastname;
							var email = $scope.selection[i].email

							if ($scope.selectedAction == 3) {
								updatedData.push({
									id: id,
									deleted: true
								});
							} else if ($scope.selectedAction == 1) {
								updatedData.push({
									id: id,
									email: email,
									firstName: firstname,
									lastName: lastname,
								});
							} else if ($scope.selectedAction == 2) {
								updatedData.push({
									id: id,
									// is_active: false
								});
							} else if ($scope.selectedAction == 4) {
								updatedData.push({
									id: id,
									// is_membership: true
								});
							} else if ($scope.selectedAction == 5) {
								updatedData.push({
									id: id,
									// is_membership: false
								});
							}


							// firstname: user.firstname,
							// lastname: user.lastname,
							// email: user.email,





						}
						var inputJson = {
							data: updatedData
						}
						//  UserService.updateUserStatus(inputJson, function (response) {
						//             logger.logSuccess(response.message);
						//             $rootScope.message = messagesConstants.updateStatus;
						//             $route.reload();
						//         });
						IncidentService.updateIncidentStatus().save(inputJson, function (response) {
							if (response.code == 200) {
								//$route.reload();
								$scope.getIncidentsList();
								logger.logSuccess(response.message);

							} else {

								logger.logError('Failed');
							}
							// $rootScope.message = messagesConstants.updateStatus;


						});
						// IncidentService.downloadMultiplePdf().save(inputJson, function (response) {

						// 	if (response.code == 200) {
						// 		$scope.getIncidentsList();
						// 		logger.logSuccess(response.message);
						// 	} else {
						// 		logger.logError('Failed')
						// 	}




						// })

					});



				}
			}








			$scope.downloadMultiplePdf = function (incident) {
				var roleLength = $scope.selection.length;
				var updatedData = [];
				$scope.selectedActionn = selectedActionn.value;
				var actionValue = '';

				// $scope.users.parent_id = CommonService.getUser()._id;



				if ($scope.selectedActionn == 0 || $scope.selection.length == 0)
					console.log("inside if")
				else {
				

						for (var i = 0; i < roleLength; i++) {
							var id = $scope.selection[i].id;
							var firstname = $scope.selection[i].firstname;
							var lastname = $scope.selection[i].lastname;
							var email = $scope.selection[i].email

							if ($scope.selectedAction == 3) {
								updatedData.push({
									_id: id,
									deleted: true,
									parent_id: CommonService.getUser()._id
								});
							} else if ($scope.selectedAction == 1) {
								updatedData.push({
									_id: id,
									email: email,
									firstName: firstname,
									lastName: lastname,
									parent_id: CommonService.getUser()._id
								});
							} else if ($scope.selectedActionn == 2) {
								updatedData.push({
									_id: id,
									// is_active: false
									parent_id: CommonService.getUser()._id
								});
							} else if ($scope.selectedAction == 4) {
								updatedData.push({
									_id: id,
									parent_id: CommonService.getUser()._id
									// is_membership: true
								});
							} else if ($scope.selectedAction == 5) {
								updatedData.push({
									_id: id,
									// is_membership: false
									parent_id: CommonService.getUser()._id
								});
							}


							// firstname: user.firstname,
							// lastname: user.lastname,
							// email: user.email,





						}
						var inputJson = {
							data: updatedData
						}

						inputJson.data.forEach(function (element) {
							IncidentService.downloadIncidentPdf().save(element, function (response) {
								if (response.code == 200) {
									$scope.myDailysinglePdfLink = response.data[0];
									var path = '/' + $scope.myDailysinglePdfLink;
									setTimeout(function () {
										window.open(path)
									}, 1000);
								}
							});
						});

						//  UserService.updateUserStatus(inputJson, function (response) {
						//             logger.logSuccess(response.message);
						//             $rootScope.message = messagesConstants.updateStatus;
						//             $route.reload();
						//         });
						// DailiesService.downloadMultiplePdf().save(inputJson, function (response) {
						// 	if (response.code == 200) {
						// 		//$route.reload();
						// 		// $scope.getDailiesList();
						// 		console.log()
						// 		$scope.myDailysinglePdfLink = response.data[0];
						// 		var path = '/' + $scope.myDailysinglePdfLink;
						// 		setTimeout(function () {
						// 			window.open(path)
						// 		}, 1000);
						// 		// $scope.getDailiesList();

						// 		// logger.logSuccess(response.message);

						// 	} else {

						// 		logger.logError('Failed');
						// 	}
						// 	// $rootScope.message = messagesConstants.updateStatus;


						// });

				



				}

			}
































			$scope.filterUser = function (filter) {

				$scope.filterFlag = {};

				if (filter.incident_number) {
					$scope.filterFlag['incident_number'] = filter.incident_number;
				}
				if (filter.job_id) {
					$scope.filterFlag['job_id'] = filter.job_id;
				}

				if (filter.own_It) {
					$scope.filterFlag['own_It'] = filter.own_It;
				}
				if (filter.ticket_No) {
					$scope.filterFlag['ticket_No'] = filter.ticket_No;
				}
				if (filter.damage_Report) {
					$scope.filterFlag['damage_Report'] = filter.damage_Report;
				}


				$scope.getIncidentsList($scope.filterFlag);




			}









			$scope.checkAuditSameDate = function (type) {
				if ($scope.searchObj.dateRange && $scope.sameDate) {
					if (Object.keys($scope.searchObj.dateRange).length > 0) {
						if ($scope.sameDate.startDate && $scope.searchObj.dateRange.endDate) {
							if ($scope.sameDate.startDate != $scope.searchObj.dateRange.startDate && $scope.sameDate.endDate != $scope.searchObj.dateRange.endDate) {
								$scope.getDailiesList(type);
							}
						}
					}
				}
			}











			$scope.downloadsinglepdf = function (id) {
				
				$scope.users = {};
				$scope.users._id = id;
				$scope.users.parent_id = CommonService.getUser()._id;
				IncidentService.downloadIncidentPdf().save($scope.users, function (response) {
					if (response.code == 200) {
						$scope.myDailysinglePdfLink = response.data[0];
						var path = '/' + $scope.myDailysinglePdfLink;
						setTimeout(function () {
							window.open(path)
						}, 2000);


					}
				});
			}







// MAP CODE START HERE


		$scope.clearsearch = function () {
            document.getElementById('pac-input').value = "";
            $scope.getdailiesdetails();
            $scope.data_length = 0
        }

        $scope.dynamicbtn = function (keys) {
            $scope.data_length = keys.length;


        }

$scope.clear = function(data)
{
console.log("data>>",data)
       $scope.data= ''
	$scope.getIncidentsList();

}

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
												if($scope.data[i].latitude && $scope.data[i].longitude){

                        $scope.location.push({
                            "lng": parseFloat($scope.data[i].longitude),
                            "lat": parseFloat($scope.data[i].latitude),
                            "foreman": $scope.data[i].foremen_details.firstname + " " + $scope.data[i].foremen_details.lastname,
                            "from_date": moment($scope.data[i].from_date).format('MMMM Do YYYY, h:mm:ss a'),
                            "daily_number": $scope.data[i].daily_number,
                            "job_map": $scope.data[i].job_map,
                            "billable_items": $scope.data[i].billable_items,
                            "id": $scope.data[i]._id
						});
												}

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
                        // logger.logError("No search found");
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




     //   MAP CODE ENDS HERE


























			var getData = ngTableParamsService.get();
			$scope.searchTextField = getData.searchText;
			$scope.searchingIncident = function () {
				ngTableParamsService.set('', '', $scope.searchTextField, '');
				$scope.tableParams = new ngTableParams(ngTableParamsService.get(), {
					counts: [],
					getData: function ($defer, params) {

						ngTableParamsService.set(params.page(), params.count(), $scope.searchTextField, params.sorting());
						$scope.paramUrl = params.url();
						$scope.paramUrl.parent_id = CommonService.getUser()._id;
						$scope.tableLoader = true;
						$scope.incidentList = [];
						IncidentService.getIncidentList().save($scope.paramUrl, function (response) {
							//$scope.paramUrlActive = paramUrl;
							$scope.tableLoader = false;
							$scope.incidentList = response.data;
							$scope.simpleList = response.data;
							var data = response.data;
							$scope.totalLength = response.totalLength;
							params.total(response.totalLength);
							$defer.resolve(data);
						});
					}
				});
			}

		}

	]);




	// $scope.downloadPdf = function () {
	// 	$scope.userv = {};
	// 	$scope.userv.parent_id = CommonService.getUser()._id;
	// 	$scope.userv.firstname = CommonService.getUser().firstname;
	// 	$scope.userv.lastname = CommonService.getUser().lastname;
	// 	$scope.userv.email = CommonService.getUser().email;

	// 	if ($scope.dailies) {
	// 		$scope.userv.from_date = $scope.dailies.from_date;
	// 		$scope.userv.to_date = $scope.dailies.to_date;
	// 	}

	// 	DailiesService.downloadpdf().save($scope.userv, function (response) {
	// 		if (response.code == 200) {
	// 			$scope.myDailyPdfLink = response.data[0];
	// 			setTimeout(function () {
	// 				window.open($scope.myDailyPdfLink)
	// 			}, 3000);

	// 		}
	// 	});
	// }















	neoApp.controller('incident_detail', function ($scope, ngTableParams, ngTableParamsService, $uibModalInstance, $location, logger, incident, IncidentService, CommonService) {

		$scope.incident = incident;
		(incident.foremen_details) ? $scope.incident.foremen_details.name = (incident.foremen_details.firstname && incident.foremen_details.lastname) ? incident.foremen_details.firstname.concat(' ', incident.foremen_details.lastname) : (incident.foremen_details.firstname) ? incident.foremen_details.firstname : (incident.foremen_details.lastname) ? incident.foremen_details.lastname : null: null;

		$scope.cancel = function () {
			$uibModalInstance.dismiss('cancel');
		};
		$scope.ok = function () {
			$uibModalInstance.dismiss('cancel');
		};


		$(document).ready(function () {
			$(".fancybox").fancybox();
		});
		$scope.saveViewEditIncident = function (incident) {
			$scope.incident = incident
			if ($scope.incident.foremen_detail.name) {
				$scope.incident.foremen_detail.firstname = $scope.incident.foremen_detail.name.split(' ')[0]
				$scope.incident.foremen_detail.lastname = $scope.incident.foremen_detail.name.split(' ')[1]
			}


			IncidentService.saveViewEditIncident().save($scope.incident,
				function (response) {
					if (response.code == 200) {

						$scope.getIncidentsList2()
						$scope.cancel()

						logger.logSuccess(response.message);
					} else {
						logger.logError(response.message);
					}


				})

		}


			$scope.deleteIncident = function (ID) {
				bootbox.confirm('Are you sure you want to delete this Incident ?', function (r) {
					if (r) { 
					
						IncidentService.deleteIncidentId().delete({
							id: ID
						} , 
						
						 function (response) {
							if (response.code == 200) {
								
                 
								$scope.getIncidentsList2();
								$scope.cancel()
								logger.logSuccess(response.message);
							} else {
								logger.logError(response.message);
							}
						});
					}
				})
			}












			$scope.downloadsinglepdf = function (id) {
				$scope.users = {};
				$scope.users._id = id;
				$scope.users.parent_id = CommonService.getUser()._id;
				IncidentService.downloadIncidentPdf().save($scope.users, function (response) {
					if (response.code == 200) {
						$scope.myDailysinglePdfLink = response.data[0];
						var path = '/' + $scope.myDailysinglePdfLink;
						setTimeout(function () {
							window.open(path)
						}, 2000);


						$scope.getIncidentsList2()
						$scope.cancel()
					}
				});
			}













		$scope.getIncidentsList2 = function () {
			$scope.tableParams = new ngTableParams(ngTableParamsService.get(), {
				counts: [],
				getData: function ($defer, params) {
					// send an ajax request to your server. in my case MyResource is a $resource.
					ngTableParamsService.set(params.page(), params.count(), $scope.searchTextField, params.sorting());
					$scope.paramUrl = params.url();
					$scope.paramUrl.parent_id = CommonService.getUser()._id;
					$scope.tableLoader = true;
					$scope.incidentList = [];
					IncidentService.getIncidentList().save($scope.paramUrl, function (response) {
						$scope.tableLoader = false;
						$scope.incidentList = response.data;
						$scope.simpleList = response.data;
						var data = response.data;
						$scope.totalLength = response.totalLength;
						params.total(response.totalLength);
						$defer.resolve(data);
						$scope.checkboxes = {
							checked: false,
							items: {}
						};
					});

				}
			});
		};


	})