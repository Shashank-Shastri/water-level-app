$(document).ready(function () {
    $('body').tooltip({ selector: '[data-toggle=tooltip]' });
    firebase.analytics();
});
(function (angular) {
    ('use strict');

    let myApp = angular.module('myApp', ['firebase']);
    myApp.controller('MainCtrl', function ($rootScope, $firebaseObject) {
        let app = this;
        let ref = firebase.database().ref('water-tank-info/current');
        let buildings = {};
        app.noOfBuildings = 0;
        ref.on('value', 
            function (snap) {
                for (const [key, building] of Object.entries(snap.val())) {
                    app.noOfBuildings++;
                    let date_obj = new Date(building.timestamp);
                    buildings[building.tank] = building;
                    buildings[building.tank].identifier = key;
                    buildings[building.tank].alert = {
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
                    buildings[building.tank].date = date_obj.toLocaleDateString();
                    buildings[building.tank].time = date_obj.toLocaleTimeString(
                        'en-US',
                        {
                            hour: 'numeric',
                            hour12: true,
                            minute: 'numeric',
                            second: 'numeric'
                        }
                    );
                };
                $rootScope.$emit('Data Updated', buildings);
            },
            function (errorObject) {
                console.log('The read failed: ' + errorObject.code);
            }
        );
        this.buildings = buildings;
        this.showModal = building => $rootScope.$emit('Show Modal', building);
        this.data = $firebaseObject(ref);
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
