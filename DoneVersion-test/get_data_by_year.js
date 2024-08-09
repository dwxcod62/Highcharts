let ship_in_year = [];
let ship_in_year_third = [];

function calculateUtilization(shipData) {
    for (const ship in shipData) {
        for (const scenario in shipData[ship]) {
            for (const status in shipData[ship][scenario]) {
                const utils = shipData[ship][scenario][status].utils;
                const activeDate = shipData[ship][scenario][status].active_date;

                if (activeDate !== 0) {
                    const utilization = (utils / activeDate) * 100;
                    shipData[ship][scenario][status].utilization = parseFloat(utilization);
                    shipData[ship][scenario][status].percent = parseFloat(utilization.toFixed(1));
                }
            }
        }
    }
}

function addMissingStatuses(shipData, uniqueStatuses) {
    for (const ship in shipData) {
        if (ship_in_year.includes(ship))
            for (const scenario in shipData[ship]) {
                const currentStatuses = Object.keys(shipData[ship][scenario]);
                for (const uniqueStatus of uniqueStatuses) {
                    if (!currentStatuses.includes(uniqueStatus)) {
                        shipData[ship][scenario][uniqueStatus] = {
                            utils: 0.0,
                            active_date: 0.0,
                            utilization: 0.0,
                            percent: 0.0,
                        };
                    }
                }
            }
    }
}

function prepareCategories(totalUtilizationByShip, shipData) {
    let count = 10;
    return totalUtilizationByShip.map((item) => {
        let categories = [];
        let name = item.ship;
        if (ship_in_year.includes(item.ship)) {
            name = `${count}_${item.ship}`;
            count++;

            scenario_order.forEach((scenario) => {
                if (shipData[item.ship][scenario]) {
                    categories.push(scenario);
                }
            });
        } else {
            if (scenario_list.length > 0) {
                categories.push(scenario_all_text);
            } else {
                categories.push("");
            }
        }

        return {
            name: name,
            categories: categories,
        };
    });
}

function prepareSeriesArray(totalUtilizationByShip, shipData, uniqueStatuses) {
    const seriesArray = [];
    desiredOrder.forEach((status) => {
        if (uniqueStatuses.includes(status)) {
            const data = [];
            totalUtilizationByShip.forEach((item) => {
                const ship = item.ship;
                if (shipData[ship]) {
                    if (ship_in_year.includes(ship)) {
                        scenario_order.forEach((scenario) => {
                            if (shipData[ship][scenario]) {
                                if (shipData[ship][scenario][status]) {
                                    const percent = shipData[ship][scenario][status].percent || 0.0;
                                    data.push(percent);
                                } else {
                                    data.push(0.0);
                                }
                            }
                        });
                    } else {
                        data.push(0.0);
                    }
                }
            });
            seriesArray.push({
                name: status,
                data: data,
                color: getColorForStatus(status),
            });
        }
    });
    return seriesArray;
}

const customRenders = [];
const height_per_row = 28;
let bar_height = height_per_row * 0.6;

if (scenario_list.length == 1) {
    bar_height = height_per_row * 0.9;
}

// Render SVG at the value mark 100 when the bar exceeds the threshold of 100
// Adding it to a list helps ensure that when you resize, causing the chart to render again, the SVG will not be duplicated.
function drawRect(point) {
    const chart = point.series.chart;

    let stroke_width = 4 * 0.8;

    let range = (bar_height - 2) / 2;
    let margin_os = 2;

    let yCoord = chart.yAxis[0].toPixels(100); // get x position of value mark 100
    let xCoord = 49 + point.dataLabel.getBBox().y; // get y position of current bar

    // let path = ["M", yCoord - 1, xCoord + 8 - range, "L", yCoord - 4, xCoord + 4 - range, "L", yCoord + 3, xCoord - 4, "L", yCoord, xCoord - 8];
    let path = ["M", yCoord, xCoord + range, "L", yCoord - 4, xCoord + 4, "L", yCoord + 4, xCoord - 4, "L", yCoord, xCoord - range];
    // temp value to add customRender
    let a = chart.renderer
        .path(path)
        .attr({
            stroke: "rgba(58,58,58,0.5)",
            "stroke-width": stroke_width,
            fill: "none",
        })
        .add()
        .toFront();

    customRenders.push(a);
}

function renderChart(categories, seriesArray, hei) {
    Highcharts.chart("chart", {
        chart: {
            type: "bar",
            height: hei, //fixed height
            events: {
                // It will load every time the chart is rendered.
                render: function () {
                    customRenders.forEach((render) => render.destroy());
                    customRenders.length = 0;

                    this.series.forEach(function (series) {
                        if (series.visible) {
                            series.points.forEach(function (point) {
                                if (point.y > 100) {
                                    drawRect(point);
                                }
                            });
                        }
                    });

                    const chart = this;
                    const ticks = chart.yAxis[0].ticks;
                    ticks[0].gridLine.hide();
                },

                load: function () {
                    this.container.querySelectorAll('text[opacity="0"]').forEach((element) => {
                        element.remove();
                    });
                },
                redraw: function () {
                    this.container.querySelectorAll('text[opacity="0"]').forEach((element) => {
                        element.remove();
                    });
                },
            },
        },
        title: {
            text: "% Shipping Utilization by Year: 2024",
            // FIX
            style: {
                fontWeight: "normal",
            },
        },
        xAxis: {
            categories: categories,
            labels: {
                rotation: 0,
                x: -8,
                align: "right",
                style: {
                    fontSize: "11px",
                },
            },
        },
        yAxis: {
            min: 0,
            title: {
                text: "",
            },
            labels: {
                formatter: function () {
                    return Highcharts.numberFormat(this.value, 0, ".", ",");
                },
            },
        },
        legend: {
            // FIX
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
                    "%" +
                    "<br/>"
                );
            },
        },
        plotOptions: {
            series: {
                stacking: "normal",
                pointWidth: bar_height,
                dataLabels: {
                    enabled: true,
                    inside: true,
                    formatter: function () {
                        let value = null;
                        let a = 0;
                        let ship_name = this.x.parent.name;
                        const ship_split = ship_name.split("_");
                        if (ship_split.length > 2) {
                            ship_name = ship_split[1] + "_" + ship_split[2];
                        } else {
                            ship_name = ship_split[1];
                        }
                        if (!ship_in_year.includes(ship_name)) {
                            value = "0.0";
                        }
                        return this.y !== 0 ? this.y : value;
                    },
                    style: {
                        fontSize: "11px",
                    },
                },
            },
        },
        series: seriesArray,

        // FIX
        credits: {
            enabled: false,
        },
    });
}

function getScenarioOrder(ship_data) {
    for (const ship in ship_data) {
        const temp = [];
        let firstTotalUtilization = null;
        let allEqual = true;

        for (const scenario in ship_data[ship]) {
            if (scenario != scenario_all_text) {
                let total = 0;
                for (const st in ship_data[ship][scenario]) {
                    total += ship_data[ship][scenario][st].utilization;
                }

                if (firstTotalUtilization === null) {
                    firstTotalUtilization = total;
                } else if (total !== firstTotalUtilization) {
                    allEqual = false;
                }

                const keyValue = { [scenario]: total };
                temp.push(keyValue);
            }
        }

        if (!allEqual) {
            temp.sort((a, b) => {
                const aValue = Object.values(a)[0];
                const bValue = Object.values(b)[0];
                return bValue - aValue;
            });

            scenario_order[scenario_order.indexOf(ship)] = {
                ship,
                order: temp.map((item) => item.scenario),
            };

            return;
        }
    }
}

function sortScenarioOrder(scenarios) {
    let baseScenarios = scenarios.filter((scenario) => scenario.includes("[Base]"));
    let nonBaseScenarios = scenarios.filter((scenario) => !scenario.includes("[Base]"));

    if (baseScenarios.length > 0) {
        return baseScenarios.concat(nonBaseScenarios);
    } else {
        return scenarios;
    }
}

function caclHeightChart(total) {
    var fixed_space = 150;
    var min_height = 1596;

    var rs = min_height;

    var actual_height = total * height_per_row;
    if (actual_height > min_height) {
        rs = actual_height;
    }

    rs += fixed_space;
    return rs;
}

function getTotalScenarioInChart(shipData) {
    var count = 0;
    for (const ship in shipData) {
        if (ship_in_year.includes(ship)) {
            for (const scenario in shipData[ship]) {
                if (scenario != scenario_all_text) {
                    count++;
                }
            }
        } else {
            count++;
        }
    }
    return count;
}

function desiredOrderFunction(list_order) {
    list_order.sort((a, b) => {
        let indexA = DESIRED_ORDER.indexOf(a);
        let indexB = DESIRED_ORDER.indexOf(b);

        if (indexA === -1) indexA = DESIRED_ORDER.length;
        if (indexB === -1) indexB = DESIRED_ORDER.length;

        return indexA - indexB;
    });
}

const DESIRED_ORDER = ["Signed", "P90", "P50", "P10", "Term Excess", "Spot", "Dry Dock"];
DESIRED_ORDER.reverse();

let desiredOrder = [];
let scenario_order = [];

let temp_11 = [];

fetch("data.json")
    .then((response) => response.json())
    .then((data) => {
        // Process SHIP with name is "third" and add "ship_series"
        const filteredAndUpdatedData = data
            .filter((item) => item.Year === year)
            .map((item) => {
                const shipName = checkName(item.Ship, item.Parcel_size);
                const matchingSeries = transformedData.find((tdItem) => tdItem[shipName]);
                const updatedItem = Object.assign({}, item);

                let vessel = shipName;
                let is_third = true;
                if (item.Ship != "third") {
                    vessel = item.Ship;
                    is_third = false;
                }
                updatedItem.isThird = is_third;
                updatedItem.Vessel = vessel;
                updatedItem.Ship = shipName;
                updatedItem.ship_series = matchingSeries ? matchingSeries[shipName].vessel_series : "third";

                if (matchingSeries) {
                    updatedItem.ship_series = matchingSeries[shipName].vessel_series;
                } else {
                    if (is_third) {
                        updatedItem.ship_series = "third";
                    } else {
                        updatedItem.ship_series = "";
                    }
                }

                return updatedItem;
            })
            .filter((item) => item.Ship !== "fob");

        window.data = filteredAndUpdatedData;
        //  -------------------------------------------------------------------------------------------------------

        if (scenario_list.length > 0) {
            filteredAndUpdatedData.forEach((data) => {
                let ship = data.Ship;
                const status = formatStatus(data.Status);
                const active_day = parseInt(data.Active_days);
                const scenario = data.Scenario;
                const tt = parseFloat(data.Tt);
                const num_trip = parseInt(data.Num_trips);
                const dry_day = parseInt(data.Dry_dock_days);
                const character = data.Charterer;

                if (selected_ship.includes(ship) && scenario_list.includes(scenario) && AVAILABLE_CHARACTER.includes(character)) {
                    if (!ship_data[ship]) {
                        ship_data[ship] = {};
                    }

                    if (!scenario_order.includes(scenario)) {
                        scenario_order.push(scenario);
                    }

                    if (!ship_data[ship][scenario]) {
                        ship_data[ship][scenario] = {};
                    }
                    // Initialize the status object if it does not already exist.
                    if (!ship_data[ship][scenario][status]) {
                        if (!uniqueStatuses.includes(status)) {
                            uniqueStatuses.push(status);
                        }

                        ship_data[ship][scenario][status] = {
                            utils: 0.0,
                            active_date: 0.0,
                            utilization: 0.0,
                            percent: 0.0,
                        };
                    }

                    // Update the active date if the current active day is greater.
                    if (active_day + dry_day > ship_data[ship][scenario][status]["active_date"]) {
                        ship_data[ship][scenario][status]["active_date"] = active_day + dry_day;
                    }

                    // Accumulate the util value.
                    ship_data[ship][scenario][status]["utils"] += tt.toFixed(0) * num_trip;

                    if (data.isThird) {
                        if (!ship_in_year_third.includes(ship)) {
                            ship_in_year_third.push(ship);
                        }
                    } else {
                        if (!ship_in_year.includes(ship)) {
                            ship_in_year.push(ship);
                        }
                    }
                }
            });
        }

        ship_in_year = ship_in_year.concat(ship_in_year_third);

        const logShipData = (ship_data) => {
            for (const ship in ship_data) {
                for (const scenario in ship_data[ship]) {
                    for (const status in ship_data[ship][scenario]) {
                        if (!desiredOrder.includes(status)) {
                            desiredOrder.push(status);
                        }
                    }
                }
            }
        };

        logShipData(ship_data);

        scenario_order = sortScenarioOrder(scenario_order);
        calculateUtilization(ship_data);
        addMissingStatuses(ship_data, uniqueStatuses);
        const totalUtilizationByShip = calculateTotalUtilization(ship_data);

        // if (scenario_list.length < 1) {
        //     totalUtilizationByShip.reverse();
        // }

        desiredOrderFunction(desiredOrder);

        const categories = prepareCategories(totalUtilizationByShip, ship_data);
        const seriesArray = prepareSeriesArray(totalUtilizationByShip, ship_data, uniqueStatuses);

        const hei = caclHeightChart(getTotalScenarioInChart(ship_data));

        renderChart(categories, seriesArray, hei);

        //  -------------------------------------------------------------------------------------------------------
    })
    .catch((error) => {
        console.error("Error fetching JSON:", error);
    });
