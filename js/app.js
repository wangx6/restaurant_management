!function(){
    'use strict';

    var demoApp = angular.module('demoApp',[
        'ngRoute',
        'app.directives.contactCard'
    ]);
    /*
    * Angular configurations
    * ...
     */
    demoApp.config(function($routeProvider,$locationProvider){
       // $locationProvider.html5Mode(true);
        $routeProvider
            .when('/view1',{
                controller:'SimpleController',
                templateUrl:'partials/view1.html'
            })
            .when('/view2',{
                controller:'SimpleController',
                templateUrl:'partials/view2.html'
            })
            .when('/view3',{
                controller:'SimpleController',
                templateUrl:'partials/view3.html'
            })
            .otherwise({ redirectTo:'/view1' });
    });


    /*
    * factory which contains all models to be utilized
    * by the controller.
    *
    * They are purposely designed to no to do any logic
    * operation.
     */
    demoApp.factory('simpleFactory', function(){
        var tableClass = function(){
            this.tableBillList = [];
            this.tableName = '';
            this.tableAvailibility = 'Free';
            this.tableBillItems = [];
            this.tableSubtotal = 0.00;
            this.isActive = false;
            this.menu = [
                {'itemName':'sirlion steak with mushroom saurce served with chips and peas','itemPrice':16.50},
                {'itemName':'steamed salmon with cream saurce served with veg','itemPrice':12.50},
                {'itemName':'cesar salad with grilled chicken and brown toast','itemPrice':7.50},
                {'itemName':'house special seafood soup','itemPrice':5.50},
                {'itemName':'chef special pepperoni pizza served with chips','itemPrice':16.50},
                {'itemName':'fish and chips served with lemon','itemPrice':7.50},
                {'itemName':'doner kabab with lamb served with chips','itemPrice':8.50},
                {'itemName':'guniness irish beef stew served with mash','itemPrice':10.50}
            ];
        },

        tables = [],
        shiftCompleteTablesCopy = [],
        tableInfo = [],
        factory = {};

        factory.getTables = function(){ return tables; }
        factory.getTableClass = function(){ return tableClass; }
        factory.getTableInfo = function(){ return tableInfo; }
        factory.getShiftCompleteTablesCopy = function(){return shiftCompleteTablesCopy;}

        return factory;
    });

    /*
    * the controller is the brain of the app
    * it does all the logic and calculation and
    * provide view materials by using the models supplied
    * by the factory service
     */
    demoApp.controller('SimpleController', function ($scope, simpleFactory, $location,$http,$timeout){
        init();

        function init(){
            $scope.tableInfoShow = false;
            $scope.menuShow = false;
            $scope.menuState = [];
            $scope.tables = simpleFactory.getTables($scope.noOfTables);
            $scope.tableClass = simpleFactory.getTableClass();
            $scope.tableInfo = simpleFactory.getTableInfo();
            $scope.shiftCompleteTablesCopy = simpleFactory.getShiftCompleteTablesCopy();
        }

        // create digital clock for the interface ...
        $scope.time = '';
        var startTime = function()
        {
            var today=new Date();
            var h=today.getHours();
            var m=today.getMinutes();
            var s=today.getSeconds();
            // add a zero in front of numbers<10
            m=checkTime(m);
            s=checkTime(s);
            $scope.time = h+":"+m+":"+s;
            $timeout(startTime,500);
        }
        $timeout(startTime,500);

        function checkTime(i){
            if (i<10) i="0" + i;
            return i;
        }// digital clock ends

        $scope.initTables = function(restaurantSetup){
            var temp_table = '', noOfTables, i;
            if(restaurantSetup.noOfTables == null || isNaN(restaurantSetup.noOfTables) || restaurantSetup.noOfTables < 1){
                alert("Please Enter an Valid Integer.");
            }
            else if($scope.tables.length === 0){
                noOfTables = restaurantSetup.noOfTables;
                for(i = 0 ; i< noOfTables ; i++){
                    temp_table = new $scope.tableClass;
                    temp_table.tableName = ''+ (i+1);
                    $scope.tables.push(temp_table);
                }
                $scope.tables[0].isActive = true;
                $location.path("/view2");
            }
            else{
                alert('you can only initialize your table number once.');
            }
        }

        $scope.showTableDetail = function(table){
            for(var i = 0 ; i < $scope.tables.length ; i++){
                $scope.tables[i].isActive = false;
            }
            table.isActive = true;
        }

        $scope.addDishToBill = function(table,dish){
            var dishFound = false;
            for(var i = 0 ;i < table.tableBillItems.length ; i++){
                if(!table.tableBillItems[i].itemName.length == 0 && table.tableBillItems[i].itemName == dish.itemName){
                    dishFound = true;
                    break;
                }
            }

            if(dishFound) table.tableBillItems[i].itemQuantity++;
            else{
                table.tableBillItems.push({ "itemName":dish.itemName,
                    "itemPrice":dish.itemPrice,
                    "itemQuantity":1
                });
            }

            table.tableAvailibility = 'Engaged'
            table.tableSubtotal += dish.itemPrice;
        }

        $scope.removeDish = function(table,tbi){
            var person=prompt("Please enter your staff key","");

            if (person!=null && person == 'pass'){
                for(var i = 0 ; i < table.tableBillItems.length ; i++){
                    if(table.tableBillItems[i].itemName == tbi.itemName){
                        if(table.tableBillItems[i].itemQuantity == 1){
                            table.tableBillItems.splice(i,1);
                            if(table.tableBillItems.length == 0)
                            table.tableAvailibility = 'Free';
                            break;
                        }else if(table.tableBillItems[i].itemQuantity > 1){
                            table.tableBillItems[i].itemQuantity --;
                            break;
                        }
                    }
                }
                table.tableSubtotal -= tbi.itemPrice;
            }
            else if(person == null){}
            else $scope.removeDish(table);
        }

        $scope.payBill = function(table){
            var person=prompt("Please enter your staff key","");

            if (person!=null && person == 'pass'){
                if( table instanceof $scope.tableClass && !table.tableBillItems.length == 0){
                    table.tableBillList.push({'order':table.tableBillItems,'date':Date(),'subtotal':table.tableSubtotal});
                    $scope.tables.total += table.tableSubtotal;
                    resetTable(table,false);
                }else
                    alert('An Error Has Ocurred');
            }
            else if(person == null){}
            else $scope.payBill(table);

        }

        $scope.shiftComplete = function(){
            var person=prompt("Are you sure? This will clear all record for this shift and a new shift will be started.","");

            if (person!=null && person == 'pass'){
                $location.path("/view3");
            }
            else if(person == null){}
            else $scope.shiftComplete();
        }

        $scope.$watch('tables',function(){
            $scope.shiftCompleteTablesCopy = [];
            $scope.shiftCompleteTablesCopy.total = 0;
            for(var i = 0 ; i < $scope.tables.length ; i ++){
                if(!$scope.tables[i].tableBillList.length == 0){
                    $scope.shiftCompleteTablesCopy.push($scope.tables[i]);
                    for(var j = 0 ; j<$scope.tables[i].tableBillList.length ; j++){
                        $scope.shiftCompleteTablesCopy.total += $scope.tables[i].tableBillList[j].subtotal;
                    }
                }
            }
            $scope.shiftCompleteTablesCopy.total = $scope.shiftCompleteTablesCopy.total.toFixed(2);
        },true);

        $scope.print = function(){
            window.print();
        };

        function resetTable(table,clearBillList){
            if(clearBillList)table.tableBillList = [];
            table.tableBillItems = [];
            table.tableAvailibility = 'Free';
            table.tableSubtotal = 0.00;
        }
    });

    /*
    * this is where all filters are created
    * ...
     */
    demoApp.filter('capitalized',function(){
        return function(input){
            return input.replace(/^(.)|\s(.)/g, function($1){ return $1.toUpperCase( ); });
        }
    });

    angular.module('app.directives.contactCard',[]).directive('contactCard',function(){})
}();

