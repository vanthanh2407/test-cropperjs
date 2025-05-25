document.addEventListener('DOMContentLoaded', function() {
    const fileInput = document.getElementById('file-input');
    const imagePreview = document.getElementById('image-preview');
    const imageContainer = document.getElementById('image-container');
    const cropBtn = document.getElementById('crop-btn');
    const cancelBtn = document.getElementById('cancel-btn');
    const croppedResult = document.getElementById('cropped-result');
    const croppedImage = document.getElementById('cropped-image');
    const downloadBtn = document.getElementById('download-btn');
    const uploadSection = document.querySelector('.upload-section');
    const ratioSelect = document.getElementById('ratio-select');
    
    // Cấu hình kích thước
    const arrInitCropper = {
        '1:1': {width: 448, height: 448},
        '1:2': {width: 300, height: 600},
        '16:9': {width: 448, height: 252},
        '9:16': {width: 300, height: 533}
    };
    
    const arrImage = {
        '1:1': {width: 720, height: 720},
        '1:2': {width: 300, height: 600},
        '16:9': {width: 1280, height: 720},
        '9:16': {width: 720, height: 1280}
    };
    
    let cropper;
    let currentRatio = ratioSelect.value;
    let originalImageData = null;
    
    // Xử lý khi thay đổi tỷ lệ
    ratioSelect.addEventListener('change', function() {
        currentRatio = this.value;
        if (originalImageData) {
            applyRatioToImage();
        }
    });
    
    // Hàm scale ảnh theo tỷ lệ
    function applyRatioToImage() {
        const ratioParts = currentRatio.split(':');
        const targetAspect = parseInt(ratioParts[0]) / parseInt(ratioParts[1]);
        const imgAspect = originalImageData.width / originalImageData.height;
        
        let newWidth, newHeight;
        
        // Scale ảnh để phù hợp với tỷ lệ mong muốn
        if (targetAspect > imgAspect) {
            // Tỷ lệ đích rộng hơn ảnh gốc (scale theo height)
            newHeight = originalImageData.height;
            newWidth = newHeight * targetAspect;
        } else {
            // Tỷ lệ đích cao hơn ảnh gốc (scale theo width)
            newWidth = originalImageData.width;
            newHeight = newWidth / targetAspect;
        }
        
        // Tạo canvas để scale ảnh
        const scaleCanvas = document.createElement('canvas');
        scaleCanvas.width = newWidth;
        scaleCanvas.height = newHeight;
        const ctx = scaleCanvas.getContext('2d');
        
        // Vẽ ảnh đã scale
        ctx.drawImage(
            originalImageData.image, 
            (newWidth - originalImageData.width) / 2, 
            (newHeight - originalImageData.height) / 2,
            originalImageData.width,
            originalImageData.height
        );
        
        // Hiển thị ảnh đã scale
        imagePreview.src = scaleCanvas.toDataURL('image/jpeg');
        
        // Khởi tạo cropper sau khi ảnh load
        imagePreview.onload = function() {
            initCropper();
        };
    }
    
    // Hàm khởi tạo Cropper
    function initCropper() {
        if (cropper) {
            cropper.destroy();
        }
        
        const ratioParts = currentRatio.split(':');
        const aspectRatio = parseInt(ratioParts[0]) / parseInt(ratioParts[1]);
        const cropSize = arrInitCropper[currentRatio];
        
        cropper = new Cropper(imagePreview, {
            aspectRatio: aspectRatio,
            viewMode: 1,
            autoCropArea: 0.8,
            responsive: true,
            guides: true,
            ready: function() {
                const containerData = cropper.getContainerData();
                const cropBoxWidth = Math.min(cropSize.width, containerData.width);
                const cropBoxHeight = cropBoxWidth / aspectRatio;
                
                cropper.setCropBoxData({
                    width: cropBoxWidth,
                    height: cropBoxHeight,
                    left: (containerData.width - cropBoxWidth) / 2,
                    top: (containerData.height - cropBoxHeight) / 2
                });
            }
        });
    }
    
    // Xử lý khi chọn file
    fileInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            
            reader.onload = function(event) {
                // Tạo image object để lấy kích thước gốc
                const img = new Image();
                img.onload = function() {
                    originalImageData = {
                        image: img,
                        width: img.width,
                        height: img.height
                    };
                    
                    imageContainer.style.display = 'block';
                    applyRatioToImage();
                };
                img.src = event.target.result;
            };
            
            reader.readAsDataURL(file);
        }
    });
    
    // Xử lý kéo thả ảnh (giữ nguyên)
    uploadSection.addEventListener('dragover', function(e) {
        e.preventDefault();
        uploadSection.style.borderColor = '#4CAF50';
    });
    
    uploadSection.addEventListener('dragleave', function() {
        uploadSection.style.borderColor = '#ccc';
    });
    
    uploadSection.addEventListener('drop', function(e) {
        e.preventDefault();
        uploadSection.style.borderColor = '#ccc';
        
        const file = e.dataTransfer.files[0];
        if (file && file.type.match('image.*')) {
            fileInput.files = e.dataTransfer.files;
            const event = new Event('change');
            fileInput.dispatchEvent(event);
        }
    });
    
    // Xử lý nút Crop
    cropBtn.addEventListener('click', function() {
        if (cropper) {
            const outputSize = arrImage[currentRatio];
            
            // Lấy vùng đã crop (không scale ở bước này)
            const canvas = cropper.getCroppedCanvas();
            
            if (canvas) {
                // Tạo canvas đầu ra với kích thước mong muốn
                const outputCanvas = document.createElement('canvas');
                outputCanvas.width = outputSize.width;
                outputCanvas.height = outputSize.height;
                const ctx = outputCanvas.getContext('2d');
                
                // Scale ảnh đã crop lên kích thước đầu ra
                var a = ctx.drawImage(canvas, 0, 0, outputSize.width, outputSize.height);
                console.log('a:', canvas, outputSize.width, outputSize.height)
                // Hiển thị kết quả
                croppedImage.src = outputCanvas.toDataURL('image/jpeg', 0.9);
                croppedResult.style.display = 'block';
                croppedResult.scrollIntoView({ behavior: 'smooth' });
            }
        }
    });
    
    // Xử lý nút Hủy (giữ nguyên)
    cancelBtn.addEventListener('click', function() {
        imageContainer.style.display = 'none';
        croppedResult.style.display = 'none';
        fileInput.value = '';
        originalImageData = null;
        if (cropper) {
            cropper.destroy();
            cropper = null;
        }
    });
    
    // Xử lý nút Tải ảnh về
    downloadBtn.addEventListener('click', function() {
        const outputSize = arrImage[currentRatio];
        const link = document.createElement('a');
        link.download = `anh-da-crop-${outputSize.width}x${outputSize.height}.jpg`;
        link.href = croppedImage.src;
        link.click();
    });
});