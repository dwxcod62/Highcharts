const FILTER_GROUP = [
    "uqt_buyer_right",
    "stq_buyer_right",
    "dqt_buyer_right",
    "commercial_cancellation_buyer_right",
    "deferment_buyer_right",
    "final_delivery",
    "seller_upward_right",
    "seller_downward_right",
    "delta_stq_profit",
    "delta_uqt_profit",
    "delta_cancellation_profit",
    "delta_dqt_profit",
    "delta_deferment_profit",
    "delta_seller_upward_profit",
    "delta_seller_downward_profit",
    "delta_base_profit",
    "delta_profit",
    "cancellation_profit",
    "stq_profit",
    "uqt_profit",
    "dqt_profit",
    "deferment_profit",
    "seller_upward_profit",
    "seller_downward_profit",
    "base_profit",
    "profit",
    "seller_upward",
    "seller_downward",
];

const categoryMapping = {
    buyer_dqt: "Buyer DQT",
    buyer_stq: "Buyer STQ",
    buyer_uqt: "Buyer UQT",
    base_delivery: "Base Delivery",
    final_delivery: "Final Delivery",
    deferment_delivery: "Deferment Delivery",
    buyer_commercial_cancellation: "Buyer Commercial Cancellation",
};

const base_filter_second_phase = ["Flex", "Category"];
const colorMap = ["#00a19c", "#763f98", "#20419a", "#fdb924", "#bfd730", "#30c1d7", "#295e7e", "#965971", "#c41300", "#ea8b00", "#00a19c"];

//Function  ----------------------------

const getRandomColor = () => {
    const randomIndex = Math.floor(Math.random() * colorMap.length);
    return colorMap[randomIndex];
};

function Parameterized(scenarioInput) {
    let data_for_prepare = [];

    // Step 1: Filter and map the initial data
    data_for_prepare = json_data
        .filter((item) => !FILTER_GROUP.includes(item.group))
        .map((item) => {
            const newItem = Object.assign({}, item, {
                Category: item.group,
                Deliveries: item.value || 0,
            });
            delete newItem.group;
            delete newItem.value;
            return newItem;
        })
        .filter((item) => item.year >= START_YEAR && item.year <= END_YEAR);

    // Step 2: Aggregate data
    let aggregatedData = data_for_prepare.reduce((acc, item) => {
        const key = `${item.Category}-${item.scenario}-${item.destination}`;
        if (!acc[key]) {
            acc[key] = {
                Category: item.Category,
                scenario: item.scenario,
                destination: item.destination,
                Deliveries: 0,
            };
        }
        acc[key].Deliveries += item.Deliveries || 0;
        return acc;
    }, {});

    let result = Object.values(aggregatedData);

    // Step 3: Map data with new properties and filter by scenario
    data_for_prepare = result
        .map((item) => Object.assign({}, item, { Series: "FCL" }))
        .map((item) => {
            const newCategory = categoryMapping[item.Category] || item.Category;
            return Object.assign({}, item, { Category: newCategory });
        })
        .filter((item) => item.scenario === scenarioInput);

    // Step 4: Re-aggregate data
    aggregatedData = data_for_prepare.reduce((acc, item) => {
        const key = `${item.Category}-${item.Series}-${item.scenario}`;
        if (!acc[key]) {
            acc[key] = {
                Category: item.Category,
                Series: item.Series,
                scenario: item.scenario,
                Deliveries: 0,
            };
        }
        acc[key].Deliveries += item.Deliveries || 0;
        return acc;
    }, {});

    result = Object.values(aggregatedData);

    // Step 5: Get unique base deliveries and determine base_delivery
    const uniqueResult = [];
    const deliveriesSet = new Set();
    let base_delivery = 1;

    const base_delivery_filter = result.filter((item) => item.Category === "Base Delivery");

    for (const item of base_delivery_filter) {
        if (!deliveriesSet.has(item.Deliveries)) {
            uniqueResult.push(item);
            deliveriesSet.add(item.Deliveries);
        }
    }

    for (const item of uniqueResult) {
        if (item.Deliveries > base_delivery) {
            base_delivery = item.Deliveries;
        }
    }

    // Step 6: Prepare final data with Flex and FlexCalc properties
    data_for_prepare = result
        .filter((item) => item.Category !== "Base Delivery")
        .map((item) =>
            Object.assign({}, item, {
                Flex: (item.Deliveries / base_delivery) * 100,
                FlexCalc: `${item.Deliveries}/${base_delivery}`,
            })
        );

    return data_for_prepare;
}

// End Function ------------------------

let base_data = Parameterized(SELECTED_BASE_SCENARIO);
let target_data = Parameterized(SELECTED_TARGET_SCENARIO);

// Filter columns function
const filterColumns = (data, columnsToKeep) => {
    return data.map((item) => {
        let filteredItem = {};
        columnsToKeep.forEach((col) => {
            if (item.hasOwnProperty(col)) {
                filteredItem[col] = item[col];
            }
        });
        return filteredItem;
    });
};

// Filter base data
base_data = filterColumns(base_data, base_filter_second_phase);
base_data = base_data.map((item) => {
    const newItem = Object.assign({}, item, {
        BaseFlex: item.Flex,
    });
    delete newItem.Flex;
    return newItem;
});

// Left join function
const leftJoin = (target, base, key) => {
    const baseMap = new Map(base.map((item) => [item[key], item]));
    return target.map((item) => Object.assign({}, item, baseMap.get(item[key])));
};

// Perform left join and sort the result
let data_after_join = leftJoin(target_data, base_data, "Category");
data_after_join.sort((a, b) => a.Category.localeCompare(b.Category));

// Render chart
let a = [];
data_after_join.forEach((dt) => {
    let d = {
        name: dt.Category,
        y: dt.Flex,
        baseFlex: dt.BaseFlex,
        flc: dt.FlexCalc,
    };
    a.push(d);
});

Highcharts.chart("chart", {
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
        text: "Upward/Downward Flex [%]",
        style: {
            fontFamily: '"Nunito", sans-serif',
            fontSize: "1.3775510204081634em",
            color: "#161a1d",
            fontWeight: "300",
            fill: "#161a1d",
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
    plotOptions: {
        column: {
            pointPadding: 0.1,
            borderWidth: 0,
        },
        series: {
            animation: false,
        },
    },
    tooltip: {
        useHTML: true,
        backgroundColor: "rgb(117,117,117,.8)",
        borderWidth: 1,
        borderRadius: 3,
        formatter: function () {
            var color = this.point.color;
            let flex = parseFloat(this.point.y.toFixed(3));
            let baseFlex = parseFloat(this.point.baseFlex.toFixed(3));

            return (
                '<span style="background-color:' +
                color +
                '; border-radius:50%; width:7px; height:7px; display:inline-block;"></span> ' +
                this.point.name +
                "<br>" +
                "<b>Flex: </b>" +
                flex +
                "%" +
                "<br>" +
                "<b>Base Flex: </b>" +
                baseFlex +
                "%" +
                "<br>" +
                "<b>FLC / Base Delivery: </b>" +
                this.point.flc
            );
        },
    },
    series: [
        {
            // color: getRandomColor(),
            borderRadius: 0,
            data: a,
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
                animation: false,
                pointPadding: 0,
            },
        },
    ],
});
