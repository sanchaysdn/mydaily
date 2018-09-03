	"use strict";

	angular.module("Users")

	neoApp.controller("userController", ['$scope', '$rootScope', '$localStorage', 'UserService', 'ngTableParams', '$routeParams', '$route', '$location', 'logger', 'ngTableParamsService', '$state', '$stateParams', '$http', 'CommonService', '$uibModal', 'dataService',
		function ($scope, $rootScope, $localStorage, UserService, ngTableParams, $routeParams, $route, $location, logger, ngTableParamsService, $state, $stateParams, $http, CommonService, $uibModal, dataService) {
			$scope.user = {};
			$scope.profile = {};
			$scope.changePass = {};
			$scope.imageBase64 = '';
			var formDataFileUpload = '';
			$scope.profile.email = CommonService.getUser().email;
			$scope.profile.UserImage = CommonService.getUser().profile_image;
			$scope.profile.firstname = CommonService.getUser().firstname;
			$scope.profile.lastname = CommonService.getUser().lastname;

			$scope.disabled = false;
			$scope.loader = false;
			$scope.disabledUpdate = false;
			$scope.loaderChangePass = false;


			$rootScope.tab1 = 1;
			$scope.tab = 1;
			if ($rootScope.tab1) {
				$scope.tab = $rootScope.tab1;
			} else {
				$scope.tab = 1;
			}
			$scope.isSet = function (tabId) {
				if ($rootScope.tab1 === tabId) {
					return true;
				}
			};
			$scope.setViewTab = function (tabId) {
				$rootScope.tab1 = tabId;
				$scope.tab = tabId;
			};

			$(document).ready(function () {
				$(".fancybox").fancybox();
			});


			/**
			 * Function is use to img Init for image upload
			 * @access private
			 * @return json
			 * Created by Ashish
			 * @smartData Enterprises (I) Ltd
			 * Created Date 29-Aug-2017
			 */
			$scope.imgInit = function () {
				$scope.imageError = false;

				document.getElementById('filePicker').addEventListener('change', function (evt) {

					var files = evt.target.files;
					var file = files[0];
					if (files && file) {
						var splitFileName = file.name.split('.');
						var ext = splitFileName[splitFileName.length - 1].toLowerCase();
						if (ext == 'jpg' || ext == 'jpeg' || ext == 'png') {
							if (file.size > 10485760) { //6291456 1093533
								// logger.log('File size cannot exceed limit of 6 mb');
								document.getElementById("filePicker").value = "";
								$scope.imageError = true;
								$scope.$apply();
							} else {

								formDataFileUpload = file;
								// formDataFileUpload.append('file', file);
								var reader = new FileReader();
								reader.onload = function (readerEvt) {
									$scope.preview = true;
									$scope.imageBase64 = 'data:image/' + ext + ';base64,' + btoa(readerEvt.target.result);
									document.getElementById('imgTag').src = $scope.imageBase64;
									$scope.$apply();
								};
								reader.readAsBinaryString(file);
							}
						} else {
							document.getElementById("filePicker").value = "";
							bootbox.alert('File format is not supported, please upload a file with one of the following extensions: .jpg,.jpeg,.png');
						}
					}
				}, false);
			}






			//empty the $scope.message so the field gets reset once the message is displayed.
			$scope.message = "";
			$scope.findOne = function () {
				if ($stateParams.id) {
					UserService.getUserById().get({
						id: $stateParams.id
					}, function (response) {
						if (response.code == 200) {
							$scope.user = response.data;
						}
					});
				}
			}

			$scope.getRole = function () {
				UserService.getRoleList().get(function (response) {
					if (response.code == 200) {
						$scope.roleList = response.data;
					}
				});
			}

			$scope.getSupervisor = function () {
				UserService.getAllSupervisor().get({
					id: CommonService.getUser()._id
				}, function (response) {
					if (response.code == 200) {
						$scope.superVisorList = response.data;
					}
				});
			}

			$scope.updateRole = function (roleid) {
				$scope.roleid = roleid;
			}

			$scope.changePassword = function (form) {
				if (form.$valid) {
					$scope.disabledUpdate = true;
					$scope.loaderChangePass = true;
					$scope.changePass.level = $rootScope.user_level;
					$scope.changePass.userId = CommonService.getUser()._id;

					UserService.changePassword().save($scope.changePass, function (response) {
						$scope.disabledUpdate = false;
						$scope.loaderChangePass = false;
						if (response.code == 200) {
							$state.reload();
							logger.logSuccess(response.message);
						} else {
							logger.logError(response.message);
						}
					});
				}
			}


			$scope.profileUpdate = function (form) {
				if (form.$valid) {
					$scope.disabled = true;
					$scope.loader = true;
					$scope.profile.userId = CommonService.getUser()._id;
					$scope.profile.level = $rootScope.user_level;
					UserService.adminProfileUpdate().save($scope.profile, function (response) {
						$scope.disabled = false;
						$scope.loader = false;
						if (response.code == 200) {
							$rootScope.user.firstname = $scope.profile.firstname;
							$rootScope.user.lastname = $scope.profile.lastname;
							if (formDataFileUpload) {
								var formData = new FormData();
								formData.append('id', response.data.id);
								formData.append('file', formDataFileUpload);
								formData.append('level', $rootScope.user_level);

								UserService.uploadImage().save(formData, function (imgResp, err) {
									if (imgResp.code == 200) {
										//CommonService.setUser(imgResp.data);
										$rootScope.user.profile_image = imgResp.data.profile_image;
									} else {
										logger.logError(response.message);
									}
								});
							} else {
								$rootScope.user = CommonService.getUser();
							}
						} else {
							logger.logError(response.message);
						}
					});
				}
			}


			$scope.addUpdateData = function (form) {
				console.log(form, "form")
				if (form.$valid) {
					$scope.disabled = true;
					$scope.loader = true;
					UserService.addUpdateUser().save($scope.user, function (response) {
						$scope.disabled = false;
						$scope.loader = false;
						if (response.code == 200) {
							if (response.data.role_code == "FM") {
								$location.path("/foremen");
							} else if (response.data.role_code == "SV") {
								$location.path("/supervisor");
							} else if (response.data.role_code == "Contractor") {
								$location.path("/users");
							} else if (response.data.role_code == "SC") {
								$location.path("/subcontractor");
							}
							logger.logSuccess(response.message);
						} else {
							logger.logError(response.message);
						}
					});
				}
			}

			$scope.contractorSignup = function (form) {
				if (form.$valid) {
					$scope.disabled = true;
					$scope.loader = true;
					//$scope.user = dataService.dataObj;
					dataService.setData($scope.user);
					$location.path("/plan");
					//$location.path('/addplan/'+ $scope.user);
					// UserService.addContractor().save($scope.user, function(response) {
					//     $scope.disabled = false;
					//     $scope.loader = false;
					//     if (response.code == 200) {
					//         $location.path("/contractor_signup");
					//         logger.logSuccess(response.message);
					//     } else {
					//         logger.logError(response.message);
					//     }
					// });
				}
			}

			$scope.addSupervisorData = function (form) {
				if (form.$valid) {
					$scope.disabled = true;
					$scope.loader = true;
					$scope.user.parent_id = CommonService.getUser()._id;
					UserService.addSupervisor().save($scope.user, function (response) {
						$scope.disabled = false;
						$scope.loader = false;
						if (response.code == 200) {
							$location.path("/supervisor");
							logger.logSuccess(response.message);
						} else {
							logger.logError(response.message);
						}
					});
				}
			}

			$scope.addForemenData = function (form) {
				if (form.$valid) {
					$scope.disabled = true;
					$scope.loader = true;
					$scope.user.parent_id = CommonService.getUser()._id;
					UserService.addForemen().save($scope.user, function (response) {
						$scope.disabled = false;
						$scope.loader = false;
						if (response.code == 200) {
							$location.path("/foremen");
							logger.logSuccess(response.message);
						} else {
							logger.logError(response.message);
						}
					});
				}
			}

			$scope.enableDisableUser = function (id, status) {
				UserService.enableDisableUser().save({
					userId: id,
					status: status
				}, function (response) {
					if (response.code == 200) {
						$scope.getAllUsers();
						logger.logSuccess(response.message);
					} else {
						logger.logError(response.message);
					}
				});
			}

			$scope.enableDisableSuper = function (id, status) {
				let msg = 'Are you sure you want to' + " " + status + " " + 'this user';
				bootbox.confirm(msg, function (r) {
					if (r == true) {
						UserService.enableDisableUser().save({
							userId: id,
							status: status
						}, function (response) {
							if (response.code == 200) {
								$scope.getAllSupervisor();
								logger.logSuccess(response.message);
							} else {
								logger.logError(response.message);
							}
						});
					} else {

					}

				})
			}
        $scope.goBack= function(){
console.log("usersgobcak")        	
        									$location.path("/users");

        }

			$scope.enableDisableForemen = function (id, status) {

				let msg = 'Are you sure you want to' + " " + status + " " + 'this user';
				bootbox.confirm(msg, function (r) {
					if (r == true) {
						UserService.enableDisableUser().save({
							userId: id,
							status: status
						}, function (response) {
							if (response.code == 200) {
								$scope.getAllForemen();
								logger.logSuccess(response.message);
							} else {
								logger.logError(response.message);
							}
						});
					} else {

					}
				})
			}

			$scope.getAllUsers = function () {
				$scope.tableParams = new ngTableParams(ngTableParamsService.get(), {
					counts: [],
					getData: function ($defer, params) {
						// send an ajax request to your server. in my case MyResource is a $resource.
						ngTableParamsService.set(params.page(), params.count(), $scope.searchTextField, params.sorting());
						$scope.paramUrl = params.url();
						$scope.paramUrl.id = CommonService.getUser()._id;
						$scope.tableLoader = true;
						$scope.usersList = [];
						UserService.getUsersList().get($scope.paramUrl, function (response) {
							$scope.tableLoader = false;
							// $scope.paramUrlActive = paramUrl;
							$scope.usersList = response.data;
							var data = response.data;
							$scope.totalLength = response.totalLength;
							params.total(response.totalLength);
							$defer.resolve(data);
						});

					}
				});
			}


          









			// $scope.noDataFlag = false;

			// //Toggle multilpe checkbox selection
			// $scope.selection = [];
			// $scope.selectionAll;

			// $scope.toggleSelection = function toggleSelection(user, abc) {
			// 	$scope.user = [];
			// 	//console.log('clicked', user, 'abc', abc)
			// 	$scope.user = user;
			// 	//Check for single checkbox selection
			// 	if (user) {
			// 		var idx = $scope.selection.indexOf(user._id);
			// 		console.log('idx', idx)
			// 		// is currently selected
			// 		if (idx > -1) {
			// 			$scope.selection.splice(idx, 1);
			// 		}
			// 		// is newly selected
			// 		else {
			// 			$scope.selection.push({
			// 				id: user._id,
			// 				email: user.email,
			// 				firstname: user.firstname,
			// 				lastname: user.lastname,
			// 				checked: abc


			// 			});
			// 			//console.log($scope.selection, "selection");
			// 			// $scope.selection.push(user._id);
			// 		}
			// 	}
			// 	//Check for all checkbox selection
			// 	else {
			// 		//Check for all checked checkbox for uncheck
			// 		if ($scope.selection.length > 0 && $scope.selectionAll) {
			// 			$scope.selection = [];
			// 			$scope.checkboxes = {
			// 				checked: false,
			// 				items: {}
			// 			};
			// 			$scope.selectionAll = false;
			// 		}
			// 		//Check for all un checked checkbox for check
			// 		else {
			// 			$scope.selectionAll = true
			// 			$scope.selection = [];
			// 			angular.forEach($scope.simpleList, function (item) {
			// 				console.log("item is here", item);
			// 				$scope.checkboxes.items[item._id] = $scope.checkboxes.checked;
			// 				console.log('running', $scope.checkboxes.items[item._id])
			// 				$scope.selection.push(item._id);
			// 			});
			// 		}
			// 	}
			// 	// console.log($scope.selection)
			// };



			// $scope.parentSelected = function toggleSelection(user) {
			// 	console.log('fhdfvbhds', user)
			// 	if (user == true) {
			// 		console.log('iffffffffffffffffff')
			// 		$scope.parentChecked = true;
			// 	} else {
			// 		console.log('else');
			// 		$scope.parentChecked = false;
			// 	}
			// }

			$scope.noDataFlag = false;
			//Toggle multilpe checkbox selection
			$scope.selection = [];
			$scope.selectionAll;
			$scope.toggleSelection = function toggleSelection(user) {
				console.log(user, "user is here")
				$scope.user = user;
				//Check for single checkbox selection
				if (user) {
					console.log("if user", user);
					var idx = $scope.selection.indexOf(user._id);
					// is currently selected
					if (idx > -1) {

						$scope.selection.splice(idx, 1);
					}
					// is newly selected
					else {
						console.log("inside else")
						$scope.selection.push({
							id: user._id,
							firstname: user.firstname,
							lastname: user.lastname,
							email: user.email

						});
						// $scope.selection.push(user._id);
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
							console.log(item, "what is item");
							$scope.checkboxes.items[item._id] = $scope.checkboxes.checked;
							$scope.selection.push({
								id: item._id
							});
						});
					}
				}
				console.log($scope.selection, 'zxcfvccxvx')
			};

			$scope.performAction = function () {
				console.log()
				var roleLength = $scope.selection.length;
				console.log(roleLength, "rolelength");
				var updatedData = [];
				$scope.selectedAction = selectedAction.value;
				console.log($scope.selectedAction, "$scope.selectedAction")
				var actionValue = '';
				switch ($scope.selectedAction) {
					case '1':
						actionValue = 'activate';
						break;
					case '2':
						actionValue = 'deactivate';
						break;
					case '3':
						actionValue = 'delete';
						break;
					case '4':
						actionValue = 'turn on membership fee of';
						break;
					case '5':
						actionValue = 'turn off membership fee of';
						break;
				}
				if ($scope.selectedAction == 0 || $scope.selection.length == 0)
					console.log("inside if")
				else {
					console.log("inside else")
					swal({
						title: "Are you sure?",
						text: "Are you sure you want to " + actionValue + " selected user?",
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
						console.log(inputJson, 'dsasadasdMMMMMMMMMMMMMMMMMM')
						//  UserService.updateUserStatus(inputJson, function (response) {
						//             logger.logSuccess(response.message);
						//             $rootScope.message = messagesConstants.updateStatus;
						//             $route.reload();
						//         });
						UserService.updateUserStatus().save(inputJson, function (response) {
							if (response.code == 200) {
								//$route.reload();
								$scope.getAllSupervisor();
								logger.logSuccess(response.message);

							} else {

								logger.logError('Failed');
							}
							// $rootScope.message = messagesConstants.updateStatus;


						});

					});



				}
			}




			$scope.getpaidUsers = function () {
				$scope.tableParam = new ngTableParams(ngTableParamsService.get(), {
					counts: [],
					getData: function ($defer, params) {
						// send an ajax request to your server. in my case MyResource is a $resource.
						ngTableParamsService.set(params.page(), params.count(), $scope.searchTextField, params.sorting());
						$scope.paramUrl = params.url();
						$scope.paramUrl.id = CommonService.getUser()._id;
						// $scope.paramUrl.trial_period = true; ****
						$scope.paramUrl.paid_status = true;
						
						$scope.tableLoader = true;
						$scope.paidusersList = [];
						UserService.getUsersList().get($scope.paramUrl, function (response) {
							$scope.tableLoader = false;
							// $scope.paramUrlActive = paramUrl;
							$scope.paidusersList = response.data;
							var data = response.data;

							$scope.totalLength = response.totalLength;
							params.total(response.totalLength);
							$defer.resolve(data);
						});

					}
				});
			}

			var getData = ngTableParamsService.get();
			$scope.searchTextField = getData.searchText;
			$scope.searchingpaidContractor = function () {
				ngTableParamsService.set('', '', $scope.searchTextField, '');
				$scope.tableParam = new ngTableParams(ngTableParamsService.get(), {
					counts: [],
					getData: function ($defer, params) {
						// send an ajax request to your server. in my case MyResource is a $resource.
						ngTableParamsService.set(params.page(), params.count(), $scope.searchTextField, params.sorting());
						$scope.paramUrl = params.url();
						$scope.paramUrl.trial_period = true;
						$scope.tableLoader = true;
						$scope.paidusersList = [];
						UserService.getUsersList().get($scope.paramUrl, function (response) {
							$scope.tableLoader = false;
							// $scope.paramUrlActive = paramUrl;
							$scope.paidusersList = response.data;
							var data = response.data;
							$scope.simpleList = response.data;

							$scope.totalLength = response.totalLength;
							params.total(response.totalLength);
							$defer.resolve(data);
						});
					}
				});
			}

			$scope.getAllSupervisor = function () {
				$scope.tableParams = new ngTableParams(ngTableParamsService.get(), {
					counts: [],
					getData: function ($defer, params) {
						// send an ajax request to your server. in my case MyResource is a $resource.
						ngTableParamsService.set(params.page(), params.count(), $scope.searchTextField, params.sorting());
						$scope.paramUrl = params.url();
						$scope.paramUrl.id = CommonService.getUser()._id;
						$scope.tableLoader = true;
						$scope.usersList = [];
						UserService.getSupervisorList().get($scope.paramUrl, function (response) {
							$scope.tableLoader = false;
							$scope.usersList = response.data;
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
			}


			$scope.pdfDownloads = function () {
				UserService.downloadPath().get({
					id: $rootScope.user.account_id
				}, function (data) {
					console.log(data, "data is here");
					$scope.createtext = "Download PDF file";
					$scope.download_pdf_filename = data.filename;
					$scope.getPdf = true;
					$scope.download_dir = file_url;

					$http.get($scope.download_dir).then(function (response) {
						var pdfdata = Base64.encode(response.data);
						$scope.pdfdata = 'data:application/pdf;base64,' + pdfdata;
						$('#pdfanchor').attr({
							href: $scope.pdfdata,
							download: $scope.download_pdf_filename
						})
					});
				});
			};


			$scope.getAllForemen = function () {
				$scope.tableParams = new ngTableParams(ngTableParamsService.get(), {
					counts: [],
					getData: function ($defer, params) {
						// send an ajax request to your server. in my case MyResource is a $resource.
						ngTableParamsService.set(params.page(), params.count(), $scope.searchTextField, params.sorting());
						$scope.paramUrl = params.url();
						$scope.paramUrl.parent_id = CommonService.getUser()._id;
						$scope.tableLoader = true;
						$scope.usersList = [];
						UserService.getForemenDetail().save($scope.paramUrl, function (response) {
							$scope.tableLoader = false;
							// $scope.paramUrlActive = paramUrl;
							$scope.usersList = response.data;
							var data = response.data;
							$scope.totalLength = response.totalLength;
							params.total(response.totalLength);
							$defer.resolve(data);
						});

					}
				});
			}


			var getData = ngTableParamsService.get();
			$scope.searchTextField = getData.searchText;
			$scope.searchingContractor = function () {
				ngTableParamsService.set('', '', $scope.searchTextField, '');
				$scope.tableParams = new ngTableParams(ngTableParamsService.get(), {
					counts: [],
					getData: function ($defer, params) {
						// send an ajax request to your server. in my case MyResource is a $resource.
						ngTableParamsService.set(params.page(), params.count(), $scope.searchTextField, params.sorting());
						$scope.paramUrl = params.url();
						$scope.tableLoader = true;
						$scope.usersList = [];
						UserService.getUsersList().get($scope.paramUrl, function (response) {
							$scope.tableLoader = false;
							// $scope.paramUrlActive = paramUrl;
							$scope.usersList = response.data;
							var data = response.data;
							$scope.totalLength = response.totalLength;
							params.total(response.totalLength);
							$defer.resolve(data);
						});
					}
				});
			}


			$scope.searchingSupervisor = function () {
				ngTableParamsService.set('', '', $scope.searchTextField, '');
				$scope.tableParams = new ngTableParams(ngTableParamsService.get(), {
					counts: [],
					getData: function ($defer, params) {
						// send an ajax request to your server. in my case MyResource is a $resource.
						ngTableParamsService.set(params.page(), params.count(), $scope.searchTextField, params.sorting());
						$scope.paramUrl = params.url();
						$scope.paramUrl.id = CommonService.getUser()._id;
						$scope.tableLoader = true;
						$scope.usersList = [];
						UserService.getSupervisorList().get($scope.paramUrl, function (response) {
							$scope.tableLoader = false;
							// $scope.paramUrlActive = paramUrl;
							$scope.usersList = response.data;
							var data = response.data;
							$scope.totalLength = response.totalLength;
							params.total(response.totalLength);
							$defer.resolve(data);
						});
					}
				});
			}
			$scope.searchingForemen = function () {
				ngTableParamsService.set('', '', $scope.searchTextField, '');
				$scope.tableParams = new ngTableParams(ngTableParamsService.get(), {
					counts: [],
					getData: function ($defer, params) {
						// send an ajax request to your server. in my case MyResource is a $resource.
						ngTableParamsService.set(params.page(), params.count(), $scope.searchTextField, params.sorting());
						$scope.paramUrl = params.url();
						$scope.paramUrl.parent_id = CommonService.getUser()._id;
						$scope.tableLoader = true;
						$scope.usersList = [];
						UserService.getForemenList().get($scope.paramUrl, function (response) {
							$scope.tableLoader = false;
							// $scope.paramUrlActive = paramUrl;
							$scope.usersList = response.data;
							var data = response.data;
							$scope.totalLength = response.totalLength;
							params.total(response.totalLength);
							$defer.resolve(data);
						});
					}
				});
			}

			$scope.deleteUser = function (id, userType) {
				var parent_id = CommonService.getUser()._id;
				bootbox.confirm('Are you sure you want to delete this user', function (r) {
					if (r) {
						UserService.deleteUser().delete({
							id: id
						}, function (response) {
							if (response.code == 200) {
								if (userType === 'sv') {
									$scope.getAllSupervisor();
								} else if (userType === 'fm') {
									$scope.getAllForemen();
								}
								logger.logSuccess(response.message);
							} else {
								logger.logError(response.message);
							}
						});
					}
				})
			}

			$scope.viewUserDetail = function (userDetails) {
				var modalInstance = $uibModal.open({
					animation: $scope.animationsEnabled,
					templateUrl: '/admin/modules/users/views/viewUserDetails.html',
					controller: 'userPopupCtrl',
					windowClass: 'zindex',
					size: 'lg',
					resolve: {
						userDetails: userDetails
					}
				});
			}

		}


	]);



	// "use strict";

	// 	angular.module("Payments")

	neoApp.controller("extendUserTrialController", ['$scope', '$rootScope', '$localStorage', 'UserService', 'ngTableParams', '$routeParams', '$route', '$location', 'logger', 'ngTableParamsService', '$state', '$stateParams', '$http', 'CommonService', '$uibModal', 'SubscriptionService', 'dataService', 'PaymentService',
		function ($scope, $rootScope, $localStorage, UserService, ngTableParams, $routeParams, $route, $location, logger, ngTableParamsService, $state, $stateParams, $http, CommonService, $uibModal, SubscriptionService, dataService, PaymentService) {
			$scope.crew = {};
			$scope.disabled = false;
			$scope.loader = false;
			ngTableParamsService.set('', '', '', '');
			$scope.count = 1;
			$scope.total = 0;
			$(document).ready(function () {
				$(".fancybox").fancybox();
			});



			angular.element("#slider").slider({
				animate: true,
				value: 1,
				min: 1,
				max: 30,
				step: 1,
				slide: function (event, ui) {
					$scope.update(1, ui.value); //changed
				}
			});
			angular.element("#count").val(1);
			// angular.element("#amount").val(20);
			$(document).find("#slider").find("span").html('<label>1</label>')
			$scope.update = function (slider, val) {
				//changed. Now, directly take value from ui.value. if not set (initial, will use current value.)
				$scope.count = slider == 1 ? val : angular.element("#count").val();
				// var initialPrice = 20;
				$scope.total = $scope.count
				$(document).find("#slider").find("span").html('<label>' + $scope.count + '</label>');
				$scope.$apply();
			}

			//Stripe Card init
			// var stripe = Stripe('pk_test_RuDeYmoPeMI0YbwTczLeVi61'); // Stagging Server 
			// //var stripe = Stripe('pk_test_2w19jETzkoOkj3syikJPMlRd');// Live Server
			// $scope.stripeCard = function () {
			// 	var elements = stripe.elements();
			// 	var style = {
			// 		base: {
			// 			color: '#333',
			// 			lineHeight: '24px',
			// 			fontSmoothing: 'antialiased',
			// 			fontSize: '12px',
			// 			'::placeholder': {
			// 				color: '#999'
			// 			}
			// 		},
			// 		invalid: {
			// 			color: '#a94442',
			// 			iconColor: '#a94442'
			// 		}
			// 	};

			// 	$scope.card = elements.create('card', {
			// 		hidePostalCode: true,
			// 		style: style
			// 	});
			// 	$scope.card.mount('#card-element');

			// 	$scope.card.addEventListener('change', function (event) {
			// 		var displayError = document.getElementById('card-errors');
			// 		if (event.error) {
			// 			displayError.textContent = event.error.message;
			// 		} else {
			// 			displayError.textContent = '';
			// 		}
			// 	});
			// }

			$scope.extendUserTrial = function (data) {
				let getId = $location.path().split("/")
				// console.log(getId[getId.length -1],data)
				$scope.user = dataService.getData();
				// console.log("$scope.user", $scope.user)
				$scope.user.status=false;
				$scope.user.trial_period = true;
				$scope.user.paid_status = false;
				$scope.user.userId = getId[getId.length -1];
				$scope.user.extend_time = data;
				UserService.extendUserTrial().save($scope.user, function (response) {
					console.log(response);
					if(response.code== 200){
									$location.path("/users");
								logger.logSuccess(response.message);
					}
					else{
														logger.logError(response.message);

					}

				});

			}

			//This will hide the DIV by default.
			$scope.IsVisible = false;
			$scope.ShowHide = function () {
				//If DIV is visible it will be hidden and vice versa.
				$scope.IsVisible = $scope.IsVisible ? false : true;
			}

			// var cardTypes = {
			// 	'visa': 'Visa',
			// 	'mastercard': 'MasterCard',
			// 	'discover': 'Discover',
			// 	'amex': 'American Express',
			// };

			// $scope.paymentInfo = {};

			// $scope.tempInfo = {};
			// $scope.setCardType = function (val) {
			// 	console.log('Val', val)
			// 	angular.forEach(cardTypes, function (value, key) {
			// 		if (value == val) {
			// 			$scope.paymentInfo.type = key;
			// 			console.log('$scope.paymentInfo.type', $scope.paymentInfo.type);
			// 		}
			// 	});
			// };





			// $scope.payNow = function (form) {
			// 	if (form.$valid) {
			// 		$scope.disabled = true;
			// 		$scope.loader = true;
			// 		stripe.createToken($scope.card).then(function (result) {
			// 			if (result.error) { // Inform the user if there was an error                    
			// 				$scope.loader = false;
			// 				var errorElement = document.getElementById('card-errors');
			// 				errorElement.textContent = result.error.message;
			// 			} else { // Send the token to your server  

			// 				//$scope.user = dataService.dataObj;
			// 				$scope.user = dataService.getData();
			// 				$scope.user.token = result.token.id;
			// 				$scope.user.trial_period = true;
			// 				$scope.user.paid_status = true;
			// 				$scope.user.userCount = $scope.count;
			// 				$scope.user.initialAmount = $scope.total;
			// 				$scope.user.cardInfo = $scope.paymentInfo;
			// 				UserService.addContractor().save($scope.user, function (response) {
			// 					$scope.disabled = false;
			// 					$scope.loader = false;
			// 					if (response.code == 200) {
			// 						$location.path("/contractor_signup");
			// 						logger.logSuccess(response.message);
			// 					} else {
			// 						logger.logError(response.message);
			// 					}
			// 				});
			// 			}
			// 		});

			// 	}
			// }

			// $scope.getAllPayment = function () {
			// 	$scope.tableParams = new ngTableParams(ngTableParamsService.get(), {
			// 		counts: [],
			// 		getData: function ($defer, params) {
			// 			// send an ajax request to your server. in my case MyResource is a $resource.
			// 			ngTableParamsService.set(params.page(), params.count(), $scope.searchTextField, params.sorting());
			// 			$scope.paramUrl = params.url();
			// 			$scope.paramUrl.id = CommonService.getUser()._id;
			// 			$scope.tableLoader = true;
			// 			$scope.usersList = [];
			// 			PaymentService.getPaymentList().get($scope.paramUrl, function (response) {
			// 				$scope.tableLoader = false;
			// 				// $scope.paramUrlActive = paramUrl;
			// 				$scope.paymentList = response.data;
			// 				var data = response.data;
			// 				$scope.totalLength = response.totalLength;
			// 				params.total(response.totalLength);
			// 				$defer.resolve(data);
			// 			});

			// 		}
			// 	});
			// }


			// $scope.subscribeNow = function (form) {
			// 	if (form.$valid) {
			// 		$scope.disabled = true;
			// 		$scope.loader = true;
			// 		stripe.createToken($scope.card).then(function (result) {
			// 			if (result.error) { // Inform the user if there was an error                    
			// 				$scope.loader = false;
			// 				var errorElement = document.getElementById('card-errors');
			// 				errorElement.textContent = result.error.message;
			// 			} else { // Send the token to your server  

			// 				//$scope.user = dataService.dataObj;
			// 				$scope.user = {};
			// 				$scope.user.email = $stateParams.email;
			// 				$scope.user.token = result.token.id;
			// 				$scope.user.trial_period = true;
			// 				$scope.user.paid_status = true;
			// 				PaymentService.addSubscription().save($scope.user, function (response) {
			// 					$scope.disabled = false;
			// 					$scope.loader = false;
			// 					if (response.code == 200) {
			// 						$location.path("/contractor_signup");
			// 						logger.logSuccess(response.message);
			// 					} else {
			// 						logger.logError(response.message);
			// 					}
			// 				});
			// 			}
			// 		});

			// 	}
			// }


		}

	]);








































	neoApp.controller('userPopupCtrl',
		function ($scope, $uibModalInstance, $location, logger, userDetails, ngTableParamsService, ngTableParams,
			UserService, $uibModal, JobService) {
			$scope.userDetails = userDetails;
			ngTableParamsService.set('', '', '', '');
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