let myApp = angular.module('myApp');
myApp.controller('ModalCtrl', function ($scope, $rootScope, $firebaseArray) {
    let modalData = this;
    let chosenBuilding = 'Main Tank 1';
    let previousSelection;
    let myChart;
    modalData.showModalClick = false;
    modalData.buildingsData = {};
    $rootScope.$on('Data Updated', (event, data) => {
        modalData.buildingsData = data;
        if(modalData.showModalClick) updateModalData(chosenBuilding);
    });
    modalData.chart = {};
    let dateChanged = dateObj => {
        modalData.chart.volume = [];
        modalData.chart.timestamp = [];
        let date = moment(new Date(dateObj.date)).format('DD/M/YYYY');
        if(date != previousSelection) {
            previousSelection = date;
            [modalData.chart.day, modalData.chart.month, modalData.chart.year] = date.split('/');
            let dataPath;
            if(modalData.chart.type === 'Daily') dataPath = `${modalData.chart.year}/${modalData.chart.month}/${modalData.chart.day}`;
            else if(modalData.chart.type === 'Monthly') dataPath = `${modalData.chart.year}/${modalData.chart.month}`;
            else if(modalData.chart.type === 'Yearly') dataPath = modalData.chart.year;
            let databaseRef = firebase.database().ref(`water-tank-info/historical/${modalData.building.identifier}/${dataPath}`);
            modalData.historicalData = $firebaseArray(databaseRef);
            modalData.historicalData.$loaded().then(data => {
                const loopNestedObj = obj => {
                    angular.forEach(obj, (value, key) => {
                        if (value && typeof value === "object") loopNestedObj(value); // recurse.
                        if(key === 'timestamp') {
                            let dateObj = moment(new Date(value));
                            modalData.chart.timestamp.push(
                                dateObj.format('DD/M/YYYY') + " \n" +
                                dateObj.format('h:mm:ss A')
                            );
                        }
                        if(key === 'volume') modalData.chart.volume.push(value);
                    });
                };
                loopNestedObj(data);
                if(myChart) myChart.destroy();
                myChart = new Chart($("#myChart"), {
                type: "line",
                data: {
                    labels: modalData.chart.timestamp,
                    datasets: [
                    {
                        label: "Volume of water",
                        data: modalData.chart.volume,
                        backgroundColor: ["#9BD6FD"],
                        borderColor: ["#FFFFFF"],
                        borderWidth: 1,
                    },
                    ],
                },
                options: {
                    scales: {
                    yAxes: [
                        {
                        ticks: {
                            beginAtZero: true,
                        },
                        },
                    ],
                    },
                },
                });
            });
        }
    };

    modalData.initializeCalendar = (type, minViewMode) => {
        modalData.chart.type = type;
        $('.input-group.date').datepicker('destroy').datepicker({
            minViewMode,
            maxViewMode: 2,
            weekStart: 1,
            title: type,
            startDate: '19/01/2021',
            endDate: '0d',
            format: 'dd/m/yyyy',
            todayBtn: 'linked',
            autoclose: true,
            assumeNearbyYear: true,
            clearBtn: true,
            todayHighlight: true
        })
        .on('changeDate', dateChanged);
    }

    $rootScope.$on('Show Modal', (event, data) => {
        modalData.showModalClick = true;
        chosenBuilding = data;
        updateModalData(data);
        $('#cardDetails').modal('show');
    });

    let updateModalData = building => {
        modalData.building = modalData.buildingsData[building];
        modalData.tank = modalData.building.tank;
        modalData.alert = modalData.building.alert;
        modalData.buildingData = {
            Level: {
                value: modalData.building.level + '%',
                tooltip: 'Water level of tank'
            },
            Volume: {
                value: modalData.building.volume + 'L',
                tooltip: 'Volume of water in tank'
            },
            Distance: {
                value: modalData.building.distance + ' feet',
                tooltip: 'Water distance from sensor'
            },
            Date: { value: modalData.building.date, tooltip: 'Last updated date' },
            Time: { value: modalData.building.time, tooltip: 'Last updated time' }
        };
    }
});
