'use strict';

angular.module('liocuevas.ng-wizard', [])
.factory('wizardService', function(){
    return {
      steps: [],
      current: 0,
      init: function(){            
          angular.forEach(this.getSteps(), function(step){            
              if(step.currentStep == false)
                step.el.addClass('ng-hide');
          });
      },     
      addStep: function(step) {
          this.steps.push(step);
      },
      getStep: function(index) {
          return this.steps[index];
      },
      getSteps: function() {
          return this.steps;
      },
      goToStep: function(index) {
          angular.forEach(this.getSteps(), function(step){            
              if(step.currentStep == true){
                  step.currentStep = false;
                  step.el.addClass('ng-hide');
              }              
          });
          this.current = index;
          this.getStep(index).currentStep = true;
          this.getStep(index).el.removeClass('ng-hide');
      },
      reset: function() {
          this.steps = [];
          this.current = 0;
      },
      moveNext: function(){
          this.getStep(this.current).currentStep = false;
          this.getStep(this.current).el.addClass('ng-hide');
          this.current = this.current + 1;
          this.getStep(this.current).currentStep = true;
          this.getStep(this.current).el.removeClass('ng-hide');
      },
      moveBack: function(){
          this.getStep(this.current).currentStep = false;
          this.getStep(this.current).el.addClass('ng-hide');
          this.current = this.current -1;
          this.getStep(this.current).currentStep = true;
          this.getStep(this.current).el.removeClass('ng-hide');
      },
      back: function() {
          var step = this.getStep(this.current);
          if(step.back != undefined){
              var back = step.back;
              back(step.args.scpe, {callback: this.moveBack.bind(this)});
          } else{
              this.moveBack();
          }
          this.moveBack();
      },
      next: function() {          
          var step = this.getStep(this.current);
          if(step.next != undefined){
              var next = step.next;              
              next(step.args.scpe, {callback: this.moveNext.bind(this)});
          } else{
              this.moveNext();
          }
      },
    };
})
.directive('ngWizard', ['wizardService', function(wizardService) {
  return {
    restrict: 'E',
    scope: true,
    transclude: true,
    templateUrl: 'templates/wizard.html',
    replace: true,
    link: function(scope, element, attrs){
      wizardService.init();
      scope.steps = wizardService.getSteps();
      scope.$on('$destroy', function() {
          wizardService.reset();
      });    
    },
    controller: function($scope, wizardService){      
      $scope.next = function(){        
        wizardService.next();
      }
      $scope.back = function(){
        wizardService.back();        
      }
      $scope.goToStep = function(index){
        wizardService.goToStep(index);        
      }
      $scope.showNextBtn = function(){
        return wizardService.current < (wizardService.getSteps().length - 1);
      }
      $scope.showBackBtn = function(){
        return wizardService.current > 0;
      }
    }
  };
}])
.directive('wzStep', ['wizardService', '$parse', function(wizardService, $parse){
  return {    
    require: '^ngWizard',
    restrict: 'E',
    transclude: true,
    template: '<div ng-transclude></div>',
    replace: true,
    link: function(scope, element, attrs, controller){
        var current = false,
            steps = wizardService.getSteps(),
            paramCurrent = $parse(attrs.current)(scope);

        current = (steps.length == 0) ? true : false;
        wizardService.addStep({ 
          next: $parse(attrs.next),
          back: $parse(attrs.back),
          args: { 
            next: {},
            back: {},
            scpe: scope,
          },
          currentStep: current,
          title: attrs.title,
          el: element
        });
        if(paramCurrent == true)          
          wizardService.goToStep(steps.length - 1);
    }
  };
}]);