const express = require('express');
const app = express();
const sql = require('mssql');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const cors = require('cors');
const bcrypt = require('bcrypt');

app.use(express.json());
app.use(cors());

// Cấu hình Multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, 'uploads'));
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// Cấu hình kết nối cơ sở dữ liệu
const config = {
    user: 'sa',
    password: '123456',
    server: 'NGHIEM_IT',
    database: 'FRESHFOOD',
    options: {
        trustServerCertificate: true,
        trustedConnection: false,
        enableArithAbort: true,
        instancename: 'SQLEXPRESS',
    },
    port: 1433
};

const getDbConnection = async () => {
    try {
        const pool = await sql.connect(config);
        return pool;
    } catch (err) {
        console.error('Database connection error:', err);
        throw err;
    }
};

// Endpoint để upload hình ảnh
app.post('/upload', upload.single('image'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
    }
    res.json({
        success: true,
        image_url: req.file.filename  // Chỉ cần phần tên file
    });
});

// Endpoint để đăng ký người dùng
app.post('/register', async (req, res) => {
    const { username, password, email, full_name } = req.body;
    const role = 'customer';

    if (!username || !password || !email || !full_name) {
        return res.status(400).json({ message: 'Missing required fields' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    try {
        const pool = await getDbConnection();
        await pool.request()
            .input('username', sql.VarChar, username)
            .input('password', sql.VarChar, hashedPassword)
            .input('email', sql.VarChar, email)
            .input('full_name', sql.VarChar, full_name)
            .input('role', sql.VarChar, role)
            .query('INSERT INTO Users (username, password, email, full_name, role) VALUES (@username, @password, @email, @full_name, @role)');

        res.status(201).json({ message: 'User registered successfully' });
    } catch (err) {
        console.error('Registration error:', err);
        res.status(500).json({ message: 'Error registering user' });
    }
});

// Endpoint để đăng nhập người dùng
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ message: 'Missing username or password' });
    }

    try {
        const pool = await getDbConnection();
        const result = await pool.request()
            .input('username', sql.VarChar, username)
            .query('SELECT * FROM Users WHERE username = @username');

        const user = result.recordset[0];
        if (!user) {
            return res.status(401).json({ message: 'Invalid username or password' });
        }

        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            return res.status(401).json({ message: 'Invalid username or password' });
        }

        const token = jwt.sign({ userId: user.user_id, role: user.role }, 'your_jwt_secret', { expiresIn: '1h' });
        res.json({ token });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ message: 'Error logging in' });
    }
});

// Endpoint để thêm sản phẩm
app.post('/addproducts', async (req, res) => {
    const { product_name, category_id, price, quantity, is_fresh, description, hsd, image_url } = req.body;

    if (!product_name || !price || !quantity || is_fresh === undefined || !hsd) {
        return res.status(400).json({ message: 'Missing required fields' });
    }

    try {
        const pool = await getDbConnection();
        await pool.request()
            .input('product_name', sql.VarChar, product_name)
            .input('category_id', sql.Int, category_id)
            .input('price', sql.Decimal, price)
            .input('quantity', sql.Int, quantity)
            .input('is_fresh', sql.Bit, is_fresh)
            .input('description', sql.Text, description)
            .input('hsd', sql.DateTime, hsd)
            .input('image_url', sql.VarChar, image_url)
            .query('INSERT INTO Products (product_name, category_id, price, quantity, is_fresh, description, hsd, image_url) VALUES (@product_name, @category_id, @price, @quantity, @is_fresh, @description, @hsd, @image_url)');

        res.status(201).json({ message: 'Product added successfully' });
    } catch (err) {
        console.error('Error adding product:', err);
        res.status(500).json({ message: 'Error adding product' });
    }
});


app.get('/products', async (req, res) => {
    try {
        const { sort } = req.query;
        let query = 'SELECT * FROM Products WHERE is_fresh = 1';

        if (sort === 'asc') {
            query += ' ORDER BY price ASC';
        } else if (sort === 'desc') {
            query += ' ORDER BY price DESC'; 
        }

        const pool = await getDbConnection();
        const result = await pool.request().query(query);

        res.json(result.recordset);
    } catch (err) {
        console.error('Error fetching products:', err);
        res.status(500).json({ message: 'Error fetching products' });
    }
});

// Endpoint để lấy tất cả sản phẩm (cho admin)
app.get('/admin/products', async (req, res) => {
    try {
        const pool = await getDbConnection();
        const result = await pool.request()
            .query('SELECT * FROM Products');

        res.json(result.recordset);
    } catch (err) {
        console.error('Error fetching products for admin:', err);
        res.status(500).json({ message: 'Error fetching products for admin' });
    }
});

// Endpoint để lấy danh mục sản phẩm
app.get('/categories', async (req, res) => {
    try {
        const pool = await getDbConnection();
        const result = await pool.request()
            .query('SELECT * FROM Categories');

        res.json(result.recordset);
    } catch (err) {
        console.error('Error fetching categories:', err);
        res.status(500).json({ message: 'Error fetching categories' });
    }
});

// Cung cấp tệp tĩnh cho hình ảnh
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Endpoint để xóa sản phẩm
app.post('/removeproducts', async (req, res) => {
    const { product_id } = req.body;

    if (!product_id) {
        return res.status(400).json({ message: 'Product ID is required' });
    }

    try {
        const pool = await getDbConnection();
        await pool.request()
            .input('product_id', sql.Int, product_id)
            .query('DELETE FROM Products WHERE product_id = @product_id');
        res.json({ message: 'Product removed successfully' });
    } catch (err) {
        console.error('Error removing product:', err);
        res.status(500).json({ message: 'Error removing product' });
    }
});

app.get('/products/:id', async (req, res) => {
    const productId = parseInt(req.params.id, 10);

    try {
        const pool = await getDbConnection();
        const result = await pool.request()
            .input('product_id', sql.Int, productId)
            .query('SELECT * FROM Products WHERE product_id = @product_id');

        if (result.recordset.length > 0) {
            res.status(200).json(result.recordset[0]);
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (err) {
        console.error('Error fetching product:', err);
        res.status(500).json({ message: 'Error fetching product' });
    }
});


  app.post('/add-to-cart', async (req, res) => {
    const { product_id, quantity } = req.body;
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
        const decoded = jwt.verify(token, 'your_jwt_secret');
        const user_id = decoded.userId;

        const pool = await getDbConnection();

        // Kiểm tra xem người dùng đã có giỏ hàng chưa
        let cartResult = await pool.request()
            .input('user_id', sql.Int, user_id)
            .query('SELECT * FROM Carts WHERE user_id = @user_id');

        let cart_id;
        if (cartResult.recordset.length > 0) {
            // Nếu đã có giỏ hàng, lấy cart_id
            cart_id = cartResult.recordset[0].cart_id;
        } else {
            // Nếu chưa có giỏ hàng, tạo mới
            let createCartResult = await pool.request()
                .input('user_id', sql.Int, user_id)
                .query('INSERT INTO Carts (user_id) OUTPUT INSERTED.cart_id VALUES (@user_id)');

            cart_id = createCartResult.recordset[0].cart_id;
        }

        // Kiểm tra xem sản phẩm đã tồn tại trong giỏ hàng chưa
        let cartDetailResult = await pool.request()
            .input('cart_id', sql.Int, cart_id)
            .input('product_id', sql.Int, product_id)
            .query('SELECT * FROM CartDetails WHERE cart_id = @cart_id AND product_id = @product_id');

        if (cartDetailResult.recordset.length > 0) {
            // Nếu sản phẩm đã tồn tại trong giỏ hàng, cập nhật số lượng
            await pool.request()
                .input('cart_id', sql.Int, cart_id)
                .input('product_id', sql.Int, product_id)
                .input('quantity', sql.Int, quantity)
                .query('UPDATE CartDetails SET quantity = quantity + @quantity WHERE cart_id = @cart_id AND product_id = @product_id');
        } else {
            // Nếu sản phẩm chưa tồn tại trong giỏ hàng, thêm mới
            let productResult = await pool.request()
                .input('product_id', sql.Int, product_id)
                .query('SELECT price FROM Products WHERE product_id = @product_id');
            
            const price = productResult.recordset[0]?.price;

            if (price === undefined) {
                return res.status(404).json({ message: 'Product not found' });
            }

            await pool.request()
                .input('cart_id', sql.Int, cart_id)
                .input('product_id', sql.Int, product_id)
                .input('quantity', sql.Int, quantity)
                .input('price', sql.Decimal, price)
                .query('INSERT INTO CartDetails (cart_id, product_id, quantity, price) VALUES (@cart_id, @product_id, @quantity, @price)');
        }

        res.status(200).json({ message: 'Product added to cart successfully' });
    } catch (err) {
        console.error('Error adding to cart:', err);
        res.status(500).json({ message: 'Error adding to cart' });
    }
});

app.post('/getcart', async (req, res) => {
    const token = req.headers['auth-token'];
    if (!token) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
  
    try {
      const decoded = jwt.verify(token, 'your_jwt_secret');
      const user_id = decoded.userId;
  
      const pool = await getDbConnection();
      let cartResult = await pool.request()
        .input('user_id', sql.Int, user_id)
        .query('SELECT cart_id FROM Carts WHERE user_id = @user_id');
  
      let cart_id;
      if (cartResult.recordset.length > 0) {
        cart_id = cartResult.recordset[0].cart_id;
      } else {
        return res.json({});
      }
  
      const cartDetailsResult = await pool.request()
        .input('cart_id', sql.Int, cart_id)
        .query('SELECT * FROM CartDetails WHERE cart_id = @cart_id');
  
      const cartItems = {};
      for (const item of cartDetailsResult.recordset) {
        cartItems[item.product_id] = item.quantity;
      }
  
      res.json(cartItems);
    } catch (err) {
      console.error('Error fetching cart:', err); // Log chi tiết lỗi
      res.status(500).json({ message: 'Error fetching cart' });
    }
  });
  
  app.post('/remove-from-cart', async (req, res) => {
    const { product_id } = req.body;
    const token = req.headers['auth-token'];

    if (!token) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    if (!product_id) {
        return res.status(400).json({ message: 'Product ID is required' });
    }

    try {
        const decoded = jwt.verify(token, 'your_jwt_secret');
        const user_id = decoded.userId;

        const pool = await getDbConnection();

        // Kiểm tra xem người dùng có giỏ hàng không
        let cartResult = await pool.request()
            .input('user_id', sql.Int, user_id)
            .query('SELECT cart_id FROM Carts WHERE user_id = @user_id');

        if (cartResult.recordset.length === 0) {
            return res.status(404).json({ message: 'Cart not found' });
        }

        const cart_id = cartResult.recordset[0].cart_id;

        // Xóa sản phẩm khỏi giỏ hàng
        await pool.request()
            .input('cart_id', sql.Int, cart_id)
            .input('product_id', sql.Int, product_id)
            .query('DELETE FROM CartDetails WHERE cart_id = @cart_id AND product_id = @product_id');

        res.json({ message: 'Product removed from cart successfully' });
    } catch (err) {
        console.error('Error removing from cart:', err);
        res.status(500).json({ message: 'Error removing from cart' });
    }
});

// Endpoint thanh toán
app.post('/checkout', async (req, res) => {
    const { phoneNumber, address, promo_id } = req.body;
    const token = req.headers['auth-token'];

    if (!token) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    if (!phoneNumber || !address) {
        return res.status(400).json({ message: 'Phone number and address are required' });
    }

    try {
        const decoded = jwt.verify(token, 'your_jwt_secret');
        const user_id = decoded.userId;

        const pool = await getDbConnection();

        // Kiểm tra giỏ hàng của người dùng
        const cartResult = await pool.request()
            .input('user_id', sql.Int, user_id)
            .query('SELECT cart_id FROM Carts WHERE user_id = @user_id');

        if (cartResult.recordset.length === 0) {
            return res.status(404).json({ message: 'Cart not found' });
        }

        const cart_id = cartResult.recordset[0].cart_id;

        // Lấy chi tiết giỏ hàng
        const cartDetailsResult = await pool.request()
            .input('cart_id', sql.Int, cart_id)
            .query('SELECT * FROM CartDetails WHERE cart_id = @cart_id');

        const cartDetails = cartDetailsResult.recordset;

        if (cartDetails.length === 0) {
            return res.status(400).json({ message: 'Cart is empty' });
        }

        // Kiểm tra tính hợp lệ của promo_id
        if (promo_id) {
            const promoResult = await pool.request()
                .input('promo_id', sql.Int, promo_id)
                .query('SELECT promo_id FROM Promotions WHERE promo_id = @promo_id');

            if (promoResult.recordset.length === 0) {
                return res.status(400).json({ message: 'Invalid promo code' });
            }
        }

        // Tính tổng số tiền đơn hàng
        const totalAmount = cartDetails.reduce((acc, item) => acc + (item.price * item.quantity), 0);

        // Tạo đơn hàng mới
        const orderResult = await pool.request()
            .input('user_id', sql.Int, user_id)
            .input('order_date', sql.DateTime, new Date())
            .input('total_amount', sql.Decimal, totalAmount)
            .input('status', sql.VarChar, 'Pending')
            .input('promo_id', sql.Int, promo_id) // Thêm promo_id vào đây
            .query('INSERT INTO Orders (user_id, order_date, total_amount, status, promo_id) OUTPUT INSERTED.order_id VALUES (@user_id, @order_date, @total_amount, @status, @promo_id)');

        const order_id = orderResult.recordset[0].order_id;

        // Thêm chi tiết đơn hàng
        for (const item of cartDetails) {
            await pool.request()
                .input('order_id', sql.Int, order_id)
                .input('product_id', sql.Int, item.product_id)
                .input('quantity', sql.Int, item.quantity)
                .input('price', sql.Decimal, item.price)
                .query('INSERT INTO OrderDetails (order_id, product_id, quantity, price) VALUES (@order_id, @product_id, @quantity, @price)');
        }

        // Xóa giỏ hàng
        await pool.request()
            .input('cart_id', sql.Int, cart_id)
            .query('DELETE FROM CartDetails WHERE cart_id = @cart_id');
        await pool.request()
            .input('cart_id', sql.Int, cart_id)
            .query('DELETE FROM Carts WHERE cart_id = @cart_id');

        res.json({ message: 'Order placed successfully' });
    } catch (err) {
        console.error('Checkout error:', err);
        res.status(500).json({ message: 'Error processing checkout' });
    }
});


app.get('/user', async (req, res) => {
    const token = req.headers['auth-token'];

    if (!token) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
        const decoded = jwt.verify(token, 'your_jwt_secret');
        const user_id = decoded.userId;

        const pool = await getDbConnection();
        const result = await pool.request()
            .input('user_id', sql.Int, user_id)
            .query('SELECT user_id, username, email, full_name, phone, address, role, created_at, updated_at FROM Users WHERE user_id = @user_id');

        const user = result.recordset[0];
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json(user);
    } catch (err) {
        console.error('Error fetching user information:', err);
        res.status(500).json({ message: 'Error fetching user information' });
    }
});

app.put('/user', async (req, res) => {
    const token = req.headers['auth-token'];
    const { email, full_name, phone, address } = req.body;

    if (!token) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    if (!email || !full_name) {
        return res.status(400).json({ message: 'Missing required fields' });
    }

    try {
        const decoded = jwt.verify(token, 'your_jwt_secret');
        const user_id = decoded.userId;

        const pool = await getDbConnection();
        await pool.request()
            .input('user_id', sql.Int, user_id)
            .input('email', sql.VarChar, email)
            .input('full_name', sql.VarChar, full_name)
            .input('phone', sql.VarChar, phone)
            .input('address', sql.VarChar, address)
            .query('UPDATE Users SET email = @email, full_name = @full_name, phone = @phone, address = @address WHERE user_id = @user_id');

        res.json({ message: 'User information updated successfully' });
    } catch (err) {
        console.error('Error updating user information:', err);
        res.status(500).json({ message: 'Error updating user information' });
    }
});

app.post('/update-cart-quantity', async (req, res) => {
    const { product_id, quantity } = req.body;
    const token = req.headers['auth-token'];

    if (!token) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    if (!product_id || quantity === undefined) {
        return res.status(400).json({ message: 'Product ID and quantity are required' });
    }

    try {
        const decoded = jwt.verify(token, 'your_jwt_secret');
        const user_id = decoded.userId;

        const pool = await getDbConnection();

        // Kiểm tra xem người dùng có giỏ hàng không
        const cartResult = await pool.request()
            .input('user_id', sql.Int, user_id)
            .query('SELECT cart_id FROM Carts WHERE user_id = @user_id');

        if (cartResult.recordset.length === 0) {
            return res.status(404).json({ message: 'Cart not found' });
        }

        const cart_id = cartResult.recordset[0].cart_id;

        // Cập nhật số lượng sản phẩm trong giỏ hàng
        await pool.request()
            .input('cart_id', sql.Int, cart_id)
            .input('product_id', sql.Int, product_id)
            .input('quantity', sql.Int, quantity)
            .query('UPDATE CartDetails SET quantity = @quantity WHERE cart_id = @cart_id AND product_id = @product_id');

        res.json({ message: 'Cart quantity updated successfully' });
    } catch (err) {
        console.error('Error updating cart quantity:', err);
        res.status(500).json({ message: 'Error updating cart quantity' });
    }
});

// Endpoint để lấy danh sách đơn hàng và thông tin người dùng
app.get('/orders', async (req, res) => {
    try {
        const pool = await getDbConnection();

        // Lấy tất cả đơn hàng
        const ordersResult = await pool.request().query(`
            SELECT o.order_id, o.user_id, o.order_date, o.total_amount, o.status,
                   u.username, u.email, u.full_name, u.phone, u.address
            FROM Orders o
            JOIN Users u ON o.user_id = u.user_id
        `);

        res.json(ordersResult.recordset);
    } catch (err) {
        console.error('Error fetching orders:', err);
        res.status(500).json({ message: 'Error fetching orders' });
    }
});

// Endpoint để lấy đơn hàng của người dùng
app.get('/myorders', async (req, res) => {
    const token = req.headers['auth-token'];

    if (!token) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
        const decoded = jwt.verify(token, 'your_jwt_secret');
        const user_id = decoded.userId;

        const pool = await getDbConnection();
        const result = await pool.request()
            .input('user_id', sql.Int, user_id)
            .query('SELECT * FROM Orders WHERE user_id = @user_id ORDER BY order_date DESC');

        res.json(result.recordset);
    } catch (err) {
        console.error('Error fetching orders:', err);
        res.status(500).json({ message: 'Error fetching orders' });
    }
});

  
  // Endpoint để cập nhật trạng thái đơn hàng và xử lý sản phẩm đã bán
app.put('/updateOrderStatus', async (req, res) => {
    const { order_id, status } = req.body;

    if (!order_id || !status) {
        return res.status(400).json({ message: 'Order ID and status are required' });
    }

    try {
        const pool = await getDbConnection();
        const transaction = new sql.Transaction(pool);

        await transaction.begin();

        // Lấy thông tin chi tiết đơn hàng
        const orderDetailsResult = await transaction.request()
            .input('order_id', sql.Int, order_id)
            .query('SELECT * FROM OrderDetails WHERE order_id = @order_id');

        if (orderDetailsResult.recordset.length === 0) {
            await transaction.rollback();
            return res.status(404).json({ message: 'Order not found' });
        }

        // Cập nhật trạng thái đơn hàng
        await transaction.request()
            .input('order_id', sql.Int, order_id)
            .input('status', sql.VarChar, status)
            .query('UPDATE Orders SET status = @status WHERE order_id = @order_id');

        if (status === 'Shipping') {
            // Xử lý thông tin sản phẩm đã bán
            for (const detail of orderDetailsResult.recordset) {
                await transaction.request()
                    .input('order_id', sql.Int, order_id)
                    .input('product_id', sql.Int, detail.product_id)
                    .input('quantity', sql.Int, detail.quantity)
                    .input('price', sql.Decimal, detail.price)
                    .query('INSERT INTO SoldProducts (order_id, product_id, quantity, price) VALUES (@order_id, @product_id, @quantity, @price)');

                // Cập nhật số lượng sản phẩm trong bảng Products
                await transaction.request()
                    .input('product_id', sql.Int, detail.product_id)
                    .input('quantity', sql.Int, detail.quantity)
                    .query('UPDATE Products SET quantity = quantity - @quantity WHERE product_id = @product_id');
            }
        }

        await transaction.commit();
        res.status(200).json({ message: 'Order status updated successfully' });
    } catch (err) {
        console.error('Error updating order status:', err);
        await transaction.rollback();
        res.status(500).json({ message: 'Error updating order status' });
    }
});


// Endpoint để thống kê doanh số bán hàng
app.get('/sales-stats', async (req, res) => {
    try {
        const { type } = req.query;
        const pool = await getDbConnection();

        let query;
        if (type === 'orders') {
            query = `
                SELECT 
                    MONTH(o.order_date) AS month,
                    COUNT(*) AS total_orders
                FROM Orders o
                WHERE o.status = 'Received'
                GROUP BY MONTH(o.order_date)
                ORDER BY MONTH(o.order_date)
            `;
        } else {
            query = `
                SELECT 
                    p.product_name,
                    SUM(sp.quantity) AS total_quantity_sold,
                    SUM(sp.quantity * sp.price) AS total_revenue
                FROM SoldProducts sp
                JOIN Products p ON sp.product_id = p.product_id
                GROUP BY p.product_name
            `;
        }

        const result = await pool.request().query(query);
        res.json(result.recordset);  // Trả về danh sách các bản ghi
    } catch (err) {
        console.error('Error generating sales report:', err);
        res.status(500).json({ message: 'Error generating sales report' });
    }
});



// Endpoint để tìm kiếm sản phẩm
app.get('/search', async (req, res) => {
    const { query } = req.query;

    if (!query) {
        return res.status(400).json({ message: 'Query parameter is required' });
    }

    console.log('Search query:', query); // Log the query to debug
    try {
        const pool = await getDbConnection();
        const result = await pool.request()
            .input('query', sql.VarChar, `%${query}%`) // Đảm bảo kiểu dữ liệu khớp với cơ sở dữ liệu
            .query('SELECT * FROM Products WHERE product_name LIKE @query'); // Truy vấn chính xác

        console.log('Search results:', result.recordset); // Log the results to debug
        res.json(result.recordset);
    } catch (err) {
        console.error('Error searching products:', err);
        res.status(500).json({ message: 'Error searching products' });
    }
});

app.get('/order/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const pool = await getDbConnection();

        // Lấy thông tin đơn hàng
        const orderResult = await pool.request()
            .input('order_id', sql.Int, id)
            .query('SELECT * FROM Orders WHERE order_id = @order_id');

        if (orderResult.recordset.length === 0) {
            return res.status(404).json({ message: 'Order not found' });
        }

        const order = orderResult.recordset[0];

        // Lấy chi tiết sản phẩm trong đơn hàng
        const orderDetailsResult = await pool.request()
            .input('order_id', sql.Int, id)
            .query(`SELECT od.product_id, od.quantity, od.price, p.product_name 
                    FROM OrderDetails od 
                    JOIN Products p ON od.product_id = p.product_id 
                    WHERE od.order_id = @order_id`);

        const orderDetails = orderDetailsResult.recordset;

        // Lấy thông tin người dùng
        const userResult = await pool.request()
            .input('user_id', sql.Int, order.user_id)
            .query('SELECT * FROM Users WHERE user_id = @user_id');

        const user = userResult.recordset[0];

        // Nếu đơn hàng có khuyến mãi, tính toán số tiền cuối cùng
        let finalAmount = order.total_amount;
        if (order.promo_id) {
            const promoResult = await pool.request()
                .input('promo_id', sql.Int, order.promo_id)
                .query('SELECT discount_amount FROM Promotions WHERE promo_id = @promo_id AND is_active = 1');
            
            if (promoResult.recordset.length > 0) {
                const discount = promoResult.recordset[0].discount_amount;
                finalAmount = Math.max(0, order.total_amount - discount);
            }
        }

        const response = {
            order_id: order.order_id,
            order_date: order.order_date,
            total_amount: order.total_amount,
            final_amount: finalAmount, // Thêm final_amount vào phản hồi
            status: order.status,
            user: {
                user_id: user.user_id,
                username: user.username,
                email: user.email,
                full_name: user.full_name,
                phone: user.phone,
                address: user.address,
            },
            order_details: orderDetails.map(detail => ({
                product_id: detail.product_id,
                product_name: detail.product_name,
                quantity: detail.quantity,
                price: detail.price,
            })),
        };

        res.json(response);
    } catch (err) {
        console.error('Error fetching order details:', err);
        res.status(500).json({ message: 'Error fetching order details' });
    }
});


// Endpoint để lấy sản phẩm phổ biến
app.get('/popularin', async (req, res) => {
    try {
        const pool = await getDbConnection();
        const result = await pool.request()
            .query(`
                SELECT TOP 4 
                       p.product_id, p.product_name, p.price, p.image_url, 
                       COALESCE(SUM(sp.quantity), 0) AS total_sold, 
                       p.quantity - COALESCE(SUM(sp.quantity), 0) AS quantity_remaining
                FROM Products p
                LEFT JOIN SoldProducts sp ON p.product_id = sp.product_id
                GROUP BY p.product_id, p.product_name, p.price, p.image_url, p.quantity
                ORDER BY total_sold DESC
            `);

        res.json(result.recordset);
    } catch (err) {
        console.error('Error fetching popular products:', err);
        res.status(500).json({ message: 'Error fetching popular products' });
    }
});

// Endpoint để cập nhật sản phẩm
app.put('/updateproduct/:id', async (req, res) => {
    const productId = parseInt(req.params.id, 10);
    const { product_name, category_id, price, quantity, is_fresh } = req.body;

    if (!product_name || !price || !quantity || is_fresh === undefined) {
        return res.status(400).json({ message: 'Missing required fields' });
    }

    try {
        const pool = await getDbConnection();
        await pool.request()
            .input('product_id', sql.Int, productId)
            .input('product_name', sql.VarChar, product_name)
            .input('category_id', sql.Int, category_id)
            .input('price', sql.Decimal, price)
            .input('quantity', sql.Int, quantity)
            .input('is_fresh', sql.Bit, is_fresh)
            .query(`
                UPDATE Products 
                SET 
                    product_name = @product_name, 
                    category_id = @category_id, 
                    price = @price, 
                    quantity = @quantity, 
                    is_fresh = @is_fresh
                WHERE 
                    product_id = @product_id
            `);

        res.status(200).json({ message: 'Product updated successfully' });
    } catch (err) {
        console.error('Error updating product:', err);
        res.status(500).json({ message: 'Error updating product' });
    }
});

// Endpoint để lấy tất cả người dùng
app.get('/users', async (req, res) => {
    try {
        const pool = await getDbConnection();
        const result = await pool.request()
            .query('SELECT user_id, username, email, full_name, phone, address, role, created_at, updated_at FROM Users');

        res.json(result.recordset);
    } catch (err) {
        console.error('Error fetching users:', err);
        res.status(500).json({ message: 'Error fetching users' });
    }
});

app.post('/apply-promo', async (req, res) => {
    const { promo_code } = req.body;
    const token = req.headers['auth-token'];

    if (!promo_code) {
        return res.status(400).json({ message: 'Promo code is required' });
    }

    if (!token) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
        const decoded = jwt.verify(token, 'your_jwt_secret');
        const user_id = decoded.userId;

        const pool = await getDbConnection();

        // Kiểm tra mã khuyến mãi có hợp lệ và còn hiệu lực không
        const promoResult = await pool.request()
            .input('promo_code', sql.NVarChar, promo_code)
            .query('SELECT promo_id, discount_amount FROM Promotions WHERE promo_code = @promo_code AND is_active = 1');

        if (promoResult.recordset.length === 0) {
            return res.status(400).json({ message: 'Invalid or inactive promo code' });
        }

        const promo = promoResult.recordset[0];
        const promo_id = promo.promo_id;

        // Kiểm tra mã khuyến mãi đã được sử dụng bởi người dùng này chưa
        const usedPromoResult = await pool.request()
            .input('promo_id', sql.Int, promo_id)
            .input('user_id', sql.Int, user_id)
            .query('SELECT * FROM UsedPromotions WHERE promo_id = @promo_id AND user_id = @user_id');

        if (usedPromoResult.recordset.length > 0) {
            return res.status(400).json({ message: 'Promo code already used by this user' });
        }

        // Lưu thông tin mã khuyến mãi đã được sử dụng
        await pool.request()
            .input('promo_id', sql.Int, promo_id)
            .input('user_id', sql.Int, user_id)
            .query('INSERT INTO UsedPromotions (promo_id, user_id) VALUES (@promo_id, @user_id)');

        res.json({ promo_id: promo.promo_id, discount_amount: promo.discount_amount });
    } catch (err) {
        console.error('Error applying promo code:', err);
        res.status(500).json({ message: 'Error applying promo code' });
    }
});



// Lấy tất cả mã khuyến mãi
app.get('/admin/promotions', async (req, res) => {
    try {
        const pool = await getDbConnection();
        const result = await pool.request()
            .query('SELECT * FROM Promotions');
        res.json(result.recordset);
    } catch (err) {
        console.error('Error fetching promotions:', err);
        res.status(500).json({ message: 'Error fetching promotions' });
    }
});

// Thêm mã khuyến mãi
app.post('/admin/promotions', async (req, res) => {
    const { promo_code, discount_amount } = req.body;

    if (!promo_code || discount_amount === undefined) {
        return res.status(400).json({ message: 'Promo code and discount amount are required' });
    }

    try {
        const pool = await getDbConnection();
        await pool.request()
            .input('promo_code', sql.NVarChar, promo_code)
            .input('discount_amount', sql.Decimal(10, 2), discount_amount)
            .query('INSERT INTO Promotions (promo_code, discount_amount) VALUES (@promo_code, @discount_amount)');
        res.status(201).json({ message: 'Promo code added successfully' });
    } catch (err) {
        console.error('Error adding promo code:', err);
        res.status(500).json({ message: 'Error adding promo code' });
    }
});

// Xóa mã khuyến mãi
app.delete('/admin/promotions/:promo_id', async (req, res) => {
    const { promo_id } = req.params;

    try {
        const pool = await getDbConnection();
        await pool.request()
            .input('promo_id', sql.Int, promo_id)
            .query('DELETE FROM Promotions WHERE promo_id = @promo_id');
        res.json({ message: 'Promo code deleted successfully' });
    } catch (err) {
        console.error('Error deleting promo code:', err);
        res.status(500).json({ message: 'Error deleting promo code' });
    }
});

app.get('/unused-promos', async (req, res) => {
    const token = req.headers['auth-token'];

    if (!token) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
        const decoded = jwt.verify(token, 'your_jwt_secret');
        const user_id = decoded.userId;

        const pool = await getDbConnection();

        const unusedPromosResult = await pool.request()
            .input('user_id', sql.Int, user_id)
            .query(`
                SELECT p.promo_id, p.promo_code, p.discount_amount
                FROM Promotions p
                LEFT JOIN UsedPromotions up ON p.promo_id = up.promo_id AND up.user_id = @user_id
                WHERE p.is_active = 1 AND up.promo_id IS NULL
            `);

        res.json(unusedPromosResult.recordset);
    } catch (err) {
        console.error('Error fetching unused promos:', err);
        res.status(500).json({ message: 'Error fetching unused promos' });
    }
});

app.get('/used-promos', async (req, res) => {
    const token = req.headers['auth-token'];

    if (!token) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
        const decoded = jwt.verify(token, 'your_jwt_secret');
        const user_id = decoded.userId;

        const pool = await getDbConnection();

        // Lấy các mã khuyến mãi đã được sử dụng bởi người dùng này
        const usedPromosResult = await pool.request()
            .input('user_id', sql.Int, user_id)
            .query(`
                SELECT p.promo_id, p.promo_code, p.discount_amount
                FROM Promotions p
                JOIN UsedPromotions up ON p.promo_id = up.promo_id
                WHERE up.user_id = @user_id
            `);

        res.json(usedPromosResult.recordset);
    } catch (err) {
        console.error('Error fetching used promos:', err);
        res.status(500).json({ message: 'Error fetching used promos' });
    }
});

app.put('/order/:order_id/confirm', async (req, res) => {
    const token = req.headers['auth-token'];
    const { order_id } = req.params;

    if (!token) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
        const decoded = jwt.verify(token, 'your_jwt_secret');
        const user_id = decoded.userId;

        const pool = await getDbConnection();
        const result = await pool.request()
            .input('order_id', sql.Int, order_id)
            .input('user_id', sql.Int, user_id)
            .query(`
                UPDATE Orders 
                SET status = 'Received' 
                WHERE order_id = @order_id AND user_id = @user_id
            `);

        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({ message: 'Order not found or you are not authorized to update this order' });
        }

        res.json({ message: 'Order status updated to Received' });
    } catch (err) {
        console.error('Error updating order status:', err);
        res.status(500).json({ message: 'Error updating order status' });
    }
});

const port = 4000;
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
