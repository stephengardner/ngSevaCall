<?php
header('Access-Control-Allow-Origin: *');
include_once('api-config.php');
/*
 *	Version 4 of the Quotogenic API handler written as a standalone class definition
 *	Author: Augie Gardner
 *	Updated: 4/22/2014
 */

// global testing variables
$debug = false;
$forceUserID = false;

// set up the mysqli object to be used by the API
function prepareSQL() {
	// the "SQL_" definitions are located in api-config
	$mysqli = new mysqli(SQL_HOST, SQL_USER, SQL_PASS, SQL_DB);
	if(mysqli_connect_errno()) { echo "Connection Failed: " . mysqli_connect_errno(); exit(); }
	return $mysqli;
}

// check a mysqli statement for validity, die with error if invalid
function checkStmt($stmt) {
	if ( false===$stmt ) {
	  die('prepare() failed: ' . htmlspecialchars($GLOBALS['mysqli']->error));
	}
}

function time_elapsed_string($datetime, $full = false) {
		$now = new DateTime;
		$now = date_sub($now, date_interval_create_from_date_string('2 hours'));
		//$twoHoursAgo = $now - 7200;
		//$now = $twoHoursAgo;
		$ago = new DateTime($datetime);
		$diff = $now->diff($ago);

		$diff->w = floor($diff->d / 7);
		$diff->d -= $diff->w * 7;

		$string = array(
			'y' => 'yr',
			'm' => 'mo',
			'w' => 'w',
			'd' => 'd',
			'h' => 'h',
			'i' => 'm',
			's' => 's',
		);
		foreach ($string as $k => &$v) {
			if ($diff->$k) {
				$v = $diff->$k . '' . $v . ($diff->$k > 1 ? '' : '');
			} else {
				unset($string[$k]);
			}
		}

		if (!$full) $string = array_slice($string, 0, 1);
		return $string ? implode(', ', $string) . '' : 'just now';
	}
// prepare mysqli for use globally
$mysqli = prepareSQL();

// allow testing to force a userID (in this case, the admin)
if($forceUserID)
	$_GET['userID'] = 35;

// errors used for displaying messages to users when they access the API inadequately
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
			$class = new $func();
			$type = $this->method;
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
		}
		$GLOBALS['HTML'] = $HTML;
		return $results;

	}
}

// include the other API functions, abstracted into their own files for readability
include_once("API-feed.php");
include_once("API-ig-login.php");
include_once("API-ig-logout.php");
include_once("API-ig-authenticate.php");
include_once("API-photo.php");

class MyAPI extends API {
    protected $User;

	public function __construct($request, $origin) {
		parent::__construct($request);

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
	// map endpoints to a class name
	$API->map('media/popular','popular');
	$API->map('feed','feed');
	$API->map('login','login');
	$API->map('logout','logout');
	$API->map('authenticate','authenticate');
	$API->map('photo', 'photo');
	
	// echo the processed api response
	echo $API->processAPI();
} catch (Exception $e) {
    echo json_encode(Array('status' => 'error', 'message' => $e->getMessage()));
}

?>