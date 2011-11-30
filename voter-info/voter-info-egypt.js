// voter-info-egypt.js
// By Michael Geary - http://mg.to/
// See UNLICENSE or http://unlicense.org/ for public domain notice.

// Language and prefs

var defaultLanguage = 'ar';
var supportedLanguages = {
	ar: 'عربي',
	en: 'English',
	fr: 'Français',
	_: null
};

var prefs = new _IG_Prefs();
var pref = {
	lang: prefs.getString( '.lang' )
};

if( ! supportedLanguages[pref.lang] )
	pref.lang = defaultLanguage;

function localPrefs( pref ) {
	pref.voterIdElection = true;
	pref.analyticsUA = 'UA-26399777-1';
	pref.fontFamily = 'Tahoma,Geneva,sans-serif';
}

// [ W, S, E, N ]
var initialBbox = [ 25.0, 22.0, 36.9, 31.6 ];

// Output formatters

function attribution() {
	return T( 'attributionEG' );
}

function stateLocator() {
	return '';
}

function locationWarning() {
	return '';
}

function electionInfo() {
	return S(
		//generalInfo(),
		contestsInfo(),
		//infoLinks(),
		attribution(),
		''
	);
}

function electionHeader() {
	return S(
		'<div style="font-weight:bold;">',
		'</div>'
	);
}

function generalInfo() {
	return S(
		'<div style="margin-bottom:0.5em;">',
		'</div>'
	);
}

function contestsInfo( ) {
	var contests = getContests();
	if( !( contests && contests.length ) ) return '';
	return S(
		'<div>',
			'<div>',
				T('electoralRollLabel'), ' ', contests[0].citizen_number,
			'</div>',
			'<div>',
				T('pollingStationLabel'), ' ', contests[0].box_number,
			'</div>',
			contests.mapjoin( function( contest ) {
				return contestInfo(
					contest, 'electionDate',
					'date', 'candidates', 'choices'
				);
			}),
			contests.mapjoin( function( contest ) {
				return contestInfo(
					contest, 'runoffDate',
					'date_round_2', 'candidates_round_2'
				)
			}),
		'</div>'
	);
}

function contestInfo( contest, label, date$, candidates$, choices$ ) {
	var date = dateFromYMD( contest[date$] );
	var completed = ( today - date ) > ( 1 * days );
	return S(
		'<div class="heading" style="font-size:150%;">',
			contest.type,
		'</div>',
		'<div class="heading" style="font-size:125%;">',
			contest.constituency,
		'</div>',
		'<div class="heading">',
			T(label), ' ', contest[date$],
		'</div>',
		completed ?
			T('completed') :
			contestBallot( contest, candidates$, choices$ )
	);
}

function isListContest( contest ) {
	return contest.type == 'قوائم شعب';
}

function contestBallot( contest, candidates$, choices$ ) {
	var ballot = contest.ballot_choices;
	if( ! ballot ) return '';
	return isListContest(contest) ? S(
		'<div class="">',
			( ballot[choices$] || [] ).mapjoin( function( partylist ) {
				return S(
					'<div class="partylist">',
						'<div class="partylistname">',
							partylist.name,
						'</div>',
						contestCandidates( partylist[candidates$] ),
					'</div>'
				);
			}),
		'</div>'
	) : S(
		'<div class="">',
			contestCandidates( ballot[candidates$] ),
		'</div>'
	);
}

function contestCandidates( candidates ) {
	return S(
		'<div class="candidates">',
			candidates.mapjoin( function( candidate ) {
				var nick = candidate.nick_name ?
					S( '"', candidate.nick_name, '" ' ) : '';
				return S(
					'<div class="candidate">',
						'<div>',
							linkIf(
								nick +candidate.name,
								candidate.candidate_url
							),
							' - ', candidate.type,
							//'<img src="', candidate.symbol_url, '" alt="', candidate.symbol, '">',
							'<span class="candidate-number">',
								' (', candidate.number, ')',
							'</span>',
						'</div>',
					'</div>'
				);
			}),
		'</div>'
	);
}

function setVoteHtml() {
	if( !( vote.info || vote.locations || vote.poll ) ) {  // TODO
		$details.append( log.print() );
		return;
	}
	//var largeMapLink = S(
	//	'<div style="padding-top:0.5em;">',
	//		'<a target="_blank" href="http://maps.google.com/maps?f=q&hl=en&geocode=&q=', encodeURIComponent( a.address.replace( / /g, '+' ) ), '&ie=UTF8&ll=', latlng, '&z=15&iwloc=addr">',
	//			'Large map and directions &#187;',
	//		'</a>',
	//	'</div>'
	//);
	
	function voteLocation( infowindow ) {
		var loc = T('yourVotingLocation');
		if( !( vote.locations && vote.locations.length ) )
			return '';
		if( vote.info )
			return formatLocations( vote.locations, null,
				infowindow
					? { url:'vote-icon-50.png', width:50, height:50 }
					: { url:'vote-pin-icon.png', width:29, height:66 },
				loc, infowindow, '', true
			);
		return infowindow ? '' : formatLocations( vote.locations, null,
			{ url:'vote-icon-32.png', width:32, height:32 },
			loc + ( vote.locations.length > 1 ? 's' : '' ), false, '', false
		);
	}
	
	if( ! sidebar ) $tabs.show();
	$details.html( longInfo() ).show();
	vote.html = infoWrap( S(
		log.print(),
		electionHeader(),
		homeAndVote(),
		'<div style="padding-top:1em">',
		'</div>',
		electionInfo()
	) );
	vote.htmlInfowindow = infoWrap( S(
		log.print(),
		electionHeader(),
		homeAndVote( true )//,
		//'<div style="padding-top:1em">',
		//'</div>',
		//electionInfo()
	) );
	
	function homeAndVote( infowindow ) {
		var viewMessage = getContests() ?
			T('viewCandidates') :
			T('viewDetails');
		var viewLink = sidebar ? '' : S(
			'<div style="padding-top:0.75em;">',
				'<a href="#detailsbox" onclick="return selectTab(\'#detailsbox\');">',
					viewMessage,
				'</a>',
			'</div>'
		);
		return vote.info && vote.info.latlng ? S(
			voteLocation( true ),
			viewLink
			//locationWarning(),
			//'<div style="padding-top:0.75em">',
			//'</div>',
		) : S(
			//'<div style="padding-top:0.75em">',
			//'</div>',
			voteLocation( infowindow )/*,
			locationWarning()*/
		);
	}
	
	function longInfo() {
		return T( 'longInfoEgypt', {
			log: log.print(),
			header: electionHeader(),
			location: voteLocation(),
			warning: locationWarning(),
			info: electionInfo()
		});
	}
}

function getContests() {
	var contests = vote && vote.poll && vote.poll.contests;
	return contests && contests.length && contests;
}

function locationInfo( location, place ) {
	var name = location.name || '';
	return {
		address: location.unparsed_address,
		location: location.name || '',
		place: place,
		latlng: place && place.geometry.location
	};
}

function formatLocations( locations, info, icon, title, infowindow, extra, mapped ) {
	
	function formatLocationRow( info ) {
		var address = T( 'address', {
			location: H( info.location ),
			address: multiLineAddress( info.address )
		});
		return T( 'locationRow', {
			iconSrc: imgUrl(icon.url),
			iconWidth: icon.width,
			iconHeight: icon.height,
			address: address,
			directions: info.directions || '',
			hours: info.hours ? 'Hours: ' + info.hours : '',
			extra: extra || ''
		});
	}
	
	var rows = info ?
		[ formatLocationRow(info) ] :
		locations.map( function( location ) {
			return formatLocationRow( locationInfo(location) );
		});
	
	return S(
		T( 'locationHead', {
			select: includeMap() ? 'onclick="return maybeSelectTab(\'#mapbox\',event);" style="cursor:pointer;"' : '',
			title: title
		}),
		rows.join(''),
		T( 'locationFoot', {
			unable: info && info.latlng || mapped ? '' : T('locationUnable')
		})
	);
}

function formatHome() {
	return '';
}

// Set up map and sidebar when the polling place location is known
function setVoteGeo( places, address, location) {
	//if( places && places.length == 1 ) {
	if( places && places.length >= 1 ) {
		// More than one place, use first match only if it has address
		// accuracy and the remaining matches don't
		//if( places.length > 1 ) {
		//	if( places[0].AddressDetails.Accuracy < Accuracy.address ) {
		//		setVoteNoGeo();
		//		return;
		//	}
		//	for( var place, i = 0;  place = places[++i]; ) {
		//		if( places[i].AddressDetails.Accuracy >= Accuracy.address ) {
		//			setVoteNoGeo();
		//			return;
		//		}
		//	}
		//}
		try {
			var place = places[0];
			if( +location.lat && +location.lng )
				place.geometry.location =
					new gm.LatLng( +location.lat, +location.lng );
		}
		catch( e ) {
			log( 'Error getting polling state' );
		}
		log( 'Getting polling place map info' );
		vote.info = locationInfo( location, place );
		setMap( vote.info  );
		return;
	}
	setVoteNoGeo();
}

// Set up map and sidebar with no polling place location
function setVoteNoGeo() {
	setVoteHtml();
	forceDetails();
}

// Return a single line formatted address, from either a string or
// an address object
function oneLineAddress( address ) {
	if( ! address )
		return '';
	//if( typeof address == 'string' )
	//	return H(address).replace( /, USA$/, '' );
	return H( S(
		address.line1 ? address.line1 + ', ' : '',
		address.line2 ? address.line2 + ', ' : '',
		address.city, ', ', address.state,
		address.zip ? ' ' + address.zip : ''
	) );
}

// Return a multiline formatted address, from either a string or
// an address object
function multiLineAddress( address ) {
	if( ! address )
		return '';
	if( typeof address == 'string' )
		return H(address)
			//.replace( /, USA$/, '' )
			.replace( /, (\w\w) /, '\| $1 ' )
			.replace( /, /g, '<br>' )
			.replace( /\|/g, ',' );
	return S(
		address.line1 ? H(address.line1) + '<br>' : '',
		address.line2 ? H(address.line2) + '<br>' : '',
		H(address.city), ', ', H(address.state),
		address.zip ? ' ' + H(address.zip) : ''
	);
}

// Apply any local fixups to an address
function fixInputAddress( addr ) {
	//if( addr == pref.example )
	//	addr = addr.replace( /^.*: /, '' );
	return addr;
}

// Geocoding and Election Center API

function findPrecinct( dummy, voterID ) {
	pollingApiIdProxy( voterID, function( poll ) {
		log( 'API status code: ' + poll.status || '(OK)' );
		vote.poll = poll;
		if( poll.status == 'NO_VOTER_FOUND' ) {
			detailsOnlyMessage( T('noVoterId') );
			return;
		}
		if( poll.status != 'SUCCESS' ) {
			sorry();
			return;
		}
		var locations = vote.locations = poll.locations;
		if( ! locations  ||  ! locations.length ) {
			log( 'No polling locations' );
			setVoteNoGeo();
			return;
		}
		if( locations.length > 1 ) {
			log( 'Multiple polling locations' );
			setVoteNoGeo();
			return;
		}
		var loc = locations[0];
		var addr =
			+loc.lat && +loc.lng ? [ +loc.lat, +loc.lng ].join(',') :
			loc.unparsed_address;
		if( addr ) {
			log( 'Polling address:', addr );
			geocode( addr, function( places ) {
				setVoteGeo( places, addr, loc );
			});
		}
		else {
			log( 'No polling address' );
			setVoteNoGeo();
		}
	},
	{
		electionId: 2500
	});
}

// Gadget initialization

function zoomTo( bbox ) {
	var bounds = new gm.LatLngBounds(
		new gm.LatLng( bbox[1], bbox[0] ),
		new gm.LatLng( bbox[3], bbox[2] )
	);
	map.fitBounds( bounds );
}

function gadgetReady( json ) {
	$.extend( T.variables, {
		officialGadget: linkto('http://www.elections2011.eg/#gadget')
	});
	initMap( function() {
		setupTabs();
		if( pref.ready )
			submit( pref.address || pref.example );
		else
			zoomTo( initialBbox );
	});
}
