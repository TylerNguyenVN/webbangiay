<?php
// Điều hướng mượt mà - không redirect 302, mà include trực tiếp
// để URL trên trình duyệt vẫn giữ nguyên http://localhost/webbangiay/
chdir(__DIR__ . '/views');
include __DIR__ . '/views/index.html';
