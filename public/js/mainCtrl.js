$(document).ready(function () {
    $('body').tooltip({ selector: '[data-toggle=tooltip]' });
    firebase.analytics();
});
(function (angular) {
    ('use strict');

    let myApp = angular.module('myApp', ['firebase']);

    myApp.factory('UserService', function () {
        let user = {
            name: '',
            uid: '',
            loggedIn: false,
            superUser: false
        };
        let options = {
            updateUser: (name, uid, loggedIn, superUser) =>
                (user = { name, uid, loggedIn, superUser }),
            getUser: () => user
        };
        return options;
    });

    myApp.controller('AuthService', function (UserService) {
        let auth = this;
        auth.user = UserService.getUser();
        auth.signIn = () => {
            firebase
                .auth()
                .signInWithEmailAndPassword(auth.email, auth.password)
                .then(({ user }) => {
                    UserService.updateUser(auth.email, user.uid, true, true);
                    auth.user = UserService.getUser();
                    console.debug(auth.user);
                })
                .catch((e) => console.debug(e));
        };
        auth.signOut = () => {
            firebase.auth().signOut();
            UserService.updateUser('', '', false, false);
            auth.user = UserService.getUser();
            console.debug(auth.user);
        };
    });

    myApp.controller('MainCtrl', function ($rootScope, $firebaseObject, UserService) {
        let app = this;
        let { name, loggedIn } = UserService.getUser();
        let ref = firebase.database().ref('water-tank-info/current');
        let buildings = {};
        app.noOfBuildings = 0;
        if(loggedIn) {
            ref.on(
                'value',
                function (snap) {
                    for (const [key, building] of Object.entries(snap.val())) {
                        app.noOfBuildings++;
                        let dateObj = moment(new Date(building.timestamp));
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
                        buildings[building.tank].date = dateObj.format('DD/M/YYYY');
                        buildings[building.tank].time = dateObj.format('h:mm:ss A');
                    }
                    $rootScope.$emit('Data Updated', buildings);
                },
                function (errorObject) {
                    console.log('The read failed: ' + errorObject.code);
                }
            );
            app.buildings = buildings;
            app.showModal = (building) => $rootScope.$emit('Show Modal', building);
            app.data = $firebaseObject(ref);
        }
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

validate = (email) => {
    let mailFormat = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (!email.match(mailFormat)) {
        document.getElementById('invalid').innerHTML =
            'Please enter a valid email';
        return 0;
    } else {
        document.getElementById('invalid').innerHTML = '';
        return 1;
    }
};

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

feedback = () => {
    document.title = 'Feedback | Water Tank Level Automation';
    $('#Feedback').removeClass('hide');
    $('#Dash').addClass('hide');
    $('#login').addClass('hide');
    $('#navbarResponsive').removeClass('show');
};

dash = () => {
    document.title = 'Dashboard | Water Tank Level Automation';
    $('#Dash').removeClass('hide');
    $('#login').removeClass('hide');
    $('#Feedback').addClass('hide');
    $('#navbarResponsive').removeClass('show');
};
