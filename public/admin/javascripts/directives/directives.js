/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
   neoApp.directive('validPasswordC', function() {
  return {
    require: 'ngModel',
    scope: {

      reference: '=validPasswordC'

    },
    link: function(scope, elm, attrs, ctrl) {
      ctrl.$parsers.unshift(function(viewValue, $scope) {

        var noMatch = viewValue != scope.reference
        ctrl.$setValidity('noMatch', !noMatch);
        return (noMatch)?noMatch:!noMatch;
      });

      scope.$watch("reference", function(value) {;
        ctrl.$setValidity('noMatch', value === ctrl.$viewValue);

      });
    }
  }
});

neoApp.directive("raty", function() {
    return {
        restrict: 'AE',
        link: function(scope, elem, attrs) {
            $(elem).raty({score: attrs.score, number: attrs.number, readOnly: attrs.readonly});
        }
    }
});

neoApp.filter("trust", ['$sce', function($sce) {
        return function(htmlCode){
            return $sce.trustAsHtml(htmlCode);
        }
    }]);

neoApp.directive('datepicker', function() {
  return {
    link: function(scope, el, attr) {
      $(el).datepicker({
        onSelect: function(dateText) {
          console.log(dateText);
          var expression = attr.ngModel + " = " + "'" + dateText + "'";
          scope.$apply(expression);
          console.log(scope.startDate);
          // how do i set this elements model property ?
        }
      });
    }
  };
});
neoApp.directive('googleplace', function() {
    return {
        require: 'ngModel',
        link: function(scope, element, attrs, model) {
            var options = {
                types: [],
                componentRestrictions: {country: 'us'}
            };
            scope.gPlace = new google.maps.places.Autocomplete(element[0], options);

            google.maps.event.addListener(scope.gPlace, 'place_changed', function() {
                var geoComponents = scope.gPlace.getPlace();
                var latitude = geoComponents.geometry.location.lat();
                var longitude = geoComponents.geometry.location.lng();
                angular.element("#lat").val(latitude);
                angular.element("#long").val(longitude);
                scope.$apply(function() {
                    model.$setViewValue(element.val()); 

                });
            });
        }
    };
});

