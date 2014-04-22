<?php
header('Access-Control-Allow-Origin: *');

/*
 *	Version 4 of the SevaCall API handler written as a standalone class definition
 *	Author: Augie Gardner
 *	Updated: 2/4/2014
 *	Endpoints:
 *		/constants
 *			Returns the pre-defined variables the SevaCall app needs to load and/or process a request.  Currently just returns the service categories in order to populate the drop-down box for "WHAT"
 *		/companies/list
 *			Returns the companies queued to be called for a specific requestID after step1 has completed
 *		/request/history
 *			Get's all requests given for a specific phone number
 *		/request/status
 *			Get's the current status of a specific requestID
 *		/request/time_saved
 *			Returns the minutes:seconds of all the automated calling done by SevaCall for a specific requestID. Ultimately this is the time the consumer "saved" by not having to call each company themselves
 *		/search/action1
 *			Processes step1 of the sevacall process, where a user specifies what they need help with and where they are
 *		/search/action2
 *			Processes step2 of the sevacall process
 */
define("ROOT", __DIR__ ."/");
define('SQL_HOST', '107.170.127.182');
define('SQL_USER', 'root');
define('SQL_PASS', 'pa$$w0rd123');
define('SQL_DB', 'quotogenicDev');
function prepareSQL() {
	$mysqli = new mysqli(SQL_HOST, SQL_USER, SQL_PASS, SQL_DB);
	if(mysqli_connect_errno()) { echo "Connection Failed: " . mysqli_connect_errno(); exit(); }
	return $mysqli;
}

function checkStmt($stmt) {
	if ( false===$stmt ) {
	  // and since all the following operations need a valid/ready statement object
	  // it doesn't make sense to go on
	  // you might want to use a more sophisticated mechanism than die()
	  // but's it's only an example
	  die('prepare() failed: ' . htmlspecialchars($GLOBALS['mysqli']->error));
	}
}

$mysqli = prepareSQL();
	
$forceUserID = false;
if($forceUserID)
	$_GET['userID'] = 35;

$debug = false;
//include_once("../../requireLogin.php");
$errors = array("public_unavailable" => "The Quotogenic API is not yet avaialble for public use.  Please contact the webmaster directly to obtain permissions");
abstract class API
{
    /**
     * Property: method
     * The HTTP method this request was made in, either GET, POST, PUT or DELETE
     */
    protected $method = '';
    /**
     * Property: endpoint
     * The Model requested in the URI. eg: /files
     */
    protected $endpoint = '';
    /**
     * Property: verb
     * An optional additional descriptor about the endpoint, used for things that can
     * not be handled by the basic methods. eg: /files/process
     */
    protected $verb = '';
    /**
     * Property: args
     * Any additional URI components after the endpoint and verb have been removed, in our
     * case, an integer ID for the resource. eg: /<endpoint>/<verb>/<arg0>/<arg1>
     * or /<endpoint>/<arg0>
     */
    protected $args = Array();
    /**
     * Property: file
     * Stores the input of the PUT request
     */
     protected $file = Null;
	 
	 protected $map = Array();

	/** Added by Augie, sets a map for a complex endpoint, example: "request/history", 
	 * in order to map to a specific function, example: "request_history".
	 * The default behavior would not handle subdirectories in endpoints, and so this had to be modified.
	 * Mappings are checked before calling the function in processAPI.
	 */
	 public function map($endpoint, $function) {
		$this->map[$endpoint] = $function;
	 }
	 
	 /** Added by Augie, returns the mapping of a specific complex endpoint, example: "request/history", otherwise just returns
	  * the simple endpoint, which will be processed as a normal function call, example: "constants"
	  */
	 public function getMapping($endpoint) {
		if($this->map[$endpoint])
			return $this->map[$endpoint];
		else
			return $endpoint;
	 }
	 
    /**
     * Constructor: __construct
     * Allow for CORS, assemble and pre-process the data
     */
    public function __construct($request) {
        header("Access-Control-Allow-Orgin: *");
        header("Access-Control-Allow-Methods: *");
        header("Content-Type: application/json");
		
		$this->split = explode('?', $request);
		$this->endpoint = $this->split[0];
        $this->args = explode('/', rtrim($request, '/'));
        //$this->endpoint = array_shift($this->args);
        if (array_key_exists(0, $this->args) && !is_numeric($this->args[0])) {
            $this->verb = array_shift($this->args);
        }

        $this->method = $_SERVER['REQUEST_METHOD'];
        if ($this->method == 'POST' && array_key_exists('HTTP_X_HTTP_METHOD', $_SERVER)) {
            if ($_SERVER['HTTP_X_HTTP_METHOD'] == 'DELETE') {
                $this->method = 'DELETE';
            } else if ($_SERVER['HTTP_X_HTTP_METHOD'] == 'PUT') {
                $this->method = 'PUT';
            } else {
                throw new Exception("Unexpected Header");
            }
        }

        switch($this->method) {
        case 'DELETE':
        case 'POST':
            $this->request = $this->_cleanInputs($_POST);
            break;
        case 'GET':
            $this->request = $this->_cleanInputs($_GET);
            break;
        case 'PUT':
            $this->request = $this->_cleanInputs($_GET);
            $this->file = file_get_contents("php://input");
            break;
        default:
            $this->_response('Invalid Method', 405);
            break;
        }
    }
	
	public function processAPI() {
		$func = $this->getMapping($this->endpoint);
		if(class_exists($func)) {
			//print_r($this->method);
			$class = new $func();
			//print("\n\n");
			//print($this->method);
			$type = $this->method;
			//print("\n\n");
			//print_r($class->$type($this->request));
			//print("\n\n");
			//print_r($class->[$this->method]);
			//$data = ($class->get($this->request));
			if ((int)method_exists($class, $type) > 0) {
			$data = $class->$type($this->request);
			if(isset($data['error'])) {
				return $this->_response($data['error'], 201);
			}
			return $this->_response($data);
			}
			else {
				return $this->_response("$type requests are not available for the endpoint at: '" . $this->endpoint . "'.", 404);
			}
		}
		/*
        if ((int)method_exists($this, $func) > 0) {
            return $this->_response($this->{$func}($this->args));
        }
		*/
        return $this->_response("You attempted to access the endpoint at: '" . $this->endpoint . "', which does not exist.", 404);
    }

    private function _response($data, $status = 200) {
        header("HTTP/1.1 " . $status . " " . $this->_requestStatus($status));
		
		if($status == 200) {
			$pagination = array("next_page" => $GLOBALS['page'] + 1);
			$returnData = array("status" => $this->_returnStatus($status), "pagination" => $pagination, "data" => $data, "HTML" => $GLOBALS['HTML']);
		}
		else {
			$returnData = array("status" => $this->_returnStatus($status), "message" => $data);
		}
        return json_encode($returnData, JSON_PRETTY_PRINT);
    }

    private function _cleanInputs($data) {
        $clean_input = Array();
        if (is_array($data)) {
            foreach ($data as $k => $v) {
                $clean_input[$k] = $this->_cleanInputs($v);
            }
        } else {
            $clean_input = trim(strip_tags($data));
        }
        return $clean_input;
    }
	
	private function _returnStatus ($code) {
        $status = array(  
            200 => 'success',
            201 => 'error',
            404 => 'endpoint not found',   
            405 => 'method not allowed',
            500 => 'internal server error',
        ); 
        return ($status[$code])?$status[$code]:$status[500]; 
    }
	
    private function _requestStatus($code) {
        $status = array(
            200 => 'OK',
            201 => 'error',
            404 => 'Not Found',   
            405 => 'Method Not Allowed',
            500 => 'Internal Server Error',
        );
        return ($status[$code])?$status[$code]:$status[500]; 
    }
}

class APIKey {
	public $key;
	
	public function __construct() {
	}
	
	public function verifyKey($key, $origin) {
		if($key == "tmp") {
			return true;
		}
		else {
            throw new Exception($GLOBALS['errors']['public_unavailable']);
		}
	}
}

class User {
	public $key;
	
	public function __construct() {
	}
	
	public function get($type, $token) {
		return true;
	}
}

function missingParams($requiredParams, $inputParams) {
	$paramsMissing = false;
	for($i = 0; $i < count($requiredParams); $i++) {
		if(!array_key_exists($requiredParams[$i], $inputParams))
			$paramsMissing = true;
	}
	if(!$paramsMissing) 
		return 0;
	else {
		$diff = array_diff($requiredParams, $inputParams);
		if($diff) {
			$rows = array("error" => "A required parameter was missing: [");
				$rows['error'] .= implode('], [', $diff);
			$rows['error'] .= "]";
			return $rows;
		}
		else {
			return 0;
		}
	}
	
}

function getCountFromTable($mysqli, $table) {
		$query = 'SELECT COUNT(1) as totalRows FROM ' . $table;
		$stmt = $mysqli->prepare($query);
		//$stmt->bind_param('s', $table);
		$stmt->execute();
		$stmt->bind_result($totalRows);
		while($stmt->fetch()) {
			return $totalRows;
		}

}

function getUsername($mysqli, $userID) {
		$stmt = $mysqli->prepare('SELECT userName from Users WHERE UserID = ?');
		$stmt->bind_param('i', $userID);
		$stmt->execute();
		$stmt->bind_result($username);
		while($stmt->fetch()) {
			return $username;
		}
}
// url: /user/dashboard
// params: none
class dashboard {
	function get($params) {
		$userID = $params['userID'] ? $params['userID'] : 35;//$GLOBALS['userID'];
		
		$GLOBALS['username'] = getUsername($mysqli, $userID);
		$itemsPerPage = 12; // used for both queryAll and regular query
		
		// pagination enabled for sorting the queryAll search functionality, it is not sorted by time, so next_max_id wont work.
		$page = isset($params['page']) ? urldecode($params['page']) : 1;
		$pagination_start = $page == 1 ? 0 : (($page - 1) * $itemsPerPage);
		$pagination_end = ($pagination_start + $itemsPerPage);
		$GLOBALS['page'] = $page;
		
		$stmt = $mysqli->prepare('	
				SELECT * FROM (
										SELECT "quote" as "object", "rating" as action, Quotes.quoteID as id, optionRatingTypeID as actionValue, DATE_ADD(quoteRatingTime, INTERVAL 2 HOUR) as time, DATE_FORMAT(DATE_ADD(quoteRatingTime, INTERVAL 2 HOUR), "%M %d, %Y") AS date, Quotes.quote as opt_content, NULL as opt_secondaryID, Authors.author as opt_author, NULL as opt_low_resolution, NULL as opt_medium_resolution, NULL as opt_high_resolution
										FROM QuoteRatings
										JOIN Quotes ON Quotes.quoteID = QuoteRatings.quoteID
										JOIN Media ON Media.mediaID = Quotes.mediaID
										JOIN Authors ON Authors.authorID = Media.authorID
										WHERE QuoteRatings.userID = ? AND optionRatingTypeID = 1
										GROUP BY Quotes.quoteID
										UNION
										SELECT "photo" as "object", "rating" as action, PhotoMap.photoMapID as id, optionRatingTypeID as actionValue, DATE_ADD(photoRatingDateTime, INTERVAL 2 HOUR) as time, DATE_FORMAT(DATE_ADD(photoRatingDateTime, INTERVAL 2 HOUR), "%M %d, %Y") AS date, NULL as opt_content, NULL as opt_secondaryID, Users.userName as opt_author, Photos.thumbnail as opt_low_resolution, Photos.low_resolution as opt_medium_resolution, Photos.high_resolution as opt_high_resolution
										FROM PhotoRatings 
										JOIN PhotoMap ON PhotoMap.photoMapID = PhotoRatings.photoMapID
										JOIN Photos ON Photos.photoID = PhotoMap.photoID
										JOIN Users ON Users.userID = Photos.userID
										WHERE PhotoRatings.userID = ? AND optionRatingTypeID = 1
										UNION 
										SELECT "photo" as "object", "submit" as action, PhotoMap.photoMapID as id, -1 as actionValue, DATE_ADD(photoSubmittedDateTime, INTERVAL 2 HOUR) as time, DATE_FORMAT(DATE_ADD(photoSubmittedDateTime, INTERVAL 2 HOUR), "%M %d, %Y") AS date, NULL as opt_content, Quotes.quoteID as opt_secondaryID, Authors.author as opt_author, Photos.thumbnail as opt_low_resolution, Photos.low_resolution as opt_medium_resolution, Photos.high_resolution as opt_high_resolution
										FROM Photos 
										JOIN PhotoMap ON PhotoMap.photoID = Photos.photoID
										JOIN Quotes ON Quotes.quoteID = PhotoMap.quoteID
										JOIN Media ON Media.mediaID = Quotes.mediaID
										JOIN Authors ON Authors.authorID = Media.authorID
										WHERE Photos.userID = ?
										UNION 
										SELECT "quote" as "object", "favorite" as action, QuoteFavorites.quoteID as id, quoteFavoriteActive as actionValue, DATE_ADD(quoteFavoriteDateTime, INTERVAL 2 HOUR) as time, DATE_FORMAT(DATE_ADD(quoteFavoriteDateTime, INTERVAL 2 HOUR), "%M %d, %Y") AS date, Quotes.quote as opt_content, NULL as opt_secondaryID, Authors.author as opt_author, NULL as opt_low_resolution, NULL as opt_medium_resolution, NULL as opt_high_resolution
										FROM QuoteFavorites 
										JOIN Quotes ON Quotes.quoteID = QuoteFavorites.quoteID
										JOIN Media ON Media.mediaID = Quotes.mediaID
										JOIN Authors ON Authors.authorID = Media.authorID
										WHERE QuoteFavorites.userID = ? AND quoteFavoriteActive = 1
									) _i1 ORDER BY time DESC
									LIMIT ?, ?
								');
		$stmt->bind_param('iiiiii', $userID, $userID, $userID, $userID, $pagination_start, $pagination_end);
		$stmt->execute();
		$stmt->bind_result($object, $action, $id, $actionValue, $time, $date, $opt_content, $opt_secondaryID, $opt_author, $opt_low_resolution, $opt_medium_resolution, $opt_high_resolution);
		$num_rows = $stmt->num_rows;
		if($num_rows < $itemsPerPage) {
			// page will be incremented to 0 when returned, a 0th page means we are done iterating over all results
			$GLOBALS['page'] = -1;
		}
		
								function url_exists($url) {
									// check to see if an instagram picture actually exists
									//if(@file_get_contents($url,0,NULL,0,1)){return 1;}else{ return 0;}
									return true;
								}
		while ($stmt->fetch()) {
			$obj = array("object" => $object, 
								"id" => $id, 
								"action" => $action, 
								"value" => $actionValue, 
								"timestamp" => $time, 
								"time" => date("H:i:s", strtotime($time)), 
								"date" => date("Y-m-d", strtotime($time)),
								"day" => $date,
								"href" => "",
								"opt_content" => $opt_content, 
								"opt_secondaryID" => $opt_secondaryID, 
								"opt_author" => $opt_author,
								"opt_low_resolution" => $opt_low_resolution, 
								"opt_medium_resolution" => $opt_medium_resolution, 
								"opt_high_resolution" => $opt_high_resolution
							);
							if($object == "photo") {
								if(!url_exists($obj['opt_low_resolution'])) {
									//print("photo doesn't exist");
									continue;
								}
							}
						if($object == "quote")
							$obj['href'] = $GLOBALS['base'] . "quotes/" . $id;
						if($object == "photo")
							$obj['href'] = $GLOBALS['base'] . "quotographs/" . $id;
						$results[] = $obj;
		}
		function convertAction($obj) {
			if($obj['object'] == "photo") {
				if($obj['action'] == "rating")
					return "liked";
			}
			if($obj['object'] == "quote") {
				if($obj['action'] == "rating")
					return "upvoted";
				if($obj['action'] == "favorite")
					return "favorited";
			}
		}
		function getIcon($action) {
			switch($action) {
				case "upvoted" :
					return "fa-chevron-up";
				case "favorited" :
					return "fa-heart-o";
				case "liked" :
					return "fa-thumbs-o-up";
				default :
					return "";
			}
		}
		function translateActivityObject($obj) {
			// QUOTE
			$action = convertAction($obj);
			$icon = getIcon($action);
			if($obj['object'] == "quote") {
				return "
					<div class='pure-u-1-3'>
						<i class='fa $icon'></i> 
						{$GLOBALS['username']} $action a 
						<a target='_blank' class='highlight' href='{$obj['href']}'>quote</a> by 
						<a target='_blank' class='highlight' href='{$GLOBALS['base']}authors/{$obj['opt_author']}'>{$obj['opt_author']}
						</a>
					</div>
					<div class='pure-u-2-3 fr tr dashboard-quote'>
						<div class='relative ibm'><i class='fa fa-quote-left'></i>{$obj['opt_content']}<i class='fa fa-quote-right'></i></div>
					</div>
					";
			}
			// PHOTO
			if($obj['object'] == "photo") {
				if($obj['action'] == "submit")
					$text = " submitted a photo to a <a target='_blank' class='highlight' href='{$GLOBALS['base']}quotes/{$obj['opt_secondaryID']}'>quote</a> by <a target='_blank' class='highlight' href='{$GLOBALS['base']}authors/{$obj['opt_author']}'>{$obj['opt_author']}</a>";
				else if($obj['action'] == "rating") {
					if($obj['opt_author'] == $GLOBALS['username']) {
						$text = " liked their own photo";
					}
					else {
						$text = " liked <span class='ibm'><a target='_blank' class='highlight ibt' href='{$GLOBALS['base']}{$obj['opt_author']}'>{$obj['opt_author']}</a>'s</span> <a target='_blank' class='highlight ibt' href='{$obj['href']}'>photo</a>";
					}
				}
				return "
					
					<div class='pure-u-1-3'>
						<i class='fa $icon'></i> 
						{$GLOBALS['username']}  " . $text . " '" . $obj['date'] . "'
					</div>
					<div class='pure-u-2-3 fr'>
						<a target='_blank' class='fr highlight ibt' href='{$obj['href']}'>
							<img class='ibm' src='{$obj['opt_low_resolution']}'/> 
						</a>
					</div>
					";
			}
		}
		$HTML = "";
		
		// create the times associative array.  Mapping all actions onto a specific DAY. YYY-MM-DD
		$times_assoc = array_reduce($results, function ($result, $item) {
			$timeString = strtotime($item['timestamp']);
			$date = date("Y-m-d", $timeString);
			$count = $result[$date]['count'];
			$result[$date] = array("count" => ++$count);
			if(!is_array($result[$date]['data'])) {
				$result[$date]['data'] = array();
				$result[$date]['data']['rating'] = array("count" => 0, "max_timestamp" => "0000-00-00 00:00:00", "data" => array("photo" => array("count" => 0, "max_timestamp" => "0000-00-00 00:00:00", "data" => array()), "quote" => array("count" => 0, "data" => array())));
				$result[$date]['data']['favorite'] = array("count" => 0, "max_timestamp" => "0000-00-00 00:00:00", "data" => array("photo" => array("count" => 0, "max_timestamp" => "0000-00-00 00:00:00", "data" => array()), "quote" => array("count" => 0, "data" => array())));
				$result[$date]['data']['submit'] = array("count" => 0, "max_timestamp" => "0000-00-00 00:00:00", "data" => array("photo" => array("count" => 0, "max_timestamp" => "0000-00-00 00:00:00", "data" => array()), "quote" => array("count" => 0, "data" => array())));
			}
			return $result;
		}, array());
		
		foreach($results as $objectType => $obj) {
			$time_key = $obj['date'];
			$times_assoc[$time_key]['data'][$obj['action']]['count']++;
			$times_assoc[$time_key]['data'][$obj['action']]['max_timestamp'] = $times_assoc[$time_key]['data'][$obj['action']]['max_timestamp'] < $obj['timestamp'] ? $obj['timestamp'] : $times_assoc[$time_key]['data'][$obj['action']]['max_timestamp'];
			$times_assoc[$time_key]['data'][$obj['action']]['data'][$obj['object']]['count']++;
			$times_assoc[$time_key]['data'][$obj['action']]['data'][$obj['object']]['max_timestamp'] = $times_assoc[$time_key]['data'][$obj['action']]['data'][$obj['object']]['max_timestamp'] < $obj['timestamp'] ? $obj['timestamp'] : $times_assoc[$time_key]['data'][$obj['action']]['data'][$obj['object']]['max_timestamp'];//$times_assoc[$time_key]['data'][$obj['action']]['data'][$obj['object']]['max_timestamp'] < $obj['action']['data'][$obj['object']]['max_timestamp'] ? $obj['action']['data'][$obj['object']]['max_timestamp'] : $times_assoc[$time_key]['data'][$obj['action']]['data'][$obj['object']]['max_timestamp'];
			
			array_push($times_assoc[$time_key]['data'][$obj['action']]['data'][$obj['object']]['data'], $obj);
			
		}
		
		// new style
		//
		$GLOBALS['iconByVerb'] = array(
			"liked" => "fa-thumbs-o-up",
			"favorited" => "fa-heart-o",
			"submitted" => "fa-picture-o",
			"upvoted" => "fa-chevron-up"
		);
		
		function actionVerbFromRatingType($ratingType) {
			switch ($ratingType) {
				case "photo" :
					return "liked";
				case "quote" :
					return "upvoted";
				default :
					return "err";
			}
		}
		function actionVerbFromActionType($actionType) {
			switch ($actionType) {
				case "favorite" :
					return "favorited";
				case "submit" :
					return "submitted";
				default :
					return "err";
			}
		}
		
		function htmlParseActions($actionMedium, $actions) {
			$HTML = "";
			$count = $actions['count'];
			if($actionMedium == "photo" && $count > 1) {
				$HTML .= htmlMultiplePhotos($actions);
			}
			else {
				foreach($actions['data'] as $obj) {
					if($actionMedium == "quote")
						$HTML .= htmlQuote($obj);
					else if($actionMedium == "photo")
						$HTML .= htmlPhoto($obj);
				}
			}
			return $HTML;
		}
		
		function htmlWrapContent($content, $opt_extra_class) {
			return "
					<div class='content pure-u-2-3 fr tr $opt_extra_class'>
						$content
					</div>
					";
					
		}
		
		function htmlQuote($obj) {
			$quoteLink = htmlWrapLink($obj);
			$content = "
						<div class='relative ibm'><i class='fa fa-quote-left'></i>{$quoteLink}<i class='fa fa-quote-right'></i></div>
					";
			return htmlWrapContent($content, "dashboard-quote");
		}
		
		function htmlPhoto($obj) {
			$content = "
						<a target='_blank' class='photo fr highlight ibt' href='{$obj['href']}'>
							<img class='ibm' src='{$obj['opt_low_resolution']}'/> 
						</a>
					";
			return htmlWrapContent($content);
		}
		
		function htmlMultiplePhotos($actions) {
			$HTML = "";
			foreach($actions['data'] as $obj) {
				$HTML .= "
						<a target='_blank' class='pure-u-1-3 photo fr highlight ibt' href='{$obj['href']}'>
							<img class='ibm' src='{$obj['opt_low_resolution']}'/> 
						</a>
				";
			}
			$HTML = htmlWrapContent($HTML, "aggregate");
			return $HTML;
		}
		
		function htmlObject($obj) {
		//	print_r($obj);
			if($obj['object'] == "quote") {
				return htmlQuote($obj);
			}
		}
		function htmlWrapDate($dayFormat) {
			return("<div class='date-wrapper pure-u-1'><div class='date'>$dayFormat</div></div>");
		}
		function htmlIcon($actionVerb) {
			return "<i class='icon fa {$GLOBALS['iconByVerb'][$actionVerb]}'></i> ";
		}
		function htmlSummary($actionVerb, $count, $objectType) {
			return("{$GLOBALS['username']} $actionVerb $count $objectType");
		}
		function htmlWrapSummary($html) {
			return "<div class='summary pure-u-1-3'>" . $html . "</div>";
		}
		
		function htmlWrapAggregate($html) {
			return "<div class='pure-u-1 date-aggregate'> $html </div>";
		}
		
		function htmlWrapLink($object, $opt_summaryFlag = false) {
			if($opt_summaryFlag) {
				$link = $object['object'];
				$class = "highlight";
			}
			else {
				if($object['object'] == "quote") {
					$link = $object['opt_content'];
				}
				if($object['object'] == "photo") {
					$link = "<img src='{$object['low_resolution']}'/>";
				}
			}
			return "<a target='_blank' class='$class' title='click to see the {$object['object']}' href='{$object['href']}'>$link</a>";
		}
		
		foreach($times_assoc as $date => $dateObj) {
			if(date('Ymd') == date('Ymd', strtotime($date))) {
				$dayFormat = "Today";
			}
			else if(date('Ymd') == date('Ymd', time() - (24 * 60 * 60))) {
				$dayFormat = "Yesterday";
			}
			else {
				$dayFormat = date("l, M d", strtotime($date));
			}
			
			$rowHTML .= htmlWrapDate($dayFormat);
			if($debug) {
				print("--- $dayFormat ---\n");
			}
			$rowHTML .= "<div class='pure-u-1 date-all pure-u-wrapper'>";
			foreach($dateObj['data'] as $actionType => $actionObj) {
				foreach($actionObj['data'] as $actionMedium => $actions) {
					$count = $actions['count'];
					if($count > 0) {
						$countOrLetterA = $count == 1 ? "a" : $count;
						// if we're dealing with "rating" actions, deem it a "like" or an "upvote" depending on what object is involved - a picture or quote
						// otherwise, deem it a "submit", "favorite", etc etc, and we only need to know the action type
						if($actionType == "rating") {
							$actionVerb = actionVerbFromRatingType($actionMedium);
						}
						else {
							$actionVerb = actionVerbFromActionType($actionType);
						}
						$objectText = $count > 1 ? $actionMedium . "s": $actionMedium;
						if($count == 1) {
							$objectText = htmlWrapLink($actions['data'][0], 1);
						}
						$rowHTML .= "<div class='pure-u-1 pure-u-wrapper row clearfix'>";
						$rowHTML .= htmlWrapSummary(htmlIcon($actionVerb) . htmlSummary($actionVerb, $countOrLetterA, $objectText));
						$rowHTML .= htmlParseActions($actionMedium, $actions);
						$rowHTML .= "</div>";
						if($debug)
							print("user {$actionVerb} {$countOrLetterA} {$objectText}\n");
						//$aggregateByDateHTML = htmlWrapAggregate($rowHTML);
					}
				}
			}
			$rowHTML .= "</div>";
		}
		$HTML .= $rowHTML;
		
		
		if($GLOBALS['debug']) {
			print("\n\n\n");
			print("done\n");
			print("all times gathered: \n");
			print_r($times_assoc);
		}
		
		$GLOBALS['HTML'] = $HTML;
		return $results;
		
		$stmt->close();
		$mysqli->close();
	}
}

class featured_quote {
	function get($params) {
		
		$stmt = $mysqli->prepare("
			SELECT Quotes.quoteID, Quotes.quote, Authors.author FROM FeaturedQuotes 
			JOIN Quotes ON Quotes.quoteID = FeaturedQuotes.quoteID
			JOIN Media ON Media.mediaID = Quotes.mediaID 
			JOIN Authors ON Authors.authorID = Media.authorID
			LIMIT ?, ?
		");
		$lowerLimit = 0;
		$upperLimit = 1;
		$stmt->bind_param("ii", $lowerLimit, $upperLimit);
		$stmt->execute();
		$stmt->bind_result($id, $quote, $author);
		while($stmt->fetch()) {
			$obj = array("id" => $id, "quote" => $quote, "author" => $author);
			$results[] = $obj;
		}
		
		function htmlQuote($result) {
			return "
			<div class='quote blockquote'>
				<i class='quotation quotation-left fa-quote-left fa'></i>
					{$result['quote']}
				<i class='quotation quotation-right fa-quote-right fa'></i>
			</div>
			<div class='media-details pure-u-1'>
				<div class='media-author'>
					<a class='nodecoration autocolor' href='http://quotogenic.net/authors/{$result['author']}'>{$result['author']}
					</a>
				</div>
			</div>
			<div class='pure-u-wrapper clearfix'>
								<div class='pure-u-1 small-em-08'>
									<div class='fl'>
										<div data-objecttype='quoteID' data-id='84' data-type='facebook' title='Share this quote on Facebook' class='feed-share-button feed-social-button facebook ibm'>
											<i class='fa-social fa pointer fa-facebook'></i>
										</div>
										<div data-objecttype='quoteID' data-id='84' data-type='twitter' class='feed-share-button feed-social-button twitter ibm'>
											<a title='Tweet this quote' class='nodecoration autocolor' href='https://twitter.com/intent/tweet?text=&quot;Luck+is+for+those+who+believe+in+winning+by+accident%26quot%3B+-Unknown&amp;url=http://quotogenic.net/quotes/{$result['id']}'>
												<i class='fa-social fa pointer fa-twitter'></i>
											</a>
										</div>
										<div data-objecttype='quoteID' data-id='84' data-type='google+' class='feed-share-button feed-social-button google-plus ibm'>
											<a title='Share this quote on Google+' target='_blank' class='autocolor' href='https://plus.google.com/share?url=http://quotogenic.net/quotes/{$result['id']}'>
												<i class='fa-social fa pointer fa-google-plus'></i>
											</a>
										</div>
									</div>
									<a class='pure-button pure-button-small pure-button-customGreen scribble'>
										<img alt='Write to quotography' width='16' class='ibm' src='http://quotogenic.net/img/write-to-quotography-white.png'> <span class='ibm'>Scribble (Save)</span>
									</a>
									<a class='fr ibm pure-button pure-button-small pure-button-customGreen' href='http://quotogenic.net/submit/{$result['id']}'>
										<i class='fa fa-instagram ibm' style='font-size: 1.3em;'></i> <span class='ibm l-2-box-horizontal'>Submit Photo</span>
									</a>
								</div>
							</div>
			";
		}
		$GLOBALS['HTML'] = htmlQuote($results[0]);
		return $results;
	}
}
class popular {
	function get($params) {
		$mysqli = $GLOBALS['mysqli'];
		$itemsPerPage = 10;
		$type = $params['type'] ? $params['type'] : "tag";
		$time = $params['time'] ? $params['time'] : "all-time";
		$page = $params['page'] ? $params['page'] : 1;
		$GLOBALS['page'] = $page;
		
		$pagination_start = $page == 1 ? 0 : (($page - 1) * $itemsPerPage);
		$pagination_end = ($pagination_start + $itemsPerPage);
		
		//$stmt = $mysqli->prepare('SELECT COUNT(1) as totalRows FROM QuoteTagCounts');
		if($type == "tag") {
		$total = getCountFromTable($mysqli, 'QuoteTagCounts');
		$stmt = $mysqli->prepare("
					SELECT _i2.optionMediaTagID, optionMediaTag as value, QuoteTagCounts.quoteTagCount as ct FROM (
						SELECT * FROM (
							SELECT OptionsMediaTags.optionMediaTagID,  
							COUNT(
								CASE WHEN QuoteRatings.quoteRatingTime > DATE_SUB( NOW() , INTERVAL 10 DAY) 
								THEN 1 
								ELSE NULL 
								END
							) AS ctRatings, 'N/A' as ct
							FROM QuoteTags
							JOIN Quotes ON Quotes.quoteID = QuoteTags.quoteID
							JOIN QuoteRatings ON QuoteRatings.quoteID = Quotes.quoteID
							LEFT JOIN OptionsMediaTags ON OptionsMediaTags.optionMediaTagID = QuoteTags.optionMediaTagID
							GROUP BY OptionsMediaTags.optionMediaTagID
							HAVING ctRatings > 0
							ORDER BY  `ctRatings` DESC 
						) _u1
						UNION 
						SELECT * FROM (
							SELECT QuoteTagCounts.optionMediaTagID, 0 as ctRatings, QuoteTagCounts.quoteTagCount as ct 
							FROM QuoteTagCounts 
							ORDER BY ct DESC
						) _u2
						LIMIT ?, ?
					) _i2
					JOIN OptionsMediaTags ON OptionsMediaTags.optionMediaTagID = _i2.optionMediaTagID
					JOIN QuoteTagCounts ON QuoteTagCounts.optionMediaTagID = _i2.optionMediaTagID
					GROUP BY _i2.optionMediaTagID
					HAVING _i2.optionMediaTagID IS NOT NULL AND optionMediaTag != ''
					ORDER BY ctRatings DESC, _i2.ct DESC, optionMediaTag ASC
			");
		}
		else if($type == "author") {
		$total = getCountFromTable($mysqli, 'QuoteAuthorCounts');
		$stmt = $mysqli->prepare("	
					SELECT _i2.authorID as itemID, author as item, QuoteAuthorCounts.quoteAuthorCount as ct FROM (
						SELECT * FROM (
							SELECT Authors.authorID,  
							COUNT(
								CASE WHEN QuoteRatings.quoteRatingTime > DATE_SUB( NOW() , INTERVAL 10 DAY) 
								THEN 1 
								ELSE NULL 
								END
							) AS ctRatings, 'N/A' as ct
							FROM Authors
							JOIN Media ON Media.authorID = Authors.authorID
							JOIN Quotes ON Quotes.mediaID = Media.mediaID
							JOIN QuoteRatings ON QuoteRatings.quoteID = Quotes.quoteID
							GROUP BY Authors.authorID
							HAVING ctRatings > 0
							ORDER BY  `ctRatings` DESC 
						) _u1
						UNION 
						SELECT * FROM (
							SELECT QuoteAuthorCounts.authorID, 0 as ctRatings, QuoteAuthorCounts.quoteAuthorCount as ct 
							FROM QuoteAuthorCounts 
							ORDER BY ct DESC
						) _u2
						LIMIT ?, ?
					) _i2
					JOIN Authors ON Authors.authorID = _i2.authorID
					JOIN QuoteAuthorCounts ON QuoteAuthorCounts.authorID = _i2.authorID
					GROUP BY _i2.authorID
					HAVING _i2.authorID IS NOT NULL
					ORDER BY ctRatings DESC, _i2.ct DESC, author ASC
				");
		}
		if ( !$stmt ) {
			printf('errno: %d, error: %s', $mysqli->errno, $mysqli->error);
			die;
		}
		$stmt->bind_param("ii", $pagination_start, $itemsPerPage);
		$stmt->execute();
		$stmt->bind_result($id, $value, $ct);
		while($stmt->fetch()) {
			$obj = array("type" => $type, "id" => $id, "value" => $value, "count" => $ct);
			$results[] = $obj;
			/*
			$link = $GLOBALS['base'] . $type . "s/$id/" . slugify($value);
			$HTML .= "
					<div class='$type'>
						<a title='" . $value . "' href='" . $link . "'>
							$value
							<span class='count'>
								$ct
							</span>
						</a>
					</div>
					";
			*/
		}
		$GLOBALS['HTML'] = $HTML;
		return $results;

	}
}

include_once("API-favorites.php");
include_once("API-feed.php");
include_once("API-ig-login.php");
include_once("API-ig-logout.php");
include_once("API-ig-authenticate.php");
#require_once 'API.class.php';
class MyAPI extends API
{
    protected $User;

    public function __construct($request, $origin) {
        parent::__construct($request);

        // Abstracted out for example
        $APIKey = new APIKey();
        $User = new User();
        if (!array_key_exists('key', $this->request)) {
            throw new Exception('No API Key provided');
        } else if (!$APIKey->verifyKey($this->request['key'], $origin)) {
            throw new Exception('Invalid API Key');
        } else if (array_key_exists('token', $this->request) && !$User->get('token', $this->request['token'])) {
            throw new Exception('Invalid User Token');
        }

        $this->User = $User;
    }
 }
 
 

// Requests from the same server don't have a HTTP_ORIGIN header

if (!array_key_exists('HTTP_ORIGIN', $_SERVER)) {
    $_SERVER['HTTP_ORIGIN'] = $_SERVER['SERVER_NAME'];
}

try {
	$API = new MyAPI($_REQUEST['request'], $_SERVER['HTTP_ORIGIN']);
	$API->map('user/dashboard','dashboard');
	$API->map('user/favorites/lists','favorites_lists');
	$API->map('user/favorites/list','favorites_list');
	$API->map('user/favorites/lists/modify','favorites_lists_modify');
	$API->map('user/favorites/modify','favorites_modify');
	$API->map('user/favorites/lists/add','favorites_new_list');
	$API->map('media/popular','popular');
	$API->map('quote/featured','featured_quote');
	$API->map('feed','feed');
	$API->map('login','login');
	$API->map('logout','logout');
	$API->map('authenticate','authenticate');
	echo $API->processAPI();
} catch (Exception $e) {
    echo json_encode(Array('status' => 'error', 'message' => $e->getMessage()));
}

?>