const ship_in_year = [];

function calculateUtilization(shipData) {
    for (const ship in shipData) {
        for (const scenario in shipData[ship]) {
            for (const status in shipData[ship][scenario]) {
                const utils = shipData[ship][scenario][status].utils;
                const activeDate = shipData[ship][scenario][status].active_date;

                if (activeDate !== 0) {
                    const utilization = (utils / activeDate) * 100;
                    shipData[ship][scenario][status].utilization = parseFloat(utilization.toFixed(1));
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
                        };
                    }
                }
            }
    }
}

function prepareCategories(totalUtilizationByShip, shipData) {
    return totalUtilizationByShip.map((item) => {
        let categories = [];
        if (ship_in_year.includes(item.ship)) {
            let temp = Object.keys(shipData[item.ship]);
            let object = temp.filter((item) => item != scenario_all_text);
            categories = object;
        } else {
            categories.push(scenario_all_text);
        }

        return {
            name: item.ship,
            categories: categories,
        };
    });
}

function prepareSeriesArray(totalUtilizationByShip, shipData, uniqueStatuses) {
    const seriesArray = [];
    DESIRED_ORDER.forEach((status) => {
        if (uniqueStatuses.includes(status)) {
            const data = [];
            totalUtilizationByShip.forEach((item) => {
                const ship = item.ship;
                if (shipData[ship]) {
                    for (const scenario in shipData[ship]) {
                        if (ship_in_year.includes(ship)) {
                            if (scenario != scenario_all_text) {
                                if (shipData[ship][scenario][status]) {
                                    const utilization = shipData[ship][scenario][status].utilization || 0.0;
                                    data.push(utilization);
                                } else {
                                    data.push(0.0);
                                }
                            }
                        } else {
                            data.push(0.0);
                        }
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

function renderChart(categories, seriesArray) {
    Highcharts.chart("container", {
        chart: {
            type: "bar",
            height: 1600,
        },
        title: {
            text: "% Shipping Utilization by Year: 2024 ",
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
        },
        legend: {
            backgroundColor: "#0000001a",
        },
        tooltip: {
            backgroundColor: "#B4B4B8",
            pointFormatter: function () {
                const color = this.series.color;
                return '<span style="color:' + color + '">\u25CF</span> ' + this.series.name + ": " + this.y.toFixed(1) + "%<br/>";
            },
        },
        plotOptions: {
            series: {
                stacking: "normal",
                borderWidth: 1,
                borderColor: "#000",
                pointWidth: 14,
                dataLabels: {
                    enabled: true,
                    inside: true,
                    formatter: function () {
                        let value = null;
                        if (this.x.name == scenario_all_text) {
                            value = "0.0";
                        }

                        return this.y !== 0 ? this.y.toFixed(1) : value; // Display utilization with %
                    },
                    style: {
                        fontSize: "11px",
                        color: "black",
                    },
                },
            },
        },
        series: seriesArray,
    });
}

fetch("data.json")
    .then((response) => response.json())
    .then((data) => {
        // Process SHIP with name is "third" and add "ship_series"
        const filteredAndUpdatedData = data
            .filter((item) => item.Year == year)
            .map((item) => {
                const shipName = checkName(item.Ship, item.Parcel_size);
                return {
                    ...item,
                    Ship: shipName,
                    ship_series: transformedData.find((tdItem) => Object.keys(tdItem)[0] == shipName)?.[shipName]?.vessel_series || "third",
                };
            })
            .filter((item) => item.Ship != "fob");

        //  -------------------------------------------------------------------------------------------------------

        // Prepare raw data to chart
        filteredAndUpdatedData.forEach((data) => {
            let ship = data.Ship;
            const status = formatStatus(data.Status);
            const active_day = parseInt(data.Active_days);
            const scenario = data.Scenario;
            const tt = parseFloat(data.Tt);
            const num_trip = parseInt(data.Num_trips);
            const dry_day = parseInt(data.Dry_dock_days);
            const character = data.Character;

            if (selected_ship.includes(ship)) {
                if (!ship_in_year.includes(ship)) {
                    ship_in_year.push(ship);
                }

                if (!ship_data[ship]) {
                    ship_data[ship] = {};
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
                    };
                }

                // Update the active date if the current active day is greater.
                if (active_day + dry_day > ship_data[ship][scenario][status]["active_date"]) {
                    ship_data[ship][scenario][status]["active_date"] = active_day + dry_day;
                }

                // Accumulate the util value.
                ship_data[ship][scenario][status]["utils"] += tt * num_trip;
            }
        });

        calculateUtilization(ship_data);
        addMissingStatuses(ship_data, uniqueStatuses);

        const totalUtilizationByShip = calculateTotalUtilization(ship_data);
        const categories = prepareCategories(totalUtilizationByShip, ship_data);
        const seriesArray = prepareSeriesArray(totalUtilizationByShip, ship_data, uniqueStatuses);

        renderChart(categories, seriesArray);

        //  -------------------------------------------------------------------------------------------------------
    })
    .catch((error) => {
        console.error("Error fetching JSON:", error);
    });
