// _SOMETHING_ is input value

let CHARACTER_NOT_ALLOW = "ST";
let NOT_ALLOW = [
    "MLNG Integrated Vessels (Calling Bintulu)",
    "PLL Integrated Vessels (Calling Bintulu)",
    "PLL Integrated Vessels (Calling GLNG)",
    "PLL Integrated Vessels (Calling Floaters)",
    "PLL Integrated Vessels (Calling Kitimat)",
    "PLL Integrated Vessels (Calling Sabine Pass)",
    "PLL Newbuilds Integrated Vessels (Calling Bintulu)",
];

let transformedData = [];
let defaultShip = [];
let ship_data = {};

let ship_vessel_order = [];

fetch("vessel.json")
    .then((response) => response.json())
    .then((data) => {
        data.forEach((item) => {
            if (!ship_vessel_order.includes(item.vessel)) {
                ship_vessel_order.push(item.vessel);
            }

            // Get SHIP SERIES by SHIP
            // Value is { "_SHIP_": {"vessel_series": "_SERIES_"}}
            let transformedItem = {};
            transformedItem[item.vessel] = {
                vessel_series: item.vessel_series,
            };
            transformedData.push(transformedItem);

            // Get Default ship by year
            // Conditions:
            // - Series != "Temp Series"
            // - charter_start_date <= _Year_ <= charter_expiry_date
            if (item.vessel_series != SERIES_NOT_ALLOW && item.charterer != CHARACTER_NOT_ALLOW && !NOT_ALLOW.includes(item.vessel)) {
                const startYear = new Date(item.charter_start_date).getFullYear();
                const expiryYear = new Date(item.charter_expiry_date).getFullYear();
                const escalationYear = new Date(item.escalation_start_year).getFullYear();
                if (year >= startYear && year <= expiryYear) {
                    defaultShip.push(item.vessel);
                }
            }
        });

        defaultShip.forEach((item) => {
            // Create an object for the ship if it does not already exist.
            if (!ship_data[item]) {
                ship_data[item] = {};
            }

            ship_data[item][scenario_all_text] = {};
            ship_data[item][scenario_all_text]["Signed"] = {
                utils: 0.0,
                active_date: 0.0,
                utilization: 0.0,
                percent: 0.0,
            };
        });

        let shipDataEntries = Object.entries(ship_data);

        // Sort the entries by the ship names
        shipDataEntries.sort((a, b) => a[0].localeCompare(b[0]));

        ship_data = Object.fromEntries(shipDataEntries);

        console.log(ship_vessel_order);
    })
    .catch((error) => {
        console.error("Error fetching JSON:", error);
    });
