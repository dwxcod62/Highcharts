let chart = Highcharts.chart($parameters.ChartId, {
    chart: {
        type: "column",
        style: {
            fontFamily: "Nunito",
        },
    },
    title: {
        text: "Yearly Profit, Revenue, COGS and Shipping Costs",
        align: "center",
        style: {
            fontSize: "23px",
            fontWeight: 300,
        },
    },

    subtitle: {
        useHTML: true,
        align: "center",
        style: {
            fontSize: "18px",
            fontWeight: 400,
            color: "#000",
        },
    },

    xAxis: {
        labels: {
            style: {
                fontSize: "11px",
            },
        },
        gridLineWidth: 1,
    },

    yAxis: {
        labels: {
            style: {
                fontSize: "11px",
            },
        },
        showLastLabel: false,
        title: null,
    },

    legend: {
        layout: "horizontal",
        align: "center",
        verticalAlign: "bottom",
        backgroundColor: "rgba(0, 0, 0, 0.1)",
        shadow: false,
        useHTML: true,
        enabled: true,
        itemStyle: {
            "text-decoration": "none",
        },
    },

    responsive: {
        rules: [
            {
                condition: {
                    maxWidth: 500,
                },
                chartOptions: {
                    legend: {
                        layout: "horizontal",
                        align: "center",
                        verticalAlign: "bottom",
                    },
                },
            },
        ],
    },

    tooltip: {
        useHTML: true,
        backgroundColor: "rgba(130,130,130,0.9)",
        borderWidth: 2,
        borderRadius: 0,
        shadow: false,
        headerFormat: '<span style="color:{point.color}">\u25CF</span> {point.x}<br/>',
        pointFormatter: function () {
            var s = "<b>" + this.series.name + "</b>: " + formatValue(this.y, 2);
            return s;
        },
    },

    plotOptions: {
        series: {
            dataLabels: {
                enabled: true,
                formatter: function () {
                    return formatValue(this.y, 2);
                },
                style: {
                    fontSize: "13px",
                },
            },
            borderColor: "#3a3a3a80",
            borderWidth: 1,
        },
    },

    credits: {
        enabled: false,
    },
});
