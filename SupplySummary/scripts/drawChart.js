function renderChart(categories, seriesArray, count) {
    let v = JSON.stringify(seriesArray);
    let c = JSON.parse(v);

    let bar_height = 14;

    if (scenario_in_chart.length == 1) {
        bar_height *= 2;
    }

    let hei = count * 26 + 150;

    if (hei < 964) {
        hei = 964;
    }

    Highcharts.chart("chart", {
        chart: {
            type: "bar",
            height: hei,
            events: {
                load: function () {
                    const labelContainers = this.container.querySelectorAll(".highcharts-axis-labels.highcharts-xaxis-labels");

                    labelContainers.forEach((container) => {
                        container.querySelectorAll('text[opacity="0"]').forEach((element) => {
                            element.remove();
                        });
                    });
                },
                redraw: function () {
                    const labelContainers = this.container.querySelectorAll(".highcharts-axis-labels.highcharts-xaxis-labels");

                    labelContainers.forEach((container) => {
                        container.querySelectorAll('text[opacity="0"]').forEach((element) => {
                            element.remove();
                        });
                    });
                },
            },
        },
        title: {
            text: "Volume Shipped",
            align: "center",
            style: {
                fontWeight: "lighter",
                fontSize: "1.3775510204081634em",
            },
        },
        subtitle: {
            text: "[ MT ]",
            align: "center",
            style: {
                fontWeight: "normal",
                fontSize: "0.9948979591836735em;",
            },
        },
        xAxis: {
            crosshair: true,
            labels: {
                rotation: 0,
                x: -8,
                align: "right",
                style: {
                    fontSize: "0.9948979591836735em",
                },
            },
            gridLineWidth: 1,
            tickPixelInterval: 100,
            tickLength: 100,
            title: {
                text: "Origin / Scenario",
                style: {
                    fontSize: "1.3775510204081634em",
                    fontWeight: "lighter",
                },
            },
            categories: categories,
        },
        yAxis: {
            min: 0,
            title: {
                text: "",
            },
            tickWidth: 1,
            tickLength: 10,
            tickColor: "#a0a0a0",
            labels: {
                formatter: function () {
                    if (this.value > 1000) {
                        return Highcharts.numberFormat(this.value, 0, ".", ",");
                    }
                    return this.value;
                },
                style: {
                    cursor: "pointer",
                },
            },
        },
        legend: {
            align: "center",
            verticalAlign: "bottom",
            backgroundColor: "rgba(0, 0, 0, 0.1)",
            shadow: false,
            useHTML: true,
            enabled: true,
            itemStyle: {
                "text-decoration": "none",
            },
            itemHoverStyle: {
                color: "#fff",
            },
        },
        tooltip: {
            headerFormat: "",
            borderWidth: 1,
            backgroundColor: "#86878a",
            pointFormatter: function () {
                return (
                    '<svg width="10" height="10" style="color:' +
                    this.series.color +
                    '">●</svg>  ' +
                    this.category +
                    "<br>" +
                    "<b> " +
                    this.series.name +
                    "</b>: " +
                    Highcharts.numberFormat(this.y, 1) +
                    "<br/>"
                );
            },
        },
        plotOptions: {
            series: {
                stacking: "normal",
                pointWidth: bar_height,
                borderWidth: 1,
                borderColor: "rgba(58, 58, 58, 0.5)",
                borderRadius: 0,
                minPointLength: 2,
            },
        },
        series: c,

        credits: {
            enabled: false,
        },
    });
}
