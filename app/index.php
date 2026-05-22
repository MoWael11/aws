<?php
  require __DIR__ . '/vendor/autoload.php';
  
  $dotenv = Dotenv\Dotenv::createImmutable(__DIR__);
  $dotenv->load();

  $host = $_ENV['DB_HOST'];
  $port = 5432;
  $db='postgres'; 
  $user='postgres';
  $password = $_ENV['DB_PASSWORD'];

  $conn = null;

  try {
    $conn = pg_connect(
      "host=$host port=$port dbname=$db user=$user password=$password"
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

  ?>