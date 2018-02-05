var fotos = [];
var fotoBase64;
var miniaturaAnchura;

oFReader = new FileReader();
oFReader.onload = function (oFREvent) {
	fotoBase64 = oFREvent.target.result;
	$('#photos').prepend('<div class="photo" style="background-image: url(\''+fotoBase64+'\');"></div>');
	$('#camera .material-icons').text('photo_camera');
};

$(function() {
    $('input:file').change(function (){
		$('#camera .material-icons').text('sync');
        var input = document.querySelector('input[type=file]');
        var oFile = input.files[0];
        oFReader.readAsDataURL(oFile);
    });
});