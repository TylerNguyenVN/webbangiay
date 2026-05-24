// auth.js
document.addEventListener("DOMContentLoaded", () => {
  // Apply saved theme
  let currentTheme = localStorage.getItem("nike_theme") || "dark";
  const authThemeToggle = document.getElementById("auth-theme-toggle");
  
  const applyTheme = (theme) => {
    if (theme === "light") {
      document.body.classList.add("light-theme");
      if(authThemeToggle) authThemeToggle.innerHTML = '<i data-lucide="moon"></i>';
    } else {
      document.body.classList.remove("light-theme");
      if(authThemeToggle) authThemeToggle.innerHTML = '<i data-lucide="sun"></i>';
    }
    if(window.lucide) window.lucide.createIcons();
  };

  applyTheme(currentTheme);

  if (authThemeToggle) {
    authThemeToggle.addEventListener("click", () => {
      currentTheme = currentTheme === "light" ? "dark" : "light";
      localStorage.setItem("nike_theme", currentTheme);
      applyTheme(currentTheme);
    });
  }
  
  // ==========================================
  // 1. MOCK DATABASE SETUP (LocalStorage)
  // ==========================================
  const DB_KEY = "nike_users_db";
  
  // Khởi tạo Database nếu chưa có
  if (!localStorage.getItem(DB_KEY)) {
    const initialUsers = [
      {
        id: "usr_1",
        name: "Quản trị viên",
        email: "admin@nike.com",
        password: "admin123", // Trong thực tế phải mã hóa
        role: "admin"
      }
    ];
    localStorage.setItem(DB_KEY, JSON.stringify(initialUsers));
  }
  
  const getUsers = () => JSON.parse(localStorage.getItem(DB_KEY)) || [];
  const saveUsers = (users) => localStorage.setItem(DB_KEY, JSON.stringify(users));

  // Hàm Notification (tái sử dụng)
  function showNotification(message, type = "info") {
    const container = document.getElementById("notification-container");
    if (!container) return;
    
    const notif = document.createElement("div");
    notif.className = `notification ${type}`;
    
    const icon = type === "success" 
      ? '<i data-lucide="check-circle" class="icon-success"></i>' 
      : '<i data-lucide="info" class="icon-info"></i>';
      
    notif.innerHTML = `${icon} <span>${message}</span>`;
    container.appendChild(notif);
    if(window.lucide) lucide.createIcons();
    
    setTimeout(() => {
      notif.style.opacity = "0";
      notif.style.transform = "translateY(20px)";
      setTimeout(() => notif.remove(), 300);
    }, 3000);
  }

  // ==========================================
  // 2. UI TOGGLE LOGIC
  // ==========================================
  const loginWrapper = document.getElementById("login-form-wrapper");
  const registerWrapper = document.getElementById("register-form-wrapper");
  const goToRegister = document.getElementById("go-to-register");
  const goToLogin = document.getElementById("go-to-login");

  if (goToRegister && goToLogin) {
    goToRegister.addEventListener("click", (e) => {
      e.preventDefault();
      loginWrapper.classList.remove("active");
      registerWrapper.classList.add("active");
    });

    goToLogin.addEventListener("click", (e) => {
      e.preventDefault();
      registerWrapper.classList.remove("active");
      loginWrapper.classList.add("active");
    });
  }

  // ==========================================
  // 3. REGISTER LOGIC
  // ==========================================
  const registerForm = document.getElementById("register-form");
  if (registerForm) {
    registerForm.addEventListener("submit", (e) => {
      e.preventDefault();
      
      const name = document.getElementById("register-name").value.trim();
      const email = document.getElementById("register-email").value.trim();
      const pass = document.getElementById("register-password").value;
      const repass = document.getElementById("register-repassword").value;
      
      if (pass !== repass) {
        return showNotification("Mật khẩu xác nhận không khớp!", "info");
      }
      
      const users = getUsers();
      if (users.find(u => u.email === email)) {
        return showNotification("Email này đã được đăng ký!", "info");
      }
      
      const newUser = {
        id: "usr_" + Date.now(),
        name: name,
        email: email,
        password: pass,
        role: "customer"
      };
      
      users.push(newUser);
      saveUsers(users);
      
      showNotification("Đăng ký thành công! Vui lòng đăng nhập.", "success");
      
      // Chuyển sang form đăng nhập sau 1.5s
      setTimeout(() => {
        registerForm.reset();
        registerWrapper.classList.remove("active");
        loginWrapper.classList.add("active");
      }, 1500);
    });
  }

  // ==========================================
  // 4. LOGIN LOGIC
  // ==========================================
  const loginForm = document.getElementById("login-form");
  if (loginForm) {
    loginForm.addEventListener("submit", (e) => {
      e.preventDefault();
      
      const email = document.getElementById("login-email").value.trim();
      const pass = document.getElementById("login-password").value;
      
      const users = getUsers();
      const user = users.find(u => u.email === email && u.password === pass);
      
      if (!user) {
        return showNotification("Sai email hoặc mật khẩu!", "info");
      }
      
      // Lưu phiên đăng nhập
      // Xóa password trước khi lưu vào phiên để bảo mật
      const sessionUser = { id: user.id, name: user.name, email: user.email, role: user.role };
      localStorage.setItem("nike_current_user", JSON.stringify(sessionUser));
      
      showNotification(`Đăng nhập thành công! Chào mừng ${user.name}`, "success");
      
      // Redirect based on role
      setTimeout(() => {
        if (user.role === "admin") {
          window.location.href = "admin.html";
        } else {
          window.location.href = "index.html";
        }
      }, 1000);
      
    });
  }

});
