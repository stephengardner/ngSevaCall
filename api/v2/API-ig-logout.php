<?php
class logout {
	function post($params) {
	
		// generate a unique session ID
		function newUID($prefix = '') {
			$chars = md5(uniqid(mt_rand(), true));
			$uuid  = substr($chars,0,8) . '-';
			$uuid .= substr($chars,8,4) . '-';
			$uuid .= substr($chars,12,4) . '-';
			$uuid .= substr($chars,16,4) . '-';
			$uuid .= substr($chars,20,12);
			return $prefix . $uuid;
		}
		
		$mysqli = $GLOBALS['mysqli'];
		
		$stmt = $mysqli->prepare("
			UPDATE InstagramNew SET accessCookie = ? WHERE accessCookie = ?
		");
		checkStmt($stmt);
		
		$newUID = newUID();
		$stmt->bind_param("ss", $newUID, $params->qac);
		$stmt->execute();
		
		setcookie('qac', $newUID, strtotime( '-2 days' ), "/");
		return array('affected_rows' => $stmt->affected_rows);
		
	}
}
?>