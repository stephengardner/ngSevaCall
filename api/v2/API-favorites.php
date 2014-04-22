<?php
/*
 * In an ideal world, the structure of this would be separated in a more object/class oriented fashion.
 * Since this is such a small scale exercise, these helper functions have been abstracted minimally
 *
 */

// not immediately necessary since "explode()" does this for us, but following exercise suggestions
function addToIndex($filename, $word) {
    $storage = &$GLOBALS['simpleTokenizer'];
    array_push($storage[$filename]['words'], $word);
}

// split the read-in string as it's first element (AND|OR) and its remaining element (the query)
function splitQuery($fullQuery) {
    $split = explode(" ", $fullQuery);
    $removeFirst = array_shift($split);
    $GLOBALS['queryType'] = $removeFirst;
    $GLOBALS['query'] = ($split);
}

function checkInvalidQuery() {
    if($GLOBALS['queryType'] != "AND" && $GLOBALS['queryType'] != "OR") {
        return true;
    }
    return false;
}

// read a single file
function rf($filename) {
    $handle = fopen($filename, "r");
    $contents = fread($handle, filesize($filename));
    $tokenized = explode(" ", $contents);
    $tokenized = array_filter(array_map('trim', $tokenized)); // strip white space and blank space characters from results
    foreach($tokenized as $word) {
        addToIndex($filename, $word);
    }
    fclose($handle);
}

function checkInvalidDirectory() {
    if(is_file($GLOBALS['directory']) || is_dir($GLOBALS['directory'])){
        return false;
    }
    return true;
}

// build the tokenizer data structure by recursively iterating through the input location
function recursiveFileSearch($startingLocation) {
    if(!checkInvalidDirectory($startingLocation)){
        $it = new RecursiveDirectoryIterator($startingLocation);
        $display = Array('txt');
        $count = 0;

        foreach(new RecursiveIteratorIterator($it) as $file)
        {
            if (in_array(strtolower(array_pop(explode('.', $file))), $display)) {
                $path = (string) $file;
                $GLOBALS['simpleTokenizer'][$path] = array("words" => array());
                $count++;
            }
        }
    }
}

function addFileToResults($path) {
    array_push($GLOBALS['filesMatched'], $path);
}

function queryFile($filename) {
    $queryType = $GLOBALS['queryType'];
    $query = $GLOBALS['query'];
    $storage = $GLOBALS['simpleTokenizer'];
    $searchFor = $GLOBALS['query'];
    $words = $storage[$filename]['words'];
    if($queryType == "AND") {
        $containsSearch = count(array_intersect($searchFor, $words)) == count($searchFor);
        if($containsSearch) {
            addFileToResults($filename);
        }
    }
    if($queryType == "OR") {
        $containsSearch = false;
        foreach($searchFor as $word) {
            if(in_array($word, $words))
                $containsSearch = true;
        }
        if($containsSearch) {
            addFileToResults($filename);
        }
    }
}

// display search results
function storeResults() {
    $filesMatched = $GLOBALS['filesMatched'];
    $count = count($GLOBALS['filesMatched']);
    $GLOBALS['resultsString'] .= "Found $count results:";
    foreach($filesMatched as $fileName){
        $GLOBALS['resultsString'] .= "<br/> * $fileName";
    }
}

// read all files in the tokenizer data structure
function readAllFiles() {
    $simpleTokenizer = $GLOBALS['simpleTokenizer'];
    foreach($simpleTokenizer as $path => $obj) {
        rf($path, $simpleTokenizer); // pass in the global tokenizer storage as the second parameter
    }
}

?>