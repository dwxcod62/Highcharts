let output1 = [];
let output2 = [];

function prepareAndProcessData(scenario, type) {
    output1 = [];
    output2 = [];

    const renameField = (data, originalField, newField) => {
        return data.map((item) => {
            const newItem = Object.assign({}, item, { [newField]: item[originalField] });
            delete newItem[originalField];
            return newItem;
        });
    };

    const addStaticField = (data, newField, value) => {
        return data.map((item) => {
            const newItem = Object.assign({}, item, { [newField]: value });
            return newItem;
        });
    };

    function PrepareDataIsBase() {
        if (scenario.startsWith("[Base]")) {
            output1 = supply_before;
            output1.sort((a, b) => a.scenario.localeCompare(b.scenario));

            output2 = demand_before.filter((item) => item.status == "Signed");
        } else {
            output1 = supply_after;
            output1 = output1.filter((item) => item.scenario == scenario);

            output2 = demand_after.filter((item) => item.scenario == scenario);
        }
    }

    function PrepareDemandValue(data) {
        let input = data;

        input = input.filter((item) => item.supply_group == "P4R");
        input = input
            .filter((item) => item.year >= 2023 && item.year <= 2033)

            .filter((item) => item.contracted != "contracted spot");

        input = input.map((item) => {
            const newItem = Object.assign({}, item);
            delete newItem.contracted;
            delete newItem.bacq_value;
            delete newItem.country;
            delete newItem.status;
            delete newItem.stq_value;
            return newItem;
        });

        input = input.filter((item) => SELECTED_PORTFOLIO.includes(item.portfolio_type));

        const aggregateData = (data) => {
            const aggregation = {};

            data.forEach((item) => {
                const key = `${item.year}-${item.group}-${item.supply_group}-${item.volume}`;

                if (!aggregation[key]) {
                    aggregation[key] = {
                        year: item.year,
                        group: item.group,
                        supply_group: item.supply_group,
                        volume: item.volume,
                        value: 0,
                    };
                }

                aggregation[key].value += item.value || 0;
            });

            return Object.values(aggregation);
        };

        const result = aggregateData(input);

        const valueArray = result.map((item) => item.value);

        return valueArray;
    }

    function PrepareData(data) {
        let input = data;

        input = input.filter((item) => item.supply_group == "P4R");

        input = input.map((item) => {
            const newItem = Object.assign({}, item);
            delete newItem.owner;
            return newItem;
        });

        input = input.filter((item) => item.year >= 2023 && item.year <= 2033).filter((item) => SELECTED_PORTFOLIO.includes(item.portfolio_type));

        const aggregateData = (input) => {
            const aggregated = input.reduce((acc, curr) => {
                const { year, group, supply_group, volume, value } = curr;
                const key = `${year}-${group}-${supply_group}-${volume}`;

                if (!acc[key]) {
                    acc[key] = { year, group, supply_group, volume, value: 0 };
                }

                acc[key].value += value || 0;

                return acc;
            }, {});

            return Object.values(aggregated);
        };

        const aggregatedData = aggregateData(input);

        input = renameField(aggregatedData, "value", "supply_value");
        input = addStaticField(input, "demand_value", 0);

        return input;
    }

    PrepareDataIsBase();

    let value_object = PrepareData(output1);
    let value_array = PrepareDemandValue(output2);

    value_object.forEach((item, index) => {
        if (index < value_array.length) {
            const _temp_value = value_array[index];

            if (_temp_value == null) {
                _temp_value = 0;
            }
            item.demand_value = _temp_value;
        }
    });

    value_object = value_object.map((item) => Object.assign({}, item, { value: item.supply_value - item.demand_value }));
    value_object = value_object.map((item) => {
        const newItem = Object.assign({}, item, { volume: "available", scenario: scenario, scenario_type: type });
        delete newItem.supply_value;
        delete newItem.demand_value;
        return newItem;
    });

    return value_object;
}

const base_data = prepareAndProcessData(SELECTED_BASE_SCENARIO, "base");
const target_data = prepareAndProcessData(SELECTED_TARGET_SCENARIO, "target");

const mergedData = base_data.concat(target_data);

// -------------------------------------------------------- Series and category
const series = [];

const categories_list = [];

mergedData.forEach((item) => {
    categories_list.push(item.year);
});

const series_base = [];
const series_target = [];

mergedData.forEach((item) => {
    if (item.scenario_type == "base") {
        series_base.push(item.value);
    } else {
        series_target.push(item.value);
    }
});

if (SELECTED_BASE_SCENARIO == SELECTED_TARGET_SCENARIO) {
    // Base
    let _s = {
        name: "base",
        data: series_base,
        id: SELECTED_BASE_SCENARIO,
        borderRadius: 0,
    };

    series.push(_s);

    // Target
    _s = {
        name: "base",
        data: series_target,
        linkedTo: SELECTED_BASE_SCENARIO,
        borderRadius: 0,
    };

    series.push(_s);
} else {
    // Base
    let _s = {
        name: SELECTED_BASE_SCENARIO,
        data: series_base,
        borderRadius: 0,
    };

    series.push(_s);

    // Target
    _s = {
        name: SELECTED_TARGET_SCENARIO,
        data: series_target,
        borderRadius: 0,
    };

    series.push(_s);
}

// -----------------------------------------------------End series and category

// Highcharts.chart("chart", {
//     chart: {
//         type: "column",
//     },
//     title: {
//         text: "Spot and Term Reserve (Planned)",
//         align: "center",
//         style: {
//             fontWeight: "300",
//             fontSize: "1.3775510204081634em",
//             fontFamily: "'Nunito', sans-serif",
//             color: " #000000",
//         },
//     },
//     subtitle: {
//         text: "[ MT ]",
//         align: "center",
//         style: {
//             fontWeight: "500",
//             fontSize: "0.9948979591836735em",
//             fontFamily: "'Nunito', sans-serif",
//             color: " #000000",
//         },
//     },
//     xAxis: {
//         categories: categories_list,

//         visible: false,
//     },

//     yAxis: {
//         title: {
//             text: "",
//         },
//         startOnTick: false,
//         endOnTick: false,
//         labels: {
//             formatter: function () {
//                 return this.value >= 0 ? this.value : "";
//             },
//         },
//         visible: true,
//     },
//     credits: {
//         enabled: false,
//     },
//     plotOptions: {},
//     series: series,
//     legend: {
//         labelFormatter: function () {
//             if (SELECTED_BASE_SCENARIO === SELECTED_TARGET_SCENARIO) {
//                 return SELECTED_BASE_SCENARIO;
//             } else {
//                 return this.name;
//             }
//         },
//     },
// });

Highcharts.chart("chart", {
    chart: {
        type: "column",
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
        type: "category",
        lineColor: "rgb(160, 160, 160)",
        gridLineWidth: 1,
        gridLineColor: "#cfcfcf",
        tickWidth: 1,
        tickLength: 10,
        tickColor: "#a0a0a0",
        showEmpty: false,

        visible: false,
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
            formatter: function () {
                return this.value >= 0 ? this.value : "";
            },
            style: {
                color: "#000000",
                fontSize: "11",
                fill: "#000000",
                cursor: "pointer",
            },
        },
        visible: true,
    },
    credits: {
        enabled: false,
    },
    plotOptions: {
        column: {
            dataLabels: {
                enabled: true,
                grouping: true,
                formatter: function () {
                    if (this.y == 0) return "";
                    else return parseFloat(this.y).toFixed(1);
                },
            },
        },
        // column: {
        //     pointPadding: 0.1,
        //     borderWidth: 0,
        //     dataLabels: {
        //         enabled: true,
        //         color: "#000000",
        //         style: {
        //             fontSize: "11px",
        //             fontFamily: "'Nunito', sans-serif",
        //             fontWeight: "400",
        //         },
        //         formatter: function () {
        //             return parseFloat(this.y).toFixed(1);
        //         },
        //         verticalAlign: "bottom",
        //         inside: false,
        //     },
        // },
        series: {
            animation: false,
        },
    },
    series: series,
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
        labelFormatter: function () {
            if (SELECTED_BASE_SCENARIO === SELECTED_TARGET_SCENARIO) {
                return SELECTED_BASE_SCENARIO;
            } else {
                return this.name;
            }
        },
    },
});
