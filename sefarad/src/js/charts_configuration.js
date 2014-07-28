    function getBarChartConfig(renderId, title, cat, data) {
        var config = {};
        config.chart = {
            renderTo: renderId,
            backgroundColor: '#fff',
            plotShadow: false,
            type: 'column',
        };
        config.tooltip = {};
        config.title = {
            margin: 10,
            align: 'left',
            text: title,
            x: 15
        };
        config.xAxis = {
            categories: cat,
            labels: {
                rotation: -45,
                align: 'right',
                style: {
                    fontSize: '13px',
                    fontFamily: 'Verdana, sans-serif'
                }
            }
        };
        config.yAxis = {
            min: 0,
            title: {
                text: 'Coincidencias'
            }
        };
        config.legend = {
            enabled: false
        };
        config.series = [{
            name: 'Population',
            data: data,
            dataLabels: {
                enabled: true,
                rotation: -90,
                color: '#FFFFFF',
                align: 'right',
                x: -3,
                y: 10,
                formatter: function () {
                    return this.y;
                },
                style: {
                    fontSize: '13px',
                    fontFamily: 'Verdana, sans-serif'
                }
            }
        }];
        return config;
    };

    function getPieChartConfig(renderId, title, data) {
        var config = {};
        config.chart = {
            renderTo: renderId,
            backgroundColor: '#fff',
            plotBackgroundColor: '#fff',
            plotBorderWidth: '#000',
            plotShadow: false,
            height: 200,
            animation: {
                duration: 1000,
                easing: 'swing'
            }
        };
        config.tooltip = {
            pointFormat: '{series.name}: <b>{point.percentage}%</b>',
            percentageDecimals: 1
        };
        config.title = {
            margin: 0,
            align: 'left',
            text: title,
            x: 15
        };
        config.plotOptions = {
            pie: {
                allowPointSelect: true,
                cursor: 'pointer',
                dataLabels: {
                    enabled: false
                },
                point: {
                    events: {
                        legendItemClick: function () {
                            if (this.visible) {
                                this['y_old'] = this.y;
                                this.update(0, true, true);
                            } else {
                                this.update(this.y_old, true, true);
                            }
                        }
                    }
                },
                series: {
                    animation: false //Problem only occurs when plotOptions animation:false
                },
                showInLegend: true
            }
        };
        config.legend = {
            enabled: true,
            layout: 'vertical',
            align: 'right',
            itemWidth: 100,
            verticalAlign: 'center',
            maxHeight: 160
        };
        config.series = [{
            type: 'pie',
            name: 'Proporción',
            data: data
        }];
        return config;
    };