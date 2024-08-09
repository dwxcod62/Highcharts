function getColorForStatus(status) {
    const statusColors = {
        P10: "#ba7be0",
        P50: "#6689e8",
        P90: "#d4df33",
        Spot: "#ea8b00",
        Signed: "#00a19c",
        "Dry Dock": "#ba7be0",
        "Term Excess": "#c41300",
    };

    return statusColors[status] || "#000000";
}

function formatStatus(status) {
    let words = status.split("_");

    for (let i = 0; i < words.length; i++) {
        words[i] = words[i].charAt(0).toUpperCase() + words[i].slice(1).toLowerCase();
    }
    return words.join(" ");
}

function getFirstPart(shipName) {
    return shipName.split("_")[0];
}

const loadData = async () => {
    try {
        const response = await fetch("ver2.json");
        const jsonData = await response.json();

        const ship_data = {};
        const ship_data_temp = [];

        const uniqueStatuses = [];

        jsonData.forEach((data) => {
            let ship = getFirstPart(data.ship);
            const year = parseInt(data.Year);
            const status = formatStatus(data.Status);
            const active_day = parseInt(data.Active_days);
            const scenario = data.scenario;
            const tt = parseFloat(data.tt);
            const num_trip = parseInt(data.Num_trips);
            const dry_day = parseInt(data.Dry_dock_days);
            const character = data.Character;
            const parcel_size = data.Parcel_size;

            if (!ship_data_temp.includes(ship) && ship != "third" && ship != "fob") {
                ship_data_temp.push(ship);
            }

            if (year == 2027 && !ship.includes("fob") && !ship.includes("third") && availableCharacter.includes(character)) {
                if (ship.includes("third")) {
                    const parcel = Number(parcel_size.toFixed(3));
                    ship = ship + "_" + parcel;
                    if (!ship_data_temp.includes(ship) && ship != "third" && ship != "fob") {
                        ship_data_temp.push(ship);
                    }
                }

                // Create an object for the ship if it does not already exist.
                if (!ship_data[ship]) {
                    ship_data[ship] = {};
                }

                // Create an object for the scenario if it does not already exist.
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

        console.log(ship_data_temp.length);

        // Cal utilization
        for (const ship in ship_data) {
            for (const scenario in ship_data[ship]) {
                for (const status in ship_data[ship][scenario]) {
                    const utils = ship_data[ship][scenario][status].utils;
                    const active_day = ship_data[ship][scenario][status].active_date;

                    if (active_day !== 0) {
                        const utilization = (utils / active_day) * 100;
                        ship_data[ship][scenario][status].utilization = parseFloat(utilization.toFixed(1));
                    }
                }
            }
        }

        // Add missing statuses with zero values
        for (const ship in ship_data) {
            for (const scenario in ship_data[ship]) {
                const currentStatuses = Object.keys(ship_data[ship][scenario]);
                for (const uniqueStatus of uniqueStatuses) {
                    if (!currentStatuses.includes(uniqueStatus)) {
                        ship_data[ship][scenario][uniqueStatus] = {
                            utils: 0.0,
                            active_date: 0.0,
                            utilization: 0.0,
                        };
                    }
                }
            }
        }

        // Calculate total utilization for each ship and sort ships by total utilization of ship
        const totalUtilizationByShip = [];
        for (const ship in ship_data) {
            let totalUtilization = 0;
            for (const scenario in ship_data[ship]) {
                for (const status in ship_data[ship][scenario]) {
                    totalUtilization += ship_data[ship][scenario][status].utilization;
                }
            }
            totalUtilizationByShip.push({ ship, totalUtilization });
        }
        totalUtilizationByShip.sort((a, b) => b.totalUtilization - a.totalUtilization);

        // Prepare data categories for Highcharts
        const categories = totalUtilizationByShip.map((item) => {
            return {
                name: item.ship,
                categories: Object.keys(ship_data[item.ship]),
            };
        });

        // Prepare data series for Highcharts + sort status by desiredOrder
        const seriesArray = [];
        desiredOrder.forEach((status) => {
            if (uniqueStatuses.includes(status)) {
                const data = [];
                totalUtilizationByShip.forEach((item) => {
                    const ship = item.ship;
                    if (ship_data[ship]) {
                        for (const scenario in ship_data[ship]) {
                            if (ship_data[ship][scenario][status]) {
                                const utilization = ship_data[ship][scenario][status].utilization || 0.0;
                                data.push(utilization);
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

        // Create Highcharts
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
                            return this.y !== 0 ? this.y : null; // Display utilization with %
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
    } catch (error) {
        console.error("Error loading JSON data:", error);
    }
};

// Call the function to load data
loadData();
