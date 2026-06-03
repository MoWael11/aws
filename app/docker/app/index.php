<?php

/**
 * Use this code snippet in your app.
 *
 * If you need more information about configurations or implementing the sample code, visit the AWS docs:
 * https://aws.amazon.com/developer/language/php/
 */


$port = 5432;
$db = 'postgres';
$host = getenv('DB_HOST');
$username = getenv('username');
$password = getenv('password');

$conn = null;

echo "from port: $port, db: $db, host: $host, username: $username, password: $password";

try {
  $conn = pg_connect(
    "host=$host port=$port dbname=$db user=$username password=$password"
  );

  if (!$conn) {
    die("Connection failed: " . pg_last_error());
  }
  echo "<h1>Connected to PostgreSQL successfully</h1>";

  $r = pg_query($conn, "SELECT NOW()");

  if (!$r) {
    die("Query failed: " . pg_last_error());
  }

  $row = pg_fetch_row($r);

  echo "<p>Database time: " . $row[0] . "</p>";
} catch (Exception $e) {
  echo "Database error: " . $e->getMessage();
} finally {
  if ($conn) {
    pg_close($conn);
  }
}

