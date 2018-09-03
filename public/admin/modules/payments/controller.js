	"use strict";

	angular.module("Payments")

	neoApp.controller("paymentController", ['$scope', '$rootScope', '$localStorage', 'UserService', 'ngTableParams', '$routeParams', '$route', '$location', 'logger', 'ngTableParamsService', '$state', '$stateParams', '$http', 'CommonService', '$uibModal', 'SubscriptionService', 'dataService', 'PaymentService',
		function ($scope, $rootScope, $localStorage, UserService, ngTableParams, $routeParams, $route, $location, logger, ngTableParamsService, $state, $stateParams, $http, CommonService, $uibModal, SubscriptionService, dataService, PaymentService) {
			$scope.crew = {};
			$scope.disabled = false;
			$scope.loader = false;
			ngTableParamsService.set('', '', '', '');
			$scope.count = 1;
			$scope.total = 20;
			$(document).ready(function () {
				$(".fancybox").fancybox();
			});



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
			var stripe = Stripe('pk_test_VCNIAHMpDvywRzlj9p1Nw2fK'); // Stagging Server 
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

			$scope.freeSubscription = function () {

				$scope.user = dataService.getData();
				$scope.user.trial_period = false;
				$scope.user.paid_status = false;
				UserService.addContractor().save($scope.user, function (response) {
					$scope.disabled = false;
					$scope.loader = false;
					if (response.code == 200) {
						$location.path("/contractor_signup");
						logger.logSuccess(response.message);
					} else {
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

			var cardTypes = {
				'visa': 'Visa',
				'mastercard': 'MasterCard',
				'discover': 'Discover',
				'amex': 'American Express',
			};

			$scope.paymentInfo = {};

			$scope.tempInfo = {};
			$scope.setCardType = function (val) {
				//console.log('Val', val)
				angular.forEach(cardTypes, function (value, key) {
					if (value == val) {
						$scope.paymentInfo.type = key;
						//console.log('$scope.paymentInfo.type', $scope.paymentInfo.type);
					}
				});
			};





			$scope.payNow = function (form) {
				console.log("paynow",form)
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
							$scope.user.token = result.token.id;
							$scope.user.trial_period = true;
							$scope.user.paid_status = true;
							$scope.user.userCount = $scope.count;
							$scope.user.initialAmount = $scope.total;
							$scope.user.cardInfo = $scope.paymentInfo;
							UserService.addContractor().save($scope.user, function (response) {
								$scope.disabled = false;
								$scope.loader = false;
								if (response.code == 200) {
									$location.path("/contractor_signup");
									logger.logSuccess(response.message);
								} else {
									logger.logError(response.message);
								}
							});
						}
					});

				}
			}

			$scope.getAllPayment = function () {
				$scope.tableParams = new ngTableParams(ngTableParamsService.get(), {
					counts: [],
					getData: function ($defer, params) {
						// send an ajax request to your server. in my case MyResource is a $resource.
						ngTableParamsService.set(params.page(), params.count(), $scope.searchTextField, params.sorting());
						$scope.paramUrl = params.url();
						$scope.paramUrl.id = CommonService.getUser()._id;
						$scope.paramUrl.paid_status = true;
						$scope.tableLoader = true;
						$scope.usersList = [];
						PaymentService.getPaymentList().get($scope.paramUrl, function (response) {
							$scope.tableLoader = false;
							// $scope.paramUrlActive = paramUrl;
							$scope.paymentList = response.data;
							var data = response.data;
							$scope.totalLength = response.totalLength;
							params.total(response.totalLength);
							$defer.resolve(data);
						});

					}
				});
			}


			$scope.subscribeNow = function (form) {
				if (form.$valid) {
					$scope.disabled = true;
					$scope.loader = true;
					stripe.createToken($scope.card).then(function (result) {
						console.log("result>>>",result)
						if (result.error) { // Inform the user if there was an error                    
							$scope.loader = false;
							var errorElement = document.getElementById('card-errors');
							errorElement.textContent = result.error.message;
						} else { // Send the token to your server  

							//$scope.user = dataService.dataObj;
							$scope.user = {};
							$scope.user.email = $stateParams.email;
							$scope.user.token = result.token.id;
							$scope.user.trial_period = true;
							$scope.user.paid_status = true;
							console.log("$scope.user",$scope.user)
							PaymentService.addSubscription().save($scope.user, function (response) {
								$scope.disabled = false;
								$scope.loader = false;
								if (response.code == 200) {
									$location.path("/contractor_signup");
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