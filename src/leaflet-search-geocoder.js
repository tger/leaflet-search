define(function () {
	var limit = 3;

	var nominatim = {
		/*
		 * @param {String} path Base search service url (everything excluding the parameters)
		 * @param {String} key authentication key, if necessary
		 */
		url: function (baseurl, key) {
			return function() {
				return baseurl+'?'+(key ? 'key='+key+'&' : '')+
					'format=json&addressdetails=1&limit='+limit+'&q={s}';
			};
		},
		formatData: function (json) {
			return json.reduce(function (acc, x) {
				var addr = x.address;

				var res = [addr.town || addr.city || addr.village || addr.county, addr.country];
				if (addr.road)
					res.unshift(addr.road);

				var resString = res.some(function (value) { return !value; }) ?
					x.display_name : res.join(', '); // fall back to display_name if any empty element
				acc[resString] = L.latLng(x['lat'], x['lon']);

				return acc;
			}.bind(this), {});
		}
	};

	return {
		'geocoder': 'mapquest-nominatim', // Which one to use

		'openstreetmap': {
			url: nominatim.url('//nominatim.openstreetmap.org/search'),
			formatData: nominatim.formatData
		},

		'mapquest-nominatim': {
			url:nominatim.url('//open.mapquestapi.com/nominatim/v1/search.php',
				'<mapquest-api-key-goes-here>'),
			formatData: nominatim.formatData
		},
	};
});
