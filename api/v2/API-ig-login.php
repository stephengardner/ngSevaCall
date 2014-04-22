<?php
class login {
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
		include_once('Instagram/instagram.class.php');
		$instagram = new Instagram(array(
							"apiKey" => "75b6c945b4e04cb2982f25126e7add0f",
							"apiSecret" => "9b622f42cdf44f0f9465c926c4a32855",
							"apiCallback" => "http://localhost/public_html/angular-seed/app/instagram-redirect-handler.html"
						));
		$instagram->setAccessToken($params['access_token']);
		
		$stmt = $mysqli->prepare("
				INSERT IGNORE INTO InstagramNew (instagramUsername, instagramBio, instagramWebsite, instagramProfilePicture, instagramFullName, instagramUserID, accessCookie) VALUES (?, ?, ?, ?, ?, ?, ?)
				ON DUPLICATE KEY UPDATE instagramAccessToken = ?, instagramUsername = ?, instagramBio = ?, instagramWebsite = ?, accessCookie = ?
		");
		checkStmt($stmt);
		
		$user = $instagram->getUser();
		$data = $user->data;
		$newUID = newUID();
		$stmt->bind_param("ssssssssssss", $data->username, $data->bio, $data->website, $data->profile_picture, $data->full_name, $data->id, $newUID, $params['access_token'], $data->username, $data->bio, $data->website, $newUID);
		$stmt->execute();
		
		setcookie('qac', $newUID, strtotime( '+2 days' ), "/");
		return array('newUID' => $newUID, 'data' => array('username' => $data->username, 'bio' => $data->bio, 'website' => $data->website, 'profile_picture' => $data->profile_picture, 'full_name' => $data->full_name, 'id' => $data->id, 'qac' => $newUID));//$instagram->getUser());
		
	}
}
?>