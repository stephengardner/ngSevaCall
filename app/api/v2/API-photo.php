<?php
class photo {
	
	function get($params) {
		$mysqli = $GLOBALS['mysqli'];
		$SQL_USER_SELECT = "
			, COUNT(CASE WHEN PhotoRatings.optionRatingTypeID = 1 AND PhotoRatings.userID = ? THEN 1 ELSE NULL END) as photoLikedByUser,
			COUNT(CASE WHEN PhotoRatings.optionRatingTypeID = 2 AND PhotoRatings.userID = ? THEN -1 ELSE NULL END) as photoDislikedByUser
		";
		
		$SQL_QUERY = "
			SELECT Quotes.quote, Authors.author, Photos.high_resolution, Users.username,
				COUNT(CASE WHEN PhotoRatings.optionRatingTypeID = 1 AND PhotoRatings.photoMapID = ? THEN 1 ELSE NULL END) as photoLikes,
				COUNT(CASE WHEN PhotoRatings.optionRatingTypeID = 2 AND PhotoRatings.photoMapID = ? THEN 1 ELSE NULL END) as photoDislikes
			$SQL_USER_SELECT
			FROM PhotoMap
			JOIN Quotes ON Quotes.quoteID = PhotoMap.quoteID
			LEFT JOIN Media ON Media.mediaID = Quotes.quoteID
			LEFT JOIN Authors ON Authors.authorID = Media.authorID
			LEFT JOIN PhotoRatings ON PhotoRatings.photoMapID = ?
			JOIN Photos ON Photos.photoID = PhotoMap.photoID
			JOIN Users ON Users.userID = Photos.userID
			WHERE PhotoMap.photoMapID = ?
		";
		$stmt = $mysqli->prepare($SQL_QUERY);
		checkStmt($stmt);
		// userID, and photoMapID(sent in as 'id') are passed in
		$stmt->bind_param("iiiiii", $params['id'], $params['id'], $params['userID'], $params['userID'], $params['id'], $params['id']);
		$stmt->execute();
		$stmt->bind_result($quote, $author, $medium_resolution, $username, $photoLikes, $photoDislikes, $photoLikedByUser, $photoDislikedByUser);
		while($stmt->fetch()) {
			return array('quote' => array('quote' => $quote, 'author' => $author), 'photo' => array('username' => $username, 'likes' => $photoLikes, 'dislikes' => $photoDislikes, 'interaction' => array('likedByUser' => $photoLikedByUser, 'dislikedByUser' => $photoDislikedByUser), 'images' => array('medium_resolution' => $medium_resolution)));
		}
	}
}
?>