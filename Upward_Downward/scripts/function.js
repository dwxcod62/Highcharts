const filteredData = JSON.parse($parameters.FilteredData);
let chartData;

if (Object.keys(filteredData).length !== 0 && filteredData[$parameters.Scenario] !== undefined) {
    chartData = convertToChartData(filteredData[$parameters.Scenario]);
}

Highcharts.chart($parameters.ContainerId, {
    chart: {
        type: "column",
        style: {
            fontFamily: '"Nunito", sans-serif',
            fontSize: "0.9948979591836735em",
            color: "#000000",
            overflow: "visible",
            fontWeight: "400",
            fill: "#000000",
        },
    },
    title: {
        text: "Upward/Downward Flex",
        style: {
            fontFamily: '"Nunito", sans-serif',
            fontSize: "1.3775510204081634em",
            color: "#161a1d",
            fontWeight: "300",
            fill: "#161a1d",
        },
    },
    subtitle: {
        text: "[ % ]",
        style: {
            fontFamily: '"Nunito", sans-serif',
            fontSize: "0.9948979591836735em",
            color: "#000000",
            fontWeight: "500",
            fill: "#000000",
        },
    },
    navigation: {
        buttonOptions: {
            enabled: false,
        },
    },
    credits: {
        enabled: false,
    },
    xAxis: {
        type: "category",
        lineColor: "rgb(160, 160, 160)",
        gridLineWidth: 1,
        gridLineColor: "#cfcfcf",
        tickWidth: 1,
        tickLength: 10,
        tickColor: "#a0a0a0",
        showEmpty: false,
        labels: {
            style: {
                color: "#000000",
                fontSize: "11",
                fill: "#000000",
            },
        },
    },
    yAxis: {
        title: undefined,
        lineColor: "rgba(160, 160, 160, 0.5)",
        startOnTick: false,
        endOnTick: false,
        tickWidth: 1,
        tickLength: 10,
        tickColor: "#a0a0a0",
        labels: {
            style: {
                color: "#000000",
                fontSize: "11",
                fill: "#000000",
                cursor: "pointer",
            },
        },
    },
    legend: {
        enabled: false,
    },
    tooltip: {
        useHTML: true,
        backgroundColor: "rgb(117,117,117,.8)",
        borderWidth: 1,
        borderRadius: 3,
        formatter: function () {
            var color = this.point.color;
            let value = this.point.y;
            value = parseFloat(value.toFixed(1));
            let flexCalc = this.point.flexCalc;

            return (
                '<span style="background-color:' +
                color +
                '; border-radius:50%; width:7px; height:7px; display:inline-block;"></span> ' +
                this.point.name +
                "<br>" +
                "<b>Flex: </b>" +
                value.toFixed(1) +
                "%" +
                "<br>" +
                "<b>FLC / Base Delivery: </b>" +
                flexCalc
            );
        },
    },
    plotOptions: {
        column: {
            pointPadding: 0.2,
            borderWidth: 0,
        },
    },
    series: [
        {
            color: $parameters.ChartColor,
            borderRadius: 0,
            data: chartData,
            dataLabels: {
                enabled: true,
                formatter: function () {
                    let value = this.point.y;
                    value = parseFloat(value.toFixed(1));
                    return value.toFixed(1);
                },
                align: "center",
                verticalAlign: "middle",
                inside: true,
                style: {
                    color: "#000",
                    fontSize: "0.8125em",
                    fontWeight: "bold",
                    fill: "#000",
                },
            },
            animation: false,
            pointPadding: 0,
        },
    ],
});

function convertToChartData(data) {
    let result = [
        {
            name: "Buyer Commercial Cancellation",
            y: (data["buyer_commercial_cancellation"] / data["base_delivery"]) * 100,
            flexCalc: data["buyer_commercial_cancellation"] + "/" + data["base_delivery"],
        },
        {
            name: "Buyer DQT",
            y: (data["buyer_dqt"] / data["base_delivery"]) * 100,
            flexCalc: data["buyer_dqt"] + "/" + data["base_delivery"],
        },
        {
            name: "Buyer STQ",
            y: (data["buyer_stq"] / data["base_delivery"]) * 100,
            flexCalc: data["buyer_stq"] + "/" + data["base_delivery"],
        },
        {
            name: "Buyer UQT",
            y: (data["buyer_uqt"] / data["base_delivery"]) * 100,
            flexCalc: data["buyer_uqt"] + "/" + data["base_delivery"],
        },
        {
            name: "Deferment Delivery",
            y: (data["deferment_delivery"] / data["base_delivery"]) * 100,
            flexCalc: data["deferment_delivery"] + "/" + data["base_delivery"],
        },
    ];

    result = result.filter((item) => item.y !== undefined);

    return result;
}
