$(document).ready(function () {
    $('body').tooltip({ selector: '[data-toggle=tooltip]' });
    firebase.analytics();
});
(function (angular) {
    ('use strict');

    let myApp = angular.module('myApp', ['firebase']);
    myApp.controller('MainCtrl', function ($rootScope, $firebaseObject) {
        let app = this;
        let databaseRef = firebase.database().ref('water-tank-info/current');
        app.buildings = {};
        app.noOfBuildings = 0;
        app.data = $firebaseObject(databaseRef);
        app.data.$loaded().then(data => {
            angular.forEach(data, (building, key) => {
                app.noOfBuildings++;
                let dateObj = moment(new Date(building.timestamp));
                app.buildings[building.tank] = building;
                app.buildings[building.tank].identifier = key;
                app.buildings[building.tank].alert = {
                    type: building.overflow
                        ? 'alert-danger'
                        : building.level < 25
                        ? 'alert-warning'
                        : building.filling
                        ? 'alert-primary'
                        : '',
                    text: building.overflow
                        ? 'Tank is about to Overflow.'
                        : building.level < 25
                        ? 'Water is less than 25%.'
                        : building.filling
                        ? 'Tank is filling up.'
                        : ''
                };
                app.buildings[building.tank].date = dateObj.format('DD/M/YYYY');
                app.buildings[building.tank].time = dateObj.format('h:mm:ss A');
            });
            $rootScope.$emit('Data Updated', app.buildings);
        });
        app.showModal = building => $rootScope.$emit('Show Modal', building);
    });

    myApp.component('cardDetail', {
        templateUrl: 'pages/card.html',
        bindings: {
            building: '<'
        }
    });

    myApp.directive('bootstrapTooltip', function () {
        return function (scope, element, attrs) {
            attrs.$observe('title', function (title) {
                // Destroy any existing tooltips (otherwise new ones won't get initialized)
                element.tooltip('dispose');
                // Only initialize the tooltip if there's text (prevents empty tooltips)
                if (jQuery.trim(title)) element.tooltip();
            });
            element.on('$destroy', function () {
                element.tooltip('dispose');
                delete attrs.$$observers['title'];
            });
        };
    });
})(window.angular);

validate = email => {
    let mailFormat = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (!email.match(mailFormat)) {
        document.getElementById('invalid').innerHTML =
            'Please enter a valid email';
        return 0;
    } else {
        document.getElementById('invalid').innerHTML = '';
        return 1;
    }
}

feedBack = () => {
    let Name = $('#name').val();
    let Email = $('#email').val();
    let Message = $('#message').val();
    if (validate(Email) && Name != '' && Message != '') {
        let feedRef = firebase.database().ref('feedback');
        feedRef.push({ Name, Email, Message });
        $('.modal-body').text('Thanks for the feedback ' + Name + '!');
        $('#feedback-submitted').modal('show');
        $('.btn-danger').click();
    }
};
