<?php
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Create date-based directory structure
    $baseUploadDir = 'uploads/';
    $dateFolder = date('Y-m-d');
    $uploadDir = $baseUploadDir . $dateFolder . '/';
    
    $fileName = uniqid() . '.jpg';
    $targetPath = $uploadDir . $fileName;
    
    // Create base uploads directory if it doesn't exist
    if (!file_exists($baseUploadDir)) {
        mkdir($baseUploadDir, 0777, true);
    }
    
    // Create date-based directory if it doesn't exist
    if (!file_exists($uploadDir)) {
        mkdir($uploadDir, 0777, true);
    }
    
    // Handle base64 image data from cropper
    if (isset($_POST['croppedImage'])) {
        $imageData = $_POST['croppedImage'];
        
        // Extract the base64 data
        if (preg_match('/^data:image\/(\w+);base64,/', $imageData, $type)) {
            $imageData = substr($imageData, strpos($imageData, ',') + 1);
            $type = strtolower($type[1]); // jpg, png, gif

            if ($type != 'jpeg' && $type != 'jpg') {
                echo json_encode([
                    'success' => false,
                    'message' => 'Invalid image type. Only JPEG/JPG is allowed.'
                ]);
                exit;
            }

            $imageData = base64_decode($imageData);

            if ($imageData === false) {
                echo json_encode([
                    'success' => false,
                    'message' => 'Failed to decode image data'
                ]);
                exit;
            }
        } else {
            echo json_encode([
                'success' => false,
                'message' => 'Invalid image format'
            ]);
            exit;
        }
        
        if (file_put_contents($targetPath, $imageData)) {
            echo json_encode([
                'success' => true, 
                'imagePath' => $targetPath,
                'message' => 'Image uploaded successfully'
            ]);
        } else {
            echo json_encode([
                'success' => false, 
                'message' => 'Failed to save image'
            ]);
        }
    } else {
        echo json_encode([
            'success' => false,
            'message' => 'No image data received'
        ]);
    }
} else {
    echo json_encode([
        'success' => false,
        'message' => 'Invalid request method. Only POST is allowed.'
    ]);
}
?>