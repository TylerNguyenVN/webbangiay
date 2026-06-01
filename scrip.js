// NÚT ĐẶT HÀNG

let buyButtons = document.querySelectorAll(".buy");

buyButtons.forEach(button => {

    button.addEventListener("click", function(){

        alert("Đặt hàng thành công!");

    });

});

// NÚT XÓA

let deleteButtons = document.querySelectorAll(".delete");

deleteButtons.forEach(button => {

    button.addEventListener("click", function(){

        let confirmDelete = confirm("Bạn có chắc muốn xóa không?");

        if(confirmDelete){
            alert("Đã xóa sản phẩm!");
        }

    });

});

// NÚT SỬA

let editButtons = document.querySelectorAll(".edit");

editButtons.forEach(button => {

    button.addEventListener("click", function(){

        alert("Chức năng sửa sản phẩm!");

    });

});
```
