/**
 * Creates a pie chart to visualize the input data.
 * @param canvas The canvas which contains the diagram
 * @param categories The labels for the data
 * @param dataset The data that will be visualized
 * @param bgcolors Backgroundcolors in the diagram
 * @param bdcolors Bordercolors in the diagram
 */
function createChart( canvas, categories, dataset, bgcolors, bdcolors ) {
     spendingChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: categories,
            datasets: [{
                data: dataset,
                backgroundColor: bgcolors,
                borderColor: bdcolors,
                borderWidth: 1
            }]
        },
        options: {
            display: false
        }
    });
}
