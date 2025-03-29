<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Database configuration
$db_config = [
    'host' => 'localhost',
    'dbname' => 'api_manager',
    'username' => 'your_username',
    'password' => 'your_password'
];

try {
    $pdo = new PDO(
        "mysql:host={$db_config['host']};dbname={$db_config['dbname']}",
        $db_config['username'],
        $db_config['password'],
        [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
    );
} catch (PDOException $e) {
    error_log($e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Database connection failed']);
    exit;
}

$method = $_SERVER['REQUEST_METHOD'];
$request = explode('/', trim($_SERVER['PATH_INFO'] ?? '', '/'));
$endpoint = $request[0] ?? '';

switch ($method) {
    case 'GET':
        switch ($endpoint) {
            case 'endpoints':
                getPublicEndpoints();
                break;
                
            case 'test':
                testEndpoint();
                break;
                
            default:
                http_response_code(404);
                echo json_encode(['error' => 'Endpoint not found']);
        }
        break;

    case 'POST':
        switch ($endpoint) {
            case 'test':
                testEndpoint();
                break;
                
            default:
                http_response_code(404);
                echo json_encode(['error' => 'Endpoint not found']);
        }
        break;

    default:
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
}

function getPublicEndpoints() {
    global $pdo;
    try {
        $stmt = $pdo->query("
            SELECT 
                id,
                title,
                description,
                method,
                url,
                headers,
                parameters,
                response_format,
                is_public,
                created_at,
                updated_at
            FROM api_endpoints 
            WHERE is_public = 1 
            ORDER BY created_at DESC
        ");
        
        $endpoints = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Format the endpoints for front-end display
        $formatted_endpoints = array_map(function($endpoint) {
            return [
                'title' => $endpoint['title'],
                'description' => $endpoint['description'],
                'method' => $endpoint['method'],
                'color' => getMethodColor($endpoint['method']),
                'url' => $endpoint['url'],
                'headers' => json_decode($endpoint['headers'], true),
                'params' => json_decode($endpoint['parameters'], true),
                'responseFormat' => json_decode($endpoint['response_format'], true)
            ];
        }, $endpoints);

        echo json_encode(['data' => $formatted_endpoints]);
    } catch (PDOException $e) {
        error_log($e->getMessage());
        http_response_code(500);
        echo json_encode(['error' => 'Could not fetch endpoints']);
    }
}

function testEndpoint() {
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($data['url']) || !isset($data['method'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Missing required fields']);
        return;
    }

    // Log the test request
    logAPITest($data);

    $ch = curl_init($data['url']);
    curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $data['method']);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    
    if (isset($data['headers'])) {
        curl_setopt($ch, CURLOPT_HTTPHEADER, $data['headers']);
    }
    
    if (isset($data['body']) && in_array($data['method'], ['POST', 'PUT', 'PATCH'])) {
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data['body']));
    }

    $start_time = microtime(true);
    $response = curl_exec($ch);
    $end_time = microtime(true);
    
    $status_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $response_time = round(($end_time - $start_time) * 1000, 2); // Convert to milliseconds
    
    curl_close($ch);

    echo json_encode([
        'status_code' => $status_code,
        'response' => json_decode($response, true),
        'response_time' => $response_time
    ]);
}

function logAPITest($data) {
    global $pdo;
    try {
        $stmt = $pdo->prepare("
            INSERT INTO api_test_logs (
                endpoint_url, 
                method, 
                request_headers, 
                request_body, 
                timestamp
            ) VALUES (?, ?, ?, ?, NOW())
        ");
        
        $stmt->execute([
            $data['url'],
            $data['method'],
            json_encode($data['headers'] ?? []),
            json_encode($data['body'] ?? null)
        ]);
    } catch (PDOException $e) {
        error_log("Failed to log API test: " . $e->getMessage());
    }
}

function getMethodColor($method) {
    return [
        'GET' => 'blue',
        'POST' => 'green',
        'PUT' => 'yellow',
        'DELETE' => 'red',
        'PATCH' => 'purple'
    ][$method] ?? 'gray';
}
