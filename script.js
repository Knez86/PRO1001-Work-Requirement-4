/* ==============================
   1. API AND DOM REFERENCES
============================== */

const apiUrl = "https://fakestoreapi.com/products/test";

const totalProducts = document.getElementById("total-products");
const averageRating = document.getElementById("average-rating");
const totalCategories = document.getElementById("total-categories");
const statusMessage = document.getElementById("status-message");


/* ==============================
   2. FETCH PRODUCT DATA
============================== */

async function fetchProducts() {
    const response = await fetch(apiUrl);

    if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
    }

    const data = await response.json();

    if (!Array.isArray(data) || data.length === 0) {
        throw new Error("No product data available.");
    }

    return data;
}


/* ==============================
   3. EXTRACT RELEVANT DATA
============================== */

function extractProductData(products) {
    return products.map(product => ({
        title: product.title,
        category: product.category,
        rating: product.rating.rate
    }));
}


/* ==============================
   4. UPDATE OVERVIEW CARDS
============================== */

function updateOverview(products) {

    const ratingSum = products.reduce((sum, product) => {
        return sum + product.rating;
    }, 0);

    const average = ratingSum / products.length;

    const categories = new Set(
        products.map(product => product.category)
    );

    totalProducts.textContent = products.length;
    averageRating.textContent = average.toFixed(2) + " / 5";
    totalCategories.textContent = categories.size;
}


/* ==============================
   5. PREPARE CATEGORY DATA
============================== */

function prepareCategoryData(products) {

    const groupedCategories = {};

    products.forEach(product => {

        if (!groupedCategories[product.category]) {
            groupedCategories[product.category] = [];
        }

        groupedCategories[product.category].push(product.rating);
    });

    const categoryNames = Object.keys(groupedCategories);

    const categoryRatings = categoryNames.map(category => {

        const ratings = groupedCategories[category];

        const sum = ratings.reduce((total, rating) => {
            return total + rating;
        }, 0);

        const average = sum / ratings.length;

        return Number(average.toFixed(2));
    });

    return {
        names: categoryNames,
        ratings: categoryRatings
    };
}


/* ==============================
   6. PREPARE TOP PRODUCT DATA
============================== */

function prepareTopProducts(products) {

    const topProducts = [...products]
        .sort((a, b) => b.rating - a.rating)
        .slice(0, 5);

    return {
        names: topProducts.map(product => product.title),
        ratings: topProducts.map(product => product.rating)
    };
}


/* ==============================
   7. CATEGORY COLUMN CHART
============================== */

function renderCategoryChart(data) {

    Highcharts.chart("category-chart", {

        chart: {
            type: "column",
            animation: false,
            backgroundColor: "transparent"
        },

        title: {
            text: "Average Rating by Category"
        },

        accessibility: {
            enabled: true,

            description:
                "A column chart comparing the average product " +
                "ratings across different categories.",

            keyboardNavigation: {
                enabled: true
            }
        },

        xAxis: {
            categories: data.names,
            title: {
                text: "Product Category"
            }
        },

        yAxis: {
            min: 0,
            max: 5,
            tickInterval: 1,

            title: {
                text: "Average Rating (0–5)"
            }
        },

        tooltip: {
            headerFormat: "<b>{point.key}</b><br>",
            pointFormat: "Average rating: {point.y:.2f} / 5"
        },

        plotOptions: {
            series: {
                animation: false
            },

            column: {
                dataLabels: {
                    enabled: true,
                    format: "{point.y:.2f}"
                }
            }
        },

        series: [{
            name: "Average Rating",
            data: data.ratings,
            color: "#3576BD"
        }],

        legend: {
            enabled: false
        }
    });
}


/* ==============================
   8. TOP PRODUCTS BAR CHART
============================== */

function renderTopProductsChart(data) {

    Highcharts.chart("topproducts-chart", {

        chart: {
            type: "bar",
            animation: false,
            backgroundColor: "transparent"
        },

        title: {
            text: "Top 5 Products by Rating"
        },

        accessibility: {
            enabled: true,

            description:
                "A horizontal bar chart displaying the five " +
                "highest-rated products in descending order.",

            keyboardNavigation: {
                enabled: true
            }
        },

        xAxis: {
            categories: data.names,

            title: {
                text: "Product"
            },

            reversed: true,

            labels: {
                style: {
                    fontSize: "11px"
                }
            }
        },

        yAxis: {
            min: 0,
            max: 5,
            tickInterval: 1,

            title: {
                text: "Customer Rating (0–5)"
            }
        },

        tooltip: {
            headerFormat: "<b>{point.key}</b><br>",
            pointFormat: "Customer rating: {point.y:.1f} / 5"
        },

        plotOptions: {
            series: {
                animation: false
            },

            bar: {
                dataLabels: {
                    enabled: true,
                    format: "{point.y:.1f}"
                }
            }
        },

        series: [{
            name: "Customer Rating",
            data: data.ratings,
            color: "#168478"
        }],

        legend: {
            enabled: false
        },

        responsive: {
            rules: [{
                condition: {
                    maxWidth: 500
                },

                chartOptions: {
                    xAxis: {
                        labels: {
                            style: {
                                fontSize: "10px",
                                width: "100px",
                                textOverflow: "ellipsis"
                            }
                        }
                    }
                }
            }]
        }
    });
}


/* ==============================
   9. INITIALIZE DASHBOARD
============================== */

async function initializeDashboard() {

    statusMessage.textContent = "Loading product data...";
    statusMessage.classList.remove("error");

    try {

        // Fetch and extract product information
        const products = await fetchProducts();
        const productData = extractProductData(products);

        // Update the statistical cards
        updateOverview(productData);

        // Prepare separate datasets for both charts
        const categoryData = prepareCategoryData(productData);
        const topProductsData = prepareTopProducts(productData);

        // Render the charts after successful data loading
        renderCategoryChart(categoryData);
        renderTopProductsChart(topProductsData);

        statusMessage.textContent =
            "Product data loaded successfully.";

    } catch (error) {

        statusMessage.textContent =
            "Unable to load the dashboard. Please refresh the page.";

        statusMessage.classList.add("error");

        console.error("Dashboard error:", error);
    }
}


/* ==============================
   10. START APPLICATION
============================== */

initializeDashboard();