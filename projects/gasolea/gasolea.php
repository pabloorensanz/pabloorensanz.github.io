<?php
error_reporting(0);

$url = 'https://sedeaplicaciones.minetur.gob.es/ServiciosRESTCarburantes/PreciosCarburantes/EstacionesTerrestres/';

try {
	//READ  FILE
	$file = file_get_contents($url);
	$json = json_decode($file);
	
	//VARIABLES DEFINITION
	$products = array(
		'Biodiesel', 
		'Bioetanol',
		'Gas Natural Comprimido',
		'Gas Natural Licuado',
		'Gases licuados del petróleo',
		'Gasoleo A',
		'Gasoleo B',
		'Gasolina 95 Protección',
		'Gasolina  98',
		'Nuevo Gasoleo A'
	);
	$output = (object) array();
	$output->url = $url;
	$output->date = date('Y-m-d H:i:s');
	$prices = [];

	//GET USEFUL INFO AND PRICES
	foreach($json->ListaEESSPrecio as $item) {
		$gasolinera = (object) array(
			'id'			=>		(integer) $item->{'IDEESS'},
			'name'			=> 		(string) $item->{'Rótulo'},
			'lat'			=> 		(float) str_replace(',', '.', $item->{'Latitud'}),
			'lng'			=>		(float) str_replace(',', '.', $item->{'Longitud (WGS84)'}),
			'address'		=>		(string) $item->{'Dirección'}.', '.$item->{'C.P.'}.', '.$item->{'Municipio'}.', '.ucwords(strtolower($item->{'Provincia'})),
		);
		for($i = 0; $i < count($products); $i++) {
			$property = 'Precio '.$products[$i];
			if($item->{$property}) {
				$price = (float) str_replace(',', '.', $item->{$property);
				$gasolinera->products->{$products[$i]}->price = $price;
				$prices[$products[$i]][] = $price;
			}
		}
		$output->stations[] = $gasolinera;
	}
	
	//CALCULATE AVERAGE AND STANDARD DEVIATION
	for($i = 0; $i < count($products); $i++) {
		$output->stats->{$products[$i]}->avg = avg($prices[$products[$i]]);
		$output->stats->{$products[$i]}->std = std($prices[$products[$i]]);
		print $products[$i].': '.$output->stats->{$products[$i]->avg.'-'.$output->stats->{$products[$i]->std.'<br/>';
	}
	
	//ASSIGN PRICE & STATION CATEGORY (1: cheap, 2: medium, 3: expensive)BASED ON PRICES DEVIATION
	for($i = 0; $i < count($output->stations); $i++) {
		$expensive = $medium = $cheap = 0;
		for($j = 0; $j < count($products); $j++) {
			if($output->stations[$i]->products->{$products[$j]}) {
				if($output->stations[$i]->products->{$products[$j]}->price > $output->stats->{$products[$j]->avg + $output->stats->{$products[$j]->std) {
					$expensive++;
					$output->stations[$i]->products->{$products[$j]}->rank = 3;//expensive
				} elseif($output->stations[$i]->products->{$products[$j]}->price < $output->stats->{$products[$j]->avg - $output->stats->{$products[$j]->std) {
					$cheap++;
					$output->stations[$i]->products->{$products[$j]}->rank = 1;//cheap
				} else {
					$medium++;
					$output->stations[$i]->products->{$products[$j]}->rank = 2;//medium
				}
			}
		}
		$rank = ($cheap-$expensive)/count((array)$output->stations[$i]->products);
		if($rank > 0.5) {
			$output->stations[$i]->rank = 1;
		} elseif ($rank < -0.4) {
			$output->stations[$i]->rank = 3;
		} else {
			$output->stations[$i]->rank = 2;
		}
	}
	
	//SAVE JSON FILE
	$fp = fopen('data.json', 'w');
	fwrite($fp, json_encode($output, JSON_UNESCAPED_UNICODE));
	fclose($fp);
} catch (Exception $e) { 
	echo $e; 
}

function print_nice ($data) {
	print '<pre>';
	print_r($data);
	print '</pre>';
}

function avg ($array) {
    if (!count($array)) return 0;
	$array = array_filter($array);
    return array_sum($array) / count($array);
}

function std ($array) {
    if (!count($array) || count($array) === 1) return false;

	$avg = avg($array);
	$carry = 0.0;
	foreach($array as $val) {
		$d = ((double) $val) - $avg;
		$carry += $d * $d;
	};
	return sqrt($carry / count($array));
}