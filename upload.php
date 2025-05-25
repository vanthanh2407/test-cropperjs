<?php
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_FILES['image'])) {
    $uploadDir = 'uploads/';
    $fileName = uniqid() . '.jpg';
    $targetPath = $uploadDir . $fileName;
    
    // Kiểm tra và tạo thư mục nếu chưa tồn tại
    if (!file_exists($uploadDir)) {
        mkdir($uploadDir, 0777, true);
    }
    
    // Lấy dữ liệu ảnh từ base64 (nếu gửi từ cropper)
    if (isset($_POST['croppedImage'])) {
        $imageData = $_POST['croppedImage'];
        $imageData = str_replace('data:image/jpeg;base64,', '', $imageData);
        $imageData = str_replace(' ', '+', $imageData);
        $data = base64_decode($imageData);
        
        file_put_contents($targetPath, $data);
        echo json_encode(['success' => true, 'imagePath' => $targetPath]);
    } 
    // Hoặc xử lý file upload thông thường
    elseif (move_uploaded_file($_FILES['image']['tmp_name'], $targetPath)) {
        echo json_encode(['success' => true, 'imagePath' => $targetPath]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Upload failed']);
    }
} else {
    echo json_encode(['success' => false, 'message' => 'Invalid request']);
}


?>