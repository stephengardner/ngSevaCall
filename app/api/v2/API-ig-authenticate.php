<?php
class authenticate {
	function get($params) {
		$mysqli = $GLOBALS['mysqli'];
		$stmt = $mysqli->prepare("
			SELECT instagramID, instagramUsername, instagramUserID, instagramBio, instagramWebsite, instagramProfilePicture, instagramFullName
			FROM InstagramNew
			WHERE accessCookie = ?
		");
		checkStmt($stmt);
		$stmt->bind_param("s", $params['qac']);
		$stmt->execute();
		$stmt->bind_result($userID, $username, $instagramID, $bio, $website, $picture, $full_name);
		while($stmt->fetch()) {
			return array('username' => $username, 'id' => $userID, 'bio' => $bio, 'website' => $website, 'picture' => $picture, 'full_name' => $full_name);
		}
	}
}
?>