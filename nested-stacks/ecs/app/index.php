<?php

/**
 * Use this code snippet in your app.
 *
 * If you need more information about configurations or implementing the sample code, visit the AWS docs:
 * https://aws.amazon.com/developer/language/php/
 */

require 'vendor/autoload.php';

use Aws\SecretsManager\SecretsManagerClient;
use Aws\Ssm\SsmClient;
use Aws\Exception\AwsException;

// 1. Ottieni il token (IMDSv2)
$Token = exec('curl -s -X PUT "http://169.254.169.254/latest/api/token" -H "X-aws-ec2-metadata-token-ttl-seconds: 21600"');

// 2. Recupera l’Availability Zone usando il token
// NOTA: Usa le virgolette doppie "" e NON i backtick `` per la stringa del comando
$az = exec("curl -s -H \"X-aws-ec2-metadata-token: $Token\" http://169.254.169.254/latest/meta-data/placement/availability-zone");
$region = exec("curl -s -H \"X-aws-ec2-metadata-token: $Token\" http://169.254.169.254/latest/meta-data/placement/region");

// 3. Stampa il risultato (es. eu-west-1a)

/**
 * This code expects that you have AWS credentials set up per:
 * https://docs.aws.amazon.com/sdk-for-php/v3/developer-guide/guide_credentials.html
 */

// Create a Secrets Manager Client
$client = new SecretsManagerClient([
  'version' => '2017-10-17',
  'region' => $region,
]);

$secret_name = 'db-instance-secret';

try {
  $result = $client->getSecretValue([
    'SecretId' => $secret_name,
  ]);
} catch (AwsException $e) {
  // For a list of exceptions thrown, see
  // https://docs.aws.amazon.com/secretsmanager/latest/apireference/API_GetSecretValue.html
  throw $e;
}

// Decrypt  s secret using the associated KMS key.
$secret = $result['SecretString'];

$secret_json = json_decode($secret, true);

$ssmClient = new SsmClient([
  'region' => $region,
  'version' => 'latest'
]);

$tempCred = $ssmClient->getParameter([
  'Name' => 'db-instance-parameter',
  'WithDecryption' => true
]);


// Your code goes here
// {"password":"V,`a}SgoB>BNTAaD{&4DDsxdm2`q|E","username":"postgres"}PHP Fatal error:  Uncaught TypeError: Cannot access offset of type string on string in /var/www/html/index.php:49
// Stack trace:
// #0 {main}
//   thrown in /var/www/html/index.php on line 49
// root@ip-10-0-3-160:/var/www/html#

$dotenv = Dotenv\Dotenv::createImmutable(__DIR__);
$dotenv->load();

$host = $_ENV['DB_HOST'];
$port = 5432;
$db = 'postgres';
$password = $secret_json['password'];
$username = $secret_json['username'];

$conn = null;

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

echo "from az: $az";
