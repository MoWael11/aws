<?php

/**
 * Beautiful PostgreSQL Connection Page
 * Single-file version
 */

$port = 5432;
$db = 'postgres';
$host = getenv('DB_HOST');
$username = getenv('username');
$password = getenv('password');

$status = false;
$message = "";
$dbTime = "";

$conn = null;

try {
    $conn = pg_connect(
        "host=$host port=$port dbname=$db user=$username password=$password"
    );

    if (!$conn) {
        throw new Exception(pg_last_error());
    }

    $status = true;
    $message = "Connected to PostgreSQL successfully";

    $result = pg_query($conn, "SELECT NOW()");

    if (!$result) {
        throw new Exception(pg_last_error());
    }

    $row = pg_fetch_row($result);
    $dbTime = $row[0];

} catch (Exception $e) {
    $message = $e->getMessage();
} finally {
    if ($conn) {
        pg_close($conn);
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">

<title>Database Status</title>

<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">

<style>
*{
    margin:0;
    padding:0;
    box-sizing:border-box;
    font-family:'Inter',sans-serif;
}

body{
    min-height:100vh;
    display:flex;
    justify-content:center;
    align-items:center;
    background:
        radial-gradient(circle at top left,#7c3aed 0%,transparent 35%),
        radial-gradient(circle at bottom right,#06b6d4 0%,transparent 35%),
        linear-gradient(135deg,#0f172a,#111827,#020617);
    overflow:hidden;
    color:white;
}

.bg-blur{
    position:absolute;
    width:600px;
    height:600px;
    border-radius:50%;
    background:rgba(255,255,255,0.05);
    filter:blur(120px);
}

.card{
    width:min(700px,90%);
    padding:40px;
    border-radius:28px;
    background:rgba(255,255,255,0.08);
    backdrop-filter:blur(20px);
    -webkit-backdrop-filter:blur(20px);
    border:1px solid rgba(255,255,255,0.12);
    box-shadow:
        0 25px 60px rgba(0,0,0,.4),
        inset 0 1px 0 rgba(255,255,255,.15);
    text-align:center;
}

.logo{
    width:90px;
    height:90px;
    margin:0 auto 20px;
    border-radius:24px;
    display:flex;
    align-items:center;
    justify-content:center;
    font-size:40px;
    background:linear-gradient(135deg,#6366f1,#06b6d4);
    box-shadow:0 15px 30px rgba(99,102,241,.35);
}

h1{
    font-size:2.2rem;
    margin-bottom:10px;
    font-weight:700;
}

.subtitle{
    color:rgba(255,255,255,.75);
    margin-bottom:35px;
}

.status{
    padding:18px;
    border-radius:18px;
    margin-bottom:25px;
    font-weight:600;
    font-size:1rem;
}

.success{
    background:rgba(34,197,94,.15);
    border:1px solid rgba(34,197,94,.35);
    color:#86efac;
}

.error{
    background:rgba(239,68,68,.15);
    border:1px solid rgba(239,68,68,.35);
    color:#fca5a5;
}

.grid{
    display:grid;
    grid-template-columns:repeat(auto-fit,minmax(220px,1fr));
    gap:18px;
    margin-top:20px;
}

.info-box{
    background:rgba(255,255,255,.05);
    border:1px solid rgba(255,255,255,.08);
    border-radius:20px;
    padding:22px;
    text-align:left;
}

.label{
    font-size:.85rem;
    color:rgba(255,255,255,.6);
    margin-bottom:8px;
}

.value{
    font-size:1rem;
    font-weight:600;
    word-break:break-word;
}

.footer{
    margin-top:28px;
    color:rgba(255,255,255,.5);
    font-size:.85rem;
}

.pulse{
    width:12px;
    height:12px;
    border-radius:50%;
    display:inline-block;
    margin-right:8px;
    animation:pulse 1.5s infinite;
}

.pulse.green{
    background:#22c55e;
}

.pulse.red{
    background:#ef4444;
}

@keyframes pulse{
    0%{transform:scale(1);opacity:1}
    50%{transform:scale(1.5);opacity:.5}
    100%{transform:scale(1);opacity:1}
}
</style>
</head>
<body>

<div class="bg-blur"></div>

<div class="card">

    <div class="logo">
        🐘
    </div>

    <h1>PostgreSQL Dashboard</h1>
    <p class="subtitle">
        Elegant database connection status monitor
    </p>

    <?php if ($status): ?>
        <div class="status success">
            <span class="pulse green"></span>
            <?= htmlspecialchars($message) ?>
        </div>

        <div class="grid">
            <div class="info-box">
                <div class="label">Database Host</div>
                <div class="value">
                    <?= htmlspecialchars($host ?: 'N/A') ?>
                </div>
            </div>

            <div class="info-box">
                <div class="label">Database Name</div>
                <div class="value">
                    <?= htmlspecialchars($db) ?>
                </div>
            </div>

            <div class="info-box">
                <div class="label">Port</div>
                <div class="value">
                    <?= htmlspecialchars($port) ?>
                </div>
            </div>

            <div class="info-box">
                <div class="label">Database Time</div>
                <div class="value">
                    <?= htmlspecialchars($dbTime) ?>
                </div>
            </div>
        </div>

    <?php else: ?>

        <div class="status error">
            <span class="pulse red"></span>
            Connection Failed
        </div>

        <div class="info-box" style="margin-top:20px;">
            <div class="label">Error Details</div>
            <div class="value">
                <?= htmlspecialchars($message) ?>
            </div>
        </div>

    <?php endif; ?>

    <div class="footer">
        PostgreSQL Connection Health Check • Powered by PHP
    </div>

</div>

</body>
</html>