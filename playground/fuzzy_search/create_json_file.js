var borrar = [];
$.each(data, function (key, value) {
	//console.log(value);
	product = {
		"id": value.id,
		"marca": value.marca,
		"categoriaNivel2_ca": value.categoriaNivel2_ca,
		"descripcion_ca": value.descripcion_ca,
		"urlImagen80_ca": value.urlImagen80_ca,
		"urlImagen200_ca": value.urlImagen200_ca,
		"categoriaNivel2_es":value.categoriaNivel2_es,
		"descripcion_es":value.descripcion_es,
		"urlImagen80_es":value.urlImagen80_es,
		"urlImagen200_es":value.urlImagen200_es,
		"unidadMedida":value.unidadMedida
	}
	
	borrar.push(product)
})
function download(text, name, type) {
    var a = document.createElement("a");
    var file = new Blob([text], {type: type});
    a.href = URL.createObjectURL(file);
    a.download = name;
    a.click();
}
download(JSON.stringify(borrar), 'test.json', 'text/plain');