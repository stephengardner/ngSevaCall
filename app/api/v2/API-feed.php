<?php
class feed {
	public $quotes = array();
	
	function setUpQuery($params, $mysqli) {
		$results = array();
		
		$itemsPerPage = 12; // used for both queryAll and regular query
		
		// pagination enabled for sorting the queryAll search functionality, it is not sorted by time, so next_max_id wont work.
		$page = isset($params['page']) ? urldecode($params['page']) : 1;
		
		// pages inclusive will grab all data from 0 up to the current page
		if($params['pagesInclusive']) {
			$pagination_end = ($page - 1) * $itemsPerPage;
			$SQL_LIMIT = "LIMIT 0, $pagination_end";
			$SQL_LIMIT_OUTER = "LIMIT 0, $pagination_end";
		}
		else {
			$pagination_start = $page == 1 ? 0 : (($page - 1) * $itemsPerPage);
			$pagination_end = ($pagination_start + $itemsPerPage);
			$SQL_LIMIT = "LIMIT $pagination_start, $itemsPerPage";
			$SQL_LIMIT_OUTER = "LIMIT 0, 12";
		}
		$GLOBALS['page'] = $page;
		
		$author = $params['author'];
		$tag = $params['tag'];
		$title = $params['title'];
		$medium = $params['medium'];
		
		if($params['queryAll']) {
			$tag = $author = $title = $quote = $query;
			$SQL_AND_OR_OR = "OR";
		}
		// if were querying over everything, get LIKE, otherwise, get EQUALS
		function getEqualsOrLike($param, $params) {
			return $params['queryAll'] ? " LIKE '%$param%' " : " = '$param'" ;
		}
		function getAndOrOr() {
			if($params['queryAll'])
				return " OR";
			else
				return " AND";
		}
		$SQL_MEDIA_JOIN = "
			LEFT JOIN Media ON Media.mediaID = Quotes.MediaID
			LEFT JOIN Authors ON Authors.authorID = Media.authorID
			LEFT JOIN Titles ON Titles.titleID = Media.titleID
		";
		
		$userID = $params['userID'];
		//if($params['userID']) {
			$SQL_USER_LIKE = ", count(CASE WHEN QuoteRatings.quoteID = Quotes.quoteID AND QuoteRatings.userID = '$userID' AND QuoteRatings.optionRatingTypeID = 1 THEN 1 ELSE NULL END) AS likedByUser";
			$SQL_USER_DISLIKE = ", count(CASE WHEN QuoteRatings.quoteID = Quotes.quoteID AND QuoteRatings.userID = '$userID' AND QuoteRatings.optionRatingTypeID = 2 THEN 1 ELSE NULL END) AS dislikedByUser";
			$SQL_USER_FAVORITE = ", count(CASE WHEN QuoteFavorites.quoteFavoriteActive AND QuoteFavorites.userID = '$userID' THEN 1 ELSE NULL END) AS favorite"; 
			$SQL_USER = $SQL_USER_LIKE . $SQL_USER_DISLIKE . $SQL_USER_FAVORITE . $SQL_USER_USER;
			$SQL_FAVORITE_JOIN = "
				LEFT JOIN QuoteFavorites ON QuoteFavorites.quoteID = Quotes.quoteID AND QuoteFavorites.userID = '$userID'
			";
		//}
		
		if($params['tag']) {
			$SQL_TAG_JOIN = "
				LEFT JOIN QuoteTags ON QuoteTags.quoteID = Quotes.quoteID
				LEFT JOIN OptionsMediaTags ON OptionsMediaTags.optionMediaTag " . getEqualsOrLike($tag, $params) . "
			";
			$SQL_TAG_WHERE = "QuoteTags.optionMediaTagID = OptionsMediaTags.optionMediaTagID";
		}
		
		// author || authorID only ONE
		if($params['author']) {
			$AND = $SQL_TAG_WHERE ? getAndOrOr() : "";
			$SQL_AUTHOR_WHERE = $AND . " Authors.author " . getEqualsOrLike($author);
		}
		else if($params['authorID']) {
			$AND = $SQL_TAG_WHERE ? getAndOrOr() : "";
			$SQL_AUTHOR_WHERE = $AND . " Authors.authorID = '$authorID'";
		}
		// title || titleID only ONE
		if($params['title']) {
			$AND = $SQL_TAG_WHERE || $SQL_AUTHOR_WHERE ? getAndOrOr() : "";
			$SQL_TITLE_WHERE = $AND . " Titles.title " . getEqualsOrLike($title);
		}
		if($params['titleID']) {
			$AND = $SQL_TAG_WHERE || $SQL_AUTHOR_WHERE ? getAndOrOr() : "";
			$SQL_TITLE_WHERE = $AND . " Media.titleID = '$titleID'";
		}
		if($params['query']) {
			$AND = $SQL_QUOTE_WHERE || $SQL_AUTHOR_WHERE ? getAndOrOr() : "";
			$SQL_QUOTE_WHERE = $AND . " Quotes.quote " . getEqualsOrLike($query);
		}
		if($params['medium']) {
			$SQL_MEDIUM_JOIN = "
				LEFT JOIN OptionsMediaMediums ON OptionsMediaMediums.optionMediaMediumID = Media.optionMediaMediumID
			";
			$AND = $SQL_TAG_WHERE || $SQL_AUTHOR_WHERE || $SQL_TITLE_WHERE ? " AND" : "";
			$SQL_MEDIUM_WHERE = $AND . " OptionsMediaMediums.optionMediaMedium = '$medium'";
		}
		
		$AND = $SQL_TAG_WHERE || $SQL_AUTHOR_WHERE || $SQL_TITLE_WHERE ? " AND" : "";
		$SQL_QUOTE_WHERE = $AND . " Quotes.quoteActive = 1";
		$SQL_WHERE = $SQL_TAG_WHERE || $SQL_TITLE_WHERE || $SQL_MEDIUM_WHERE || $SQL_AUTHOR_WHERE || $SQL_QUOTE_WHERE ? "WHERE " . $SQL_TAG_WHERE . $SQL_AUTHOR_WHERE . $SQL_TITLE_WHERE . $SQL_MEDIUM_WHERE . $SQL_QUOTE_WHERE : "";
		
		$results = array('SQL_LIMIT' => $SQL_LIMIT, 'SQL_LIMIT_OUTER' => $SQL_LIMIT_OUTER, 'SQL_WHERE' => $SQL_WHERE, 'SQL_USER' => $SQL_USER, 'SQL_FAVORITE_JOIN' => $SQL_FAVORITE_JOIN, 'SQL_TAG_JOIN' => $SQL_TAG_JOIN, 'SQL_MEDIA_JOIN' => $SQL_MEDIA_JOIN, 'SQL_MEDIUM_JOIN' => $SQL_MEDIUM_JOIN);
		return $results;
	}
	function queryByScore($params, $mysqli) {
		$queryParams = $this->setUpQuery($params, $mysqli);
		$SQL_QUERY = "
			SELECT _i2.*,
				GROUP_CONCAT(OptionsMediaTags.optionMediaTag SEPARATOR ', ') AS tags, GROUP_CONCAT(OptionsMediaTags.optionMediaTagID SEPARATOR ', ') AS tagIDs
			FROM
			  (SELECT _i1.quoteID, quote, Quotes.quoteCreatedDateTime, author, Authors.authorID, title, Titles.titleID,  Users.userName, likes, dislikes, score
					{$queryParams['SQL_USER']}
				FROM
				(SELECT *
				  FROM
					(SELECT Quotes.quoteID,
							QuoteScores.quoteScore AS score,
							QuoteScores.quoteLikes AS likes,
							QuoteScores.quoteDislikes AS dislikes
					 FROM Quotes
					 JOIN QuoteScores ON QuoteScores.quoteID = Quotes.quoteID
						{$queryParams['SQL_MEDIA_JOIN']}
						{$queryParams['SQL_TAG_JOIN']}
						{$queryParams['SQL_WHERE']}
					 ORDER BY score DESC
						{$queryParams['SQL_LIMIT']}) U1
				  UNION SELECT *
				  FROM
					(SELECT Quotes.quoteID, 
							0 AS score, 0 AS likes, 
							0 AS dislikes
					FROM Quotes
						{$queryParams['SQL_MEDIA_JOIN']}
						{$queryParams['SQL_TAG_JOIN']}
						{$queryParams['SQL_MEDIUM_JOIN']}
						{$queryParams['SQL_WHERE']}
						ORDER BY score DESC, Quotes.quoteID DESC 
						{$queryParams['SQL_LIMIT']}
					)_U2 {$queryParams['SQL_LIMIT_OUTER']}
				) _i1
				LEFT JOIN Quotes ON Quotes.quoteID = _i1.quoteID
				LEFT JOIN QuoteRatings ON QuoteRatings.quoteID = Quotes.quoteID
				LEFT JOIN Media ON Media.mediaID = Quotes.mediaID
				LEFT JOIN Authors ON Authors.authorID = Media.authorID
				LEFT JOIN Titles ON Titles.titleID = Media.titleID
				LEFT JOIN Users ON Users.userID = Quotes.userID
				{$queryParams['SQL_FAVORITE_JOIN']}
			   GROUP BY Quotes.quoteID
			   ORDER BY score DESC, quoteID DESC ) _i2
			LEFT JOIN QuoteTags ON QuoteTags.quoteID = _i2.quoteID
			LEFT JOIN OptionsMediaTags ON OptionsMediaTags.optionMediaTagID = QuoteTags.optionMediaTagID
			GROUP BY _i2.quoteID
			ORDER BY score DESC, _i2.quoteID DESC
		";
		$stmt = $mysqli->prepare($SQL_QUERY);
		checkStmt($stmt);
		$stmt->execute();
		$stmt->bind_result($quoteID, $quote, $quoteCreatedDateTime, $author, $authorID, $title, $titleID, $username, $likes, $dislikes, $score, $likedByUser, $dislikedByUser, $favorite, $tags, $tagIDs);
		$results = array("quotes" => array());
		while($stmt->fetch()) {
			// map tags to their IDs and store in the result object
			$tagIndex = 0;
			$tagsArray = array();
			if($tags) {
				$tagsArray = explode(", ", $tags);
			}
			$tagIDsArray = explode(", ", $tagIDs);
			$newTags = array();
			foreach($tagsArray as $tag) {
				array_push($newTags, array("id" => $tagIDsArray[$tagIndex], "tag" => $tag));
				$tagIndex++;
			}
			array_push($this->quotes, array("id" => $quoteID, "author" => $author, "quote" => $quote, "created" => $quoteCreatedDateTime, "tags" => $newTags, "likes" => $likes, "dislikes" => $dislikes, "score" => ($likes - $dislikes), "interaction" => array("liked" => $likedByUser, "disliked" => $dislikedByUser, "favorite" => $favorite), "media" => array("photos" => array("count" => 0, "data" => array()))));
		}
		$results['quotes'] = $this->quotes;
		return $results;
	}
	function photosByQuote($params, $mysqli) {
		$stmt = $mysqli->prepare("
				SELECT Photos.photoID, Quotes.quoteID, PhotoMap.photoMapID, Photos.thumbnail, Photos.low_resolution, Photos.high_resolution, Users.userName, 
				count(CASE WHEN PhotoRatings.optionRatingTypeID = 1 THEN 1 ELSE NULL END) as likes, 
				count(CASE WHEN  PhotoRatings.optionRatingTypeID = 2 THEN 1 ELSE NULL END) as dislikes,
				SUM(CASE WHEN PhotoRatings.optionRatingTypeID = 1 THEN 1 WHEN PhotoRatings.optionRatingTypeID = 2 THEN -1 ELSE 0 END) AS score
				, count(CASE WHEN PhotoRatings.photoMapID = PhotoMap.photoMapID AND PhotoRatings.userID = ? AND PhotoRatings.optionRatingTypeID = 1 THEN 1 ELSE NULL END) AS likedByUser
				, count(CASE WHEN PhotoRatings.photoMapID = PhotoMap.photoMapID AND PhotoRatings.userID = ? AND PhotoRatings.optionRatingTypeID = 2 THEN 1 ELSE NULL END) AS dislikedByUser
				FROM Quotes
				LEFT JOIN PhotoMap ON PhotoMap.quoteID = Quotes.quoteID
				LEFT JOIN PhotoRatings ON PhotoRatings.photoMapID = PhotoMap.photoMapID AND PhotoRatings.photoMapID = PhotoMap.photoMapID
				LEFT JOIN Photos ON Photos.photoID = PhotoMap.photoID AND Photos.photoVisible = 1
				LEFT JOIN Users ON Users.userID = Photos.userID
				WHERE Photos.photoID IS NOT NULL
				GROUP BY PhotoMap.photoMapID, Photos.photoID
				ORDER BY score DESC, Photos.photoID DESC
		");
		checkStmt($stmt);
		$stmt->bind_param("ii", $params['userID'], $params['userID']);
		$stmt->execute();
		$stmt->bind_result($photoID, $quoteID, $photoMapID, $thumbnail, $low_resolution, $medium_resolution, $username, $likes, $dislikes, $score, $likedByUser, $dislikedByUser);
		while($stmt->fetch()) {
			$photoObject = array('id' => $photoID, 'quoteID' => $quoteID, 'photoMapID' => $photoMapID, 'images' => array('thumbnail' => array('url' => $thumbnail), 'low_resolution' => array('url' => $low_resolution), 'medium_resolution' => array('url' => $medium_resolution)), 'user' => $username, 'interaction' => array('likedByUser' => $likedByUser, 'dislikedByUser' => $dislikedByUser), 'likes' => $likes, 'dislikes' => $dislikes);
				
			foreach($this->quotes as &$obj) {
				if($obj['id'] == $quoteID) {
					$obj['media']['photos']['count'] ++;
					array_push($obj['media']['photos']['data'], $photoObject);
				}
			}
		}
	}
	function queryByAll($params, $mysqli) {
		$queryParams = $this->setUpQuery($params, $mysqli);
		$stmt = $mysqli->prepare("
			SELECT _i2.*, GROUP_CONCAT(OptionsMediaTags.optionMediaTag SEPARATOR  ', ' ) AS tags FROM (
				SELECT Quotes.quoteID, quote, Quotes.quoteCreatedDateTime, author, Authors.authorID, title, Titles.titleID, relevance, 
				COUNT(CASE WHEN QuoteRatings.quoteID = Quotes.quoteID AND QuoteRatings.optionRatingTypeID = 1 THEN 1 ELSE NULL END) AS likes,
				COUNT(CASE WHEN QuoteRatings.quoteID = Quotes.quoteID AND QuoteRatings.optionRatingTypeID = 2 THEN 1 ELSE NULL END) AS dislikes,
				Users.userName, 
						count(CASE WHEN QuoteRatings.quoteID = Quotes.quoteID AND QuoteRatings.userID = ? AND QuoteRatings.optionRatingTypeID = 1 THEN 1 ELSE NULL END) AS likedByUser,
						count(CASE WHEN QuoteRatings.quoteID = Quotes.quoteID AND QuoteRatings.userID = ? AND QuoteRatings.optionRatingTypeID = 2 THEN 1 ELSE NULL END) AS dislikedByUser,
						count(CASE WHEN QuoteFavorites.quoteFavoriteActive AND QuoteFavorites.userID = ? THEN 1 ELSE NULL END) AS favorite						
					FROM (
					SELECT * FROM (
						SELECT 
						Quotes.quoteID,
						(
						MATCH(Quotes.quote) AGAINST (?)
						 * 2
						) as relevance
						FROM Quotes
						WHERE MATCH(Quotes.quote) AGAINST (?) > 0
						order by relevance desc
					) _u1
					UNION 
					SELECT * FROM (
						SELECT QuoteTags.quoteID,
						(
						MATCH(OptionsMediaTags.optionMediaTag) AGAINST (?)
						 * 2
						) as relevance
						FROM OptionsMediaTags
						LEFT JOIN QuoteTags ON QuoteTags.optionMediaTagID = OptionsMediaTags.optionMediaTagID
						WHERE MATCH(OptionsMediaTags.optionMediaTag) AGAINST (?) > 0
						GROUP BY quoteID
						HAVING quoteID IS NOT NULL
						ORDER BY relevance desc
					) _u2
					UNION
					SELECT * FROM (
						SELECT 
						Quotes.quoteID,
						(
						MATCH(Authors.author) AGAINST (?)
						 * 2
						) as relevance
						FROM Quotes
						JOIN Media ON Media.mediaID = Quotes.mediaID
						JOIN Authors ON Authors.authorID = Media.authorID
						WHERE MATCH(Authors.author) AGAINST (?) > 0
					GROUP BY quoteID
						order by relevance desc
					) _u3
					order by relevance desc
					{$queryParams['SQL_LIMIT']}
				) _i1
				LEFT JOIN Quotes ON Quotes.quoteID = _i1.quoteID
				LEFT JOIN Media ON Media.mediaID = Quotes.mediaID
				LEFT JOIN Authors ON Authors.authorID = Media.authorID
				LEFT JOIN Titles ON Titles.titleID = Media.titleID
				LEFT JOIN QuoteRatings ON QuoteRatings.quoteID = Quotes.quoteID
				LEFT JOIN Users ON Users.userID = Quotes.userID
				LEFT JOIN QuoteFavorites ON QuoteFavorites.quoteID = Quotes.quoteID AND QuoteFavorites.userID = ?
				GROUP BY Quotes.quoteID
				order by relevance desc
			) _i2
			LEFT JOIN QuoteTags ON QuoteTags.quoteID = _i2.quoteID
			LEFT JOIN OptionsMediaTags ON OptionsMediaTags.optionMediaTagID = QuoteTags.optionMediaTagID AND OptionsMediaTags.optionMediaTag != ''
			GROUP BY _i2.quoteID
			order by relevance desc
		");/* check connection */
		checkStmt($stmt);
		$stmt->bind_param("iiissssssi", $params['userID'], $params['userID'], $params['userID'], 
										$params['query'], $params['query'], $params['query'], $params['query'], $params['query'], $params['query'],
										$params['userID']
						);
		$stmt->execute();
		$stmt->bind_result($quoteID, $quote, $quoteCreatedDateTime, $author, $authorID, $title, $titleID, $relevance, $likes, $dislikes, $username, $likedByUser, $dislikedByUser, $favorite, $tags);
		
		while($stmt->fetch()) {
			// map tags to their IDs and store in the result object
			$tagIndex = 0;
			$tagsArray = array();
			if($tags) {
				$tagsArray = explode(", ", $tags);
			}
			$tagIDsArray = explode(", ", $tagIDs);
			$newTags = array();
			foreach($tagsArray as $tag) {
				array_push($newTags, array("id" => $tagIDsArray[$tagIndex], "tag" => $tag));
				$tagIndex++;
			}
			array_push($this->quotes, array("id" => "", "quote" => $quote, "created" => $quoteCreatedDateTime, "tags" => $newTags, "likes" => $likes, "dislikes" => $dislikes, "score" => ($likes - $dislikes), "interaction" => array("liked" => $likedByUser, "disliked" => $dislikedByUser, "favorite" => $favorite), "media" => array("photos" => array("count" => 0, "data" => array()))));
		}
		
		$results['quotes'] = $this->quotes;
		return $results;
	}
	
	function get($params) {
		$mysqli = $GLOBALS['mysqli'];
		if($params['query']) {
			$this->queryByAll($params, $mysqli);
		}
		else {
			$this->queryByScore($params, $mysqli);
		}
		$this->photosByQuote($params, $mysqli);
		return array("quotes" => $this->quotes);
	}
}
?>