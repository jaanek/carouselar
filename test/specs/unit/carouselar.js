'use strict';

describe('Carouselar', function() {

  beforeEach(module('carouselar'));

  var compiler,
    scope,
    rootScope,
    controller,
    element,
    timeout,
    CarouselarConstants,
    win = angular.element(window);

  describe('CarouselarController', function() {

    beforeEach(function() {
      module(function($provide) {
        $provide.value('$window', win);
      });

      inject(function($injector, _$compile_, _$rootScope_, _$controller_) {
        CarouselarConstants = $injector.get('CarouselarConstants');
        timeout = $injector.get('$timeout');
        compiler = _$compile_;
        rootScope = _$rootScope_;
        controller = _$controller_;
        scope = _$rootScope_.$new();

        controller('CarouselarController', {
          $scope: scope,
          $rootScope: rootScope,
          $window: win,
          CarouselarConstants: CarouselarConstants
        });

        spyOn(scope, 'moveToSection').and.callThrough();
        spyOn(win, 'unbind').and.returnValue(true);

        rootScope.images = ["1.png", "2.png", "3.png", "4.png", "5.png", "6.png", "7.png"];
        element = compiler(
          '<carouselar displaying-image-count="3" images="images"></carouselar>')(scope);
      });
    });

    it('should initialize properly', function() {
      expect(scope.images.length).toBe(7);
      expect(element.isolateScope().maxImageCount).toBe(3);
    });

    it('by default display image count should be 1', function() {
      element = compiler('<carouselar images="images"></carouselar>')(scope);
      expect(element.isolateScope().maxImageCount).toBe(1);
    });

    it('resize() should work', function() {
      // wide
      scope.onResize(null, 1200);
      timeout.flush();
      expect(scope.displayingImageCount).toBe(scope.maxImageCount);

      // landscape
      scope.onResize(null, 800);
      timeout.flush();
      expect(scope.displayingImageCount).toBe(Math.ceil(scope.maxImageCount / 2));

      // portrait
      scope.onResize(null, 400);
      timeout.flush();
      expect(scope.displayingImageCount).toBe(1);
    });

    it('should remove resize listener when the scope is destroyed', function() {
      rootScope.$destroy();
      expect(win.unbind).toHaveBeenCalled();
      expect(win.unbind.calls.mostRecent().args[0]).toBe('resize');
    });

    it('when displaying image count is changed section & image width should be updated', function() {
      scope.displayingImageCount = 7;
      scope.$apply();
      expect(scope.sectionCount).toBe(1);
      expect(scope.singleImageWidth).toBe((100 / 7) + '%');

      scope.displayingImageCount = 3;
      scope.$apply();
      expect(scope.sectionCount).toBe(3);
      expect(scope.singleImageWidth).toBe((100 / 3) + '%');

      scope.displayingImageCount = 1;
      scope.$apply();
      expect(scope.sectionCount).toBe(7);
      expect(scope.singleImageWidth).toBe((100 / 1) + '%');

      expect(scope.moveToSection.calls.count()).toBe(3);
    });

    it('moveToSection() should work', function() {
      scope.sectionCount = 5;
      scope.$apply();

      scope.moveToSection(2);
      expect(scope.activeSection).toBe(2);

      scope.moveToSection(4);
      expect(scope.activeSection).toBe(4);

      scope.moveToSection(5);
      expect(scope.activeSection).toBe(0);
    });

    it('next() should work', function() {
      scope.sectionCount = 5;
      scope.activeSection = 3;
      scope.$apply();

      scope.next();
      expect(scope.activeSection).toBe(4);

      scope.next();
      expect(scope.activeSection).toBe(0);

      expect(scope.moveToSection.calls.count()).toBe(2);
    });

    it('prev() should work', function() {
      scope.sectionCount = 5;
      scope.activeSection = 1;
      scope.$apply();

      scope.prev();
      expect(scope.activeSection).toBe(0);

      scope.prev();
      expect(scope.activeSection).toBe(4);

      expect(scope.moveToSection.calls.count()).toBe(2);
    });

    it('isImageVisible() should work', function() {
      scope.visibleImages = [3, 4];
      expect(scope.isImageVisible(3)).toBeTruthy();
      expect(scope.isImageVisible(4)).toBeTruthy();
      expect(scope.isImageVisible(2)).toBeFalsy();
      expect(scope.isImageVisible(5)).toBeFalsy();
    });

    it('createArray() should work', function() {
      expect(scope.createArray(2)).toEqual(new Array(2));
      expect(scope.createArray(null)).toEqual([]);
    });
  });

  describe('CarouselarImageController', function() {

    beforeEach(inject(function($injector, _$compile_, _$rootScope_, _$controller_) {
      compiler = _$compile_;
      rootScope = _$rootScope_;
      controller = _$controller_;
      scope = _$rootScope_.$new();

      controller('CarouselarImageController', {
        $scope: scope,
        $rootScope: rootScope
      });

      spyOn(scope, '$apply').and.callThrough();

      element = compiler('<div carouselar-image></div>')(rootScope);
      rootScope.$digest();
    }));

    it('initially should be loading', function() {
      expect(scope.isLoading).toBe(true);
    });

    it('onLoad should work', function() {
      scope.onLoad();
      expect(scope.isLoading).toBe(false);
      expect(scope.$apply).toHaveBeenCalled();
    });
  });
});
