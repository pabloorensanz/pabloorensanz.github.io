var palette = ['rgba(0, 82, 156, 0.8)', 'rgba(243, 83, 91, 0.8)', 'rgba(236, 116, 4, 0.5)', 'rgba(0, 133, 50, 0.5)', 'rgba(38, 178, 208, 0.5)'];

function generateChart (id, type, title, data, options) {
	defaultOptions = {
		responsive: true,
		maintainAspectRatio: false,
		title: {
			display: true,
			text: title
		},
		legend: {
			display: true,
			position: 'bottom',
			labels: {
				fontColor: 'rgb(255, 99, 132)',
				border: 'none'
			}
		}
	}
	
	return new Chart(document.getElementById(id).getContext('2d'), {
		type: type,//bar, doughnut
		data: data,
		options: Object.assign(defaultOptions, options)
	})
}

function generateData (series, labels, transpose) {
	var data = {},
		datasets = [];
	
	for(i = 0; i < series.length; i++) {
		var values = [];
		for(j = 0; j < labels.length; j++) {
			values[j] = Math.round(Math.random() * 100);
		}
		datasets[i] = {
			'label': series[i],
			'data': values,
			backgroundColor: ((transpose) ? palette : palette[i]),
			fill: false
		};
	}
	console.log(datasets)
	return {
		datasets: datasets,
		labels: labels
	}
}