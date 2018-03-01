var borrar = [];
$.each(data, function (key, value) {
	//console.log(value);
	borrar.push({'id': value.id, 'marca':  value.marca, 'descripcion':  value.descripcion_es, 'categorias': value.categoriaNivel2_es});
})
function download(text, name, type) {
    var a = document.createElement("a");
    var file = new Blob([text], {type: type});
    a.href = URL.createObjectURL(file);
    a.download = name;
    a.click();
}
download(JSON.stringify(borrar), 'test.txt', 'text/plain');