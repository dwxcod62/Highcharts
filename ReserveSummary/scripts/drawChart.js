function renderChart(categories, seriesArray, isPercent) {
    Highcharts.chart("chart", {
        chart: {
            type: "column",
            // ignoreHiddenSeries: false,
        },
        title: {
            text: "Spot and Term Reserve (Planned)",
            align: "center",
            style: {
                fontWeight: "300",
                fontSize: "1.3775510204081634em",
                fontFamily: "'Nunito', sans-serif",
                color: " #000000",
            },
        },
        subtitle: {
            text: "[ MT ]",
            align: "center",
            style: {
                fontWeight: "500",
                fontSize: "0.9948979591836735em",
                fontFamily: "'Nunito', sans-serif",
                color: " #000000",
            },
        },
        xAxis: {
            categories: categories,
            endOnTick: true,

            title: {
                text: "",
                style: {
                    fontSize: "1.3775510204081634em",
                    align: "center",
                },
            },

            gridLineWidth: 1,
            showEmpty: false,

            gridLineColor: "#a0a0a0",
            lineColor: "#a0a0a0",
            tickColor: "#a0a0a0",

            labels: {
                align: "center",
                distance: 6,
                style: {
                    fontSize: "11px",
                    textAlign: "center",
                },
            },
        },
        yAxis: {
            min: 0,
            title: {
                text: "",
            },

            tickWidth: 1,
            tickLength: 10,
            tickColor: "#a0a0a0",
            gridLineColor: "#a0a0a0",

            labels: {
                formatter: function () {
                    if (this.value > 1000) {
                        return Highcharts.numberFormat(this.value, 0, ".", ",");
                    }
                    return isPercent ? this.value + "%" : this.value;
                },
                style: {
                    cursor: "pointer",
                },
            },
            visible: true,
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
                fontWeight: "400",
                fontSize: "0.9183673469387754em",
                fontFamily: "'Nunito', sans-serif",
                color: " #000000",
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
                    Highcharts.numberFormat(this.y, 3) +
                    "<br/>"
                );
            },
        },
        plotOptions: {
            series: {
                stacking: isPercent ? "percent" : "normal",
                borderWidth: 1,
                borderColor: "rgba(58, 58, 58, 0.5)",
                borderRadius: 0,
                animation: false,
            },
        },
        series: seriesArray,

        credits: {
            enabled: false,
        },
    });
}
