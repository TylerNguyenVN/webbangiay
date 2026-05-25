document.addEventListener("DOMContentLoaded", () => {
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
  
  const DB_KEY = "nike_users_db";
  
  if (!localStorage.getItem(DB_KEY)) {
    const initialUsers = [
      {
        id: "usr_1",
        name: "Quản trị viên",
        email: "admin@nike.com",
        password: "admin123", 
        role: "admin"
      }
    ];
    localStorage.setItem(DB_KEY, JSON.stringify(initialUsers));
  }
  
  const getUsers = () => JSON.parse(localStorage.getItem(DB_KEY)) || [];
  const saveUsers = (users) => localStorage.setItem(DB_KEY, JSON.stringify(users));

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

  const registerForm = document.getElementById("register-form");
  if (registerForm) {
    registerForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      
      const name = document.getElementById("register-name").value.trim();
      const email = document.getElementById("register-email").value.trim();
      const pass = document.getElementById("register-password").value;
      const repass = document.getElementById("register-repassword").value;
      const phone = document.getElementById("register-phone") ? document.getElementById("register-phone").value.trim() : "";
      const address = document.getElementById("register-address") ? document.getElementById("register-address").value.trim() : "";
      
      if (pass !== repass) {
        return showNotification("Mật khẩu xác nhận không khớp!", "info");
      }
      
      try {
        // Gọi API PHP thay vì lưu LocalStorage
        const response = await fetch("register.php", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            username: name,
            email: email,
            password: pass,
            phone: phone,
            address: address
          })
        });

        const data = await response.json();

        if (response.ok && data.success) {
          showNotification(data.message || "Đăng ký thành công! Vui lòng đăng nhập.", "success");
          setTimeout(() => {
            registerForm.reset();
            registerWrapper.classList.remove("active");
            loginWrapper.classList.add("active");
          }, 1500);
        } else {
          showNotification(data.message || "Lỗi khi đăng ký!", "info");
        }
      } catch (error) {
        console.error("Lỗi kết nối API:", error);
        showNotification("Lỗi kết nối đến máy chủ!", "info");
      }
    });
  }

  const loginForm = document.getElementById("login-form");
  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      
      const email = document.getElementById("login-email").value.trim();
      const pass = document.getElementById("login-password").value;
      
      try {
        const response = await fetch("login.php", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ email: email, password: pass })
        });
        
        const data = await response.json();
        
        if (response.ok && data.success) {
          const user = data.user;
          const sessionUser = { 
            id: user.id, 
            name: user.username, 
            email: user.email, 
            phone: user.phone,
            address: user.address,
            role: user.role 
          };
          localStorage.setItem("nike_current_user", JSON.stringify(sessionUser));
          
          showNotification(`Đăng nhập thành công! Chào mừng ${user.username}`, "success");
          
          setTimeout(() => {
            if (user.role === "admin") {
              window.location.href = "admin.html";
            } else {
              window.location.href = "index.html";
            }
          }, 1000);
        } else {
          showNotification(data.message || "Sai email hoặc mật khẩu!", "info");
        }
      } catch (error) {
        console.error("Lỗi kết nối API:", error);
        showNotification("Lỗi kết nối đến máy chủ!", "info");
      }
    });
  }

  // Toggle password visibility
  const togglePasswordBtns = document.querySelectorAll(".toggle-password");
  togglePasswordBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      const input = btn.previousElementSibling;
      if (input && (input.type === "password" || input.type === "text")) {
        if (input.type === "password") {
          input.type = "text";
          btn.innerHTML = '<i data-lucide="eye-off"></i>';
        } else {
          input.type = "password";
          btn.innerHTML = '<i data-lucide="eye"></i>';
        }
        if (window.lucide) {
          window.lucide.createIcons();
        }
      }
    });
  });

});

// Hàm callback nhận JWT token từ Google
window.handleGoogleCredentialResponse = async (response) => {
  const credential = response.credential;
  
  try {
    const res = await fetch("google_login.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ credential })
    });
    
    const data = await res.json();
    
    if (res.ok && data.success) {
      const user = data.user;
      const sessionUser = { 
        id: user.id, 
        name: user.username, 
        email: user.email, 
        phone: user.phone,
        address: user.address,
        role: user.role 
      };
      localStorage.setItem("nike_current_user", JSON.stringify(sessionUser));
      
      // Hiển thị thông báo (nếu có container)
      const container = document.getElementById("notification-container");
      if (container) {
        const notif = document.createElement("div");
        notif.className = `notification success`;
        notif.innerHTML = `<i data-lucide="check-circle" class="icon-success"></i> <span>Đăng nhập Google thành công! Chào mừng ${user.username}</span>`;
        container.appendChild(notif);
        if(window.lucide) window.lucide.createIcons();
        setTimeout(() => notif.remove(), 3000);
      } else {
        alert(`Đăng nhập Google thành công! Chào mừng ${user.username}`);
      }
      
      setTimeout(() => {
        if (user.role === "admin") {
          window.location.href = "admin.html";
        } else {
          window.location.href = "index.html";
        }
      }, 1000);
    } else {
      alert(data.message || "Lỗi đăng nhập Google!");
    }
  } catch (error) {
    console.error("Lỗi gọi API Google Login:", error);
    alert("Lỗi kết nối máy chủ khi đăng nhập Google!");
  }
};
