
(function (angular) {
  angular.module('kbkApp').controller('showProblemController', function($scope, $http){
    $scope.loading = true;
    $scope.limit = 20;
    $scope.colourIncludes = [];
    $scope.noFound = 'No problem found!';
    $http({
        method: 'GET',
        url: 'home/api/application/getuser',
        headers: {
            "Content-Type": "application/json"
        },
        data: {}
    }).then(function(res){
        var loggedUser = res.data;
        if (res.data.role.name == "regular") {
          $http({
            method: 'GET',
            url: 'home/api/application/getOneUserProblems',
            headers: {
                "Content-Type": "application/json"
            },
            data: {}
          }).then(function(res){
          
          $scope.problems = res.data;
         
          $scope.includeColour = function(colour) {
              var i = $.inArray(colour, $scope.colourIncludes);
              if (i > -1) {
                  $scope.colourIncludes.splice(i, 1);
              } else {
                  $scope.colourIncludes.push(colour);
              }
           }

           $scope.colourFilter = function(fruit) {
             
              if ($scope.colourIncludes.length > 0) {
                  if ($.inArray(fruit.problem_type, $scope.colourIncludes) < 0)
                      return;
              }
              
              return fruit;
            }

            $scope.tookFilter = function(problem){
              return problem;
            }

            
          });
        }else{
        $http({
            method: 'GET',
            url: 'home/api/application/getuserproblems',
            headers: {
                "Content-Type": "application/json"
            },
            data: {}
        }).then(function(res){
          
          $scope.problems = res.data;
          $scope.includeColour = function(colour) {
              var i = $.inArray(colour, $scope.colourIncludes);
              if (i > -1) {
                  $scope.colourIncludes.splice(i, 1);
              } else {
                  $scope.colourIncludes.push(colour);
              }
           }

           $scope.colourFilter = function(fruit) {
             
              if ($scope.colourIncludes.length > 0) {
                  if ($.inArray(fruit.problem_type, $scope.colourIncludes) < 0)
                      return;
              }
              
              return fruit;
            }
            $scope.tookFilter = function(problem){
              if(problem.took == '0'){
                return problem;
              }
            }
          // console.log($scope.colourIncludes);
        });

        
      
        
    
         
      }
    }).finally(function() {
      // called no matter success or failure
      $scope.loading = false;
    });
    

    // $scope.loadMore = function() {
    //   // var increamented = 
    //   alert("uso");
    //   $scope.limit += 10;
    //   // $scope.limit = increamented > $scope.problems.length ? $scope.problems.length : increamented;
    // };

  });
})(angular);